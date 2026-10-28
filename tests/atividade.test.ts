/**
 * O serviço de registro (PR-10): grava quem, o quê e quando, recusa o que a
 * trilha nunca pode guardar (PR-25) e não oferece como editar nem apagar
 * (PR-11).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import * as modulo from '@/servicos/atividade'
import { registrarAtividade } from '@/servicos/atividade'
import { criarAdmin, limparBanco } from './ajuda'

beforeEach(limparBanco)

const base = {
  acao: 'usuario.criado',
  entidade: 'usuario',
  entidadeId: 'alvo-1',
}

describe('registrarAtividade', () => {
  it('guarda o ator, a ação, a entidade e o detalhe', async () => {
    const admin = await criarAdmin()
    await registrarAtividade({
      ator: admin,
      ...base,
      detalhe: { alvoNome: 'Pessoa Nova', papel: 'usuario', ativo: true, antes: null },
    })

    const linhas = await prisma.atividade.findMany()
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({
      atorId: admin.id,
      atorNome: admin.nome,
      acao: 'usuario.criado',
      entidade: 'usuario',
      entidadeId: 'alvo-1',
    })
    expect(JSON.parse(linhas[0]!.detalhe!)).toEqual({
      alvoNome: 'Pessoa Nova',
      papel: 'usuario',
      ativo: true,
      antes: null,
    })
  })

  it('guarda só o id e o nome do ator, nunca e-mail nem outro campo da conta', async () => {
    const admin = await criarAdmin()
    await registrarAtividade({ ator: admin, ...base })
    const linha = await prisma.atividade.findFirstOrThrow()
    expect(JSON.stringify(linha)).not.toContain(admin.email)
    expect(linha.detalhe).toBeNull()
  })

  it('com o cliente de uma transação, desfaz o registro junto com a ação', async () => {
    const admin = await criarAdmin()
    await expect(
      prisma.$transaction(async (tx) => {
        await registrarAtividade({ ator: admin, ...base }, tx)
        expect(await tx.atividade.count()).toBe(1)
        throw new Error('falha depois do registro')
      }),
    ).rejects.toThrow('falha depois do registro')
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('com o cliente de uma transação que termina bem, o registro fica', async () => {
    const admin = await criarAdmin()
    await prisma.$transaction(async (tx) => {
      await registrarAtividade({ ator: admin, ...base }, tx)
    })
    expect(await prisma.atividade.count()).toBe(1)
  })
})

describe('o que a trilha recusa', () => {
  async function recusa(entrada: Record<string, unknown>) {
    const admin = await criarAdmin()
    await expect(
      registrarAtividade({ ator: admin, ...base, ...entrada } as never),
    ).rejects.toMatchObject({ status: 422 })
    expect(await prisma.atividade.count()).toBe(0)
  }

  it('ação fora do catálogo', async () => {
    await recusa({ acao: 'usuario.explodiu' })
  })

  it.each(['senha', 'senhaHash', 'hash', 'token', 'jwt', 'segredo', 'password', 'valor', 'valorEmCentavos', 'centavos', 'saldo', 'email', 'cpf'])(
    'detalhe com a chave %s',
    async (chave) => {
      await recusa({ detalhe: { [chave]: 'x' } })
    },
  )

  it('detalhe com texto que parece hash de senha ou token de sessão', async () => {
    await recusa({ detalhe: { alvoNome: '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012' } })
    await recusa({ detalhe: { alvoNome: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc' } })
  })

  it('detalhe aninhado, lista ou grande demais', async () => {
    await recusa({ detalhe: { dentro: { senha: 'x' } } })
    await recusa({ detalhe: { lista: ['a'] } })
    await recusa({ detalhe: { alvoNome: 'a'.repeat(5000) } })
  })

  it('autor, entidade ou id da entidade vazios', async () => {
    await recusa({ entidade: '' })
    await recusa({ entidadeId: '' })
    const admin = await criarAdmin()
    await expect(
      registrarAtividade({ ator: { ...admin, id: '' }, ...base }),
    ).rejects.toMatchObject({ status: 422 })
  })

  it('aceita chave inofensiva, como "assento" ou "alvoNome"', async () => {
    const admin = await criarAdmin()
    await registrarAtividade({ ator: admin, ...base, detalhe: { assento: 'janela', alvoNome: 'Valéria' } })
    expect(await prisma.atividade.count()).toBe(1)
  })
})

describe('somente acréscimo (PR-11)', () => {
  it('o módulo não exporta como editar, apagar nem limpar registros', () => {
    const nomes = Object.keys(modulo)
    expect(nomes).toContain('registrarAtividade')
    for (const nome of nomes) {
      expect(nome).not.toMatch(/editar|apagar|excluir|remover|limpar|deletar|atualizar/i)
    }
  })
})
