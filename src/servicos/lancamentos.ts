import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { conflito, entradaInvalida, naoEncontrado } from '@/lib/erros'
import { lerValorEmReais } from '@/lib/dinheiro'
import { dataCivilValida } from '@/lib/datas'
import {
  exigirAdultoOuResponsavel,
  type UsuarioAutenticado,
} from '@/servicos/autenticacao'
import { registrarAtividade } from '@/servicos/atividade'

/**
 * Lançamentos da casa (FT-03): receitas e despesas com valor em centavos
 * inteiros (PR-02), data civil no fuso da família (PR-26) e categoria do
 * mesmo tipo (PR-27). Só o responsável (`admin`) e o adulto (`usuario`)
 * chegam aqui, e a verificação é a primeira linha de cada função, por lista
 * de permitidos. Cada criação, edição e exclusão grava o registro da trilha
 * (PR-10) na mesma transação, com ids e tipo e nunca o valor (PR-25).
 */

export const TIPOS = ['receita', 'despesa'] as const
export type TipoDeLancamento = (typeof TIPOS)[number]

const NOME_MAXIMO_DA_CATEGORIA = 40

const tipoValido = z.enum(TIPOS, { message: 'Escolha receita ou despesa.' })

const entradaDeCategoria = z.object(
  {
    nome: z
      .string({ message: 'Informe o nome da categoria.' })
      .trim()
      .min(1, 'Informe o nome da categoria.')
      .max(
        NOME_MAXIMO_DA_CATEGORIA,
        `O nome da categoria tem no máximo ${NOME_MAXIMO_DA_CATEGORIA} caracteres.`,
      ),
    tipo: tipoValido,
  },
  { message: 'Dados da categoria inválidos.' },
)

export interface CategoriaListada {
  id: string
  nome: string
  tipo: string
  criadoEm: Date
}

const comparar = (a: string, b: string) =>
  a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })

const semCaixa = (texto: string) => texto.toLocaleLowerCase('pt-BR')

/** As categorias, por nome; `tipo` filtra só receitas ou só despesas. */
export async function listarCategorias(
  autor: UsuarioAutenticado,
  opcoes: { tipo?: TipoDeLancamento } = {},
): Promise<CategoriaListada[]> {
  exigirAdultoOuResponsavel(autor)
  const categorias = await prisma.categoria.findMany({
    where: opcoes.tipo ? { tipo: opcoes.tipo } : {},
  })
  return categorias.sort((a, b) => comparar(a.nome, b.nome))
}

export async function criarCategoria(
  autor: UsuarioAutenticado,
  entrada: unknown,
): Promise<CategoriaListada> {
  exigirAdultoOuResponsavel(autor)

  const dados = entradaDeCategoria.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Categoria inválida.')
  }
  const { nome, tipo } = dados.data

  // O nome é único dentro do tipo sem diferenciar maiúscula (PR-27); o
  // índice do banco só pega o nome idêntico.
  const doTipo = await prisma.categoria.findMany({ where: { tipo } })
  if (doTipo.some((c) => semCaixa(c.nome) === semCaixa(nome))) {
    throw conflito('Já existe uma categoria com este nome.')
  }

  return prisma.$transaction(async (tx) => {
    const criada = await tx.categoria.create({ data: { nome, tipo } })
    await registrarAtividade(
      {
        ator: autor,
        acao: 'categoria.criada',
        entidade: 'categoria',
        entidadeId: criada.id,
        detalhe: { alvoNome: criada.nome, tipo: criada.tipo },
      },
      tx,
    )
    return criada
  })
}

const DESCRICAO_MAXIMA = 200

// O valor chega como o usuário digitou, em reais, e sai em centavos inteiros
// (PR-02). A leitura é de `src/lib/dinheiro.ts`, sem ponto flutuante.
const valorEmReais = z
  .string({ message: 'Informe o valor.' })
  .transform((texto, ctx) => {
    const centavos = lerValorEmReais(texto)
    if (centavos === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Valor inválido. Use o formato 1.234,56, de R$ 0,01 até R$ 1.000.000,00.',
      })
      return z.NEVER
    }
    return centavos
  })

const entradaDeLancamento = z.object(
  {
    tipo: tipoValido,
    valor: valorEmReais,
    data: z
      .string({ message: 'Informe a data.' })
      .refine(dataCivilValida, 'Data inválida. Use um dia existente entre 2000 e 2100.'),
    categoriaId: z.string({ message: 'Escolha a categoria.' }).min(1, 'Escolha a categoria.'),
    descricao: z
      .string()
      .trim()
      .max(DESCRICAO_MAXIMA, `A descrição tem no máximo ${DESCRICAO_MAXIMA} caracteres.`)
      .nullish()
      .transform((d) => d ?? ''),
  },
  { message: 'Dados do lançamento inválidos.' },
)

type DadosDoLancamento = z.infer<typeof entradaDeLancamento>

export interface LancamentoListado {
  id: string
  tipo: string
  valorCentavos: number
  data: string
  descricao: string
  categoriaId: string
  categoria: { id: string; nome: string; tipo: string }
  criadoEm: Date
  atualizadoEm: Date
}

const incluirCategoria = {
  categoria: { select: { id: true, nome: true, tipo: true } },
} as const

function validarLancamento(entrada: unknown): DadosDoLancamento {
  const dados = entradaDeLancamento.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Lançamento inválido.')
  }
  return dados.data
}

/** A categoria existe e é do mesmo tipo do lançamento (PR-27). */
async function exigirCategoriaDoTipo(
  categoriaId: string,
  tipo: TipoDeLancamento,
): Promise<void> {
  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } })
  if (!categoria) throw entradaInvalida('A categoria escolhida não existe.')
  if (categoria.tipo !== tipo) {
    throw entradaInvalida(
      `A categoria "${categoria.nome}" não é de ${tipo === 'receita' ? 'receita' : 'despesa'}.`,
    )
  }
}

export async function criarLancamento(
  autor: UsuarioAutenticado,
  entrada: unknown,
): Promise<LancamentoListado> {
  exigirAdultoOuResponsavel(autor)

  const dados = validarLancamento(entrada)
  await exigirCategoriaDoTipo(dados.categoriaId, dados.tipo)

  // O lançamento e o rastro nascem juntos (PR-10). O detalhe leva o tipo e a
  // categoria; o valor nunca vai para a trilha (PR-25).
  return prisma.$transaction(async (tx) => {
    const criado = await tx.lancamento.create({
      data: {
        tipo: dados.tipo,
        valorCentavos: dados.valor,
        data: dados.data,
        descricao: dados.descricao,
        categoriaId: dados.categoriaId,
      },
      include: incluirCategoria,
    })
    await registrarAtividade(
      {
        ator: autor,
        acao: 'lancamento.criado',
        entidade: 'lancamento',
        entidadeId: criado.id,
        detalhe: { tipo: criado.tipo, categoriaId: criado.categoriaId },
      },
      tx,
    )
    return criado
  })
}

export async function obterLancamento(
  autor: UsuarioAutenticado,
  id: string,
): Promise<LancamentoListado> {
  exigirAdultoOuResponsavel(autor)
  const lancamento = await prisma.lancamento.findUnique({
    where: { id },
    include: incluirCategoria,
  })
  if (!lancamento) throw naoEncontrado('Lançamento não encontrado.')
  return lancamento
}
