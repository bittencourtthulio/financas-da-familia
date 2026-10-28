/**
 * FT-09 (PR-39): a renomeação do login é atômica com o cadastro e com o rastro,
 * a trilha registra o campo `login` sem dado pessoal (PR-25: nem e-mail, nem o
 * nome antigo), e o login que já divergia do filho é curado.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cadastrarFilho, criarLoginDoFilho, editarFilho } from '@/servicos/filhos'
import { excluirFilho } from '@/servicos/privacidade'
import * as atividade from '@/servicos/atividade'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { descreverAtividade } from '@/lib/atividade'
import { prisma } from '@/lib/prisma'
import { criarAdmin, limparBanco } from './ajuda'

beforeEach(limparBanco)
afterEach(() => vi.restoreAllMocks())

const ANA = { nome: 'Ana Velha', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' }
const EMAIL = 'ana.login@exemplo.local'

async function cenario(comLogin = true) {
  const admin = await criarAdmin()
  const filho = await cadastrarFilho(admin, ANA)
  if (comLogin) await criarLoginDoFilho(admin, filho.id, { email: EMAIL, senha: 'senha-do-filho-123' })
  return { admin, filho }
}

const nomeDoUsuario = async (filhoId: string) =>
  (await prisma.filho.findUniqueOrThrow({ where: { id: filhoId }, include: { usuario: true } })).usuario?.nome

const rastrosDeEdicao = () => prisma.atividade.findMany({ where: { acao: 'filho.alterado' } })

describe('atomicidade', () => {
  it('se o rastro falha, nem o filho nem o usuário mudam e não sobra rastro', async () => {
    const { admin, filho } = await cenario()
    vi.spyOn(atividade, 'registrarAtividade').mockRejectedValueOnce(new Error('disco cheio'))

    await expect(editarFilho(admin, filho.id, { ...ANA, nome: 'Ana Nova', valor: '80,00' })).rejects.toThrow('disco cheio')

    const noBanco = await prisma.filho.findUniqueOrThrow({ where: { id: filho.id } })
    expect(noBanco).toMatchObject({ nome: 'Ana Velha', mesadaCentavos: 5000 })
    expect(await nomeDoUsuario(filho.id)).toBe('Ana Velha')
    expect(await rastrosDeEdicao()).toHaveLength(0)
  })

  it('se a gravação do filho falha depois do usuário, o usuário volta ao nome antigo', async () => {
    const { admin, filho } = await cenario()
    // Um segundo filho com o mesmo vínculo é impossível; forçamos a falha no
    // update do filho trocando o método no cliente transacional.
    const original = prisma.$transaction.bind(prisma)
    vi.spyOn(prisma, '$transaction').mockImplementationOnce(((fn: (tx: unknown) => Promise<unknown>) =>
      original(async (tx) => {
        const falho = new Proxy(tx as object, {
          get(alvo, chave) {
            if (chave === 'filho') {
              return new Proxy((alvo as Record<string, object>).filho as object, {
                get(a, c) {
                  if (c === 'update') return () => Promise.reject(new Error('falha no filho'))
                  return (a as Record<string | symbol, unknown>)[c]
                },
              })
            }
            return (alvo as Record<string | symbol, unknown>)[chave]
          },
        })
        return fn(falho)
      })) as unknown as typeof prisma.$transaction)

    await expect(editarFilho(admin, filho.id, { ...ANA, nome: 'Ana Nova' })).rejects.toThrow('falha no filho')
    expect(await nomeDoUsuario(filho.id)).toBe('Ana Velha')
    expect((await prisma.filho.findUniqueOrThrow({ where: { id: filho.id } })).nome).toBe('Ana Velha')
  })

  it('a renomeação usa o cliente da transação (tx), não o global', () => {
    // O adaptador SQLite do Prisma tem uma conexão só, então `prisma.usuario`
    // dentro da transação se comporta igual a `tx.usuario` e nenhum teste de
    // comportamento distingue os dois. A guarda é de código.
    const fonte = readFileSync(path.join(process.cwd(), 'src/servicos/filhos.ts'), 'utf8')
    const corpo = fonte.slice(fonte.indexOf('export async function editarFilho'), fonte.indexOf('const entradaDeLogin'))
    expect(corpo).toMatch(/tx\.usuario\.update\(/)
    expect(corpo).not.toMatch(/\bprisma\.usuario\.update\(/)
  })

  it('entrada inválida (422) não renomeia o login', async () => {
    const { admin, filho } = await cenario()
    await expect(editarFilho(admin, filho.id, { ...ANA, nome: 'Ana Nova', valor: 'abc' })).rejects.toMatchObject({ status: 422 })
    expect(await nomeDoUsuario(filho.id)).toBe('Ana Velha')
  })
})

describe('a trilha registra a sincronia sem dado pessoal', () => {
  it('campos traz nome e login; nenhuma coluna tem e-mail nem o nome antigo', async () => {
    const { admin, filho } = await cenario()
    await editarFilho(admin, filho.id, { ...ANA, nome: 'Ana Nova' })

    const [rastro] = await rastrosDeEdicao()
    expect(JSON.parse(rastro?.detalhe ?? '{}')).toEqual({ alvoNome: 'Ana Nova', campos: 'nome,login' })
    const linha = JSON.stringify(rastro)
    expect(linha).not.toContain(EMAIL)
    expect(linha).not.toContain('@')
    expect(linha).not.toContain('Ana Velha')
    expect(linha).not.toContain('senha')
  })

  it('sem login, campos não tem login', async () => {
    const { admin, filho } = await cenario(false)
    await editarFilho(admin, filho.id, { ...ANA, nome: 'Ana Nova' })
    const [rastro] = await rastrosDeEdicao()
    expect(JSON.parse(rastro?.detalhe ?? '{}').campos).toBe('nome')
  })

  it('mudar só a mesada de quem tem login não registra login', async () => {
    const { admin, filho } = await cenario()
    await editarFilho(admin, filho.id, { ...ANA, valor: '80,00' })
    const [rastro] = await rastrosDeEdicao()
    expect(JSON.parse(rastro?.detalhe ?? '{}').campos).toBe('mesada')
  })

  it('a tela de atividade descreve o campo em português', () => {
    const d = descreverAtividade({
      atorNome: 'Responsável',
      criadoEm: new Date('2026-10-28T15:00:00Z'),
      acao: 'filho.alterado',
      detalhe: { alvoNome: 'Ana Nova', campos: 'nome,login' },
    })
    expect(d.detalhe).toBe('Campos: nome, nome do login')
  })

  it('apagar o filho depois não deixa nome nem e-mail em lugar algum', async () => {
    const { admin, filho } = await cenario()
    await editarFilho(admin, filho.id, { ...ANA, nome: 'Ana Nova' })
    await excluirFilho(admin, filho.id, { confirmacao: 'Ana Nova' })
    const tudo = JSON.stringify([
      await prisma.atividade.findMany(),
      await prisma.usuario.findMany(),
      await prisma.filho.findMany(),
    ])
    for (const proibido of ['Ana Nova', 'Ana Velha', EMAIL]) expect(tudo).not.toContain(proibido)
  })
})

describe('login que já divergia do cadastro (dado de antes da correção)', () => {
  it('reenviar o cadastro cura o nome do login e deixa rastro com login', async () => {
    const { admin, filho } = await cenario()
    await prisma.usuario.updateMany({ where: { papel: 'filho' }, data: { nome: 'Nome Torto' } })

    await editarFilho(admin, filho.id, ANA)

    expect(await nomeDoUsuario(filho.id)).toBe('Ana Velha')
    const [rastro] = await rastrosDeEdicao()
    expect(JSON.parse(rastro?.detalhe ?? '{}').campos).toBe('login')
  })

  it('já em sincronia e sem mudança: nada é regravado e não há rastro', async () => {
    const { admin, filho } = await cenario()
    const antes = await prisma.usuario.findFirstOrThrow({ where: { papel: 'filho' } })
    await editarFilho(admin, filho.id, ANA)
    expect(await prisma.usuario.findFirstOrThrow({ where: { papel: 'filho' } })).toEqual(antes)
    expect(await rastrosDeEdicao()).toHaveLength(0)
  })
})
