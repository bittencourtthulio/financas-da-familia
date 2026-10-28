'use client'

import { EstadoDeErro } from '@/componentes/EstadoDeErro'

/** Erro dentro do sistema: a moldura (menu e barra de status) continua de pé. */
export default function ErroDoSistema({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <EstadoDeErro erro={error} aoTentarDeNovo={reset} />
}
