/**
 * A entidade Filho (PR-02, PR-09, PR-31): a migration real cria a tabela, o
 * valor combinado é inteiro em centavos, o vínculo com o usuário é único, e o
 * registro só tem os campos que a PR-09 permite para dado de menor.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { ACOES, descreverAtividade, rotuloDaAcao } from '@/lib/atividade'
import { criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

const esquema = readFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), 'utf8').replace(/\/\/.*$/gm, '')

describe('tabela de filhos', () => {
  it('guarda nome, nascimento opcional, mesada em centavos inteiros e periodicidade', async () => {
    const criado = await prisma.filho.create({
      data: { nome: 'Ana', mesadaCentavos: 12345, periodicidade: 'semanal' },
    })
    const lido = await prisma.filho.findUniqueOrThrow({ where: { id: criado.id } })
    expect(lido).toMatchObject({
      nome: 'Ana',
      nascimento: null,
      mesadaCentavos: 12345,
      periodicidade: 'semanal',
      usuarioId: null,
    })
    expect(Number.isInteger(lido.mesadaCentavos)).toBe(true)
  })

  it('no banco a coluna da mesada é INTEGER e não há coluna de ponto flutuante', async () => {
    const colunas = await prisma.$queryRawUnsafe<Array<{ name: string; type: string }>>(
      `SELECT name, type FROM pragma_table_info('filhos')`,
    )
    expect(colunas.find((c) => c.name === 'mesadaCentavos')?.type).toBe('INTEGER')
    expect(colunas.map((c) => c.type)).not.toContain('REAL')
    expect(colunas.map((c) => c.type)).not.toContain('DECIMAL')
    expect(esquema).not.toMatch(/\b(Float|Decimal)\b/)
  })

  it('PR-09: a tabela não tem CPF, RG, telefone, endereço nem foto', async () => {
    const colunas = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
      `SELECT name FROM pragma_table_info('filhos')`,
    )
    expect(colunas.map((c) => c.name).sort()).toEqual(
      ['atualizadoEm', 'criadoEm', 'id', 'mesadaCentavos', 'nascimento', 'nome', 'periodicidade', 'usuarioId'].sort(),
    )
  })

  it('um usuário não pode estar ligado a dois filhos (vínculo 1 para 1)', async () => {
    const usuario = await criarUsuario({ papel: 'filho' })
    await prisma.filho.create({
      data: { nome: 'Ana', mesadaCentavos: 1000, periodicidade: 'mensal', usuarioId: usuario.id },
    })
    await expect(
      prisma.filho.create({
        data: { nome: 'Bia', mesadaCentavos: 1000, periodicidade: 'mensal', usuarioId: usuario.id },
      }),
    ).rejects.toThrow()
  })

  it('vários filhos sem login convivem (o vínculo único aceita nulo repetido)', async () => {
    await prisma.filho.create({ data: { nome: 'Ana', mesadaCentavos: 1000, periodicidade: 'mensal' } })
    await prisma.filho.create({ data: { nome: 'Bia', mesadaCentavos: 1000, periodicidade: 'mensal' } })
    expect(await prisma.filho.count()).toBe(2)
  })

  it('apagar o usuário desliga o vínculo e preserva o registro do filho', async () => {
    const usuario = await criarUsuario({ papel: 'filho' })
    const filho = await prisma.filho.create({
      data: { nome: 'Ana', mesadaCentavos: 1000, periodicidade: 'mensal', usuarioId: usuario.id },
    })
    await prisma.usuario.delete({ where: { id: usuario.id } })
    expect((await prisma.filho.findUniqueOrThrow({ where: { id: filho.id } })).usuarioId).toBeNull()
  })

  it('limparBanco esvazia os filhos', async () => {
    await prisma.filho.create({ data: { nome: 'Ana', mesadaCentavos: 1000, periodicidade: 'mensal' } })
    await limparBanco()
    expect(await prisma.filho.count()).toBe(0)
  })
})

describe('ações de filho no catálogo da trilha (PR-10)', () => {
  it.each([
    ['filho.cadastrado', 'Cadastrou o filho'],
    ['filho.alterado', 'Alterou o cadastro do filho'],
    ['filho.login_criado', 'Criou o login do filho'],
    ['filho.login_desativado', 'Desativou o login do filho'],
  ])('%s tem rótulo em português', (codigo, rotulo) => {
    expect(codigo in ACOES).toBe(true)
    expect(rotuloDaAcao(codigo)).toBe(rotulo)
  })

  it('a descrição traz o nome do filho e, na alteração, os campos em português, sem valor', () => {
    const base = { atorNome: 'Responsável', criadoEm: new Date('2026-10-28T15:00:00Z') }
    const criado = descreverAtividade({ ...base, acao: 'filho.cadastrado', detalhe: { alvoNome: 'Ana' } })
    expect(criado.acao).toBe('Cadastrou o filho Ana')
    const alterado = descreverAtividade({
      ...base,
      acao: 'filho.alterado',
      detalhe: { alvoNome: 'Ana', campos: 'nome,mesada,periodicidade,nascimento' },
    })
    expect(alterado.acao).toBe('Alterou o cadastro do filho Ana')
    expect(alterado.detalhe).toBe('Campos: nome, mesada, periodicidade, data de nascimento')
    const login = descreverAtividade({ ...base, acao: 'filho.login_criado', detalhe: { alvoNome: 'Ana' } })
    expect(login.acao).toBe('Criou o login do filho Ana')
    expect(login.detalhe).toBe('')
  })

  it('campo desconhecido no detalhe não vira texto técnico solto', () => {
    const d = descreverAtividade({
      atorNome: 'R',
      criadoEm: new Date(),
      acao: 'filho.alterado',
      detalhe: { alvoNome: 'Ana', campos: 'nome,xyz' },
    })
    expect(d.detalhe).toBe('Campos: nome')
  })
})
