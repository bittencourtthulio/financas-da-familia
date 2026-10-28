'use client'

import { useActionState, useState } from 'react'
import { excluirLancamento } from '@/app/acoes'

/**
 * Apagar em dois passos (PR-28): o primeiro clique só mostra o aviso; a
 * exclusão acontece no segundo, e não dá para desfazer.
 */
export function ApagarLancamento({
  id,
  confirmandoInicial = false,
}: {
  id: string
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
        <form action={executar}>
          <p>Esta exclusão não pode ser desfeita. O lançamento some da lista e fica só o registro de quem apagou.</p>
          <input type="hidden" name="id" value={id} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="perigo">
              Confirmar exclusão
            </button>
            <button type="button" className="secundario" onClick={() => setConfirmando(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
