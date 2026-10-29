/**
 * Listagem por mês e tipo, paginada (D-12): data mais recente primeiro,
 * 50 por página, mês padrão o corrente em São Paulo, sem nenhum total
 * (saldo e resumo são da FT-04).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { listarLancamentos, POR_PAGINA_DE_LANCAMENTOS } from '@/servicos/lancamentos'
import { criarAdmin, criarUsuario, criarCategoriaNoBanco, limparBanco, familiaPadrao } from './ajuda'

beforeEach(limparBanco)

async function semear(
  linhas: Array<{ data: string; tipo?: 'receita' | 'despesa'; valorCentavos?: number; descricao?: string }>,
) {
  const despesa = await criarCategoriaNoBanco('despesa', 'Casa')
  const receita = await criarCategoriaNoBanco('receita', 'Salário')
  for (const linha of linhas) {
    const tipo = linha.tipo ?? 'despesa'
    await prisma.lancamento.create({
      data: { familiaId: await familiaPadrao(),
        tipo,
        valorCentavos: linha.valorCentavos ?? 1000,
        data: linha.data,
        descricao: linha.descricao ?? '',
        categoriaId: tipo === 'despesa' ? despesa.id : receita.id,
      },
    })
  }
}

const dia = (n: number) => `2026-10-${String(n).padStart(2, '0')}`
const AGORA = new Date('2026-10-15T15:00:00Z')

describe('listarLancamentos', () => {
  it('pagina de 50 em 50 dentro do mês, com total e páginas certos', async () => {
    const linhas = Array.from({ length: 120 }, (_, i) => ({ data: dia((i % 28) + 1), descricao: `L${i}` }))
    linhas.push(
      { data: '2026-09-30', descricao: 'setembro 1' },
      { data: '2026-09-01', descricao: 'setembro 2' },
      { data: '2026-09-15', descricao: 'setembro 3' },
    )
    await semear(linhas)
    const admin = await criarAdmin()

    const p1 = await listarLancamentos(admin, { mes: '2026-10', pagina: 1 })
    const p2 = await listarLancamentos(admin, { mes: '2026-10', pagina: 2 })
    const p3 = await listarLancamentos(admin, { mes: '2026-10', pagina: 3 })
    expect(POR_PAGINA_DE_LANCAMENTOS).toBe(50)
    expect([p1.itens.length, p2.itens.length, p3.itens.length]).toEqual([50, 50, 20])
    expect(p1).toMatchObject({ total: 120, paginas: 3, pagina: 1, mes: '2026-10' })

    const todos = [...p1.itens, ...p2.itens, ...p3.itens]
    expect(new Set(todos.map((l) => l.id)).size).toBe(120)
    const datas = todos.map((l) => l.data)
    expect(datas).toEqual([...datas].sort().reverse())

    const setembro = await listarLancamentos(admin, { mes: '2026-09' })
    expect(setembro.itens.map((l) => l.descricao)).toEqual(['setembro 1', 'setembro 3', 'setembro 2'])
    expect(setembro.total).toBe(3)
  })

  it('no mesmo dia, o mais recente primeiro', async () => {
    await semear([])
    const categoria = await criarCategoriaNoBanco('despesa', 'Dia')
    for (const [i, descricao] of ['primeiro', 'segundo', 'terceiro'].entries()) {
      await prisma.lancamento.create({
        data: { familiaId: await familiaPadrao(),
          tipo: 'despesa',
          valorCentavos: 100,
          data: dia(10),
          descricao,
          categoriaId: categoria.id,
          criadoEm: new Date(Date.UTC(2026, 9, 10, 12, i)),
        },
      })
    }
    const admin = await criarAdmin()
    const pagina = await listarLancamentos(admin, { mes: '2026-10' })
    expect(pagina.itens.map((l) => l.descricao)).toEqual(['terceiro', 'segundo', 'primeiro'])
  })

  it('o primeiro e o último dia do mês entram; o último do mês anterior e o primeiro do seguinte não', async () => {
    await semear([
      { data: '2026-09-30', descricao: 'antes' },
      { data: '2026-10-01', descricao: 'primeiro' },
      { data: '2026-10-31', descricao: 'último' },
      { data: '2026-11-01', descricao: 'depois' },
    ])
    const admin = await criarAdmin()
    const pagina = await listarLancamentos(admin, { mes: '2026-10' })
    expect(pagina.itens.map((l) => l.descricao)).toEqual(['último', 'primeiro'])
  })

  it('dezembro não vaza para janeiro', async () => {
    await semear([
      { data: '2026-12-31', descricao: 'dez' },
      { data: '2027-01-01', descricao: 'jan' },
    ])
    const admin = await criarAdmin()
    expect((await listarLancamentos(admin, { mes: '2026-12' })).itens.map((l) => l.descricao)).toEqual(['dez'])
    expect((await listarLancamentos(admin, { mes: '2027-01' })).itens.map((l) => l.descricao)).toEqual(['jan'])
  })

  it('página fora do intervalo cai na última válida; zero, negativa e fracionária caem em válidas', async () => {
    await semear(Array.from({ length: 60 }, (_, i) => ({ data: dia((i % 28) + 1) })))
    const admin = await criarAdmin()
    expect((await listarLancamentos(admin, { mes: '2026-10', pagina: 99 })).pagina).toBe(2)
    expect((await listarLancamentos(admin, { mes: '2026-10', pagina: 0 })).pagina).toBe(1)
    expect((await listarLancamentos(admin, { mes: '2026-10', pagina: -3 })).pagina).toBe(1)
    expect((await listarLancamentos(admin, { mes: '2026-10', pagina: 1.5 })).pagina).toBe(1)
    expect((await listarLancamentos(admin, { mes: '2026-10', pagina: NaN })).pagina).toBe(1)
  })

  it('mês sem lançamento devolve página vazia, uma página, sem erro', async () => {
    const admin = await criarAdmin()
    const pagina = await listarLancamentos(admin, { mes: '2026-10' })
    expect(pagina).toMatchObject({ itens: [], total: 0, pagina: 1, paginas: 1 })
  })

  it('filtra só receitas ou só despesas, e o total acompanha o filtro', async () => {
    await semear([
      { data: dia(1), tipo: 'receita', descricao: 'salário' },
      { data: dia(2), tipo: 'despesa', descricao: 'mercado' },
      { data: dia(3), tipo: 'despesa', descricao: 'luz' },
    ])
    const admin = await criarAdmin()
    const receitas = await listarLancamentos(admin, { mes: '2026-10', tipo: 'receita' })
    expect(receitas.itens.map((l) => l.descricao)).toEqual(['salário'])
    expect(receitas).toMatchObject({ total: 1, tipo: 'receita' })
    const despesas = await listarLancamentos(admin, { mes: '2026-10', tipo: 'despesa' })
    expect(despesas.itens.map((l) => l.descricao)).toEqual(['luz', 'mercado'])
    const todos = await listarLancamentos(admin, { mes: '2026-10' })
    expect(todos.total).toBe(3)
    expect(todos.tipo).toBeNull()
  })

  it('tipo desconhecido é ignorado (todos)', async () => {
    await semear([{ data: dia(1) }, { data: dia(2), tipo: 'receita' }])
    const admin = await criarAdmin()
    const pagina = await listarLancamentos(admin, { mes: '2026-10', tipo: 'transferencia' as never })
    expect(pagina.total).toBe(2)
    expect(pagina.tipo).toBeNull()
  })

  it.each(['2026-13', '2026-00', 'abc', '', '2026-1', '1999-01', '2026-10-01', undefined])(
    'mês inválido "%s" cai no mês corrente',
    async (mes) => {
      await semear([
        { data: '2026-10-05', descricao: 'este mês' },
        { data: '2026-09-05', descricao: 'mês passado' },
      ])
      const admin = await criarAdmin()
      const pagina = await listarLancamentos(admin, { mes: mes as string | undefined }, AGORA)
      expect(pagina.mes).toBe('2026-10')
      expect(pagina.itens.map((l) => l.descricao)).toEqual(['este mês'])
    },
  )

  it('sem opções usa o mês corrente de São Paulo, também na virada de mês às 23h do dia 31', async () => {
    await semear([
      { data: '2026-10-31', descricao: 'outubro' },
      { data: '2026-11-01', descricao: 'novembro' },
    ])
    const admin = await criarAdmin()
    // 01/11 02:30 UTC ainda é 31/10 23:30 em São Paulo: continua outubro.
    const naVirada = await listarLancamentos(admin, {}, new Date('2026-11-01T02:30:00Z'))
    expect(naVirada.mes).toBe('2026-10')
    expect(naVirada.itens.map((l) => l.descricao)).toEqual(['outubro'])
    // 03:00 UTC já é 00:00 de 01/11 em São Paulo.
    const depois = await listarLancamentos(admin, {}, new Date('2026-11-01T03:00:00Z'))
    expect(depois.mes).toBe('2026-11')
    expect(depois.itens.map((l) => l.descricao)).toEqual(['novembro'])
  })

  it('cada item traz a categoria e o valor em centavos inteiros', async () => {
    await semear([{ data: dia(1), valorCentavos: 123456 }])
    const adulto = await criarUsuario({ papel: 'usuario' })
    const [item] = (await listarLancamentos(adulto, { mes: '2026-10' })).itens
    expect(item?.valorCentavos).toBe(123456)
    expect(Number.isInteger(item?.valorCentavos)).toBe(true)
    expect(item?.categoria).toMatchObject({ nome: 'Casa', tipo: 'despesa' })
  })

  it('a página não carrega somas, saldo nem total monetário (isso é da FT-04)', async () => {
    await semear([{ data: dia(1) }])
    const admin = await criarAdmin()
    const pagina = await listarLancamentos(admin, { mes: '2026-10' })
    expect(Object.keys(pagina).sort()).toEqual(['itens', 'mes', 'pagina', 'paginas', 'tipo', 'total'])
  })
})
