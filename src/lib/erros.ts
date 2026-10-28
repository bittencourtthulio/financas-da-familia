// Erro de aplicação: carrega o status HTTP e uma mensagem segura para o
// usuário. Rastro de pilha nunca chega à interface (L17).

import { randomUUID } from 'node:crypto'
import { log } from '@/lib/log'

export class ErroDeAplicacao extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly codigo: string,
  ) {
    super(message)
    this.name = 'ErroDeAplicacao'
  }
}

export const naoAutenticado = (msg = 'Sessão inválida ou expirada.') =>
  new ErroDeAplicacao(msg, 401, 'nao_autenticado')

export const naoAutorizado = (msg = 'Você não tem acesso a este recurso.') =>
  new ErroDeAplicacao(msg, 403, 'nao_autorizado')

export const naoEncontrado = (msg = 'Recurso não encontrado.') =>
  new ErroDeAplicacao(msg, 404, 'nao_encontrado')

export const entradaInvalida = (msg: string) =>
  new ErroDeAplicacao(msg, 422, 'entrada_invalida')

export const limiteExcedido = (
  msg = 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
) => new ErroDeAplicacao(msg, 429, 'muitas_tentativas')

export const conflito = (msg: string) =>
  new ErroDeAplicacao(msg, 409, 'conflito')

export const MENSAGEM_GENERICA = 'Não foi possível concluir. Tente de novo.'

/**
 * A mensagem que o usuário pode ver (PR-14, L17). Erro de aplicação carrega
 * mensagem própria. Qualquer outro vira a frase genérica mais um código de
 * correlação, e o log recebe o MESMO código com o nome e o código do erro:
 * nunca a mensagem (pode trazer e-mail ou valor) nem a pilha.
 */
export function mensagemSegura(erro: unknown): string {
  if (erro instanceof ErroDeAplicacao) return erro.message
  return `${MENSAGEM_GENERICA} Código: ${registrarErroInesperado(erro)}`
}

/** Grava o erro inesperado no log (nome, código, ref) e devolve a ref de correlação. */
export function registrarErroInesperado(erro: unknown): string {
  const ref = randomUUID().replace(/-/g, '').slice(0, 12)
  const codigo = (erro as { code?: unknown } | null)?.code
  log.erro('erro.inesperado', {
    ref,
    nome: erro instanceof Error ? erro.name : typeof erro,
    codigo: typeof codigo === 'string' ? codigo : null,
  })
  return ref
}
