/**
 * Data civil (PR-16, PR-26): o dia do lançamento é um texto AAAA-MM-DD no
 * fuso da família, não um instante. Estes testes fixam o relógio.
 */
import { describe, it, expect } from 'vitest'
import {
  dataCivilValida,
  hojeEmSaoPaulo,
  mesDaData,
  mesAtualEmSaoPaulo,
  mesValido,
  intervaloDoMes,
  mesAnterior,
  mesSeguinte,
  rotuloDoMes,
  DATA_MINIMA,
  DATA_MAXIMA,
} from '@/lib/datas'
import { formatarDataCivil } from '@/lib/formato'

describe('dataCivilValida', () => {
  it.each(['2026-10-28', '2024-02-29', '2000-01-01', '2100-12-31', '2026-01-31'])(
    'aceita %s',
    (d) => expect(dataCivilValida(d)).toBe(true),
  )

  it.each([
    '2026-02-30',
    '2025-02-29',
    '2026-13-01',
    '2026-00-10',
    '2026-04-31',
    '26-10-28',
    '2026/10/28',
    '28/10/2026',
    '2026-1-5',
    '',
    ' 2026-10-28',
    '2026-10-28T00:00:00Z',
    '1999-12-31',
    '2101-01-01',
    'abc',
  ])('recusa "%s"', (d) => expect(dataCivilValida(d)).toBe(false))

  it('recusa o que não é texto', () => {
    for (const x of [null, undefined, 20261028, new Date(), {}]) {
      expect(dataCivilValida(x)).toBe(false)
    }
  })

  it('os limites estão declarados', () => {
    expect(DATA_MINIMA).toBe('2000-01-01')
    expect(DATA_MAXIMA).toBe('2100-12-31')
  })
})

describe('hoje no fuso de São Paulo', () => {
  it('23h30 de 27/10 em São Paulo ainda é o dia 27, embora em UTC já seja 28', () => {
    const agora = new Date('2026-10-28T02:30:00Z')
    expect(hojeEmSaoPaulo(agora)).toBe('2026-10-27')
    expect(mesAtualEmSaoPaulo(agora)).toBe('2026-10')
  })

  it('a virada de mês acontece à meia-noite de São Paulo, não de UTC', () => {
    expect(hojeEmSaoPaulo(new Date('2026-11-01T02:59:00Z'))).toBe('2026-10-31')
    expect(mesAtualEmSaoPaulo(new Date('2026-11-01T02:59:00Z'))).toBe('2026-10')
    expect(hojeEmSaoPaulo(new Date('2026-11-01T03:00:00Z'))).toBe('2026-11-01')
    expect(mesAtualEmSaoPaulo(new Date('2026-11-01T03:00:00Z'))).toBe('2026-11')
  })

  it('sem argumento usa o relógio e devolve uma data válida', () => {
    expect(dataCivilValida(hojeEmSaoPaulo())).toBe(true)
  })
})

describe('mês', () => {
  it('mesDaData corta o ano e o mês', () => {
    expect(mesDaData('2026-10-28')).toBe('2026-10')
  })

  it.each(['2026-01', '2026-12', '2000-01', '2100-12'])('mesValido aceita %s', (m) =>
    expect(mesValido(m)).toBe(true),
  )
  it.each(['2026-13', '2026-00', '2026-1', '2026', 'abc', '', '1999-12', '2101-01', '2026-10-01', null, undefined])(
    'mesValido recusa %s',
    (m) => expect(mesValido(m)).toBe(false),
  )

  it('o intervalo é fechado no início e aberto no fim, e dezembro vira janeiro', () => {
    expect(intervaloDoMes('2026-10')).toEqual({ de: '2026-10-01', ate: '2026-11-01' })
    expect(intervaloDoMes('2026-12')).toEqual({ de: '2026-12-01', ate: '2027-01-01' })
    expect(intervaloDoMes('2026-02')).toEqual({ de: '2026-02-01', ate: '2026-03-01' })
  })

  it('anterior e seguinte atravessam o ano', () => {
    expect(mesAnterior('2026-01')).toBe('2025-12')
    expect(mesAnterior('2026-10')).toBe('2026-09')
    expect(mesSeguinte('2026-12')).toBe('2027-01')
    expect(mesSeguinte('2026-10')).toBe('2026-11')
  })

  it('o rótulo é em português', () => {
    expect(rotuloDoMes('2026-10')).toBe('outubro de 2026')
    expect(rotuloDoMes('2026-03')).toBe('março de 2026')
    expect(rotuloDoMes('2027-01')).toBe('janeiro de 2027')
  })
})

describe('formatarDataCivil', () => {
  it('escreve o dia em formato brasileiro sem passar por fuso', () => {
    expect(formatarDataCivil('2026-10-27')).toBe('27/10/2026')
    expect(formatarDataCivil('2026-01-05')).toBe('05/01/2026')
  })
  it('recusa data inválida', () => {
    expect(() => formatarDataCivil('2026-02-30')).toThrow()
    expect(() => formatarDataCivil('amanhã')).toThrow()
  })
})

describe('fuso', () => {
  it('concorda com o fuso de formato.ts: o dia civil de hoje é o dia que formatarData mostra', async () => {
    const { FUSO_DA_FAMILIA, formatarData } = await import('@/lib/formato')
    expect(FUSO_DA_FAMILIA).toBe('America/Sao_Paulo')
    for (const instante of ['2026-10-28T02:30:00Z', '2026-11-01T02:59:00Z', '2026-11-01T03:00:00Z', '2026-06-15T12:00:00Z']) {
      const agora = new Date(instante)
      expect(formatarDataCivil(hojeEmSaoPaulo(agora))).toBe(formatarData(agora))
    }
  })
})
