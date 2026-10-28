/** O estado "carregando" de qualquer tela que busca dado (PR-16). */
export function EstadoDeCarregando() {
  return (
    <div className="estado" role="status" aria-live="polite">
      Carregando…
    </div>
  )
}
