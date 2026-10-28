/**
 * Formulários de lançamento e de categoria, exclusão em dois passos e as
 * ações que os ligam ao serviço (FT-03). A prova no servidor real mora em
 * rotas.test.ts; aqui o que dá para afirmar sem navegador.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { CamposDeLancamento, categoriasDoTipo } from '@/componentes/CamposDeLancamento'
import { ApagarLancamento } from '@/componentes/ApagarLancamento'
import { CampoDeTipo } from '@/componentes/CampoDeTipo'
import { lerFormularioDeLancamento, lerFormularioDeCategoria } from '@/app/formularios'
import { coresLiterais } from './ajuda-estatica'
import { renderizar } from './renderizar'

const SRC = path.resolve(process.cwd(), 'src')
const fonte = (arquivo: string) => readFileSync(path.join(SRC, arquivo), 'utf8')

const categorias = [
  { id: 'd1', nome: 'Mercado', tipo: 'despesa' },
  { id: 'd2', nome: 'Lazer', tipo: 'despesa' },
  { id: 'r1', nome: 'Salário', tipo: 'receita' },
]

describe('categoriasDoTipo', () => {
  it('devolve só as categorias do tipo', () => {
    expect(categoriasDoTipo(categorias, 'despesa').map((c) => c.id)).toEqual(['d1', 'd2'])
    expect(categoriasDoTipo(categorias, 'receita').map((c) => c.id)).toEqual(['r1'])
    expect(categoriasDoTipo([], 'receita')).toEqual([])
  })
})

describe('CamposDeLancamento — novo', () => {
  const html = renderizar(CamposDeLancamento, { categorias, hoje: '2026-10-28' })

  it('traz os campos com os nomes que a ação lê, em português e com rótulo associado', () => {
    for (const nome of ['tipo', 'valor', 'data', 'categoriaId', 'descricao']) {
      expect(html, nome).toContain(`name="${nome}"`)
    }
    for (const rotulo of ['Tipo', 'Valor', 'Data', 'Categoria', 'Descrição']) {
      expect(html, rotulo).toContain(rotulo)
    }
    expect(html).toContain('>Despesa<')
    expect(html).toContain('>Receita<')
    expect(html).toContain('inputMode="decimal"')
    expect(html).toContain('placeholder="0,00"')
    expect(html).toMatch(/type="date"[^>]*value="2026-10-28"|value="2026-10-28"[^>]*type="date"/)
  })

  it('começa em despesa e oferece só as categorias de despesa', () => {
    expect(html).toMatch(/<input[^>]*value="despesa"[^>]*checked|<input[^>]*checked[^>]*value="despesa"/)
    expect(html).toContain('>Mercado<')
    expect(html).toContain('>Lazer<')
    expect(html).not.toContain('>Salário<')
  })

  it('o valor não é um campo numérico do navegador (aceita a vírgula do formato brasileiro)', () => {
    expect(html).not.toContain('type="number"')
  })

  it('sem categoria do tipo, explica e leva a Categorias em vez de um select vazio', () => {
    const vazio = renderizar(CamposDeLancamento, { categorias: [], hoje: '2026-10-28' })
    expect(vazio).toContain('Ainda não há categoria de despesa')
    expect(vazio).toContain('href="/lancamentos/categorias"')
    expect(vazio).not.toContain('<select')
  })
})

describe('CamposDeLancamento — edição', () => {
  const inicial = {
    id: 'abc',
    tipo: 'receita',
    valor: '1234,56',
    data: '2026-10-05',
    categoriaId: 'r1',
    descricao: 'Salário de outubro',
  }
  const html = renderizar(CamposDeLancamento, { categorias, hoje: '2026-10-28', inicial })

  it('vem preenchido: valor no formato do campo, data, descrição, tipo e categoria', () => {
    expect(html).toContain('value="1234,56"')
    expect(html).toContain('value="2026-10-05"')
    expect(html).toContain('value="Salário de outubro"')
    expect(html).toMatch(/<input[^>]*value="receita"[^>]*checked|<input[^>]*checked[^>]*value="receita"/)
    expect(html).toMatch(/<option[^>]*value="r1"[^>]*selected|<option[^>]*selected[^>]*value="r1"/)
    expect(html).not.toContain('>Mercado<')
  })

  it('leva o id escondido, para a ação saber qual lançamento salvar', () => {
    expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="id"[^>]*value="abc"|<input[^>]*name="id"[^>]*value="abc"[^>]*type="hidden"|<input[^>]*type="hidden"[^>]*value="abc"[^>]*name="id"/)
  })

  it('escapa o que veio do banco', () => {
    const perigoso = renderizar(CamposDeLancamento, {
      categorias,
      hoje: '2026-10-28',
      inicial: { ...inicial, descricao: '"><script>alert(1)</script>' },
    })
    expect(perigoso).not.toContain('<script>')
  })
})

describe('CampoDeTipo', () => {
  it('dois botões de opção com o mesmo nome, sem JavaScript', () => {
    const html = renderizar(CampoDeTipo, { padrao: 'despesa' })
    expect((html.match(/type="radio"/g) ?? []).length).toBe(2)
    expect((html.match(/name="tipo"/g) ?? []).length).toBe(2)
    expect(html).toContain('<fieldset')
    expect(html).toContain('<legend>Tipo</legend>')
  })
})

describe('ApagarLancamento — dois passos', () => {
  it('no começo só oferece Apagar lançamento, sem o botão de confirmar', () => {
    const html = renderizar(ApagarLancamento, { id: 'abc' })
    expect(html).toContain('Apagar lançamento')
    expect(html).not.toContain('Confirmar exclusão')
    expect(html).not.toContain('name="id"')
  })

  it('no segundo passo avisa que não dá para desfazer e traz Confirmar exclusão e Cancelar', () => {
    const html = renderizar(ApagarLancamento, { id: 'abc', confirmandoInicial: true })
    expect(html).toContain('não pode ser desfeita')
    expect(html).toContain('Confirmar exclusão')
    expect(html).toContain('Cancelar')
    expect(html).toMatch(/name="id"[^>]*value="abc"|value="abc"[^>]*name="id"/)
  })
})

describe('leitura do formulário', () => {
  it('monta a entrada do lançamento com os campos do formulário, sem converter nada', () => {
    const form = new FormData()
    form.set('tipo', 'despesa')
    form.set('valor', '1.234,56')
    form.set('data', '2026-10-27')
    form.set('categoriaId', 'd1')
    form.set('descricao', 'Feira')
    expect(lerFormularioDeLancamento(form)).toEqual({
      tipo: 'despesa',
      valor: '1.234,56',
      data: '2026-10-27',
      categoriaId: 'd1',
      descricao: 'Feira',
    })
  })

  it('campo ausente vira null e o serviço decide (nenhum valor é inventado aqui)', () => {
    const entrada = lerFormularioDeLancamento(new FormData())
    expect(entrada).toEqual({ tipo: null, valor: null, data: null, categoriaId: null, descricao: null })
  })

  it('o valor continua texto: nada de Number() antes do serviço', () => {
    const form = new FormData()
    form.set('valor', '19,99')
    expect(lerFormularioDeLancamento(form).valor).toBe('19,99')
    expect(fonte('app/formularios.ts')).not.toMatch(/Number\(|parseFloat|parseInt/)
  })

  it('categoria: nome e tipo', () => {
    const form = new FormData()
    form.set('nome', 'Mercado')
    form.set('tipo', 'despesa')
    expect(lerFormularioDeCategoria(form)).toEqual({ nome: 'Mercado', tipo: 'despesa' })
  })
})

describe('ações de formulário', () => {
  const acoes = fonte('app/acoes.ts')
  const corpo = (nome: string) => {
    const i = acoes.indexOf(`export async function ${nome}`)
    expect(i, nome).toBeGreaterThan(-1)
    const j = acoes.indexOf('\nexport async function', i + 10)
    return acoes.slice(i, j === -1 ? undefined : j)
  }

  it.each(['registrarLancamento', 'salvarLancamento', 'excluirLancamento', 'registrarCategoria'])(
    '%s exige quem lança antes de tocar o serviço, e fora do try (o redirecionamento não vira mensagem)',
    (nome) => {
      const c = corpo(nome)
      expect(c).toContain('exigirUsuarioDeLancamentos()')
      expect(c.indexOf('exigirUsuarioDeLancamentos()')).toBeLessThan(c.indexOf('try {'))
      expect(c).toContain('mensagemDe(erro)')
    },
  )

  it('criar, salvar e apagar lançamento redirecionam à lista no fim, depois do try', () => {
    for (const nome of ['registrarLancamento', 'salvarLancamento', 'excluirLancamento']) {
      const c = corpo(nome)
      expect(c.lastIndexOf("redirect(")).toBeGreaterThan(c.lastIndexOf('catch'))
      expect(c).toContain('revalidatePath')
    }
  })

  it('o redirecionamento depois de salvar leva ao mês do lançamento', () => {
    expect(corpo('registrarLancamento')).toContain("redirect(listaDoMesDe(form.get('data')))")
    expect(corpo('salvarLancamento')).toContain("redirect(listaDoMesDe(form.get('data')))")
    expect(acoes).toMatch(/function listaDoMesDe[\s\S]*?enderecoDaLista[\s\S]*?mesDaData\(data\)/)
  })
})

describe('páginas', () => {
  const paginas = [
    'app/(sistema)/lancamentos/novo/page.tsx',
    'app/(sistema)/lancamentos/[id]/page.tsx',
    'app/(sistema)/lancamentos/categorias/page.tsx',
  ]

  it('existem, herdam carregando e erro do grupo e exigem quem lança antes de ler', () => {
    for (const p of paginas) {
      expect(existsSync(path.join(SRC, p)), p).toBe(true)
      const dir = path.dirname(path.join(SRC, p))
      expect(existsSync(path.join(dir, 'loading.tsx')), p).toBe(false)
      expect(existsSync(path.join(dir, 'error.tsx')), p).toBe(false)
      const f = fonte(p)
      expect(f, p).toContain('exigirUsuarioDeLancamentos()')
      const leitura = f.search(/listarCategorias\(|obterLancamento\(/)
      expect(f.indexOf('exigirUsuarioDeLancamentos()'), p).toBeLessThan(leitura)
    }
  })

  it('a edição de id que não existe cai em não encontrado', () => {
    const f = fonte('app/(sistema)/lancamentos/[id]/page.tsx')
    expect(f).toContain('notFound()')
    expect(f).toContain('status === 404')
  })

  it('a tela de categorias lista por tipo, tem estado vazio e o formulário de nova categoria', () => {
    const f = fonte('app/(sistema)/lancamentos/categorias/page.tsx')
    expect(f).toContain('registrarCategoria')
    expect(f).toContain('className="vazio"')
    expect(f).toMatch(/Despesas/)
    expect(f).toMatch(/Receitas/)
  })

  it('nenhum arquivo novo escreve cor por extenso', () => {
    for (const arquivo of [
      ...paginas,
      'componentes/CamposDeLancamento.tsx',
      'componentes/ApagarLancamento.tsx',
      'componentes/CampoDeTipo.tsx',
    ]) {
      expect(coresLiterais(fonte(arquivo)), arquivo).toEqual([])
    }
  })
})
