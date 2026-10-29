/**
 * O nome e a descrição do sistema moram em um lugar só (src/lib/marca.ts) e
 * falam o domínio, em português. Nenhum texto genérico do template sobrevive.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { NOME_DO_SISTEMA, DESCRICAO_DO_SISTEMA } from '@/lib/marca'
import { listarArquivos } from './ajuda-estatica'

describe('marca do sistema', () => {
  it('o nome é Bufi', () => {
    expect(NOME_DO_SISTEMA).toBe('Bufi')
  })

  it('a descrição está em português, fala da família e não cita o gerador', () => {
    expect(DESCRICAO_DO_SISTEMA).toMatch(/fam[ií]lia/i)
    expect(DESCRICAO_DO_SISTEMA).toMatch(/mesada/i)
    expect(DESCRICAO_DO_SISTEMA).not.toMatch(/buildx|gerado|template/i)
  })

  it('nenhum arquivo de src guarda o texto genérico do template', () => {
    const SRC = path.resolve(process.cwd(), 'src')
    const frases = ['Esta é a tela inicial do sistema', 'Gerado pelo buildx', 'As telas do projeto aparecem']
    const achados = listarArquivos(SRC, ['.ts', '.tsx'])
      .filter((a) => !a.includes(`${path.sep}gerado${path.sep}`))
      .flatMap((arquivo) => {
        const texto = readFileSync(arquivo, 'utf8')
        return frases.filter((f) => texto.includes(f)).map((f) => `${path.relative(SRC, arquivo)}: ${f}`)
      })
    expect(achados).toEqual([])
  })
})
