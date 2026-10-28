// Ajuda para os testes que leem o código-fonte em vez de executá-lo: as
// guardas de camadas (PR-17) e de tokens (PR-07) são testes de leitura.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

/** Todos os arquivos com uma das extensões, recursivamente, em ordem estável. */
export function listarArquivos(dir: string, extensoes: string[]): string[] {
  const achados: string[] = []
  for (const nome of readdirSync(dir).sort()) {
    const caminho = path.join(dir, nome)
    if (statSync(caminho).isDirectory()) {
      achados.push(...listarArquivos(caminho, extensoes))
    } else if (extensoes.some((e) => nome.endsWith(e))) {
      achados.push(caminho)
    }
  }
  return achados
}

/** Os módulos que o arquivo importa (import, export from e import dinâmico). */
export function importsDe(arquivo: string): string[] {
  const texto = readFileSync(arquivo, 'utf8')
  const achados: string[] = []
  const padrao = /(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g
  for (const m of texto.matchAll(padrao)) if (m[1]) achados.push(m[1])
  return achados
}

export interface Violacao {
  arquivo: string
  importa: string
  regra: string
}

const ehPrisma = (m: string) =>
  /(^|\/)lib\/prisma$/.test(m) || /gerado\/prisma/.test(m) || m === '@prisma/client'

/**
 * As regras de direção de CONVENCOES.md, seção 5, lidas sobre uma pasta
 * `src` (ou um fixture com a mesma forma):
 * - apresentação (app, componentes) nunca importa o cliente do Prisma;
 * - aplicação (servicos) nunca importa a apresentação;
 * - lib (dados e utilitários) nunca importa servicos nem a apresentação.
 */
export function violacoesDeCamadas(raiz: string): Violacao[] {
  const violacoes: Violacao[] = []
  const regras: Array<{
    pasta: string
    regra: string
    proibido: (modulo: string) => boolean
  }> = [
    { pasta: 'app', regra: 'apresentacao nao importa o Prisma', proibido: ehPrisma },
    { pasta: 'componentes', regra: 'apresentacao nao importa o Prisma', proibido: ehPrisma },
    {
      pasta: 'servicos',
      regra: 'servico nao importa a apresentacao',
      proibido: (m) => /^@\/(app|componentes)(\/|$)/.test(m),
    },
    {
      pasta: 'lib',
      regra: 'lib nao importa servicos nem apresentacao',
      proibido: (m) => /^@\/(app|componentes|servicos)(\/|$)/.test(m),
    },
  ]

  for (const { pasta, regra, proibido } of regras) {
    const dir = path.join(raiz, pasta)
    let arquivos: string[]
    try {
      arquivos = listarArquivos(dir, ['.ts', '.tsx'])
    } catch {
      continue
    }
    for (const arquivo of arquivos) {
      for (const modulo of importsDe(arquivo)) {
        if (proibido(modulo)) {
          violacoes.push({
            arquivo: path.relative(raiz, arquivo),
            importa: modulo,
            regra,
          })
        }
      }
    }
  }
  return violacoes
}

/** Cores escritas por extenso (hexadecimal, rgb, hsl) fora de comentário. */
export function coresLiterais(texto: string): string[] {
  const semComentario = texto.replace(/\/\*[\s\S]*?\*\//g, '')
  const padrao = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\([^)]*\)/g
  return semComentario.match(padrao) ?? []
}

/** As declarações `--nome: valor;` de um bloco de CSS, em um mapa. */
export function declaracoesDe(bloco: string): Record<string, string> {
  const mapa: Record<string, string> = {}
  for (const m of bloco.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (m[1] && m[2]) mapa[m[1]] = m[2].trim()
  }
  return mapa
}

/**
 * O corpo `{ ... }` que começa no primeiro seletor que contém `seletor`,
 * respeitando chaves aninhadas (o modo sistema vive dentro de um @media).
 */
export function corpoDe(css: string, seletor: string): string {
  const inicio = css.indexOf(seletor)
  if (inicio === -1) throw new Error(`Seletor não encontrado: ${seletor}`)
  const abre = css.indexOf('{', inicio)
  let nivel = 0
  for (let i = abre; i < css.length; i += 1) {
    if (css[i] === '{') nivel += 1
    if (css[i] === '}') {
      nivel -= 1
      if (nivel === 0) return css.slice(abre + 1, i)
    }
  }
  throw new Error(`Bloco sem fechamento: ${seletor}`)
}

/**
 * As dependências cuja versão não é exata (circunflexo, til, intervalo,
 * `latest`, `*`). Versão fixada é exigência da PR-12; o lock já trava a
 * instalação, mas o package.json é o que o humano lê e atualiza.
 */
export function versoesNaoFixadas(
  pacote: Partial<Record<'dependencies' | 'devDependencies', Record<string, string>>>,
): string[] {
  const exata = /^\d+\.\d+\.\d+(?:-[\w.]+)?$/
  const achados: string[] = []
  for (const grupo of ['dependencies', 'devDependencies'] as const) {
    for (const [nome, versao] of Object.entries(pacote[grupo] ?? {})) {
      if (!exata.test(versao)) achados.push(`${nome}@${versao}`)
    }
  }
  return achados.sort()
}
