/**
 * Autorização dos filhos (PR-06, PR-31, D-04, D-05): só o responsável
 * (`admin`) cadastra, lê, edita e gerencia o login do filho; o adulto, o
 * filho, o vazio e o desconhecido recebem 403 em TODA função do serviço, por
 * lista de permitidos. A exceção é `minhaMesada`, que só o filho usa. A tabela
 * `chamadas` ganha uma linha por função nova: o teste varre todas.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as servico from '@/servicos/filhos'
import { ErroDeAplicacao } from '@/lib/erros'
import { prisma } from '@/lib/prisma'
import { type UsuarioAutenticado } from '@/servicos/autenticacao'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

type Chamada = (autor: UsuarioAutenticado, idDoFilho: string) => Promise<unknown>

const DADOS = { nome: 'Invasor', nascimento: '', valor: '1,00', periodicidade: 'mensal' }

const chamadas: Array<[string, Chamada]> = [
  ['listarFilhos', (a) => servico.listarFilhos(a)],
  ['obterFilho', (a, id) => servico.obterFilho(a, id)],
  ['cadastrarFilho', (a) => servico.cadastrarFilho(a, DADOS)],
  ['editarFilho', (a, id) => servico.editarFilho(a, id, DADOS)],
  ['criarLoginDoFilho', (a, id) => servico.criarLoginDoFilho(a, id, { email: 'novo@exemplo.local', senha: 'senha-12345' })],
  ['desativarLoginDoFilho', (a, id) => servico.desativarLoginDoFilho(a, id)],
  ['redefinirSenhaDoFilho', (a, id) => servico.redefinirSenhaDoFilho(a, id, { senha: 'senha-nova-123' })],
]

const PAPEIS_NEGADOS = ['usuario', 'filho', 'visitante', '', 'ADMIN', 'Admin', 'administrador']

describe('todas as funções do serviço de filhos negam quem não é admin', () => {
  it('a tabela cobre toda função exportada (menos minhaMesada, do próprio filho)', () => {
    const exportadas = Object.entries(servico)
      .filter(([, valor]) => typeof valor === 'function')
      .map(([nome]) => nome)
      .filter((nome) => nome !== 'minhaMesada')
      .sort()
    expect(chamadas.map(([nome]) => nome).sort()).toEqual(exportadas)
  })

  describe.each(chamadas)('%s', (_nome, chamar) => {
    it.each(PAPEIS_NEGADOS)('nega o papel "%s" com 403 e não toca no banco', async (papel) => {
      const admin = await criarAdmin()
      const existente = await servico.cadastrarFilho(admin, { ...DADOS, nome: 'Existente' })
      const antes = {
        filhos: await prisma.filho.count(),
        usuarios: await prisma.usuario.count(),
        atividades: await prisma.atividade.count(),
      }
      const alguem = { ...(await criarUsuario({ email: `${papel || 'vazio'}@exemplo.local` })), papel }
      const usuariosAntes = antes.usuarios + 1

      let erro: unknown
      let resultado: unknown
      try {
        resultado = await chamar(alguem, existente.id)
      } catch (e) {
        erro = e
      }

      expect(erro).toBeInstanceOf(ErroDeAplicacao)
      expect((erro as ErroDeAplicacao).status).toBe(403)
      expect(resultado).toBeUndefined()
      expect(JSON.stringify(erro)).not.toContain('Existente')
      expect(await prisma.filho.count()).toBe(antes.filhos)
      expect(await prisma.usuario.count()).toBe(usuariosAntes)
      expect(await prisma.atividade.count()).toBe(antes.atividades)
    })

    it('o responsável passa da guarda de papel', async () => {
      const admin = await criarAdmin()
      const existente = await servico.cadastrarFilho(admin, { ...DADOS, nome: 'Existente' })
      try {
        await chamar(admin, existente.id)
      } catch (e) {
        // Pode falhar por outro motivo (desativar sem login), nunca por papel.
        expect((e as ErroDeAplicacao).status).not.toBe(403)
      }
    })
  })
})
