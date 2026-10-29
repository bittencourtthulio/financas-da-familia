import Link from 'next/link'
import { formatarDataCivil } from '@/lib/formato'
import { rotuloDoTipo } from '@/lib/atividade'
import { valorDoMovimento } from '@/lib/mesada'

export interface MovimentoParaExibir {
  id: string
  tipo: string
  valorCentavos: number
  data: string
  descricao: string
}

/**
 * O extrato em tabela, do dia mais recente para o mais antigo (a ordem vem do
 * servidor). O gasto sai com sinal de menos e o crédito sem, cada um com a cor
 * do seu token, mas o tipo também é dito em palavras. Com `editarDoFilho`
 * (responsável), cada linha leva à edição do movimento; sem ele (filho), a
 * tela é só leitura. Sem movimento, o estado vazio diz o que fazer (PR-16).
 */
export function ExtratoDeMesada({
  itens,
  editarDoFilho,
}: {
  itens: MovimentoParaExibir[]
  editarDoFilho?: string
}) {
  if (itens.length === 0) {
    return editarDoFilho ? (
      <p className="vazio">
        Nenhum movimento ainda. Use o formulário acima para registrar o primeiro crédito de mesada ou
        gasto.
      </p>
    ) : (
      <p className="vazio">Ainda não há movimentos de mesada.</p>
    )
  }

  return (
    <div className="tabela-rolavel">
      <table className="extrato-da-mesada">
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th className="valor">Valor</th>
            {editarDoFilho && <th />}
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={item.id}>
              <td className="sem-quebra">{formatarDataCivil(item.data)}</td>
              <td>{rotuloDoTipo(item.tipo)}</td>
              <td>{item.descricao || '—'}</td>
              <td className={item.tipo === 'gasto' ? 'valor valor-despesa' : 'valor valor-receita'}>
                {valorDoMovimento(item.tipo, item.valorCentavos)}
              </td>
              {editarDoFilho && (
                <td className="celula-acoes">
                  <Link href={`/filhos/${editarDoFilho}/mesada/${item.id}`}>Editar</Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
