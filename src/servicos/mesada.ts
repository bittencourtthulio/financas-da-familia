import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { entradaInvalida, naoEncontrado } from '@/lib/erros'
import { lerValorEmReais } from '@/lib/dinheiro'
import { dataCivilValida } from '@/lib/datas'
import { exigirAdmin, exigirFilho, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { registrarAtividade } from '@/servicos/atividade'
import type { PrismaClient } from '@/gerado/prisma/client'

/**
 * Mesada dos filhos (FT-06): créditos e gastos de cada filho, em centavos
 * inteiros (PR-02), com data civil no fuso da família (PR-26). O saldo do filho
 * é a soma dos créditos menos a soma dos gastos, feita pelo banco (`groupBy`)
 * sobre inteiros e nunca no cliente nem em ponto flutuante (PR-32); pode ser
 * negativo e o sistema não bloqueia o gasto.
 *
 * Só o responsável (`admin`) registra, edita, apaga e lê os movimentos de
 * qualquer filho (PR-33); a verificação é a primeira linha de cada função. O
 * filho lê o próprio extrato por `meuExtrato`, que não recebe id: o registro
 * vem do usuário da sessão, então o filho A nunca alcança o filho B (PR-06).
 * Cada gravação leva o rastro da trilha (PR-10) na mesma transação, com o tipo,
 * o filho e o nome dele, nunca o valor, o saldo nem a descrição (PR-25).
 */

export const TIPOS_DE_MOVIMENTO = ['credito', 'gasto'] as const
export type TipoDeMovimento = (typeof TIPOS_DE_MOVIMENTO)[number]

export const POR_PAGINA_DE_MOVIMENTOS = 30

const DESCRICAO_MAXIMA = 200

// O valor chega como o responsável digitou, em reais, e sai em centavos
// inteiros (PR-02), lido por `src/lib/dinheiro.ts`, sem ponto flutuante.
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

const entradaDeMovimento = z.object(
  {
    tipo: z.enum(TIPOS_DE_MOVIMENTO, { message: 'Escolha crédito ou gasto.' }),
    valor: valorEmReais,
    data: z
      .string({ message: 'Informe a data.' })
      .refine(dataCivilValida, 'Data inválida. Use um dia existente entre 2000 e 2100.'),
    descricao: z
      .string()
      .trim()
      .max(DESCRICAO_MAXIMA, `A descrição tem no máximo ${DESCRICAO_MAXIMA} caracteres.`)
      .nullish()
      .transform((d) => d ?? ''),
  },
  { message: 'Dados do movimento inválidos.' },
)

function validarMovimento(entrada: unknown) {
  const dados = entradaDeMovimento.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Movimento inválido.')
  }
  return dados.data
}

export interface MovimentoListado {
  id: string
  filhoId: string
  tipo: string
  valorCentavos: number
  data: string
  descricao: string
  criadoEm: Date
  atualizadoEm: Date
}

/** Qualquer cliente que tenha a tabela: o `prisma` ou o de uma transação. */
type ClienteDeMesada = Pick<PrismaClient, 'movimentoDeMesada'>

interface Totais {
  creditosCentavos: number
  gastosCentavos: number
  saldoCentavos: number
}

/** Créditos, gastos e saldo de um filho: soma de inteiros feita pelo banco. */
async function totaisDoFilho(cliente: ClienteDeMesada, filhoId: string): Promise<Totais> {
  const grupos = await cliente.movimentoDeMesada.groupBy({
    by: ['tipo'],
    where: { filhoId },
    _sum: { valorCentavos: true },
  })
  let creditosCentavos = 0
  let gastosCentavos = 0
  for (const g of grupos) {
    const soma = g._sum.valorCentavos ?? 0
    if (g.tipo === 'credito') creditosCentavos += soma
    else if (g.tipo === 'gasto') gastosCentavos += soma
  }
  return { creditosCentavos, gastosCentavos, saldoCentavos: creditosCentavos - gastosCentavos }
}

export interface ResultadoDoMovimento {
  movimento: MovimentoListado
  /** O saldo do filho depois da gravação; negativo é permitido (PR-32). */
  saldoCentavos: number
}

