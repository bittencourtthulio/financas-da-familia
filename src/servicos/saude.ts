// Saúde do sistema (PR-14, L18): o sistema responde e o banco responde. Nada
// de dado do negócio: só uma consulta trivial, e a resposta não traz versão,
// caminho, usuário nem pilha.

import { log } from '@/lib/log'

export interface RespostaDeSaude {
  status: 'ok' | 'indisponivel'
  banco: 'ok' | 'falha'
}

export interface ResultadoDeSaude {
  http: 200 | 503
  corpo: RespostaDeSaude
}

export interface OpcoesDeSaude {
  /** A consulta que prova que o banco responde. Padrão: `SELECT 1` pelo Prisma. */
  sondar?: () => Promise<unknown>
  /** Quanto esperar pelo banco antes de dizer que ele não responde. */
  prazoMs?: number
}

const PRAZO_PADRAO_MS = 3000

async function sondarOBanco(): Promise<unknown> {
  // Importado aqui para que uma falha ao abrir o banco (arquivo ausente,
  // permissão) caia no try da verificação e vire 503, e não um erro 500 no
  // carregamento do módulo.
  const { prisma } = await import('@/lib/prisma')
  return prisma.$queryRaw`SELECT 1`
}

export async function verificarSaude(opcoes: OpcoesDeSaude = {}): Promise<ResultadoDeSaude> {
  const sondar = opcoes.sondar ?? sondarOBanco
  const prazoMs = opcoes.prazoMs ?? PRAZO_PADRAO_MS
  let relogio: ReturnType<typeof setTimeout> | undefined
  try {
    await Promise.race([
      sondar(),
      new Promise((_, rejeitar) => {
        relogio = setTimeout(() => rejeitar(new Error('prazo')), prazoMs)
      }),
    ])
    return { http: 200, corpo: { status: 'ok', banco: 'ok' } }
  } catch (erro) {
    // Só o nome do erro: a mensagem de banco traz caminho de arquivo.
    log.erro('saude.banco_indisponivel', { nome: erro instanceof Error ? erro.name : typeof erro })
    return { http: 503, corpo: { status: 'indisponivel', banco: 'falha' } }
  } finally {
    clearTimeout(relogio)
  }
}
