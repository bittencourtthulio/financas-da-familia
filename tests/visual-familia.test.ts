/**
 * O visual "Família": as ilustrações só usam tokens, os dois temas definem as
 * cores delas, a navegação leva o ícone por atributo (o texto continua sendo o
 * rótulo), toda confirmação sem volta surge na mesma caixa, e a apresentação
 * pública leva ao login sem dado nenhum. A raiz do site é decidida pelo proxy:
 * sem cookie, a apresentação; com cookie, o painel.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { NextRequest } from 'next/server'
import { Navegacao } from '@/componentes/Navegacao'
import { Apresentacao } from '@/componentes/Apresentacao'
import { ApagarLancamento } from '@/componentes/ApagarLancamento'
import { ApagarMovimento } from '@/componentes/ApagarMovimento'
import { ApagarFilho } from '@/componentes/ApagarFilho'
import { LoginDoFilho } from '@/componentes/LoginDoFilho'
import { CaixaDeConfirmacao } from '@/componentes/CaixaDeConfirmacao'
import { Cachorro, Familia, Crianca, Cofrinho, Logotipo } from '@/componentes/ilustracoes/Familia'
import { EstadoDeErro } from '@/componentes/EstadoDeErro'
import { ListaDeFilhos } from '@/componentes/ListaDeFilhos'
import { proxy } from '@/proxy'
import { COOKIE_SESSAO } from '@/lib/sessao'
import { coresLiterais, corpoDe, declaracoesDe } from './ajuda-estatica'
import { renderizar } from './renderizar'

const SRC = path.resolve(process.cwd(), 'src')
const tokens = readFileSync(path.join(SRC, 'estilos/tokens.css'), 'utf8')
const global = readFileSync(path.join(SRC, 'estilos/global.css'), 'utf8')
const ilustracoes = readFileSync(path.join(SRC, 'componentes/ilustracoes/Familia.tsx'), 'utf8')

describe('tokens das ilustrações e da paleta alegre', () => {
  const escuro = declaracoesDe(corpoDe(tokens, ':root {'))
  const claro = declaracoesDe(corpoDe(tokens, ":root[data-theme='light']"))
  const ehCor = (valor: string | undefined) => /^(#|rgb|hsl)/.test(valor ?? '')
  const usados = [...new Set([...ilustracoes.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1] as string))].filter(
    (nome) => ehCor(escuro[nome]),
  )

  it('toda cor que uma ilustração usa existe nos dois temas', () => {
    expect(usados.length).toBeGreaterThan(15)
    for (const nome of usados) {
      expect(escuro[nome], `${nome} no tema escuro`).toBeDefined()
      expect(claro[nome], `${nome} no tema claro`).toBeDefined()
    }
  })

  it('a paleta tem as cores dos cinco personagens e a fonte é arredondada', () => {
    for (const nome of ['--ilu-roupa-pai', '--ilu-roupa-mae', '--ilu-roupa-menino', '--ilu-roupa-menina', '--ilu-cachorro']) {
      expect(escuro[nome], nome).toMatch(/^#/)
    }
    expect(escuro['--font-ui']).toContain('ui-rounded')
  })

  it('as ilustrações não escrevem cor por extenso', () => {
    expect(coresLiterais(ilustracoes)).toEqual([])
  })
})

describe('movimento', () => {
  it('há animação de surgir, tremer, flutuar, piscar e abanar, e quem prefere menos movimento recebe menos', () => {
    for (const nome of ['aparecer', 'surgir', 'tremer', 'flutuar', 'piscar', 'abanar', 'pular']) {
      expect(global, nome).toMatch(new RegExp(`@keyframes ${nome}\\b`))
    }
    expect(global).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('os botões respondem ao toque: hover levanta e active aperta', () => {
    expect(global).toMatch(/button\.primario:hover[^{]*\{[^}]*transform/)
    expect(global).toMatch(/button\.primario:active[^{]*\{[^}]*scale/)
  })
})

describe('a família desenhada', () => {
  it('a família inteira tem cinco personagens, cada um com olhos que piscam, e o cachorro abana o rabo', () => {
    const html = renderizar(Familia, {})
    expect(html.match(/class="personagem"/g)).toHaveLength(5)
    expect(html.match(/class="olho"/g)?.length).toBeGreaterThanOrEqual(10)
    expect(html).toContain('class="rabo"')
    expect(html).not.toMatch(/#[0-9a-f]{6}/i)
  })

  it('é decorativa por padrão e vira imagem com rótulo quando recebe título', () => {
    expect(renderizar(Familia, {})).toContain('aria-hidden="true"')
    const comTitulo = renderizar(Familia, { titulo: 'A família' })
    expect(comTitulo).toContain('role="img"')
    expect(comTitulo).toContain('aria-label="A família"')
  })

  it('o cachorro muda de humor: feliz mostra a língua, preocupado e perdido não', () => {
    expect(renderizar(Cachorro, {})).toContain('var(--ilu-lingua)')
    expect(renderizar(Cachorro, { humor: 'preocupado' })).not.toContain('var(--ilu-lingua)')
    expect(renderizar(Cachorro, { humor: 'perdido' })).toContain('?')
  })

  it('a criança varia o cabelo pelo índice; o cofrinho e a marca renderizam', () => {
    expect(renderizar(Crianca, { indice: 0 })).not.toEqual(renderizar(Crianca, { indice: 1 }))
    expect(renderizar(Crianca, { indice: 4 })).toEqual(renderizar(Crianca, { indice: 0 }))
    expect(renderizar(Cofrinho, {})).toContain('<svg')
    expect(renderizar(Logotipo, {})).toContain('class="ilustracao logotipo"')
  })

  it('cada filho da lista ganha um avatar, e o nome continua sendo um link limpo', () => {
    const html = renderizar(ListaDeFilhos, {
      filhos: [
        { id: 'f1', nome: 'Ana', mesadaCentavos: 5000, periodicidade: 'mensal', login: null },
        { id: 'f2', nome: 'Bia', mesadaCentavos: 2000, periodicidade: 'semanal', login: { ativo: true, email: 'b@x.y' } },
      ] as never,
    })
    expect(html.match(/class="ilustracao rostinho avatar"/g)).toHaveLength(2)
    expect(html).toMatch(/<a[^>]*href="\/filhos\/f1"[^>]*>Ana<\/a>/)
  })
})

describe('navegação com ícones', () => {
  it('todo link do menu leva data-icone e o texto continua logo depois da abertura do <a>', () => {
    const html = renderizar(Navegacao, { ehAdmin: true, podeLancar: true, ehFilho: true })
    const links = html.match(/<a [^>]*>/g) ?? []
    expect(links.length).toBeGreaterThanOrEqual(8)
    for (const a of links) expect(a, a).toMatch(/data-icone="[a-z]+"/)
    expect(html).toMatch(/<a[^>]*href="\/atividade"[^>]*>Atividade<\/a>/)
    expect(html).toMatch(/<a[^>]*href="\/mesada"[^>]*>Minha mesada<\/a>/)
  })

  it('o CSS desenha um ícone para cada data-icone usado', () => {
    const html = renderizar(Navegacao, { ehAdmin: true, podeLancar: true, ehFilho: true })
    const icones = [...new Set([...html.matchAll(/data-icone="([a-z]+)"/g)].map((m) => m[1]))]
    for (const icone of icones) {
      expect(global, icone).toContain(`.navegacao a[data-icone='${icone}']`)
    }
  })
})

describe('as confirmações sem volta surgem na mesma caixa', () => {
  it('a caixa leva o cachorro preocupado e o conteúdo', () => {
    const html = renderizar(CaixaDeConfirmacao, { children: 'tem certeza?' })
    expect(html).toContain('class="caixa-de-confirmacao tom-perigo"')
    expect(html).toContain('tem certeza?')
    expect(html).not.toContain('var(--ilu-lingua)')
  })

  it('apagar lançamento, apagar movimento, apagar filho e desativar login usam a caixa só depois do primeiro clique', () => {
    const casos: Array<[string, string]> = [
      ['lançamento', renderizar(ApagarLancamento, { id: 'l1', confirmandoInicial: true })],
      ['movimento', renderizar(ApagarMovimento, { id: 'm1', confirmandoInicial: true })],
      ['filho', renderizar(ApagarFilho, { filhoId: 'f1', nome: 'Ana', confirmandoInicial: true })],
      ['login', renderizar(LoginDoFilho, { filhoId: 'f1', login: { ativo: true, email: 'a@x.y' }, confirmandoInicial: true })],
    ]
    for (const [nome, html] of casos) {
      expect(html, nome).toContain('caixa-de-confirmacao')
      expect(html, nome).toContain('Cancelar')
      expect(html, nome).toMatch(/class="acoes"/)
    }
    expect(renderizar(ApagarLancamento, { id: 'l1' })).not.toContain('caixa-de-confirmacao')
    expect(renderizar(ApagarFilho, { filhoId: 'f1', nome: 'Ana' })).not.toContain('caixa-de-confirmacao')
  })

  it('o estado de erro traz o cachorro, mas continua sem mensagem técnica', () => {
    const erro: Error & { digest?: string } = new Error('SELECT secreto')
    erro.digest = 'abc'
    const html = renderizar(EstadoDeErro, { erro, aoTentarDeNovo: () => {} })
    expect(html).toContain('class="ilustracao"')
    expect(html).toContain('Algo deu errado')
    expect(html).not.toContain('SELECT')
  })
})

describe('a apresentação pública', () => {
  const html = renderizar(Apresentacao, {})

  it('diz o nome do sistema, leva ao login e à âncora de como funciona', () => {
    expect(html).toContain('Bufi')
    expect(html).toMatch(/<a[^>]*href="\/entrar"[^>]*>Entrar<\/a>/)
    expect(html).toMatch(/<a[^>]*href="\/entrar"[^>]*>Entrar no sistema<\/a>/)
    expect(html).toContain('id="como-funciona"')
  })

  it('mostra a família, os quatro recursos e os três passos, sem formulário nem dado', () => {
    expect(html.match(/class="personagem"/g)).toHaveLength(5)
    expect(html.match(/class="recurso"/g)).toHaveLength(4)
    expect(html.match(/class="passo"/g)).toHaveLength(3)
    expect(html).not.toContain('<form')
    expect(html).not.toContain('<input')
    expect(html).not.toMatch(/R\$\s\d/)
  })
})

describe('a raiz do site (src/proxy.ts)', () => {
  it('sem cookie de sessão, / é reescrita para a apresentação e a URL continua /', () => {
    const r = proxy(new NextRequest('http://localhost/'))
    expect(r.headers.get('x-middleware-rewrite')).toContain('/inicio')
    expect(r.status).toBe(200)
  })

  it('com cookie de sessão, / segue para o painel (que valida a sessão de verdade)', () => {
    const r = proxy(new NextRequest('http://localhost/', { headers: { cookie: `${COOKIE_SESSAO}=qualquer` } }))
    expect(r.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('só olha a raiz: outras rotas não entram no proxy', async () => {
    const { config } = await import('@/proxy')
    expect(config.matcher).toEqual(['/'])
    expect(proxy(new NextRequest('http://localhost/lancamentos')).headers.get('x-middleware-rewrite')).toBeNull()
  })
})
