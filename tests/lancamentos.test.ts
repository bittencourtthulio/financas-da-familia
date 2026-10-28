/**
 * Criar e ler lançamento (PR-02, PR-10, PR-25, PR-26): valor em formato
 * brasileiro vira centavos inteiros, a categoria precisa existir e ser do
 * mesmo tipo, e o rastro na trilha nunca leva o valor.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarLancamento, obterLancamento } from '@/servicos/lancamentos'
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

async function entradaValida(sobrescreve: Record<string, unknown> = {}) {
  const categoria = await criarCategoriaNoBanco('despesa', 'Mercado')
  return {
    tipo: 'despesa',
    valor: '1.234,56',
    data: '2026-10-27',
    categoriaId: categoria.id,
    descricao: 'Compra do mês',
    ...sobrescreve,
  }
}

describe('criarLancamento', () => {
  it('lê o valor em formato brasileiro e grava centavos inteiros, o dia e a descrição', async () => {
    const adulto = await criarUsuario({ papel: 'usuario' })
    const criado = await criarLancamento(adulto, await entradaValida())

    expect(criado).toMatchObject({
      tipo: 'despesa',
      valorCentavos: 123456,
      data: '2026-10-27',
      descricao: 'Compra do mês',
    })
    expect(criado.categoria).toMatchObject({ nome: 'Mercado', tipo: 'despesa' })
    const noBanco = await prisma.lancamento.findUniqueOrThrow({ where: { id: criado.id } })
    expect(noBanco.valorCentavos).toBe(123456)
    expect(Number.isInteger(noBanco.valorCentavos)).toBe(true)
  })

  it('o responsável lança uma receita', async () => {
    const admin = await criarAdmin()
    const salario = await criarCategoriaNoBanco('receita', 'Salário')
    const criado = await criarLancamento(admin, {
      tipo: 'receita',
      valor: 'R$ 5.000,00',
      data: '2026-10-05',
      categoriaId: salario.id,
    })
    expect(criado).toMatchObject({ tipo: 'receita', valorCentavos: 500000, descricao: '' })
  })

  it('valores com centavos que o ponto flutuante erra saem exatos', async () => {
    const admin = await criarAdmin()
    const entrada = await entradaValida()
    for (const [texto, centavos] of [['19,99', 1999], ['0,07', 7], ['1,1', 110], ['0,01', 1]] as const) {
      const criado = await criarLancamento(admin, { ...entrada, valor: texto })
      expect(criado.valorCentavos).toBe(centavos)
    }
  })

  it('grava o lançamento e o registro da trilha juntos, só com tipo e categoria, nunca o valor', async () => {
    const adulto = await criarUsuario({ papel: 'usuario' })
    const entrada = await entradaValida()
    const criado = await criarLancamento(adulto, entrada)

    const linhas = await prisma.atividade.findMany()
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toMatchObject({
      atorId: adulto.id,
      atorNome: adulto.nome,
      acao: 'lancamento.criado',
      entidade: 'lancamento',
      entidadeId: criado.id,
    })
    expect(JSON.parse(linhas[0]?.detalhe as string)).toEqual({
      tipo: 'despesa',
      categoriaId: entrada.categoriaId,
    })
    // O valor não aparece em nenhuma coluna do registro, em nenhum formato.
    const registro = JSON.stringify(linhas[0])
    for (const proibido of ['123456', '1234,56', '1.234,56', '1234.56', 'valor', 'Compra do mês']) {
      expect(registro).not.toContain(proibido)
    }
  })

  it('se o registro da trilha falha, o lançamento não é criado', async () => {
    const admin = await criarAdmin()
    const entrada = await entradaValida()
    await expect(criarLancamento({ ...admin, nome: '' }, entrada)).rejects.toBeInstanceOf(ErroDeAplicacao)
    expect(await prisma.lancamento.count()).toBe(0)
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('descrição vazia, ausente ou nula vale e vira texto vazio; espaços das pontas saem', async () => {
    const admin = await criarAdmin()
    const entrada = await entradaValida()
    for (const descricao of ['', '   ', undefined, null]) {
      const criado = await criarLancamento(admin, { ...entrada, descricao })
      expect(criado.descricao).toBe('')
    }
    expect((await criarLancamento(admin, { ...entrada, descricao: '  pão  ' })).descricao).toBe('pão')
  })

  it('descrição de exatamente 200 caracteres vale e de 201 é recusada', async () => {
    const admin = await criarAdmin()
    const entrada = await entradaValida()
    await criarLancamento(admin, { ...entrada, descricao: 'x'.repeat(200) })
    const erro = await erroDe(criarLancamento(admin, { ...entrada, descricao: 'x'.repeat(201) }))
    expect(erro.status).toBe(422)
  })

  it.each([
    ['valor vazio', { valor: '' }],
    ['valor com letras', { valor: 'abc' }],
    ['valor com ponto decimal', { valor: '1234.56' }],
    ['valor negativo', { valor: '-10,00' }],
    ['valor zero', { valor: '0,00' }],
    ['valor acima do teto', { valor: '1.000.000,01' }],
    ['valor NaN', { valor: 'NaN' }],
    ['valor em notação científica', { valor: '1e3' }],
    ['valor número em vez de texto', { valor: 12.5 }],
    ['valor ausente', { valor: undefined }],
    ['tipo inválido', { tipo: 'transferencia' }],
    ['tipo ausente', { tipo: undefined }],
    ['data inexistente', { data: '2026-02-30' }],
    ['data em formato brasileiro', { data: '27/10/2026' }],
    ['data vazia', { data: '' }],
    ['data fora do intervalo', { data: '1999-12-31' }],
    ['categoria ausente', { categoriaId: '' }],
    ['categoria que não existe', { categoriaId: 'nao-existe' }],
  ])('recusa %s com 422 e não grava lançamento nem registro', async (_nome, troca) => {
    const admin = await criarAdmin()
    const entrada = { ...(await entradaValida()), ...troca }
    const erro = await erroDe(criarLancamento(admin, entrada))
    expect(erro.status).toBe(422)
    expect(await prisma.lancamento.count()).toBe(0)
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('recusa categoria de tipo diferente do lançamento', async () => {
    const admin = await criarAdmin()
    const receita = await criarCategoriaNoBanco('receita', 'Salário')
    const base = await entradaValida()
    const erro = await erroDe(criarLancamento(admin, { ...base, tipo: 'despesa', categoriaId: receita.id }))
    expect(erro.status).toBe(422)
    expect(erro.message).toMatch(/categoria/i)
    const despesa = await criarCategoriaNoBanco('despesa', 'Casa')
    const erro2 = await erroDe(criarLancamento(admin, { ...base, tipo: 'receita', categoriaId: despesa.id }))
    expect(erro2.status).toBe(422)
    expect(await prisma.lancamento.count()).toBe(0)
  })

  it('a mensagem de valor inválido ensina o formato', async () => {
    const admin = await criarAdmin()
    const erro = await erroDe(criarLancamento(admin, { ...(await entradaValida()), valor: 'dez' }))
    expect(erro.message).toContain('1.234,56')
  })

  it('entrada que não é objeto é recusada', async () => {
    const admin = await criarAdmin()
    for (const lixo of [null, undefined, 'texto', 42, []]) {
      expect((await erroDe(criarLancamento(admin, lixo))).status).toBe(422)
    }
  })
})

describe('obterLancamento', () => {
  it('devolve o lançamento com a categoria', async () => {
    const adulto = await criarUsuario({ papel: 'usuario' })
    const criado = await criarLancamento(adulto, await entradaValida())
    const lido = await obterLancamento(adulto, criado.id)
    expect(lido).toMatchObject({ id: criado.id, valorCentavos: 123456, data: '2026-10-27' })
    expect(lido.categoria.nome).toBe('Mercado')
  })

  it('o adulto lê o lançamento que o responsável criou', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario({ papel: 'usuario' })
    const criado = await criarLancamento(admin, await entradaValida())
    expect((await obterLancamento(adulto, criado.id)).id).toBe(criado.id)
  })

  it('id inexistente dá 404', async () => {
    const admin = await criarAdmin()
    expect((await erroDe(obterLancamento(admin, 'nao-existe'))).status).toBe(404)
  })
})
