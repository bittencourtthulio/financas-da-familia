/**
 * O CONVENCOES.md só vale se a evidência que ele cita existe. Este teste
 * lê as citações `arquivo:linha`, confere o arquivo e a linha, e exige que
 * toda regra ainda prescrita (decidido_pelo_buildx) diga em que feature
 * a primeira evidência nasce. Também confere que os comandos citados existem.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const RAIZ = process.cwd()

export function citacoesDe(texto: string): Array<{ arquivo: string; linha: number; fim: number }> {
  const achados: Array<{ arquivo: string; linha: number; fim: number }> = []
  for (const m of texto.matchAll(/`([\w./()[\]-]+\.\w+):(\d+)(?:-(\d+))?`/g)) {
    const linha = Number(m[2])
    achados.push({ arquivo: m[1] as string, linha, fim: m[3] ? Number(m[3]) : linha })
  }
  return achados
}

export function citacoesQuebradas(
  texto: string,
  raiz: string,
): string[] {
  const quebradas: string[] = []
  for (const { arquivo, linha, fim } of citacoesDe(texto)) {
    const caminho = path.join(raiz, arquivo)
    if (!existsSync(caminho)) {
      quebradas.push(`${arquivo}:${linha} (arquivo não existe)`)
      continue
    }
    const total = readFileSync(caminho, 'utf8').split('\n').length
    if (linha < 1 || fim > total || fim < linha) {
      quebradas.push(`${arquivo}:${linha} (arquivo tem ${total} linhas)`)
    }
  }
  return quebradas
}

const convencoes = readFileSync(path.join(RAIZ, 'docs/stack/CONVENCOES.md'), 'utf8')

describe('evidência do CONVENCOES.md', () => {
  it('há citações suficientes para a leitura ser relevante', () => {
    expect(citacoesDe(convencoes).length).toBeGreaterThan(40)
  })

  it('toda citação arquivo:linha aponta para arquivo que existe, com a linha dentro do tamanho', () => {
    expect(citacoesQuebradas(convencoes, RAIZ)).toEqual([])
  })

  it('a conferência discrimina citação válida de quebrada', () => {
    const texto = 'ok `package.json:1`, arquivo falso `src/nao-existe.ts:3`, linha longe `package.json:99999`'
    expect(citacoesQuebradas(texto, RAIZ)).toEqual([
      'src/nao-existe.ts:3 (arquivo não existe)',
      expect.stringMatching(/^package\.json:99999 \(arquivo tem \d+ linhas\)$/),
    ])
    expect(citacoesQuebradas('só `package.json:1`', RAIZ)).toEqual([])
  })

  it('toda regra ainda prescrita diz em que feature a evidência nasce', () => {
    const prescritas = convencoes
      .split('\n')
      .filter((l) => l.includes('decidido_pelo_buildx'))
    expect(prescritas.length).toBeGreaterThan(0)
    for (const linha of prescritas) {
      expect(linha, linha).toMatch(/evidência na FT-0[1-8]/)
    }
  })

  it('nenhum caminho absoluto nem valor de segredo no arquivo', () => {
    expect(convencoes).not.toMatch(/\/(Users|home|mnt)\//)
    expect(convencoes).not.toMatch(/(SECRET|PASSWORD|TOKEN)\s*=\s*\S/)
  })
})

describe('comandos do CONVENCOES.md', () => {
  const pacote = JSON.parse(readFileSync(path.join(RAIZ, 'package.json'), 'utf8')) as {
    scripts: Record<string, string>
  }

  it('todo npm run citado existe como script', () => {
    const citados = [...convencoes.matchAll(/`npm run ([\w:-]+)`/g)].map((m) => m[1] as string)
    expect(citados.length).toBeGreaterThan(4)
    const inexistentes = citados.filter((nome) => !(nome in pacote.scripts))
    expect(inexistentes).toEqual([])
  })

  it('as seis seções existem e o arquivo de lacunas acompanha', () => {
    for (let n = 1; n <= 6; n += 1) {
      expect(convencoes).toMatch(new RegExp(`^## ${n}\\. `, 'm'))
    }
    expect(existsSync(path.join(RAIZ, 'docs/stack/LACUNAS.md'))).toBe(true)
  })
})
