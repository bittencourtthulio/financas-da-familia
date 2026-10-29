/**
 * A demonstração com a privacidade (FT-07, PR-04): a seed continua idempotente,
 * a exportação dos dados semeados é válida e sem segredo, e apagar um filho de
 * demonstração deixa a seed rodar de novo sem erro.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { exportarDadosDaFamilia, excluirFilho } from '@/servicos/privacidade'
import { camposProibidosEm } from '@/lib/privacidade'
import { entrar, reiniciarLimiteDeLogin } from '@/servicos/autenticacao'
import { DEMONSTRACAO, DEMONSTRACAO_FILHOS, semearDemonstracao } from '../prisma/demonstracao'
import { limparBanco } from './ajuda'

beforeEach(async () => {
  await limparBanco()
  reiniciarLimiteDeLogin()
})

async function responsavel() {
  const admin = await prisma.usuario.findUniqueOrThrow({ where: { email: 'responsavel@exemplo.local' } })
  return { id: admin.id, nome: admin.nome, email: admin.email, papel: admin.papel, familiaId: admin.familiaId }
}

describe('a exportação dos dados de demonstração', () => {
  it('traz os usuários, os filhos com o saldo e os movimentos, sem hash nem segredo', async () => {
    await semearDemonstracao(prisma)
    await semearDemonstracao(prisma)
    const { conteudo } = await exportarDadosDaFamilia(await responsavel())
    const doc = JSON.parse(conteudo)

    expect(doc.usuarios).toHaveLength(DEMONSTRACAO.length + DEMONSTRACAO_FILHOS.length)
    expect(doc.filhos.map((f: { nome: string }) => f.nome).sort()).toEqual(['Ana', 'Pedro'])
    const saldo = (nome: string) => doc.filhos.find((f: { nome: string }) => f.nome === nome).saldo_centavos
    expect(saldo('Ana')).toBeGreaterThan(0)
    expect(saldo('Pedro')).toBeLessThan(0)
    expect(doc.movimentos_de_mesada.length).toBeGreaterThanOrEqual(10)
    expect(doc.lancamentos.length).toBeGreaterThan(0)
    expect(camposProibidosEm(doc)).toEqual([])
    const hashes = (await prisma.usuario.findMany({ select: { senhaHash: true } })).map((u) => u.senhaHash)
    for (const hash of hashes) expect(conteudo).not.toContain(hash)
    expect(conteudo).not.toContain('demo1234')
  })
})

describe('a seed depois da exclusão de um filho de demonstração', () => {
  it('apaga a Ana, e rodar a seed de novo funciona e não duplica nada', async () => {
    await semearDemonstracao(prisma)
    const admin = await responsavel()
    const ana = await prisma.filho.findFirstOrThrow({ where: { nome: 'Ana' } })
    await excluirFilho(admin, ana.id, { confirmacao: 'Ana' })
    await expect(entrar({ email: 'ana@exemplo.local', senha: 'demo1234' })).rejects.toMatchObject({ status: 401 })

    await expect(semearDemonstracao(prisma)).resolves.toBeUndefined()
    await semearDemonstracao(prisma)
    expect(await prisma.filho.count()).toBe(2)
    expect(await prisma.usuario.count()).toBe(DEMONSTRACAO.length + DEMONSTRACAO_FILHOS.length)
  })

  it('continua barrada em produção', async () => {
    const antes = process.env.NODE_ENV
    Object.assign(process.env, { NODE_ENV: 'production' })
    try {
      await expect(semearDemonstracao(prisma)).rejects.toThrow(/não roda em produção/)
    } finally {
      Object.assign(process.env, { NODE_ENV: antes })
    }
    expect(await prisma.usuario.count()).toBe(0)
  })
})

describe('o README', () => {
  it('descreve a privacidade: o download, o apagar e a rota', async () => {
    const { readFileSync } = await import('node:fs')
    const readme = readFileSync('README.md', 'utf8')
    expect(readme).toContain('FT-07')
    expect(readme).toContain('**Privacidade**')
    expect(readme).toContain('/privacidade')
    expect(readme).toContain('/api/privacidade/exportar')
    expect(readme).toMatch(/filho removido/)
  })
})
