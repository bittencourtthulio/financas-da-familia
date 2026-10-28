import Link from 'next/link'
import { formatarDataCivil, formatarMoeda } from '@/lib/formato'
import { rotuloDoMes } from '@/lib/datas'
import { rotuloDoTipo } from '@/lib/atividade'

export interface LancamentoParaExibir {
  id: string
  tipo: string
  valorCentavos: number
  data: string
  descricao: string
  categoria: { nome: string }
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
}: {
  itens: LancamentoParaExibir[]
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
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Descrição</th>
            <th className="valor">Valor</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => {
            const despesa = item.tipo === 'despesa'
            return (
              <tr key={item.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{formatarDataCivil(item.data)}</td>
                <td>{rotuloDoTipo(item.tipo)}</td>
                <td>{item.categoria.nome}</td>
                <td>{item.descricao || '—'}</td>
                <td className={despesa ? 'valor valor-despesa' : 'valor valor-receita'}>
                  {formatarMoeda(despesa ? -item.valorCentavos : item.valorCentavos)}
                </td>
                <td style={{ textAlign: 'right' }}>
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
