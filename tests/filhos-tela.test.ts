/**
 * As telas do responsável sobre filhos (FT-05): lista com estado vazio, campos
 * do formulário, login do filho em texto, mesada em reais, só tokens (PR-07,
 * PR-16) e só os campos que a PR-09 permite. A negação por papel no servidor
 * real é provada em rotas.test.ts.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ListaDeFilhos } from '@/componentes/ListaDeFilhos'
import { CamposDoFilho } from '@/componentes/CamposDoFilho'
import { LoginDoFilho } from '@/componentes/LoginDoFilho'
import { Navegacao } from '@/componentes/Navegacao'
import { descricaoDaMesada, rotuloDaPeriodicidade, situacaoDoLogin } from '@/lib/filhos'
import type { FilhoListado } from '@/servicos/filhos'
import { coresLiterais } from './ajuda-estatica'
import { renderizar } from './renderizar'

const SRC = path.resolve(process.cwd(), 'src')

const ana: FilhoListado = {
  id: 'f1',
  nome: 'Ana',
  nascimento: '2015-03-20',
  mesadaCentavos: 5000,
  periodicidade: 'semanal',
  login: { ativo: true, email: 'ana@exemplo.local' },
}
const bia: FilhoListado = { ...ana, id: 'f2', nome: 'Bia', mesadaCentavos: 123456, periodicidade: 'mensal', login: null }
const caio: FilhoListado = { ...ana, id: 'f3', nome: 'Caio', login: { ativo: false, email: 'caio@exemplo.local' } }

describe('apresentação da mesada combinada', () => {
  it('valor em reais e período por extenso, sem ponto flutuante', () => {
    expect(descricaoDaMesada(5000, 'semanal')).toBe('R$ 50,00 por semana')
    expect(descricaoDaMesada(123456, 'mensal')).toBe('R$ 1.234,56 por mês')
    expect(descricaoDaMesada(10, 'mensal')).toBe('R$ 0,10 por mês')
  })

  it('periodicidade e situação do login em palavras', () => {
    expect(rotuloDaPeriodicidade('semanal')).toBe('semanal')
    expect(rotuloDaPeriodicidade('xyz')).toBe('xyz')
    expect(situacaoDoLogin(null)).toBe('Sem login')
    expect(situacaoDoLogin({ ativo: true })).toBe('Login ativo')
    expect(situacaoDoLogin({ ativo: false })).toBe('Login desativado')
  })
})

describe('ListaDeFilhos', () => {
  it('mostra nome com link, mesada combinada e a situação do login em texto', () => {
    const html = renderizar(ListaDeFilhos, { filhos: [ana, bia, caio] })
    expect(html).toMatch(/<a[^>]*href="\/filhos\/f1"[^>]*>Ana<\/a>/)
    expect(html).toContain('R$ 50,00 por semana')
    expect(html).toContain('R$ 1.234,56 por mês')
    expect(html).toContain('Login ativo')
    expect(html).toContain('Sem login')
    expect(html).toContain('Login desativado')
    expect(html).not.toContain('ana@exemplo.local')
  })

  it('lista vazia mostra a mensagem com o atalho para cadastrar', () => {
    const html = renderizar(ListaDeFilhos, { filhos: [] })
    expect(html).toContain('Nenhum filho cadastrado ainda')
    expect(html).toMatch(/<a[^>]*href="\/filhos\/novo"[^>]*>Cadastre o primeiro filho<\/a>/)
    expect(html).not.toContain('lista-de-filhos')
  })
})

describe('CamposDoFilho', () => {
  it('no cadastro, pede nome, valor, periodicidade e nascimento opcional, e mais nada', () => {
    const html = renderizar(CamposDoFilho, {})
    for (const nome of ['nome', 'valor', 'periodicidade', 'nascimento']) {
      expect(html).toMatch(new RegExp(`name="${nome}"`))
    }
    expect(html).not.toMatch(/name="(cpf|rg|telefone|endereco|foto|id)"/)
    expect(html).toMatch(/<option value="semanal">Semanal<\/option>/)
    expect(html).toMatch(/<option value="mensal"[^>]*>Mensal<\/option>/)
    expect(html).toMatch(/name="nascimento"(?![^>]*required)/)
    expect(html).toContain('não credita nem calcula mesada sozinho')
  })

  it('na edição, volta o valor ao formato brasileiro e leva o id', () => {
    const html = renderizar(CamposDoFilho, {
      inicial: { id: 'f1', nome: 'Ana', nascimento: '2015-03-20', valor: '1234,56', periodicidade: 'semanal' },
    })
    expect(html).toMatch(/name="id"[^>]*value="f1"|value="f1"[^>]*name="id"/)
    expect(html).toContain('value="1234,56"')
    expect(html).toContain('value="2015-03-20"')
    expect(html).toMatch(/<option value="semanal" selected="">Semanal<\/option>/)
  })
})

describe('LoginDoFilho', () => {
  it('sem login, oferece criar com e-mail e senha provisória', () => {
    const html = renderizar(LoginDoFilho, { filhoId: 'f2', login: null })
    expect(html).toContain('Criar login')
    expect(html).toMatch(/name="email"/)
    expect(html).toMatch(/type="password"[^>]*name="senha"|name="senha"[^>]*type="password"/)
    expect(html).not.toContain('Desativar login')
  })

  it('com login ativo, mostra a situação em texto e o botão de desativar', () => {
    const html = renderizar(LoginDoFilho, { filhoId: 'f1', login: { ativo: true, email: 'ana@exemplo.local' } })
    expect(html).toContain('Login ativo')
    expect(html).toContain('ana@exemplo.local')
    expect(html).toContain('Desativar login')
    expect(html).not.toContain('Criar login')
  })

  it('a desativação pede confirmação antes de enviar', () => {
    const html = renderizar(LoginDoFilho, {
      filhoId: 'f1',
      login: { ativo: true, email: 'ana@exemplo.local' },
      confirmandoInicial: true,
    })
    expect(html).toContain('Confirmar desativação')
    expect(html).toContain('Cancelar')
  })

  it('com login desativado, diz isso e não oferece reativar nem desativar', () => {
    const html = renderizar(LoginDoFilho, { filhoId: 'f3', login: { ativo: false, email: 'caio@exemplo.local' } })
    expect(html).toContain('Login desativado')
    expect(html).not.toContain('Desativar login')
    expect(html).not.toMatch(/Reativar/)
  })
})

describe('navegação do responsável', () => {
  it('o responsável vê a Família (onde estão os filhos) e o adulto não', () => {
    const responsavel = renderizar(Navegacao, { ehAdmin: true, podeLancar: true })
    const adulto = renderizar(Navegacao, { ehAdmin: false, podeLancar: true })
    expect(responsavel).toMatch(/<a[^>]*href="\/familia"[^>]*>Família<\/a>/)
    expect(adulto).not.toContain('/familia')
  })
})

describe('só tokens', () => {
  it.each([
    'src/componentes/ListaDeFilhos.tsx',
    'src/componentes/CamposDoFilho.tsx',
    'src/componentes/LoginDoFilho.tsx',
    'src/lib/filhos.ts',
  ])('%s não escreve cor por extenso', (arquivo) => {
    expect(coresLiterais(readFileSync(path.resolve(process.cwd(), arquivo), 'utf8'))).toEqual([])
  })

  it('os estilos dos filhos usam só var(--token) e a lista empilha no celular', () => {
    const css = readFileSync(path.join(SRC, 'estilos/global.css'), 'utf8')
    const inicio = css.indexOf('/* ---------- filhos (FT-05) ---------- */')
    expect(inicio).toBeGreaterThan(0)
    const bloco = css.slice(inicio, css.indexOf('/* ---------- celular ---------- */'))
    expect(bloco).toContain('.cartao-de-filho')
    expect(bloco).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(bloco).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/)
    expect(css.slice(css.indexOf('@media (max-width: 768px)'))).toContain('.lista-de-filhos')
  })
})
