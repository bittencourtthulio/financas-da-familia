/**
 * Os papéis gravados continuam admin e usuario; a interface os mostra como
 * Responsável e Adulto (PROJETO.md, L2; PR-06); o papel `filho` (FT-05) é
 * mostrado como Filho, mas não é uma opção da tela Usuários (PR-31).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { rotuloDoPapel, PAPEIS_DA_INTERFACE } from '@/lib/papeis'
import { listarArquivos } from './ajuda-estatica'

describe('rotuloDoPapel', () => {
  it('admin é Responsável e usuario é Adulto', () => {
    expect(rotuloDoPapel('admin')).toBe('Responsável')
    expect(rotuloDoPapel('usuario')).toBe('Adulto')
  })

  it('filho é Filho', () => {
    expect(rotuloDoPapel('filho')).toBe('Filho')
  })

  it('papel desconhecido devolve o próprio valor, nunca vazio', () => {
    expect(rotuloDoPapel('visitante')).toBe('visitante')
    expect(rotuloDoPapel('')).toBe('')
  })

  it('as opções da interface cobrem só Adulto e Responsável: Filho nasce na página do filho', () => {
    expect(PAPEIS_DA_INTERFACE.map((p) => p.valor)).toEqual(['usuario', 'admin'])
    expect(PAPEIS_DA_INTERFACE.map((p) => p.rotulo)).toEqual(['Adulto', 'Responsável'])
  })

  it('a palavra Administrador não aparece em nenhum arquivo de src', () => {
    const SRC = path.resolve(process.cwd(), 'src')
    const achados = listarArquivos(SRC, ['.ts', '.tsx'])
      .filter((a) => !a.includes(`${path.sep}gerado${path.sep}`))
      .filter((a) => /Administrador/.test(readFileSync(a, 'utf8')))
    expect(achados).toEqual([])
  })
})
