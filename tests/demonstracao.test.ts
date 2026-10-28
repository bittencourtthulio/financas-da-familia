/**
 * A seed de demonstração (PR-04): responsável e adulto fictícios, lançamentos
 * (FT-03, FT-04), dois filhos com login (FT-05; a mesada em si é da FT-06), e
 * nunca em produção. O QA entra com estas contas.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { entrar } from '@/servicos/autenticacao'
import { ACOES } from '@/lib/atividade'
import { dataCivilValida, mesAnterior, mesAtualEmSaoPaulo, mesDaData } from '@/lib/datas'
import { listarLancamentos } from '@/servicos/lancamentos'
import { resumoDoMes } from '@/servicos/resumo'
import { listarFilhos, minhaMesada } from '@/servicos/filhos'
import { extratoDoFilho, meuExtrato, saldosDosFilhos } from '@/servicos/mesada'
import { DEMONSTRACAO, DEMONSTRACAO_FILHOS, semearDemonstracao } from '../prisma/demonstracao'
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
    expect(usuarios).toHaveLength(DEMONSTRACAO.length + DEMONSTRACAO_FILHOS.length)
  })

  it('cria um responsável, um adulto e os dois logins de filho, e nenhum outro papel', async () => {
    await semearDemonstracao(prisma)

    const papeis = (await prisma.usuario.findMany()).map((u) => u.papel).sort()
    expect(papeis).toEqual(['admin', 'filho', 'filho', 'usuario'])
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

describe('lançamentos de demonstração (FT-03 e FT-04, PR-04)', () => {
  it('cria 7 categorias (5 de despesa, 2 de receita) e 15 lançamentos fictícios em três meses', async () => {
    await semearDemonstracao(prisma)
    const categorias = await prisma.categoria.findMany()
    expect(categorias.filter((c) => c.tipo === 'despesa')).toHaveLength(5)
    expect(categorias.filter((c) => c.tipo === 'receita')).toHaveLength(2)
    expect(await prisma.lancamento.count()).toBe(15)
  })

  it('os lançamentos são do mês corrente em São Paulo e dos dois anteriores, com categoria do mesmo tipo', async () => {
    const agora = new Date('2026-03-15T12:00:00Z')
    await semearDemonstracao(prisma, agora)
    const lancamentos = await prisma.lancamento.findMany({ include: { categoria: true } })
    const meses = new Set<string>()
    for (const l of lancamentos) {
      expect(dataCivilValida(l.data), l.data).toBe(true)
      meses.add(mesDaData(l.data))
      expect(l.categoria.tipo).toBe(l.tipo)
    }
    expect(mesAtualEmSaoPaulo(agora)).toBe('2026-03')
    expect([...meses].sort()).toEqual(['2026-01', '2026-02', '2026-03'])
  })

  it('na virada de ano o mês anterior é dezembro e o outro é novembro', async () => {
    const agora = new Date('2027-01-10T12:00:00Z')
    await semearDemonstracao(prisma, agora)
    const meses = new Set((await prisma.lancamento.findMany()).map((l) => mesDaData(l.data)))
    expect(mesAnterior('2027-01')).toBe('2026-12')
    expect([...meses].sort()).toEqual(['2026-11', '2026-12', '2027-01'])
  })

  it('os seis lançamentos de antes mantêm id e valor', async () => {
    await semearDemonstracao(prisma)
    const esperados: Array<[number, number]> = [
      [1, 520000], [2, 35000], [3, 180000], [4, 64235], [5, 12000], [6, 8990],
    ]
    for (const [n, valor] of esperados) {
      const l = await prisma.lancamento.findUniqueOrThrow({ where: { id: `demonstracao-lancamento-${n}` } })
      expect(l.valorCentavos).toBe(valor)
    }
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
    expect(await prisma.lancamento.count()).toBe(15)
    expect((await prisma.lancamento.findUniqueOrThrow({ where: { id: um.id } })).descricao).toBe('Editado à mão')
  })

  it('o adulto de demonstração consegue ler os lançamentos semeados pelo serviço', async () => {
    await semearDemonstracao(prisma)
    const { usuario } = await entrar({ email: 'adulto@exemplo.local', senha: 'demo1234' })
    const pagina = await listarLancamentos(usuario, {})
    expect(pagina.total).toBe(8)
  })
})

describe('o resumo mostra o que a seed semeia (FT-04, PR-04)', () => {
  const agora = new Date('2026-10-28T15:00:00Z')

  it('o mês corrente tem receitas, despesas, saldo positivo e despesas em mais de uma categoria', async () => {
    await semearDemonstracao(prisma, agora)
    const { usuario } = await entrar({ email: 'responsavel@exemplo.local', senha: 'demo1234' })

    const r = await resumoDoMes(usuario, {}, agora)

    expect(r.mes).toBe('2026-10')
    expect(r.receitasCentavos).toBe(555000)
    expect(r.despesasCentavos).toBe(302475)
    expect(r.saldoCentavos).toBe(252525)
    expect(r.despesasPorCategoria.length).toBeGreaterThanOrEqual(3)
    expect(r.despesasPorCategoria.some((c) => c.quantidade > 1)).toBe(true)
    expect(r.despesasPorCategoria.map((c) => c.nome)).toEqual(['Moradia', 'Mercado', 'Lazer', 'Transporte'])
  })

  it('o mês anterior tem receita e despesa próprias e saldo diferente do corrente', async () => {
    await semearDemonstracao(prisma, agora)
    const { usuario } = await entrar({ email: 'adulto@exemplo.local', senha: 'demo1234' })

    const atual = await resumoDoMes(usuario, { mes: '2026-10' }, agora)
    const anterior = await resumoDoMes(usuario, { mes: '2026-09' }, agora)

    expect(anterior.receitasCentavos).toBe(520000)
    expect(anterior.despesasCentavos).toBe(285190)
    expect(anterior.saldoCentavos).toBe(234810)
    expect(anterior.saldoCentavos).not.toBe(atual.saldoCentavos)
    expect(anterior.despesasPorCategoria.length).toBeGreaterThanOrEqual(3)
  })

  it('há um mês de saldo negativo para demonstrar o aviso', async () => {
    await semearDemonstracao(prisma, agora)
    const { usuario } = await entrar({ email: 'responsavel@exemplo.local', senha: 'demo1234' })

    const r = await resumoDoMes(usuario, { mes: '2026-08' }, agora)

    expect(r.saldoCentavos).toBe(-65000)
  })

  it('rodar duas vezes não muda o resumo', async () => {
    await semearDemonstracao(prisma, agora)
    await semearDemonstracao(prisma, agora)
    const { usuario } = await entrar({ email: 'responsavel@exemplo.local', senha: 'demo1234' })

    expect((await resumoDoMes(usuario, { mes: '2026-10' }, agora)).saldoCentavos).toBe(252525)
  })

  it('todo valor semeado é inteiro positivo em centavos e os ids são fixos', async () => {
    await semearDemonstracao(prisma, agora)
    const lancamentos = await prisma.lancamento.findMany()
    for (const l of lancamentos) {
      expect(Number.isInteger(l.valorCentavos)).toBe(true)
      expect(l.valorCentavos).toBeGreaterThan(0)
      expect(l.id).toMatch(/^demonstracao-lancamento-\d+$/)
    }
  })
})

describe('filhos de demonstração (FT-05, PR-04)', () => {
  it('cria dois filhos fictícios com mesada em centavos inteiros, cada um com login de papel filho', async () => {
    await semearDemonstracao(prisma)

    const responsavel = await entrar({ email: DEMONSTRACAO[0].email, senha: DEMONSTRACAO[0].senha })
    const filhos = await listarFilhos(responsavel.usuario)
    expect(filhos).toHaveLength(2)
    expect(filhos.map((f) => f.nome).sort()).toEqual(DEMONSTRACAO_FILHOS.map((f) => f.nome).sort())
    for (const f of filhos) {
      expect(Number.isInteger(f.mesadaCentavos)).toBe(true)
      expect(f.mesadaCentavos).toBeGreaterThan(0)
      expect(['semanal', 'mensal']).toContain(f.periodicidade)
      expect(f.login).toMatchObject({ ativo: true })
    }
  })

  it('cada filho entra com a credencial de demonstração e lê só a própria mesada, nunca a do irmão', async () => {
    await semearDemonstracao(prisma)

    for (const conta of DEMONSTRACAO_FILHOS) {
      const { usuario } = await entrar({ email: conta.email, senha: conta.senha })
      expect(usuario.papel).toBe('filho')
      const mesada = await minhaMesada(usuario)
      expect(mesada.nome).toBe(conta.nome)
      expect(mesada.mesadaCentavos).toBe(conta.mesadaCentavos)
      const irmao = DEMONSTRACAO_FILHOS.find((o) => o.nome !== conta.nome)
      expect(JSON.stringify(mesada)).not.toContain(irmao?.nome as string)
    }
  })

  it('as credenciais são fictícias, do domínio reservado, e os ids são fixos', async () => {
    for (const conta of DEMONSTRACAO_FILHOS) {
      expect(conta.email.endsWith('@exemplo.local')).toBe(true)
      expect(conta.senha.length).toBeGreaterThanOrEqual(8)
    }
    await semearDemonstracao(prisma)
    const ids = (await prisma.filho.findMany({ orderBy: { id: 'asc' } })).map((f) => f.id)
    expect(ids).toEqual(DEMONSTRACAO_FILHOS.map((f) => `demonstracao-filho-${f.slug}`).sort())
  })

  it('rodar duas vezes não duplica nem desfaz o que o responsável editou', async () => {
    await semearDemonstracao(prisma)
    await prisma.filho.update({ where: { id: 'demonstracao-filho-ana' }, data: { mesadaCentavos: 9999 } })
    await semearDemonstracao(prisma)

    expect(await prisma.filho.count()).toBe(2)
    expect((await prisma.filho.findUniqueOrThrow({ where: { id: 'demonstracao-filho-ana' } })).mesadaCentavos).toBe(9999)
    expect(await prisma.usuario.count({ where: { papel: 'filho' } })).toBe(2)
  })

  it('a seed não grava dado além do que a PR-09 permite', async () => {
    await semearDemonstracao(prisma)
    const texto = JSON.stringify(await prisma.filho.findMany())
    expect(texto).not.toMatch(/cpf|telefone|endere|foto/i)
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
    expect(await prisma.filho.count()).toBe(0)
  })
})

describe('movimentos de mesada de demonstração (FT-06, PR-04)', () => {
  const responsavel = async () =>
    prisma.usuario.findUniqueOrThrow({ where: { email: 'responsavel@exemplo.local' } })

  it('cria créditos e gastos para os dois filhos', async () => {
    await semearDemonstracao(prisma)
    const movimentos = await prisma.movimentoDeMesada.findMany()
    expect(movimentos.length).toBeGreaterThanOrEqual(8)
    expect(new Set(movimentos.map((m) => m.tipo))).toEqual(new Set(['credito', 'gasto']))
    expect(new Set(movimentos.map((m) => m.filhoId))).toEqual(
      new Set(DEMONSTRACAO_FILHOS.map((f) => `demonstracao-filho-${f.slug}`)),
    )
  })

  it('Ana fica com saldo positivo e Pedro com saldo negativo, para provar os dois estados', async () => {
    await semearDemonstracao(prisma)
    const admin = await responsavel()
    const saldos = await saldosDosFilhos(admin)
    expect(saldos['demonstracao-filho-ana']).toBeGreaterThan(0)
    expect(saldos['demonstracao-filho-pedro']).toBeLessThan(0)
    expect((await extratoDoFilho(admin, 'demonstracao-filho-ana')).saldoCentavos).toBe(saldos['demonstracao-filho-ana'])
  })

  it('rodar duas vezes não duplica nem desfaz o que o responsável editou', async () => {
    await semearDemonstracao(prisma)
    const total = await prisma.movimentoDeMesada.count()
    await prisma.movimentoDeMesada.update({
      where: { id: 'demonstracao-mesada-1' },
      data: { descricao: 'Editado pelo responsável' },
    })
    await semearDemonstracao(prisma)
    expect(await prisma.movimentoDeMesada.count()).toBe(total)
    expect((await prisma.movimentoDeMesada.findUniqueOrThrow({ where: { id: 'demonstracao-mesada-1' } })).descricao).toBe(
      'Editado pelo responsável',
    )
  })

  it('todo valor é inteiro positivo em centavos, a data é um dia civil válido e a descrição é curta', async () => {
    await semearDemonstracao(prisma, new Date('2026-03-15T12:00:00Z'))
    for (const m of await prisma.movimentoDeMesada.findMany()) {
      expect(Number.isInteger(m.valorCentavos), m.id).toBe(true)
      expect(m.valorCentavos, m.id).toBeGreaterThan(0)
      expect(dataCivilValida(m.data), m.id).toBe(true)
      expect(m.descricao.length, m.id).toBeLessThanOrEqual(200)
      expect(m.descricao.length, m.id).toBeGreaterThan(0)
      expect(['2026-01', '2026-02', '2026-03']).toContain(mesDaData(m.data))
    }
  })

  it('cada filho entra e vê só o próprio extrato; o outro nunca aparece', async () => {
    await semearDemonstracao(prisma)
    const ana = await prisma.usuario.findUniqueOrThrow({ where: { email: 'ana@exemplo.local' } })
    const pedro = await prisma.usuario.findUniqueOrThrow({ where: { email: 'pedro@exemplo.local' } })
    const deAna = await meuExtrato(ana)
    const dePedro = await meuExtrato(pedro)
    expect(deAna.itens.length).toBeGreaterThan(0)
    expect(dePedro.itens.length).toBeGreaterThan(0)
    expect(deAna.itens.every((m) => m.filhoId === 'demonstracao-filho-ana')).toBe(true)
    expect(dePedro.itens.every((m) => m.filhoId === 'demonstracao-filho-pedro')).toBe(true)
    expect(dePedro.saldoCentavos).toBeLessThan(0)
  })

  it('não guarda saldo nem toca a trilha de atividade', async () => {
    await semearDemonstracao(prisma)
    expect(await prisma.atividade.count({ where: { entidade: 'mesada' } })).toBe(0)
  })

  it('não roda em produção', async () => {
    const antes = process.env.NODE_ENV
    Object.assign(process.env, { NODE_ENV: 'production' })
    try {
      await expect(semearDemonstracao(prisma)).rejects.toThrow(/produção/)
    } finally {
      Object.assign(process.env, { NODE_ENV: antes })
    }
    expect(await prisma.movimentoDeMesada.count()).toBe(0)
  })
})
