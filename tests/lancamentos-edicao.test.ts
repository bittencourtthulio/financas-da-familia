/**
 * Editar e apagar lançamento (PR-10, PR-28): as mesmas validações da criação,
 * o rastro só quando algo mudou, a exclusão definitiva com rastro sem valor,
 * tudo na mesma transação da trilha.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import {
  criarLancamento,
  editarLancamento,
  apagarLancamento,
} from '@/servicos/lancamentos'
import { ErroDeAplicacao } from '@/lib/erros'
import { criarAdmin, criarUsuario, criarCategoriaNoBanco, limparBanco } from './ajuda'

beforeEach(limparBanco)

const erroDe = async (promessa: Promise<unknown>): Promise<ErroDeAplicacao> => {
  try {
    await promessa
  } catch (e) {
    expect(e).toBeInstanceOf(ErroDeAplicacao)
    return e as ErroDeAplicacao
  }
  throw new Error('Era esperado um ErroDeAplicacao, mas nada foi lançado.')
}

async function cenario() {
  const admin = await criarAdmin()
  const adulto = await criarUsuario({ papel: 'usuario' })
  const mercado = await criarCategoriaNoBanco('despesa', 'Mercado')
  const lazer = await criarCategoriaNoBanco('despesa', 'Lazer')
  const salario = await criarCategoriaNoBanco('receita', 'Salário')
  const entrada = {
    tipo: 'despesa',
    valor: '100,00',
    data: '2026-10-10',
    categoriaId: mercado.id,
    descricao: 'Feira',
  }
  const criado = await criarLancamento(admin, entrada)
  await prisma.atividade.deleteMany() // parte do zero: só interessa o rastro da edição
  return { admin, adulto, mercado, lazer, salario, entrada, criado }
}

describe('editarLancamento', () => {
  it('troca valor, data, categoria e descrição, e o rastro leva o ator, o tipo e a categoria nova', async () => {
    const { adulto, lazer, entrada, criado } = await cenario()
    const novo = await editarLancamento(adulto, criado.id, {
      ...entrada,
      valor: '1.234,56',
      data: '2026-10-11',
      categoriaId: lazer.id,
      descricao: 'Cinema',
    })

    expect(novo).toMatchObject({
      id: criado.id,
      valorCentavos: 123456,
      data: '2026-10-11',
      descricao: 'Cinema',
      categoriaId: lazer.id,
    })
    expect(novo.categoria.nome).toBe('Lazer')
    expect(await prisma.lancamento.count()).toBe(1)

    const linhas = await prisma.atividade.findMany()
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({
      atorId: adulto.id,
      acao: 'lancamento.alterado',
      entidade: 'lancamento',
      entidadeId: criado.id,
    })
    expect(JSON.parse(linhas[0]?.detalhe as string)).toEqual({ tipo: 'despesa', categoriaId: lazer.id })
    const registro = JSON.stringify(linhas[0])
    for (const proibido of ['123456', '1234,56', '1.234,56', '10000', 'Cinema', 'Feira']) {
      expect(registro).not.toContain(proibido)
    }
  })

  it('reenviar os mesmos dados não grava registro nem muda o lançamento', async () => {
    const { admin, entrada, criado } = await cenario()
    const igual = await editarLancamento(admin, criado.id, entrada)
    expect(igual.valorCentavos).toBe(10000)
    expect(igual.atualizadoEm.getTime()).toBe(criado.atualizadoEm.getTime())
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('"100,00" e "100" são o mesmo valor: reenviar escrito de outro jeito não é mudança', async () => {
    const { admin, entrada, criado } = await cenario()
    await editarLancamento(admin, criado.id, { ...entrada, valor: '100' })
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('mudar só um campo já é mudança', async () => {
    const { admin, entrada, criado } = await cenario()
    await editarLancamento(admin, criado.id, { ...entrada, descricao: 'Feira e padaria' })
    expect(await prisma.atividade.count()).toBe(1)
  })

  it('trocar o tipo exige categoria do tipo novo; sem ela, 422 e nada muda', async () => {
    const { admin, entrada, criado } = await cenario()
    const erro = await erroDe(editarLancamento(admin, criado.id, { ...entrada, tipo: 'receita' }))
    expect(erro.status).toBe(422)
    const intacto = await prisma.lancamento.findUniqueOrThrow({ where: { id: criado.id } })
    expect(intacto.tipo).toBe('despesa')
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('trocar o tipo com a categoria do tipo novo funciona', async () => {
    const { admin, salario, entrada, criado } = await cenario()
    const novo = await editarLancamento(admin, criado.id, {
      ...entrada,
      tipo: 'receita',
      categoriaId: salario.id,
    })
    expect(novo.tipo).toBe('receita')
    const linhas = await prisma.atividade.findMany()
    expect(JSON.parse(linhas[0]?.detalhe as string)).toEqual({ tipo: 'receita', categoriaId: salario.id })
  })

  it('se o registro da trilha falha, a edição não acontece', async () => {
    const { admin, entrada, criado } = await cenario()
    await expect(
      editarLancamento({ ...admin, nome: '' }, criado.id, { ...entrada, valor: '999,00' }),
    ).rejects.toBeInstanceOf(ErroDeAplicacao)
    const intacto = await prisma.lancamento.findUniqueOrThrow({ where: { id: criado.id } })
    expect(intacto.valorCentavos).toBe(10000)
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('valida como a criação: valor, data, categoria e descrição', async () => {
    const { admin, entrada, criado } = await cenario()
    for (const troca of [
      { valor: 'dez' },
      { valor: '0,00' },
      { valor: '1234.56' },
      { data: '2026-02-30' },
      { categoriaId: 'nao-existe' },
      { descricao: 'x'.repeat(201) },
    ]) {
      expect((await erroDe(editarLancamento(admin, criado.id, { ...entrada, ...troca }))).status).toBe(422)
    }
    const intacto = await prisma.lancamento.findUniqueOrThrow({ where: { id: criado.id } })
    expect(intacto).toMatchObject({ valorCentavos: 10000, data: '2026-10-10', descricao: 'Feira' })
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('id inexistente dá 404', async () => {
    const { admin, entrada } = await cenario()
    expect((await erroDe(editarLancamento(admin, 'nao-existe', entrada))).status).toBe(404)
  })
})

describe('apagarLancamento', () => {
  it('remove a linha e grava o registro com o id, o tipo e a categoria, sem valor', async () => {
    const { adulto, mercado, criado } = await cenario()
    await apagarLancamento(adulto, criado.id)

    expect(await prisma.lancamento.count()).toBe(0)
    const linhas = await prisma.atividade.findMany()
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({
      atorId: adulto.id,
      atorNome: adulto.nome,
      acao: 'lancamento.apagado',
      entidade: 'lancamento',
      entidadeId: criado.id,
    })
    expect(JSON.parse(linhas[0]?.detalhe as string)).toEqual({ tipo: 'despesa', categoriaId: mercado.id })
    const registro = JSON.stringify(linhas[0])
    for (const proibido of ['10000', '100,00', 'Feira', 'valor']) {
      expect(registro).not.toContain(proibido)
    }
  })

  it('a categoria continua depois de apagar o lançamento', async () => {
    const { admin, mercado, criado } = await cenario()
    await apagarLancamento(admin, criado.id)
    expect(await prisma.categoria.findUnique({ where: { id: mercado.id } })).not.toBeNull()
  })

  it('o adulto apaga o que o responsável criou', async () => {
    const { adulto, criado } = await cenario()
    await expect(apagarLancamento(adulto, criado.id)).resolves.toBeUndefined()
  })

  it('apagar duas vezes dá 404 na segunda e não grava segundo registro', async () => {
    const { admin, criado } = await cenario()
    await apagarLancamento(admin, criado.id)
    expect((await erroDe(apagarLancamento(admin, criado.id))).status).toBe(404)
    expect(await prisma.atividade.count()).toBe(1)
  })

  it('id inexistente dá 404', async () => {
    const { admin } = await cenario()
    expect((await erroDe(apagarLancamento(admin, 'nao-existe'))).status).toBe(404)
  })

  it('se o registro da trilha falha, o lançamento continua', async () => {
    const { admin, criado } = await cenario()
    await expect(apagarLancamento({ ...admin, nome: '' }, criado.id)).rejects.toBeInstanceOf(ErroDeAplicacao)
    expect(await prisma.lancamento.count()).toBe(1)
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('apagar um lançamento não toca nos outros', async () => {
    const { admin, entrada, criado } = await cenario()
    const outro = await criarLancamento(admin, { ...entrada, valor: '5,00' })
    await apagarLancamento(admin, criado.id)
    const restantes = await prisma.lancamento.findMany()
    expect(restantes.map((l) => l.id)).toEqual([outro.id])
  })
})
