import { descreverAtividade, type RegistroParaExibir } from '@/lib/atividade'

/**
 * A trilha em tabela: quando, quem, o quê e o detalhe. Sem registro, o
 * estado vazio diz o que vai aparecer ali (PR-16).
 */
export function TabelaDeAtividade({ itens }: { itens: RegistroParaExibir[] }) {
  if (itens.length === 0) {
    return (
      <p className="vazio">
        Ainda não há atividade registrada. Quando alguém criar ou desativar um
        usuário, ou mudar o papel de alguém, a ação aparece aqui com data e
        hora.
      </p>
    )
  }

  return (
    <div className="tabela-rolavel">
      <table>
        <thead>
          <tr>
            <th>Quando</th>
            <th>Quem</th>
            <th>Ação</th>
            <th>Detalhe</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, i) => {
            const d = descreverAtividade(item)
            return (
              <tr key={i}>
                <td className="sem-quebra">{d.quando}</td>
                <td>{d.quem}</td>
                <td>{d.acao}</td>
                <td>{d.detalhe}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
