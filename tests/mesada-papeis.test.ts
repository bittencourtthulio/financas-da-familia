/**
 * Autorização da mesada (PR-06, PR-33, D-06): só o responsável (`admin`)
 * registra, edita, apaga e lê movimentos de qualquer filho; o adulto, o filho,
 * o vazio e o desconhecido recebem 403 em TODA função do responsável, por lista
 * de permitidos. A exceção é `meuExtrato`, que só o filho usa. A tabela
 * `chamadas` ganha uma linha por função nova: o teste varre todas.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as servico from '@/servicos/mesada'
import { cadastrarFilho, criarLoginDoFilho } from '@/servicos/filhos'
import { ErroDeAplicacao } from '@/lib/erros'
import { prisma } from '@/lib/prisma'
import { type UsuarioAutenticado } from '@/servicos/autenticacao'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

type Chamada = (autor: UsuarioAutenticado, ids: { filho: string; movimento: string }) => Promise<unknown>

const DADOS = { tipo: 'credito', valor: '1,00', data: '2026-10-05', descricao: 'Invasor' }

const chamadas: Array<[string, Chamada]> = [
  ['registrarMovimento', (a, ids) => servico.registrarMovimento(a, ids.filho, DADOS)],
  ['editarMovimento', (a, ids) => servico.editarMovimento(a, ids.movimento, DADOS)],
  ['apagarMovimento', (a, ids) => servico.apagarMovimento(a, ids.movimento)],
  ['obterMovimento', (a, ids) => servico.obterMovimento(a, ids.movimento)],
  ['extratoDoFilho', (a, ids) => servico.extratoDoFilho(a, ids.filho)],
  ['saldosDosFilhos', (a) => servico.saldosDosFilhos(a)],
]

const PAPEIS_NEGADOS = ['usuario', 'filho', 'visitante', '', 'ADMIN', 'Admin', 'administrador']

describe('todas as funções do serviço de mesada negam quem não é admin', () => {
  it('a tabela cobre toda função exportada (menos meuExtrato, do próprio filho)', () => {
    const exportadas = Object.entries(servico)
      .filter(([, valor]) => typeof valor === 'function')
      .map(([nome]) => nome)
      .filter((nome) => nome !== 'meuExtrato')
      .sort()
    expect(chamadas.map(([nome]) => nome).sort()).toEqual(exportadas)
  })

  describe.each(chamadas)('%s', (_nome, chamar) => {
    it.each(PAPEIS_NEGADOS)('nega o papel "%s" com 403 e não toca no banco', async (papel) => {
      const admin = await criarAdmin()
      const filho = await cadastrarFilho(admin, { nome: 'Existente', valor: '1,00', periodicidade: 'mensal' })
      const { movimento } = await servico.registrarMovimento(admin, filho.id, { ...DADOS, descricao: 'Original' })
      const antes = {
        movimentos: await prisma.movimentoDeMesada.count(),
        atividades: await prisma.atividade.count(),
        filhos: await prisma.filho.count(),
      }
      const alguem = { ...(await criarUsuario({ email: `${papel || 'vazio'}@exemplo.local` })), papel }

      let erro: unknown
      let resultado: unknown
      try {
        resultado = await chamar(alguem, { filho: filho.id, movimento: movimento.id })
      } catch (e) {
        erro = e
      }
      expect(resultado).toBeUndefined()
      expect(erro).toBeInstanceOf(ErroDeAplicacao)
      expect((erro as ErroDeAplicacao).status).toBe(403)
      expect(await prisma.movimentoDeMesada.count()).toBe(antes.movimentos)
      expect(await prisma.atividade.count()).toBe(antes.atividades)
      expect(await prisma.filho.count()).toBe(antes.filhos)
      expect((await prisma.movimentoDeMesada.findUniqueOrThrow({ where: { id: movimento.id } })).descricao).toBe('Original')
    })
  })

  it('o responsável passa em todas', async () => {
    const admin = await criarAdmin()
    const filho = await cadastrarFilho(admin, { nome: 'Existente', valor: '1,00', periodicidade: 'mensal' })
    for (const [nome, chamar] of chamadas) {
      const { movimento } = await servico.registrarMovimento(admin, filho.id, DADOS)
      await expect(chamar(admin, { filho: filho.id, movimento: movimento.id }), nome).resolves.not.toThrow()
    }
  })
})

describe('meuExtrato é só do filho', () => {
  it.each(['admin', 'usuario', 'visitante', '', 'FILHO'])('o papel "%s" recebe 403', async (papel) => {
    const alguem = { ...(await criarUsuario()), papel }
    let erro: unknown
    try {
      await servico.meuExtrato(alguem)
    } catch (e) {
      erro = e
    }
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect((erro as ErroDeAplicacao).status).toBe(403)
  })

  it('o filho com registro lê o próprio extrato', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, { nome: 'Ana', valor: '1,00', periodicidade: 'mensal' })
    await criarLoginDoFilho(admin, ana.id, { email: 'ana@exemplo.local', senha: 'senha-do-filho-1' })
    await servico.registrarMovimento(admin, ana.id, DADOS)
    const usuarioAna = await prisma.usuario.findUniqueOrThrow({ where: { email: 'ana@exemplo.local' } })
    const extrato = await servico.meuExtrato(usuarioAna)
    expect(extrato.saldoCentavos).toBe(100)
    expect(extrato.itens).toHaveLength(1)
  })
})
