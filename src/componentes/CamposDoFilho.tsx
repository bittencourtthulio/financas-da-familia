import { Campo } from '@/componentes/Formulario'

export interface FilhoInicial {
  id: string
  nome: string
  /** AAAA-MM-DD ou vazio. */
  nascimento: string
  /** No formato do campo, "50,00". */
  valor: string
  periodicidade: string
}

/**
 * Os campos do filho, para o formulário de cadastro e o de edição (PR-30).
 * O valor é texto, não numérico: o formato brasileiro usa vírgula e o servidor
 * é quem lê (PR-02). Só o que a PR-09 permite para dado de menor.
 */
export function CamposDoFilho({ inicial }: { inicial?: FilhoInicial }) {
  return (
    <>
      {inicial && <input type="hidden" name="id" value={inicial.id} />}

      <label className="campo">
        <span>Nome</span>
        <input type="text" name="nome" maxLength={80} autoComplete="off" defaultValue={inicial?.nome} required />
      </label>

      <label className="campo">
        <span>Valor da mesada combinada (R$)</span>
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
        <span>Periodicidade</span>
        <select name="periodicidade" defaultValue={inicial?.periodicidade ?? 'mensal'} required>
          <option value="semanal">Semanal</option>
          <option value="mensal">Mensal</option>
        </select>
      </label>

      <Campo nome="nascimento" rotulo="Data de nascimento (opcional)" tipo="date" padrao={inicial?.nascimento} obrigatorio={false} />

      <p className="nota-do-campo">
        O valor e a periodicidade são só um combinado: o sistema não credita nem calcula mesada sozinho.
      </p>
    </>
  )
}
