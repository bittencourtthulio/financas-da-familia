import Link from 'next/link'
import { formatarDataCivil, formatarMoeda } from '@/lib/formato'
import { rotuloDoMes } from '@/lib/datas'
import { rotuloDoTipo } from '@/lib/atividade'
import { alternarPagoDoLancamento } from '@/app/acoes'
import { Rostinho } from '@/componentes/ilustracoes/Familia'
import type { Avatar } from '@/lib/avatar'

export interface LancamentoParaExibir {
  id: string
  tipo: string
  valorCentavos: number
  data: string
  descricao: string
  categoria: { nome: string }
  /** Quem da família fez o gasto; nulo quando ninguém em especial. */
  pessoaId?: string | null
  /** Pago ou recebido; sem a informação, vale pago. */
  pago?: boolean
  /** Se é um mês de lançamento recorrente. */
  recorrenciaId?: string | null
}

/** A pessoa como a tabela a desenha: nome no mouse e o rostinho do avatar. */
export interface PessoaParaExibir {
  nome: string
  tipo: 'adulto' | 'crianca'
  avatar: Avatar | null
}

/**
 * Os lançamentos do mês em tabela. O valor é sempre guardado positivo; a
 * despesa sai com sinal de menos e a receita sem, cada uma com a cor do seu
 * token. Sem lançamento, o estado vazio diz o que fazer (PR-16).
 */
export function TabelaDeLancamentos({
  itens,
  mes,
  tipo = null,
  pessoas = {},
}: {
  itens: LancamentoParaExibir[]
  /** Por id da pessoa; sem a pessoa aqui, a célula mostra um traço. */
  pessoas?: Record<string, PessoaParaExibir>
  mes?: string
  tipo?: string | null
}) {
  if (itens.length === 0) {
    const onde = mes ? ` em ${rotuloDoMes(mes)}` : ''
    const o_que =
      tipo === 'receita' ? 'Nenhuma receita' : tipo === 'despesa' ? 'Nenhuma despesa' : 'Nenhum lançamento'
    return (
      <p className="vazio">
        {o_que}
        {onde}. Use <Link href="/lancamentos/novo">Novo lançamento</Link> para registrar uma receita
        ou uma despesa da casa.
      </p>
    )
  }

  return (
    <div className="tabela-rolavel">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Quem</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Situação</th>
            <th className="valor">Valor</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => {
            const despesa = item.tipo === 'despesa'
            return (
              <tr key={item.id}>
                <td className="sem-quebra">{formatarDataCivil(item.data)}</td>
                <td className="celula-de-pessoa">
                  {item.pessoaId && pessoas[item.pessoaId] ? (
                    <span className="pessoa-do-lancamento" title={pessoas[item.pessoaId]!.nome}>
                      <Rostinho
                        avatar={pessoas[item.pessoaId]!.avatar}
                        tipo={pessoas[item.pessoaId]!.tipo}
                        className="avatar"
                        titulo={pessoas[item.pessoaId]!.nome}
                      />
                    </span>
                  ) : (
                    <span aria-label="Ninguém em especial">—</span>
                  )}
                </td>
                <td>{rotuloDoTipo(item.tipo)}</td>
                <td>{item.categoria.nome}</td>
                <td>
                  {item.descricao || '—'}
                  {item.recorrenciaId && <span className="etiqueta-recorrente"> · repete todo mês</span>}
                </td>
                <td className="celula-de-situacao">
                  <form action={alternarPagoDoLancamento}>
                    <input type="hidden" name="id" value={item.id} />
                    <span className="situacao" data-pago={item.pago === false ? 'nao' : 'sim'}>
                      {item.pago === false ? 'Em aberto' : despesa ? 'Pago' : 'Recebido'}
                    </span>{' '}
                    <button type="submit" className="link-botao">
                      {item.pago === false
                        ? despesa
                          ? 'Marcar como pago'
                          : 'Marcar como recebido'
                        : 'Voltar para em aberto'}
                    </button>
                  </form>
                </td>
                <td className={despesa ? 'valor valor-despesa' : 'valor valor-receita'}>
                  {formatarMoeda(despesa ? -item.valorCentavos : item.valorCentavos)}
                </td>
                <td className="celula-acoes">
                  <Link href={`/lancamentos/${item.id}`}>Editar</Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
