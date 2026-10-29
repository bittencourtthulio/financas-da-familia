/**
 * A prova no servidor de produção real da privacidade (FT-07, PR-09): o
 * responsável baixa o arquivo versionado e sem campo secreto; o adulto, o
 * filho e quem não entrou são barrados na rota e na página; e o cookie de um
 * filho emitido ANTES da exclusão deixa de abrir qualquer página.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { cadastrarFilho, criarLoginDoFilho } from '@/servicos/filhos'
import { registrarMovimento } from '@/servicos/mesada'
import { excluirFilho } from '@/servicos/privacidade'
import { entrar } from '@/servicos/autenticacao'
import { camposProibidosEm } from '@/lib/privacidade'
import { COOKIE_SESSAO } from '@/lib/sessao'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco, familiaPadrao } from './ajuda'

const PORTA = 3182
const BASE = `http://localhost:${PORTA}`
const SENHA = 'senha-de-rota-123'

const ADMIN = 'admin.privacidade@teste.local'
const ADULTO = 'adulto.privacidade@teste.local'
const ANA = 'ana.privacidade@teste.local'
const BIA = 'bia.privacidade@teste.local'

let servidor: ChildProcess
let idDaAna = ''
let idDaBia = ''
let hashDoAdmin = ''
let cookieAntigoDaAna = ''

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

async function cookieDe(email: string) {
  const { token } = await entrar({ email, senha: SENHA })
  return `${COOKIE_SESSAO}=${token}`
}

async function pedir(caminho: string, cookie?: string, metodo = 'GET') {
  const r = await fetch(`${BASE}${caminho}`, {
    method: metodo,
    redirect: 'manual',
    headers: cookie ? { cookie } : {},
  })
  const corpo = (await r.text()).replaceAll('<!-- -->', '')
  return { status: r.status, corpo, cabecalhos: r.headers, local: r.headers.get('location') ?? '' }
}

/** Com loading.tsx a resposta já começou: o redirecionamento pode viajar no corpo. */
const levaPara = (r: { status: number; local: string; corpo: string }, destino: string) =>
  (r.status >= 300 && r.status < 400 && new URL(r.local, BASE).pathname === destino) ||
  new RegExp(`<meta[^>]*http-equiv="refresh"[^>]*content="[^"]*url=${destino}"`).test(r.corpo)

