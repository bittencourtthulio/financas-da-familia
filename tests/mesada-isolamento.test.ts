/**
 * Isolamento entre irmãos (PR-06, IDOR, D-07): o filho A nunca lê nem altera
 * movimento do filho B, por id de filho, por id de movimento ou por qualquer
 * entrada. Negado com 403 igual para o id do irmão e para um id inexistente, sem
 * vazar a existência. O filho nunca cria, edita nem apaga movimento.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  apagarMovimento,
  editarMovimento,
  extratoDoFilho,
  meuExtrato,
  obterMovimento,
  registrarMovimento,
  saldosDosFilhos,
} from '@/servicos/mesada'
import { cadastrarFilho, criarLoginDoFilho } from '@/servicos/filhos'
import { ErroDeAplicacao } from '@/lib/erros'
import { prisma } from '@/lib/prisma'
import { criarAdmin, limparBanco } from './ajuda'

beforeEach(limparBanco)

const SENHA = 'senha-do-filho-1'

async function irmaos() {
  const admin = await criarAdmin()
  const ana = await cadastrarFilho(admin, { nome: 'Ana', valor: '50,00', periodicidade: 'semanal' })
  const bia = await cadastrarFilho(admin, { nome: 'Bia', valor: '120,00', periodicidade: 'mensal' })
  await criarLoginDoFilho(admin, ana.id, { email: 'ana@exemplo.local', senha: SENHA })
  await criarLoginDoFilho(admin, bia.id, { email: 'bia@exemplo.local', senha: SENHA })
  const usuario = async (email: string) => {
    const u = await prisma.usuario.findUniqueOrThrow({ where: { email } })
    return { id: u.id, nome: u.nome, email: u.email, papel: u.papel, familiaId: u.familiaId }
  }
  const deAna = await registrarMovimento(admin, ana.id, { tipo: 'credito', valor: '11,11', data: '2026-10-01', descricao: 'Da Ana' })
  const deBia = await registrarMovimento(admin, bia.id, { tipo: 'credito', valor: '222,22', data: '2026-10-02', descricao: 'Segredo da Bia' })
  await registrarMovimento(admin, bia.id, { tipo: 'gasto', valor: '33,33', data: '2026-10-03', descricao: 'Gasto da Bia' })
  return { admin, ana, bia, usuarioAna: await usuario('ana@exemplo.local'), usuarioBia: await usuario('bia@exemplo.local'), deAna, deBia }
}

async function erroDe(promessa: Promise<unknown>): Promise<ErroDeAplicacao> {
  try {
    await promessa
  } catch (e) {
    expect(e).toBeInstanceOf(ErroDeAplicacao)
    return e as ErroDeAplicacao
  }
  throw new Error('Era para lançar ErroDeAplicacao.')
}

describe('o filho lê só o próprio extrato', () => {
  it('meuExtrato não recebe id e traz só os movimentos e o saldo do filho da sessão', async () => {
    const { usuarioAna, usuarioBia } = await irmaos()
    const ana = await meuExtrato(usuarioAna)
    expect(ana.saldoCentavos).toBe(1111)
    expect(ana.itens.map((m) => m.descricao)).toEqual(['Da Ana'])
    const bia = await meuExtrato(usuarioBia)
    expect(bia.saldoCentavos).toBe(22222 - 3333)
    expect(bia.itens).toHaveLength(2)
    expect(meuExtrato.length).toBeLessThanOrEqual(2)
  })

  it('o extrato da Ana não carrega nada da Bia, nem em texto', async () => {
    const { usuarioAna } = await irmaos()
    const texto = JSON.stringify(await meuExtrato(usuarioAna))
    for (const alheio of ['Bia', 'Segredo', 'Gasto da Bia', 'bia@exemplo.local']) {
      expect(texto, alheio).not.toContain(alheio)
    }
  })

  it('o extrato do filho nunca traz o id de outro filho', async () => {
    const { usuarioAna, bia } = await irmaos()
    expect(JSON.stringify(await meuExtrato(usuarioAna))).not.toContain(bia.id)
  })

  it('filho sem registro ligado (usuário órfão) recebe 404, não o de outro filho', async () => {
    await irmaos()
    await prisma.filho.updateMany({ data: { usuarioId: null } })
    const orfao = await prisma.usuario.findUniqueOrThrow({ where: { email: 'ana@exemplo.local' } })
    const erro = await erroDe(meuExtrato({ id: orfao.id, nome: orfao.nome, email: orfao.email, papel: orfao.papel, familiaId: orfao.familiaId }))
    expect(erro.status).toBe(404)
  })
})

describe('IDOR: o filho A não alcança nem altera o filho B por id', () => {
  it('toda função com id responde 403 igual para o id do irmão e para um id inexistente', async () => {
    const { usuarioAna, bia, deBia } = await irmaos()
    const novo = { tipo: 'gasto', valor: '999,00', data: '2026-10-09', descricao: 'Invadido' }
    const tentativas: Array<[string, (filho: string, movimento: string) => Promise<unknown>]> = [
      ['registrarMovimento', (f) => registrarMovimento(usuarioAna, f, novo)],
      ['editarMovimento', (_f, m) => editarMovimento(usuarioAna, m, novo)],
      ['apagarMovimento', (_f, m) => apagarMovimento(usuarioAna, m)],
      ['obterMovimento', (_f, m) => obterMovimento(usuarioAna, m)],
      ['extratoDoFilho', (f) => extratoDoFilho(usuarioAna, f)],
    ]
    for (const [nome, chamar] of tentativas) {
      const doIrmao = await erroDe(chamar(bia.id, deBia.movimento.id))
      const inexistente = await erroDe(chamar('id-que-nao-existe', 'id-que-nao-existe'))
      expect(doIrmao.status, nome).toBe(403)
      expect(doIrmao.status, nome).toBe(inexistente.status)
      expect(doIrmao.message, nome).toBe(inexistente.message)
      expect(doIrmao.codigo, nome).toBe(inexistente.codigo)
      expect(JSON.stringify(doIrmao), nome).not.toContain('Bia')
    }
  })

  it('a Ana também é negada no próprio id: filho nunca usa as funções do responsável', async () => {
    const { usuarioAna, ana, deAna } = await irmaos()
    expect((await erroDe(extratoDoFilho(usuarioAna, ana.id))).status).toBe(403)
    expect((await erroDe(editarMovimento(usuarioAna, deAna.movimento.id, { tipo: 'credito', valor: '1,00', data: '2026-10-01' }))).status).toBe(403)
    expect((await erroDe(saldosDosFilhos(usuarioAna))).status).toBe(403)
  })

  it('depois das tentativas, os movimentos da Bia e da Ana estão intactos e nada entrou na trilha', async () => {
    const { usuarioAna, bia, deBia, deAna, admin } = await irmaos()
    const trilhaAntes = await prisma.atividade.count()
    const antes = await prisma.movimentoDeMesada.findMany({ orderBy: { id: 'asc' } })
    const novo = { tipo: 'gasto', valor: '999,00', data: '2026-10-09' }
    await registrarMovimento(usuarioAna, bia.id, novo).catch(() => null)
    await editarMovimento(usuarioAna, deBia.movimento.id, novo).catch(() => null)
    await apagarMovimento(usuarioAna, deBia.movimento.id).catch(() => null)
    await editarMovimento(usuarioAna, deAna.movimento.id, novo).catch(() => null)
    await apagarMovimento(usuarioAna, deAna.movimento.id).catch(() => null)
    const depois = await prisma.movimentoDeMesada.findMany({ orderBy: { id: 'asc' } })
    expect(depois).toEqual(antes)
    expect(await prisma.atividade.count()).toBe(trilhaAntes)
    expect((await extratoDoFilho(admin, bia.id)).saldoCentavos).toBe(22222 - 3333)
  })

  it('o filho com login desativado e o filho de outra instalação de papel não ganham nada', async () => {
    const { admin, ana, usuarioAna } = await irmaos()
    await prisma.usuario.update({ where: { id: usuarioAna.id }, data: { ativo: false } })
    // Mesmo com o objeto de sessão antigo, o serviço do responsável continua negando.
    expect((await erroDe(extratoDoFilho(usuarioAna, ana.id))).status).toBe(403)
    expect((await extratoDoFilho(admin, ana.id)).itens).toHaveLength(1)
  })
})
