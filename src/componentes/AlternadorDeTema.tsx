'use client'

import { useSyncExternalStore } from 'react'

type Tema = 'dark' | 'light'

// O tema mora fora do React: no atributo do <html> e no localStorage. Ler
// com useSyncExternalStore, em vez de copiar para um state num efeito,
// evita a cascata de renders e mantém uma fonte de verdade só.
const ouvintes = new Set<() => void>()

function inscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

function temaAtual(): Tema {
  // O claro é o padrão: só vale o escuro para quem o escolheu.
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

// No servidor não há escolha a consultar; o padrão é o tema claro.
const temaNoServidor = (): Tema => 'light'

export function AlternadorDeTema() {
  const tema = useSyncExternalStore(inscrever, temaAtual, temaNoServidor)

  function alternar() {
    const novo: Tema = tema === 'light' ? 'dark' : 'light'
    document.documentElement.dataset.theme = novo
    try {
      localStorage.setItem('tema', novo)
    } catch {
      // Navegador com armazenamento bloqueado: o tema vale para esta aba.
    }
    ouvintes.forEach((ouvir) => ouvir())
  }

  return (
    <button type="button" onClick={alternar} aria-label="Alternar tema">
      {tema === 'light' ? '☾ Escuro' : '☀ Claro'}
    </button>
  )
}