beforeAll(async () => {
  await limparBanco()
  const senhaHash = await hashDeSenha(SENHA)
  await prisma.usuario.create({ data: { familiaId: await familiaPadrao(), nome: 'Responsável da Privacidade', email: ADMIN, senhaHash, papel: 'admin' } })
  await prisma.usuario.create({ data: { familiaId: await familiaPadrao(), nome: 'Adulto da Privacidade', email: ADULTO, senhaHash, papel: 'usuario' } })
  const admin = await prisma.usuario.findUniqueOrThrow({ where: { email: ADMIN } })
  hashDoAdmin = admin.senhaHash
  const ana = await cadastrarFilho(admin, { nome: 'Ana Rota', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' })
  const bia = await cadastrarFilho(admin, { nome: 'Bia Rota', valor: '120,00', periodicidade: 'mensal' })
  idDaAna = ana.id
  idDaBia = bia.id
  await criarLoginDoFilho(admin, ana.id, { email: ANA, senha: SENHA })
  await criarLoginDoFilho(admin, bia.id, { email: BIA, senha: SENHA })
  await registrarMovimento(admin, ana.id, { tipo: 'credito', valor: '100,00', data: '2026-10-05', descricao: 'Mesada da Ana Rota' })
  await registrarMovimento(admin, bia.id, { tipo: 'credito', valor: '10,00', data: '2026-10-05', descricao: 'Mesada da Bia Rota' })

  servidor = spawn('npx', ['next', 'start', '-p', String(PORTA)], {
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'ignore',
  })
  await esperarDePe()
  cookieAntigoDaAna = await cookieDe(ANA)
}, 120_000)

afterAll(() => {
  servidor?.kill()
})

describe('o responsável baixa o arquivo', () => {
  it('POST devolve o JSON versionado como anexo, sem cache e sem campo secreto', async () => {
    const r = await pedir('/api/privacidade/exportar', await cookieDe(ADMIN), 'POST')
    expect(r.status).toBe(200)
    expect(r.cabecalhos.get('content-type')).toMatch(/^application\/json/)
    expect(r.cabecalhos.get('content-disposition')).toMatch(/^attachment; filename="dados-da-familia-\d{4}-\d{2}-\d{2}\.json"$/)
    expect(r.cabecalhos.get('cache-control')).toBe('no-store')

    const doc = JSON.parse(r.corpo)
    expect(doc.versao_do_formato).toBe(1)
    expect(doc.filhos.map((f: { nome: string }) => f.nome).sort()).toEqual(['Ana Rota', 'Bia Rota'])
    expect(doc.movimentos_de_mesada).toHaveLength(2)
    expect(camposProibidosEm(doc)).toEqual([])
    expect(r.corpo).not.toContain(hashDoAdmin)
    expect(r.corpo).not.toContain(process.env.JWT_SECRET as string)
    expect(r.corpo).not.toMatch(/eyJ[\w-]+\.[\w-]+\./)
  })

  it('GET não baixa: 405', async () => {
    const r = await pedir('/api/privacidade/exportar', await cookieDe(ADMIN), 'GET')
    expect(r.status).toBe(405)
    expect(r.corpo).not.toContain('versao_do_formato')
  })

  it('o download deixou o rastro na trilha', async () => {
    expect(await prisma.atividade.count({ where: { acao: 'familia.exportada' } })).toBe(1)
  })
})

describe('quem não é o responsável é barrado', () => {
  it('sem cookie: 401', async () => {
    const r = await pedir('/api/privacidade/exportar', undefined, 'POST')
    expect(r.status).toBe(401)
    expect(r.corpo).not.toContain('Ana Rota')
  })

  it.each([
    ['o adulto', ADULTO],
    ['o filho', ANA],
  ])('%s: 403 na rota, sem dado', async (_quem, email) => {
    const r = await pedir('/api/privacidade/exportar', await cookieDe(email), 'POST')
    expect(r.status).toBe(403)
    expect(r.corpo).not.toContain('Ana Rota')
    expect(r.corpo).not.toContain('versao_do_formato')
  })

  it('o número de downloads não mudou com as tentativas barradas', async () => {
    expect(await prisma.atividade.count({ where: { acao: 'familia.exportada' } })).toBe(1)
  })

  it.each([
    ['o adulto', ADULTO, '/'],
    ['o filho', BIA, '/'],
  ])('%s é levado ao painel ao abrir /privacidade', async (_quem, email, destino) => {
    const r = await pedir('/privacidade', await cookieDe(email))
    expect(levaPara(r, destino)).toBe(true)
    expect(r.corpo).not.toContain('Apagar a conta')
  })

  it('quem não entrou é levado ao login', async () => {
    expect(levaPara(await pedir('/privacidade'), '/entrar')).toBe(true)
  })
})

describe('as telas do responsável', () => {
  it('/privacidade explica, tem o botão de baixar e o apagar de cada filho', async () => {
    const r = await pedir('/privacidade', await cookieDe(ADMIN))
    expect(r.status).toBe(200)
    expect(r.corpo).toContain('Baixar os dados da família')
    expect(r.corpo).toContain('não pode ser desfeita')
    expect(r.corpo).toContain('Apagar a conta de Ana Rota')
    expect(r.corpo).toContain('Apagar a conta de Bia Rota')
    expect(r.corpo).toMatch(/href="\/privacidade"/)
  })

  it('a página do filho também tem o apagar', async () => {
    const r = await pedir(`/filhos/${idDaAna}`, await cookieDe(ADMIN))
    expect(r.status).toBe(200)
    expect(r.corpo).toContain('Apagar a conta de Ana Rota')
  })
})

describe('depois de apagar a conta do filho', () => {
  it('antes, o cookie da Ana abre a página dela', async () => {
    const r = await pedir('/mesada', cookieAntigoDaAna)
    expect(r.status).toBe(200)
    expect(r.corpo).toContain('Mesada da Ana Rota')
  })

  it('o cookie emitido antes não abre mais nenhuma página, nem a rota', async () => {
    const admin = await prisma.usuario.findUniqueOrThrow({ where: { email: ADMIN } })
    await excluirFilho(admin, idDaAna, { confirmacao: 'Ana Rota' })

    for (const caminho of ['/', '/mesada', '/perfil', '/perfil/senha']) {
      const r = await pedir(caminho, cookieAntigoDaAna)
      expect(levaPara(r, '/entrar'), caminho).toBe(true)
      expect(r.corpo, caminho).not.toContain('Ana Rota')
    }
    expect((await pedir('/api/privacidade/exportar', cookieAntigoDaAna, 'POST')).status).toBe(401)
    await expect(entrar({ email: ANA, senha: SENHA })).rejects.toMatchObject({ status: 401 })
  })

  it('a irmã continua entrando e vendo só o que é dela', async () => {
    const r = await pedir('/mesada', await cookieDe(BIA))
    expect(r.status).toBe(200)
    expect(r.corpo).toContain('Mesada da Bia Rota')
    expect(r.corpo).not.toContain('Ana Rota')
    expect(idDaBia).toBeTruthy()
  })

  it('o responsável não vê mais a Ana: página dela não encontrada, arquivo sem ela', async () => {
    const cookie = await cookieDe(ADMIN)
    const sumida = await pedir(`/filhos/${idDaAna}`, cookie)
    expect(sumida.corpo).toContain('Página não encontrada')
    expect(sumida.corpo).not.toContain('Apagar a conta de Ana Rota')
    const lista = await pedir('/privacidade', cookie)
    expect(lista.corpo).not.toContain('Ana Rota')
    expect(lista.corpo).toContain('Apagar a conta de Bia Rota')
    const arquivo = await pedir('/api/privacidade/exportar', cookie, 'POST')
    for (const sobra of ['Ana Rota', ANA, 'Mesada da Ana Rota', '2015-03-20']) {
      expect(arquivo.corpo, sobra).not.toContain(sobra)
    }
    expect(arquivo.corpo).toContain('filho removido')
    const atividade = await pedir('/atividade', cookie)
    expect(atividade.corpo).toContain('Excluiu a conta de um filho')
    expect(atividade.corpo).not.toContain('Ana Rota')
  })
})
