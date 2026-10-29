import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { intervaloDoMes, mesAtualEmSaoPaulo, mesValido } from '@/lib/datas'
import { exigirAdultoOuResponsavel, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { garantirRecorrencias } from '@/servicos/recorrencias'
import { familiaDe } from '@/servicos/avatares'
import type { Avatar } from '@/lib/avatar'

/**
 * O resumo do mês (FT-04, PR-29): total de receitas, total de despesas, saldo
 * e despesas somadas por categoria. Tudo em centavos inteiros (PR-02): a soma
 * é feita pelo banco (`groupBy`) e o saldo é uma subtração de inteiros; nada
 * passa por ponto flutuante nem é somado no cliente. Conta só o mês escolhido,
 * do dia 1 ao último dia no calendário de São Paulo (PR-26); o saldo de um mês
 * não carrega o do anterior. Só o responsável (`admin`) e o adulto (`usuario`)
 * chegam aqui: a verificação é a primeira linha, por lista de permitidos.
 */

export interface CategoriaDoResumo {
  categoriaId: string
  nome: string
  totalCentavos: number
  quantidade: number
}

export interface PessoaDoResumo {
  /** Vazio quando o gasto não tem pessoa. */
  pessoaId: string | null
  nome: string
  /** Para desenhar o rostinho; sem pessoa ou sem avatar escolhido, nulo. */
  avatar: Avatar | null
  tipo: 'adulto' | 'crianca'
  totalCentavos: number
  quantidade: number
}

export interface ResumoDoMes {
  /** O mês resumido, "AAAA-MM". */
  mes: string
  receitasCentavos: number
  despesasCentavos: number
  /** Receitas menos despesas; negativo quando a despesa passa da receita. */
  saldoCentavos: number
  quantidadeDeLancamentos: number
  /** Só as categorias com despesa no mês, da maior soma para a menor. */
  despesasPorCategoria: CategoriaDoResumo[]
  /** Quem da família gastou, da maior soma para a menor. */
  despesasPorPessoa: PessoaDoResumo[]
}

// O mês chega da URL como texto qualquer. Valor ausente, repetido (lista),
// malformado ou fora de 2000 a 2100 não é erro: vira o mês corrente (D-04).
const mesDaConsulta = z.string().refine(mesValido)

function lerMes(consulta: unknown, agora: Date): string {
  const objeto =
    typeof consulta === 'object' && consulta !== null && !Array.isArray(consulta)
      ? (consulta as Record<string, unknown>)
      : {}
  const lido = mesDaConsulta.safeParse(objeto.mes)
  return lido.success ? lido.data : mesAtualEmSaoPaulo(agora)
}

const comparar = (a: string, b: string) =>
  a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })

/**
 * Receitas, despesas, saldo e despesas por categoria de um mês. `consulta.mes`
 * é "AAAA-MM"; sem ele, ou com valor inválido, vale o mês corrente em São
 * Paulo. O relógio é injetável.
 */
export async function resumoDoMes(
  autor: UsuarioAutenticado,
  consulta?: unknown,
  agora: Date = new Date(),
): Promise<ResumoDoMes> {
  exigirAdultoOuResponsavel(autor)

  const mes = lerMes(consulta, agora)
  const { de, ate } = intervaloDoMes(mes)
  await garantirRecorrencias(autor.familiaId, mes, agora)

  const grupos = await prisma.lancamento.groupBy({
    by: ['tipo', 'categoriaId'],
    where: { familiaId: autor.familiaId, data: { gte: de, lt: ate } },
    _sum: { valorCentavos: true },
    _count: { _all: true },
  })

  let receitasCentavos = 0
  let despesasCentavos = 0
  let quantidadeDeLancamentos = 0
  const despesas: Array<{ categoriaId: string; totalCentavos: number; quantidade: number }> = []

  for (const grupo of grupos) {
    const total = grupo._sum.valorCentavos ?? 0
    quantidadeDeLancamentos += grupo._count._all
    if (grupo.tipo === 'receita') {
      receitasCentavos += total
    } else if (grupo.tipo === 'despesa') {
      despesasCentavos += total
      despesas.push({
        categoriaId: grupo.categoriaId,
        totalCentavos: total,
        quantidade: grupo._count._all,
      })
    }
  }

  const categorias = await prisma.categoria.findMany({
    where: { id: { in: despesas.map((d) => d.categoriaId) } },
    select: { id: true, nome: true },
  })
  const nomes = new Map(categorias.map((c) => [c.id, c.nome]))

  const despesasPorCategoria = despesas
    .map((d) => ({ ...d, nome: nomes.get(d.categoriaId) ?? '' }))
    .sort((a, b) => b.totalCentavos - a.totalCentavos || comparar(a.nome, b.nome))
    .map(({ categoriaId, nome, totalCentavos, quantidade }) => ({
      categoriaId,
      nome,
      totalCentavos,
      quantidade,
    }))

  return {
    mes,
    receitasCentavos,
    despesasCentavos,
    saldoCentavos: receitasCentavos - despesasCentavos,
    quantidadeDeLancamentos,
    despesasPorCategoria,
    despesasPorPessoa: await despesasPorPessoaNoIntervalo(autor, de, ate),
  }
}

