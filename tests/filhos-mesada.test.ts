/**
 * A prova no servidor de produção real (PR-06, FT-05): o filho abre só o
 * painel neutro, a própria mesada, o perfil e a troca de senha; é barrado em
 * todo o resto e nunca alcança o irmão, por id ou por parâmetro. O servidor
 * responde igual ao id de um irmão e ao de um id que não existe. O responsável
 * vê os filhos; o adulto e quem não entrou não.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { cadastrarFilho, criarLoginDoFilho, desativarLoginDoFilho } from '@/servicos/filhos'
import { criarCategoria, criarLancamento } from '@/servicos/lancamentos'
import { entrar } from '@/servicos/autenticacao'
import { COOKIE_SESSAO } from '@/lib/sessao'
import { hojeEmSaoPaulo } from '@/lib/datas'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { limparBanco } from './ajuda'

const PORTA = 3179
const BASE = `http://localhost:${PORTA}`
const SENHA = 'senha-de-rota-123'

let servidor: ChildProcess
let idDaAna = ''
let idDaBia = ''

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

/** O React separa nós de texto vizinhos com comentários, e o real usa espaço rígido. */
const limpo = (html: string) => html.replaceAll('<!-- -->', '').replaceAll(' ', ' ')

async function abrir(caminho: string, email: string) {
  const r = await pedir(caminho, await cookieDe(email))
  return { status: r.status, local: r.headers.get('location'), html: limpo(await r.text()) }
}

/** Com loading.tsx a resposta já começou: o redirecionamento viaja no corpo. */
const foiBarrado = (r: { status: number; html: string }, destino = '/') =>
  r.status === 307 || new RegExp(`<meta[^>]*http-equiv="refresh"[^>]*content="[^"]*url=${destino}"`).test(r.html)

