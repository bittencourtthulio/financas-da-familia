'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { alternarGaveta, gavetaAberta, type EstadoDaGaveta } from '@/lib/gaveta'

interface ContextoDaGaveta {
  aberta: boolean
  alternar: () => void
}

const Contexto = createContext<ContextoDaGaveta>({
  aberta: false,
  alternar: () => {},
})

/** Lê o estado da gaveta; fora da casca, devolve uma gaveta sempre fechada. */
export const useGaveta = () => useContext(Contexto)

/**
 * A moldura `.aplicacao` do sistema. Guarda o estado da gaveta de navegação
 * (abaixo de 768px a barra lateral vira gaveta) e o aplica como classe.
 */
export function CascaDoSistema({ children }: { children: React.ReactNode }) {
  const rota = usePathname() ?? '/'
  const [estado, setEstado] = useState<EstadoDaGaveta>(null)
  const aberta = gavetaAberta(estado, rota)

  const valor = useMemo(
    () => ({ aberta, alternar: () => setEstado((e) => alternarGaveta(e, rota)) }),
    [aberta, rota],
  )

  return (
    <Contexto.Provider value={valor}>
      <div className={aberta ? 'aplicacao gaveta-aberta' : 'aplicacao'}>{children}</div>
    </Contexto.Provider>
  )
}
