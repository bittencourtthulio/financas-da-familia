/**
 * Lançamentos recorrentes e situação (pago ou em aberto): a recorrência cria
 * um lançamento por mês, em aberto, ligado ao primeiro; editar e apagar
 * perguntam se vale só para o mês ou também para os próximos; um mês apagado
 * não volta; pago ou não é de cada mês.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { dataDaRecorrencia, somarMeses } from '@/lib/datas'
import {
  alternarPago,
  apagarCategoria,
  apagarLancamento,
  criarLancamento,
  editarLancamento,
  listarLancamentos,
} from '@/servicos/lancamentos'
import { garantirRecorrencias } from '@/servicos/recorrencias'
import { resumoDoMes } from '@/servicos/resumo'
import { criarAdmin, criarCategoriaNoBanco, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

const AGORA = new Date('2026-10-28T15:00:00Z')

async function luz(extra: Record<string, unknown> = {}) {
  const admin = await criarAdmin()
  const categoria = await criarCategoriaNoBanco('despesa', 'Contas')
  const dados = {
    tipo: 'despesa',
    valor: '200,00',
    data: '2026-08-05',
    categoriaId: categoria.id,
    descricao: 'Luz',
    repete: 'on',
    ...extra,
  }
  const primeiro = await criarLancamento(admin, dados)
  return { admin, categoria, primeiro, dados }
}

const doMes = async (recorrenciaId: string) =>
  prisma.lancamento.findMany({ where: { recorrenciaId }, orderBy: { data: 'asc' } })

describe('datas da recorrência', () => {
  it('dia 31 cai no último dia do mês curto, inclusive ano bissexto', () => {
    expect(dataDaRecorrencia('2026-02', 31)).toBe('2026-02-28')
    expect(dataDaRecorrencia('2028-02', 31)).toBe('2028-02-29')
    expect(dataDaRecorrencia('2026-04', 31)).toBe('2026-04-30')
    expect(dataDaRecorrencia('2026-10', 5)).toBe('2026-10-05')
    expect(somarMeses('2026-11', 3)).toBe('2027-02')
  })
})

describe('criar um lançamento recorrente', () => {
  it('guarda o modelo e liga o primeiro mês; só o que foi pedido nasce em aberto', async () => {
    const { primeiro } = await luz({ pago: 'sim' })
    expect(primeiro.pago).toBe(true)
    expect(primeiro.recorrenciaId).not.toBeNull()
    const r = await prisma.recorrencia.findUniqueOrThrow({ where: { id: primeiro.recorrenciaId as string } })
    expect(r).toMatchObject({ diaDoMes: 5, valorCentavos: 20000, inicio: '2026-08', descricao: 'Luz' })
  })

  it('preenche os meses até hoje, em aberto, no mesmo dia', async () => {
    const { primeiro } = await luz()
    const meses = await doMes(primeiro.recorrenciaId as string)
    expect(meses.map((m) => m.data)).toEqual(['2026-08-05', '2026-09-05', '2026-10-05'])
    expect(meses.map((m) => m.pago)).toEqual([true, false, false])
    expect(new Set(meses.map((m) => m.valorCentavos))).toEqual(new Set([20000]))
  })

  it('abrir um mês futuro gera o mês, mas nunca além de um ano à frente; repetir não duplica', async () => {
    const { admin, primeiro } = await luz()
    await listarLancamentos(admin, { mes: '2027-03' }, AGORA)
    await listarLancamentos(admin, { mes: '2027-03' }, AGORA)
    let meses = await doMes(primeiro.recorrenciaId as string)
    expect(meses.at(-1)?.data).toBe('2027-03-05')
    expect(meses).toHaveLength(8)

    await garantirRecorrencias('2035-01', AGORA)
    meses = await doMes(primeiro.recorrenciaId as string)
    expect(meses.at(-1)?.data).toBe('2027-10-05')
  })

  it('o resumo do mês inclui o lançamento recorrente do mês aberto', async () => {
    const { admin } = await luz()
    const r = await resumoDoMes(admin, { mes: '2026-12' }, AGORA)
    expect(r.despesasCentavos).toBe(20000)
  })

  it('lançamento avulso não vira recorrência e vem pago por padrão', async () => {
    const admin = await criarAdmin()
    const c = await criarCategoriaNoBanco('despesa')
    const l = await criarLancamento(admin, { tipo: 'despesa', valor: '1,00', data: '2026-10-01', categoriaId: c.id })
    expect(l.pago).toBe(true)
    expect(l.recorrenciaId).toBeNull()
    expect(await prisma.recorrencia.count()).toBe(0)
  })
})

describe('editar: só este mês ou este e os próximos', () => {
  it('só este mês muda este e deixa o resto', async () => {
    const { admin, primeiro, dados } = await luz()
    const set = await doMes(primeiro.recorrenciaId as string)
    await editarLancamento(admin, set[1]!.id, { ...dados, data: '2026-09-05', valor: '250,00', descricao: 'Luz (bandeira)', escopo: 'este', repete: undefined })
    const depois = await doMes(primeiro.recorrenciaId as string)
    expect(depois.map((m) => m.valorCentavos)).toEqual([20000, 25000, 20000])
    const r = await prisma.recorrencia.findUniqueOrThrow({ where: { id: primeiro.recorrenciaId as string } })
    expect(r.valorCentavos).toBe(20000)
  })

  it('este e os próximos muda daqui para frente, atualiza o modelo e não mexe no passado nem no pago', async () => {
    const { admin, primeiro, dados } = await luz()
    const id = primeiro.recorrenciaId as string
    const [agosto, setembro] = await doMes(id)
    await prisma.lancamento.update({ where: { id: setembro!.id }, data: { pago: true } })
    await editarLancamento(admin, setembro!.id, {
      ...dados, valor: '300,00', descricao: 'Conta de luz', data: '2026-09-10', pago: 'sim', escopo: 'proximos', repete: undefined,
    })
    const meses = await doMes(id)
    expect(meses.map((m) => [m.data, m.valorCentavos, m.descricao, m.pago])).toEqual([
      ['2026-08-05', 20000, 'Luz', true],
      ['2026-09-10', 30000, 'Conta de luz', true],
      ['2026-10-10', 30000, 'Conta de luz', false],
    ])
    expect(agosto!.id).toBe(meses[0]!.id)
    await garantirRecorrencias('2026-12', AGORA)
    const novos = await doMes(id)
    expect(novos.at(-1)).toMatchObject({ data: '2026-12-10', valorCentavos: 30000, pago: false })
  })

  it('transforma um lançamento avulso em recorrente ao editar', async () => {
    const admin = await criarAdmin()
    const c = await criarCategoriaNoBanco('despesa')
    const l = await criarLancamento(admin, { tipo: 'despesa', valor: '50,00', data: '2026-10-15', categoriaId: c.id })
    const depois = await editarLancamento(admin, l.id, { tipo: 'despesa', valor: '50,00', data: '2026-10-15', categoriaId: c.id, repete: 'on' })
    expect(depois.recorrenciaId).not.toBeNull()
    expect(await prisma.recorrencia.count()).toBe(1)
  })
})

describe('mover para um mês que já tem o seu', () => {
  it('recusa com mensagem em português, sem erro técnico', async () => {
    const { admin, primeiro, dados } = await luz()
    const [, setembro] = await doMes(primeiro.recorrenciaId as string)
    await expect(
      editarLancamento(admin, setembro!.id, { ...dados, data: '2026-08-20', repete: undefined }),
    ).rejects.toThrow(/já tem este lançamento recorrente/)
  })
})

describe('apagar: só este mês ou este e os próximos', () => {
  it('só este mês apaga um e o mês apagado não volta', async () => {
    const { admin, primeiro } = await luz()
    const id = primeiro.recorrenciaId as string
    const [, setembro] = await doMes(id)
    await apagarLancamento(admin, setembro!.id)
    await listarLancamentos(admin, { mes: '2026-12' }, AGORA)
    const meses = (await doMes(id)).map((m) => m.data)
    expect(meses).not.toContain('2026-09-05')
    expect(meses).toContain('2026-12-05')
  })

  it('este e os próximos apaga daqui para frente e encerra a recorrência', async () => {
    const { admin, primeiro } = await luz()
    const id = primeiro.recorrenciaId as string
    const [, setembro] = await doMes(id)
    await apagarLancamento(admin, setembro!.id, 'proximos')
    expect((await doMes(id)).map((m) => m.data)).toEqual(['2026-08-05'])
    expect((await prisma.recorrencia.findUniqueOrThrow({ where: { id } })).fim).toBe('2026-08')
    await garantirRecorrencias('2027-06', AGORA)
    expect(await doMes(id)).toHaveLength(1)
  })

  it('apagar do primeiro mês em diante some com a recorrência', async () => {
    const { admin, primeiro } = await luz()
    await apagarLancamento(admin, primeiro.id, 'proximos')
    expect(await prisma.lancamento.count()).toBe(0)
    expect(await prisma.recorrencia.count()).toBe(0)
  })

  it('lançamento sem recorrência ignora o escopo', async () => {
    const admin = await criarAdmin()
    const c = await criarCategoriaNoBanco('despesa')
    const a = await criarLancamento(admin, { tipo: 'despesa', valor: '1,00', data: '2026-10-01', categoriaId: c.id })
    const b = await criarLancamento(admin, { tipo: 'despesa', valor: '1,00', data: '2026-10-02', categoriaId: c.id })
    await apagarLancamento(admin, a.id, 'proximos')
    expect((await prisma.lancamento.findMany()).map((l) => l.id)).toEqual([b.id])
  })
})

describe('pago ou em aberto', () => {
  it('alterna só este mês e deixa rastro sem valor', async () => {
    const { admin, primeiro } = await luz()
    const [, setembro, outubro] = await doMes(primeiro.recorrenciaId as string)
    expect(setembro!.pago).toBe(false)
    const pago = await alternarPago(admin, setembro!.id)
    expect(pago.pago).toBe(true)
    expect((await prisma.lancamento.findUniqueOrThrow({ where: { id: outubro!.id } })).pago).toBe(false)
    const volta = await alternarPago(admin, setembro!.id)
    expect(volta.pago).toBe(false)
    const rastro = await prisma.atividade.findMany({ where: { acao: 'lancamento.alterado', entidadeId: setembro!.id } })
    expect(rastro).toHaveLength(2)
  })

  it('o formulário "em aberto" grava em aberto e o filho não alterna', async () => {
    const admin = await criarAdmin()
    const c = await criarCategoriaNoBanco('despesa')
    const l = await criarLancamento(admin, { tipo: 'despesa', valor: '9,00', data: '2026-10-01', categoriaId: c.id, pago: 'nao' })
    expect(l.pago).toBe(false)
    const filho = await criarUsuario({ papel: 'filho' })
    await expect(alternarPago(filho, l.id)).rejects.toThrow()
  })
})

describe('categoria com recorrência', () => {
  it('não apaga a categoria usada por uma recorrência, mesmo sem lançamentos', async () => {
    const { admin, categoria, primeiro } = await luz()
    await prisma.lancamento.deleteMany({ where: { recorrenciaId: primeiro.recorrenciaId } })
    await expect(apagarCategoria(admin, categoria.id)).rejects.toThrow(/tem 1/)
  })
})
