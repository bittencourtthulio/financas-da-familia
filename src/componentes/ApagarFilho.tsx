'use client'

import { useActionState, useState } from 'react'
import { excluirContaDoFilho } from '@/app/acoes'
import { CaixaDeConfirmacao } from '@/componentes/CaixaDeConfirmacao'

/**
 * Apagar a conta de um filho em dois passos (FT-07, PR-35): o primeiro clique só
 * abre a confirmação; o segundo exige digitar o nome. O servidor confere de novo.
 */
export function ApagarFilho({
  filhoId,
  nome,
  confirmandoInicial = false,
}: {
  filhoId: string
  nome: string
  confirmandoInicial?: boolean
}) {
  const [confirmando, setConfirmando] = useState(confirmandoInicial)
  const [estado, executar] = useActionState(excluirContaDoFilho, {})

  return (
    <section className="zona-de-perigo" aria-label={`Apagar a conta de ${nome}`}>
      {estado.erro && (
        <p className="aviso erro" role="alert">
          {estado.erro}
        </p>
      )}
      {!confirmando ? (
        <button type="button" className="secundario" onClick={() => setConfirmando(true)}>
          Apagar a conta de {nome}
        </button>
      ) : (
        <CaixaDeConfirmacao>
          <form action={executar}>
            <p>
              Isto apaga o cadastro, o login e todos os movimentos de mesada de {nome}. A exclusão não
              pode ser desfeita.
            </p>
            <input type="hidden" name="id" value={filhoId} />
            <label className="campo">
              <span>
                Digite <strong>{nome}</strong> para confirmar
              </span>
              <input type="text" name="confirmacao" autoComplete="off" required />
            </label>
            <div className="acoes">
              <button type="submit" className="perigo">
                Apagar para sempre
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
