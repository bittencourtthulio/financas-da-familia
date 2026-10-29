import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { conflito, entradaInvalida, naoEncontrado } from '@/lib/erros'
import { lerValorEmReais } from '@/lib/dinheiro'
import {
  dataCivilValida,
  dataDaRecorrencia,
  intervaloDoMes,
  mesAnterior,
  mesAtualEmSaoPaulo,
  mesDaData,
  mesValido,
} from '@/lib/datas'
import {
  exigirAdultoOuResponsavel,
  type UsuarioAutenticado,
} from '@/servicos/autenticacao'
import { registrarAtividade } from '@/servicos/atividade'
import { familiaDe } from '@/servicos/avatares'
import { garantirRecorrencias } from '@/servicos/recorrencias'

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

/**
 * A categoria com este nome e tipo, criada na hora se ainda não existir. É o
 * que o campo de categoria do lançamento usa: escrever um nome novo cadastra.
 * A comparação ignora maiúscula, como em `criarCategoria` (PR-27).
 */
export async function obterOuCriarCategoria(
  autor: UsuarioAutenticado,
  entrada: unknown,
): Promise<CategoriaListada> {
  exigirAdultoOuResponsavel(autor)
  const dados = entradaDeCategoria.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Categoria inválida.')
  }
  const { nome, tipo } = dados.data
  const doTipo = await prisma.categoria.findMany({ where: { tipo } })
  const existente = doTipo.find((c) => semCaixa(c.nome) === semCaixa(nome))
  return existente ?? criarCategoria(autor, { nome, tipo })
}

/**
 * Apaga uma categoria que nenhum lançamento usa. Com lançamentos, recusa e
 * diz quantos: apagar levaria os lançamentos junto (o banco também restringe).
 */
