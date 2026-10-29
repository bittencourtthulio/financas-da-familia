/**
 * A prova no servidor de produção real da página do filho (FT-06, PR-06): o
 * filho vê o próprio saldo e extrato, em texto, paginados, somente leitura, e
 * nunca os do irmão, nem por parâmetro, nem por caminho. O estado negativo e o
 * zerado são ditos em palavras.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { cadastrarFilho, criarLoginDoFilho } from '@/servicos/filhos'
import { registrarMovimento } from '@/servicos/mesada'
import { entrar } from '@/servicos/autenticacao'
import { COOKIE_SESSAO } from '@/lib/sessao'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco } from './ajuda'

const PORTA = 3181
const BASE = `http://localhost:${PORTA}`
const SENHA = 'senha-de-rota-123'

let servidor: ChildProcess
let idDaBia = ''
let idDoGastoDaBia = ''

async function esperarDePe(tentativas = 60): Promise<void> {
  for (let i = 0; i < tentativas; i += 1) {
    try {
      await fetch(`${BASE}/entrar`)
      return
    } catch {
      await new Promise((r) => setTimeout(r, 500))
    }
  }
  throw new Error('O servidor não subiu a tempo.')
}

async function abrir(caminho: string, email: string) {
  const { token } = await entrar({ email, senha: SENHA })
  const r = await fetch(`${BASE}${caminho}`, {
    redirect: 'manual',
    headers: { cookie: `${COOKIE_SESSAO}=${token}` },
  })
  const html = (await r.text()).replaceAll('<!-- -->', '').replaceAll(' ', ' ')
  return { status: r.status, html }
}

const ANA = 'ana.mesadaf@teste.local'
const BIA = 'bia.mesadaf@teste.local'
const CAIO = 'caio.mesadaf@teste.local'

const linhasDoExtrato = (html: string) => (html.match(/<td class="sem-quebra">/g) ?? []).length
// O conteúdo pode chegar depois do estado de carregando (streaming): vale do <main> ao fim, sem scripts.
const principal = (html: string) => html.slice(Math.max(0, html.indexOf('<main class="conteudo">'))).replace(/<script[\s\S]*?<\/script>/g, '')

beforeAll(async () => {
  await limparBanco()
  await prisma.usuario.create({
    data: { nome: 'Responsável da Mesada', email: 'admin.mesadaf@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'admin' },
  })
  const admin = await prisma.usuario.findUniqueOrThrow({ where: { email: 'admin.mesadaf@teste.local' } })
  const ana = await cadastrarFilho(admin, { nome: 'Ana de Rota', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' })
  const bia = await cadastrarFilho(admin, { nome: 'Bia de Rota', nascimento: '2012-07-01', valor: '120,00', periodicidade: 'mensal' })
  const caio = await cadastrarFilho(admin, { nome: 'Caio de Rota', valor: '30,00', periodicidade: 'mensal' })
  idDaBia = bia.id
  await criarLoginDoFilho(admin, ana.id, { email: ANA, senha: SENHA })
  await criarLoginDoFilho(admin, bia.id, { email: BIA, senha: SENHA })
  await criarLoginDoFilho(admin, caio.id, { email: CAIO, senha: SENHA })

  await registrarMovimento(admin, ana.id, { tipo: 'credito', valor: '100,00', data: '2026-10-05', descricao: 'Mesada da Ana' })
  await registrarMovimento(admin, ana.id, { tipo: 'gasto', valor: '12,30', data: '2026-10-06', descricao: 'Sorvete da Ana' })
  await registrarMovimento(admin, bia.id, { tipo: 'credito', valor: '10,00', data: '2026-10-05', descricao: 'Mesada da Bia' })
  idDoGastoDaBia = (await registrarMovimento(admin, bia.id, { tipo: 'gasto', valor: '25,50', data: '2026-10-06', descricao: 'Segredo da Bia' })).movimento.id
  await prisma.movimentoDeMesada.createMany({
    data: Array.from({ length: 40 }, (_, i) => ({
      filhoId: ana.id,
      tipo: 'credito',
      valorCentavos: 1,
      data: `2026-09-${String((i % 28) + 1).padStart(2, '0')}`,
      descricao: `Extra ${String(i).padStart(2, '0')}`,
    })),
  })

  servidor = spawn('npx', ['next', 'start', '-p', String(PORTA)], {
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'ignore',
  })
  await esperarDePe()
}, 120_000)

afterAll(() => {
  servidor?.kill()
})

describe('o filho vê o próprio saldo e extrato', () => {
  it('o saldo vem em destaque, com o rótulo em texto e os totais (R$ 100,00 + 40 centavos - R$ 12,30)', async () => {
    const r = await abrir('/mesada', ANA)
    expect(r.status).toBe(200)
    expect(r.html).toContain('Saldo disponível')
    expect(r.html).toContain('R$ 88,10')
    expect(r.html).toContain('R$ 100,40')
    expect(r.html).toContain('R$ 12,30')
    expect(r.html).toContain('data-saldo="positivo"')
  })

  it('o extrato mostra o gasto com sinal de menos e o crédito sem, do mais recente para o mais antigo', async () => {
    const { html } = await abrir('/mesada', ANA)
    expect(html).toContain('Sorvete da Ana')
    expect(html).toContain('-R$ 12,30')
    expect(html).toContain('Mesada da Ana')
    expect(html.indexOf('06/10/2026')).toBeLessThan(html.indexOf('05/10/2026'))
    expect(html.indexOf('05/10/2026')).toBeLessThan(html.indexOf('28/09/2026'))
  })

  it('o valor combinado segue como referência rotulada, e a página é só leitura', async () => {
    const { html } = await abrir('/mesada', ANA)
    expect(html).toContain('R$ 50,00')
    expect(html).toContain('por semana')
    expect(html).toMatch(/combinad/i)
    const corpo = principal(html)
    expect(corpo).not.toMatch(/<form|<button|<input|<select|<textarea/)
    for (const proibido of ['Editar', 'Apagar', 'Registrar movimento', 'Novo movimento', '/filhos']) {
      expect(corpo, proibido).not.toContain(proibido)
    }
  })

  it('o extrato longo pagina em 30, sem repetir, e a página inválida é tratada', async () => {
    const p1 = await abrir('/mesada', ANA)
    const p2 = await abrir('/mesada?pagina=2', ANA)
    expect([linhasDoExtrato(p1.html), linhasDoExtrato(p2.html)]).toEqual([30, 12])
    expect(p1.html).toContain('Página 1 de 2')
    expect(p2.html).toContain('Página 2 de 2')
    expect(p1.html).toContain('href="/mesada?pagina=2"')
    expect(p2.html).toContain('href="/mesada"')
    const nomes = (html: string) => new Set(html.match(/Extra \d\d/g) ?? [])
    for (const n of nomes(p1.html)) expect(nomes(p2.html).has(n)).toBe(false)
    expect(p2.html).toContain('R$ 88,10')
    expect((await abrir('/mesada?pagina=999', ANA)).html).toContain('Página 2 de 2')
    expect((await abrir('/mesada?pagina=-1', ANA)).html).toContain('Página 1 de 2')
    expect((await abrir('/mesada?pagina=abc', ANA)).html).toContain('Página 1 de 2')
    expect((await abrir('/mesada?pagina=1&pagina=2', ANA)).html).toContain('Página 1 de 2')
  })
})

describe('estados do saldo, ditos em palavras', () => {
  it('a Bia, com mais gasto que crédito, vê o saldo negativo com sinal de menos e a frase', async () => {
    const { html } = await abrir('/mesada', BIA)
    expect(html).toContain('Saldo negativo')
    expect(html).toContain('-R$ 15,50')
    expect(html).toContain('Os gastos passaram do que foi recebido.')
    expect(html).toContain('data-saldo="negativo"')
  })

  it('o Caio, sem movimento, vê o saldo zerado e o estado vazio', async () => {
    const { html } = await abrir('/mesada', CAIO)
    expect(html).toContain('Saldo zerado')
    expect(html).toContain('R$ 0,00')
    expect(html).toContain('Ainda não há movimentos de mesada.')
    expect(html).not.toContain('Página 1 de')
  })
})

describe('o filho não vê nem alcança o irmão', () => {
  it('cada irmão vê só o que é dele', async () => {
    const ana = await abrir('/mesada', ANA)
    const bia = await abrir('/mesada', BIA)
    for (const alheio of ['Bia de Rota', 'Segredo da Bia', 'Mesada da Bia', '25,50', '-R$ 15,50']) {
      expect(ana.html, alheio).not.toContain(alheio)
    }
    for (const alheio of ['Ana de Rota', 'Sorvete da Ana', 'Mesada da Ana', 'Extra 00', 'R$ 88,10']) {
      expect(bia.html, alheio).not.toContain(alheio)
    }
    expect(linhasDoExtrato(bia.html)).toBe(2)
  })

  it('id, filho e movimento do irmão na consulta não mudam nada: é sempre a página do próprio filho', async () => {
    const r = await abrir(`/mesada?filho=${idDaBia}&id=${idDaBia}&movimento=${idDoGastoDaBia}&filhoId=${idDaBia}`, ANA)
    expect(r.status).toBe(200)
    expect(r.html).toContain('Ana de Rota')
    expect(r.html).toContain('R$ 88,10')
    for (const alheio of ['Bia de Rota', 'Segredo da Bia', '-R$ 15,50']) expect(r.html).not.toContain(alheio)
  })

  it('por caminho, nenhuma rota de mesada com id existe para o filho', async () => {
    for (const rota of [`/mesada/${idDaBia}`, `/mesada/${idDoGastoDaBia}`, `/mesada/${idDaBia}/${idDoGastoDaBia}`]) {
      const r = await abrir(rota, ANA)
      expect(r.status, rota).toBe(404)
      expect(r.html, rota).not.toContain('Segredo da Bia')
    }
  })

  it('a página do filho nunca expõe o id do irmão nem o id de movimento nenhum', async () => {
    const { html } = await abrir('/mesada', ANA)
    expect(html).not.toContain(idDaBia)
    expect(html).not.toContain(idDoGastoDaBia)
  })

  it('o filho é barrado nas telas do responsável, mesmo no id do irmão', async () => {
    for (const rota of [`/filhos/${idDaBia}/mesada`, `/filhos/${idDaBia}/mesada/${idDoGastoDaBia}`]) {
      const r = await abrir(rota, ANA)
      expect(r.status === 307 || /http-equiv="refresh"/.test(r.html), rota).toBe(true)
      expect(r.html).not.toContain('Segredo da Bia')
    }
  })
})
