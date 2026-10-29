import { prisma } from '@/lib/prisma'
import { dataDaRecorrencia, mesAtualEmSaoPaulo, mesSeguinte, somarMeses } from '@/lib/datas'

/**
 * Lançamentos recorrentes. Cada recorrência é o modelo de um lançamento que
 * entra todo mês; cada mês vira um `Lancamento` ligado a ela, em aberto (a
 * pessoa marca como pago quando pagar). Os meses são criados sob demanda,
 * quando uma tela pede um mês, e nunca além de um ano à frente de hoje, para
 * a lista não crescer sem fim. `geradoAte` guarda o último mês criado: é o que
 * impede de recriar um mês que a pessoa apagou.
 */

export const MESES_A_FRENTE = 12

const ehViolacaoDeUnico = (erro: unknown) =>
  typeof erro === 'object' && erro !== null && (erro as { code?: unknown }).code === 'P2002'

/**
 * Cria os meses que faltam das recorrências da família, até `ate` ("AAAA-MM", limitado a
 * um ano à frente de hoje e ao `fim` de cada recorrência). Duas telas pedindo
 * ao mesmo tempo não duplicam: o banco recusa o mês repetido e ele é pulado.
 */
export async function garantirRecorrencias(
  familiaId: string,
  ate: string,
  agora: Date = new Date(),
): Promise<void> {
  const teto = somarMeses(mesAtualEmSaoPaulo(agora), MESES_A_FRENTE)
  const limite = ate < teto ? ate : teto

  const pendentes = await prisma.recorrencia.findMany({ where: { familiaId, geradoAte: { lt: limite } } })
  for (const r of pendentes) {
    const alvo = r.fim !== null && r.fim < limite ? r.fim : limite
    if (r.geradoAte >= alvo) continue

    for (let mes = mesSeguinte(r.geradoAte); mes <= alvo; mes = mesSeguinte(mes)) {
      try {
        await prisma.lancamento.create({
          data: {
            tipo: r.tipo,
            valorCentavos: r.valorCentavos,
            data: dataDaRecorrencia(mes, r.diaDoMes),
            descricao: r.descricao,
            categoriaId: r.categoriaId,
            pessoaId: r.pessoaId,
            pago: false,
            recorrenciaId: r.id,
            familiaId: r.familiaId,
          },
        })
      } catch (erro) {
        if (!ehViolacaoDeUnico(erro)) throw erro
      }
    }
    await prisma.recorrencia.update({ where: { id: r.id }, data: { geradoAte: alvo } })
  }
}
