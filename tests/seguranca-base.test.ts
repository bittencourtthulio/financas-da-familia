/**
 * Confirmação da segurança de base (PR-12): o que o código já cumpria e
 * nenhum teste afirmava. Cookie de sessão, configuração obrigatória, hash de
 * senha, segredo fora do versionador e consulta parametrizada.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { opcoesDoCookie, COOKIE_SESSAO } from '@/lib/sessao'
import { ambiente } from '@/lib/ambiente'
import { hashDeSenha, senhaConfere } from '@/lib/senha'
import { listarArquivos } from './ajuda-estatica'

const RAIZ = process.cwd()

function comAmbiente(alteracoes: Record<string, string | undefined>, corpo: () => void) {
  const antes: Record<string, string | undefined> = {}
  for (const chave of Object.keys(alteracoes)) antes[chave] = process.env[chave]
  try {
    for (const [chave, valor] of Object.entries(alteracoes)) {
      if (valor === undefined) delete process.env[chave]
      else Object.assign(process.env, { [chave]: valor })
    }
    corpo()
  } finally {
    for (const [chave, valor] of Object.entries(antes)) {
      if (valor === undefined) delete process.env[chave]
      else Object.assign(process.env, { [chave]: valor })
    }
  }
}

describe('cookie de sessão', () => {
  afterEach(() => {
    Object.assign(process.env, { NODE_ENV: 'test' })
  })

  it('é httpOnly, sameSite lax, na raiz e com a duração do token', () => {
    const opcoes = opcoesDoCookie()
    expect(opcoes.httpOnly).toBe(true)
    expect(opcoes.sameSite).toBe('lax')
    expect(opcoes.path).toBe('/')
    expect(opcoes.maxAge).toBe(ambiente.jwtTtlSegundos)
    expect(COOKIE_SESSAO).toBe('expx_sessao')
  })

  it('só é secure em produção', () => {
    comAmbiente({ NODE_ENV: 'production' }, () => {
      expect(opcoesDoCookie().secure).toBe(true)
    })
    comAmbiente({ NODE_ENV: 'test' }, () => {
      expect(opcoesDoCookie().secure).toBe(false)
    })
  })
})

describe('configuração obrigatória (L20)', () => {
  it('JWT_SECRET ausente falha na leitura, com mensagem em português', () => {
    comAmbiente({ JWT_SECRET: undefined }, () => {
      expect(() => ambiente.jwtSecret).toThrow(/JWT_SECRET/)
      expect(() => ambiente.jwtSecret).toThrow(/obrigatória ausente/)
    })
  })

  it('JWT_SECRET em branco também falha', () => {
    comAmbiente({ JWT_SECRET: '   ' }, () => {
      expect(() => ambiente.jwtSecret).toThrow(/JWT_SECRET/)
    })
  })

  it('o tempo de vida do token tem padrão de 900 s e recusa valor inválido', () => {
    comAmbiente({ JWT_TTL_SEGUNDOS: undefined }, () => {
      expect(ambiente.jwtTtlSegundos).toBe(900)
    })
    comAmbiente({ JWT_TTL_SEGUNDOS: 'abc' }, () => {
      expect(() => ambiente.jwtTtlSegundos).toThrow(/inteiro positivo/)
    })
    comAmbiente({ JWT_TTL_SEGUNDOS: '-5' }, () => {
      expect(() => ambiente.jwtTtlSegundos).toThrow(/inteiro positivo/)
    })
  })
})

describe('senha (L3)', () => {
  it('é guardada com bcrypt, nunca em claro, com sal diferente a cada vez', async () => {
    const a = await hashDeSenha('uma-senha-longa-123')
    const b = await hashDeSenha('uma-senha-longa-123')
    expect(a).toMatch(/^\$2[aby]\$10\$/)
    expect(a).not.toContain('uma-senha-longa-123')
    expect(a).not.toBe(b)
    expect(await senhaConfere('uma-senha-longa-123', a)).toBe(true)
    expect(await senhaConfere('outra-senha-123', a)).toBe(false)
  })
})

describe('segredo e consulta (L6, L5)', () => {
  it('o modelo de ambiente versionado não traz valor de segredo', () => {
    const modelo = readFileSync(path.join(RAIZ, '.env.example'), 'utf8')
    expect(modelo).toMatch(/^JWT_SECRET=""\s*$/m)
    expect(modelo).not.toMatch(/[a-f0-9]{32,}/i)
  })

  it('o arquivo de ambiente real está no .gitignore', () => {
    const ignorados = readFileSync(path.join(RAIZ, '.gitignore'), 'utf8').split('\n')
    expect(ignorados).toContain('.env')
    expect(ignorados).toContain('.env.local')
  })

  it('nenhum código monta consulta por concatenação: sem raw unsafe em src', () => {
    const achados = listarArquivos(path.join(RAIZ, 'src'), ['.ts', '.tsx'])
      .filter((a) => !a.includes(`${path.sep}gerado${path.sep}`))
      .filter((a) => /\$(queryRawUnsafe|executeRawUnsafe)/.test(readFileSync(a, 'utf8')))
    expect(achados).toEqual([])
  })
})
