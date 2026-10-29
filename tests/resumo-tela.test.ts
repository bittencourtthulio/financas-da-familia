/**
 * O resumo do mês no painel (FT-04): três totais com rótulo textual, o saldo
 * legível sem depender de cor, despesas por categoria com barra, seletor de
 * mês por link, estado vazio com atalho, e só tokens (PR-07, PR-16). O
 * servidor real e a negação por papel são provados em rotas.test.ts.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ResumoDoMes } from '@/componentes/ResumoDoMes'
import { SeletorDeMes } from '@/componentes/SeletorDeMes'
import { enderecoDoPainel, mesesVizinhos, parteEmPercentual } from '@/lib/resumo-links'
import { formatarMoeda } from '@/lib/formato'
import type { ResumoDoMes as Resumo } from '@/servicos/resumo'
import { coresLiterais } from './ajuda-estatica'
import { renderizar } from './renderizar'

const SRC = path.resolve(process.cwd(), 'src')

const outubro: Resumo = {
  mes: '2026-10',
  receitasCentavos: 555000,
  despesasCentavos: 265225,
  saldoCentavos: 289775,
  quantidadeDeLancamentos: 6,
  despesasPorCategoria: [
    { categoriaId: 'a', nome: 'Moradia', totalCentavos: 180000, quantidade: 1 },
    { categoriaId: 'b', nome: 'Mercado', totalCentavos: 64235, quantidade: 2 },
    { categoriaId: 'c', nome: 'Lazer', totalCentavos: 20990, quantidade: 3 },
  ],
  despesasPorPessoa: [],
}

const vazio: Resumo = {
  mes: '2026-10',
  receitasCentavos: 0,
  despesasCentavos: 0,
  saldoCentavos: 0,
  quantidadeDeLancamentos: 0,
  despesasPorCategoria: [],
  despesasPorPessoa: [],
}

describe('enderecoDoPainel e mesesVizinhos', () => {
  it('o painel é / e o mês vai na consulta', () => {
    expect(enderecoDoPainel(null)).toBe('/')
    expect(enderecoDoPainel('2026-09')).toBe('/?mes=2026-09')
  })

  it('os vizinhos são o mês anterior e o seguinte, inclusive na virada de ano', () => {
    expect(mesesVizinhos('2026-10')).toEqual({ anterior: '2026-09', seguinte: '2026-11' })
    expect(mesesVizinhos('2026-01')).toEqual({ anterior: '2025-12', seguinte: '2026-02' })
    expect(mesesVizinhos('2026-12')).toEqual({ anterior: '2026-11', seguinte: '2027-01' })
  })

  it('não oferece vizinho fora de 2000 a 2100', () => {
    expect(mesesVizinhos('2000-01').anterior).toBeNull()
    expect(mesesVizinhos('2000-01').seguinte).toBe('2000-02')
    expect(mesesVizinhos('2100-12').seguinte).toBeNull()
    expect(mesesVizinhos('2100-12').anterior).toBe('2100-11')
  })
})

describe('parteEmPercentual', () => {
  it('é inteiro de 0 a 100, em aritmética de inteiros', () => {
    expect(parteEmPercentual(180000, 265225)).toBe(67)
    expect(parteEmPercentual(1, 3)).toBe(33)
    expect(parteEmPercentual(5, 5)).toBe(100)
    expect(parteEmPercentual(0, 5)).toBe(0)
  })

  it('total zero ou parte maior que o total não estoura a barra', () => {
    expect(parteEmPercentual(10, 0)).toBe(0)
    expect(parteEmPercentual(10, 5)).toBe(100)
    expect(parteEmPercentual(100000000, 100000000)).toBe(100)
  })
})

describe('SeletorDeMes', () => {
  it('mostra o mês por extenso com Mês anterior e Próximo mês apontando para o painel', () => {
    const html = renderizar(SeletorDeMes, { mes: '2026-10', mesAtual: '2026-10' })
    expect(html).toContain('Outubro de 2026')
    expect(html).toMatch(/<a[^>]*href="\/\?mes=2026-09"[^>]*>Mês anterior<\/a>/)
    expect(html).toMatch(/<a[^>]*href="\/\?mes=2026-11"[^>]*>Próximo mês<\/a>/)
    expect(html).toMatch(/<nav[^>]*aria-label="Mês do resumo"/)
  })

  it('só oferece o atalho Mês atual fora do mês corrente', () => {
    const noCorrente = renderizar(SeletorDeMes, { mes: '2026-10', mesAtual: '2026-10' })
    const fora = renderizar(SeletorDeMes, { mes: '2026-08', mesAtual: '2026-10' })
    expect(noCorrente).not.toContain('Mês atual')
    expect(fora).toMatch(/<a[^>]*href="\/"[^>]*>Mês atual<\/a>/)
  })

  it('omite o link que levaria para fora do intervalo', () => {
    const inicio = renderizar(SeletorDeMes, { mes: '2000-01', mesAtual: '2026-10' })
    const fim = renderizar(SeletorDeMes, { mes: '2100-12', mesAtual: '2026-10' })
    expect(inicio).not.toContain('Mês anterior')
    expect(inicio).toContain('Próximo mês')
    expect(fim).not.toContain('Próximo mês')
    expect(fim).toContain('Mês anterior')
  })
})

describe('ResumoDoMes: totais', () => {
  const html = renderizar(ResumoDoMes, { resumo: outubro })

  it('mostra Receitas, Despesas e Saldo do mês, cada um com rótulo e valor em reais', () => {
    expect(html).toContain('Receitas')
    expect(html).toContain('Despesas')
    expect(html).toContain('Saldo do mês')
    expect(html).toContain(formatarMoeda(555000))
    expect(html).toContain(formatarMoeda(265225))
    expect(html).toContain(formatarMoeda(289775))
    expect(html).toContain('R$ 5.550,00')
    expect(html).toContain('R$ 2.652,25')
    expect(html).toContain('R$ 2.897,75')
  })

  it('saldo positivo diz em palavras que sobrou dinheiro', () => {
    expect(html).toContain('Saldo positivo')
  })

  it('cada valor tem rótulo textual associado (nada de número solto)', () => {
    expect(html).toMatch(/aria-labelledby="rotulo-receitas"/)
    expect(html).toMatch(/id="rotulo-receitas"/)
    expect(html).toMatch(/id="rotulo-despesas"/)
    expect(html).toMatch(/id="rotulo-saldo"/)
  })
})

describe('ResumoDoMes: saldo legível sem depender de cor', () => {
  it('saldo negativo sai com sinal de menos e a frase, não só pela classe', () => {
    const html = renderizar(ResumoDoMes, {
      resumo: { ...outubro, receitasCentavos: 100000, despesasCentavos: 180000, saldoCentavos: -80000 },
    })
    expect(html).toContain('-R$ 800,00')
    expect(html).toContain('Saldo negativo')
    expect(html).toContain('as despesas passaram das receitas')
    expect(html).not.toContain('Saldo positivo')
  })

  it('saldo zero diz Saldo zerado', () => {
    const html = renderizar(ResumoDoMes, {
      resumo: { ...outubro, receitasCentavos: 30, despesasCentavos: 30, saldoCentavos: 0 },
    })
    expect(html).toContain('Saldo zerado')
    expect(html).toContain('R$ 0,00')
    expect(html).not.toContain('Saldo negativo')
    expect(html).not.toContain('Saldo positivo')
  })

  it('o estado do saldo vai num atributo, para o estilo usar token e não só cor', () => {
    const negativo = renderizar(ResumoDoMes, {
      resumo: { ...outubro, saldoCentavos: -1, despesasCentavos: 555001 },
    })
    expect(negativo).toMatch(/data-saldo="negativo"/)
    expect(renderizar(ResumoDoMes, { resumo: outubro })).toMatch(/data-saldo="positivo"/)
  })
})

describe('ResumoDoMes: despesas por categoria', () => {
  const html = renderizar(ResumoDoMes, { resumo: outubro })

  it('lista cada categoria com nome, quantidade e soma, na ordem recebida', () => {
    expect(html).toContain('Despesas por categoria')
    const ordem = ['Moradia', 'Mercado', 'Lazer'].map((n) => html.indexOf(n, html.indexOf('Despesas por categoria')))
    expect(ordem.every((i) => i > 0)).toBe(true)
    expect([...ordem].sort((a, b) => a - b)).toEqual(ordem)
    expect(html).toContain('R$ 1.800,00')
    expect(html).toContain('R$ 642,35')
    expect(html).toContain('R$ 209,90')
    expect(html).toContain('1 lançamento')
    expect(html).toContain('2 lançamentos')
    expect(html).toContain('3 lançamentos')
  })

  it('a barra é decorativa, tem largura inteira de 0 a 100 e o texto do valor fica fora dela', () => {
    const larguras = [...html.matchAll(/class="barra-de-categoria"[^>]*aria-hidden="true"[^>]*><span[^>]*style="width:(\d+)%"/g)].map((m) => Number(m[1]))
    expect(larguras).toEqual([67, 24, 7])
    for (const l of larguras) {
      expect(Number.isInteger(l)).toBe(true)
      expect(l).toBeGreaterThanOrEqual(0)
      expect(l).toBeLessThanOrEqual(100)
    }
  })

  it('mês só com receita diz que não há despesa e mantém os totais', () => {
    const so = renderizar(ResumoDoMes, {
      resumo: { ...vazio, receitasCentavos: 1234, saldoCentavos: 1234, quantidadeDeLancamentos: 1 },
    })
    expect(so).toContain('Nenhuma despesa em outubro de 2026')
    expect(so).toContain('R$ 12,34')
    expect(so).not.toContain('barra-de-categoria')
  })
})

describe('ResumoDoMes: estado vazio', () => {
  const html = renderizar(ResumoDoMes, { resumo: vazio })

  it('mês sem lançamento mostra a mensagem com atalho para Lançamentos e nenhum cartão', () => {
    expect(html).toContain('Nenhum lançamento em outubro de 2026')
    expect(html).toMatch(/<a[^>]*href="\/lancamentos\/novo"[^>]*>Novo lançamento<\/a>/)
    expect(html).toMatch(/<a[^>]*href="\/lancamentos\?mes=2026-10"[^>]*>Lançamentos<\/a>/)
    expect(html).not.toContain('Saldo do mês')
    expect(html).not.toContain('Despesas por categoria')
  })

  it('o atalho de Lançamentos leva ao mês que está sendo visto', () => {
    const agosto = renderizar(ResumoDoMes, { resumo: { ...vazio, mes: '2026-08' } })
    expect(agosto).toContain('Nenhum lançamento em agosto de 2026')
    expect(agosto).toMatch(/href="\/lancamentos\?mes=2026-08"/)
  })
})

describe('só tokens', () => {
  it.each([
    'src/componentes/ResumoDoMes.tsx',
    'src/componentes/SeletorDeMes.tsx',
    'src/lib/resumo-links.ts',
  ])('%s não escreve cor por extenso', (arquivo) => {
    const texto = readFileSync(path.resolve(process.cwd(), arquivo), 'utf8')
    expect(coresLiterais(texto)).toEqual([])
  })

  it('os estilos novos do resumo usam só var(--token)', () => {
    const css = readFileSync(path.join(SRC, 'estilos/global.css'), 'utf8')
    const inicio = css.indexOf('/* ---------- resumo do mês (FT-04) ---------- */')
    expect(inicio).toBeGreaterThan(0)
    const fim = css.indexOf('/* ---------- celular ---------- */')
    const bloco = css.slice(inicio, fim)
    expect(bloco).toContain('.cartao-do-resumo')
    expect(bloco).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(bloco).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/)
  })

  it('o bloco de celular empilha os cartões', () => {
    const css = readFileSync(path.join(SRC, 'estilos/global.css'), 'utf8')
    const celular = css.slice(css.indexOf('@media (max-width: 768px)'))
    expect(celular).toContain('.cartoes-do-resumo')
  })
})
