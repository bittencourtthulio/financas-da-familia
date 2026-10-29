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
      `SELECT ccu.table_name AS "table" FROM information_schema.table_constraints tc JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.constraint_schema = tc.table_schema WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' AND tc.table_name = 'atividades'`,
    )
    expect(colunas).toEqual([])
    const tabelas = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
      `SELECT tablename AS name FROM pg_tables WHERE schemaname = 'public' AND tablename = 'atividades'`,
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
  it('traz as ações de usuário e as das features seguintes (FT-03, FT-05, FT-06, FT-07), com rótulo em português', () => {
    expect(Object.keys(ACOES).sort()).toEqual([
      'categoria.apagada',
      'categoria.criada',
      'familia.exportada',
      'filho.alterado',
      'filho.cadastrado',
      'filho.excluido',
      'filho.login_criado',
      'filho.login_desativado',
      'lancamento.alterado',
      'lancamento.apagado',
      'lancamento.criado',
      'mesada.alterada',
      'mesada.apagada',
      'mesada.registrada',
      'usuario.criado',
      'usuario.desativado',
      'usuario.papel_alterado',
      'usuario.senha_redefinida',
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
