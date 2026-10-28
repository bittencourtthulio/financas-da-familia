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
