/**
 * Saúde (PR-14, L18): o sistema diz se ele e o banco respondem, sem entregar
 * dado pessoal, versão, caminho nem pilha.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { verificarSaude } from '@/servicos/saude'
import { GET } from '@/app/api/saude/route'
import { prisma } from '@/lib/prisma'
import { definirDestinoDoLog } from '@/lib/log'

let linhas: string[]
beforeEach(() => {
  linhas = []
  definirDestinoDoLog((l) => linhas.push(l))
})
afterEach(() => {
  definirDestinoDoLog(null)
  vi.restoreAllMocks()
})

describe('verificarSaude', () => {
  it('com o banco da suíte respondendo: 200, status ok e banco ok', async () => {
    expect(await verificarSaude()).toEqual({ http: 200, corpo: { status: 'ok', banco: 'ok' } })
    expect(linhas).toEqual([])
  })

  it('consulta que lança: 503, indisponível, e o log guarda só o nome do erro', async () => {
    const r = await verificarSaude({
      sondar: async () => {
        throw new Error('unable to open database file /Users/alguem/familia.db ana@casa.com')
      },
    })
    expect(r).toEqual({ http: 503, corpo: { status: 'indisponivel', banco: 'falha' } })
    const linha = JSON.parse(linhas[0] as string)
    expect(linha).toMatchObject({ nivel: 'erro', evento: 'saude.banco_indisponivel', contexto: { nome: 'Error' } })
    expect(linhas[0]).not.toMatch(/Users|familia\.db|ana@/)
  })

  it('banco que não responde dentro do prazo vira 503, sem esperar para sempre', async () => {
    const t0 = Date.now()
    const r = await verificarSaude({ sondar: () => new Promise(() => {}), prazoMs: 30 })
    expect(r.http).toBe(503)
    expect(Date.now() - t0).toBeLessThan(2000)
  })
})

describe('GET /api/saude', () => {
  it('200 com exatamente status e banco, sem cache', async () => {
    const r = await GET()
    expect(r.status).toBe(200)
    expect(r.headers.get('cache-control')).toBe('no-store')
    expect(await r.json()).toEqual({ status: 'ok', banco: 'ok' })
  })

  it('503 quando o banco falha, com o mesmo formato e nenhum detalhe', async () => {
    vi.spyOn(prisma, '$queryRaw').mockRejectedValue(new Error('SQLITE_CANTOPEN /Users/x/dev.db'))
    const r = await GET()
    expect(r.status).toBe(503)
    expect(r.headers.get('cache-control')).toBe('no-store')
    const texto = await r.text()
    expect(JSON.parse(texto)).toEqual({ status: 'indisponivel', banco: 'falha' })
    expect(texto).not.toMatch(/SQLITE|Users|dev\.db|stack/)
  })

  it('a resposta não leva versão de dependência, caminho, e-mail nem usuário', async () => {
    const texto = await (await GET()).text()
    expect(Object.keys(JSON.parse(texto)).sort()).toEqual(['banco', 'status'])
    expect(texto).not.toMatch(/\d+\.\d+\.\d+|\/|@|usuario|prisma|next/i)
  })

  it('não exige sessão: a rota não lê cookie nem chama guarda de papel', async () => {
    const fonte = (await import('node:fs')).readFileSync('src/app/api/saude/route.ts', 'utf8')
    expect(fonte).not.toMatch(/cookies|sessao|exigir/)
  })
})
