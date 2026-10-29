/**
 * Autorização da privacidade (PR-06, PR-09, D-14): só o responsável (`admin`)
 * exporta os dados da família e apaga a conta de um filho. O adulto, o filho
 * (inclusive o próprio titular), o vazio e o desconhecido recebem 403 em TODA
 * função do serviço, por lista de permitidos, e nada é gravado. A tabela
 * `chamadas` ganha uma linha por função nova: o teste varre todas.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as servico from '@/servicos/privacidade'
import { cadastrarFilho, criarLoginDoFilho } from '@/servicos/filhos'
import { ErroDeAplicacao } from '@/lib/erros'
import { prisma } from '@/lib/prisma'
import { type UsuarioAutenticado } from '@/servicos/autenticacao'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

type Chamada = (autor: UsuarioAutenticado, ids: { filho: string }) => Promise<unknown>

const chamadas: Array<[string, Chamada]> = [
  ['exportarDadosDaFamilia', (a) => servico.exportarDadosDaFamilia(a)],
  ['excluirFilho', (a, ids) => servico.excluirFilho(a, ids.filho, { confirmacao: 'Existente' })],
]

const PAPEIS_NEGADOS = ['usuario', 'filho', 'visitante', '', 'ADMIN', 'Admin', 'administrador']

describe('toda função do serviço de privacidade nega quem não é admin', () => {
  it('a tabela cobre toda função exportada', () => {
    const exportadas = Object.entries(servico)
      .filter(([, valor]) => typeof valor === 'function')
      .map(([nome]) => nome)
      .sort()
    expect(chamadas.map(([nome]) => nome).sort()).toEqual(exportadas)
  })

  describe.each(chamadas)('%s', (_nome, chamar) => {
    it.each(PAPEIS_NEGADOS)('nega o papel "%s" com 403 e não grava nada', async (papel) => {
      const admin = await criarAdmin()
      const filho = await cadastrarFilho(admin, { nome: 'Existente', valor: '1,00', periodicidade: 'mensal' })
      const antes = {
        atividades: await prisma.atividade.count(),
        filhos: await prisma.filho.count(),
        usuarios: await prisma.usuario.count(),
      }
      const alguem = { ...(await criarUsuario({ email: `${papel || 'vazio'}@exemplo.local` })), papel }

      let erro: unknown
      let resultado: unknown
      try {
        resultado = await chamar(alguem, { filho: filho.id })
      } catch (e) {
        erro = e
      }
      expect(resultado).toBeUndefined()
      expect(erro).toBeInstanceOf(ErroDeAplicacao)
      expect((erro as ErroDeAplicacao).status).toBe(403)
      expect({
        atividades: await prisma.atividade.count(),
        filhos: await prisma.filho.count(),
        usuarios: await prisma.usuario.count(),
      }).toEqual({ ...antes, usuarios: antes.usuarios + 1 })
      // O filho segue lá, com o nome certo digitado: a negação vem do papel.
      expect(await prisma.filho.findUnique({ where: { id: filho.id } })).not.toBeNull()
    })

    it('nega um filho real, com login ligado ao registro', async () => {
      const admin = await criarAdmin()
      const filho = await cadastrarFilho(admin, { nome: 'Bia', valor: '1,00', periodicidade: 'mensal' })
      await criarLoginDoFilho(admin, filho.id, { email: 'bia@exemplo.local', senha: 'senha-do-filho-1' })
      const login = await prisma.usuario.findUniqueOrThrow({ where: { email: 'bia@exemplo.local' } })
      const antes = await prisma.atividade.count()
      await expect(
        chamar({ id: login.id, nome: login.nome, email: login.email, papel: login.papel, familiaId: login.familiaId }, { filho: filho.id }),
      ).rejects.toMatchObject({ status: 403 })
      expect(await prisma.atividade.count()).toBe(antes)
      // O filho não apaga nem a si mesmo.
      expect(await prisma.filho.findUnique({ where: { id: filho.id } })).not.toBeNull()
      expect(await prisma.usuario.findUnique({ where: { id: login.id } })).not.toBeNull()
    })
  })
})
