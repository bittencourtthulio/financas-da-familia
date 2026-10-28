/**
 * Erro do servidor sem rastro de pilha (PR-14, L17): o usuário recebe uma
 * frase genérica com um código; o log recebe nome, código e o mesmo
 * identificador, nunca a mensagem (que pode trazer e-mail ou valor) nem a pilha.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }),
}))
vi.mock('next/navigation', () => ({
  redirect: (destino: string) => {
    throw new Error(`NEXT_REDIRECT ${destino}`)
  },
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))

import * as acoes from '@/app/acoes'
import { mensagemSegura, MENSAGEM_GENERICA } from '@/lib/erros'
import { entradaInvalida } from '@/lib/erros'
import { definirDestinoDoLog } from '@/lib/log'
import { prisma } from '@/lib/prisma'
import { reiniciarLimiteDeLogin } from '@/servicos/autenticacao'

let linhas: string[]

beforeEach(() => {
  linhas = []
  definirDestinoDoLog((l) => linhas.push(l))
  reiniciarLimiteDeLogin()
})
afterEach(() => {
  definirDestinoDoLog(null)
  vi.restoreAllMocks()
})

class ErroDoBanco extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message)
    this.name = 'ErroDoBanco'
  }
}

function erroComRastro(): ErroDoBanco {
  const e = new ErroDoBanco(
    'Unique constraint failed on email ana.silva@casa.com valor 123456 em /Users/alguem/src/servicos/x.ts:10:3',
    'P2002',
  )
  e.stack = `ErroDoBanco: ${e.message}\n    at funcao (/Users/alguem/src/servicos/x.ts:10:3)`
  return e
}

describe('mensagemSegura', () => {
  it('erro desconhecido vira a frase genérica com um código, sem mensagem nem pilha', () => {
    const texto = mensagemSegura(erroComRastro())
    expect(texto).toMatch(new RegExp(`^${MENSAGEM_GENERICA} Código: [0-9a-f]{12}$`))
    expect(texto).not.toMatch(/ana\.silva|Unique|P2002|123456|\/Users|\.ts|at funcao/)
  })

  it('o log tem evento, nome, código do erro e o MESMO identificador, sem mensagem nem pilha', () => {
    const texto = mensagemSegura(erroComRastro())
    const id = /Código: ([0-9a-f]{12})/.exec(texto)?.[1]
    expect(linhas).toHaveLength(1)
    const linha = JSON.parse(linhas[0] as string)
    expect(linha).toMatchObject({
      nivel: 'erro',
      evento: 'erro.inesperado',
      contexto: { nome: 'ErroDoBanco', codigo: 'P2002', ref: id },
    })
    expect(linhas[0]).not.toMatch(/ana\.silva|Unique|123456|\/Users|\.ts|stack|at funcao/)
  })

  it('dois erros seguidos têm códigos diferentes', () => {
    const a = mensagemSegura(new Error('a'))
    const b = mensagemSegura(new Error('b'))
    expect(a).not.toBe(b)
  })

  it('valor que nem é Error também não vaza', () => {
    const texto = mensagemSegura('texto solto com ana@casa.com')
    expect(texto).toContain(MENSAGEM_GENERICA)
    expect(linhas[0]).not.toContain('ana@casa.com')
  })

  it('erro de aplicação segue com a mensagem própria e sem log de erro', () => {
    expect(mensagemSegura(entradaInvalida('Informe o nome.'))).toBe('Informe o nome.')
    expect(linhas).toEqual([])
  })
})

describe('numa ação de servidor de verdade', () => {
  it('falha inesperada do banco chega à tela só como frase genérica com código', async () => {
    vi.spyOn(prisma.usuario, 'findUnique').mockRejectedValue(erroComRastro())
    const form = new FormData()
    form.set('email', 'quem@casa.com')
    form.set('senha', 'qualquer-senha-123')
    const estado = await acoes.autenticar({}, form)
    expect(estado.erro).toMatch(new RegExp(`^${MENSAGEM_GENERICA} Código: [0-9a-f]{12}$`))
    expect(JSON.stringify(estado)).not.toMatch(/ana\.silva|Unique|P2002|\/Users|stack/)
    expect(linhas.join('\n')).not.toMatch(/ana\.silva|quem@casa|qualquer-senha|\/Users|stack/)
    expect(linhas.some((l) => l.includes('erro.inesperado'))).toBe(true)
  })

  it('erro esperado (senha errada) não vira erro inesperado no log', async () => {
    const form = new FormData()
    form.set('email', 'ninguem@casa.com')
    form.set('senha', 'senha-que-nao-existe')
    const estado = await acoes.autenticar({}, form)
    expect(estado.erro).toBeTruthy()
    expect(linhas.some((l) => l.includes('erro.inesperado'))).toBe(false)
  })
})
