import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { intervaloDoMes, mesAtualEmSaoPaulo, mesValido } from '@/lib/datas'
import { exigirAdultoOuResponsavel, type UsuarioAutenticado } from '@/servicos/autenticacao'

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

  const grupos = await prisma.lancamento.groupBy({
    by: ['tipo', 'categoriaId'],
    where: { data: { gte: de, lt: ate } },
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
  }
}
