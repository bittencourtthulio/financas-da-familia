/**
 * A seed de demonstração (PR-04): responsável e adulto fictícios, nada de
 * entidade de domínio (isso nasce nas FT-03, FT-05 e FT-06), e nunca em
 * produção. O QA entra com estas contas.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { entrar } from '@/servicos/autenticacao'
import { ACOES } from '@/lib/atividade'
import { dataCivilValida, mesAtualEmSaoPaulo, mesDaData } from '@/lib/datas'
import { listarLancamentos } from '@/servicos/lancamentos'
import { DEMONSTRACAO, semearDemonstracao } from '../prisma/demonstracao'
import { limparBanco } from './ajuda'

beforeEach(limparBanco)

describe('semearDemonstracao', () => {
  it('cria o responsável e o adulto, e os dois entram com a senha de demonstração', async () => {
    await semearDemonstracao(prisma)

    for (const conta of DEMONSTRACAO) {
      const { usuario } = await entrar({ email: conta.email, senha: conta.senha })
      expect(usuario.papel).toBe(conta.papel)
      expect(usuario.nome).toBe(conta.nome)
    }
  })

  it('rodar duas vezes não duplica nem muda as contas', async () => {
    await semearDemonstracao(prisma)
    await semearDemonstracao(prisma)

    const usuarios = await prisma.usuario.findMany({ orderBy: { email: 'asc' } })
    expect(usuarios).toHaveLength(DEMONSTRACAO.length)
  })

  it('cria exatamente um responsável e um adulto, e nenhum outro papel', async () => {
    await semearDemonstracao(prisma)

    const papeis = (await prisma.usuario.findMany()).map((u) => u.papel).sort()
    expect(papeis).toEqual(['admin', 'usuario'])
  })

  it('usa e-mails fictícios do domínio reservado exemplo.local', () => {
    for (const conta of DEMONSTRACAO) {
      expect(conta.email.endsWith('@exemplo.local')).toBe(true)
    }
  })
})

describe('atividade de demonstração (FT-02, PR-04)', () => {
  it('cria duas entradas fictícias: o responsável criou o adulto e depois mudou o papel dele', async () => {
    await semearDemonstracao(prisma)

    const responsavel = await prisma.usuario.findUniqueOrThrow({ where: { email: 'responsavel@exemplo.local' } })
    const adulto = await prisma.usuario.findUniqueOrThrow({ where: { email: 'adulto@exemplo.local' } })
    const linhas = await prisma.atividade.findMany({ orderBy: { criadoEm: 'asc' } })

    expect(linhas.map((l) => l.acao)).toEqual(['usuario.criado', 'usuario.papel_alterado'])
    for (const linha of linhas) {
      expect(linha.atorId).toBe(responsavel.id)
      expect(linha.atorNome).toBe(responsavel.nome)
      expect(linha.entidade).toBe('usuario')
      expect(linha.entidadeId).toBe(adulto.id)
      expect(linha.criadoEm.getTime()).toBeLessThan(Date.now())
    }
  })

  it('rodar duas vezes não duplica a atividade', async () => {
    await semearDemonstracao(prisma)
    await semearDemonstracao(prisma)
    expect(await prisma.atividade.count()).toBe(2)
  })

  it('só usa ações do catálogo e não guarda senha, hash nem e-mail', async () => {
    await semearDemonstracao(prisma)
    const linhas = await prisma.atividade.findMany()
    for (const linha of linhas) expect(Object.keys(ACOES)).toContain(linha.acao)
    const texto = JSON.stringify(linhas)
    expect(texto).not.toContain('demo1234')
    expect(texto).not.toContain('exemplo.local')
    expect(texto).not.toMatch(/\$2[aby]\$/)
  })

  it('o estado final bate com as contas semeadas (adulto continua adulto)', async () => {
    await semearDemonstracao(prisma)
    const ultima = await prisma.atividade.findFirstOrThrow({ orderBy: { criadoEm: 'desc' } })
    expect(JSON.parse(ultima.detalhe!)).toMatchObject({ de: 'admin', para: 'usuario' })
    const adulto = await prisma.usuario.findUniqueOrThrow({ where: { email: 'adulto@exemplo.local' } })
    expect(adulto.papel).toBe('usuario')
  })
})

describe('lançamentos de demonstração (FT-03, PR-04)', () => {
  it('cria 7 categorias (5 de despesa, 2 de receita) e 6 lançamentos fictícios', async () => {
    await semearDemonstracao(prisma)
    const categorias = await prisma.categoria.findMany()
    expect(categorias.filter((c) => c.tipo === 'despesa')).toHaveLength(5)
    expect(categorias.filter((c) => c.tipo === 'receita')).toHaveLength(2)
    expect(await prisma.lancamento.count()).toBe(6)
  })

  it('todos os lançamentos são do mês corrente em São Paulo e têm categoria do mesmo tipo', async () => {
    const agora = new Date('2026-03-15T12:00:00Z')
    await semearDemonstracao(prisma, agora)
    const lancamentos = await prisma.lancamento.findMany({ include: { categoria: true } })
    for (const l of lancamentos) {
      expect(dataCivilValida(l.data), l.data).toBe(true)
      expect(mesDaData(l.data)).toBe(mesAtualEmSaoPaulo(agora))
      expect(l.categoria.tipo).toBe(l.tipo)
    }
    expect(mesAtualEmSaoPaulo(agora)).toBe('2026-03')
  })

  it('tem receitas e despesas, valores inteiros em centavos e descrição em português', async () => {
    await semearDemonstracao(prisma)
    const lancamentos = await prisma.lancamento.findMany()
    expect(new Set(lancamentos.map((l) => l.tipo))).toEqual(new Set(['receita', 'despesa']))
    for (const l of lancamentos) {
      expect(Number.isInteger(l.valorCentavos)).toBe(true)
      expect(l.valorCentavos).toBeGreaterThan(0)
      expect(l.descricao.length).toBeGreaterThan(0)
    }
  })

  it('rodar duas vezes não duplica nem sobrescreve o que a família editou', async () => {
    await semearDemonstracao(prisma)
    const um = await prisma.lancamento.findFirstOrThrow({ orderBy: { id: 'asc' } })
    await prisma.lancamento.update({ where: { id: um.id }, data: { descricao: 'Editado à mão' } })
    await semearDemonstracao(prisma)
    expect(await prisma.categoria.count()).toBe(7)
    expect(await prisma.lancamento.count()).toBe(6)
    expect((await prisma.lancamento.findUniqueOrThrow({ where: { id: um.id } })).descricao).toBe('Editado à mão')
  })

  it('o adulto de demonstração consegue ler os lançamentos semeados pelo serviço', async () => {
    await semearDemonstracao(prisma)
    const { usuario } = await entrar({ email: 'adulto@exemplo.local', senha: 'demo1234' })
    const pagina = await listarLancamentos(usuario, {})
    expect(pagina.total).toBe(6)
  })
})

describe('proteção contra produção', () => {
  const anterior = process.env.NODE_ENV
  afterEach(() => {
    Object.assign(process.env, { NODE_ENV: anterior })
  })

  it('recusa rodar em produção e não cria nada', async () => {
    Object.assign(process.env, { NODE_ENV: 'production' })

    await expect(semearDemonstracao(prisma)).rejects.toThrow(/produção/)
    expect(await prisma.usuario.count()).toBe(0)
    expect(await prisma.atividade.count()).toBe(0)
    expect(await prisma.categoria.count()).toBe(0)
    expect(await prisma.lancamento.count()).toBe(0)
  })
})
