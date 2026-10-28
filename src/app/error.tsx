'use client'

import { EstadoDeErro } from '@/componentes/EstadoDeErro'

/** Erro fora do sistema (por exemplo, na tela de login). */
export default function ErroDaRaiz({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="conteudo">
      <EstadoDeErro erro={error} aoTentarDeNovo={reset} />
    </main>
  )
}
