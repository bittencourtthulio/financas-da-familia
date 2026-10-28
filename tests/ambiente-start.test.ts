/**
 * Configuração inválida falha no start (PR-14, L20): o servidor não sobe, e a
 * mensagem diz, em português, o que falta, sem nunca imprimir um segredo.
 */
import { describe, it, expect } from 'vitest'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { problemasDeAmbiente, validarAmbiente } from '@/lib/ambiente'

const OK = {
  DATABASE_URL: 'file:./dev.db',
  JWT_SECRET: 'um-segredo-qualquer-de-teste',
  JWT_TTL_SEGUNDOS: '900',
}

describe('problemasDeAmbiente', () => {
  it('ambiente completo não tem problema; TTL é opcional', () => {
    expect(problemasDeAmbiente(OK)).toEqual([])
    expect(problemasDeAmbiente({ DATABASE_URL: OK.DATABASE_URL, JWT_SECRET: OK.JWT_SECRET })).toEqual([])
  })

  it('lista todos os problemas de uma vez, nomeando a variável', () => {
    const problemas = problemasDeAmbiente({})
    expect(problemas).toHaveLength(2)
    expect(problemas.join('\n')).toContain('DATABASE_URL')
    expect(problemas.join('\n')).toContain('JWT_SECRET')
  })

  it('valor só de espaços conta como ausente', () => {
    expect(problemasDeAmbiente({ ...OK, JWT_SECRET: '   ' }).join('\n')).toContain('JWT_SECRET')
  })

  it('DATABASE_URL que não é de arquivo SQLite é recusada', () => {
    expect(problemasDeAmbiente({ ...OK, DATABASE_URL: 'postgres://host/banco' }).join('\n')).toContain(
      'DATABASE_URL',
    )
  })

  it.each(['0', '-5', 'abc', '1.5x'])('JWT_TTL_SEGUNDOS=%s é recusado', (ttl) => {
    expect(problemasDeAmbiente({ ...OK, JWT_TTL_SEGUNDOS: ttl }).join('\n')).toContain('JWT_TTL_SEGUNDOS')
  })

  it('a mensagem nunca repete o valor informado', () => {
    const marcadorDaUrl = 'marcador-da-url-9'
    const marcadorDoTtl = 'valor-ruim-123'
    const msg = problemasDeAmbiente({
      DATABASE_URL: `mysql://host/${marcadorDaUrl}`,
      JWT_SECRET: '',
      JWT_TTL_SEGUNDOS: marcadorDoTtl,
    }).join('\n')
    expect(msg).not.toContain(marcadorDaUrl)
    expect(msg).not.toContain(marcadorDoTtl)
  })
})

describe('validarAmbiente', () => {
  it('não lança com ambiente válido', () => {
    expect(() => validarAmbiente(OK)).not.toThrow()
  })

  it('lança um erro só, em português, com todos os problemas e a indicação do modelo de ambiente', () => {
    expect(() => validarAmbiente({})).toThrowError(
      /Configuração inválida[\s\S]*DATABASE_URL[\s\S]*JWT_SECRET[\s\S]*modelo de ambiente/,
    )
  })
})

describe('o gancho de start do Next', () => {
  it('src/instrumentation.ts valida o ambiente quando o servidor Node sobe', () => {
    const fonte = readFileSync('src/instrumentation.ts', 'utf8')
    expect(fonte).toContain('export async function register')
    expect(fonte).toContain('NEXT_RUNTIME')
    expect(fonte).toContain('validarAmbiente')
  })
})

/** Sobe o servidor de produção e espera ele sair (ou o prazo acabar, e então o encerra). */
function subir(variaveis: Record<string, string | undefined>, porta: number) {
  return new Promise<{ codigo: number | null; saida: string; encerradoPeloTeste: boolean }>((resolver) => {
    const filho = spawn('npx', ['next', 'start', '-p', String(porta)], {
      env: { ...process.env, ...variaveis, NODE_ENV: 'production' },
    })
    let saida = ''
    let encerradoPeloTeste = false
    filho.stdout.on('data', (b: Buffer) => (saida += b.toString()))
    filho.stderr.on('data', (b: Buffer) => (saida += b.toString()))
    const limite = setTimeout(() => {
      encerradoPeloTeste = true
      filho.kill()
    }, 12_000)
    filho.on('exit', (codigo) => {
      clearTimeout(limite)
      resolver({ codigo, saida, encerradoPeloTeste })
    })
  })
}

describe('servidor real (next start)', () => {
  // O Next anuncia "Ready" antes de rodar o gancho e, se o gancho lança, só
  // registra o erro e segue de pé em estado quebrado. Por isso o gancho
  // encerra o processo: o que se prova aqui é a saída com código de erro.
  it('sem JWT_SECRET o servidor não fica de pé: sai com código diferente de zero e nomeia a variável', async () => {
    const r = await subir({ JWT_SECRET: '', DATABASE_URL: process.env.DATABASE_URL }, 3185)
    expect(r.encerradoPeloTeste).toBe(false)
    expect(r.codigo).toBe(1)
    expect(r.saida).toContain('JWT_SECRET')
    expect(r.saida).not.toContain(process.env.DATABASE_URL as string)
  }, 40_000)

  it('sem DATABASE_URL o servidor também não fica de pé', async () => {
    const r = await subir({ DATABASE_URL: '', JWT_SECRET: process.env.JWT_SECRET }, 3186)
    expect(r.encerradoPeloTeste).toBe(false)
    expect(r.codigo).toBe(1)
    expect(r.saida).toContain('DATABASE_URL')
  }, 40_000)

  it('com ambiente válido o servidor fica de pé e responde', async () => {
    const filho = spawn('npx', ['next', 'start', '-p', '3187'], {
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'ignore',
    })
    try {
      let status = 0
      for (let i = 0; i < 40 && status !== 200; i += 1) {
        try {
          status = (await fetch('http://localhost:3187/entrar')).status
        } catch {
          await new Promise((r) => setTimeout(r, 500))
        }
      }
      expect(status).toBe(200)
    } finally {
      filho.kill()
    }
  }, 40_000)
})
