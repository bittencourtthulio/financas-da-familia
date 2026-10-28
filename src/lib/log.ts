// Log estruturado (PR-14): uma linha JSON por evento com nível, instante,
// evento e contexto. Nunca grava segredo, hash, e-mail nem valor monetário
// (mesma lista de chaves da trilha, PR-25) e nunca derruba quem o chamou.

import { CHAVE_PROIBIDA, VALOR_PROIBIDO } from '@/lib/chaves-proibidas'
import { gravarLinha, pastaDeLog } from '@/lib/log-arquivo'

export type NivelDoLog = 'info' | 'aviso' | 'erro'
export type DestinoDoLog = (linha: string) => void

export const REMOVIDO = '[removido]'

const TAMANHO_MAXIMO_DO_TEXTO = 200
const PROFUNDIDADE_MAXIMA = 4
const FORMATO_DO_EVENTO = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/
const TEM_EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/
const TEM_HASH = /\$2[abxy]\$\d\d\$/

function redigirTexto(texto: string): string {
  if (VALOR_PROIBIDO.test(texto) || TEM_HASH.test(texto) || TEM_EMAIL.test(texto)) return REMOVIDO
  return texto.length > TAMANHO_MAXIMO_DO_TEXTO ? `${texto.slice(0, TAMANHO_MAXIMO_DO_TEXTO)}…` : texto
}

function redigirValor(valor: unknown, fundo: number): unknown {
  if (valor === null || typeof valor === 'number' || typeof valor === 'boolean') return valor
  if (typeof valor === 'string') return redigirTexto(valor)
  // Erro vira só o nome: a mensagem pode trazer e-mail ou valor, e a pilha é rastro.
  if (valor instanceof Error) return valor.name
  if (valor instanceof Date) return valor.toISOString()
  if (fundo >= PROFUNDIDADE_MAXIMA) return '[profundo]'
  if (Array.isArray(valor)) return valor.map((item) => redigirValor(item, fundo + 1))
  if (typeof valor === 'object') return redigirObjeto(valor as Record<string, unknown>, fundo + 1)
  return undefined
}

function redigirObjeto(contexto: Record<string, unknown>, fundo: number): Record<string, unknown> {
  const saida: Record<string, unknown> = {}
  for (const [chave, valor] of Object.entries(contexto)) {
    if (valor === undefined) continue
    saida[chave] = CHAVE_PROIBIDA.test(chave) ? REMOVIDO : redigirValor(valor, fundo)
  }
  return saida
}

/** O contexto sem nada que não se registra: chave proibida, hash, JWT, e-mail. */
export function redigir(contexto: Record<string, unknown> = {}): Record<string, unknown> {
  return redigirObjeto(contexto, 0)
}

/** A linha JSON (sem quebra de linha) de um evento. Lança se o nome do evento for inválido. */
export function montarLinha(
  nivel: NivelDoLog,
  evento: string,
  contexto: Record<string, unknown> | undefined,
  agora: Date = new Date(),
): string {
  if (!FORMATO_DO_EVENTO.test(evento)) {
    throw new Error(`Nome de evento de log inválido: "${evento}". Use minúsculas separadas por ponto.`)
  }
  return JSON.stringify({
    nivel,
    instante: agora.toISOString(),
    evento,
    contexto: redigir(contexto),
  })
}

let destinoDefinido: DestinoDoLog | null = null

/** Troca o destino das linhas (testes, ou o arquivo do dia). `null` volta ao padrão. */
export function definirDestinoDoLog(destino: DestinoDoLog | null): void {
  destinoDefinido = destino
}

function destinoPadrao(linha: string, instante: Date): void {
  // Nos testes o log não sai no terminal, a não ser que o teste capture.
  if (process.env.NODE_ENV !== 'test') process.stdout.write(`${linha}\n`)
  const pasta = pastaDeLog()
  if (!pasta) return
  try {
    gravarLinha(pasta, linha, instante)
  } catch {
    // Disco cheio ou sem permissão: o terminal ainda tem a linha.
  }
}

/** Registra um evento. Nunca lança: o log não pode derrubar a requisição. */
export function registrar(
  nivel: NivelDoLog,
  evento: string,
  contexto?: Record<string, unknown>,
  agora: Date = new Date(),
): void {
  try {
    const linha = montarLinha(nivel, evento, contexto, agora)
    if (destinoDefinido) destinoDefinido(linha)
    else destinoPadrao(linha, agora)
  } catch {
    // Sem lugar melhor para avisar: engolir é o contrato.
  }
}

export const log = {
  info: (evento: string, contexto?: Record<string, unknown>) => registrar('info', evento, contexto),
  aviso: (evento: string, contexto?: Record<string, unknown>) => registrar('aviso', evento, contexto),
  erro: (evento: string, contexto?: Record<string, unknown>) => registrar('erro', evento, contexto),
}
