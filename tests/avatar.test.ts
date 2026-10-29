/**
 * O avatar (FT-10) é uma escolha cosmética validada no servidor: figura, tom
 * de pele, cabelo, roupa e óculos, cada um de uma lista fechada. JSON quebrado
 * ou antigo no banco vale como "nenhum", nunca como erro na tela.
 */
import { describe, it, expect } from 'vitest'
import {
  avatarDoFormulario,
  avatarDoJson,
  avatarParaJson,
  FAMILIA_PADRAO,
  lerAvatar,
  TOKEN_DA_ROUPA,
  tokenDaPele,
  tokenDoCabelo,
} from '@/lib/avatar'

const VALIDO = { figura: 'menina', pele: 2, cabelo: 4, roupa: 'lilas', oculos: true }

describe('lerAvatar', () => {
  it('aceita um avatar completo e normaliza números vindos de texto', () => {
    expect(lerAvatar(VALIDO)).toEqual(VALIDO)
    expect(lerAvatar({ ...VALIDO, pele: '3', cabelo: '1', oculos: 'on' })).toEqual({ ...VALIDO, pele: 3, cabelo: 1, oculos: true })
  })

  it('ausente vale nenhum; inválido lança com frase para a tela', () => {
    expect(lerAvatar(null)).toBeNull()
    expect(lerAvatar(undefined)).toBeNull()
    expect(() => lerAvatar({ ...VALIDO, figura: 'robo' })).toThrow(/figura/)
    expect(() => lerAvatar({ ...VALIDO, pele: 9 })).toThrow(/pele/)
    expect(() => lerAvatar({ ...VALIDO, cabelo: 0 })).toThrow(/cabelo/)
    expect(() => lerAvatar({ ...VALIDO, roupa: 'xadrez' })).toThrow(/roupa/)
    expect(() => lerAvatar('pai')).toThrow(/inválido/)
  })

  it('óculos só é verdadeiro com sim explícito', () => {
    expect(lerAvatar({ ...VALIDO, oculos: undefined })?.oculos).toBe(false)
    expect(lerAvatar({ ...VALIDO, oculos: 'false' })?.oculos).toBe(false)
    expect(lerAvatar({ ...VALIDO, oculos: 'true' })?.oculos).toBe(true)
  })
})

describe('ida e volta pelo JSON', () => {
  it('o que vai para o banco volta igual', () => {
    expect(avatarDoJson(avatarParaJson(lerAvatar(VALIDO)!))).toEqual(VALIDO)
  })

  it('JSON quebrado, vazio ou com campo inválido vale nenhum', () => {
    expect(avatarDoJson(null)).toBeNull()
    expect(avatarDoJson('')).toBeNull()
    expect(avatarDoJson('{nao é json')).toBeNull()
    expect(avatarDoJson(JSON.stringify({ figura: 'alien' }))).toBeNull()
  })
})

describe('o formulário', () => {
  it('lê os campos avatar* e devolve indefinido quando o formulário não os tem', () => {
    const form = new FormData()
    expect(avatarDoFormulario(form)).toBeUndefined()
    form.set('avatarFigura', 'pai')
    form.set('avatarPele', '2')
    form.set('avatarCabelo', '5')
    form.set('avatarRoupa', 'ceu')
    form.set('avatarOculos', 'true')
    expect(lerAvatar(avatarDoFormulario(form))).toEqual({ figura: 'pai', pele: 2, cabelo: 5, roupa: 'ceu', oculos: true })
  })
})

describe('cores por token (PR-07)', () => {
  it('toda cor do avatar é um var(--…), nunca literal', () => {
    for (const token of [...Object.values(TOKEN_DA_ROUPA), tokenDaPele(4), tokenDoCabelo(5)]) {
      expect(token).toMatch(/^var\(--[\w-]+\)$/)
    }
  })

  it('a família padrão é válida e tem pai, mãe, menino e menina', () => {
    expect(FAMILIA_PADRAO.map((a) => lerAvatar(a)?.figura)).toEqual(['pai', 'mae', 'menino', 'menina'])
  })
})
