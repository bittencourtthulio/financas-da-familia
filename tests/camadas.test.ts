/**
 * Guarda de camadas (PR-17, CONVENCOES.md seção 5): a regra de direção das
 * dependências deixa de ser prescrição e passa a ser um teste que falha.
 */
import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { violacoesDeCamadas } from './ajuda-estatica'

const SRC = path.resolve(process.cwd(), 'src')

describe('camadas do projeto real', () => {
  it('ninguém importa na direção proibida', () => {
    expect(violacoesDeCamadas(SRC)).toEqual([])
  })
})

describe('a checagem de camadas discrimina', () => {
  function fixture(arquivos: Record<string, string>): string {
    const raiz = mkdtempSync(path.join(tmpdir(), 'camadas-'))
    for (const [caminho, conteudo] of Object.entries(arquivos)) {
      const destino = path.join(raiz, caminho)
      mkdirSync(path.dirname(destino), { recursive: true })
      writeFileSync(destino, conteudo)
    }
    return raiz
  }

  it('aponta componente que importa o cliente do Prisma', () => {
    const raiz = fixture({
      'componentes/Lista.tsx': "import { prisma } from '@/lib/prisma'\nexport const x = prisma\n",
    })
    try {
      expect(violacoesDeCamadas(raiz)).toEqual([
        {
          arquivo: path.join('componentes', 'Lista.tsx'),
          importa: '@/lib/prisma',
          regra: 'apresentacao nao importa o Prisma',
        },
      ])
    } finally {
      rmSync(raiz, { recursive: true, force: true })
    }
  })

  it('aponta serviço que importa a apresentação e lib que importa serviço', () => {
    const raiz = fixture({
      'servicos/a.ts': "import { x } from '@/app/acoes'\nexport const y = x\n",
      'lib/b.ts': "export { z } from '@/servicos/a'\n",
    })
    try {
      const achados = violacoesDeCamadas(raiz).map((v) => `${v.arquivo} -> ${v.importa}`)
      expect(achados).toEqual([
        `${path.join('servicos', 'a.ts')} -> @/app/acoes`,
        `${path.join('lib', 'b.ts')} -> @/servicos/a`,
      ])
    } finally {
      rmSync(raiz, { recursive: true, force: true })
    }
  })

  it('não aponta nada quando as direções estão certas', () => {
    const raiz = fixture({
      'app/page.tsx': "import { f } from '@/servicos/a'\nexport default f\n",
      'servicos/a.ts': "import { prisma } from '@/lib/prisma'\nexport const f = prisma\n",
      'lib/prisma.ts': 'export const prisma = {}\n',
    })
    try {
      expect(violacoesDeCamadas(raiz)).toEqual([])
    } finally {
      rmSync(raiz, { recursive: true, force: true })
    }
  })
})
