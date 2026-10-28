/**
 * O serviço de mesada (FT-06, PR-32, PR-33): o responsável registra, edita e
 * apaga créditos e gastos de um filho em centavos inteiros, cada gravação leva
 * o rastro na mesma transação e sem valor, e o extrato vem do dia mais recente
 * para o mais antigo, 30 por página.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const falha = vi.hoisted(() => ({ ligada: false }))
vi.mock('@/servicos/atividade', async (original) => {
  const real = await original<typeof import('@/servicos/atividade')>()
  return {
    ...real,
    registrarAtividade: async (...args: Parameters<typeof real.registrarAtividade>) => {
      if (falha.ligada) throw new Error('falha simulada no rastro')
      return real.registrarAtividade(...args)
    },
  }
})

import {
  apagarMovimento,
  editarMovimento,
  extratoDoFilho,
  obterMovimento,
  POR_PAGINA_DE_MOVIMENTOS,
  registrarMovimento,
} from '@/servicos/mesada'
import { cadastrarFilho } from '@/servicos/filhos'
import { ErroDeAplicacao } from '@/lib/erros'
import { prisma } from '@/lib/prisma'
import { criarAdmin, limparBanco } from './ajuda'

beforeEach(async () => {
  falha.ligada = false
  await limparBanco()
})

const FILHO = { nome: 'Ana', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' }
const CREDITO = { tipo: 'credito', valor: '50,00', data: '2026-10-05', descricao: 'Mesada da semana' }
const GASTO = { tipo: 'gasto', valor: '12,30', data: '2026-10-06', descricao: 'Sorvete' }

async function cenario() {
  const admin = await criarAdmin()
  const filho = await cadastrarFilho(admin, FILHO)
  return { admin, filho }
}

async function erroDe(promessa: Promise<unknown>): Promise<ErroDeAplicacao> {
  try {
    await promessa
  } catch (e) {
    expect(e).toBeInstanceOf(ErroDeAplicacao)
    return e as ErroDeAplicacao
  }
  throw new Error('Era para lançar ErroDeAplicacao.')
}

describe('registrarMovimento', () => {
  it('grava um crédito em centavos inteiros e devolve o movimento e o saldo', async () => {
    const { admin, filho } = await cenario()
    const r = await registrarMovimento(admin, filho.id, CREDITO)
    expect(r.movimento).toMatchObject({
      filhoId: filho.id,
      tipo: 'credito',
      valorCentavos: 5000,
      data: '2026-10-05',
      descricao: 'Mesada da semana',
    })
    expect(r.saldoCentavos).toBe(5000)
    expect(await prisma.movimentoDeMesada.count()).toBe(1)
  })

  it('um gasto desconta do saldo, e o valor digitado em formato brasileiro vira centavos', async () => {
    const { admin, filho } = await cenario()
    await registrarMovimento(admin, filho.id, { ...CREDITO, valor: '1.234,56' })
    const r = await registrarMovimento(admin, filho.id, GASTO)
    expect(r.movimento.valorCentavos).toBe(1230)
    expect(r.saldoCentavos).toBe(123456 - 1230)
  })

  it('a descrição é opcional e vira texto vazio', async () => {
    const { admin, filho } = await cenario()
    const r = await registrarMovimento(admin, filho.id, { tipo: 'credito', valor: '5', data: '2026-10-05' })
    expect(r.movimento.descricao).toBe('')
    const r2 = await registrarMovimento(admin, filho.id, { tipo: 'credito', valor: '5', data: '2026-10-05', descricao: null })
    expect(r2.movimento.descricao).toBe('')
  })

  it('o gasto acima do saldo não é bloqueado: o saldo fica negativo (PR-32)', async () => {
    const { admin, filho } = await cenario()
    const r = await registrarMovimento(admin, filho.id, GASTO)
    expect(r.saldoCentavos).toBe(-1230)
  })

  it('aceita data futura e do ano 2100, como o lançamento (PR-26)', async () => {
    const { admin, filho } = await cenario()
    await registrarMovimento(admin, filho.id, { ...CREDITO, data: '2100-12-31' })
    await registrarMovimento(admin, filho.id, { ...CREDITO, data: '2000-01-01' })
    expect(await prisma.movimentoDeMesada.count()).toBe(2)
  })

  it.each([
    ['zero', { valor: '0,00' }],
    ['negativo', { valor: '-5,00' }],
    ['ponto decimal', { valor: '12.5' }],
    ['letras', { valor: 'abc' }],
    ['vazio', { valor: '' }],
    ['ausente', { valor: undefined }],
    ['notação científica', { valor: '1e3' }],
    ['acima de R$ 1.000.000,00', { valor: '1.000.000,01' }],
    ['tipo fora de crédito e gasto', { tipo: 'receita' }],
    ['tipo ausente', { tipo: undefined }],
    ['data impossível', { data: '2026-02-30' }],
    ['data em formato errado', { data: '05/10/2026' }],
    ['data antes de 2000', { data: '1999-12-31' }],
    ['data depois de 2100', { data: '2101-01-01' }],
    ['data ausente', { data: undefined }],
    ['descrição com mais de 200 caracteres', { descricao: 'x'.repeat(201) }],
  ])('recusa %s com 422 e não grava nada', async (_nome, troca) => {
    const { admin, filho } = await cenario()
    const antes = await prisma.atividade.count()
    const erro = await erroDe(registrarMovimento(admin, filho.id, { ...CREDITO, ...troca }))
    expect(erro.status).toBe(422)
    expect(await prisma.movimentoDeMesada.count()).toBe(0)
    expect(await prisma.atividade.count()).toBe(antes)
  })

  it('aceita o teto exato de R$ 1.000.000,00 e a descrição de exatamente 200 caracteres', async () => {
    const { admin, filho } = await cenario()
    const r = await registrarMovimento(admin, filho.id, { ...CREDITO, valor: '1.000.000,00', descricao: 'x'.repeat(200) })
    expect(r.movimento.valorCentavos).toBe(100_000_000)
  })

  it('filho que não existe devolve 404 e não grava', async () => {
    const { admin } = await cenario()
    const erro = await erroDe(registrarMovimento(admin, 'id-que-nao-existe', CREDITO))
    expect(erro.status).toBe(404)
    expect(await prisma.movimentoDeMesada.count()).toBe(0)
  })

  it('o rastro nasce na mesma transação: sem rastro, o movimento é desfeito', async () => {
    const { admin, filho } = await cenario()
    falha.ligada = true
    await expect(registrarMovimento(admin, filho.id, CREDITO)).rejects.toThrow('falha simulada')
    expect(await prisma.movimentoDeMesada.count()).toBe(0)
  })
})

describe('a trilha da mesada (PR-10, PR-25)', () => {
  it('registrar grava mesada.registrada com id do movimento, tipo, filho e nome, e nenhum valor', async () => {
    const { admin, filho } = await cenario()
    const antes = await prisma.atividade.count()
    const { movimento } = await registrarMovimento(admin, filho.id, { ...CREDITO, valor: '987,65' })
    const linhas = await prisma.atividade.findMany({ where: { acao: 'mesada.registrada' } })
    expect(await prisma.atividade.count()).toBe(antes + 1)
    expect(linhas).toHaveLength(1)
    const linha = linhas[0]!
    expect(linha).toMatchObject({ atorId: admin.id, atorNome: admin.nome, entidade: 'mesada', entidadeId: movimento.id })
    expect(JSON.parse(linha.detalhe ?? '{}')).toEqual({ alvoNome: 'Ana', filhoId: filho.id, tipo: 'credito' })
    const tudo = JSON.stringify(linha)
    // O detalhe é exatamente o esperado (acima); o texto livre nunca vai para a linha.
    expect(tudo).not.toContain('Mesada da semana')
    expect(linha.detalhe).not.toMatch(/valor|centavo|saldo|descricao/i)
  })

  it('editar e apagar também deixam rastro sem valor, saldo nem descrição', async () => {
    const { admin, filho } = await cenario()
    const { movimento } = await registrarMovimento(admin, filho.id, CREDITO)
    await editarMovimento(admin, movimento.id, { ...CREDITO, valor: '77,77', descricao: 'Texto secreto da edição' })
    await apagarMovimento(admin, movimento.id)
    const acoes = (await prisma.atividade.findMany({ orderBy: { criadoEm: 'asc' } }))
      .filter((l) => l.entidade === 'mesada')
    expect(acoes.map((l) => l.acao).sort()).toEqual(['mesada.alterada', 'mesada.apagada', 'mesada.registrada'])
    const tudo = JSON.stringify(acoes)
    for (const proibido of ['secreto', 'Mesada da semana']) expect(tudo).not.toContain(proibido)
    for (const l of acoes) {
      expect(l.entidadeId).toBe(movimento.id)
      expect(JSON.parse(l.detalhe ?? '{}')).toEqual({ alvoNome: 'Ana', filhoId: filho.id, tipo: 'credito' })
    }
  })
})

describe('editarMovimento', () => {
  it('muda tipo, valor, data e descrição, devolve o saldo novo e grava mesada.alterada', async () => {
    const { admin, filho } = await cenario()
    await registrarMovimento(admin, filho.id, CREDITO)
    const { movimento } = await registrarMovimento(admin, filho.id, GASTO)
    const r = await editarMovimento(admin, movimento.id, { tipo: 'credito', valor: '20,00', data: '2026-10-07', descricao: 'Troco' })
    expect(r.movimento).toMatchObject({ id: movimento.id, filhoId: filho.id, tipo: 'credito', valorCentavos: 2000, data: '2026-10-07', descricao: 'Troco' })
    expect(r.saldoCentavos).toBe(7000)
    expect(await prisma.atividade.count({ where: { acao: 'mesada.alterada' } })).toBe(1)
  })

  it('reenviar o que já está gravado não grava nem deixa rastro', async () => {
    const { admin, filho } = await cenario()
    const { movimento } = await registrarMovimento(admin, filho.id, CREDITO)
    const antes = await prisma.movimentoDeMesada.findUniqueOrThrow({ where: { id: movimento.id } })
    const r = await editarMovimento(admin, movimento.id, CREDITO)
    expect(r.movimento.valorCentavos).toBe(5000)
    expect(await prisma.atividade.count({ where: { acao: 'mesada.alterada' } })).toBe(0)
    const depois = await prisma.movimentoDeMesada.findUniqueOrThrow({ where: { id: movimento.id } })
    expect(depois.atualizadoEm.getTime()).toBe(antes.atualizadoEm.getTime())
  })

  it('o movimento nunca muda de filho', async () => {
    const { admin, filho } = await cenario()
    const outro = await cadastrarFilho(admin, { ...FILHO, nome: 'Bia' })
    const { movimento } = await registrarMovimento(admin, filho.id, CREDITO)
    await editarMovimento(admin, movimento.id, { ...CREDITO, filhoId: outro.id, valor: '1,00' })
    expect((await prisma.movimentoDeMesada.findUniqueOrThrow({ where: { id: movimento.id } })).filhoId).toBe(filho.id)
  })

  it('recusa entrada inválida com 422 e deixa o movimento como estava', async () => {
    const { admin, filho } = await cenario()
    const { movimento } = await registrarMovimento(admin, filho.id, CREDITO)
    const erro = await erroDe(editarMovimento(admin, movimento.id, { ...CREDITO, valor: 'abc' }))
    expect(erro.status).toBe(422)
    expect((await prisma.movimentoDeMesada.findUniqueOrThrow({ where: { id: movimento.id } })).valorCentavos).toBe(5000)
  })

  it('movimento que não existe devolve 404', async () => {
    const { admin } = await cenario()
    expect((await erroDe(editarMovimento(admin, 'id-que-nao-existe', CREDITO))).status).toBe(404)
  })

  it('falha no rastro desfaz a edição', async () => {
    const { admin, filho } = await cenario()
    const { movimento } = await registrarMovimento(admin, filho.id, CREDITO)
    falha.ligada = true
    await expect(editarMovimento(admin, movimento.id, { ...CREDITO, valor: '9,00' })).rejects.toThrow('falha simulada')
    expect((await prisma.movimentoDeMesada.findUniqueOrThrow({ where: { id: movimento.id } })).valorCentavos).toBe(5000)
  })
})

describe('apagarMovimento (definitivo, PR-33)', () => {
  it('remove a linha do banco, devolve o filho e o saldo novo e grava mesada.apagada', async () => {
    const { admin, filho } = await cenario()
    await registrarMovimento(admin, filho.id, CREDITO)
    const { movimento } = await registrarMovimento(admin, filho.id, GASTO)
    const r = await apagarMovimento(admin, movimento.id)
    expect(r).toEqual({ filhoId: filho.id, saldoCentavos: 5000 })
    expect(await prisma.movimentoDeMesada.findUnique({ where: { id: movimento.id } })).toBeNull()
    expect(await prisma.atividade.count({ where: { acao: 'mesada.apagada' } })).toBe(1)
  })

  it('apagar de novo, ou um id inexistente, devolve 404 e não deixa rastro', async () => {
    const { admin, filho } = await cenario()
    const { movimento } = await registrarMovimento(admin, filho.id, CREDITO)
    await apagarMovimento(admin, movimento.id)
    expect((await erroDe(apagarMovimento(admin, movimento.id))).status).toBe(404)
    expect((await erroDe(apagarMovimento(admin, 'id-que-nao-existe'))).status).toBe(404)
    expect(await prisma.atividade.count({ where: { acao: 'mesada.apagada' } })).toBe(1)
  })

  it('falha no rastro desfaz a exclusão', async () => {
    const { admin, filho } = await cenario()
    const { movimento } = await registrarMovimento(admin, filho.id, CREDITO)
    falha.ligada = true
    await expect(apagarMovimento(admin, movimento.id)).rejects.toThrow('falha simulada')
    expect(await prisma.movimentoDeMesada.count()).toBe(1)
  })

  it('só apaga o movimento pedido, nunca o de outro filho', async () => {
    const { admin, filho } = await cenario()
    const bia = await cadastrarFilho(admin, { ...FILHO, nome: 'Bia' })
    const { movimento } = await registrarMovimento(admin, filho.id, CREDITO)
    await registrarMovimento(admin, bia.id, CREDITO)
    await apagarMovimento(admin, movimento.id)
    const restantes = await prisma.movimentoDeMesada.findMany()
    expect(restantes.map((m) => m.filhoId)).toEqual([bia.id])
  })
})

describe('obterMovimento', () => {
  it('devolve o movimento com o filho a que pertence', async () => {
    const { admin, filho } = await cenario()
    const { movimento } = await registrarMovimento(admin, filho.id, CREDITO)
    const lido = await obterMovimento(admin, movimento.id)
    expect(lido).toMatchObject({ id: movimento.id, filhoId: filho.id, valorCentavos: 5000, filhoNome: 'Ana' })
  })

  it('id inexistente devolve 404', async () => {
    const { admin } = await cenario()
    expect((await erroDe(obterMovimento(admin, 'id-que-nao-existe'))).status).toBe(404)
  })
})

describe('extratoDoFilho', () => {
  it('sem movimento, o extrato é vazio e o saldo é zero', async () => {
    const { admin, filho } = await cenario()
    const e = await extratoDoFilho(admin, filho.id)
    expect(e).toMatchObject({ saldoCentavos: 0, creditosCentavos: 0, gastosCentavos: 0, total: 0, pagina: 1, paginas: 1, itens: [] })
    expect(e.filho).toMatchObject({ id: filho.id, nome: 'Ana', mesadaCentavos: 5000, periodicidade: 'semanal' })
  })

  it('lista do dia mais recente para o mais antigo; no mesmo dia, o lançado por último primeiro', async () => {
    const { admin, filho } = await cenario()
    const a = await registrarMovimento(admin, filho.id, { ...CREDITO, data: '2026-10-01', descricao: 'a' })
    const b = await registrarMovimento(admin, filho.id, { ...CREDITO, data: '2026-10-09', descricao: 'b' })
    const c = await registrarMovimento(admin, filho.id, { ...GASTO, data: '2026-10-09', descricao: 'c' })
    const d = await registrarMovimento(admin, filho.id, { ...GASTO, data: '2026-10-05', descricao: 'd' })
    const e = await extratoDoFilho(admin, filho.id)
    expect(e.itens.map((m) => m.id)).toEqual([c.movimento.id, b.movimento.id, d.movimento.id, a.movimento.id])
  })

  it('traz totais de créditos e de gastos e o saldo, só do filho pedido', async () => {
    const { admin, filho } = await cenario()
    const bia = await cadastrarFilho(admin, { ...FILHO, nome: 'Bia' })
    await registrarMovimento(admin, filho.id, CREDITO)
    await registrarMovimento(admin, filho.id, GASTO)
    await registrarMovimento(admin, bia.id, { ...CREDITO, valor: '999,00' })
    const e = await extratoDoFilho(admin, filho.id)
    expect(e).toMatchObject({ creditosCentavos: 5000, gastosCentavos: 1230, saldoCentavos: 3770, total: 2 })
    expect(e.itens.every((m) => m.filhoId === filho.id)).toBe(true)
  })

  it(`pagina de ${POR_PAGINA_DE_MOVIMENTOS} em ${POR_PAGINA_DE_MOVIMENTOS}, sem repetir nem perder movimento`, async () => {
    const { admin, filho } = await cenario()
    const total = POR_PAGINA_DE_MOVIMENTOS * 2 + 5
    for (let i = 0; i < total; i += 1) {
      const dia = String((i % 28) + 1).padStart(2, '0')
      await registrarMovimento(admin, filho.id, { tipo: 'credito', valor: '1,00', data: `2026-09-${dia}`, descricao: `n${i}` })
    }
    const p1 = await extratoDoFilho(admin, filho.id, { pagina: 1 })
    const p2 = await extratoDoFilho(admin, filho.id, { pagina: 2 })
    const p3 = await extratoDoFilho(admin, filho.id, { pagina: 3 })
    expect([p1.itens.length, p2.itens.length, p3.itens.length]).toEqual([POR_PAGINA_DE_MOVIMENTOS, POR_PAGINA_DE_MOVIMENTOS, 5])
    expect(p1).toMatchObject({ total, paginas: 3, pagina: 1 })
    const ids = [...p1.itens, ...p2.itens, ...p3.itens].map((m) => m.id)
    expect(new Set(ids).size).toBe(total)
    expect(p3.saldoCentavos).toBe(total * 100)
  })

  it('página fora do intervalo, negativa ou não inteira cai na primeira ou na última', async () => {
    const { admin, filho } = await cenario()
    for (let i = 0; i < POR_PAGINA_DE_MOVIMENTOS + 1; i += 1) {
      await registrarMovimento(admin, filho.id, { ...CREDITO, valor: '1,00' })
    }
    expect((await extratoDoFilho(admin, filho.id, { pagina: 99 })).pagina).toBe(2)
    expect((await extratoDoFilho(admin, filho.id, { pagina: 0 })).pagina).toBe(1)
    expect((await extratoDoFilho(admin, filho.id, { pagina: -3 })).pagina).toBe(1)
    expect((await extratoDoFilho(admin, filho.id, { pagina: 1.5 })).pagina).toBe(1)
    expect((await extratoDoFilho(admin, filho.id, { pagina: Number.NaN })).pagina).toBe(1)
  })

  it('filho inexistente devolve 404', async () => {
    const { admin } = await cenario()
    expect((await erroDe(extratoDoFilho(admin, 'id-que-nao-existe'))).status).toBe(404)
  })
})

describe('PR-02 no serviço de mesada', () => {
  it('o arquivo não usa parseFloat, Number(, toFixed nem arredondamento de valor', async () => {
    const { readFileSync } = await import('node:fs')
    const codigo = readFileSync('src/servicos/mesada.ts', 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
    expect(codigo).not.toMatch(/parseFloat|Number\(|toFixed|Math\.(round|floor|trunc)|\bFloat\b|\bDecimal\b/)
  })
})
