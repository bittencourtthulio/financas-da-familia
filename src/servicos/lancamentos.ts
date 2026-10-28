import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { conflito, entradaInvalida } from '@/lib/erros'
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

const entradaDeCategoria = z.object({
  nome: z
    .string({ message: 'Informe o nome da categoria.' })
    .trim()
    .min(1, 'Informe o nome da categoria.')
    .max(NOME_MAXIMO_DA_CATEGORIA, `O nome da categoria tem no máximo ${NOME_MAXIMO_DA_CATEGORIA} caracteres.`),
  tipo: tipoValido,
})

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
