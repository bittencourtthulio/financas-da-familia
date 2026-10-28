/**
 * Estados de tela (PR-16, PR-14): carregando, erro e página inexistente, em
 * português, e o erro nunca mostra mensagem técnica nem rastro de pilha.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { EstadoDeCarregando } from '@/componentes/EstadoDeCarregando'
import { EstadoDeErro } from '@/componentes/EstadoDeErro'
import Carregando from '@/app/(sistema)/loading'
import ErroDoSistema from '@/app/(sistema)/error'
import ErroDaRaiz from '@/app/error'
import NaoEncontrado from '@/app/not-found'
import { renderizar } from './renderizar'

const SRC = path.resolve(process.cwd(), 'src')

function erroTecnico(): Error & { digest?: string } {
  const erro: Error & { digest?: string } = new Error('SELECT secreto FROM usuarios')
  erro.stack = 'Error: SELECT secreto\n    at /app/src/servicos/usuarios.ts:42:7'
  erro.digest = 'abc123'
  return erro
}

describe('carregando', () => {
  it('anuncia o carregamento ao leitor de tela, em português', () => {
    const html = renderizar(EstadoDeCarregando, {})
    expect(html).toContain('role="status"')
    expect(html).toContain('Carregando')
  })

  it('a rota do sistema usa o estado de carregamento', () => {
    expect(renderizar(Carregando, {})).toContain('Carregando')
  })
})

describe('erro', () => {
  it('nunca mostra a mensagem técnica nem o rastro de pilha', () => {
    const html = renderizar(EstadoDeErro, { erro: erroTecnico(), aoTentarDeNovo: () => {} })
    expect(html).not.toContain('SELECT')
    expect(html).not.toContain('secreto')
    expect(html.toLowerCase()).not.toContain('stack')
    expect(html).not.toContain('usuarios.ts')
  })

  it('é um alerta em português com o botão Tentar de novo e o código de correlação', () => {
    const html = renderizar(EstadoDeErro, { erro: erroTecnico(), aoTentarDeNovo: () => {} })
    expect(html).toContain('role="alert"')
    expect(html).toContain('Algo deu errado')
    expect(html).toContain('Tentar de novo')
    expect(html).toContain('abc123')
  })

  it('sem código de correlação, não inventa um', () => {
    const html = renderizar(EstadoDeErro, { erro: new Error('x'), aoTentarDeNovo: () => {} })
    expect(html).not.toContain('Código')
  })

  it('as telas de erro do sistema e da raiz usam o mesmo estado', () => {
    for (const Tela of [ErroDoSistema, ErroDaRaiz]) {
      const html = renderizar(Tela, { error: erroTecnico(), reset: () => {} })
      expect(html).toContain('Algo deu errado')
      expect(html).not.toContain('SELECT')
    }
  })

  it('nenhum arquivo de estado lê error.message ou error.stack', () => {
    const arquivos = [
      'componentes/EstadoDeErro.tsx',
      'app/(sistema)/error.tsx',
      'app/error.tsx',
    ]
    for (const arquivo of arquivos) {
      const texto = readFileSync(path.join(SRC, arquivo), 'utf8')
      expect(texto, arquivo).not.toMatch(/\.(message|stack)\b/)
    }
  })
})

describe('página não encontrada', () => {
  it('fala português e leva de volta ao painel', () => {
    const html = renderizar(NaoEncontrado, {})
    expect(html).toContain('Página não encontrada')
    expect(html).toMatch(/<a[^>]*href="\/"/)
  })
})
