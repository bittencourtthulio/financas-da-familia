/**
 * As entidades Categoria e Lancamento (PR-02, PR-26, PR-27). O banco do teste
 * é montado com as migrations reais, então este teste também prova que a
 * migration cria as tabelas e que o dinheiro é inteiro de verdade.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { ACOES, rotuloDaAcao } from '@/lib/atividade'
import { limparBanco, familiaPadrao } from './ajuda'

beforeEach(limparBanco)

const RAIZ = process.cwd()
// Sem os comentários: o esquema os usa para dizer "nunca Float".
const esquema = readFileSync(path.join(RAIZ, 'prisma/schema.prisma'), 'utf8').replace(/\/\/.*$/gm, '')

describe('tabelas de categorias e lançamentos', () => {
  it('guarda o lançamento com valor inteiro em centavos, dia como texto e a categoria', async () => {
    const categoria = await prisma.categoria.create({ data: { familiaId: await familiaPadrao(), nome: 'Mercado', tipo: 'despesa' } })
    const criado = await prisma.lancamento.create({
      data: { familiaId: await familiaPadrao(),
        tipo: 'despesa',
        valorCentavos: 123456,
        data: '2026-10-27',
        descricao: 'Compra do mês',
        categoriaId: categoria.id,
      },
    })

    const lido = await prisma.lancamento.findUniqueOrThrow({
      where: { id: criado.id },
      include: { categoria: true },
    })
    expect(lido).toMatchObject({
      tipo: 'despesa',
      valorCentavos: 123456,
      data: '2026-10-27',
      descricao: 'Compra do mês',
    })
    expect(Number.isInteger(lido.valorCentavos)).toBe(true)
    expect(lido.categoria.nome).toBe('Mercado')
    expect(lido.criadoEm).toBeInstanceOf(Date)
    expect(lido.atualizadoEm).toBeInstanceOf(Date)
  })

  it('no banco a coluna do valor é INTEGER, não ponto flutuante', async () => {
    const colunas = await prisma.$queryRawUnsafe<Array<{ name: string; type: string }>>(
      `SELECT column_name AS name, data_type AS type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lancamentos'`,
    )
    const valor = colunas.find((c) => c.name === 'valorCentavos')
    expect(valor?.type).toBe('integer')
    expect(colunas.map((c) => c.type)).not.toContain('double precision')
    expect(colunas.map((c) => c.type)).not.toContain('real')
    expect(colunas.map((c) => c.type)).not.toContain('numeric')
  })

  it('a descrição tem padrão vazio', async () => {
    const categoria = await prisma.categoria.create({ data: { familiaId: await familiaPadrao(), nome: 'Salário', tipo: 'receita' } })
    const criado = await prisma.lancamento.create({
      data: { familiaId: await familiaPadrao(), tipo: 'receita', valorCentavos: 500000, data: '2026-10-05', categoriaId: categoria.id },
    })
    expect(criado.descricao).toBe('')
  })

  it('o nome da categoria é único dentro do tipo, e repetido em outro tipo vale', async () => {
    await prisma.categoria.create({ data: { familiaId: await familiaPadrao(), nome: 'Outros', tipo: 'despesa' } })
    await expect(
      prisma.categoria.create({ data: { familiaId: await familiaPadrao(), nome: 'Outros', tipo: 'despesa' } }),
    ).rejects.toThrow()
    await expect(
      prisma.categoria.create({ data: { familiaId: await familiaPadrao(), nome: 'Outros', tipo: 'receita' } }),
    ).resolves.toMatchObject({ nome: 'Outros', tipo: 'receita' })
  })

  it('categoria com lançamento não pode ser apagada', async () => {
    const categoria = await prisma.categoria.create({ data: { familiaId: await familiaPadrao(), nome: 'Lazer', tipo: 'despesa' } })
    await prisma.lancamento.create({
      data: { familiaId: await familiaPadrao(), tipo: 'despesa', valorCentavos: 100, data: '2026-10-01', categoriaId: categoria.id },
    })
    await expect(prisma.categoria.delete({ where: { id: categoria.id } })).rejects.toThrow()
  })

  it('lançamento não aceita categoria que não existe', async () => {
    await expect(
      prisma.lancamento.create({
        data: { familiaId: await familiaPadrao(), tipo: 'despesa', valorCentavos: 100, data: '2026-10-01', categoriaId: 'nao-existe' },
      }),
    ).rejects.toThrow()
  })

  it('o lançamento não guarda quem o criou: isso é da trilha, sem chave para usuários', async () => {
    const chaves = await prisma.$queryRawUnsafe<Array<{ table: string }>>(
      `SELECT ccu.table_name AS "table" FROM information_schema.table_constraints tc JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.constraint_schema = tc.table_schema WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' AND tc.table_name = 'lancamentos'`,
    )
    // Categoria, família e recorrência (o mês de uma recorrência); nenhuma para usuários.
    expect(chaves.map((c) => c.table).sort()).toEqual(['categorias', 'familias', 'recorrencias'])
  })

  it('limparBanco esvazia lançamentos e categorias', async () => {
    const categoria = await prisma.categoria.create({ data: { familiaId: await familiaPadrao(), nome: 'Saúde', tipo: 'despesa' } })
    await prisma.lancamento.create({
      data: { familiaId: await familiaPadrao(), tipo: 'despesa', valorCentavos: 100, data: '2026-10-01', categoriaId: categoria.id },
    })
    await limparBanco()
    expect(await prisma.lancamento.count()).toBe(0)
    expect(await prisma.categoria.count()).toBe(0)
  })
})

describe('PR-02 no esquema', () => {
  const modelo = (nome: string) =>
    new RegExp(`model ${nome} \\{[\\s\\S]*?\\n\\}`).exec(esquema)?.[0] ?? ''

  it('nenhum modelo usa Float nem Decimal', () => {
    expect(esquema).not.toMatch(/\bFloat\b/)
    expect(esquema).not.toMatch(/\bDecimal\b/)
  })

  it('o valor do lançamento é Int em centavos', () => {
    expect(modelo('Lancamento')).toMatch(/valorCentavos\s+Int\b/)
  })

  it('a migration declara o valor como INTEGER e nada de REAL ou DECIMAL', () => {
    const pasta = readdirSync(path.join(RAIZ, 'prisma/migrations')).find((d) => d.endsWith('_postgres'))
    expect(pasta, 'migration *_postgres').toBeDefined()
    const sql = readFileSync(path.join(RAIZ, 'prisma/migrations', pasta as string, 'migration.sql'), 'utf8')
    expect(sql).toMatch(/"valorCentavos" INTEGER NOT NULL/)
    expect(sql).not.toMatch(/\bREAL\b|\bDECIMAL\b|\bNUMERIC\b|\bFLOAT\b|\bDOUBLE\b/i)
  })
})

describe('catálogo da trilha (FT-03)', () => {
  it.each([
    ['lancamento.criado', 'Criou o lançamento'],
    ['lancamento.alterado', 'Alterou o lançamento'],
    ['lancamento.apagado', 'Apagou o lançamento'],
    ['categoria.criada', 'Criou a categoria'],
  ])('a ação %s tem o rótulo "%s"', (codigo, rotulo) => {
    expect(ACOES[codigo]).toBe(rotulo)
    expect(rotuloDaAcao(codigo)).toBe(rotulo)
  })

  it('as ações de usuário continuam no catálogo', () => {
    expect(Object.keys(ACOES)).toEqual(
      expect.arrayContaining(['usuario.criado', 'usuario.papel_alterado', 'usuario.desativado']),
    )
  })
})
