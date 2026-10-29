/**
 * A entidade MovimentoDeMesada (PR-02, PR-32, PR-33): a migration real cria a
 * tabela, o valor é inteiro em centavos, o movimento pertence a um filho por
 * chave estrangeira com Cascade (a FT-07 apaga e exporta por filho), e a trilha
 * conhece as três ações novas sem nenhum valor.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { ACOES, descreverAtividade, rotuloDaAcao, rotuloDoTipo } from '@/lib/atividade'
import { limparBanco, familiaPadrao } from './ajuda'

beforeEach(limparBanco)

const esquema = readFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), 'utf8').replace(/\/\/.*$/gm, '')

async function criarFilho(nome = 'Ana') {
  return prisma.filho.create({ data: { familiaId: await familiaPadrao(), nome, mesadaCentavos: 5000, periodicidade: 'semanal' } })
}

describe('tabela de movimentos de mesada', () => {
  it('guarda filho, tipo, valor em centavos inteiros, data civil e descrição', async () => {
    const filho = await criarFilho()
    const criado = await prisma.movimentoDeMesada.create({
      data: { familiaId: await familiaPadrao(), filhoId: filho.id, tipo: 'credito', valorCentavos: 12345, data: '2026-10-05', descricao: 'Mesada da semana' },
    })
    const lido = await prisma.movimentoDeMesada.findUniqueOrThrow({ where: { id: criado.id } })
    expect(lido).toMatchObject({
      filhoId: filho.id,
      tipo: 'credito',
      valorCentavos: 12345,
      data: '2026-10-05',
      descricao: 'Mesada da semana',
    })
    expect(Number.isInteger(lido.valorCentavos)).toBe(true)
    expect(lido.criadoEm).toBeInstanceOf(Date)
  })

  it('a descrição tem padrão vazio', async () => {
    const filho = await criarFilho()
    const criado = await prisma.movimentoDeMesada.create({
      data: { familiaId: await familiaPadrao(), filhoId: filho.id, tipo: 'gasto', valorCentavos: 100, data: '2026-10-05' },
    })
    expect(criado.descricao).toBe('')
  })

  it('no banco a coluna do valor é INTEGER, sem ponto flutuante, e o esquema não tem Float nem Decimal', async () => {
    const colunas = await prisma.$queryRawUnsafe<Array<{ name: string; type: string }>>(
      `SELECT column_name AS name, data_type AS type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'movimentos_de_mesada'`,
    )
    expect(colunas.find((c) => c.name === 'valorCentavos')?.type).toBe('integer')
    expect(colunas.map((c) => c.type)).not.toContain('double precision')
    expect(colunas.map((c) => c.type)).not.toContain('real')
    expect(colunas.map((c) => c.type)).not.toContain('numeric')
    expect(esquema).not.toMatch(/\b(Float|Decimal)\b/)
    const migration = readFileSync(
      path.join(process.cwd(), 'prisma/migrations/20261029200000_postgres/migration.sql'),
      'utf8',
    )
    expect(migration).toMatch(/"valorCentavos" INTEGER NOT NULL/)
  })

  it('a tabela não guarda saldo: o saldo é sempre calculado do extrato', async () => {
    const colunas = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
      `SELECT column_name AS name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'movimentos_de_mesada'`,
    )
    expect(colunas.map((c) => c.name).sort()).toEqual(
      ['atualizadoEm', 'criadoEm', 'data', 'descricao', 'familiaId', 'filhoId', 'id', 'tipo', 'valorCentavos'].sort(),
    )
  })

  it('tem índice por filho e data, para o extrato e a exportação por filho', async () => {
    const indices = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
      `SELECT indexname AS name FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'movimentos_de_mesada'`,
    )
    expect(indices.map((i) => i.name)).toContain('movimentos_de_mesada_filhoId_data_idx')
  })

  it('movimento de filho que não existe é recusado pela chave estrangeira', async () => {
    await expect(
      prisma.movimentoDeMesada.create({
        data: { familiaId: await familiaPadrao(), filhoId: 'nao-existe', tipo: 'credito', valorCentavos: 100, data: '2026-10-05' },
      }),
    ).rejects.toThrow()
  })

  it('PR-33: apagar o filho leva os movimentos dele (Cascade) e não os do irmão', async () => {
    const ana = await criarFilho('Ana')
    const bia = await criarFilho('Bia')
    for (const f of [ana, bia, ana]) {
      await prisma.movimentoDeMesada.create({
        data: { familiaId: await familiaPadrao(), filhoId: f.id, tipo: 'credito', valorCentavos: 100, data: '2026-10-05' },
      })
    }
    await prisma.filho.delete({ where: { id: ana.id } })
    const restantes = await prisma.movimentoDeMesada.findMany()
    expect(restantes).toHaveLength(1)
    expect(restantes[0]?.filhoId).toBe(bia.id)
  })

  it('limparBanco esvazia os movimentos', async () => {
    const filho = await criarFilho()
    await prisma.movimentoDeMesada.create({
      data: { familiaId: await familiaPadrao(), filhoId: filho.id, tipo: 'credito', valorCentavos: 100, data: '2026-10-05' },
    })
    await limparBanco()
    expect(await prisma.movimentoDeMesada.count()).toBe(0)
  })
})

describe('ações de mesada no catálogo da trilha (PR-10)', () => {
  it.each([
    ['mesada.registrada', 'Registrou movimento de mesada de'],
    ['mesada.alterada', 'Alterou movimento de mesada de'],
    ['mesada.apagada', 'Apagou movimento de mesada de'],
  ])('%s tem rótulo em português', (codigo, rotulo) => {
    expect(codigo in ACOES).toBe(true)
    expect(rotuloDaAcao(codigo)).toBe(rotulo)
  })

  it('a descrição traz o nome do filho e o tipo em português, sem nenhum valor', () => {
    const base = { atorNome: 'Responsável', criadoEm: new Date('2026-10-28T15:00:00Z') }
    const credito = descreverAtividade({
      ...base,
      acao: 'mesada.registrada',
      detalhe: { alvoNome: 'Ana', filhoId: 'f1', tipo: 'credito' },
    })
    expect(credito.acao).toBe('Registrou movimento de mesada de Ana')
    expect(credito.detalhe).toBe('Crédito')
    const gasto = descreverAtividade({
      ...base,
      acao: 'mesada.apagada',
      detalhe: { alvoNome: 'Ana', filhoId: 'f1', tipo: 'gasto' },
    })
    expect(gasto.acao).toBe('Apagou movimento de mesada de Ana')
    expect(gasto.detalhe).toBe('Gasto')
    expect(JSON.stringify([credito, gasto])).not.toMatch(/R\$|\d,\d\d/)
  })

  it('o rótulo do tipo traduz crédito e gasto e devolve o desconhecido como veio', () => {
    expect(rotuloDoTipo('credito')).toBe('Crédito')
    expect(rotuloDoTipo('gasto')).toBe('Gasto')
    expect(rotuloDoTipo('receita')).toBe('Receita')
    expect(rotuloDoTipo('xyz')).toBe('xyz')
  })
})
