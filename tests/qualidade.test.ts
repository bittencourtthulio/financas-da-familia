/**
 * Pipeline de verificação e versões fixadas (PR-15, PR-12, PR-23): a
 * verificação completa é um comando do projeto, o fluxo de CI só o chama, e
 * nenhuma versão do package.json é um intervalo.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { versoesNaoFixadas } from './ajuda-estatica'

const RAIZ = process.cwd()
const pacote = JSON.parse(readFileSync(path.join(RAIZ, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}
const fluxo = readFileSync(path.join(RAIZ, '.github/workflows/verificar.yml'), 'utf8')

describe('scripts de qualidade', () => {
  it('typecheck roda o tsc sem emitir', () => {
    expect(pacote.scripts.typecheck).toBe('tsc --noEmit')
  })

  it('verificar encadeia lint, tipos, build, testes e auditoria, nessa ordem', () => {
    const passos = (pacote.scripts.verificar ?? '').split('&&').map((p) => p.trim())
    expect(passos).toEqual([
      'npm run lint',
      'npm run typecheck',
      'npm run build',
      'npm test',
      'npm audit --audit-level=high',
    ])
  })
})

describe('versões fixadas', () => {
  it('nenhuma dependência usa circunflexo, til ou intervalo', () => {
    expect(versoesNaoFixadas(pacote)).toEqual([])
  })

  it('a detecção discrimina versão exata de intervalo', () => {
    expect(
      versoesNaoFixadas({
        dependencies: { a: '^1.2.3', b: '1.2.3', c: '~2.0.0', d: 'latest', e: '>=1.0.0' },
        devDependencies: { f: '3.4.5-beta.1', g: '*' },
      }),
    ).toEqual(['a@^1.2.3', 'c@~2.0.0', 'd@latest', 'e@>=1.0.0', 'g@*'])
    expect(versoesNaoFixadas({ dependencies: { a: '1.0.0' } })).toEqual([])
    expect(versoesNaoFixadas({})).toEqual([])
  })
})

describe('fluxo de exemplo do GitHub Actions', () => {
  it('só chama o comando do projeto, que é o que vale em qualquer plataforma', () => {
    expect(fluxo).toContain('npm ci')
    expect(fluxo).toContain('npm run verificar')
  })

  it('roda a cada mudança: push e pull request', () => {
    expect(fluxo).toMatch(/^on:\s*$/m)
    expect(fluxo).toMatch(/^\s+push:/m)
    expect(fluxo).toMatch(/^\s+pull_request:/m)
  })

  it('não carrega segredo literal: o segredo de assinatura nasce no próprio passo', () => {
    expect(fluxo).not.toMatch(/JWT_SECRET:\s*['"]?[A-Za-z0-9+/=_-]{8,}/)
    expect(fluxo).not.toMatch(/[a-f0-9]{40,}/i)
    expect(fluxo).toContain('openssl rand')
  })

  it('fixa a versão do Node usada no projeto', () => {
    expect(fluxo).toMatch(/node-version:\s*['"]?22/)
  })
})
