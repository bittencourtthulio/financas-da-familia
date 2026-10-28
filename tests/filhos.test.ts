/**
 * Cadastro e edição do filho pelo responsável (PR-02, PR-09, PR-10, PR-25,
 * PR-30): validação no servidor, valor em centavos inteiros lido do formato
 * brasileiro, rastro na mesma transação sem valor, e-mail nem nascimento.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { cadastrarFilho, editarFilho, listarFilhos, obterFilho } from '@/servicos/filhos'
import { ErroDeAplicacao } from '@/lib/erros'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

const VALIDA = { nome: 'Ana', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' }

const status = async (promessa: Promise<unknown>) => {
  const erro = await promessa.then(
    () => null,
    (e) => e,
  )
  expect(erro).toBeInstanceOf(ErroDeAplicacao)
  return (erro as ErroDeAplicacao).status
}

describe('cadastrarFilho', () => {
  it('grava nome, nascimento, mesada em centavos e periodicidade, sem login', async () => {
    const admin = await criarAdmin()
    const filho = await cadastrarFilho(admin, VALIDA)
    expect(filho).toMatchObject({
      nome: 'Ana',
      nascimento: '2015-03-20',
      mesadaCentavos: 5000,
      periodicidade: 'semanal',
      login: null,
    })
    expect(await prisma.filho.count()).toBe(1)
  })

  it('a data de nascimento é opcional: vazio, ausente e nulo viram nulo', async () => {
    const admin = await criarAdmin()
    for (const nascimento of ['', undefined, null, '   ']) {
      const filho = await cadastrarFilho(admin, { ...VALIDA, nome: `F${String(nascimento)}`, nascimento })
      expect(filho.nascimento).toBeNull()
    }
  })

  it.each([
    ['50,00', 5000],
    ['1.234,56', 123456],
    ['R$ 12,5', 1250],
    ['0,01', 1],
    ['1000000', 100_000_000],
    ['0,10', 10],
  ])('o valor "%s" vira %i centavos inteiros', async (valor, centavos) => {
    const admin = await criarAdmin()
    const filho = await cadastrarFilho(admin, { ...VALIDA, valor })
    expect(filho.mesadaCentavos).toBe(centavos)
    expect(Number.isInteger(filho.mesadaCentavos)).toBe(true)
  })

  it.each(['', '0', '0,00', '-5,00', '12.5', 'abc', '1e3', '1.000.000,01', '10,999', undefined, 42, null])(
    'o valor %j é recusado com 422 e nada é gravado',
    async (valor) => {
      const admin = await criarAdmin()
      expect(await status(cadastrarFilho(admin, { ...VALIDA, valor }))).toBe(422)
      expect(await prisma.filho.count()).toBe(0)
      expect(await prisma.atividade.count()).toBe(0)
    },
  )

  it.each(['', 'diaria', 'Semanal', 'quinzenal', undefined, 7, null])(
    'a periodicidade %j é recusada com 422',
    async (periodicidade) => {
      const admin = await criarAdmin()
      expect(await status(cadastrarFilho(admin, { ...VALIDA, periodicidade }))).toBe(422)
      expect(await prisma.filho.count()).toBe(0)
    },
  )

  it('aceita as duas periodicidades', async () => {
    const admin = await criarAdmin()
    expect((await cadastrarFilho(admin, { ...VALIDA, nome: 'A', periodicidade: 'semanal' })).periodicidade).toBe('semanal')
    expect((await cadastrarFilho(admin, { ...VALIDA, nome: 'B', periodicidade: 'mensal' })).periodicidade).toBe('mensal')
  })

  it.each([undefined, null, '', '   ', 'x'.repeat(81), 12])('o nome %j é recusado com 422', async (nome) => {
    const admin = await criarAdmin()
    expect(await status(cadastrarFilho(admin, { ...VALIDA, nome }))).toBe(422)
    expect(await prisma.filho.count()).toBe(0)
  })

  it('o nome é aparado e aceita 80 caracteres', async () => {
    const admin = await criarAdmin()
    expect((await cadastrarFilho(admin, { ...VALIDA, nome: '  Ana  ' })).nome).toBe('Ana')
    expect((await cadastrarFilho(admin, { ...VALIDA, nome: 'x'.repeat(80) })).nome).toHaveLength(80)
  })

  it.each(['2026-02-30', '15/03/2015', '2015-3-2', 'abc', '1999-12-31', '2101-01-01', 20150320])(
    'o nascimento %j é recusado com 422',
    async (nascimento) => {
      const admin = await criarAdmin()
      expect(await status(cadastrarFilho(admin, { ...VALIDA, nascimento }))).toBe(422)
      expect(await prisma.filho.count()).toBe(0)
    },
  )

  it('nascimento futuro é recusado, o de hoje em São Paulo vale (relógio injetado)', async () => {
    const admin = await criarAdmin()
    // 29/10 02:30 UTC ainda é 28/10 em São Paulo.
    const agora = new Date('2026-10-29T02:30:00Z')
    expect(await status(cadastrarFilho(admin, { ...VALIDA, nascimento: '2026-10-29' }, agora))).toBe(422)
    const filho = await cadastrarFilho(admin, { ...VALIDA, nascimento: '2026-10-28' }, agora)
    expect(filho.nascimento).toBe('2026-10-28')
  })

  it('PR-09: campos que não existem para o filho são ignorados e não gravados', async () => {
    const admin = await criarAdmin()
    const filho = await cadastrarFilho(admin, {
      ...VALIDA,
      cpf: '123.456.789-09',
      telefone: '11999999999',
      endereco: 'Rua A, 1',
      foto: 'x.png',
    })
    const texto = JSON.stringify(filho) + JSON.stringify(await prisma.filho.findMany())
    for (const proibido of ['123.456.789-09', '11999999999', 'Rua A', 'x.png']) {
      expect(texto).not.toContain(proibido)
    }
  })

  it('grava o rastro filho.cadastrado com o nome e nunca o valor, a periodicidade nem o nascimento', async () => {
    const admin = await criarAdmin()
    const filho = await cadastrarFilho(admin, VALIDA)
    const rastros = await prisma.atividade.findMany()
    expect(rastros).toHaveLength(1)
    expect(rastros[0]).toMatchObject({
      atorId: admin.id,
      atorNome: admin.nome,
      acao: 'filho.cadastrado',
      entidade: 'filho',
      entidadeId: filho.id,
    })
    expect(JSON.parse(rastros[0]?.detalhe ?? '{}')).toEqual({ alvoNome: 'Ana' })
    const linha = JSON.stringify(rastros[0])
    for (const proibido of ['5000', '50,00', '2015', '03-20', 'semanal']) {
      expect(linha).not.toContain(proibido)
    }
  })

  it('o rastro e o filho caem juntos: se o rastro falha, o filho não fica', async () => {
    const admin = await criarAdmin()
    // Um ator sem nome faz o registro falhar dentro da transação.
    await expect(cadastrarFilho({ ...admin, nome: '' }, VALIDA)).rejects.toThrow()
    expect(await prisma.filho.count()).toBe(0)
  })

  it.each(['usuario', 'filho', '', 'visitante'])('o papel "%s" recebe 403 e nada é gravado', async (papel) => {
    const alguem = { ...(await criarUsuario()), papel }
    expect(await status(cadastrarFilho(alguem, VALIDA))).toBe(403)
    expect(await prisma.filho.count()).toBe(0)
    expect(await prisma.atividade.count()).toBe(0)
  })
})

describe('listarFilhos e obterFilho', () => {
  it('lista na ordem do cadastro, vazia quando não há', async () => {
    const admin = await criarAdmin()
    expect(await listarFilhos(admin)).toEqual([])
    await cadastrarFilho(admin, { ...VALIDA, nome: 'Ana' })
    await cadastrarFilho(admin, { ...VALIDA, nome: 'Bia' })
    expect((await listarFilhos(admin)).map((f) => f.nome)).toEqual(['Ana', 'Bia'])
  })

  it('obterFilho devolve o filho e 404 para id inexistente', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, VALIDA)
    expect((await obterFilho(admin, ana.id)).nome).toBe('Ana')
    expect(await status(obterFilho(admin, 'nao-existe'))).toBe(404)
  })

  it.each(['usuario', 'filho', '', 'visitante'])('o papel "%s" não lista nem lê (403)', async (papel) => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, VALIDA)
    const alguem = { ...(await criarUsuario()), papel }
    expect(await status(listarFilhos(alguem))).toBe(403)
    expect(await status(obterFilho(alguem, ana.id))).toBe(403)
  })
})

describe('editarFilho', () => {
  it('muda os campos e grava filho.alterado só com os nomes dos campos que mudaram', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, VALIDA)
    const editada = await editarFilho(admin, ana.id, {
      nome: 'Ana Clara',
      nascimento: '2015-03-20',
      valor: '75,50',
      periodicidade: 'mensal',
    })
    expect(editada).toMatchObject({ nome: 'Ana Clara', mesadaCentavos: 7550, periodicidade: 'mensal', nascimento: '2015-03-20' })

    const rastros = await prisma.atividade.findMany({ where: { acao: 'filho.alterado' } })
    expect(rastros).toHaveLength(1)
    expect(rastros[0]).toMatchObject({ atorId: admin.id, entidade: 'filho', entidadeId: ana.id })
    expect(JSON.parse(rastros[0]?.detalhe ?? '{}')).toEqual({ alvoNome: 'Ana Clara', campos: 'nome,mesada,periodicidade' })
    const linha = JSON.stringify(rastros[0])
    for (const proibido of ['7550', '75,50', '5000', 'mensal', '2015']) expect(linha).not.toContain(proibido)
  })

  it('reenviar os mesmos dados não é mudança e não grava rastro', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, VALIDA)
    await editarFilho(admin, ana.id, VALIDA)
    expect(await prisma.atividade.count({ where: { acao: 'filho.alterado' } })).toBe(0)
  })

  it('mudar só o nascimento, ou remover o nascimento, conta como mudança do campo', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, VALIDA)
    await editarFilho(admin, ana.id, { ...VALIDA, nascimento: '' })
    const rastro = await prisma.atividade.findFirstOrThrow({ where: { acao: 'filho.alterado' } })
    expect(JSON.parse(rastro.detalhe ?? '{}').campos).toBe('nascimento')
    expect((await obterFilho(admin, ana.id)).nascimento).toBeNull()
  })

  it('entrada inválida devolve 422 e não muda nada', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, VALIDA)
    expect(await status(editarFilho(admin, ana.id, { ...VALIDA, valor: 'abc' }))).toBe(422)
    expect(await status(editarFilho(admin, ana.id, { ...VALIDA, nome: '' }))).toBe(422)
    expect((await obterFilho(admin, ana.id)).mesadaCentavos).toBe(5000)
  })

  it('id inexistente devolve 404', async () => {
    const admin = await criarAdmin()
    expect(await status(editarFilho(admin, 'nao-existe', VALIDA))).toBe(404)
  })

  it.each(['usuario', 'filho', '', 'visitante'])('o papel "%s" recebe 403 e nada muda', async (papel) => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, VALIDA)
    const alguem = { ...(await criarUsuario()), papel }
    expect(await status(editarFilho(alguem, ana.id, { ...VALIDA, nome: 'Invasor' }))).toBe(403)
    expect((await obterFilho(admin, ana.id)).nome).toBe('Ana')
  })

  it('editar a mesada de um filho com login preserva o vínculo', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, VALIDA)
    const usuario = await criarUsuario({ papel: 'filho' })
    await prisma.filho.update({ where: { id: ana.id }, data: { usuarioId: usuario.id } })
    await editarFilho(admin, ana.id, { ...VALIDA, valor: '60,00' })
    expect((await prisma.filho.findUniqueOrThrow({ where: { id: ana.id } })).usuarioId).toBe(usuario.id)
  })
})

describe('PR-02 no serviço de filhos', () => {
  it('o arquivo não usa ponto flutuante nem conversão numérica de valor', () => {
    const codigo = readFileSync(path.join(process.cwd(), 'src/servicos/filhos.ts'), 'utf8').replace(/\/\/.*$/gm, '')
    for (const proibido of ['parseFloat', 'Number(', 'toFixed', 'Math.round', 'Float', 'Decimal']) {
      expect(codigo, proibido).not.toContain(proibido)
    }
  })
})
