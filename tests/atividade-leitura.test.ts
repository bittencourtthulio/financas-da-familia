/**
 * A leitura da trilha: só o responsável (admin) lê, do mais recente para o
 * mais antigo, 50 por página (D-06, D-08).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { listarAtividade, POR_PAGINA } from '@/servicos/atividade'
import { criarAdmin, criarUsuario, limparBanco, familiaPadrao } from './ajuda'

beforeEach(limparBanco)

async function semear(quantidade: number) {
  const inicio = Date.UTC(2026, 0, 1)
  const fam = await familiaPadrao()
  await prisma.atividade.createMany({
    data: Array.from({ length: quantidade }, (_, i) => ({
      familiaId: fam,
      atorId: 'a',
      atorNome: 'Ator',
      acao: 'usuario.criado',
      entidade: 'usuario',
      entidadeId: `alvo-${i}`,
      detalhe: JSON.stringify({ alvoNome: `Alvo ${i}` }),
      criadoEm: new Date(inicio + i * 60_000),
    })),
  })
}

describe('quem pode ler', () => {
  it('usuário comum recebe 403 e não vê nada', async () => {
    await semear(3)
    const comum = await criarUsuario()
    await expect(listarAtividade(comum)).rejects.toMatchObject({ status: 403 })
  })

  it('admin lê', async () => {
    await semear(3)
    const admin = await criarAdmin()
    const r = await listarAtividade(admin)
    expect(r.total).toBe(3)
    expect(r.itens).toHaveLength(3)
  })
})

describe('paginação e ordem', () => {
  it('50 por página, do mais recente para o mais antigo', async () => {
    expect(POR_PAGINA).toBe(50)
    await semear(120)
    const admin = await criarAdmin()

    const p1 = await listarAtividade(admin, { pagina: 1 })
    const p3 = await listarAtividade(admin, { pagina: 3 })
    expect(p1.itens).toHaveLength(50)
    expect(p3.itens).toHaveLength(20)
    expect(p1).toMatchObject({ total: 120, paginas: 3, pagina: 1 })
    expect(p1.itens[0]!.entidadeId).toBe('alvo-119')
    expect(p3.itens.at(-1)!.entidadeId).toBe('alvo-0')

    const datas = p1.itens.map((i) => i.criadoEm.getTime())
    expect(datas).toEqual([...datas].sort((a, b) => b - a))
  })

  it('página fora do intervalo cai na última válida; lixo cai na primeira', async () => {
    await semear(120)
    const admin = await criarAdmin()
    expect((await listarAtividade(admin, { pagina: 99 })).pagina).toBe(3)
    expect((await listarAtividade(admin, { pagina: 0 })).pagina).toBe(1)
    expect((await listarAtividade(admin, { pagina: Number.NaN })).pagina).toBe(1)
  })

  it('sem registro: lista vazia e uma página', async () => {
    const admin = await criarAdmin()
    expect(await listarAtividade(admin)).toMatchObject({ itens: [], total: 0, pagina: 1, paginas: 1 })
  })
})

describe('o que volta', () => {
  it('o detalhe volta como objeto', async () => {
    await semear(1)
    const admin = await criarAdmin()
    const { itens } = await listarAtividade(admin)
    expect(itens[0]).toMatchObject({
      atorNome: 'Ator',
      acao: 'usuario.criado',
      detalhe: { alvoNome: 'Alvo 0' },
    })
  })

  it('detalhe corrompido no banco volta como objeto vazio, sem lançar', async () => {
    await prisma.atividade.create({
      data: { familiaId: await familiaPadrao(), atorId: 'a', atorNome: 'A', acao: 'usuario.criado', entidade: 'usuario', entidadeId: 'b', detalhe: '{não é json' },
    })
    await prisma.atividade.create({
      data: { familiaId: await familiaPadrao(), atorId: 'a', atorNome: 'A', acao: 'usuario.criado', entidade: 'usuario', entidadeId: 'c', detalhe: '[1,2]' },
    })
    const admin = await criarAdmin()
    const { itens } = await listarAtividade(admin)
    expect(itens.map((i) => i.detalhe)).toEqual([{}, {}])
  })
})
