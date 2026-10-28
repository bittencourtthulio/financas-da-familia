// Renderiza um componente React para HTML no servidor, sem navegador. É o
// harness da interface: dá para afirmar sobre o que o usuário recebe sem
// subir o Next. Componentes que dependem do roteador do Next (usePathname)
// recebem null, o mesmo valor que o roteador devolve fora de uma página.
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

export function renderizar<P extends object>(
  componente: ComponentType<P>,
  props: P,
): string {
  return renderToStaticMarkup(createElement(componente, props))
}
