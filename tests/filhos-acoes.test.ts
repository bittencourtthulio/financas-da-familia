/**
 * As ações de servidor de verdade, executadas com a sessão simulada
 * (`next/headers`, `next/navigation` e `next/cache` trocados por dublês): um
 * filho, um adulto e quem não entrou NÃO gravam nada por nenhuma ação sensível
 * (PR-06, L2), e o responsável cadastra, edita e gerencia o login do filho.
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
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))

import * as acoes from '@/app/acoes'
import { cadastrarFilho, criarLoginDoFilho } from '@/servicos/filhos'
import { entrar, reiniciarLimiteDeLogin } from '@/servicos/autenticacao'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco, SENHA_PADRAO } from './ajuda'

beforeEach(async () => {
  await limparBanco()
  reiniciarLimiteDeLogin()
  sessao.token = undefined
})

const formulario = (campos: Record<string, string>) => {
  const form = new FormData()
  for (const [chave, valor] of Object.entries(campos)) form.set(chave, valor)
  return form
}

const FILHO = { nome: 'Ana', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' }

/** Executa a ação e devolve o que ela devolveu ou o redirecionamento que lançou. */
async function executar(acao: (e: acoes.EstadoDoFormulario, f: FormData) => Promise<acoes.EstadoDoFormulario>, form: FormData) {
  try {
    return { estado: await acao({}, form), redirecionou: null as string | null }
  } catch (erro) {
    const m = /^NEXT_REDIRECT (.*)$/.exec((erro as Error).message)
    if (!m) throw erro
    return { estado: null, redirecionou: m[1] as string }
  }
}

async function entrarComo(usuario: { email: string; senha: string }) {
  sessao.token = (await entrar({ email: usuario.email, senha: usuario.senha })).token
}

async function contagens() {
  return {
    filhos: await prisma.filho.count(),
    usuarios: await prisma.usuario.count(),
    atividades: await prisma.atividade.count(),
    lancamentos: await prisma.lancamento.count(),
    categorias: await prisma.categoria.count(),
    movimentos: await prisma.movimentoDeMesada.count(),
  }
}

describe('o responsável usa as ações de filho', () => {
  it('cadastra o filho e vai para a página dele', async () => {
    const admin = await criarAdmin()
    await entrarComo(admin)
    const r = await executar(acoes.registrarFilho, formulario(FILHO))
    const filho = await prisma.filho.findFirstOrThrow()
    expect(r.redirecionou).toBe(`/filhos/${filho.id}`)
    expect(filho).toMatchObject({ nome: 'Ana', mesadaCentavos: 5000, periodicidade: 'semanal' })
  })

  it('valor inválido volta com a mensagem e não grava', async () => {
    const admin = await criarAdmin()
    await entrarComo(admin)
    const r = await executar(acoes.registrarFilho, formulario({ ...FILHO, valor: 'abc' }))
    expect(r.estado?.erro).toMatch(/Valor da mesada inválido/)
    expect(await prisma.filho.count()).toBe(0)
  })

  it('edita o filho, cria o login e desativa o login', async () => {
    const admin = await criarAdmin()
    const filho = await cadastrarFilho(admin, FILHO)
    await entrarComo(admin)

    const editou = await executar(acoes.salvarFilho, formulario({ ...FILHO, id: filho.id, valor: '75,00' }))
    expect(editou.estado?.sucesso).toBe('Filho atualizado.')
    expect((await prisma.filho.findUniqueOrThrow({ where: { id: filho.id } })).mesadaCentavos).toBe(7500)

    const criou = await executar(
      acoes.criarLoginDeFilho,
      formulario({ id: filho.id, email: 'ana@exemplo.local', senha: 'senha-do-filho-1' }),
    )
    expect(criou.estado?.sucesso).toBe('Login criado.')
    expect((await prisma.usuario.findUniqueOrThrow({ where: { email: 'ana@exemplo.local' } })).papel).toBe('filho')

    const desativou = await executar(acoes.desativarLoginDeFilho, formulario({ id: filho.id }))
    expect(desativou.estado?.sucesso).toBe('Login desativado.')
    expect((await prisma.usuario.findUniqueOrThrow({ where: { email: 'ana@exemplo.local' } })).ativo).toBe(false)
  })

  it('erro de serviço vira mensagem em português, sem rastro técnico', async () => {
    const admin = await criarAdmin()
    const filho = await cadastrarFilho(admin, FILHO)
    await entrarComo(admin)
    const r = await executar(acoes.desativarLoginDeFilho, formulario({ id: filho.id }))
    expect(r.estado?.erro).toBe('Este filho não tem login.')
  })
})

