/**
 * A entidade Atividade (PR-10) e o catálogo de ações. O banco do teste é
 * montado com as migrations reais, então este teste também prova que a
 * migration cria a tabela.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { ACOES, rotuloDaAcao } from '@/lib/atividade'
import { limparBanco } from './ajuda'

beforeEach(limparBanco)

describe('tabela de atividades', () => {
  it('grava quem, o quê e quando, e o banco preenche o instante', async () => {
    const antes = Date.now()
    const criada = await prisma.atividade.create({
      data: {
        atorId: 'ator-1',
        atorNome: 'Fulana',
        acao: 'usuario.criado',
        entidade: 'usuario',
        entidadeId: 'alvo-1',
        detalhe: JSON.stringify({ papel: 'usuario' }),
      },
    })
    const lida = await prisma.atividade.findUniqueOrThrow({ where: { id: criada.id } })
    expect(lida).toMatchObject({
      atorId: 'ator-1',
      atorNome: 'Fulana',
      acao: 'usuario.criado',
      entidade: 'usuario',
      entidadeId: 'alvo-1',
      detalhe: '{"papel":"usuario"}',
    })
    expect(lida.criadoEm.getTime()).toBeGreaterThanOrEqual(antes - 1000)
  })

  it('não tem chave estrangeira para usuários: o registro sobrevive à conta', async () => {
    const colunas = await prisma.$queryRawUnsafe<Array<{ table: string }>>(
      `SELECT "table" FROM pragma_foreign_key_list('atividades')`,
    )
    expect(colunas).toEqual([])
    const tabelas = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='atividades'`,
    )
    expect(tabelas).toHaveLength(1)
  })

  it('o detalhe é opcional', async () => {
    const criada = await prisma.atividade.create({
      data: { atorId: 'a', atorNome: 'A', acao: 'usuario.desativado', entidade: 'usuario', entidadeId: 'b' },
    })
    expect(criada.detalhe).toBeNull()
  })
})

describe('catálogo de ações', () => {
  it('traz as ações de usuário e as das features seguintes (FT-03, FT-05), com rótulo em português', () => {
    expect(Object.keys(ACOES).sort()).toEqual([
      'categoria.criada',
      'filho.alterado',
      'filho.cadastrado',
      'filho.login_criado',
      'filho.login_desativado',
      'lancamento.alterado',
      'lancamento.apagado',
      'lancamento.criado',
      'usuario.criado',
      'usuario.desativado',
      'usuario.papel_alterado',
    ])
    for (const rotulo of Object.values(ACOES)) expect(rotulo.length).toBeGreaterThan(3)
    expect(rotuloDaAcao('usuario.criado')).toBe('Criou o usuário')
  })

  it('ação desconhecida volta como veio, sem lançar', () => {
    expect(rotuloDaAcao('coisa.estranha')).toBe('coisa.estranha')
  })

  it('o código da ação é entidade.verbo em minúsculas', () => {
    for (const codigo of Object.keys(ACOES)) expect(codigo).toMatch(/^[a-z]+\.[a-z_]+$/)
  })
})
