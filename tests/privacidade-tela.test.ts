/**
 * As telas de privacidade (FT-07, PR-09, PR-16, PR-07): a página explica em
 * português o que é exportado e o que a exclusão apaga, baixa o arquivo por um
 * formulário POST, e apaga a conta do filho em dois passos digitando o nome.
 * Estados vazio, preparando e erro em texto; só tokens; menu só do responsável.
 * A negação por papel no servidor real é provada em privacidade-rotas.test.ts.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PainelDePrivacidade } from '@/componentes/PainelDePrivacidade'
import { BaixarDados } from '@/componentes/BaixarDados'
import { ApagarFilho } from '@/componentes/ApagarFilho'
import { Navegacao } from '@/componentes/Navegacao'
import type { FilhoListado } from '@/servicos/filhos'
import { coresLiterais } from './ajuda-estatica'
import { renderizar } from './renderizar'

const SRC = path.resolve(process.cwd(), 'src')
const ler = (arquivo: string) => readFileSync(path.resolve(process.cwd(), arquivo), 'utf8')

const filho = (id: string, nome: string): FilhoListado => ({
  id,
  nome,
  nascimento: null,
  mesadaCentavos: 5000,
  periodicidade: 'semanal',
  login: null,
})

describe('a página de privacidade', () => {
  const html = renderizar(PainelDePrivacidade, { filhos: [filho('f1', 'Ana'), filho('f2', 'Pedro')], excluido: false })

  it('explica o que o arquivo leva e o que ele nunca leva', () => {
    expect(html).toContain('Privacidade')
    for (const item of ['usuários', 'categorias', 'lançamentos', 'filhos', 'mesada', 'atividade']) {
      expect(html, item).toContain(item)
    }
    expect(html).toMatch(/centavos/)
    expect(html).toMatch(/nunca (leva|inclui)[^<]*senha/i)
  })

  it('explica o que a exclusão apaga e que não dá para desfazer', () => {
    expect(html).toMatch(/não pode ser desfeita/)
    for (const item of ['cadastro do filho', 'movimentos de mesada', 'login']) expect(html, item).toContain(item)
    expect(html).toMatch(/nome[^<]*(trocado|substitu)/i)
    expect(html).toMatch(/baixe[^<]*antes/i)
  })

  it('baixa por um formulário POST para a rota do servidor', () => {
    expect(html).toMatch(/<form[^>]*method="post"[^>]*action="\/api\/privacidade\/exportar"|<form[^>]*action="\/api\/privacidade\/exportar"[^>]*method="post"/)
    expect(html).toContain('Baixar os dados da família')
  })

  it('lista cada filho com o seu apagar', () => {
    expect(html).toContain('Ana')
    expect(html).toContain('Pedro')
    expect(html).toContain('Apagar a conta de Ana')
    expect(html).toContain('Apagar a conta de Pedro')
  })

  it('sem filhos, diz que não há o que apagar', () => {
    const vazio = renderizar(PainelDePrivacidade, { filhos: [], excluido: false })
    expect(vazio).toContain('Nenhum filho cadastrado')
    expect(vazio).not.toMatch(/<button[^>]*>Apagar a conta de/)
    expect(vazio).toContain('Baixar os dados da família')
  })

  it('depois de apagar, avisa em texto, sem nome', () => {
    const feito = renderizar(PainelDePrivacidade, { filhos: [], excluido: true })
    expect(feito).toMatch(/role="status"[^>]*>[^<]*A conta e o histórico do filho foram apagados/)
    expect(html).not.toContain('foram apagados')
  })
})

describe('baixar os dados', () => {
  it('em repouso, o botão está ativo e não há mensagem', () => {
    const html = renderizar(BaixarDados, {})
    expect(html).toContain('Baixar os dados da família')
    expect(html).not.toContain('disabled')
    expect(html).not.toContain('role="alert"')
  })

  it('preparando, o botão fica desligado e o estado é dito em texto', () => {
    const html = renderizar(BaixarDados, { situacaoInicial: 'preparando' })
    expect(html).toContain('Preparando o arquivo')
    expect(html).toMatch(/<button[^>]*disabled/)
    expect(html).toContain('role="status"')
  })

  it('com erro, diz o que fazer, em alerta', () => {
    const html = renderizar(BaixarDados, { situacaoInicial: 'erro' })
    expect(html).toMatch(/role="alert"[^>]*>[^<]*Não foi possível baixar/)
    expect(html).toContain('Tente de novo')
  })

  it('pronto, confirma o download e lembra de guardar o arquivo', () => {
    const html = renderizar(BaixarDados, { situacaoInicial: 'pronto' })
    expect(html).toContain('Arquivo baixado')
    expect(html).toMatch(/guarde/i)
  })
})

describe('apagar a conta do filho em dois passos', () => {
  it('no primeiro passo só há o botão: nada de campo nem formulário', () => {
    const html = renderizar(ApagarFilho, { filhoId: 'f1', nome: 'Ana' })
    expect(html).toContain('Apagar a conta de Ana')
    expect(html).not.toMatch(/<form|<input/)
  })

  it('no segundo passo pede o nome, avisa que é definitivo e oferece cancelar', () => {
    const html = renderizar(ApagarFilho, { filhoId: 'f1', nome: 'Ana', confirmandoInicial: true })
    expect(html).toMatch(/<form/)
    expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="id"[^>]*value="f1"|<input[^>]*name="id"[^>]*type="hidden"[^>]*value="f1"/)
    expect(html).toMatch(/<input[^>]*name="confirmacao"/)
    expect(html).toMatch(/Digite <strong>Ana<\/strong>|Digite "?Ana"? para confirmar/)
    expect(html).toContain('não pode ser desfeita')
    expect(html).toContain('Apagar para sempre')
    expect(html).toContain('Cancelar')
    // O rótulo do campo é de verdade (acessibilidade).
    expect(html).toMatch(/<label[^>]*class="campo"/)
  })

  it('o nome do filho é escapado, não vira marcação', () => {
    const html = renderizar(ApagarFilho, { filhoId: 'f1', nome: '<b>Ana</b>', confirmandoInicial: true })
    expect(html).not.toContain('<b>Ana</b>')
    expect(html).toContain('&lt;b&gt;Ana&lt;/b&gt;')
  })
})

describe('menu e página do filho', () => {
  it('só o responsável vê Privacidade', () => {
    const responsavel = renderizar(Navegacao, { ehAdmin: true, podeLancar: true })
    const adulto = renderizar(Navegacao, { ehAdmin: false, podeLancar: true })
    const filhoNav = renderizar(Navegacao, { ehAdmin: false, ehFilho: true })
    expect(responsavel).toMatch(/<a[^>]*href="\/privacidade"[^>]*>Privacidade<\/a>/)
    expect(adulto).not.toContain('Privacidade')
    expect(filhoNav).not.toContain('Privacidade')
  })

  it('a página do filho tem o apagar, e a de privacidade usa a guarda do responsável', () => {
    expect(ler('src/app/(sistema)/filhos/[id]/page.tsx')).toContain('<ApagarFilho')
    const pagina = ler('src/app/(sistema)/privacidade/page.tsx')
    expect(pagina).toContain('exigirUsuarioAdmin')
    expect(pagina).toContain('listarFilhos')
  })
})

describe('só tokens e celular', () => {
  it.each([
    'src/componentes/PainelDePrivacidade.tsx',
    'src/componentes/BaixarDados.tsx',
    'src/componentes/ApagarFilho.tsx',
    'src/lib/privacidade.ts',
  ])('%s não escreve cor por extenso', (arquivo) => {
    expect(coresLiterais(ler(arquivo))).toEqual([])
  })

  it('os botões usam as classes que ganham 44px no celular', () => {
    for (const arquivo of ['src/componentes/BaixarDados.tsx', 'src/componentes/ApagarFilho.tsx']) {
      expect(ler(arquivo), arquivo).toMatch(/className="(primario|secundario|perigo)"/)
    }
  })

  it('os estilos de privacidade usam só var(--token) e empilham no celular', () => {
    const css = readFileSync(path.join(SRC, 'estilos/global.css'), 'utf8')
    const inicio = css.indexOf('/* ---------- privacidade (FT-07) ---------- */')
    expect(inicio).toBeGreaterThan(0)
    const bloco = css.slice(inicio, css.indexOf('/* ---------- celular ---------- */'))
    expect(bloco).toContain('.painel-de-privacidade')
    expect(bloco).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(bloco).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/)
    expect(css.slice(css.indexOf('@media (max-width: 768px)'))).toContain('.apagar-por-filho')
  })
})
