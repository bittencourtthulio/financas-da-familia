export interface MovimentoInicial {
  id: string
  tipo: string
  /** No formato do campo, "12,30". */
  valor: string
  data: string
  descricao: string
}

const OPCOES = [
  { valor: 'credito', rotulo: 'Crédito' },
  { valor: 'gasto', rotulo: 'Gasto' },
] as const

/**
 * Os campos do movimento de mesada, para o formulário rápido e o de edição. O
 * tipo é um par de opções que funciona sem JavaScript; o valor é texto, não
 * numérico, porque o formato brasileiro usa vírgula e o servidor é quem lê
 * (PR-02). A data começa em hoje, no dia de São Paulo.
 */
export function CamposDeMovimento({ hoje, inicial }: { hoje: string; inicial?: MovimentoInicial }) {
  const tipoInicial = inicial?.tipo ?? 'credito'

  return (
    <>
      {inicial && <input type="hidden" name="id" value={inicial.id} />}

      <fieldset className="campo-de-opcao">
        <legend>Tipo</legend>
        <div className="opcoes">
          {OPCOES.map((o) => (
            <label key={o.valor}>
              <input type="radio" name="tipo" value={o.valor} defaultChecked={tipoInicial === o.valor} />
              {o.rotulo}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="campo">
        <span>Valor (R$)</span>
        <input
          type="text"
          name="valor"
          inputMode="decimal"
          placeholder="0,00"
          autoComplete="off"
          defaultValue={inicial?.valor}
          required
        />
      </label>

      <label className="campo">
        <span>Data</span>
        <input type="date" name="data" defaultValue={inicial?.data ?? hoje} required />
      </label>

      <label className="campo">
        <span>Descrição (opcional)</span>
        <input
          type="text"
          name="descricao"
          maxLength={200}
          autoComplete="off"
          defaultValue={inicial?.descricao}
        />
      </label>
    </>
  )
}
