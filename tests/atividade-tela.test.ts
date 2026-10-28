/**
 * A tela Atividade (FT-02): tabela em português com data e hora de São Paulo,
 * estado vazio, paginação, item de menu só para o responsável e nenhuma cor
 * escrita por extenso (PR-07, PR-16). O acesso por papel e a leitura no
 * servidor real são provados em rotas.test.ts.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { TabelaDeAtividade } from '@/componentes/TabelaDeAtividade'
import { PaginacaoDeAtividade } from '@/componentes/PaginacaoDeAtividade'
import { Navegacao } from '@/componentes/Navegacao'
import { descreverAtividade, type RegistroParaExibir } from '@/lib/atividade'
import { coresLiterais } from './ajuda-estatica'
import { renderizar } from './renderizar'

const SRC = path.resolve(process.cwd(), 'src')

const criado: RegistroParaExibir = {
  atorNome: 'Responsável de demonstração',
  acao: 'usuario.criado',
  detalhe: { alvoNome: 'Adulto de demonstração', papel: 'usuario' },
  criadoEm: new Date('2026-10-28T02:30:00Z'), // 27/10 23:30 em São Paulo
}
const papel: RegistroParaExibir = {
  atorNome: 'Responsável de demonstração',
  acao: 'usuario.papel_alterado',
  detalhe: { alvoNome: 'Adulto de demonstração', de: 'admin', para: 'usuario' },
  criadoEm: new Date('2026-10-28T15:00:00Z'),
}
const desativado: RegistroParaExibir = {
  atorNome: 'Outro Responsável',
  acao: 'usuario.desativado',
  detalhe: { alvoNome: 'Fulano' },
  criadoEm: new Date('2026-10-28T16:45:00Z'),
}

describe('descreverAtividade', () => {
  it('diz quem, o quê, a quem e quando, em português e no fuso de São Paulo', () => {
    expect(descreverAtividade(criado)).toEqual({
      quando: '27/10/2026 23:30',
      quem: 'Responsável de demonstração',
      acao: 'Criou o usuário Adulto de demonstração',
      detalhe: 'Papel: Adulto',
    })
  })

  it('traduz os papéis pelos rótulos da interface, nunca admin ou usuario', () => {
    const d = descreverAtividade(papel)
    expect(d.acao).toBe('Alterou o papel de Adulto de demonstração')
    expect(d.detalhe).toBe('De Responsável para Adulto')
    expect(JSON.stringify(d)).not.toMatch(/admin|usuario/)
  })

  it('desativação não tem detalhe', () => {
    expect(descreverAtividade(desativado)).toMatchObject({
      acao: 'Desativou o usuário Fulano',
      detalhe: '',
    })
  })

  it('ação desconhecida e detalhe faltando não derrubam a tela nem mostram "undefined"', () => {
    const d = descreverAtividade({ ...criado, acao: 'coisa.nova', detalhe: {} })
    expect(d.acao).toBe('coisa.nova')
    expect(JSON.stringify(d)).not.toContain('undefined')
  })
})

describe('TabelaDeAtividade', () => {
  it('mostra data e hora, ator, ação e detalhe de cada registro, em tabela rolável', () => {
    const html = renderizar(TabelaDeAtividade, { itens: [criado, papel, desativado] })
    expect(html).toContain('tabela-rolavel')
    for (const cabecalho of ['Quando', 'Quem', 'Ação', 'Detalhe']) {
      expect(html).toContain(`>${cabecalho}<`)
    }
    expect(html).toContain('27/10/2026 23:30')
    expect(html).toContain('Responsável de demonstração')
    expect(html).toContain('Criou o usuário Adulto de demonstração')
    expect(html).toContain('De Responsável para Adulto')
    expect(html).toContain('Outro Responsável')
    expect((html.match(/<tr/g) ?? []).length).toBe(4) // cabeçalho + 3
  })

  it('sem registro mostra o estado vazio em português, sem tabela', () => {
    const html = renderizar(TabelaDeAtividade, { itens: [] })
    expect(html).toContain('class="vazio"')
    expect(html).toContain('Ainda não há atividade registrada')
    expect(html).not.toContain('<table')
  })

  it('escapa o que veio do registro (nome com marcação não vira HTML)', () => {
    const html = renderizar(TabelaDeAtividade, {
      itens: [{ ...criado, atorNome: '<script>alert(1)</script>' }],
    })
    expect(html).not.toContain('<script>')
  })
})

describe('PaginacaoDeAtividade', () => {
  it('na primeira página só há Próxima; na última só Anterior; no meio as duas', () => {
    const primeira = renderizar(PaginacaoDeAtividade, { pagina: 1, paginas: 3 })
    expect(primeira).toContain('href="/atividade?pagina=2"')
    expect(primeira).not.toContain('Anterior')
    expect(primeira).toContain('Página 1 de 3')

    const meio = renderizar(PaginacaoDeAtividade, { pagina: 2, paginas: 3 })
    expect(meio).toContain('href="/atividade?pagina=1"')
    expect(meio).toContain('href="/atividade?pagina=3"')

    const ultima = renderizar(PaginacaoDeAtividade, { pagina: 3, paginas: 3 })
    expect(ultima).toContain('href="/atividade?pagina=2"')
    expect(ultima).not.toContain('Próxima')
  })

  it('com uma página só, não aparece', () => {
    expect(renderizar(PaginacaoDeAtividade, { pagina: 1, paginas: 1 })).toBe('')
  })
})

describe('item Atividade no menu', () => {
  it('o responsável vê o link; o adulto não', () => {
    const responsavel = renderizar(Navegacao, { ehAdmin: true })
    const adulto = renderizar(Navegacao, { ehAdmin: false })
    expect(responsavel).toMatch(/<a[^>]*href="\/atividade"[^>]*>Atividade<\/a>/)
    expect(adulto).not.toContain('/atividade')
    expect(adulto).not.toContain('Atividade')
  })
})

describe('estados e tokens da tela', () => {
  it('a rota herda carregando e erro do grupo (sistema), sem arquivo próprio', () => {
    expect(existsSync(path.join(SRC, 'app/(sistema)/loading.tsx'))).toBe(true)
    expect(existsSync(path.join(SRC, 'app/(sistema)/error.tsx'))).toBe(true)
    expect(existsSync(path.join(SRC, 'app/(sistema)/atividade/page.tsx'))).toBe(true)
    expect(existsSync(path.join(SRC, 'app/(sistema)/atividade/loading.tsx'))).toBe(false)
    expect(existsSync(path.join(SRC, 'app/(sistema)/atividade/error.tsx'))).toBe(false)
  })

  it('a página exige o responsável no servidor, antes de ler o registro', () => {
    const fonte = readFileSync(path.join(SRC, 'app/(sistema)/atividade/page.tsx'), 'utf8')
    expect(fonte).toContain('exigirUsuarioAdmin')
    expect(fonte.indexOf('exigirUsuarioAdmin()')).toBeLessThan(fonte.indexOf('listarAtividade('))
  })

  it('nenhum arquivo novo escreve cor por extenso', () => {
    for (const arquivo of [
      'componentes/TabelaDeAtividade.tsx',
      'componentes/PaginacaoDeAtividade.tsx',
      'app/(sistema)/atividade/page.tsx',
    ]) {
      expect(coresLiterais(readFileSync(path.join(SRC, arquivo), 'utf8')), arquivo).toEqual([])
    }
  })
})
