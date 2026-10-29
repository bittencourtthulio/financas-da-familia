/**
 * O resumo do mês (FT-04, PR-29): receitas, despesas, saldo e despesas por
 * categoria, somados no servidor em centavos inteiros (PR-02), só do mês
 * escolhido. Os casos de borda são os que quebrariam uma soma ingênua:
 * ponto flutuante, primeiro e último dia, virada de ano e fuso.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { resumoDoMes } from '@/servicos/resumo'
import { criarAdmin, criarCategoriaNoBanco, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

async function lancar(
  categoriaId: string,
  tipo: 'receita' | 'despesa',
  valorCentavos: number,
  data: string,
) {
  return prisma.lancamento.create({ data: { tipo, valorCentavos, data, categoriaId } })
}

const AGORA = new Date('2026-10-28T15:00:00Z')

describe('resumoDoMes: totais e saldo', () => {
  it('soma receitas e despesas do mês e calcula o saldo por subtração de inteiros', async () => {
    const admin = await criarAdmin()
    const salario = await criarCategoriaNoBanco('receita', 'Salário')
    const mercado = await criarCategoriaNoBanco('despesa', 'Mercado')
    await lancar(salario.id, 'receita', 520000, '2026-10-05')
    await lancar(salario.id, 'receita', 35000, '2026-10-12')
    await lancar(mercado.id, 'despesa', 64235, '2026-10-09')

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    expect(r.mes).toBe('2026-10')
    expect(r.receitasCentavos).toBe(555000)
    expect(r.despesasCentavos).toBe(64235)
    expect(r.saldoCentavos).toBe(490765)
    expect(r.quantidadeDeLancamentos).toBe(3)
  })

  it('0,10 + 0,20 dá exatamente 0,30: a soma é de centavos inteiros', async () => {
    const admin = await criarAdmin()
    const lazer = await criarCategoriaNoBanco('despesa', 'Lazer')
    const extra = await criarCategoriaNoBanco('receita', 'Extra')
    await lancar(lazer.id, 'despesa', 10, '2026-10-03')
    await lancar(lazer.id, 'despesa', 20, '2026-10-04')
    await lancar(extra.id, 'receita', 10, '2026-10-03')
    await lancar(extra.id, 'receita', 20, '2026-10-04')

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    expect(r.despesasCentavos).toBe(30)
    expect(r.receitasCentavos).toBe(30)
    expect(r.saldoCentavos).toBe(0)
    // Em ponto flutuante 0.1 + 0.2 seria 0.30000000000000004.
    expect(0.1 + 0.2).not.toBe(0.3)
  })

  it('soma muitos valores que em ponto flutuante acumulariam erro, sem perder centavo', async () => {
    const admin = await criarAdmin()
    const c = await criarCategoriaNoBanco('despesa', 'Miudezas')
    await prisma.lancamento.createMany({
      data: Array.from({ length: 100 }, () => ({
        tipo: 'despesa',
        valorCentavos: 10,
        data: '2026-10-10',
        categoriaId: c.id,
      })),
    })

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    expect(r.despesasCentavos).toBe(1000)
    expect(r.despesasPorCategoria[0]?.quantidade).toBe(100)
  })

  it('valores no teto de R$ 1.000.000,00 somam sem perder centavo', async () => {
    const admin = await criarAdmin()
    const r1 = await criarCategoriaNoBanco('receita', 'Herança')
    await lancar(r1.id, 'receita', 100000000, '2026-10-01')
    await lancar(r1.id, 'receita', 100000000, '2026-10-02')
    await lancar(r1.id, 'receita', 1, '2026-10-03')

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    expect(r.receitasCentavos).toBe(200000001)
    expect(r.saldoCentavos).toBe(200000001)
  })

  it('o saldo pode ser negativo quando a despesa passa da receita', async () => {
    const admin = await criarAdmin()
    const s = await criarCategoriaNoBanco('receita', 'Salário')
    const m = await criarCategoriaNoBanco('despesa', 'Moradia')
    await lancar(s.id, 'receita', 100000, '2026-10-05')
    await lancar(m.id, 'despesa', 180000, '2026-10-06')

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    expect(r.saldoCentavos).toBe(-80000)
  })

  it('todo número devolvido é inteiro', async () => {
    const admin = await criarAdmin()
    const m = await criarCategoriaNoBanco('despesa', 'Mercado')
    const s = await criarCategoriaNoBanco('receita', 'Salário')
    await lancar(m.id, 'despesa', 3333, '2026-10-05')
    await lancar(s.id, 'receita', 9999, '2026-10-05')

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    for (const n of [
      r.receitasCentavos,
      r.despesasCentavos,
      r.saldoCentavos,
      r.quantidadeDeLancamentos,
      ...r.despesasPorCategoria.flatMap((c) => [c.totalCentavos, c.quantidade]),
    ]) {
      expect(Number.isInteger(n)).toBe(true)
    }
  })
})

describe('resumoDoMes: só o mês escolhido', () => {
  it('primeiro e último dia entram; o dia anterior e o seguinte ficam fora', async () => {
    const admin = await criarAdmin()
    const d = await criarCategoriaNoBanco('despesa', 'Mercado')
    await lancar(d.id, 'despesa', 1, '2026-09-30')
    await lancar(d.id, 'despesa', 10, '2026-10-01')
    await lancar(d.id, 'despesa', 100, '2026-10-31')
    await lancar(d.id, 'despesa', 1000, '2026-11-01')

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    expect(r.despesasCentavos).toBe(110)
    expect(r.quantidadeDeLancamentos).toBe(2)
  })

  it('dezembro e janeiro não se misturam na virada de ano', async () => {
    const admin = await criarAdmin()
    const d = await criarCategoriaNoBanco('despesa', 'Presentes')
    await lancar(d.id, 'despesa', 5, '2025-12-31')
    await lancar(d.id, 'despesa', 70, '2026-01-01')
    await lancar(d.id, 'despesa', 900, '2026-01-31')
    await lancar(d.id, 'despesa', 4000, '2026-02-01')

    const dezembro = await resumoDoMes(admin, { mes: '2025-12' }, AGORA)
    const janeiro = await resumoDoMes(admin, { mes: '2026-01' }, AGORA)

    expect(dezembro.despesasCentavos).toBe(5)
    expect(janeiro.despesasCentavos).toBe(970)
  })

  it('fevereiro de ano bissexto vai até o dia 29', async () => {
    const admin = await criarAdmin()
    const d = await criarCategoriaNoBanco('despesa', 'Mercado')
    await lancar(d.id, 'despesa', 7, '2024-02-29')
    await lancar(d.id, 'despesa', 100, '2024-03-01')

    const r = await resumoDoMes(admin, { mes: '2024-02' }, AGORA)

    expect(r.despesasCentavos).toBe(7)
  })

  it('o saldo não carrega o mês anterior (PR-29): só o mês pedido conta', async () => {
    const admin = await criarAdmin()
    const s = await criarCategoriaNoBanco('receita', 'Salário')
    await lancar(s.id, 'receita', 500000, '2026-09-05')

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    expect(r.saldoCentavos).toBe(0)
    expect(r.receitasCentavos).toBe(0)
  })

  it('reflete a edição e a exclusão: lançamento apagado não entra na soma (PR-28)', async () => {
    const admin = await criarAdmin()
    const d = await criarCategoriaNoBanco('despesa', 'Mercado')
    const a = await lancar(d.id, 'despesa', 1000, '2026-10-05')
    await lancar(d.id, 'despesa', 500, '2026-10-06')

    await prisma.lancamento.delete({ where: { id: a.id } })
    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    expect(r.despesasCentavos).toBe(500)
  })
})

describe('resumoDoMes: mês escolhido e relógio', () => {
  it('sem mês usa o mês corrente de São Paulo', async () => {
    const admin = await criarAdmin()
    const d = await criarCategoriaNoBanco('despesa', 'Mercado')
    await lancar(d.id, 'despesa', 2500, '2026-10-20')

    const r = await resumoDoMes(admin, {}, AGORA)

    expect(r.mes).toBe('2026-10')
    expect(r.despesasCentavos).toBe(2500)
  })

  it('às 23h30 de 31/10 em São Paulo (02:30Z de 01/11) ainda é outubro', async () => {
    const admin = await criarAdmin()
    const d = await criarCategoriaNoBanco('despesa', 'Mercado')
    await lancar(d.id, 'despesa', 100, '2026-10-31')
    await lancar(d.id, 'despesa', 7, '2026-11-01')

    const r = await resumoDoMes(admin, undefined, new Date('2026-11-01T02:30:00Z'))

    expect(r.mes).toBe('2026-10')
    expect(r.despesasCentavos).toBe(100)
  })

  it('às 00h30 de 01/11 em São Paulo (03:30Z) já é novembro', async () => {
    const admin = await criarAdmin()
    const r = await resumoDoMes(admin, {}, new Date('2026-11-01T03:30:00Z'))
    expect(r.mes).toBe('2026-11')
  })

  it('na virada do ano o mês corrente é janeiro só depois da meia-noite de São Paulo', async () => {
    const admin = await criarAdmin()
    const antes = await resumoDoMes(admin, {}, new Date('2027-01-01T02:59:00Z'))
    const depois = await resumoDoMes(admin, {}, new Date('2027-01-01T03:00:00Z'))
    expect(antes.mes).toBe('2026-12')
    expect(depois.mes).toBe('2027-01')
  })

  it.each([
    ['vazio', ''],
    ['sem zero à esquerda', '2026-1'],
    ['mês 13', '2026-13'],
    ['mês zero', '2026-00'],
    ['texto', 'abc'],
    ['data inteira', '2026-10-05'],
    ['ano antes do limite', '1999-12'],
    ['ano depois do limite', '2101-01'],
    ['lista de dois valores', ['2026-09', '2026-08']],
    ['número', 202609],
    ['nulo', null],
    ['objeto', { mes: '2026-09' }],
  ])('mês inválido (%s) cai no mês corrente, sem erro', async (_rotulo, mes) => {
    const admin = await criarAdmin()

    const r = await resumoDoMes(admin, { mes }, AGORA)

    expect(r.mes).toBe('2026-10')
  })

  it('consulta que nem é objeto também cai no mês corrente', async () => {
    const admin = await criarAdmin()
    for (const consulta of [null, undefined, 'x', 42, []]) {
      const r = await resumoDoMes(admin, consulta, AGORA)
      expect(r.mes).toBe('2026-10')
    }
  })

  it('aceita meses passados e futuros válidos', async () => {
    const admin = await criarAdmin()
    expect((await resumoDoMes(admin, { mes: '2000-01' }, AGORA)).mes).toBe('2000-01')
    expect((await resumoDoMes(admin, { mes: '2100-12' }, AGORA)).mes).toBe('2100-12')
    expect((await resumoDoMes(admin, { mes: '2026-11' }, AGORA)).mes).toBe('2026-11')
  })
})

describe('resumoDoMes: despesas por categoria', () => {
  it('soma por categoria, da maior para a menor, só com despesa e só do mês', async () => {
    const admin = await criarAdmin()
    const mercado = await criarCategoriaNoBanco('despesa', 'Mercado')
    const moradia = await criarCategoriaNoBanco('despesa', 'Moradia')
    const lazer = await criarCategoriaNoBanco('despesa', 'Lazer')
    const vazia = await criarCategoriaNoBanco('despesa', 'Sem uso')
    const salario = await criarCategoriaNoBanco('receita', 'Salário')
    await lancar(mercado.id, 'despesa', 3000, '2026-10-02')
    await lancar(mercado.id, 'despesa', 4500, '2026-10-20')
    await lancar(moradia.id, 'despesa', 180000, '2026-10-06')
    await lancar(lazer.id, 'despesa', 999, '2026-10-18')
    await lancar(lazer.id, 'despesa', 111111, '2026-09-18')
    await lancar(salario.id, 'receita', 520000, '2026-10-05')

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    expect(r.despesasPorCategoria).toEqual([
      { categoriaId: moradia.id, nome: 'Moradia', totalCentavos: 180000, quantidade: 1 },
      { categoriaId: mercado.id, nome: 'Mercado', totalCentavos: 7500, quantidade: 2 },
      { categoriaId: lazer.id, nome: 'Lazer', totalCentavos: 999, quantidade: 1 },
    ])
    expect(r.despesasPorCategoria.map((c) => c.categoriaId)).not.toContain(vazia.id)
    expect(r.despesasPorCategoria.map((c) => c.nome)).not.toContain('Salário')
  })

  it('a soma das categorias é igual ao total de despesas', async () => {
    const admin = await criarAdmin()
    const a = await criarCategoriaNoBanco('despesa', 'A')
    const b = await criarCategoriaNoBanco('despesa', 'B')
    await lancar(a.id, 'despesa', 33, '2026-10-02')
    await lancar(b.id, 'despesa', 66, '2026-10-03')
    await lancar(b.id, 'despesa', 1, '2026-10-04')

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    const soma = r.despesasPorCategoria.reduce((t, c) => t + c.totalCentavos, 0)
    expect(soma).toBe(r.despesasCentavos)
    expect(r.despesasCentavos).toBe(100)
  })

  it('empate de soma desempata pelo nome', async () => {
    const admin = await criarAdmin()
    const zebra = await criarCategoriaNoBanco('despesa', 'Zebra')
    const abacate = await criarCategoriaNoBanco('despesa', 'Abacate')
    await lancar(zebra.id, 'despesa', 500, '2026-10-02')
    await lancar(abacate.id, 'despesa', 500, '2026-10-03')

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    expect(r.despesasPorCategoria.map((c) => c.nome)).toEqual(['Abacate', 'Zebra'])
  })

  it('o mesmo nome em receita e despesa não mistura as somas', async () => {
    const admin = await criarAdmin()
    const pet = await criarCategoriaNoBanco('despesa', 'Pet')
    const petReceita = await criarCategoriaNoBanco('receita', 'Pet')
    await lancar(pet.id, 'despesa', 800, '2026-10-02')
    await lancar(petReceita.id, 'receita', 5000, '2026-10-03')

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    expect(r.despesasPorCategoria).toEqual([
      { categoriaId: pet.id, nome: 'Pet', totalCentavos: 800, quantidade: 1 },
    ])
    expect(r.receitasCentavos).toBe(5000)
  })
})

describe('resumoDoMes: mês sem lançamento', () => {
  it('devolve zeros e lista vazia, sem erro', async () => {
    const admin = await criarAdmin()

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    expect(r).toEqual({
      mes: '2026-10',
      receitasCentavos: 0,
      despesasCentavos: 0,
      saldoCentavos: 0,
      quantidadeDeLancamentos: 0,
      despesasPorCategoria: [],
      despesasPorPessoa: [],
    })
  })

  it('mês só com receita traz despesa zero e lista de categorias vazia', async () => {
    const admin = await criarAdmin()
    const s = await criarCategoriaNoBanco('receita', 'Salário')
    await lancar(s.id, 'receita', 1234, '2026-10-05')

    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)

    expect(r.despesasCentavos).toBe(0)
    expect(r.despesasPorCategoria).toEqual([])
    expect(r.saldoCentavos).toBe(1234)
    expect(r.quantidadeDeLancamentos).toBe(1)
  })
})

describe('resumoDoMes: quem pode ver', () => {
  it('o adulto vê o mesmo resumo que o responsável', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario({ papel: 'usuario' })
    const d = await criarCategoriaNoBanco('despesa', 'Mercado')
    await lancar(d.id, 'despesa', 4200, '2026-10-02')

    const doAdmin = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)
    const doAdulto = await resumoDoMes(adulto, { mes: '2026-10' }, AGORA)

    expect(doAdulto).toEqual(doAdmin)
    expect(doAdulto.despesasCentavos).toBe(4200)
  })
})

describe('resumo.ts não usa ponto flutuante (PR-02)', () => {
  const fonte = readFileSync(path.resolve(process.cwd(), 'src/servicos/resumo.ts'), 'utf8')
    // O comentário pode citar o que é proibido; o código não.
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')

  it.each(['parseFloat', 'Number(', 'toFixed', 'Math.round', 'Math.floor', 'Math.trunc', 'Float', 'Decimal', '/ 100', '* 0.'])(
    'não contém %s',
    (proibido) => {
      expect(fonte).not.toContain(proibido)
    },
  )
})