beforeAll(async () => {
  await limparBanco()
  await prisma.usuario.createMany({
    data: [
      { nome: 'Responsável da Mesada', email: 'admin.mesada@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'admin' },
      { nome: 'Adulto da Mesada', email: 'adulto.mesada@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'usuario' },
    ],
  })
  const admin = await prisma.usuario.findUniqueOrThrow({ where: { email: 'admin.mesada@teste.local' } })

  const ana = await cadastrarFilho(admin, { nome: 'Ana de Rota', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' })
  const bia = await cadastrarFilho(admin, { nome: 'Bia de Rota', nascimento: '2012-07-01', valor: '120,00', periodicidade: 'mensal' })
  idDaAna = ana.id
  idDaBia = bia.id
  await criarLoginDoFilho(admin, ana.id, { email: 'ana.mesada@teste.local', senha: SENHA })
  await criarLoginDoFilho(admin, bia.id, { email: 'bia.mesada@teste.local', senha: SENHA })

  const categoria = await criarCategoria(admin, { nome: 'Mercado da Mesada', tipo: 'despesa' })
  await criarLancamento(admin, {
    tipo: 'despesa',
    valor: '77,77',
    data: hojeEmSaoPaulo(),
    categoriaId: categoria.id,
    descricao: 'Marcador Financeiro da Casa',
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

describe('o filho abre o que é dele', () => {
  it('o painel é neutro: título, frase neutra, link para a mesada e nenhum valor', async () => {
    const r = await abrir('/', 'ana.mesada@teste.local')
    expect(r.status).toBe(200)
    expect(r.html).toContain('Painel da família')
    expect(r.html).toContain('Não há resumo da casa para o seu perfil.')
    expect(r.html).toMatch(/<a[^>]*href="\/mesada"[^>]*>Ver minha mesada<\/a>/)
    expect(r.html).not.toContain('Saldo do mês')
    expect(r.html).not.toContain('Marcador Financeiro')
    expect(r.html).not.toMatch(/R\$ \d/)
  })

  it('a página de mesada mostra nome, valor combinado, periodicidade e o estado vazio', async () => {
    const r = await abrir('/mesada', 'ana.mesada@teste.local')
    expect(r.status).toBe(200)
    expect(r.html).toContain('Minha mesada')
    expect(r.html).toContain('Ana de Rota')
    expect(r.html).toContain('R$ 50,00')
    expect(r.html).toContain('por semana')
    expect(r.html).toMatch(/Ainda não há movimentos de mesada/)
  })

  it('a página não tem saldo, extrato nem botão de ação, e o valor é dito como combinado', async () => {
    const { html } = await abrir('/mesada', 'ana.mesada@teste.local')
    expect(html).not.toMatch(/Saldo|Extrato/)
    const principal = /<main class="conteudo">[\s\S]*?<\/main>/.exec(html)?.[0] ?? ''
    expect(principal).toContain('Minha mesada')
    expect(principal).not.toMatch(/<form|<button/)
    expect(html).toMatch(/combinad/i)
  })

  it('cada irmão vê só a própria mesada', async () => {
    const bia = await abrir('/mesada', 'bia.mesada@teste.local')
    expect(bia.html).toContain('Bia de Rota')
    expect(bia.html).toContain('R$ 120,00')
    expect(bia.html).toContain('por mês')
    expect(bia.html).not.toContain('Ana de Rota')
    expect(bia.html).not.toContain('R$ 50,00')
  })

  it('o id do irmão na URL ou no parâmetro não muda nada: a página é sempre a do próprio filho', async () => {
    const ana = await abrir(`/mesada?filho=${idDaBia}&id=${idDaBia}`, 'ana.mesada@teste.local')
    expect(ana.status).toBe(200)
    expect(ana.html).toContain('Ana de Rota')
    expect(ana.html).not.toContain('Bia de Rota')
    expect(ana.html).not.toContain('R$ 120,00')
    const porCaminho = await abrir(`/mesada/${idDaBia}`, 'ana.mesada@teste.local')
    expect(porCaminho.status).toBe(404)
    expect(porCaminho.html).not.toContain('Bia de Rota')
  })

  it('a barra lateral do filho tem só Painel, Minha mesada e Meu perfil', async () => {
    const { html } = await abrir('/mesada', 'ana.mesada@teste.local')
    const nav = /<nav class="navegacao"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? ''
    const destinos = [...nav.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
    expect(destinos).toEqual(['/', '/mesada', '/perfil'])
    expect(nav).toContain('Minha mesada')
    for (const proibido of ['Lançamentos', 'Categorias', 'Atividade', 'Usuários', 'Filhos']) {
      expect(nav).not.toContain(proibido)
    }
  })

  it('a barra de status mostra o papel pelo rótulo Filho', async () => {
    const { html } = await abrir('/', 'ana.mesada@teste.local')
    expect(html).toMatch(/<span>Filho<\/span>/)
  })

  it.each(['/perfil', '/perfil/senha'])('%s abre (P-9, E-3 e E-4)', async (rota) => {
    expect((await abrir(rota, 'ana.mesada@teste.local')).status).toBe(200)
  })
})

describe('o filho é barrado em todo o resto, sem dado no corpo', () => {
  const PROIBIDAS = () => [
    '/lancamentos',
    '/lancamentos?mes=2020-01',
    '/lancamentos/novo',
    '/lancamentos/categorias',
    '/lancamentos/qualquer-id',
    '/atividade',
    '/configuracoes/usuarios',
    '/filhos',
    '/filhos/novo',
    `/filhos/${idDaBia}`,
    `/filhos/${idDaAna}`,
    '/filhos/id-que-nao-existe',
  ]

  it('cada rota proibida devolve o filho ao painel e não entrega nada', async () => {
    for (const rota of PROIBIDAS()) {
      const r = await abrir(rota, 'ana.mesada@teste.local')
      expect(foiBarrado(r), rota).toBe(true)
      for (const vazamento of [
        'Marcador Financeiro',
        'Mercado da Mesada',
        'Bia de Rota',
        'bia.mesada@teste.local',
        'admin.mesada@teste.local',
        'Cadastrar filho',
        'Nenhum filho',
        'tabela-rolavel',
        'Criou o usuário',
      ]) {
        expect(r.html, `${rota} vazou ${vazamento}`).not.toContain(vazamento)
      }
    }
  })

  it('a resposta ao id do irmão e a um id que não existe é idêntica (nada vaza a existência)', async () => {
    const doIrmao = await abrir(`/filhos/${idDaBia}`, 'ana.mesada@teste.local')
    const inexistente = await abrir('/filhos/id-que-nao-existe', 'ana.mesada@teste.local')
    expect(doIrmao.status).toBe(inexistente.status)
    expect(doIrmao.local).toBe(inexistente.local)
    expect(foiBarrado(doIrmao)).toBe(true)
    expect(foiBarrado(inexistente)).toBe(true)
  })
})

describe('quem não é filho', () => {
  it('o responsável vê os dois filhos, a situação do login e o item Filhos no menu', async () => {
    const r = await abrir('/filhos', 'admin.mesada@teste.local')
    expect(r.status).toBe(200)
    expect(r.html).toContain('Ana de Rota')
    expect(r.html).toContain('Bia de Rota')
    expect(r.html).toContain('R$ 50,00 por semana')
    expect(r.html).toContain('R$ 120,00 por mês')
    expect(r.html).toContain('Login ativo')
    expect(r.html).toMatch(/<a[^>]*href="\/filhos"[^>]*>Filhos<\/a>/)
    expect(r.html).toMatch(/Cadastrar filho/)
  })

  it('o responsável abre o cadastro e a página do filho; id inexistente cai em não encontrado', async () => {
    const novo = await abrir('/filhos/novo', 'admin.mesada@teste.local')
    expect(novo.status).toBe(200)
    for (const nome of ['nome', 'valor', 'periodicidade', 'nascimento']) expect(novo.html).toContain(`name="${nome}"`)
    const ana = await abrir(`/filhos/${idDaAna}`, 'admin.mesada@teste.local')
    expect(ana.status).toBe(200)
    expect(ana.html).toContain('value="50,00"')
    expect(ana.html).toContain('ana.mesada@teste.local')
    expect(ana.html).toContain('Desativar login')
    // Com o loading.tsx a resposta já começou, então o status fica 200; o corpo diz que não achou.
    const inexistente = await abrir('/filhos/id-que-nao-existe', 'admin.mesada@teste.local')
    expect(inexistente.html).toContain('Página não encontrada')
    expect(inexistente.html).not.toContain('Ana de Rota')
  })

  it('o painel do responsável não traz o link da mesada, e ele é mandado embora de /mesada', async () => {
    const painel = await abrir('/', 'admin.mesada@teste.local')
    expect(painel.html).not.toContain('Ver minha mesada')
    expect(foiBarrado(await abrir('/mesada', 'admin.mesada@teste.local'))).toBe(true)
  })

  it('o adulto não vê Filhos, não abre /filhos nem /mesada', async () => {
    const painel = await abrir('/', 'adulto.mesada@teste.local')
    expect(painel.html).not.toContain('href="/filhos"')
    expect(painel.html).not.toContain('href="/mesada"')
    for (const rota of ['/filhos', '/filhos/novo', `/filhos/${idDaAna}`, '/mesada']) {
      const r = await abrir(rota, 'adulto.mesada@teste.local')
      expect(foiBarrado(r), rota).toBe(true)
      expect(r.html).not.toContain('Ana de Rota')
    }
  })

  it('sem sessão, as rotas novas mandam para o login', async () => {
    for (const rota of ['/mesada', '/filhos', '/filhos/novo', `/filhos/${idDaAna}`]) {
      const r = await pedir(rota)
      expect(r.status, rota).toBe(307)
      expect(r.headers.get('location'), rota).toContain('/entrar')
    }
  })
})

describe('login desativado', () => {
  it('a sessão que o filho já tinha deixa de abrir a mesada', async () => {
    const cookie = await cookieDe('bia.mesada@teste.local')
    expect((await pedir('/mesada', cookie)).status).toBe(200)
    const admin = await prisma.usuario.findUniqueOrThrow({ where: { email: 'admin.mesada@teste.local' } })
    await desativarLoginDoFilho(admin, idDaBia)
    const r = await pedir('/mesada', cookie)
    expect(r.status).toBe(307)
    expect(r.headers.get('location')).toContain('/entrar')
  })
})