describe('quem não é o responsável não grava nada por nenhuma ação sensível', () => {
  const ID = 'qualquer-id'
  const sensiveis: Array<[string, (typeof acoes)[keyof typeof acoes], Record<string, string>]> = [
    ['criarUsuario', acoes.criarUsuario, { nome: 'X', email: 'x@exemplo.local', senha: 'senha-12345', papel: 'admin' }],
    ['editarUsuario', acoes.editarUsuario, { id: ID, papel: 'admin' }],
    ['desativarUsuario', acoes.desativarUsuario, { id: ID }],
    ['registrarFilho', acoes.registrarFilho, FILHO],
    ['salvarFilho', acoes.salvarFilho, { ...FILHO, id: ID }],
    ['criarLoginDeFilho', acoes.criarLoginDeFilho, { id: ID, email: 'y@exemplo.local', senha: 'senha-12345' }],
    ['desativarLoginDeFilho', acoes.desativarLoginDeFilho, { id: ID }],
    ['registrarMovimentoDeMesada', acoes.registrarMovimentoDeMesada, { filhoId: ID, tipo: 'credito', valor: '1,00', data: '2026-10-27' }],
    ['salvarMovimentoDeMesada', acoes.salvarMovimentoDeMesada, { id: ID, tipo: 'credito', valor: '1,00', data: '2026-10-27' }],
    ['excluirMovimentoDeMesada', acoes.excluirMovimentoDeMesada, { id: ID }],
    ['excluirContaDoFilho', acoes.excluirContaDoFilho, { id: ID, confirmacao: 'Ana' }],
    ['registrarLancamento', acoes.registrarLancamento, { tipo: 'despesa', valor: '1,00', data: '2026-10-27', categoriaId: ID }],
    ['salvarLancamento', acoes.salvarLancamento, { id: ID, tipo: 'despesa', valor: '1,00', data: '2026-10-27', categoriaId: ID }],
    ['excluirLancamento', acoes.excluirLancamento, { id: ID }],
    ['alternarPagoDoLancamento', acoes.alternarPagoDoLancamento, { id: ID }],
    ['criarCategoriaDoCampo', acoes.criarCategoriaDoCampo, {}],
    ['apagarCategoriaDoCampo', acoes.apagarCategoriaDoCampo, {}],
    ['redefinirSenhaDeUsuario', acoes.redefinirSenhaDeUsuario, { id: ID, senha: 'senha-nova-123', confirmacao: 'senha-nova-123' }],
    ['redefinirSenhaDeFilho', acoes.redefinirSenhaDeFilho, { id: ID, senha: 'senha-nova-123', confirmacao: 'senha-nova-123' }],
  ]
  const LIVRES = ['autenticar', 'sair', 'salvarPerfil', 'salvarSenha']

  it('a tabela cobre toda ação exportada (as livres são login, sair, perfil e senha)', () => {
    const exportadas = Object.keys(acoes).sort()
    expect([...sensiveis.map(([n]) => n), ...LIVRES].sort()).toEqual(exportadas)
  })

  const quem: Array<[string, () => Promise<void>, string]> = [
    [
      'o filho',
      async () => {
        const admin = await criarAdmin()
        const filho = await cadastrarFilho(admin, { ...FILHO, nome: 'Bia' })
        await criarLoginDoFilho(admin, filho.id, { email: 'bia@exemplo.local', senha: 'senha-do-filho-1' })
        await entrarComo({ email: 'bia@exemplo.local', senha: 'senha-do-filho-1' })
      },
      '/',
    ],
    [
      'o adulto',
      async () => {
        const adulto = await criarUsuario({ papel: 'usuario' })
        await entrarComo(adulto)
      },
      '/',
    ],
    ['quem não entrou', async () => {}, '/entrar'],
  ]

  describe.each(quem)('%s', (_nome, preparar, destino) => {
    it.each(sensiveis.filter(([n]) => ['criarUsuario', 'editarUsuario', 'desativarUsuario', 'registrarFilho', 'salvarFilho', 'criarLoginDeFilho', 'desativarLoginDeFilho', 'registrarMovimentoDeMesada', 'salvarMovimentoDeMesada', 'excluirMovimentoDeMesada', 'excluirContaDoFilho', 'redefinirSenhaDeUsuario', 'redefinirSenhaDeFilho'].includes(n)))(
      '%s é barrada e não grava',
      async (_n, acao, campos) => {
        await preparar()
        const antes = await contagens()
        const r = await executar(acao as never, formulario(campos))
        expect(r.redirecionou).toBe(destino)
        expect(await contagens()).toEqual(antes)
      },
    )
  })

  it('o filho também é barrado nas ações de lançamento e categoria, e o adulto passa delas', async () => {
    const admin = await criarAdmin()
    const filho = await cadastrarFilho(admin, FILHO)
    await criarLoginDoFilho(admin, filho.id, { email: 'ana@exemplo.local', senha: 'senha-do-filho-1' })
    await entrarComo({ email: 'ana@exemplo.local', senha: 'senha-do-filho-1' })
    const antes = await contagens()
    for (const [nome, acao, campos] of sensiveis.filter(([n]) => /Lancamento|Categoria/.test(n))) {
      const r = await executar(acao as never, formulario(campos))
      expect(r.redirecionou, nome).toBe('/')
    }
    expect(await contagens()).toEqual(antes)

    const adulto = await criarUsuario({ papel: 'usuario', senha: SENHA_PADRAO })
    await entrarComo(adulto)
    const criada = await acoes.criarCategoriaDoCampo('Nova', 'despesa')
    expect(criada.categoria).toMatchObject({ nome: 'Nova', tipo: 'despesa' })
    expect(await acoes.apagarCategoriaDoCampo(criada.categoria!.id)).toEqual({})
  })

  it('o filho ainda troca a própria senha e edita o próprio perfil (P-9, E-3 e E-4)', async () => {
    const admin = await criarAdmin()
    const filho = await cadastrarFilho(admin, FILHO)
    await criarLoginDoFilho(admin, filho.id, { email: 'ana@exemplo.local', senha: 'senha-do-filho-1' })
    await entrarComo({ email: 'ana@exemplo.local', senha: 'senha-do-filho-1' })
    const perfil = await executar(acoes.salvarPerfil, formulario({ nome: 'Ana Clara', email: 'ana@exemplo.local' }))
    expect(perfil.estado?.sucesso).toBe('Perfil atualizado.')
    const senha = await executar(
      acoes.salvarSenha,
      formulario({ senhaAtual: 'senha-do-filho-1', senhaNova: 'outra-senha-123', confirmacao: 'outra-senha-123' }),
    )
    expect(senha.estado?.sucesso).toMatch(/Senha alterada/)
    expect((await prisma.usuario.findUniqueOrThrow({ where: { email: 'ana@exemplo.local' } })).papel).toBe('filho')
  })
})
