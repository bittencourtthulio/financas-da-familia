// Backup do banco SQLite (PR-13, PR-37). `VACUUM INTO` grava uma cópia
// consistente e compacta num arquivo novo, mesmo com o sistema em uso: copiar
// o arquivo com `cp` poderia pegar o banco no meio de uma escrita.
//
// O backup leva tudo, inclusive os hashes de senha. Por isso a pasta é só do
// dono (0700), o arquivo também (0600) e a pasta fica fora do git.

import Database from 'better-sqlite3'
import { chmodSync, existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs'
import path from 'node:path'

/** Erro com mensagem pronta para o operador, em português, sem pilha. */
export class ErroDeBackup extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ErroDeBackup'
  }
}

/** Onde os backups ficam, a partir da raiz do projeto, se `BACKUP_DIR` não disser outra. */
export const PASTA_DE_BACKUP_PADRAO = 'backups'

/** O arquivo SQLite que a URL `file:` do ambiente aponta. */
export function caminhoDoBanco(url: string | undefined, base: string = process.cwd()): string {
  if (!url || !url.startsWith('file:')) {
    throw new ErroDeBackup('DATABASE_URL ausente ou inválida: informe o arquivo SQLite, por exemplo file:./dev.db.')
  }
  const bruto = url.slice('file:'.length).split('?')[0] as string
  return path.isAbsolute(bruto) ? bruto : path.resolve(base, bruto)
}

/** "2026-10-28-120405": o instante no horário de São Paulo, na ordem que ordena por nome. */
export function carimboDeSaoPaulo(agora: Date): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(agora)
  const p = (tipo: string) => partes.find((x) => x.type === tipo)?.value ?? '00'
  return `${p('year')}-${p('month')}-${p('day')}-${p('hour')}${p('minute')}${p('second')}`
}

/** "backup-2026-10-28-120405.db". */
export function nomeDoBackup(agora: Date): string {
  return `backup-${carimboDeSaoPaulo(agora)}.db`
}

/** Um nome que ainda não existe na pasta: acrescenta -2, -3... antes da extensão. */
export function caminhoLivre(pasta: string, nome: string): string {
  const { name, ext } = path.parse(nome)
  let candidato = path.join(pasta, nome)
  for (let n = 2; existsSync(candidato); n += 1) candidato = path.join(pasta, `${name}-${n}${ext}`)
  return candidato
}

export function prepararPasta(pasta: string): void {
  mkdirSync(pasta, { recursive: true, mode: 0o700 })
}

/** `VACUUM INTO` de `origem` para `destino`, aberto só para leitura. Lança se falhar. */
export function copiarConsistente(origem: string, destino: string): void {
  const db = new Database(origem, { readonly: true, fileMustExist: true })
  try {
    db.prepare('VACUUM INTO ?').run(destino)
  } finally {
    db.close()
  }
  chmodSync(destino, 0o600)
}

export interface ResultadoDoBackup {
  caminho: string
  tamanho: number
}

/**
 * Gera o backup do banco na pasta, com nome datado, sem sobrescrever nenhum
 * arquivo. Se algo falhar no meio, nenhum arquivo parcial fica para trás.
 */
export function gerarBackup(opcoes: { banco: string; pasta: string; agora?: Date }): ResultadoDoBackup {
  const { banco, pasta, agora = new Date() } = opcoes
  if (!existsSync(banco) || !statSync(banco).isFile()) {
    throw new ErroDeBackup(`Banco não encontrado: ${banco}.`)
  }
  prepararPasta(pasta)
  const destino = caminhoLivre(pasta, nomeDoBackup(agora))
  try {
    copiarConsistente(banco, destino)
    const conferido = new Database(destino, { readonly: true })
    try {
      if (conferido.pragma('integrity_check', { simple: true }) !== 'ok') {
        throw new ErroDeBackup('O backup gerado não passou na conferência de integridade.')
      }
    } finally {
      conferido.close()
    }
  } catch (erro) {
    if (existsSync(destino)) unlinkSync(destino)
    if (erro instanceof ErroDeBackup) throw erro
    throw new ErroDeBackup(
      `Não foi possível gerar o backup: ${erro instanceof Error ? erro.message : 'erro desconhecido'}.`,
    )
  }
  return { caminho: destino, tamanho: statSync(destino).size }
}
