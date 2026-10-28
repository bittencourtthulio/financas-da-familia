// Arquivo de log por dia e descarte por retenção (PR-11): o log de aplicação
// vale 90 dias. O dia do arquivo é o dia UTC do evento; o descarte olha o dia
// do NOME do arquivo, não a data de modificação (que muda ao copiar).

import { appendFileSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs'
import path from 'node:path'

export const RETENCAO_DIAS = 90

const DIA_EM_MS = 86_400_000
const NOME_DO_ARQUIVO = /^app-(\d{4})-(\d{2})-(\d{2})\.log$/

/** "app-2026-10-28.log": um arquivo por dia UTC. */
export function nomeDoArquivoDeLog(instante: Date): string {
  return `app-${instante.toISOString().slice(0, 10)}.log`
}

/**
 * Onde gravar. `LOG_DIR` manda (vazio desliga); sem ele, nos testes não se
 * grava e fora deles a pasta é `logs/` na raiz do projeto.
 */
export function pastaDeLog(env: Record<string, string | undefined> = process.env): string | null {
  if (env.LOG_DIR !== undefined) return env.LOG_DIR === '' ? null : env.LOG_DIR
  if (env.NODE_ENV === 'test') return null
  return path.resolve(process.cwd(), 'logs')
}

/** Acrescenta a linha ao arquivo do dia. Pode lançar; quem chama decide. */
export function gravarLinha(pasta: string, linha: string, instante: Date): void {
  mkdirSync(pasta, { recursive: true, mode: 0o700 })
  appendFileSync(path.join(pasta, nomeDoArquivoDeLog(instante)), `${linha}\n`, { mode: 0o600 })
}

function diaDoNome(nome: string): number | null {
  const m = NOME_DO_ARQUIVO.exec(nome)
  if (!m) return null
  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const t = Date.UTC(ano, mes - 1, dia)
  const d = new Date(t)
  // Data impossível (mês 13, dia 45) não é um arquivo de log: não se apaga.
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null
  return t
}

/**
 * Apaga os arquivos de log de mais de `dias` dias antes de `agora` e devolve
 * os nomes apagados. O dia que completa exatamente `dias` ainda é guardado.
 */
export function descartarLogsAntigos(
  pasta: string,
  agora: Date,
  dias: number = RETENCAO_DIAS,
): string[] {
  let nomes: string[]
  try {
    nomes = readdirSync(pasta)
  } catch {
    return []
  }
  const hoje = Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate())
  const limite = hoje - dias * DIA_EM_MS
  const apagados: string[] = []
  for (const nome of nomes) {
    const dia = diaDoNome(nome)
    if (dia === null || dia >= limite) continue
    const caminho = path.join(pasta, nome)
    if (!statSync(caminho).isFile()) continue
    unlinkSync(caminho)
    apagados.push(nome)
  }
  return apagados
}
