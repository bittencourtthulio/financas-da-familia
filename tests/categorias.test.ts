/**
 * Categorias de lançamento (PR-27): pertencem a um tipo, nome único dentro do
 * tipo sem diferenciar maiúscula, criadas pelo responsável ou pelo adulto,
 * cada criação na trilha na mesma transação.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarCategoria, listarCategorias } from '@/servicos/lancamentos'
import { ErroDeAplicacao } from '@/lib/erros'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

const erroDe = async (promessa: Promise<unknown>): Promise<ErroDeAplicacao> => {
  try {
    await promessa
  } catch (e) {
    expect(e).toBeInstanceOf(ErroDeAplicacao)
    return e as ErroDeAplicacao
  }
  throw new Error('Era esperado um ErroDeAplicacao, mas nada foi lançado.')
}

describe('criarCategoria', () => {
  it('o responsável e o adulto criam, e a categoria nasce com o tipo e o nome aparado', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario({ papel: 'usuario' })

    const a = await criarCategoria(admin, { nome: '  Mercado ', tipo: 'despesa' })
    const b = await criarCategoria(adulto, { nome: 'Salário', tipo: 'receita' })

    expect(a).toMatchObject({ nome: 'Mercado', tipo: 'despesa' })
    expect(b).toMatchObject({ nome: 'Salário', tipo: 'receita' })
    expect(await prisma.categoria.count()).toBe(2)
  })

  it('grava a categoria e o registro da trilha juntos, com nome e tipo e nada mais', async () => {
    const adulto = await criarUsuario({ papel: 'usuario' })
    const categoria = await criarCategoria(adulto, { nome: 'Mercado', tipo: 'despesa' })

    const linhas = await prisma.atividade.findMany()
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({
      atorId: adulto.id,
      atorNome: adulto.nome,
      acao: 'categoria.criada',
      entidade: 'categoria',
      entidadeId: categoria.id,
    })
    expect(JSON.parse(linhas[0]?.detalhe as string)).toEqual({ alvoNome: 'Mercado', tipo: 'despesa' })
  })

  it('se o registro da trilha falha, a categoria não é criada', async () => {
    const admin = await criarAdmin()
    // Um autor sem nome faz o registro recusar; a transação desfaz a criação.
    await expect(
      criarCategoria({ ...admin, nome: '' }, { nome: 'Mercado', tipo: 'despesa' }),
    ).rejects.toBeInstanceOf(ErroDeAplicacao)
    expect(await prisma.categoria.count()).toBe(0)
    expect(await prisma.atividade.count()).toBe(0)
  })

  it.each([
    ['nome vazio', { nome: '', tipo: 'despesa' }],
    ['nome só de espaços', { nome: '   ', tipo: 'despesa' }],
    ['nome com mais de 40 caracteres', { nome: 'x'.repeat(41), tipo: 'despesa' }],
    ['tipo inválido', { nome: 'Mercado', tipo: 'transferencia' }],
    ['tipo ausente', { nome: 'Mercado' }],
    ['entrada que não é objeto', 'Mercado'],
    ['nome que não é texto', { nome: 12, tipo: 'despesa' }],
  ])('recusa %s com 422 e não grava nada', async (_nome, entrada) => {
    const admin = await criarAdmin()
    const erro = await erroDe(criarCategoria(admin, entrada))
    expect(erro.status).toBe(422)
    expect(await prisma.categoria.count()).toBe(0)
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('aceita o nome de exatamente 40 caracteres', async () => {
    const admin = await criarAdmin()
    await expect(
      criarCategoria(admin, { nome: 'x'.repeat(40), tipo: 'despesa' }),
    ).resolves.toMatchObject({ tipo: 'despesa' })
  })

  it('nome repetido no mesmo tipo é conflito, mesmo com outra caixa e espaços nas pontas', async () => {
    const admin = await criarAdmin()
    await criarCategoria(admin, { nome: 'Mercado', tipo: 'despesa' })
    for (const repetido of ['Mercado', 'mercado', ' MERCADO ', 'MercadO']) {
      const erro = await erroDe(criarCategoria(admin, { nome: repetido, tipo: 'despesa' }))
      expect(erro.status).toBe(409)
    }
    expect(await prisma.categoria.count()).toBe(1)
    expect(await prisma.atividade.count()).toBe(1)
  })

  it('o mesmo nome em outro tipo vale', async () => {
    const admin = await criarAdmin()
    await criarCategoria(admin, { nome: 'Outros', tipo: 'despesa' })
    await expect(criarCategoria(admin, { nome: 'Outros', tipo: 'receita' })).resolves.toMatchObject({
      tipo: 'receita',
    })
  })
})

describe('listarCategorias', () => {
  it('lista por nome, sem diferenciar maiúscula nem acento na ordem, e filtra por tipo', async () => {
    const admin = await criarAdmin()
    for (const [nome, tipo] of [
      ['Saúde', 'despesa'],
      ['mercado', 'despesa'],
      ['Água', 'despesa'],
      ['Salário', 'receita'],
    ] as const) {
      await criarCategoria(admin, { nome, tipo })
    }

    expect((await listarCategorias(admin)).map((c) => c.nome)).toEqual([
      'Água',
      'mercado',
      'Salário',
      'Saúde',
    ])
    expect((await listarCategorias(admin, { tipo: 'despesa' })).map((c) => c.nome)).toEqual([
      'Água',
      'mercado',
      'Saúde',
    ])
    expect((await listarCategorias(admin, { tipo: 'receita' })).map((c) => c.nome)).toEqual(['Salário'])
  })

  it('o adulto também lista; sem categoria devolve lista vazia', async () => {
    const adulto = await criarUsuario({ papel: 'usuario' })
    expect(await listarCategorias(adulto)).toEqual([])
  })
})
