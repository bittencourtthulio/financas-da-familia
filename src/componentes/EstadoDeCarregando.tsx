/** O estado "carregando" de qualquer tela que busca dado (PR-16). */
export function EstadoDeCarregando() {
  return (
    <div className="estado estado-carregando" role="status" aria-live="polite">
      <span className="pontinhos" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      Carregando…
    </div>
  )
}
