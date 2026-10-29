/**
 * A lista de lançamentos (FT-03): tabela em português com valor em reais,
 * filtros de mês e tipo por link, paginação, estado vazio, item de menu só
 * para quem lança e nenhuma cor escrita por extenso (PR-07, PR-16). O acesso
 * por papel no servidor real é provado em rotas.test.ts.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { TabelaDeLancamentos } from '@/componentes/TabelaDeLancamentos'
import { FiltrosDeLancamentos } from '@/componentes/FiltrosDeLancamentos'
import { PaginacaoDeLancamentos } from '@/componentes/PaginacaoDeLancamentos'
import { Navegacao } from '@/componentes/Navegacao'
import { enderecoDaLista } from '@/lib/lancamentos-links'
import { papelPodeLancar } from '@/servicos/autenticacao'
import { coresLiterais } from './ajuda-estatica'
import { renderizar } from './renderizar'

const SRC = path.resolve(process.cwd(), 'src')

const itens = [
  {
    id: 'a1',
    tipo: 'despesa',
    valorCentavos: 1234,
    data: '2026-10-27',
    descricao: 'Pão e leite',
    categoria: { nome: 'Mercado' },
  },
  {
    id: 'b2',
    tipo: 'receita',
    valorCentavos: 123456,
    data: '2026-10-05',
    descricao: '',
    categoria: { nome: 'Salário' },
  },
]

describe('enderecoDaLista', () => {
  it('monta a consulta só com o que foi escolhido', () => {
    expect(enderecoDaLista({})).toBe('/lancamentos')
    expect(enderecoDaLista({ mes: '2026-10' })).toBe('/lancamentos?mes=2026-10')
    expect(enderecoDaLista({ mes: '2026-10', tipo: 'despesa', pagina: 3 })).toBe(
      '/lancamentos?mes=2026-10&tipo=despesa&pagina=3',
    )
    expect(enderecoDaLista({ mes: '2026-10', pagina: 1 })).toBe('/lancamentos?mes=2026-10')
    expect(enderecoDaLista({ tipo: null, pagina: 2 })).toBe('/lancamentos?pagina=2')
  })
})

describe('TabelaDeLancamentos', () => {
  it('mostra data, tipo, categoria, descrição e valor em reais, em tabela rolável', () => {
    const html = renderizar(TabelaDeLancamentos, { itens })
    expect(html).toContain('tabela-rolavel')
    for (const cabecalho of ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor']) {
      expect(html).toContain(`>${cabecalho}<`)
    }
    expect(html).toContain('27/10/2026')
    expect(html).toContain('05/10/2026')
    expect(html).toContain('Pão e leite')
    expect(html).toContain('Mercado')
    expect(html).toContain('>Despesa<')
    expect(html).toContain('>Receita<')
    expect((html.match(/<tr/g) ?? []).length).toBe(3) // cabeçalho + 2
  })

  it('despesa sai negativa e receita positiva, cada uma com a sua marca de cor', () => {
    const html = renderizar(TabelaDeLancamentos, { itens })
    expect(html).toMatch(/class="valor valor-despesa"[^>]*>-R\$&nbsp;12,34|class="valor valor-despesa"[^>]*>-R\$\s12,34/)
    expect(html).toMatch(/class="valor valor-receita"[^>]*>R\$(&nbsp;|\s)1\.234,56/)
  })

  it('descrição vazia mostra um traço, e cada linha tem o link Editar com o id', () => {
    const html = renderizar(TabelaDeLancamentos, { itens })
    expect(html).toContain('>—<')
    expect(html).toContain('href="/lancamentos/a1"')
    expect(html).toContain('href="/lancamentos/b2"')
    expect(html).toContain('>Editar<')
  })

  it('sem lançamento mostra o estado vazio do mês, sem tabela', () => {
    const html = renderizar(TabelaDeLancamentos, { itens: [], mes: '2026-10', tipo: null })
    expect(html).toContain('class="vazio"')
    expect(html).toContain('Nenhum lançamento em outubro de 2026')
    expect(html).toContain('Novo lançamento')
    expect(html).not.toContain('<table')
  })

  it('o vazio de um filtro diz qual é o filtro', () => {
    const html = renderizar(TabelaDeLancamentos, { itens: [], mes: '2026-10', tipo: 'receita' })
    expect(html).toContain('Nenhuma receita em outubro de 2026')
    expect(renderizar(TabelaDeLancamentos, { itens: [], mes: '2026-10', tipo: 'despesa' })).toContain(
      'Nenhuma despesa em outubro de 2026',
    )
  })

  it('escapa o que o usuário digitou (descrição com marcação não vira HTML)', () => {
    const html = renderizar(TabelaDeLancamentos, {
      itens: [{ ...itens[0]!, descricao: '<script>alert(1)</script>' }],
    })
    // O React acrescenta o próprio <script> de reenvio quando há formulário com ação;
    // o que importa é que o texto digitado saiu escapado.
    expect(html).not.toContain('<script>alert(1)')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })
})

describe('FiltrosDeLancamentos', () => {
  it('mostra o mês por extenso e os links do mês anterior e do próximo, mantendo o tipo', () => {
    const html = renderizar(FiltrosDeLancamentos, { mes: '2026-10', tipo: 'despesa' })
    expect(html).toContain('Outubro de 2026')
    expect(html).toContain('href="/lancamentos?mes=2026-09&amp;tipo=despesa"')
    expect(html).toContain('href="/lancamentos?mes=2026-11&amp;tipo=despesa"')
    expect(html).toContain('Mês anterior')
    expect(html).toContain('Próximo mês')
  })

  it('os links de tipo mantêm o mês, voltam à primeira página e marcam o escolhido', () => {
    const html = renderizar(FiltrosDeLancamentos, { mes: '2026-12', tipo: null })
    expect(html).toContain('href="/lancamentos?mes=2027-01"')
    expect(html).toMatch(/<a[^>]*aria-current="true"[^>]*>Todos<\/a>/)
    expect(html).toContain('href="/lancamentos?mes=2026-12&amp;tipo=receita"')
    expect(html).toContain('href="/lancamentos?mes=2026-12&amp;tipo=despesa"')
    expect(html).toContain('>Receitas<')
    expect(html).toContain('>Despesas<')
    const despesas = renderizar(FiltrosDeLancamentos, { mes: '2026-12', tipo: 'despesa' })
    expect(despesas).toMatch(/<a[^>]*aria-current="true"[^>]*>Despesas<\/a>/)
    expect(despesas).not.toMatch(/aria-current="true"[^>]*>Todos</)
  })

  it('janeiro volta para dezembro do ano anterior', () => {
    const html = renderizar(FiltrosDeLancamentos, { mes: '2026-01', tipo: null })
    expect(html).toContain('mes=2025-12')
  })
})

describe('PaginacaoDeLancamentos', () => {
  it('na primeira página só há Próxima; no meio as duas; na última só Anterior; links mantêm mês e tipo', () => {
    const primeira = renderizar(PaginacaoDeLancamentos, { pagina: 1, paginas: 3, mes: '2026-10', tipo: 'despesa' })
    expect(primeira).toContain('href="/lancamentos?mes=2026-10&amp;tipo=despesa&amp;pagina=2"')
    expect(primeira).not.toContain('Anterior')
    expect(primeira).toContain('Página 1 de 3')

    const meio = renderizar(PaginacaoDeLancamentos, { pagina: 2, paginas: 3, mes: '2026-10', tipo: null })
    expect(meio).toContain('href="/lancamentos?mes=2026-10"')
    expect(meio).toContain('href="/lancamentos?mes=2026-10&amp;pagina=3"')

    const ultima = renderizar(PaginacaoDeLancamentos, { pagina: 3, paginas: 3, mes: '2026-10', tipo: null })
    expect(ultima).not.toContain('Próxima')
  })

  it('com uma página só, não aparece', () => {
    expect(renderizar(PaginacaoDeLancamentos, { pagina: 1, paginas: 1, mes: '2026-10', tipo: null })).toBe('')
  })
})

describe('menu', () => {
  it('quem lança vê Lançamentos e Nossas Finanças (sem tela de Categorias); Atividade segue só do responsável', () => {
    const adulto = renderizar(Navegacao, { ehAdmin: false, podeLancar: true })
    expect(adulto).toMatch(/<a[^>]*href="\/lancamentos"[^>]*>Lançamentos<\/a>/)
    expect(adulto).toMatch(/<a[^>]*href="\/financas"[^>]*>Nossas Finanças<\/a>/)
    expect(adulto).not.toContain('Categorias')
    expect(adulto).not.toContain('Atividade')
    const responsavel = renderizar(Navegacao, { ehAdmin: true, podeLancar: true })
    expect(responsavel).toContain('>Atividade<')
    expect(responsavel).toContain('>Lançamentos<')
  })

  it('quem não lança (nem o papel filho de amanhã) não vê o item; sem a propriedade, esconde', () => {
    expect(renderizar(Navegacao, { ehAdmin: false, podeLancar: false })).not.toContain('Lançamentos')
    expect(renderizar(Navegacao, { ehAdmin: false })).not.toContain('/lancamentos')
  })

  it('Lançamentos vem logo abaixo de Painel, depois Nossas Finanças, antes de Atividade e fora de Configurações', () => {
    const html = renderizar(Navegacao, { ehAdmin: true, podeLancar: true })
    const posicao = (t: string) => html.indexOf(t)
    expect(posicao('>Painel<')).toBeLessThan(posicao('>Lançamentos<'))
    expect(posicao('>Lançamentos<')).toBeLessThan(posicao('>Nossas Finanças<'))
    expect(posicao('>Nossas Finanças<')).toBeLessThan(posicao('>Atividade<'))
    expect(posicao('>Atividade<')).toBeLessThan(posicao('>Configurações<'))
  })

  it('papelPodeLancar é por lista de permitidos', () => {
    expect(papelPodeLancar('admin')).toBe(true)
    expect(papelPodeLancar('usuario')).toBe(true)
    for (const papel of ['filho', '', 'ADMIN', 'visitante']) expect(papelPodeLancar(papel)).toBe(false)
  })
})

describe('estados e tokens da tela', () => {
  it('a rota herda carregando e erro do grupo (sistema), sem arquivo próprio', () => {
    expect(existsSync(path.join(SRC, 'app/(sistema)/lancamentos/page.tsx'))).toBe(true)
    expect(existsSync(path.join(SRC, 'app/(sistema)/lancamentos/loading.tsx'))).toBe(false)
    expect(existsSync(path.join(SRC, 'app/(sistema)/lancamentos/error.tsx'))).toBe(false)
  })

  it('a página exige quem lança no servidor, antes de ler os lançamentos', () => {
    const fonte = readFileSync(path.join(SRC, 'app/(sistema)/lancamentos/page.tsx'), 'utf8')
    expect(fonte).toContain('exigirUsuarioDeLancamentos')
    expect(fonte.indexOf('exigirUsuarioDeLancamentos()')).toBeLessThan(fonte.indexOf('listarLancamentos('))
  })

  it('nenhum arquivo novo escreve cor por extenso', () => {
    for (const arquivo of [
      'componentes/TabelaDeLancamentos.tsx',
      'componentes/FiltrosDeLancamentos.tsx',
      'componentes/PaginacaoDeLancamentos.tsx',
      'app/(sistema)/lancamentos/page.tsx',
    ]) {
      expect(coresLiterais(readFileSync(path.join(SRC, arquivo), 'utf8')), arquivo).toEqual([])
    }
  })

  it('o estilo do valor usa só tokens (sucesso para receita, perigo para despesa)', () => {
    const css = readFileSync(path.join(SRC, 'estilos/global.css'), 'utf8')
    expect(css).toMatch(/\.valor-receita\s*\{[^}]*var\(--success\)/)
    expect(css).toMatch(/\.valor-despesa\s*\{[^}]*var\(--danger\)/)
    expect(css).toMatch(/\.valor\s*\{[^}]*tabular-nums/)
  })
})
