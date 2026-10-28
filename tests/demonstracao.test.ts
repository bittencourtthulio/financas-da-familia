/**
 * A seed de demonstração (PR-04): responsável e adulto fictícios, nada de
 * entidade de domínio (isso nasce nas FT-03, FT-05 e FT-06), e nunca em
 * produção. O QA entra com estas contas.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { entrar } from '@/servicos/autenticacao'
import { DEMONSTRACAO, semearDemonstracao } from '../prisma/demonstracao'
import { limparBanco } from './ajuda'

beforeEach(limparBanco)

describe('semearDemonstracao', () => {
  it('cria o responsável e o adulto, e os dois entram com a senha de demonstração', async () => {
    await semearDemonstracao(prisma)

    for (const conta of DEMONSTRACAO) {
      const { usuario } = await entrar({ email: conta.email, senha: conta.senha })
      expect(usuario.papel).toBe(conta.papel)
      expect(usuario.nome).toBe(conta.nome)
    }
  })

  it('rodar duas vezes não duplica nem muda as contas', async () => {
    await semearDemonstracao(prisma)
    await semearDemonstracao(prisma)

    const usuarios = await prisma.usuario.findMany({ orderBy: { email: 'asc' } })
    expect(usuarios).toHaveLength(DEMONSTRACAO.length)
  })

  it('cria exatamente um responsável e um adulto, e nenhum outro papel', async () => {
    await semearDemonstracao(prisma)

    const papeis = (await prisma.usuario.findMany()).map((u) => u.papel).sort()
    expect(papeis).toEqual(['admin', 'usuario'])
  })

  it('usa e-mails fictícios do domínio reservado exemplo.local', () => {
    for (const conta of DEMONSTRACAO) {
      expect(conta.email.endsWith('@exemplo.local')).toBe(true)
    }
  })
})

describe('proteção contra produção', () => {
  const anterior = process.env.NODE_ENV
  afterEach(() => {
    Object.assign(process.env, { NODE_ENV: anterior })
  })

  it('recusa rodar em produção e não cria nada', async () => {
    Object.assign(process.env, { NODE_ENV: 'production' })

    await expect(semearDemonstracao(prisma)).rejects.toThrow(/produção/)
    expect(await prisma.usuario.count()).toBe(0)
  })
})
