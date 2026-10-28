const OPCOES = [
  { valor: 'despesa', rotulo: 'Despesa' },
  { valor: 'receita', rotulo: 'Receita' },
] as const

/**
 * Despesa ou receita, em dois botões de opção que funcionam sem JavaScript.
 * Sem `aoMudar`, o navegador guarda a escolha (começa em `padrao`); com
 * `aoMudar`, quem usa controla (`selecionado`), para filtrar as categorias.
 */
export function CampoDeTipo({
  padrao = 'despesa',
  selecionado,
  aoMudar,
}: {
  padrao?: string
  selecionado?: string
  aoMudar?: (tipo: string) => void
}) {
  return (
    <fieldset className="campo-de-opcao">
      <legend>Tipo</legend>
      <div className="opcoes">
        {OPCOES.map((o) => (
          <label key={o.valor}>
            <input
              type="radio"
              name="tipo"
              value={o.valor}
              {...(aoMudar
                ? { checked: selecionado === o.valor, onChange: () => aoMudar(o.valor) }
                : { defaultChecked: padrao === o.valor })}
            />
            {o.rotulo}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
