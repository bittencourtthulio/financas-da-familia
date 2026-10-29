/**
 * As telas da família (FT-10): a família desenhada cresce com os membros, o
 * editor de avatar é um formulário de verdade com prévia, o rostinho aparece
 * no cabeçalho e nos cartões, e a navegação tem a área Família com Filhos e
 * Usuários dentro dela.
 */
import { describe, it, expect } from 'vitest'
import { EditorDeAvatar } from '@/componentes/EditorDeAvatar'
import { MenuDoUsuario } from '@/componentes/MenuDoUsuario'
import { CartoesDaFamilia } from '@/componentes/CartoesDaFamilia'
import { Navegacao } from '@/componentes/Navegacao'
import { FamiliaDesenhada, Personagem, Rostinho } from '@/componentes/ilustracoes/Familia'
import type { Avatar } from '@/lib/avatar'
import { renderizar } from './renderizar'

const MAE: Avatar = { figura: 'mae', pele: 4, cabelo: 3, roupa: 'menta', oculos: true }
const MENINA: Avatar = { figura: 'menina', pele: 1, cabelo: 2, roupa: 'amarelo', oculos: false }

describe('a família desenhada', () => {
  it('tem um personagem por membro mais o cachorro, e a largura acompanha', () => {
    const dois = renderizar(FamiliaDesenhada, { membros: [{ avatar: MAE, tipo: 'adulto' }, { avatar: null, tipo: 'crianca' }] })
    const seis = renderizar(FamiliaDesenhada, { membros: Array.from({ length: 6 }, () => ({ avatar: null, tipo: 'adulto' as const })) })
    expect(dois.match(/class="personagem"/g)).toHaveLength(3)
    expect(seis.match(/class="personagem"/g)).toHaveLength(7)
    expect(dois).toContain('class="rabo"')
    expect(seis.match(/viewBox="0 0 (\d+) 200"/)?.[1]).not.toEqual(dois.match(/viewBox="0 0 (\d+) 200"/)?.[1])
  })

  it('o avatar escolhido pinta pele, cabelo e roupa pelos tokens; óculos só quando pedido', () => {
    const html = renderizar(Personagem, { avatar: MAE })
    expect(html).toContain('var(--ilu-pele-4)')
    expect(html).toContain('var(--ilu-cabelo-3)')
    expect(html).toContain('var(--cor-menta)')
    expect(html).toContain('stroke="var(--ilu-traco)" stroke-width="2"')
    expect(renderizar(Personagem, { avatar: MENINA })).not.toContain('stroke-width="2"')
    expect(html).not.toMatch(/#[0-9a-f]{6}/i)
  })

  it('sem avatar, a figura é neutra e muda de cor pelo índice', () => {
    const a = renderizar(Personagem, { avatar: null, tipo: 'crianca', indice: 0 })
    const b = renderizar(Personagem, { avatar: null, tipo: 'crianca', indice: 1 })
    expect(a).not.toEqual(b)
    expect(a).not.toContain('stroke-width="2"')
  })
})

describe('o editor de avatar', () => {
  const html = renderizar(EditorDeAvatar, { inicial: MAE, figuras: ['pai', 'mae'], tipo: 'adulto' })

  it('é formulário de verdade: rádios avatarFigura/Pele/Cabelo/Roupa e a caixa de óculos, com o atual marcado', () => {
    for (const campo of ['avatarFigura', 'avatarPele', 'avatarCabelo', 'avatarRoupa']) {
      expect(html, campo).toMatch(new RegExp(`<input[^>]*type="radio"[^>]*name="${campo}"`))
    }
    expect(html).toMatch(/<input[^>]*type="checkbox"[^>]*name="avatarOculos"[^>]*checked=""/)
    expect(html).toMatch(/<input[^>]*name="avatarFigura"[^>]*checked=""[^>]*value="mae"/)
    expect(html).toMatch(/<input[^>]*name="avatarPele"[^>]*checked=""[^>]*value="4"/)
    expect(html).not.toMatch(/value="menino"/)
  })

  it('mostra a prévia como imagem rotulada e as amostras só com tokens', () => {
    expect(html).toContain('aria-label="Prévia: Mãe"')
    expect(html.match(/class="amostra"/g)?.length).toBe(4 + 5 + 8)
    expect(html).not.toMatch(/#[0-9a-f]{6}/i)
  })

  it('sem avatar inicial, oferece a primeira figura da lista', () => {
    const vazio = renderizar(EditorDeAvatar, { inicial: null, figuras: ['menino', 'menina'], tipo: 'crianca' })
    expect(vazio).toMatch(/<input[^>]*name="avatarFigura"[^>]*checked=""[^>]*value="menino"/)
  })
})

describe('rostinho e cartões', () => {
  it('o cabeçalho mostra o rostinho quando há avatar e a inicial quando não há', () => {
    const com = renderizar(MenuDoUsuario, { nome: 'Carla', email: 'c@x.y', papel: 'Responsável', avatar: MAE, children: null })
    const sem = renderizar(MenuDoUsuario, { nome: 'Carla', email: 'c@x.y', papel: 'Responsável', children: null })
    expect(com).toContain('rostinho avatar-do-badge')
    expect(com).toContain('<span>Responsável</span>')
    expect(sem).not.toContain('rostinho')
    expect(sem).toContain('>C</span>')
  })

  it('o rostinho da menina leva as marias-chiquinhas; o da mãe, o cabelo comprido', () => {
    expect(renderizar(Rostinho, { avatar: MENINA })).toContain('cx="22" cy="74" r="14"')
    expect(renderizar(Rostinho, { avatar: MAE })).toContain('M24 58 Q24 14 60 16')
  })

  it('os cartões levam cada pessoa à sua página e dizem quem ainda não tem avatar', () => {
    const html = renderizar(CartoesDaFamilia, {
      membros: [
        { id: 'u1', nome: 'Carla', tipo: 'adulto', papel: 'admin', ativo: true, avatar: MAE },
        { id: 'f1', nome: 'Ana', tipo: 'crianca', papel: 'filho', ativo: true, avatar: null },
      ],
    })
    expect(html).toMatch(/<a[^>]*href="\/familia\/adultos\/u1"/)
    expect(html).toMatch(/<a[^>]*href="\/filhos\/f1"/)
    expect(html).toContain('Ainda sem avatar')
    expect(html).toContain('Responsável')
    expect(html).toContain('Filho')
  })
})

describe('a navegação', () => {
  it('o responsável tem uma área Família só (sem Filhos e Usuários à parte); Configurações fica só com o perfil', () => {
    const html = renderizar(Navegacao, { ehAdmin: true, podeLancar: true })
    expect(html).toMatch(/<a[^>]*href="\/familia"[^>]*>Família<\/a>/)
    expect(html).not.toMatch(/>Filhos<\/a>/)
    expect(html).not.toMatch(/>Usuários<\/a>/)
    const configuracoes = html.slice(html.indexOf('Configurações'))
    expect(configuracoes).not.toContain('/configuracoes/usuarios')
    expect(configuracoes).toContain('/perfil')
  })

  it('o adulto e o filho não veem a área Família', () => {
    expect(renderizar(Navegacao, { ehAdmin: false, podeLancar: true })).not.toContain('/familia')
    expect(renderizar(Navegacao, { ehAdmin: false, ehFilho: true })).not.toContain('/familia')
  })
})
