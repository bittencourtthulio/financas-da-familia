/**
 * A rota de download (FT-07, PR-34), executada de verdade com a sessão
 * simulada: só o responsável baixa; quem não entrou recebe 401; o adulto e o
 * filho recebem 403 e nada é gravado; só POST (a rota grava na trilha e o
 * cookie `sameSite: lax` seguiria um link de outro site).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const sessao = vi.hoisted(() => ({ token: undefined as string | undefined }))

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

import * as rota from '@/app/api/privacidade/exportar/route'
import { cadastrarFilho, criarLoginDoFilho } from '@/servicos/filhos'
import { entrar, reiniciarLimiteDeLogin } from '@/servicos/autenticacao'
import { assinarSessao } from '@/lib/sessao'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(async () => {
  await limparBanco()
  reiniciarLimiteDeLogin()
  sessao.token = undefined
})

async function entrarComo(usuario: { email: string; senha: string }) {
  sessao.token = (await entrar({ email: usuario.email, senha: usuario.senha })).token
}

describe('o responsável baixa o arquivo', () => {
  it('200, JSON em UTF-8, anexo com nome datado, sem cache, com o documento versionado', async () => {
    const admin = await criarAdmin()
    const filho = await cadastrarFilho(admin, { nome: 'João Ávila', valor: '10,00', periodicidade: 'mensal' })
    await entrarComo(admin)

    const r = await rota.POST()

    expect(r.status).toBe(200)
    expect(r.headers.get('content-type')).toBe('application/json; charset=utf-8')
    expect(r.headers.get('content-disposition')).toMatch(/^attachment; filename="dados-da-familia-\d{4}-\d{2}-\d{2}\.json"$/)
    expect(r.headers.get('cache-control')).toBe('no-store')
    const doc = JSON.parse(await r.text())
    expect(doc.versao_do_formato).toBe(1)
    expect(doc.filhos).toEqual([expect.objectContaining({ id: filho.id, nome: 'João Ávila' })])
  })

  it('deixa o rastro familia.exportada com o responsável como autor', async () => {
    const admin = await criarAdmin()
    await entrarComo(admin)
    await rota.POST()
    const rastro = await prisma.atividade.findFirstOrThrow({ where: { acao: 'familia.exportada' } })
    expect(rastro.atorId).toBe(admin.id)
  })

  it('só POST é oferecido (GET e os outros métodos caem no 405 do Next)', () => {
    const metodos = Object.keys(rota).filter((n) => /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(n))
    expect(metodos).toEqual(['POST'])
  })
})

describe('quem não é o responsável não baixa nada', () => {
  it('sem sessão: 401 e nada é gravado', async () => {
    const r = await rota.POST()
    expect(r.status).toBe(401)
    expect(await r.json()).toEqual({ erro: 'Sessão inválida ou expirada.' })
    expect(r.headers.get('content-disposition')).toBeNull()
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('token inválido, ou de conta que não existe mais: 401', async () => {
    sessao.token = 'isto-nao-e-um-token'
    expect((await rota.POST()).status).toBe(401)
    sessao.token = await assinarSessao('id-que-nao-existe', 'admin')
    expect((await rota.POST()).status).toBe(401)
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('conta de responsável desativada: 401', async () => {
    const admin = await criarAdmin()
    await entrarComo(admin)
    await prisma.usuario.update({ where: { id: admin.id }, data: { ativo: false } })
    expect((await rota.POST()).status).toBe(401)
  })

  it('o adulto: 403, sem dado no corpo e nada gravado', async () => {
    const adulto = await criarUsuario({ papel: 'usuario' })
    await entrarComo(adulto)
    const r = await rota.POST()
    expect(r.status).toBe(403)
    const corpo = await r.text()
    expect(corpo).not.toContain('versao_do_formato')
    expect(JSON.parse(corpo)).toEqual({ erro: 'Você não tem acesso a este recurso.' })
    expect(r.headers.get('content-disposition')).toBeNull()
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('o filho: 403 e nada gravado', async () => {
    const admin = await criarAdmin()
    const filho = await cadastrarFilho(admin, { nome: 'Bia', valor: '1,00', periodicidade: 'mensal' })
    await criarLoginDoFilho(admin, filho.id, { email: 'bia@exemplo.local', senha: 'senha-do-filho-1' })
    await entrarComo({ email: 'bia@exemplo.local', senha: 'senha-do-filho-1' })
    const antes = await prisma.atividade.count()
    const r = await rota.POST()
    expect(r.status).toBe(403)
    expect(await r.text()).not.toContain('Bia')
    expect(await prisma.atividade.count()).toBe(antes)
  })

  it('um token com papel admin forjado para um usuário adulto continua negado (o papel vem do banco)', async () => {
    const adulto = await criarUsuario({ papel: 'usuario' })
    sessao.token = await assinarSessao(adulto.id, 'admin')
    expect((await rota.POST()).status).toBe(403)
  })
})
