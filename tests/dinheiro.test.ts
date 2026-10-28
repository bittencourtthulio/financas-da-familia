/**
 * O leitor do valor digitado (PR-02, PR-26): texto em formato brasileiro vira
 * centavos inteiros, sem ponto flutuante, e o que não é valor é recusado.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  lerValorEmReais,
  centavosParaCampo,
  VALOR_MAXIMO_EM_CENTAVOS,
} from '@/lib/dinheiro'
import { formatarMoeda } from '@/lib/formato'

describe('lerValorEmReais', () => {
  it.each([
    ['1.234,56', 123456],
    ['1234,56', 123456],
    ['12,5', 1250],
    ['12,50', 1250],
    ['12', 1200],
    ['0,01', 1],
    ['0,99', 99],
    ['1.000,00', 100000],
    ['R$ 1.234,56', 123456],
    ['R$1.234,56', 123456],
    ['  45,90  ', 4590],
    ['1.000.000,00', 100000000],
    ['19,99', 1999],
    ['0,10', 10],
  ])('lê "%s" como %i centavos', (texto, centavos) => {
    expect(lerValorEmReais(texto)).toBe(centavos)
  })

  it('o teto é R$ 1.000.000,00 e o limite está declarado', () => {
    expect(VALOR_MAXIMO_EM_CENTAVOS).toBe(100_000_000)
    expect(lerValorEmReais('1.000.000,00')).toBe(VALOR_MAXIMO_EM_CENTAVOS)
    expect(lerValorEmReais('1.000.000,01')).toBeNull()
    expect(lerValorEmReais('1000001')).toBeNull()
  })

  it.each([
    '',
    '   ',
    'abc',
    'R$',
    '1.2.3',
    '1234.56', // ponto decimal: ambíguo com milhar, recusado
    '1,234,56',
    '12,345',
    '1.23',
    '12.34.567,89',
    '-5',
    '-5,00',
    '+5',
    '0',
    '0,00',
    '00,00',
    'NaN',
    'Infinity',
    '1e3',
    '1,5e2',
    '0x10',
    '999999999999999999',
    '99999999999999999999999,99',
    ',50',
    '12,',
    '1 234,56',
  ])('recusa "%s"', (texto) => {
    expect(lerValorEmReais(texto)).toBeNull()
  })

  it('recusa o que não é texto', () => {
    for (const entrada of [null, undefined, 12, 12.5, NaN, {}, [], true]) {
      expect(lerValorEmReais(entrada)).toBeNull()
    }
  })

  it('só devolve inteiro seguro, positivo e até o teto (nenhum resultado fracionário)', () => {
    const textos = ['0,01', '0,07', '1,1', '19,99', '2,675', '1.234,56', '999.999,99', '0,3']
    for (const t of textos) {
      const c = lerValorEmReais(t)
      if (c === null) continue
      expect(Number.isSafeInteger(c)).toBe(true)
      expect(c).toBeGreaterThan(0)
      expect(c).toBeLessThanOrEqual(VALOR_MAXIMO_EM_CENTAVOS)
    }
    // 19,99 e 0,07 são os casos clássicos em que x * 100 em float dá fração.
    expect(lerValorEmReais('19,99')).toBe(1999)
    expect(lerValorEmReais('0,07')).toBe(7)
    expect(lerValorEmReais('1,1')).toBe(110)
  })
})

describe('centavosParaCampo', () => {
  it.each([
    [123456, '1234,56'],
    [1250, '12,50'],
    [5, '0,05'],
    [100, '1,00'],
    [100000000, '1000000,00'],
  ])('mostra %i centavos como "%s"', (centavos, campo) => {
    expect(centavosParaCampo(centavos)).toBe(campo)
  })

  it('o que o campo mostra é lido de volta pelo mesmo valor (ida e volta)', () => {
    for (const c of [1, 99, 100, 1999, 123456, 99999999, 100000000]) {
      expect(lerValorEmReais(centavosParaCampo(c))).toBe(c)
    }
  })

  it('recusa centavos que não são inteiros', () => {
    expect(() => centavosParaCampo(12.5)).toThrow()
    expect(() => centavosParaCampo(NaN)).toThrow()
  })

  it('concorda com a exibição em reais de formato.ts', () => {
    expect(formatarMoeda(123456)).toContain('1.234,56')
    expect(centavosParaCampo(123456)).toBe('1234,56')
  })
})

describe('PR-02 no código do leitor', () => {
  it('src/lib/dinheiro.ts não usa ponto flutuante sobre o valor', () => {
    const fonte = readFileSync(path.join(process.cwd(), 'src/lib/dinheiro.ts'), 'utf8')
    const semComentarios = fonte.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    expect(semComentarios).not.toMatch(/parseFloat|Number\(|Math\.(round|floor|ceil|trunc)|toFixed|\* ?100\b|\/ ?100\b/)
  })
})
