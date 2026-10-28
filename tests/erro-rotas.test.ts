/**
 * As rotas de API também não vazam pilha (PR-14, L17): erro inesperado vira
 * 500 com frase fixa e um código de correlação, e o log leva o mesmo código.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => ({ name: 'sessao', value: 'token-qualquer' }),
    set: () => {},
    delete: () => {},
  }),
}))
vi.mock('@/servicos/autenticacao', async (original) => ({
  ...(await original<typeof import('@/servicos/autenticacao')>()),
  renovarSessao: async () => {
    throw new Error('falha em /Users/alguem/x.ts para ana@casa.com')
  },
}))
vi.mock('@/servicos/privacidade', () => ({
  exportarDadosDaFamilia: async () => {
    throw new Error('falha em /Users/alguem/y.ts para ana@casa.com')
  },
}))
vi.mock('@/app/sessao-servidor', () => ({
  usuarioAtual: async () => ({ id: 'a', nome: 'A', papel: 'admin' }),
}))

import { POST as renovar } from '@/app/api/sessao/renovar/route'
import { POST as exportar } from '@/app/api/privacidade/exportar/route'
import { definirDestinoDoLog } from '@/lib/log'

let linhas: string[]
beforeEach(() => {
  linhas = []
  definirDestinoDoLog((l) => linhas.push(l))
})
afterEach(() => definirDestinoDoLog(null))

describe.each([
  ['renovar a sessão', renovar],
  ['exportar os dados', exportar],
])('erro inesperado ao %s', (_nome, rota) => {
  it('500 com frase fixa e código, sem mensagem, caminho nem e-mail', async () => {
    const r = await (rota as () => Promise<Response>)()
    const texto = await r.text()
    const corpo = JSON.parse(texto)
    expect(r.status).toBe(500)
    expect(corpo.codigo).toMatch(/^[0-9a-f]{12}$/)
    expect(texto).not.toMatch(/Users|ana@|\.ts|stack/)
    expect(linhas).toHaveLength(1)
    expect(JSON.parse(linhas[0] as string).contexto.ref).toBe(corpo.codigo)
    expect(linhas[0]).not.toMatch(/Users|ana@|\.ts|stack/)
  })
})
