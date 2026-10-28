/**
 * Criar, mudar o papel e desativar usuário deixam rastro na trilha (PR-10),
 * na mesma transação da ação, e só quando a ação de fato acontece.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { criar, editar, desativar } from '@/servicos/usuarios'
import * as atividade from '@/servicos/atividade'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)
afterEach(() => vi.restoreAllMocks())

const novo = { nome: 'Pessoa Nova', email: 'nova@teste.local', senha: 'senha-boa-123' }

async function trilha() {
  return prisma.atividade.findMany({ orderBy: { criadoEm: 'asc' } })
}

describe('criar usuário', () => {
  it('registra usuario.criado com o autor e o id do criado', async () => {
    const admin = await criarAdmin()
    const criado = await criar(admin, { ...novo, papel: 'admin' })

    const linhas = await trilha()
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({
      atorId: admin.id,
      atorNome: admin.nome,
      acao: 'usuario.criado',
      entidade: 'usuario',
      entidadeId: criado.id,
    })
    expect(JSON.parse(linhas[0]!.detalhe!)).toEqual({ alvoNome: 'Pessoa Nova', papel: 'admin' })
  })

  it('o registro não guarda a senha, o hash nem o e-mail do criado', async () => {
    const admin = await criarAdmin()
    const criado = await criar(admin, novo)
    const noBanco = await prisma.usuario.findUniqueOrThrow({ where: { id: criado.id } })
    const texto = JSON.stringify(await trilha())
    expect(texto).not.toContain(novo.senha)
    expect(texto).not.toContain(noBanco.senhaHash)
    expect(texto).not.toContain(novo.email)
  })

  it('se o registro falha, o usuário não é criado', async () => {
    const admin = await criarAdmin()
    vi.spyOn(atividade, 'registrarAtividade').mockRejectedValueOnce(new Error('disco cheio'))
    await expect(criar(admin, novo)).rejects.toThrow('disco cheio')
    expect(await prisma.usuario.count({ where: { email: novo.email } })).toBe(0)
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('criação recusada não deixa registro', async () => {
    const admin = await criarAdmin()
    await criar(admin, novo)
    await expect(criar(admin, novo)).rejects.toMatchObject({ status: 409 })
    const comum = await criarUsuario()
    await expect(criar(comum, { ...novo, email: 'outro@teste.local' })).rejects.toMatchObject({ status: 403 })
    expect(await prisma.atividade.count()).toBe(1)
  })
})
