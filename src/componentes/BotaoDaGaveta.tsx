'use client'

import { useGaveta } from '@/componentes/CascaDoSistema'

/** O botão Menu da barra de status: só aparece abaixo de 768px (global.css). */
export function BotaoDaGaveta() {
  const { aberta, alternar } = useGaveta()
  return (
    <button
      type="button"
      className="botao-gaveta"
      onClick={alternar}
      aria-controls="barra-lateral"
      aria-expanded={aberta}
      aria-label={aberta ? 'Fechar menu' : 'Abrir menu'}
    >
      ☰ Menu
    </button>
  )
}
