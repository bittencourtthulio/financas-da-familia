/**
 * Prova do harness: um componente .tsx real do projeto é importado pelo
 * vitest e renderizado para HTML. Sem isso, as sprints seguintes não teriam
 * como testar a interface (regra 13 do sprintx).
 */
import { describe, it, expect } from 'vitest'
import { Campo } from '@/componentes/Formulario'
import { renderizar } from './renderizar'

describe('harness de componentes', () => {
  it('importa um componente tsx do projeto e o renderiza', () => {
    const html = renderizar(Campo, { nome: 'email', rotulo: 'E-mail', tipo: 'email' })
    expect(html.length).toBeGreaterThan(0)
  })

  it('o Campo vira um label com o rótulo e um input obrigatório do tipo certo', () => {
    const html = renderizar(Campo, { nome: 'email', rotulo: 'E-mail', tipo: 'email' })
    expect(html).toContain('<span>E-mail</span>')
    expect(html).toMatch(/<input[^>]*type="email"/)
    expect(html).toMatch(/<input[^>]*name="email"/)
    expect(html).toMatch(/<input[^>]*required/)
  })

  it('o Campo opcional não exige preenchimento e traz o valor padrão', () => {
    const html = renderizar(Campo, {
      nome: 'nome',
      rotulo: 'Nome',
      padrao: 'Ana',
      obrigatorio: false,
    })
    expect(html).not.toMatch(/<input[^>]*required/)
    expect(html).toContain('value="Ana"')
  })
})