const SEM_PESSOA = 'Sem pessoa'

/** Despesas do intervalo somadas por pessoa, pelo banco; a soma é em centavos inteiros. */
async function despesasPorPessoaNoIntervalo(
  autor: UsuarioAutenticado,
  de: string,
  ate: string,
): Promise<PessoaDoResumo[]> {
  const grupos = await prisma.lancamento.groupBy({
    by: ['pessoaId'],
    where: { familiaId: autor.familiaId, tipo: 'despesa', data: { gte: de, lt: ate } },
    _sum: { valorCentavos: true },
    _count: { _all: true },
  })
  const familia = await familiaDe(autor)
  const membros = new Map(familia.map((m) => [m.id, m]))
  return grupos
    .map((g) => ({
      pessoaId: g.pessoaId,
      nome: g.pessoaId ? (membros.get(g.pessoaId)?.nome ?? 'Pessoa removida') : SEM_PESSOA,
      avatar: g.pessoaId ? (membros.get(g.pessoaId)?.avatar ?? null) : null,
      tipo: membros.get(g.pessoaId ?? '')?.tipo ?? ('adulto' as const),
      totalCentavos: g._sum.valorCentavos ?? 0,
      quantidade: g._count._all,
    }))
    .sort((a, b) => b.totalCentavos - a.totalCentavos || comparar(a.nome, b.nome))
}

export interface FinancasDoMes {
  mes: string
  /** A pessoa filtrada, se o filtro é de alguém da família; senão, nulo. */
  pessoa: { id: string; nome: string } | null
  /** Todas as pessoas da família, para o filtro. */
  pessoas: Array<{ id: string; nome: string }>
  /** Despesas do mês, já filtradas pela pessoa quando há filtro. */
  despesasCentavos: number
  quantidadeDeLancamentos: number
  despesasPorCategoria: CategoriaDoResumo[]
  /** Sempre a família toda: com filtro, mostra a pessoa entre as outras. */
  despesasPorPessoa: PessoaDoResumo[]
}

/**
 * Nossas Finanças (relatório): as despesas do mês por categoria e por pessoa
 * da família. `consulta.pessoa` filtra as categorias para uma pessoa; id que
 * não é da família é ignorado, como o mês inválido (D-04).
 */
export async function financasDoMes(
  autor: UsuarioAutenticado,
  consulta?: unknown,
  agora: Date = new Date(),
): Promise<FinancasDoMes> {
  exigirAdultoOuResponsavel(autor)

  const mes = lerMes(consulta, agora)
  const { de, ate } = intervaloDoMes(mes)
  await garantirRecorrencias(autor.familiaId, mes, agora)
  const objeto =
    typeof consulta === 'object' && consulta !== null && !Array.isArray(consulta)
      ? (consulta as Record<string, unknown>)
      : {}

  const familia = await familiaDe(autor)
  const pessoas = familia.map((m) => ({ id: m.id, nome: m.nome }))
  const pedida = typeof objeto.pessoa === 'string' ? objeto.pessoa : ''
  const pessoa = pessoas.find((p) => p.id === pedida) ?? null

  const grupos = await prisma.lancamento.groupBy({
    by: ['categoriaId'],
    where: {
      familiaId: autor.familiaId,
      tipo: 'despesa',
      data: { gte: de, lt: ate },
      ...(pessoa && { pessoaId: pessoa.id }),
    },
    _sum: { valorCentavos: true },
    _count: { _all: true },
  })
  const categorias = await prisma.categoria.findMany({
    where: { id: { in: grupos.map((g) => g.categoriaId) } },
    select: { id: true, nome: true },
  })
  const nomes = new Map(categorias.map((c) => [c.id, c.nome]))

  const despesasPorCategoria = grupos
    .map((g) => ({
      categoriaId: g.categoriaId,
      nome: nomes.get(g.categoriaId) ?? '',
      totalCentavos: g._sum.valorCentavos ?? 0,
      quantidade: g._count._all,
    }))
    .sort((a, b) => b.totalCentavos - a.totalCentavos || comparar(a.nome, b.nome))

  return {
    mes,
    pessoa,
    pessoas,
    despesasCentavos: despesasPorCategoria.reduce((soma, c) => soma + c.totalCentavos, 0),
    quantidadeDeLancamentos: despesasPorCategoria.reduce((soma, c) => soma + c.quantidade, 0),
    despesasPorCategoria,
    despesasPorPessoa: await despesasPorPessoaNoIntervalo(autor, de, ate),
  }
}
