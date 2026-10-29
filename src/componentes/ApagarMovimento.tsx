'use client'

import { useActionState, useState } from 'react'
import { excluirMovimentoDeMesada } from '@/app/acoes'
import { CaixaDeConfirmacao } from '@/componentes/CaixaDeConfirmacao'

/**
 * Apagar em dois passos (PR-33): o primeiro clique só mostra o aviso; a
 * exclusão acontece no segundo, e não dá para desfazer.
 */
export function ApagarMovimento({
  id,
  confirmandoInicial = false,
}: {
  id: string
  confirmandoInicial?: boolean
}) {
  const [confirmando, setConfirmando] = useState(confirmandoInicial)
  const [estado, executar] = useActionState(excluirMovimentoDeMesada, {})

  return (
    <section className="zona-de-perigo" aria-label="Apagar movimento">
      {estado.erro && (
        <p className="aviso erro" role="alert">
          {estado.erro}
        </p>
      )}
      {!confirmando ? (
        <button type="button" className="secundario" onClick={() => setConfirmando(true)}>
          Apagar movimento
        </button>
      ) : (
        <CaixaDeConfirmacao>
          <form action={executar}>
            <p>
              Esta exclusão não pode ser desfeita. O movimento some do extrato e o saldo é recalculado;
              fica só o registro de quem apagou.
            </p>
            <input type="hidden" name="id" value={id} />
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
