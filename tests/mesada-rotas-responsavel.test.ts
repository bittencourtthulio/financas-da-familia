/**
 * A prova no servidor de produção real das telas do responsável (FT-06, PR-33):
 * extrato, saldo e formulário rápido de cada filho, edição e exclusão de
 * movimento; saldo negativo dito em texto; extrato longo paginado. O adulto, o
 * filho e quem não entrou são barrados sem ver dado.
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

const PORTA = 3180
const BASE = `http://localhost:${PORTA}`
const SENHA = 'senha-de-rota-123'

let servidor: ChildProcess
let idDaAna = ''
let idDaBia = ''
let idDoCreditoDaAna = ''
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

const pedir = (caminho: string, cookie?: string) =>
  fetch(`${BASE}${caminho}`, { redirect: 'manual', headers: cookie ? { cookie } : {} })

async function cookieDe(email: string): Promise<string> {
  const { token } = await entrar({ email, senha: SENHA })
  return `${COOKIE_SESSAO}=${token}`
}

const limpo = (html: string) => html.replaceAll('<!-- -->', '').replaceAll(' ', ' ')

async function abrir(caminho: string, email: string) {
  const r = await pedir(caminho, await cookieDe(email))
  return { status: r.status, local: r.headers.get('location'), html: limpo(await r.text()) }
}

/** Com loading.tsx a resposta já começou: o redirecionamento viaja no corpo. */
const foiBarrado = (r: { status: number; html: string }, destino = '/') =>
  r.status === 307 || new RegExp(`<meta[^>]*http-equiv="refresh"[^>]*content="[^"]*url=${destino}"`).test(r.html)

const ADMIN = 'admin.mesadar@teste.local'
const ADULTO = 'adulto.mesadar@teste.local'
const ANA = 'ana.mesadar@teste.local'