export async function apagarCategoria(autor: UsuarioAutenticado, id: string): Promise<void> {
  exigirAdultoOuResponsavel(autor)

  await prisma.$transaction(async (tx) => {
    const categoria = await tx.categoria.findUnique({ where: { id } })
    if (!categoria) throw naoEncontrado('Categoria não encontrada.')
    const emUso =
      (await tx.lancamento.count({ where: { categoriaId: id } })) +
      (await tx.recorrencia.count({ where: { categoriaId: id } }))
    if (emUso > 0) {
      throw conflito(
        `A categoria "${categoria.nome}" tem ${emUso} ${emUso === 1 ? 'lançamento' : 'lançamentos'}. Mude a categoria deles antes de apagar.`,
      )
    }
    await tx.categoria.delete({ where: { id } })
    await registrarAtividade(
      {
        ator: autor,
        acao: 'categoria.apagada',
        entidade: 'categoria',
        entidadeId: id,
        detalhe: { alvoNome: categoria.nome, tipo: categoria.tipo },
      },
      tx,
    )
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
    // Quem da família fez o gasto; vazio é "ninguém em especial".
    pessoaId: z
      .string()
      .trim()
      .nullish()
      .transform((p) => (p ? p : null)),
    // Pago ou recebido: "sim" ou "nao". Sem a informação, vale pago (como o que já existia).
    pago: z
      .string()
      .nullish()
      .transform((p) => p !== 'nao'),
    // Marcado, o lançamento se repete todo mês no mesmo dia.
    repete: z
      .union([z.string(), z.boolean()])
      .nullish()
      .transform((r) => r === true || r === 'on' || r === 'sim'),
    // Ao editar um lançamento recorrente: só este mês ou este e os próximos.
    escopo: z
      .string()
      .nullish()
      .transform((e) => (e === 'proximos' ? ('proximos' as const) : ('este' as const))),
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
  pessoaId: string | null
  /** Pago (despesa) ou recebido (receita). */
  pago: boolean
  /** A recorrência a que este mês pertence, se houver. */
  recorrenciaId: string | null
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

/** A pessoa, se houver, é alguém da família (adulto ou filho). */
async function exigirPessoaDaFamilia(autor: UsuarioAutenticado, pessoaId: string | null): Promise<void> {
  if (!pessoaId) return
  const familia = await familiaDe(autor)
  if (!familia.some((m) => m.id === pessoaId)) {
    throw entradaInvalida('A pessoa escolhida não é da família.')
  }
}

type Transacao = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

/** O dia do mês de uma data civil "AAAA-MM-DD". */
const diaDaData = (data: string) => Number(data.slice(8, 10))

/**
 * Cria a recorrência que tem este lançamento como primeiro mês e liga os dois.
 * Os meses seguintes nascem depois, sob demanda (`garantirRecorrencias`).
 */
async function iniciarRecorrencia(
  tx: Transacao,
  lancamento: { id: string; tipo: string; valorCentavos: number; data: string; descricao: string; categoriaId: string; pessoaId: string | null },
): Promise<string> {
  const mes = mesDaData(lancamento.data)
  const recorrencia = await tx.recorrencia.create({
    data: {
      tipo: lancamento.tipo,
      valorCentavos: lancamento.valorCentavos,
      diaDoMes: diaDaData(lancamento.data),
      descricao: lancamento.descricao,
      categoriaId: lancamento.categoriaId,
      pessoaId: lancamento.pessoaId,
      inicio: mes,
      geradoAte: mes,
    },
  })
  await tx.lancamento.update({ where: { id: lancamento.id }, data: { recorrenciaId: recorrencia.id } })
  return recorrencia.id
}

export async function criarLancamento(
  autor: UsuarioAutenticado,
  entrada: unknown,
): Promise<LancamentoListado> {
  exigirAdultoOuResponsavel(autor)

  const dados = validarLancamento(entrada)
  await exigirCategoriaDoTipo(dados.categoriaId, dados.tipo)
  await exigirPessoaDaFamilia(autor, dados.pessoaId)

  // O lançamento e o rastro nascem juntos (PR-10). O detalhe leva o tipo e a
  // categoria; o valor nunca vai para a trilha (PR-25).
  const criado = await prisma.$transaction(async (tx) => {
    const novo = await tx.lancamento.create({
      data: {
        tipo: dados.tipo,
        valorCentavos: dados.valor,
        data: dados.data,
        descricao: dados.descricao,
        categoriaId: dados.categoriaId,
        pessoaId: dados.pessoaId,
        pago: dados.pago,
      },
    })
    if (dados.repete) await iniciarRecorrencia(tx, novo)
    await registrarAtividade(
      {
        ator: autor,
        acao: 'lancamento.criado',
        entidade: 'lancamento',
        entidadeId: novo.id,
        detalhe: { tipo: novo.tipo, categoriaId: novo.categoriaId, ...(dados.repete && { recorrente: true }) },
      },
      tx,
    )
    return tx.lancamento.findUniqueOrThrow({ where: { id: novo.id }, include: incluirCategoria })
  })

  // Uma recorrência que começa no passado já tem os meses até hoje.
  if (dados.repete) await garantirRecorrencias(mesAtualEmSaoPaulo())
  return criado
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

export async function editarLancamento(
  autor: UsuarioAutenticado,
  id: string,
  entrada: unknown,
): Promise<LancamentoListado> {
  exigirAdultoOuResponsavel(autor)

  const dados = validarLancamento(entrada)
  const atual = await prisma.lancamento.findUnique({ where: { id } })
  if (!atual) throw naoEncontrado('Lançamento não encontrado.')
  await exigirCategoriaDoTipo(dados.categoriaId, dados.tipo)
  await exigirPessoaDaFamilia(autor, dados.pessoaId)

  // Cada mês de uma recorrência existe uma vez: não dá para empurrar este
  // para um mês em que a recorrência já tem o seu.
  if (atual.recorrenciaId && mesDaData(dados.data) !== mesDaData(atual.data)) {
    const { de, ate } = intervaloDoMes(mesDaData(dados.data))
    const jaTem = await prisma.lancamento.count({
      where: { recorrenciaId: atual.recorrenciaId, id: { not: id }, data: { gte: de, lt: ate } },
    })
    if (jaTem > 0) throw conflito('Esse mês já tem este lançamento recorrente. Escolha outra data.')
  }

  // "Este e os próximos" só faz sentido num mês de recorrência.
  const nosProximos = dados.escopo === 'proximos' && atual.recorrenciaId !== null
  const viraRecorrente = dados.repete && atual.recorrenciaId === null

  const mudou =
    atual.tipo !== dados.tipo ||
    atual.valorCentavos !== dados.valor ||
    atual.data !== dados.data ||
    atual.descricao !== dados.descricao ||
    atual.categoriaId !== dados.categoriaId ||
    atual.pessoaId !== dados.pessoaId ||
    atual.pago !== dados.pago ||
    viraRecorrente

  // Reenviar o que já está gravado não é mudança: não grava nada nem deixa
  // rastro (o formulário sempre reenvia todos os campos).
  if (!mudou) {
    return prisma.lancamento.findUniqueOrThrow({ where: { id }, include: incluirCategoria })
  }

  let atualizado
  try {
    atualizado = await prisma.$transaction(async (tx) => {
    const depois = await tx.lancamento.update({
      where: { id },
      data: {
        tipo: dados.tipo,
        valorCentavos: dados.valor,
        data: dados.data,
        descricao: dados.descricao,
        categoriaId: dados.categoriaId,
        pessoaId: dados.pessoaId,
        pago: dados.pago,
      },
    })
    if (viraRecorrente) await iniciarRecorrencia(tx, depois)

    // Os próximos meses recebem o que mudou, menos a situação (pago ou não é
    // de cada mês) e a data exata: o dia novo vale, o mês de cada um fica.
    if (nosProximos && atual.recorrenciaId) {
      const dia = diaDaData(dados.data)
      const seguintes = await tx.lancamento.findMany({
        where: { recorrenciaId: atual.recorrenciaId, data: { gt: atual.data } },
      })
      for (const seguinte of seguintes) {
        await tx.lancamento.update({
          where: { id: seguinte.id },
          data: {
            tipo: dados.tipo,
            valorCentavos: dados.valor,
            descricao: dados.descricao,
            categoriaId: dados.categoriaId,
            pessoaId: dados.pessoaId,
            data: dataDaRecorrencia(mesDaData(seguinte.data), dia),
          },
        })
      }
      await tx.recorrencia.update({
        where: { id: atual.recorrenciaId },
        data: {
          tipo: dados.tipo,
          valorCentavos: dados.valor,
          descricao: dados.descricao,
          categoriaId: dados.categoriaId,
          pessoaId: dados.pessoaId,
          diaDoMes: dia,
        },
      })
    }

    await registrarAtividade(
      {
        ator: autor,
        acao: 'lancamento.alterado',
        entidade: 'lancamento',
        entidadeId: id,
        detalhe: {
          tipo: depois.tipo,
          categoriaId: depois.categoriaId,
          ...(nosProximos && { escopo: 'proximos' }),
        },
      },
      tx,
    )
    return tx.lancamento.findUniqueOrThrow({ where: { id }, include: incluirCategoria })
  })
  } catch (erro) {
    // Mover um mês da recorrência para um mês que já tem o seu.
    if (typeof erro === 'object' && erro !== null && (erro as { code?: unknown }).code === 'P2002') {
      throw conflito('Esse mês já tem este lançamento recorrente. Escolha outra data.')
    }
    throw erro
  }

  if (viraRecorrente) await garantirRecorrencias(mesAtualEmSaoPaulo())
  return atualizado
}

/**
 * Marca o lançamento como pago (ou recebido), ou volta para em aberto. Mexe só
 * neste mês, mesmo que ele seja de uma recorrência.
 */
export async function alternarPago(autor: UsuarioAutenticado, id: string): Promise<LancamentoListado> {
  exigirAdultoOuResponsavel(autor)

  return prisma.$transaction(async (tx) => {
    const atual = await tx.lancamento.findUnique({ where: { id } })
    if (!atual) throw naoEncontrado('Lançamento não encontrado.')
    const atualizado = await tx.lancamento.update({
      where: { id },
      data: { pago: !atual.pago },
      include: incluirCategoria,
    })
    await registrarAtividade(
      {
        ator: autor,
        acao: 'lancamento.alterado',
        entidade: 'lancamento',
        entidadeId: id,
        detalhe: { tipo: atual.tipo, categoriaId: atual.categoriaId, pago: atualizado.pago },
      },
      tx,
    )
    return atualizado
  })
}

/**
 * Apaga de verdade (PR-28): a linha some do banco. O rastro guarda quem
 * apagou, o id, o tipo e a categoria, nunca o valor (PR-25). Num mês de
 * recorrência, `proximos` apaga este e todos os seguintes e encerra a
 * recorrência no mês anterior (sem meses antes, ela some); o padrão apaga só
 * este mês, e o mês apagado não volta.
 */
export async function apagarLancamento(
  autor: UsuarioAutenticado,
  id: string,
  escopo: 'este' | 'proximos' = 'este',
): Promise<void> {
  exigirAdultoOuResponsavel(autor)

  await prisma.$transaction(async (tx) => {
    const existente = await tx.lancamento.findUnique({ where: { id } })
    if (!existente) throw naoEncontrado('Lançamento não encontrado.')

    const recorrenciaId = existente.recorrenciaId
    let apagados = 1
    if (escopo === 'proximos' && recorrenciaId) {
      apagados = (
        await tx.lancamento.deleteMany({ where: { recorrenciaId, data: { gte: existente.data } } })
      ).count
      const restantes = await tx.lancamento.count({ where: { recorrenciaId } })
      if (restantes === 0) {
        await tx.recorrencia.delete({ where: { id: recorrenciaId } })
      } else {
        await tx.recorrencia.update({
          where: { id: recorrenciaId },
          data: { fim: mesAnterior(mesDaData(existente.data)) },
        })
      }
    } else {
      await tx.lancamento.delete({ where: { id } })
    }

    await registrarAtividade(
      {
        ator: autor,
        acao: 'lancamento.apagado',
        entidade: 'lancamento',
        entidadeId: id,
        detalhe: {
          tipo: existente.tipo,
          categoriaId: existente.categoriaId,
          ...(apagados > 1 && { escopo: 'proximos', quantidade: apagados }),
        },
      },
      tx,
    )
  })
}

export const POR_PAGINA_DE_LANCAMENTOS = 50

export interface PaginaDeLancamentos {
  itens: LancamentoListado[]
  total: number
  pagina: number
  paginas: number
  /** O mês listado, "AAAA-MM". */
  mes: string
  /** O filtro de tipo, ou `null` para receitas e despesas juntas. */
  tipo: TipoDeLancamento | null
}

const ehTipo = (valor: unknown): valor is TipoDeLancamento =>
  (TIPOS as readonly unknown[]).includes(valor)

/**
 * Os lançamentos de um mês, do dia mais recente para o mais antigo, 50 por
 * página. Sem mês (ou com mês inválido) lista o mês corrente em São Paulo; o
 * relógio é injetável. Sem somas: saldo e resumo são da FT-04.
 */
export async function listarLancamentos(
  autor: UsuarioAutenticado,
  opcoes: { mes?: string; tipo?: string; pagina?: number } = {},
  agora: Date = new Date(),
): Promise<PaginaDeLancamentos> {
  exigirAdultoOuResponsavel(autor)

  const mes = mesValido(opcoes.mes) ? opcoes.mes : mesAtualEmSaoPaulo(agora)
  const tipo = ehTipo(opcoes.tipo) ? opcoes.tipo : null
  const { de, ate } = intervaloDoMes(mes)
  await garantirRecorrencias(mes, agora)
  const where = { data: { gte: de, lt: ate }, ...(tipo && { tipo }) }

  const total = await prisma.lancamento.count({ where })
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA_DE_LANCAMENTOS))
  const pedida = Number.isInteger(opcoes.pagina) ? (opcoes.pagina as number) : 1
  const pagina = Math.min(Math.max(1, pedida), paginas)

  const itens = await prisma.lancamento.findMany({
    where,
    include: incluirCategoria,
    orderBy: [{ data: 'desc' }, { criadoEm: 'desc' }, { id: 'desc' }],
    skip: (pagina - 1) * POR_PAGINA_DE_LANCAMENTOS,
    take: POR_PAGINA_DE_LANCAMENTOS,
  })

  return { itens, total, pagina, paginas, mes, tipo }
}
