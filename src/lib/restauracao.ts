// Restauração do banco a partir de um backup (PR-13, PR-37). Três regras:
//  1. nada é tocado antes de o arquivo provar que é um SQLite íntegro com as
//     tabelas do sistema;
//  2. antes de trocar, o banco atual vira uma cópia datada na pasta de backups;
//  3. a troca é uma renomeação atômica de um arquivo já copiado ao lado.
// O sistema precisa estar parado: um servidor em execução segura o arquivo
// antigo aberto e continuaria a ler e escrever nele (D-04).

import Database from 'better-sqlite3'
import { chmodSync, closeSync, copyFileSync, existsSync, openSync, readSync, renameSync, statSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import {
  ErroDeBackup,
  caminhoLivre,
  carimboDeSaoPaulo,
  copiarConsistente,
  prepararPasta,
} from '@/lib/backup'

/** As tabelas de dado do sistema. Um teste confere esta lista contra o banco migrado. */
export const TABELAS_ESPERADAS = [
  'usuarios',
  'atividades',
  'categorias',
  'lancamentos',
  'recorrencias',
  'filhos',
  'movimentos_de_mesada',
] as const

const CABECALHO_SQLITE = 'SQLite format 3\0'

function lerCabecalho(arquivo: string): string {
  const fd = openSync(arquivo, 'r')
  try {
    const buffer = Buffer.alloc(16)
    const lidos = readSync(fd, buffer, 0, 16, 0)
    return buffer.subarray(0, lidos).toString('latin1')
  } finally {
    closeSync(fd)
  }
}

/**
 * Confere que o arquivo é um SQLite íntegro com todas as tabelas esperadas.
 * Lança `ErroDeBackup`, em português, no primeiro problema; não altera nada.
 */
export function validarBackup(arquivo: string): void {
  if (!existsSync(arquivo)) throw new ErroDeBackup(`Arquivo de backup não encontrado: ${arquivo}.`)
  if (!statSync(arquivo).isFile()) throw new ErroDeBackup(`O caminho informado não é um arquivo: ${arquivo}.`)
  if (lerCabecalho(arquivo) !== CABECALHO_SQLITE) {
    throw new ErroDeBackup(`O arquivo informado não é um banco SQLite: ${path.basename(arquivo)}.`)
  }
  let db: Database.Database
  try {
    db = new Database(arquivo, { readonly: true, fileMustExist: true })
  } catch {
    throw new ErroDeBackup('Não foi possível abrir o backup: o arquivo parece corrompido.')
  }
  try {
    let integridade: unknown
    let tabelas: string[]
    try {
      integridade = db.pragma('integrity_check', { simple: true })
      tabelas = (
        db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as Array<{ name: string }>
      ).map((l) => l.name)
    } catch {
      throw new ErroDeBackup('O backup não está íntegro: o arquivo parece corrompido ou incompleto.')
    }
    if (integridade !== 'ok') {
      throw new ErroDeBackup('O backup não está íntegro: o arquivo parece corrompido ou incompleto.')
    }
    const faltam = TABELAS_ESPERADAS.filter((t) => !tabelas.includes(t))
    if (faltam.length > 0) {
      throw new ErroDeBackup(
        `Este arquivo não é um backup deste sistema: faltam as tabelas ${faltam.join(', ')}.`,
      )
    }
  } finally {
    db.close()
  }
}

export interface ResultadoDaRestauracao {
  /** A cópia do banco que existia antes, ou `null` se não havia banco. */
  preservado: string | null
  restaurado: string
}

/**
 * Restaura `arquivo` por cima de `banco`. Valida primeiro; só então preserva
 * o banco atual em `pasta` e troca. Diante de qualquer problema na validação,
 * o banco atual e a pasta ficam exatamente como estavam.
 */
export function restaurarBackup(opcoes: {
  arquivo: string
  banco: string
  pasta: string
  agora?: Date
}): ResultadoDaRestauracao {
  const { arquivo, banco, pasta, agora = new Date() } = opcoes
  validarBackup(arquivo)
  if (path.resolve(arquivo) === path.resolve(banco)) {
    throw new ErroDeBackup('O arquivo informado é o próprio banco em uso: indique um arquivo de backup.')
  }

  let preservado: string | null = null
  if (existsSync(banco)) {
    prepararPasta(pasta)
    preservado = caminhoLivre(pasta, `antes-da-restauracao-${carimboDeSaoPaulo(agora)}.db`)
    try {
      copiarConsistente(banco, preservado)
    } catch {
      // Banco atual ilegível (justamente o caso de quem restaura): copia os bytes como estão.
      copyFileSync(banco, preservado)
      chmodSync(preservado, 0o600)
    }
  }

  const temporario = `${banco}.restaurando`
  try {
    copyFileSync(arquivo, temporario)
    chmodSync(temporario, 0o600)
    validarBackup(temporario)
    renameSync(temporario, banco)
  } catch (erro) {
    if (existsSync(temporario)) unlinkSync(temporario)
    if (erro instanceof ErroDeBackup) throw erro
    throw new ErroDeBackup(
      `Não foi possível restaurar: ${erro instanceof Error ? erro.message : 'erro desconhecido'}. O banco atual não foi alterado.`,
    )
  }
  for (const sufixo of ['-journal', '-wal', '-shm']) {
    if (existsSync(banco + sufixo)) unlinkSync(banco + sufixo)
  }
  return { preservado, restaurado: banco }
}
