'use client'

import { useActionState, useState } from 'react'
import { excluirLancamento } from '@/app/acoes'
import { CaixaDeConfirmacao } from '@/componentes/CaixaDeConfirmacao'

/**
 * Apagar em dois passos (PR-28): o primeiro clique só mostra o aviso; a
 * exclusão acontece no segundo, e não dá para desfazer.
 */
export function ApagarLancamento({
  id,
  recorrente = false,
  confirmandoInicial = false,
}: {
  id: string
  /** Mês de um lançamento recorrente: pergunta se apaga só este ou também os próximos. */
  recorrente?: boolean
  confirmandoInicial?: boolean
}) {
  const [confirmando, setConfirmando] = useState(confirmandoInicial)
  const [estado, executar] = useActionState(excluirLancamento, {})

  return (
    <section className="zona-de-perigo" aria-label="Apagar lançamento">
      {estado.erro && (
        <p className="aviso erro" role="alert">
          {estado.erro}
        </p>
      )}
      {!confirmando ? (
        <button type="button" className="secundario" onClick={() => setConfirmando(true)}>
          Apagar lançamento
        </button>
      ) : (
        <CaixaDeConfirmacao>
          <form action={executar}>
            <p>Esta exclusão não pode ser desfeita. O lançamento some da lista e fica só o registro de quem apagou.</p>
            <input type="hidden" name="id" value={id} />
            {recorrente && (
              <fieldset className="campo-de-opcao">
                <legend>Este lançamento se repete todo mês. Apagar</legend>
                <div className="opcoes">
                  <label>
                    <input type="radio" name="escopo" value="este" defaultChecked />
                    Só este mês
                  </label>
                  <label>
                    <input type="radio" name="escopo" value="proximos" />
                    Este e todos os próximos meses
                  </label>
                </div>
              </fieldset>
            )}
            <div className="acoes">
              <button type="submit" className="perigo">
                Confirmar exclusão
              </button>
              <button type="button" className="secundario" onClick={() => setConfirmando(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </CaixaDeConfirmacao>
      )}
    </section>
  )
}
