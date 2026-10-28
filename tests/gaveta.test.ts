/**
 * Celular (PR-16): abaixo de 768px a barra lateral vira gaveta, aberta por um
 * botão Menu e fechada ao navegar. A lógica de estado é pura (src/lib/gaveta.ts);
 * a casca e o botão são renderizados pelo harness.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { alternarGaveta, gavetaAberta } from '@/lib/gaveta'
import { CascaDoSistema } from '@/componentes/CascaDoSistema'
import { BotaoDaGaveta } from '@/componentes/BotaoDaGaveta'
import { corpoDe } from './ajuda-estatica'
import { renderizar } from './renderizar'

describe('estado da gaveta', () => {
  it('alternar abre a gaveta fechada e fecha a aberta, na mesma rota', () => {
    const aberta = alternarGaveta(null, '/')
    expect(aberta).toBe('/')
    expect(alternarGaveta(aberta, '/')).toBeNull()
  })

  it('a gaveta aberta numa rota conta como fechada em outra (fecha ao navegar)', () => {
    expect(gavetaAberta('/', '/')).toBe(true)
    expect(gavetaAberta('/', '/perfil')).toBe(false)
    expect(gavetaAberta(null, '/')).toBe(false)
  })

  it('alternar numa rota nova abre, em vez de fechar uma gaveta esquecida', () => {
    expect(alternarGaveta('/', '/perfil')).toBe('/perfil')
  })
})

describe('casca e botão', () => {
  it('a casca nasce fechada: tem a classe aplicacao e não tem gaveta-aberta', () => {
    const html = renderizar(CascaDoSistema, { children: 'conteúdo' })
    expect(html).toMatch(/class="aplicacao"/)
    expect(html).not.toContain('gaveta-aberta')
    expect(html).toContain('conteúdo')
  })

  it('o botão Menu avisa o leitor de tela que controla a barra lateral e que está fechada', () => {
    const html = renderizar(BotaoDaGaveta, {})
    expect(html).toContain('Menu')
    expect(html).toContain('aria-controls="barra-lateral"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-label="Abrir menu"')
    expect(html).toContain('type="button"')
  })
})

describe('estilo da gaveta', () => {
  const global = readFileSync(path.resolve(process.cwd(), 'src/estilos/global.css'), 'utf8')

  it('o botão Menu fica oculto por padrão e só aparece dentro da regra de 768px', () => {
    const celular = corpoDe(global, '@media (max-width: 768px)')
    const fora = global.replace(celular, '')
    expect(fora).toMatch(/\.botao-gaveta\s*\{[^}]*display:\s*none/)
    expect(celular).toMatch(/\.botao-gaveta\s*\{[^}]*display:\s*inline-block/)
  })

  it('a tabela rolável existe para a tela de usuários não estourar a largura', () => {
    expect(global).toMatch(/\.tabela-rolavel\s*\{[^}]*overflow-x:\s*auto/)
  })
})