export async function registrarMovimento(
  autor: UsuarioAutenticado,
  filhoId: string,
  entrada: unknown,
): Promise<ResultadoDoMovimento> {
  exigirAdmin(autor)

  const dados = validarMovimento(entrada)
  const filho = await prisma.filho.findUnique({ where: { id: filhoId } })
  if (!filho) throw naoEncontrado('Filho não encontrado.')

  // O movimento e o rastro nascem juntos (PR-10). O detalhe leva o tipo, o
  // filho e o nome dele; o valor nunca vai para a trilha (PR-25).
  return prisma.$transaction(async (tx) => {
    const movimento = await tx.movimentoDeMesada.create({
      data: {
        filhoId: filho.id,
        tipo: dados.tipo,
        valorCentavos: dados.valor,
        data: dados.data,
        descricao: dados.descricao,
      },
    })
    await registrarAtividade(
      {
        ator: autor,
        acao: 'mesada.registrada',
        entidade: 'mesada',
        entidadeId: movimento.id,
        detalhe: { alvoNome: filho.nome, filhoId: filho.id, tipo: movimento.tipo },
      },
      tx,
    )
    const { saldoCentavos } = await totaisDoFilho(tx, filho.id)
    return { movimento, saldoCentavos }
  })
}

export async function editarMovimento(
  autor: UsuarioAutenticado,
  id: string,
  entrada: unknown,
): Promise<ResultadoDoMovimento> {
  exigirAdmin(autor)

  const dados = validarMovimento(entrada)
  const atual = await prisma.movimentoDeMesada.findUnique({
    where: { id },
    include: { filho: { select: { nome: true } } },
  })
  if (!atual) throw naoEncontrado('Movimento não encontrado.')

  const mudou =
    atual.tipo !== dados.tipo ||
    atual.valorCentavos !== dados.valor ||
    atual.data !== dados.data ||
    atual.descricao !== dados.descricao

  // Reenviar o que já está gravado não é mudança: não grava nem deixa rastro
  // (o formulário sempre reenvia todos os campos). O filho não muda nunca.
  if (!mudou) {
    const { filho: _filho, ...movimento } = atual
    const { saldoCentavos } = await totaisDoFilho(prisma, atual.filhoId)
    return { movimento, saldoCentavos }
  }

  return prisma.$transaction(async (tx) => {
    const movimento = await tx.movimentoDeMesada.update({
      where: { id },
      data: { tipo: dados.tipo, valorCentavos: dados.valor, data: dados.data, descricao: dados.descricao },
    })
    await registrarAtividade(
      {
        ator: autor,
        acao: 'mesada.alterada',
        entidade: 'mesada',
        entidadeId: id,
        detalhe: { alvoNome: atual.filho.nome, filhoId: atual.filhoId, tipo: movimento.tipo },
      },
      tx,
    )
    const { saldoCentavos } = await totaisDoFilho(tx, atual.filhoId)
    return { movimento, saldoCentavos }
  })
}

/**
 * Apaga de verdade (PR-33): a linha some do banco. O rastro guarda quem apagou,
 * o id, o tipo e o filho, nunca o valor (PR-25). Devolve o filho e o saldo novo.
 */
export async function apagarMovimento(
  autor: UsuarioAutenticado,
  id: string,
): Promise<{ filhoId: string; saldoCentavos: number }> {
  exigirAdmin(autor)

  return prisma.$transaction(async (tx) => {
    const existente = await tx.movimentoDeMesada.findUnique({
      where: { id },
      include: { filho: { select: { nome: true } } },
    })
    if (!existente) throw naoEncontrado('Movimento não encontrado.')

    await tx.movimentoDeMesada.delete({ where: { id } })
    await registrarAtividade(
      {
        ator: autor,
        acao: 'mesada.apagada',
        entidade: 'mesada',
        entidadeId: id,
        detalhe: { alvoNome: existente.filho.nome, filhoId: existente.filhoId, tipo: existente.tipo },
      },
      tx,
    )
    const { saldoCentavos } = await totaisDoFilho(tx, existente.filhoId)
    return { filhoId: existente.filhoId, saldoCentavos }
  })
}

