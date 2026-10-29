/**
 * Saúde com o banco fora do ar, no servidor de produção de verdade (PR-14):
 * a rota pública responde 503, sem caminho, pilha nem dado, e não 500.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'

const PORTA = 3188
const BASE = `http://localhost:${PORTA}`
let servidor: ChildProcess

beforeAll(async () => {
  servidor = spawn('npx', ['next', 'start', '-p', String(PORTA)], {
    // Diretório que não existe: abrir o banco falha.
    env: { ...process.env, NODE_ENV: 'production', DATABASE_URL: 'postgresql://nao-existe-ft08.invalid:5432/familia' },
    stdio: 'ignore',
  })
  for (let i = 0; i < 60; i += 1) {
    try {
      await fetch(`${BASE}/entrar`)
      return
    } catch {
      await new Promise((r) => setTimeout(r, 500))
    }
  }
  throw new Error('O servidor não subiu a tempo.')
}, 60_000)

afterAll(() => {
  servidor?.kill()
})

describe('GET /api/saude com o banco inacessível', () => {
  it('responde 503 com o corpo fixo', async () => {
    const r = await fetch(`${BASE}/api/saude`)
    expect(r.status).toBe(503)
    expect(r.headers.get('cache-control')).toBe('no-store')
    expect(await r.json()).toEqual({ status: 'indisponivel', banco: 'falha' })
  })

  it('não vaza caminho do banco, nome de biblioteca nem pilha', async () => {
    const texto = await (await fetch(`${BASE}/api/saude`)).text()
    expect(texto).not.toMatch(/nao-existe-ft08|familia\.db|sqlite|prisma|at .*\(|stack/i)
  })
})
