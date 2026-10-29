/**
 * Autorização do resumo (PR-06, D-07): só `admin` e `usuario` veem. Qualquer
 * outro papel — o futuro `filho` (FT-05), vazio ou desconhecido — recebe 403
 * em TODA função do serviço de resumo, por lista de permitidos. A tabela
 * `chamadas` ganha uma linha por função nova: o teste varre todas.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as servico from '@/servicos/resumo'
import { ErroDeAplicacao } from '@/lib/erros'
import { prisma } from '@/lib/prisma'
import { type UsuarioAutenticado } from '@/servicos/autenticacao'
import { criarAdmin, criarCategoriaNoBanco, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

type Chamada = (autor: UsuarioAutenticado) => Promise<unknown>

const chamadas: Array<[string, Chamada]> = [
  ['resumoDoMes', (a) => servico.resumoDoMes(a, { mes: '2026-10' })],
  ['financasDoMes', (a) => servico.financasDoMes(a, { mes: '2026-10' })],
]

const PAPEIS_NEGADOS = ['filho', 'visitante', '', 'ADMIN', 'Admin', 'administrador', 'superusuario']

describe('todas as funções do serviço de resumo negam papel que não é admin nem usuario', () => {
  it('a tabela cobre todas as funções exportadas pelo serviço', () => {
    const exportadas = Object.entries(servico)
      .filter(([, valor]) => typeof valor === 'function')
      .map(([nome]) => nome)
      .sort()
    expect(chamadas.map(([nome]) => nome).sort()).toEqual(exportadas)
  })

  describe.each(chamadas)('%s', (_nome, chamar) => {
    it.each(PAPEIS_NEGADOS)('nega o papel "%s" com 403, sem devolver dado', async (papel) => {
      const admin = await criarAdmin()
      const categoria = await criarCategoriaNoBanco('despesa', 'Mercado')
      await prisma.lancamento.create({
        data: { tipo: 'despesa', valorCentavos: 4242, data: '2026-10-05', categoriaId: categoria.id },
      })
      const alguem = { ...(await criarUsuario()), papel }

      let erro: unknown
      let resultado: unknown
      try {
        resultado = await chamar(alguem)
      } catch (e) {
        erro = e
      }

      expect(erro).toBeInstanceOf(ErroDeAplicacao)
      expect((erro as ErroDeAplicacao).status).toBe(403)
      expect(resultado).toBeUndefined()
      expect(JSON.stringify(erro)).not.toContain('4242')
      expect(admin.papel).toBe('admin')
    })

    it.each(['admin', 'usuario'])('deixa o papel "%s" passar', async (papel) => {
      const quem = { ...(await criarUsuario()), papel }
      await expect(chamar(quem)).resolves.toBeTruthy()
    })
  })
})
