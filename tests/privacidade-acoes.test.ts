/**
 * A ação de servidor que apaga a conta do filho (FT-07, PR-35), executada de
 * verdade com a sessão simulada: o responsável digita o nome e o filho some; o
 * nome errado não apaga; o filho (nem a si mesmo), o adulto e quem não entrou
 * NÃO apagam nada e são levados embora.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const sessao = vi.hoisted(() => ({ token: undefined as string | undefined, revalidados: [] as string[] }))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (nome: string) => (sessao.token ? { name: nome, value: sessao.token } : undefined),
    set: () => {},
    delete: () => {},
  }),
}))
vi.mock('next/navigation', () => ({
  redirect: (destino: string) => {
    throw new Error(`NEXT_REDIRECT ${destino}`)
  },
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: (c: string) => void sessao.revalidados.push(c) }))

import * as acoes from '@/app/acoes'
import { cadastrarFilho, criarLoginDoFilho } from '@/servicos/filhos'
import { registrarMovimento } from '@/servicos/mesada'
import { entrar, reiniciarLimiteDeLogin } from '@/servicos/autenticacao'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(async () => {
  await limparBanco()
  reiniciarLimiteDeLogin()
  sessao.token = undefined
  sessao.revalidados = []
})

const formulario = (campos: Record<string, string>) => {
  const form = new FormData()
  for (const [chave, valor] of Object.entries(campos)) form.set(chave, valor)
  return form
}

async function executar(form: FormData) {
  try {
    return { estado: await acoes.excluirContaDoFilho({}, form), redirecionou: null as string | null }
  } catch (erro) {
    const m = /^NEXT_REDIRECT (.*)$/.exec((erro as Error).message)
    if (!m) throw erro
    return { estado: null, redirecionou: m[1] as string }
  }
}

async function entrarComo(usuario: { email: string; senha: string }) {
  sessao.token = (await entrar({ email: usuario.email, senha: usuario.senha })).token
}

async function cenario() {
  const admin = await criarAdmin()
  const ana = await cadastrarFilho(admin, { nome: 'Ana', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' })
  const pedro = await cadastrarFilho(admin, { nome: 'Pedro', valor: '10,00', periodicidade: 'mensal' })
  await criarLoginDoFilho(admin, ana.id, { email: 'ana@exemplo.local', senha: 'senha-do-filho-1' })
  await criarLoginDoFilho(admin, pedro.id, { email: 'pedro@exemplo.local', senha: 'senha-do-filho-1' })
  await registrarMovimento(admin, ana.id, { tipo: 'credito', valor: '5,00', data: '2026-10-05' })
  return { admin, ana, pedro }
}

const contagens = async () => ({
  filhos: await prisma.filho.count(),
  usuarios: await prisma.usuario.count(),
  movimentos: await prisma.movimentoDeMesada.count(),
  atividades: await prisma.atividade.count(),
})

describe('o responsável apaga a conta do filho', () => {
  it('com o nome certo, apaga tudo e volta para Privacidade com o aviso', async () => {
    const { admin, ana } = await cenario()
    await entrarComo(admin)
    const r = await executar(formulario({ id: ana.id, confirmacao: 'Ana' }))
    expect(r.redirecionou).toBe('/privacidade?excluido=1')
    expect(await prisma.filho.findUnique({ where: { id: ana.id } })).toBeNull()
    expect(await prisma.movimentoDeMesada.count()).toBe(0)
    expect(await prisma.usuario.findUnique({ where: { email: 'ana@exemplo.local' } })).toBeNull()
    expect(sessao.revalidados).toEqual(expect.arrayContaining(['/filhos', '/privacidade', '/atividade']))
  })

  it('com o nome errado devolve a mensagem em português e não apaga', async () => {
    const { admin, ana } = await cenario()
    await entrarComo(admin)
    const antes = await contagens()
    const r = await executar(formulario({ id: ana.id, confirmacao: 'Pedro' }))
    expect(r.estado?.erro).toBe('O nome digitado não confere com o do filho. Nada foi apagado.')
    expect(await contagens()).toEqual(antes)
  })

  it('sem digitar nada, pede o nome', async () => {
    const { admin, ana } = await cenario()
    await entrarComo(admin)
    const r = await executar(formulario({ id: ana.id }))
    expect(r.estado?.erro).toMatch(/nome do filho/)
    expect(await prisma.filho.count()).toBe(2)
  })

  it('filho que não existe vira mensagem, sem rastro técnico', async () => {
    const { admin } = await cenario()
    await entrarComo(admin)
    const r = await executar(formulario({ id: 'nao-existe', confirmacao: 'Ana' }))
    expect(r.estado?.erro).toBe('Filho não encontrado.')
  })
})

describe('quem não é o responsável não apaga nada', () => {
  it('o filho, nem ele mesmo, é levado ao painel e nada é apagado', async () => {
    const { ana } = await cenario()
    await entrarComo({ email: 'ana@exemplo.local', senha: 'senha-do-filho-1' })
    const antes = await contagens()
    const r = await executar(formulario({ id: ana.id, confirmacao: 'Ana' }))
    expect(r.redirecionou).toBe('/')
    expect(await contagens()).toEqual(antes)
  })

  it('o filho também não apaga o irmão', async () => {
    const { pedro } = await cenario()
    await entrarComo({ email: 'ana@exemplo.local', senha: 'senha-do-filho-1' })
    const antes = await contagens()
    const r = await executar(formulario({ id: pedro.id, confirmacao: 'Pedro' }))
    expect(r.redirecionou).toBe('/')
    expect(await contagens()).toEqual(antes)
  })

  it('o adulto é levado ao painel e nada é apagado', async () => {
    const { ana } = await cenario()
    const adulto = await criarUsuario({ papel: 'usuario' })
    await entrarComo(adulto)
    const antes = await contagens()
    const r = await executar(formulario({ id: ana.id, confirmacao: 'Ana' }))
    expect(r.redirecionou).toBe('/')
    expect(await contagens()).toEqual(antes)
  })

  it('quem não entrou é levado ao login e nada é apagado', async () => {
    const { ana } = await cenario()
    const antes = await contagens()
    const r = await executar(formulario({ id: ana.id, confirmacao: 'Ana' }))
    expect(r.redirecionou).toBe('/entrar')
    expect(await contagens()).toEqual(antes)
  })
})
