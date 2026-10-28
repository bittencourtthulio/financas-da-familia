/**
 * As ações de servidor da mesada, executadas de verdade com a sessão simulada
 * (`next/headers`, `next/navigation` e `next/cache` trocados por dublês):
 * o responsável registra, edita e apaga movimento; o filho, o adulto e quem não
 * entrou NÃO gravam nada (PR-06, PR-33, L2). O gasto que deixa o saldo negativo
 * é aceito e avisado, nunca bloqueado (PR-32).
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

const FILHO = { nome: 'Ana', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' }

async function executar(
  acao: (e: acoes.EstadoDoFormulario, f: FormData) => Promise<acoes.EstadoDoFormulario>,
  form: FormData,
) {
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

async function responsavelComFilho() {
  const admin = await criarAdmin()
  const filho = await cadastrarFilho(admin, FILHO)
  await entrarComo(admin)
  return { admin, filho }
}

describe('o responsável registra, edita e apaga movimento', () => {
  it('registra um crédito e diz que registrou', async () => {
    const { filho } = await responsavelComFilho()
    const r = await executar(
      acoes.registrarMovimentoDeMesada,
      formulario({ filhoId: filho.id, tipo: 'credito', valor: '50,00', data: '2026-10-05', descricao: 'Mesada' }),
    )
    expect(r.estado).toEqual({ sucesso: 'Movimento registrado.' })
    const m = await prisma.movimentoDeMesada.findFirstOrThrow()
    expect(m).toMatchObject({ filhoId: filho.id, tipo: 'credito', valorCentavos: 5000, data: '2026-10-05', descricao: 'Mesada' })
    expect(sessao.revalidados).toEqual(expect.arrayContaining([`/filhos/${filho.id}/mesada`, '/filhos', '/mesada']))
  })

  it('o gasto que deixa o saldo negativo é gravado e vem com o aviso, sem bloquear', async () => {
    const { filho } = await responsavelComFilho()
    const r = await executar(
      acoes.registrarMovimentoDeMesada,
      formulario({ filhoId: filho.id, tipo: 'gasto', valor: '12,30', data: '2026-10-06' }),
    )
    expect(r.estado?.erro).toBeUndefined()
    expect(r.estado?.sucesso).toMatch(/^Movimento registrado\./)
    expect(r.estado?.sucesso).toMatch(/negativo/)
    expect(await prisma.movimentoDeMesada.count()).toBe(1)
  })

  it('o gasto que não deixa o saldo negativo vem sem aviso', async () => {
    const { admin, filho } = await responsavelComFilho()
    await registrarMovimento(admin, filho.id, { tipo: 'credito', valor: '100,00', data: '2026-10-05' })
    const r = await executar(
      acoes.registrarMovimentoDeMesada,
      formulario({ filhoId: filho.id, tipo: 'gasto', valor: '12,30', data: '2026-10-06' }),
    )
    expect(r.estado).toEqual({ sucesso: 'Movimento registrado.' })
  })

  it('valor inválido volta com a mensagem em português e não grava', async () => {
    const { filho } = await responsavelComFilho()
    const r = await executar(
      acoes.registrarMovimentoDeMesada,
      formulario({ filhoId: filho.id, tipo: 'credito', valor: 'abc', data: '2026-10-05' }),
    )
    expect(r.estado?.erro).toMatch(/Valor inválido/)
    expect(await prisma.movimentoDeMesada.count()).toBe(0)
  })

  it('filho inexistente volta com a mensagem do serviço', async () => {
    await responsavelComFilho()
    const r = await executar(
      acoes.registrarMovimentoDeMesada,
      formulario({ filhoId: 'nao-existe', tipo: 'credito', valor: '1,00', data: '2026-10-05' }),
    )
    expect(r.estado?.erro).toBe('Filho não encontrado.')
  })

  it('edita o movimento e volta para o extrato do filho', async () => {
    const { admin, filho } = await responsavelComFilho()
    const { movimento } = await registrarMovimento(admin, filho.id, { tipo: 'credito', valor: '50,00', data: '2026-10-05' })
    const r = await executar(
      acoes.salvarMovimentoDeMesada,
      formulario({ id: movimento.id, tipo: 'gasto', valor: '7,50', data: '2026-10-07', descricao: 'Figurinhas' }),
    )
    expect(r.redirecionou).toBe(`/filhos/${filho.id}/mesada`)
    expect(await prisma.movimentoDeMesada.findUniqueOrThrow({ where: { id: movimento.id } })).toMatchObject({
      tipo: 'gasto',
      valorCentavos: 750,
      descricao: 'Figurinhas',
    })
  })

  it('edição com erro volta com a mensagem e não muda nada', async () => {
    const { admin, filho } = await responsavelComFilho()
    const { movimento } = await registrarMovimento(admin, filho.id, { tipo: 'credito', valor: '50,00', data: '2026-10-05' })
    const r = await executar(
      acoes.salvarMovimentoDeMesada,
      formulario({ id: movimento.id, tipo: 'credito', valor: '0,00', data: '2026-10-05' }),
    )
    expect(r.estado?.erro).toMatch(/Valor inválido/)
    expect((await prisma.movimentoDeMesada.findUniqueOrThrow({ where: { id: movimento.id } })).valorCentavos).toBe(5000)
  })

  it('apaga o movimento e volta para o extrato do filho', async () => {
    const { admin, filho } = await responsavelComFilho()
    const { movimento } = await registrarMovimento(admin, filho.id, { tipo: 'credito', valor: '50,00', data: '2026-10-05' })
    const r = await executar(acoes.excluirMovimentoDeMesada, formulario({ id: movimento.id }))
    expect(r.redirecionou).toBe(`/filhos/${filho.id}/mesada`)
    expect(await prisma.movimentoDeMesada.count()).toBe(0)
  })

  it('apagar um movimento que não existe volta com a mensagem do serviço', async () => {
    await responsavelComFilho()
    const r = await executar(acoes.excluirMovimentoDeMesada, formulario({ id: 'nao-existe' }))
    expect(r.estado?.erro).toBe('Movimento não encontrado.')
  })
})

describe('quem não é o responsável não grava nada em nenhuma ação da mesada', () => {
  async function preparar(quem: 'filho' | 'adulto' | 'visitante') {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, FILHO)
    const bia = await cadastrarFilho(admin, { ...FILHO, nome: 'Bia' })
    await criarLoginDoFilho(admin, ana.id, { email: 'ana@exemplo.local', senha: 'senha-do-filho-1' })
    const { movimento } = await registrarMovimento(admin, bia.id, { tipo: 'credito', valor: '50,00', data: '2026-10-05', descricao: 'Da Bia' })
    if (quem === 'filho') await entrarComo({ email: 'ana@exemplo.local', senha: 'senha-do-filho-1' })
    if (quem === 'adulto') await entrarComo(await criarUsuario({ papel: 'usuario' }))
    return { bia, movimento }
  }

  describe.each([
    ['o filho', 'filho', '/'],
    ['o adulto', 'adulto', '/'],
    ['quem não entrou', 'visitante', '/entrar'],
  ] as const)('%s', (_nome, quem, destino) => {
    it('é barrado em registrar, editar e apagar, inclusive no movimento do irmão', async () => {
      const { bia, movimento } = await preparar(quem)
      const antes = {
        movimentos: await prisma.movimentoDeMesada.findMany({ orderBy: { id: 'asc' } }),
        atividades: await prisma.atividade.count(),
      }
      const tentativas: Array<[typeof acoes.registrarMovimentoDeMesada, Record<string, string>]> = [
        [acoes.registrarMovimentoDeMesada, { filhoId: bia.id, tipo: 'gasto', valor: '999,00', data: '2026-10-09' }],
        [acoes.salvarMovimentoDeMesada, { id: movimento.id, tipo: 'gasto', valor: '999,00', data: '2026-10-09' }],
        [acoes.excluirMovimentoDeMesada, { id: movimento.id }],
      ]
      for (const [acao, campos] of tentativas) {
        const r = await executar(acao, formulario(campos))
        expect(r.redirecionou).toBe(destino)
      }
      expect(await prisma.movimentoDeMesada.findMany({ orderBy: { id: 'asc' } })).toEqual(antes.movimentos)
      expect(await prisma.atividade.count()).toBe(antes.atividades)
    })
  })
})
