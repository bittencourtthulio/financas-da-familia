'use client'

import { useEffect } from 'react'

/**
 * Renovação deslizante da sessão (PR-21): enquanto a aba está aberta, pede um
 * token novo na metade do tempo de vida do atual. Se o servidor recusar (conta
 * desativada, senha trocada em outro lugar), manda para o login. Não desenha
 * nada.
 */
export function RenovadorDeSessao({ intervaloMs }: { intervaloMs: number }) {
  useEffect(() => {
    const id = window.setInterval(async () => {
      try {
        const r = await fetch('/api/sessao/renovar', { method: 'POST' })
        // Navegação completa de propósito: o servidor reavalia a sessão do zero.
        if (r.status === 401) window.location.assign(new URL('/entrar', window.location.href))
      } catch {
        // Sem rede agora: tenta de novo no próximo intervalo.
      }
    }, intervaloMs)
    return () => window.clearInterval(id)
  }, [intervaloMs])

  return null
}
