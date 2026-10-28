/**
 * Limite de tentativas de login (PR-12, PR-22): cinco falhas seguidas do
 * mesmo e-mail em 15 minutos bloqueiam esse e-mail por 15 minutos; login
 * correto zera o contador. O limitador recebe o relógio, então o teste não
 * espera nem dorme.
 */
import { describe, it, expect } from 'vitest'
import { criarLimitador } from '@/lib/limite-de-tentativas'

const MINUTO = 60_000

function limitadorComRelogio() {
  let agora = 1_000_000
  const limitador = criarLimitador({ agora: () => agora })
  return {
    limitador,
    avancar: (ms: number) => {
      agora += ms
    },
  }
}

describe('criarLimitador', () => {
  it('quatro falhas ainda deixam tentar; a quinta bloqueia', () => {
    const { limitador } = limitadorComRelogio()
    for (let i = 0; i < 4; i += 1) limitador.registrarFalha('a@x.local')
    expect(limitador.restanteDoBloqueio('a@x.local')).toBe(0)

    limitador.registrarFalha('a@x.local')
    expect(limitador.restanteDoBloqueio('a@x.local')).toBeGreaterThan(0)
  })

  it('o bloqueio dura 15 minutos e depois libera com o contador zerado', () => {
    const { limitador, avancar } = limitadorComRelogio()
    for (let i = 0; i < 5; i += 1) limitador.registrarFalha('a@x.local')

    avancar(14 * MINUTO)
    expect(limitador.restanteDoBloqueio('a@x.local')).toBeGreaterThan(0)

    avancar(MINUTO + 1)
    expect(limitador.restanteDoBloqueio('a@x.local')).toBe(0)

    // Libera de verdade: precisa de cinco falhas novas para bloquear de novo.
    for (let i = 0; i < 4; i += 1) limitador.registrarFalha('a@x.local')
    expect(limitador.restanteDoBloqueio('a@x.local')).toBe(0)
  })

  it('login correto zera o contador', () => {
    const { limitador } = limitadorComRelogio()
    for (let i = 0; i < 4; i += 1) limitador.registrarFalha('a@x.local')
    limitador.registrarSucesso('a@x.local')
    for (let i = 0; i < 4; i += 1) limitador.registrarFalha('a@x.local')
    expect(limitador.restanteDoBloqueio('a@x.local')).toBe(0)
  })

  it('falhas espaçadas além da janela de 15 minutos não se somam', () => {
    const { limitador, avancar } = limitadorComRelogio()
    for (let i = 0; i < 4; i += 1) limitador.registrarFalha('a@x.local')
    avancar(16 * MINUTO)
    limitador.registrarFalha('a@x.local')
    expect(limitador.restanteDoBloqueio('a@x.local')).toBe(0)
  })

  it('cada e-mail tem o seu contador', () => {
    const { limitador } = limitadorComRelogio()
    for (let i = 0; i < 5; i += 1) limitador.registrarFalha('a@x.local')
    expect(limitador.restanteDoBloqueio('a@x.local')).toBeGreaterThan(0)
    expect(limitador.restanteDoBloqueio('b@x.local')).toBe(0)
  })
})
