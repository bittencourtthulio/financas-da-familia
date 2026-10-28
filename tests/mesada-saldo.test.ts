/**
 * O saldo do filho (PR-02, PR-32): créditos menos gastos, somados em inteiros
 * no servidor. Valores que quebrariam em ponto flutuante e um extrato longo
 * provam que a soma é exata.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { extratoDoFilho, registrarMovimento, saldosDosFilhos } from '@/servicos/mesada'
import { cadastrarFilho } from '@/servicos/filhos'
import { prisma } from '@/lib/prisma'
import { criarAdmin, limparBanco } from './ajuda'

beforeEach(limparBanco)

const FILHO = { nome: 'Ana', nascimento: '', valor: '50,00', periodicidade: 'semanal' }

async function cenario() {
  const admin = await criarAdmin()
  const filho = await cadastrarFilho(admin, FILHO)
  return { admin, filho }
}

const mov = (tipo: 'credito' | 'gasto', valor: string, data = '2026-10-05') => ({ tipo, valor, data })

describe('o saldo é exato em centavos inteiros', () => {
  it('0,10 + 0,20 de crédito menos 0,30 de gasto é exatamente zero (em ponto flutuante daria 5,5e-17)', async () => {
    const { admin, filho } = await cenario()
    await registrarMovimento(admin, filho.id, mov('credito', '0,10'))
    await registrarMovimento(admin, filho.id, mov('credito', '0,20'))
    const r = await registrarMovimento(admin, filho.id, mov('gasto', '0,30'))
    expect(r.saldoCentavos).toBe(0)
    const e = await extratoDoFilho(admin, filho.id)
    expect(e.saldoCentavos).toBe(0)
    expect(Number.isInteger(e.saldoCentavos)).toBe(true)
  })

  it('19,99 vezes três créditos soma 5997 (19,99 * 100 em ponto flutuante dá 1998,9999999999998)', async () => {
    const { admin, filho } = await cenario()
    for (let i = 0; i < 3; i += 1) await registrarMovimento(admin, filho.id, mov('credito', '19,99'))
    expect((await extratoDoFilho(admin, filho.id)).saldoCentavos).toBe(5997)
  })

  it('1,15 menos 1,10 sobra exatamente 5 centavos', async () => {
    const { admin, filho } = await cenario()
    await registrarMovimento(admin, filho.id, mov('credito', '1,15'))
    const r = await registrarMovimento(admin, filho.id, mov('gasto', '1,10'))
    expect(r.saldoCentavos).toBe(5)
  })

  it('saldo negativo sai com o sinal certo e os totais continuam positivos', async () => {
    const { admin, filho } = await cenario()
    await registrarMovimento(admin, filho.id, mov('credito', '10,00'))
    await registrarMovimento(admin, filho.id, mov('gasto', '25,50'))
    const e = await extratoDoFilho(admin, filho.id)
    expect(e).toMatchObject({ creditosCentavos: 1000, gastosCentavos: 2550, saldoCentavos: -1550 })
  })

  it('extrato longo: 1.000 movimentos de 0,01 e 0,07 somam exatamente, fora da primeira página', async () => {
    const { admin, filho } = await cenario()
    const linhas = []
    for (let i = 0; i < 1000; i += 1) {
      linhas.push({
        filhoId: filho.id,
        tipo: i % 3 === 0 ? 'gasto' : 'credito',
        valorCentavos: i % 3 === 0 ? 7 : 1,
        data: `2026-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
      })
    }
    await prisma.movimentoDeMesada.createMany({ data: linhas })
    const gastos = linhas.filter((l) => l.tipo === 'gasto').length
    const creditos = linhas.length - gastos
    const e = await extratoDoFilho(admin, filho.id, { pagina: 5 })
    expect(e.total).toBe(1000)
    expect(e.itens).toHaveLength(30)
    expect(e.creditosCentavos).toBe(creditos)
    expect(e.gastosCentavos).toBe(gastos * 7)
    expect(e.saldoCentavos).toBe(creditos - gastos * 7)
  })

  it('o saldo não depende do mês nem da data: soma tudo, inclusive futuro (PR-32)', async () => {
    const { admin, filho } = await cenario()
    await registrarMovimento(admin, filho.id, mov('credito', '10,00', '2020-01-01'))
    await registrarMovimento(admin, filho.id, mov('credito', '5,00', '2090-06-15'))
    expect((await extratoDoFilho(admin, filho.id)).saldoCentavos).toBe(1500)
  })

  it('o valor máximo repetido muitas vezes não perde precisão', async () => {
    const { admin, filho } = await cenario()
    await prisma.movimentoDeMesada.createMany({
      data: Array.from({ length: 50 }, () => ({ filhoId: filho.id, tipo: 'credito', valorCentavos: 100_000_000, data: '2026-10-05' })),
    })
    expect((await extratoDoFilho(admin, filho.id)).saldoCentavos).toBe(5_000_000_000)
  })
})

describe('saldosDosFilhos (lista do responsável)', () => {
  it('devolve o saldo de cada filho, zero para quem não tem movimento, sem misturar irmãos', async () => {
    const { admin, filho } = await cenario()
    const bia = await cadastrarFilho(admin, { ...FILHO, nome: 'Bia' })
    const caio = await cadastrarFilho(admin, { ...FILHO, nome: 'Caio' })
    await registrarMovimento(admin, filho.id, mov('credito', '30,00'))
    await registrarMovimento(admin, filho.id, mov('gasto', '5,00'))
    await registrarMovimento(admin, bia.id, mov('gasto', '8,00'))
    expect(await saldosDosFilhos(admin)).toEqual({ [filho.id]: 2500, [bia.id]: -800, [caio.id]: 0 })
  })

  it('sem filho cadastrado devolve objeto vazio', async () => {
    const admin = await criarAdmin()
    expect(await saldosDosFilhos(admin)).toEqual({})
  })
})