beforeAll(async () => {
  await limparBanco()
  await prisma.usuario.createMany({
    data: [
      { nome: 'Responsável da Rota', email: ADMIN, senhaHash: await hashDeSenha(SENHA), papel: 'admin' },
      { nome: 'Adulto da Rota', email: ADULTO, senhaHash: await hashDeSenha(SENHA), papel: 'usuario' },
    ],
  })
  const admin = await prisma.usuario.findUniqueOrThrow({ where: { email: ADMIN } })
  const ana = await cadastrarFilho(admin, { nome: 'Ana de Rota', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' })
  const bia = await cadastrarFilho(admin, { nome: 'Bia de Rota', nascimento: '2012-07-01', valor: '120,00', periodicidade: 'mensal' })
  idDaAna = ana.id
  idDaBia = bia.id
  await criarLoginDoFilho(admin, ana.id, { email: ANA, senha: SENHA })

  idDoCreditoDaAna = (await registrarMovimento(admin, ana.id, { tipo: 'credito', valor: '100,00', data: '2026-10-05', descricao: 'Mesada da Ana' })).movimento.id
  await registrarMovimento(admin, ana.id, { tipo: 'gasto', valor: '12,30', data: '2026-10-06', descricao: 'Sorvete da Ana' })
  await registrarMovimento(admin, bia.id, { tipo: 'credito', valor: '10,00', data: '2026-10-05', descricao: 'Mesada da Bia' })
  idDoGastoDaBia = (await registrarMovimento(admin, bia.id, { tipo: 'gasto', valor: '25,50', data: '2026-10-06', descricao: 'Segredo da Bia' })).movimento.id

  // Extrato longo para a Ana: 65 créditos de R$ 0,01 a mais, em dias distintos.
  await prisma.movimentoDeMesada.createMany({
    data: Array.from({ length: 65 }, (_, i) => ({
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

describe('o responsável vê o extrato e o saldo de cada filho', () => {
  it('mostra o saldo em destaque, em texto, e os totais (R$ 100,00 + 65 centavos - R$ 12,30)', async () => {
    const r = await abrir(`/filhos/${idDaAna}/mesada`, ADMIN)
    expect(r.status).toBe(200)
    expect(r.html).toContain('Ana de Rota')
    expect(r.html).toContain('Saldo disponível')
    expect(r.html).toContain('R$ 88,35')
    expect(r.html).toContain('R$ 100,65')
    expect(r.html).toContain('R$ 12,30')
    expect(r.html).toContain('data-saldo="positivo"')
  })

  it('lembra o combinado como referência, sem tratá-lo como crédito', async () => {
    const r = await abrir(`/filhos/${idDaAna}/mesada`, ADMIN)
    expect(r.html).toMatch(/combinad/i)
    expect(r.html).toContain('R$ 50,00 por semana')
  })

  it('o saldo negativo da Bia sai com sinal de menos e com a frase', async () => {
    const r = await abrir(`/filhos/${idDaBia}/mesada`, ADMIN)
    expect(r.html).toContain('Saldo negativo')
    expect(r.html).toContain('-R$ 15,50')
    expect(r.html).toContain('Os gastos passaram do que foi recebido.')
    expect(r.html).toContain('data-saldo="negativo"')
    expect(r.html).toContain('Segredo da Bia')
    expect(r.html).not.toContain('Mesada da Ana')
  })

  it('tem o formulário rápido do filho certo e um link de edição por movimento', async () => {
    const r = await abrir(`/filhos/${idDaBia}/mesada`, ADMIN)
    expect(r.html).toMatch(new RegExp(`name="filhoId"[^>]*value="${idDaBia}"|value="${idDaBia}"[^>]*name="filhoId"`))
    for (const nome of ['tipo', 'valor', 'data', 'descricao']) expect(r.html).toContain(`name="${nome}"`)
    expect(r.html).toContain(`href="/filhos/${idDaBia}/mesada/${idDoGastoDaBia}"`)
  })

  it('o extrato longo pagina: 30 por página, a segunda não repete a primeira, e página inválida cai na última', async () => {
    const p1 = await abrir(`/filhos/${idDaAna}/mesada`, ADMIN)
    const p2 = await abrir(`/filhos/${idDaAna}/mesada?pagina=2`, ADMIN)
    const p3 = await abrir(`/filhos/${idDaAna}/mesada?pagina=3`, ADMIN)
    const linhas = (html: string) => (html.match(/href="\/filhos\/[^"]+\/mesada\/[^"]+"/g) ?? []).length
    expect([linhas(p1.html), linhas(p2.html), linhas(p3.html)]).toEqual([30, 30, 7])
    expect(p1.html).toContain('Página 1 de 3')
    expect(p1.html).toContain(`href="/filhos/${idDaAna}/mesada?pagina=2"`)
    expect(p2.html).toContain('Página 2 de 3')
    const nomes = (html: string) => new Set(html.match(/Extra \d\d/g) ?? [])
    for (const n of nomes(p1.html)) expect(nomes(p2.html).has(n)).toBe(false)
    const invalida = await abrir(`/filhos/${idDaAna}/mesada?pagina=999`, ADMIN)
    expect(invalida.html).toContain('Página 3 de 3')
    const lixo = await abrir(`/filhos/${idDaAna}/mesada?pagina=abc`, ADMIN)
    expect(lixo.html).toContain('Página 1 de 3')
  })

  it('a edição abre com os valores atuais e o botão de apagar em dois passos', async () => {
    const r = await abrir(`/filhos/${idDaAna}/mesada/${idDoCreditoDaAna}`, ADMIN)
    expect(r.status).toBe(200)
    expect(r.html).toContain('value="100,00"')
    expect(r.html).toContain('value="Mesada da Ana"')
    expect(r.html).toContain('value="2026-10-05"')
    expect(r.html).toContain('Apagar movimento')
    expect(r.html).not.toContain('Confirmar exclusão')
  })

  it('movimento de outro filho na URL, ou id que não existe, cai em não encontrado sem vazar', async () => {
    const trocado = await abrir(`/filhos/${idDaAna}/mesada/${idDoGastoDaBia}`, ADMIN)
    const inexistente = await abrir(`/filhos/${idDaAna}/mesada/id-que-nao-existe`, ADMIN)
    const semFilho = await abrir('/filhos/id-que-nao-existe/mesada', ADMIN)
    for (const r of [trocado, inexistente, semFilho]) {
      expect(r.html).toContain('Página não encontrada')
      expect(r.html).not.toContain('Segredo da Bia')
      expect(r.html).not.toContain('25,50')
    }
  })

  it('a lista de filhos mostra o saldo de cada um e a página do filho leva à mesada', async () => {
    const lista = await abrir('/filhos', ADMIN)
    expect(lista.html).toContain('R$ 88,35')
    expect(lista.html).toContain('-R$ 15,50')
    expect(lista.html).toContain('Saldo negativo')
    expect(lista.html).toContain(`href="/filhos/${idDaAna}/mesada"`)
    const pagina = await abrir(`/filhos/${idDaAna}`, ADMIN)
    expect(pagina.html).toContain(`href="/filhos/${idDaAna}/mesada"`)
  })
})

describe('quem não é o responsável não vê a mesada de ninguém', () => {
  const rotas = () => [
    `/filhos/${idDaAna}/mesada`,
    `/filhos/${idDaBia}/mesada`,
    `/filhos/${idDaAna}/mesada?pagina=2`,
    `/filhos/${idDaBia}/mesada/${idDoGastoDaBia}`,
    `/filhos/${idDaAna}/mesada/${idDoCreditoDaAna}`,
    '/filhos/id-que-nao-existe/mesada',
    `/filhos/${idDaAna}/mesada/id-que-nao-existe`,
  ]
  const vazamentos = ['Segredo da Bia', 'Mesada da Bia', 'Sorvete da Ana', 'Bia de Rota', 'Saldo negativo', '25,50', 'Registrar movimento']

  it.each([
    ['o adulto', ADULTO],
    ['o filho', ANA],
  ])('%s é devolvido ao painel em toda rota, sem dado no corpo', async (_n, email) => {
    for (const rota of rotas()) {
      const r = await abrir(rota, email)
      expect(foiBarrado(r), rota).toBe(true)
      for (const v of vazamentos) expect(r.html, `${rota} vazou ${v}`).not.toContain(v)
    }
  })

  it('a resposta ao filho é igual para o movimento do irmão e para um id que não existe', async () => {
    const doIrmao = await abrir(`/filhos/${idDaBia}/mesada/${idDoGastoDaBia}`, ANA)
    const inexistente = await abrir('/filhos/id-que-nao-existe/mesada/id-que-nao-existe', ANA)
    expect(doIrmao.status).toBe(inexistente.status)
    expect(doIrmao.local).toBe(inexistente.local)
    expect(foiBarrado(doIrmao)).toBe(true)
    expect(foiBarrado(inexistente)).toBe(true)
  })

  it('sem sessão, as rotas mandam para o login', async () => {
    for (const rota of rotas()) {
      const r = await pedir(rota)
      expect(r.status, rota).toBe(307)
      expect(r.headers.get('location'), rota).toContain('/entrar')
    }
  })

  it('o adulto não vê saldo na lista porque não abre a lista de filhos', async () => {
    const r = await abrir('/filhos', ADULTO)
    expect(foiBarrado(r)).toBe(true)
    expect(r.html).not.toContain('Saldo')
  })
})
