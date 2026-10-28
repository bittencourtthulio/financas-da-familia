/**
 * Formato brasileiro (PR-16, PR-02): valor em centavos inteiros e data no
 * fuso America/Sao_Paulo, independentes da máquina que roda o sistema.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { formatarMoeda, formatarData, formatarDataEHora, FUSO_DA_FAMILIA } from '@/lib/formato'

const NBSP = ' '

describe('formatarMoeda', () => {
  it('formata centavos em reais, com milhar em ponto e decimal em vírgula', () => {
    expect(formatarMoeda(123456)).toBe(`R$${NBSP}1.234,56`)
    expect(formatarMoeda(0)).toBe(`R$${NBSP}0,00`)
    expect(formatarMoeda(5)).toBe(`R$${NBSP}0,05`)
    expect(formatarMoeda(100)).toBe(`R$${NBSP}1,00`)
  })

  it('formata valor negativo com o sinal na frente', () => {
    expect(formatarMoeda(-5050)).toBe(`-R$${NBSP}50,50`)
  })

  it('concorda com o ICU do Node para pt-BR e BRL em uma série de valores', () => {
    const icu = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    for (const centavos of [0, 1, 9, 10, 99, 100, 101, 99999, 100000, 123456, 1234567890, -1, -100, -5050]) {
      expect(formatarMoeda(centavos), String(centavos)).toBe(icu.format(centavos / 100))
    }
  })

  it('recusa valor que não é inteiro: centavos nunca são ponto flutuante', () => {
    expect(() => formatarMoeda(10.5)).toThrow(/inteiro/)
    expect(() => formatarMoeda(Number.NaN)).toThrow(/inteiro/)
    expect(() => formatarMoeda(Infinity)).toThrow(/inteiro/)
  })
})

describe('formatarData', () => {
  const fusoOriginal = process.env.TZ
  afterEach(() => {
    if (fusoOriginal === undefined) delete process.env.TZ
    else process.env.TZ = fusoOriginal
  })

  it('o fuso da família é America/Sao_Paulo', () => {
    expect(FUSO_DA_FAMILIA).toBe('America/Sao_Paulo')
  })

  it('usa o dia de São Paulo, não o do UTC', () => {
    // 02:30 UTC de 28/10 ainda é 23:30 de 27/10 em São Paulo (UTC-3).
    expect(formatarData(new Date('2026-10-28T02:30:00Z'))).toBe('27/10/2026')
    expect(formatarDataEHora(new Date('2026-10-28T02:30:00Z'))).toBe('27/10/2026 23:30')
  })

  it('não depende do fuso da máquina', () => {
    process.env.TZ = 'Asia/Tokyo'
    expect(formatarData(new Date('2026-10-28T02:30:00Z'))).toBe('27/10/2026')
    process.env.TZ = 'Pacific/Auckland'
    expect(formatarData(new Date('2026-10-28T02:30:00Z'))).toBe('27/10/2026')
  })

  it('aceita texto ISO e número, e recusa data inválida', () => {
    expect(formatarData('2026-01-15T15:00:00Z')).toBe('15/01/2026')
    expect(formatarData(Date.UTC(2026, 11, 31, 12))).toBe('31/12/2026')
    expect(() => formatarData('não é data')).toThrow(/inválida/)
  })
})
