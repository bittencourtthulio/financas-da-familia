import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { entradaInvalida } from '@/lib/erros'
import { exigirAdmin, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { ACOES } from '@/lib/atividade'
import type { PrismaClient } from '@/gerado/prisma/client'

/**
 * Trilha de atividade (PR-10): quem fez o quê e quando.
 *
 * `registrarAtividade` é o ponto único de escrita. As features que auditam
 * (usuários hoje; lançamentos e mesada depois) chamam esta função, de
 * preferência com o cliente da própria transação, para que a ação e o rastro
 * nasçam juntos ou não nasçam. O módulo não oferece editar nem apagar
 * registro: o histórico fica enquanto a conta da família existir (PR-11).
 *
 * O `detalhe` é pequeno e plano e nunca recebe senha, hash, token, segredo,
 * valor ou saldo, e-mail nem CPF (PR-10, PR-25).
 */

/** Qualquer cliente que tenha a tabela: o `prisma` ou o de uma transação. */
export type ClienteDeAtividade = Pick<PrismaClient, 'atividade'>

export interface QuemAgiu {
  id: string
  nome: string
}

export interface EntradaDeAtividade {
  ator: QuemAgiu
  acao: string
  entidade: string
  entidadeId: string
  detalhe?: Record<string, string | number | boolean | null>
}

// Substrings (sem diferenciar maiúscula) que não podem aparecer no nome de
// uma chave do detalhe. Conservador de propósito: é melhor recusar uma chave
// inocente do que gravar um segredo.
const CHAVE_PROIBIDA =
  /senha|password|hash|token|jwt|segredo|secret|valor|centavo|saldo|e-?mail|cpf/i

// Texto que tem cara de hash bcrypt ou de JWT.
const VALOR_PROIBIDO = /^\$2[abxy]?\$|^eyJ[\w-]+\.[\w-]+\./

const TAMANHO_MAXIMO_DO_DETALHE = 1000

const detalheValido = z
  .record(
    z.string().regex(/^[A-Za-z][A-Za-z0-9]*$/, 'Chave do detalhe inválida.'),
    z.union([
      z.string().max(200, 'Texto do detalhe grande demais.'),
      z.number(),
      z.boolean(),
      z.null(),
    ]),
  )
  .superRefine((detalhe, ctx) => {
    for (const [chave, valor] of Object.entries(detalhe)) {
      if (CHAVE_PROIBIDA.test(chave)) {
        ctx.addIssue({ code: 'custom', message: `O detalhe não pode guardar "${chave}".` })
      }
      if (typeof valor === 'string' && VALOR_PROIBIDO.test(valor)) {
        ctx.addIssue({ code: 'custom', message: 'O detalhe não pode guardar hash nem token.' })
      }
    }
    if (JSON.stringify(detalhe).length > TAMANHO_MAXIMO_DO_DETALHE) {
      ctx.addIssue({ code: 'custom', message: 'Detalhe grande demais.' })
    }
  })

const entradaDeAtividade = z.object({
  ator: z.object({
    id: z.string().min(1, 'Informe quem agiu.'),
    nome: z.string().min(1, 'Informe quem agiu.'),
  }),
  acao: z.string().refine((a) => a in ACOES, 'Ação fora do catálogo da trilha.'),
  entidade: z.string().min(1, 'Informe a entidade.'),
  entidadeId: z.string().min(1, 'Informe o id da entidade.'),
  detalhe: detalheValido.optional(),
})

export async function registrarAtividade(
  entrada: EntradaDeAtividade,
  cliente: ClienteDeAtividade = prisma,
): Promise<void> {
  const dados = entradaDeAtividade.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Registro de atividade inválido.')
  }
  const { ator, acao, entidade, entidadeId, detalhe } = dados.data

  await cliente.atividade.create({
    data: {
      atorId: ator.id,
      atorNome: ator.nome,
      acao,
      entidade,
      entidadeId,
      detalhe: detalhe ? JSON.stringify(detalhe) : null,
    },
  })
}

export const POR_PAGINA = 50

export interface AtividadeListada {
  id: string
  atorId: string
  atorNome: string
  acao: string
  entidade: string
  entidadeId: string
  detalhe: Record<string, string | number | boolean | null>
  criadoEm: Date
}

export interface PaginaDeAtividades {
  itens: AtividadeListada[]
  total: number
  pagina: number
  paginas: number
}

function lerDetalhe(texto: string | null): AtividadeListada['detalhe'] {
  if (!texto) return {}
  try {
    const lido: unknown = JSON.parse(texto)
    if (lido && typeof lido === 'object' && !Array.isArray(lido)) {
      return lido as AtividadeListada['detalhe']
    }
  } catch {
    // detalhe corrompido não derruba a tela: o registro continua visível
  }
  return {}
}

/**
 * Só o responsável lê a trilha (D-06); a verificação é aqui, no servidor.
 * Do mais recente para o mais antigo, `POR_PAGINA` por página.
 */
export async function listarAtividade(
  autor: UsuarioAutenticado,
  opcoes: { pagina?: number } = {},
): Promise<PaginaDeAtividades> {
  exigirAdmin(autor)

  const total = await prisma.atividade.count()
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))
  const pedida = Number.isInteger(opcoes.pagina) ? (opcoes.pagina as number) : 1
  const pagina = Math.min(Math.max(1, pedida), paginas)

  const linhas = await prisma.atividade.findMany({
    orderBy: [{ criadoEm: 'desc' }, { id: 'desc' }],
    skip: (pagina - 1) * POR_PAGINA,
    take: POR_PAGINA,
  })

  return {
    itens: linhas.map((l) => ({ ...l, detalhe: lerDetalhe(l.detalhe) })),
    total,
    pagina,
    paginas,
  }
}
