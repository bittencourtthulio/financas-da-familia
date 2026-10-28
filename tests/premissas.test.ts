/**
 * Coerência das premissas: o frontmatter bate com os blocos PR-NN, e toda
 * premissa que o MAPA.md diz que a FT-01 realiza está marcada como realizada
 * por ela. O B4 e o relatório final dependem disso para saber o que foi
 * decidido em nome do humano e onde virou código.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const RAIZ = process.cwd()
const premissas = readFileSync(path.join(RAIZ, 'docs/projeto/PREMISSAS.md'), 'utf8')
const mapa = readFileSync(path.join(RAIZ, 'docs/projeto/MAPA.md'), 'utf8')

interface Premissa {
  id: string
  origem: string
  realizadaEm: string
  invalida: string
}

export function lerPremissas(texto: string): Premissa[] {
  return texto
    .split(/^### /m)
    .slice(1)
    .map((bloco) => {
      const campo = (nome: string) =>
        new RegExp(`\\*\\*${nome}:\\*\\*\\s*(.*)`).exec(bloco)?.[1]?.trim() ?? ''
      return {
        id: /^(PR-\d+)/.exec(bloco)?.[1] ?? '',
        origem: campo('Origem'),
        realizadaEm: campo('Realizada em'),
        invalida: campo('O que invalida'),
      }
    })
}

const lista = lerPremissas(premissas)

function frontmatter(texto: string): string {
  return /^---\n([\s\S]*?)\n---/.exec(texto)?.[1] ?? ''
}

describe('PREMISSAS.md', () => {
  it('o total e os totais por origem do frontmatter batem com os blocos PR-NN', () => {
    const fm = frontmatter(premissas)
    expect(Number(/^total:\s*(\d+)/m.exec(fm)?.[1])).toBe(lista.length)
    const porOrigem: Record<string, number> = {}
    for (const p of lista) porOrigem[p.origem] = (porOrigem[p.origem] ?? 0) + 1
    for (const [origem, qtd] of Object.entries(porOrigem)) {
      const declarado = Number(new RegExp(`^\\s+${origem}:\\s*(\\d+)`, 'm').exec(fm)?.[1])
      expect(declarado, origem).toBe(qtd)
    }
  })

  it('os ids são PR-01 a PR-NN, sem buraco nem repetição', () => {
    expect(lista.map((p) => p.id)).toEqual(
      lista.map((_, i) => `PR-${String(i + 1).padStart(2, '0')}`),
    )
  })

  it('toda premissa diz o que a invalidaria', () => {
    for (const p of lista) expect(p.invalida.length, p.id).toBeGreaterThan(0)
  })

  it('o leitor de premissas discrimina realizada de não realizada', () => {
    const exemplo = '### PR-01 — a\n**O que invalida:** se algo mudar muito\n**Origem:** x\n**Realizada em:** FT-01\n\n---\n\n### PR-02 — b\n**O que invalida:** se algo mudar muito\n**Origem:** y\n**Realizada em:** null\n'
    expect(lerPremissas(exemplo).map((p) => [p.id, p.realizadaEm])).toEqual([
      ['PR-01', 'FT-01'],
      ['PR-02', 'null'],
    ])
  })
})

describe('premissas que a FT-01 realiza (MAPA.md)', () => {
  const bloco = /### FT-01 [\s\S]*?\*\*Premissas que realiza:\*\*\s*\[([^\]]*)\]/.exec(mapa)
  const realizadas = (bloco?.[1] ?? '').split(',').map((s) => s.trim()).filter(Boolean)

  it('o MAPA lista as premissas da FT-01', () => {
    expect(realizadas).toEqual(
      expect.arrayContaining(['PR-03', 'PR-04', 'PR-05', 'PR-07', 'PR-12', 'PR-15', 'PR-16', 'PR-17', 'PR-18', 'PR-19', 'PR-20']),
    )
  })

  it('cada uma está marcada Realizada em FT-01', () => {
    const faltando = realizadas.filter(
      (id) => lista.find((p) => p.id === id)?.realizadaEm !== 'FT-01',
    )
    expect(faltando).toEqual([])
  })

  it('as premissas f2_autonoma criadas pela FT-01 também apontam para ela', () => {
    // PR-21 a PR-24 nasceram na F2 da FT-01; as f2_autonoma seguintes
    // (PR-25 em diante) pertencem à feature que as criou.
    const f2 = lista.filter(
      (p) => p.origem === 'f2_autonoma' && Number(p.id.slice(3)) <= 24,
    )
    expect(f2).toHaveLength(4)
    for (const p of f2) expect(p.realizadaEm, p.id).toBe('FT-01')
  })

  it('o papel filho e as premissas de outras features não foram marcadas por engano', () => {
    for (const id of ['PR-01', 'PR-02', 'PR-06', 'PR-08', 'PR-09', 'PR-10', 'PR-11', 'PR-13', 'PR-14']) {
      expect(lista.find((p) => p.id === id)?.realizadaEm, id).not.toBe('FT-01')
    }
  })
})

describe('premissas que a FT-02 realiza (MAPA.md)', () => {
  const bloco = /### FT-02 [\s\S]*?\*\*Premissas que realiza:\*\*\s*\[([^\]]*)\]/.exec(mapa)
  const realizadas = (bloco?.[1] ?? '').split(',').map((s) => s.trim()).filter(Boolean)

  it('o MAPA lista a PR-10 para a FT-02', () => {
    expect(realizadas).toContain('PR-10')
  })

  it('a PR-10 e a PR-25 (criada na F2 da FT-02) estão Realizada em FT-02', () => {
    for (const id of ['PR-10', 'PR-25']) {
      expect(lista.find((p) => p.id === id)?.realizadaEm, id).toBe('FT-02')
    }
  })

  it('a PR-25 é f2_autonoma e as PR-21 a PR-24 continuam da FT-01', () => {
    expect(lista.find((p) => p.id === 'PR-25')?.origem).toBe('f2_autonoma')
    for (const id of ['PR-21', 'PR-22', 'PR-23', 'PR-24']) {
      expect(lista.find((p) => p.id === id)?.realizadaEm, id).toBe('FT-01')
    }
  })

  it('a PR-11 (retenção) não é marcada por esta feature: o limite de 90 dias do log é da FT-08', () => {
    expect(lista.find((p) => p.id === 'PR-11')?.realizadaEm).not.toBe('FT-02')
  })
})
