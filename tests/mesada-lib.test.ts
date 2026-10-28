/**
 * Apresentação da mesada (FT-06): funções puras. O saldo é dito em texto, nunca
 * só por cor (PR-16), o valor do gasto sai com sinal de menos, e os endereços do
 * extrato mantêm só o necessário.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  avisoDeSaldoNegativo,
  enderecoDoExtrato,
  enderecoDoExtratoDoFilho,
  lerPagina,
  situacaoDoSaldo,
  valorDoMovimento,
} from '@/lib/mesada'

describe('situacaoDoSaldo', () => {
  it('positivo, zerado e negativo têm situação, rótulo e frase em texto', () => {
    expect(situacaoDoSaldo(1)).toMatchObject({ situacao: 'positivo', rotulo: 'Saldo disponível' })
    expect(situacaoDoSaldo(123456)).toMatchObject({ situacao: 'positivo' })
    expect(situacaoDoSaldo(0)).toMatchObject({ situacao: 'zerado', rotulo: 'Saldo zerado' })
    expect(situacaoDoSaldo(-1)).toMatchObject({ situacao: 'negativo', rotulo: 'Saldo negativo' })
    expect(situacaoDoSaldo(-1).frase).toMatch(/passaram|negativo/i)
    expect(situacaoDoSaldo(0).frase).toMatch(/zerado/i)
    expect(situacaoDoSaldo(5).frase.length).toBeGreaterThan(5)
  })

  it('recusa saldo que não é inteiro (nunca ponto flutuante)', () => {
    expect(() => situacaoDoSaldo(0.5)).toThrow()
    expect(() => situacaoDoSaldo(Number.NaN)).toThrow()
  })
})

// O formatador usa espaço rígido entre R$ e o número; o teste o lê como espaço.
const v = (tipo: string, c: number) => valorDoMovimento(tipo, c).replaceAll('\u00a0', ' ')

describe('valorDoMovimento', () => {
  it('o crédito sai sem sinal e o gasto com sinal de menos, em formato brasileiro', () => {
    expect(v('credito', 5000)).toBe('R$ 50,00')
    expect(v('gasto', 1230)).toBe('-R$ 12,30')
    expect(v('gasto', 123456)).toBe('-R$ 1.234,56')
  })

  it('tipo desconhecido não inventa sinal', () => {
    expect(v('xyz', 100)).toBe('R$ 1,00')
  })
})

describe('avisoDeSaldoNegativo', () => {
  it('só avisa quando o saldo é negativo, sem repetir o valor', () => {
    expect(avisoDeSaldoNegativo(-1)).toMatch(/negativo/)
    expect(avisoDeSaldoNegativo(-1)).not.toMatch(/\d/)
    expect(avisoDeSaldoNegativo(0)).toBeNull()
    expect(avisoDeSaldoNegativo(10)).toBeNull()
  })
})

describe('endereços do extrato', () => {
  it('a página 1 não leva parâmetro; as outras levam ?pagina=', () => {
    expect(enderecoDoExtrato(1)).toBe('/mesada')
    expect(enderecoDoExtrato(undefined)).toBe('/mesada')
    expect(enderecoDoExtrato(3)).toBe('/mesada?pagina=3')
    expect(enderecoDoExtratoDoFilho('abc', 1)).toBe('/filhos/abc/mesada')
    expect(enderecoDoExtratoDoFilho('abc', 2)).toBe('/filhos/abc/mesada?pagina=2')
  })
})

describe('lerPagina (a consulta chega da URL como texto qualquer)', () => {
  it.each([
    ['2', 2],
    ['10', 10],
    ['1', 1],
  ])('"%s" vira %i', (texto, esperado) => {
    expect(lerPagina(texto)).toBe(esperado)
  })

  it.each(['', 'abc', '-1', '1.5', '2abc', '0x10', '1e2', ' ', '99999999999999999999'])(
    '"%s" é ignorada',
    (texto) => {
      expect(lerPagina(texto)).toBeUndefined()
    },
  )

  it('lista, objeto e ausente são ignorados', () => {
    expect(lerPagina(['2', '3'])).toBeUndefined()
    expect(lerPagina(undefined)).toBeUndefined()
    expect(lerPagina({ pagina: 2 })).toBeUndefined()
  })
})

describe('PR-02 em src/lib/mesada.ts', () => {
  it('não usa parseFloat, Number(, toFixed nem arredondamento', () => {
    const codigo = readFileSync('src/lib/mesada.ts', 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
    expect(codigo).not.toMatch(/parseFloat|Number\(|toFixed|Math\.(round|floor|trunc)/)
  })
})