export interface MovimentoComFilho extends MovimentoListado {
  filhoNome: string
}

export async function obterMovimento(
  autor: UsuarioAutenticado,
  id: string,
): Promise<MovimentoComFilho> {
  exigirAdmin(autor)
  const linha = await prisma.movimentoDeMesada.findUnique({
    where: { id },
    include: { filho: { select: { nome: true } } },
  })
  if (!linha) throw naoEncontrado('Movimento não encontrado.')
  const { filho, ...movimento } = linha
  return { ...movimento, filhoNome: filho.nome }
}

export interface ExtratoDeMesada extends Totais {
  filho: { id: string; nome: string; mesadaCentavos: number; periodicidade: string }
  /** Do dia mais recente para o mais antigo. */
  itens: MovimentoListado[]
  total: number
  pagina: number
  paginas: number
}

/** O extrato de um filho: totais pelo banco e uma página de movimentos. */
async function montarExtrato(
  filho: ExtratoDeMesada['filho'],
  pedida: unknown,
): Promise<ExtratoDeMesada> {
  const totais = await totaisDoFilho(prisma, filho.id)
  const total = await prisma.movimentoDeMesada.count({ where: { filhoId: filho.id } })
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA_DE_MOVIMENTOS))
  const numero = typeof pedida === 'number' && Number.isInteger(pedida) ? pedida : 1
  const pagina = Math.min(Math.max(1, numero), paginas)

  const itens = await prisma.movimentoDeMesada.findMany({
    where: { filhoId: filho.id },
    orderBy: [{ data: 'desc' }, { criadoEm: 'desc' }, { id: 'desc' }],
    skip: (pagina - 1) * POR_PAGINA_DE_MOVIMENTOS,
    take: POR_PAGINA_DE_MOVIMENTOS,
  })
  return { filho, ...totais, itens, total, pagina, paginas }
}

const dadosDoFilho = { id: true, nome: true, mesadaCentavos: true, periodicidade: true } as const

/** O extrato e o saldo de qualquer filho, para o responsável. */
export async function extratoDoFilho(
  autor: UsuarioAutenticado,
  filhoId: string,
  opcoes: { pagina?: number } = {},
): Promise<ExtratoDeMesada> {
  exigirAdmin(autor)
  const filho = await prisma.filho.findUnique({ where: { id: filhoId }, select: dadosDoFilho })
  if (!filho) throw naoEncontrado('Filho não encontrado.')
  return montarExtrato(filho, opcoes.pagina)
}

/** O saldo de cada filho, por id, para a lista do responsável. */
export async function saldosDosFilhos(autor: UsuarioAutenticado): Promise<Record<string, number>> {
  exigirAdmin(autor)
  const filhos = await prisma.filho.findMany({ select: { id: true } })
  const grupos = await prisma.movimentoDeMesada.groupBy({
    by: ['filhoId', 'tipo'],
    _sum: { valorCentavos: true },
  })
  const saldos: Record<string, number> = Object.fromEntries(filhos.map((f) => [f.id, 0]))
  for (const g of grupos) {
    const soma = g._sum.valorCentavos ?? 0
    if (!(g.filhoId in saldos)) continue
    if (g.tipo === 'credito') saldos[g.filhoId] = (saldos[g.filhoId] ?? 0) + soma
    else if (g.tipo === 'gasto') saldos[g.filhoId] = (saldos[g.filhoId] ?? 0) - soma
  }
  return saldos
}

/**
 * O extrato e o saldo do filho da sessão (PR-06). Não recebe id: o registro é o
 * ligado ao usuário que pergunta, então um filho nunca alcança o do irmão. Só o
 * papel `filho` chega aqui, e só para ler.
 */
export async function meuExtrato(
  autor: UsuarioAutenticado,
  opcoes: { pagina?: number } = {},
): Promise<ExtratoDeMesada> {
  exigirFilho(autor)
  const filho = await prisma.filho.findUnique({ where: { usuarioId: autor.id }, select: dadosDoFilho })
  if (!filho) throw naoEncontrado('Mesada não encontrada.')
  return montarExtrato(filho, opcoes.pagina)
}
