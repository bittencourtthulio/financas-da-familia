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

describe('mudar o papel', () => {
  it('registra usuario.papel_alterado com o papel de antes e o de depois', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario()
    await editar(admin, adulto.id, { papel: 'admin' })

    const linhas = await trilha()
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({
      atorId: admin.id,
      acao: 'usuario.papel_alterado',
      entidade: 'usuario',
      entidadeId: adulto.id,
    })
    expect(JSON.parse(linhas[0]!.detalhe!)).toEqual({
      alvoNome: adulto.nome,
      de: 'usuario',
      para: 'admin',
    })
  })

  it('editar com o mesmo papel, ou só o nome, não registra nada', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario()
    await editar(admin, adulto.id, { papel: 'usuario' })
    await editar(admin, adulto.id, { nome: 'Outro Nome' })
    await editar(admin, adulto.id, { nome: 'Mais Um', papel: 'usuario', email: 'novo@teste.local' })
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('a mudança e o registro caem juntos: se o registro falha, o papel não muda', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario()
    vi.spyOn(atividade, 'registrarAtividade').mockRejectedValueOnce(new Error('disco cheio'))
    await expect(editar(admin, adulto.id, { papel: 'admin' })).rejects.toThrow('disco cheio')
    const depois = await prisma.usuario.findUniqueOrThrow({ where: { id: adulto.id } })
    expect(depois.papel).toBe('usuario')
  })

  it('a guarda do último administrador não deixa registro', async () => {
    const admin = await criarAdmin()
    await expect(editar(admin, admin.id, { papel: 'usuario' })).rejects.toMatchObject({ status: 409 })
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('quem não é responsável não muda papel nem deixa registro', async () => {
    const comum = await criarUsuario()
    await expect(editar(comum, comum.id, { papel: 'admin' })).rejects.toMatchObject({ status: 403 })
    expect(await prisma.atividade.count()).toBe(0)
  })
})

describe('desativar', () => {
  it('registra usuario.desativado uma vez, com o nome de quem foi desativado', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario()
    await desativar(admin, adulto.id)

    const linhas = await trilha()
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({
      atorId: admin.id,
      acao: 'usuario.desativado',
      entidadeId: adulto.id,
    })
    expect(JSON.parse(linhas[0]!.detalhe!)).toEqual({ alvoNome: adulto.nome })
  })

  it('desativar quem já está desativado não registra de novo', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario()
    await desativar(admin, adulto.id)
    await desativar(admin, adulto.id)
    expect(await prisma.atividade.count()).toBe(1)
  })

  it('editar papel e desativar na mesma chamada registra as duas ações', async () => {
    const admin = await criarAdmin()
    await criarAdmin() // outro admin ativo, para a guarda do último não interferir
    const alvo = await criarUsuario({ papel: 'admin' })
    await editar(admin, alvo.id, { papel: 'usuario', ativo: false })
    expect((await trilha()).map((l) => l.acao).sort()).toEqual([
      'usuario.desativado',
      'usuario.papel_alterado',
    ])
  })
})
