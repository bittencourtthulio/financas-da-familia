/**
 * Autorização dos lançamentos (PR-06, D-08): só `admin` e `usuario` lançam e
 * leem. Qualquer outro papel — o futuro `filho` (FT-05), vazio ou
 * desconhecido — é negado em TODA função do serviço, por lista de permitidos.
 * A tabela `chamadas` ganha uma linha por função nova: o teste varre todas.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as servico from '@/servicos/lancamentos'
import { exigirAdultoOuResponsavel, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { ErroDeAplicacao } from '@/lib/erros'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

type Chamada = (autor: UsuarioAutenticado) => Promise<unknown>

const chamadas: Array<[string, Chamada]> = [
  ['listarCategorias', (a) => servico.listarCategorias(a)],
  ['criarCategoria', (a) => servico.criarCategoria(a, { nome: 'Qualquer', tipo: 'despesa' })],
  [
    'criarLancamento',
    (a) =>
      servico.criarLancamento(a, {
        tipo: 'despesa',
        valor: '10,00',
        data: '2026-10-27',
        categoriaId: 'qualquer',
      }),
  ],
  ['obterLancamento', (a) => servico.obterLancamento(a, 'qualquer')],
  [
    'editarLancamento',
    (a) =>
      servico.editarLancamento(a, 'qualquer', {
        tipo: 'despesa',
        valor: '10,00',
        data: '2026-10-27',
        categoriaId: 'qualquer',
      }),
  ],
  ['apagarLancamento', (a) => servico.apagarLancamento(a, 'qualquer')],
]

const PAPEIS_NEGADOS = ['filho', 'visitante', '', 'ADMIN', 'Admin', 'administrador', 'superusuario']

describe('exigirAdultoOuResponsavel', () => {
  it('deixa passar admin e usuario', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario({ papel: 'usuario' })
    expect(() => exigirAdultoOuResponsavel(admin)).not.toThrow()
    expect(() => exigirAdultoOuResponsavel(adulto)).not.toThrow()
  })

  it.each(PAPEIS_NEGADOS)('nega o papel "%s" com 403', async (papel) => {
    const alguem = { ...(await criarUsuario()), papel }
    try {
      exigirAdultoOuResponsavel(alguem)
      throw new Error('Deveria ter negado.')
    } catch (e) {
      expect(e).toBeInstanceOf(ErroDeAplicacao)
      expect((e as ErroDeAplicacao).status).toBe(403)
    }
  })
})

describe('todas as funções do serviço negam papel que não é admin nem usuario', () => {
  it('a tabela cobre todas as funções exportadas pelo serviço', () => {
    const exportadas = Object.entries(servico)
      .filter(([, valor]) => typeof valor === 'function')
      .map(([nome]) => nome)
      .filter((nome) => /^(listar|criar|obter|editar|apagar)/.test(nome))
      .sort()
    expect(chamadas.map(([nome]) => nome).sort()).toEqual(exportadas)
  })

  describe.each(chamadas)('%s', (_nome, chamar) => {
    it.each(PAPEIS_NEGADOS)('nega o papel "%s" com 403 e não toca no banco', async (papel) => {
      const alguem = { ...(await criarUsuario()), papel }
      let erro: unknown
      try {
        await chamar(alguem)
      } catch (e) {
        erro = e
      }
      expect(erro).toBeInstanceOf(ErroDeAplicacao)
      expect((erro as ErroDeAplicacao).status).toBe(403)
      expect(await prisma.categoria.count()).toBe(0)
      expect(await prisma.lancamento.count()).toBe(0)
      expect(await prisma.atividade.count()).toBe(0)
    })

    it('o responsável e o adulto passam da guarda de papel', async () => {
      for (const papel of ['admin', 'usuario']) {
        const alguem = await criarUsuario({ papel })
        try {
          await chamar(alguem)
        } catch (e) {
          // Pode falhar por outro motivo (id inexistente), nunca por papel.
          expect((e as ErroDeAplicacao).status).not.toBe(403)
        }
      }
    })
  })
})
