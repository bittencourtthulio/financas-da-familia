/**
 * A exportação dos dados da família (FT-07, PR-09, PR-34): um documento JSON
 * versionado, com tudo o que a família guarda, em centavos inteiros (PR-02), e
 * NUNCA com hash de senha, token, segredo nem dado interno de sessão. O teste
 * varre o arquivo gerado procurando esses campos e os valores reais.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { exportarDadosDaFamilia } from '@/servicos/privacidade'
import { cadastrarFilho, criarLoginDoFilho, editarFilho } from '@/servicos/filhos'
import { registrarMovimento } from '@/servicos/mesada'
import { criarCategoria, criarLancamento } from '@/servicos/lancamentos'
import { camposProibidosEm, nomeDoArquivoDeExportacao, VERSAO_DO_FORMATO } from '@/lib/privacidade'
import { ErroDeAplicacao } from '@/lib/erros'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

const AGORA = new Date('2026-10-28T15:00:00.000Z')

async function famíliaCompleta() {
  const admin = await criarAdmin()
  const adulto = await criarUsuario({ papel: 'usuario' })
  const despesa = await criarCategoria(admin, { nome: 'Mercado', tipo: 'despesa' })
  const receita = await criarCategoria(admin, { nome: 'Salário', tipo: 'receita' })
  await criarLancamento(admin, { tipo: 'despesa', valor: '1.234,56', data: '2026-10-05', categoriaId: despesa.id, descricao: 'Feira' })
  await criarLancamento(adulto, { tipo: 'receita', valor: '5.000,00', data: '2026-10-01', categoriaId: receita.id })
  const ana = await cadastrarFilho(admin, { nome: 'Ana', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' })
  const pedro = await cadastrarFilho(admin, { nome: 'Pedro', valor: '120,00', periodicidade: 'mensal' })
  await criarLoginDoFilho(admin, ana.id, { email: 'ana@exemplo.local', senha: 'senha-do-filho-1' })
  await registrarMovimento(admin, ana.id, { tipo: 'credito', valor: '100,00', data: '2026-10-05', descricao: 'Mesada' })
  await registrarMovimento(admin, ana.id, { tipo: 'gasto', valor: '12,30', data: '2026-10-06', descricao: 'Sorvete' })
  await registrarMovimento(admin, pedro.id, { tipo: 'gasto', valor: '0,10', data: '2026-10-06' })
  return { admin, adulto, ana, pedro }
}

describe('o documento exportado', () => {
  it('traz a versão do formato, o instante e as seis listas com o que foi gravado', async () => {
    const { admin, ana, pedro } = await famíliaCompleta()
    const { conteudo } = await exportarDadosDaFamilia(admin, AGORA)
    const doc = JSON.parse(conteudo)

    expect(doc.versao_do_formato).toBe(VERSAO_DO_FORMATO)
    expect(VERSAO_DO_FORMATO).toBe(1)
    expect(doc.gerado_em).toBe('2026-10-28T15:00:00.000Z')
    expect(doc.moeda).toBe('BRL')
    expect(doc.usuarios).toHaveLength(3) // admin, adulto e o login da Ana
    expect(doc.categorias).toHaveLength(2)
    expect(doc.lancamentos).toHaveLength(2)
    expect(doc.filhos).toHaveLength(2)
    expect(doc.movimentos_de_mesada).toHaveLength(3)
    expect(doc.atividade.length).toBeGreaterThan(5)

    const lancamento = doc.lancamentos.find((l: { descricao: string }) => l.descricao === 'Feira')
    expect(lancamento).toMatchObject({ tipo: 'despesa', valor_centavos: 123456, data: '2026-10-05' })
    const filhaAna = doc.filhos.find((f: { id: string }) => f.id === ana.id)
    expect(filhaAna).toMatchObject({
      nome: 'Ana',
      nascimento: '2015-03-20',
      mesada_combinada_centavos: 5000,
      periodicidade: 'semanal',
      saldo_centavos: 8770,
    })
    expect(doc.filhos.find((f: { id: string }) => f.id === pedro.id)).toMatchObject({
      nome: 'Pedro',
      nascimento: null,
      usuario_id: null,
      saldo_centavos: -10,
    })
    expect(filhaAna.usuario_id).toEqual(expect.any(String))
    expect(doc.movimentos_de_mesada.filter((m: { filho_id: string }) => m.filho_id === ana.id)).toHaveLength(2)
  })

  it('cada registro tem exatamente os campos documentados, em nomes estáveis', async () => {
    const { admin } = await famíliaCompleta()
    const doc = JSON.parse((await exportarDadosDaFamilia(admin, AGORA)).conteudo)
    const chaves = (o: object) => Object.keys(o).sort()

    expect(chaves(doc)).toEqual(
      ['atividade', 'categorias', 'filhos', 'gerado_em', 'lancamentos', 'moeda', 'movimentos_de_mesada', 'recorrencias', 'sistema', 'usuarios', 'versao_do_formato'].sort(),
    )
    expect(chaves(doc.usuarios[0])).toEqual(['ativo', 'avatar', 'criado_em', 'email', 'id', 'nome', 'papel'])
    expect(chaves(doc.categorias[0])).toEqual(['criado_em', 'id', 'nome', 'tipo'])
    expect(chaves(doc.lancamentos[0])).toEqual(
      ['atualizado_em', 'categoria_id', 'criado_em', 'data', 'descricao', 'id', 'pago', 'pessoa_id', 'recorrencia_id', 'tipo', 'valor_centavos'],
    )
    expect(chaves(doc.filhos[0])).toEqual(
      ['atualizado_em', 'avatar', 'criado_em', 'id', 'mesada_combinada_centavos', 'nascimento', 'nome', 'periodicidade', 'saldo_centavos', 'usuario_id'],
    )
    expect(chaves(doc.movimentos_de_mesada[0])).toEqual(
      ['atualizado_em', 'criado_em', 'data', 'descricao', 'filho_id', 'id', 'tipo', 'valor_centavos'],
    )
    expect(chaves(doc.atividade[0])).toEqual(
      ['acao', 'criado_em', 'detalhe', 'entidade', 'entidade_id', 'id', 'ator_id', 'ator_nome'].sort(),
    )
  })

  it('todo valor é inteiro em centavos, toda data civil é AAAA-MM-DD e todo instante é ISO (PR-02)', async () => {
    const { admin } = await famíliaCompleta()
    const doc = JSON.parse((await exportarDadosDaFamilia(admin, AGORA)).conteudo)
    for (const l of doc.lancamentos) {
      expect(Number.isInteger(l.valor_centavos)).toBe(true)
      expect(l.data).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(l.criado_em).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    }
    for (const m of doc.movimentos_de_mesada) {
      expect(Number.isInteger(m.valor_centavos)).toBe(true)
      expect(m.data).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
    for (const f of doc.filhos) {
      expect(Number.isInteger(f.mesada_combinada_centavos)).toBe(true)
      expect(Number.isInteger(f.saldo_centavos)).toBe(true)
    }
    for (const a of doc.atividade) expect(a.criado_em).toMatch(/Z$/)
  })

  it('a trilha entra como foi gravada, com o detalhe como objeto', async () => {
    const { admin, ana } = await famíliaCompleta()
    await editarFilho(admin, ana.id, { nome: 'Ana', nascimento: '2015-03-20', valor: '60,00', periodicidade: 'semanal' })
    const doc = JSON.parse((await exportarDadosDaFamilia(admin, AGORA)).conteudo)
    const alterada = doc.atividade.find((a: { acao: string }) => a.acao === 'filho.alterado')
    expect(alterada.detalhe).toEqual({ alvoNome: 'Ana', campos: 'mesada' })
    expect(alterada.ator_nome).toBe(admin.nome)
    const ordem = doc.atividade.map((a: { criado_em: string }) => a.criado_em)
    expect([...ordem].sort()).toEqual(ordem)
  })

  it('uma família vazia exporta listas vazias, não falha', async () => {
    const admin = await criarAdmin()
    const doc = JSON.parse((await exportarDadosDaFamilia(admin, AGORA)).conteudo)
    expect(doc.usuarios).toHaveLength(1)
    for (const lista of ['categorias', 'lancamentos', 'filhos', 'movimentos_de_mesada', 'atividade']) {
      expect(doc[lista], lista).toEqual([])
    }
  })

  it('o texto é JSON em UTF-8 e preserva acentos', async () => {
    const admin = await criarAdmin()
    await cadastrarFilho(admin, { nome: 'João Ávila', valor: '10,00', periodicidade: 'mensal' })
    const { conteudo } = await exportarDadosDaFamilia(admin, AGORA)
    expect(conteudo).toContain('João Ávila')
    expect(Buffer.from(conteudo, 'utf8').toString('utf8')).toBe(conteudo)
    expect(() => JSON.parse(conteudo)).not.toThrow()
  })
})

describe('nunca exporta segredo nem dado de sessão', () => {
  it('o texto do arquivo não tem os campos proibidos nem os valores reais do hash e do segredo', async () => {
    const { admin } = await famíliaCompleta()
    const hashes = (await prisma.usuario.findMany({ select: { senhaHash: true } })).map((u) => u.senhaHash)
    expect(hashes.length).toBe(3)
    const { conteudo } = await exportarDadosDaFamilia(admin, AGORA)
    const doc = JSON.parse(conteudo)

    expect(camposProibidosEm(doc)).toEqual([])
    for (const hash of hashes) expect(conteudo).not.toContain(hash)
    expect(conteudo).not.toMatch(/\$2[abxy]?\$\d{2}\$/)
    expect(conteudo).not.toContain(process.env.JWT_SECRET as string)
    expect(conteudo).not.toMatch(/eyJ[\w-]+\.[\w-]+\./)
    for (const campo of ['senhaHash', 'senha_hash', 'sessoesValidasDesde', 'sessoes_validas_desde', 'jwt', 'segredo', 'tentativas']) {
      expect(conteudo, campo).not.toContain(campo)
    }
    for (const usuario of doc.usuarios) {
      expect(Object.keys(usuario).sort()).toEqual(['ativo', 'avatar', 'criado_em', 'email', 'id', 'nome', 'papel'])
    }
  })

  it('a varredura de campos proibidos discrimina: acha o hash escondido em qualquer nível', () => {
    expect(camposProibidosEm({ usuarios: [{ id: 'a', nome: 'x' }] })).toEqual([])
    expect(camposProibidosEm({ usuarios: [{ id: 'a', senhaHash: '$2b$10$x' }] })).toEqual(['usuarios.0.senhaHash'])
    expect(camposProibidosEm({ a: { b: [{ sessoesValidasDesde: 1 }] } })).toEqual(['a.b.0.sessoesValidasDesde'])
    expect(camposProibidosEm({ x: { Token: 'abc' }, y: { contadorDeTentativas: 3 } }).sort()).toEqual(['x.Token', 'y.contadorDeTentativas'])
    expect(camposProibidosEm({ senha_hash: 1, jwt: 2, secret: 3, password: 4 }).sort()).toEqual(['jwt', 'password', 'secret', 'senha_hash'])
  })

  it('a exportação não lê o registro inteiro do usuário: a consulta lista os campos um a um', () => {
    const fonte = readFileSync(path.join(process.cwd(), 'src/servicos/privacidade.ts'), 'utf8')
    expect(fonte).not.toMatch(/senhaHash|sessoesValidasDesde/)
    expect(fonte).toMatch(/usuario\.findMany\(\{\s*select:/)
  })
})

describe('a trilha da exportação (PR-10)', () => {
  it('grava familia.exportada com o ator e um id opaco, sem conteúdo', async () => {
    const { admin } = await famíliaCompleta()
    const antes = await prisma.atividade.count()
    await exportarDadosDaFamilia(admin, AGORA)
    expect(await prisma.atividade.count()).toBe(antes + 1)
    const rastro = await prisma.atividade.findFirstOrThrow({ where: { acao: 'familia.exportada' } })
    expect(rastro).toMatchObject({ atorId: admin.id, atorNome: admin.nome, entidade: 'exportacao' })
    expect(rastro.entidadeId).toMatch(/^[0-9a-f-]{36}$/)
    expect(JSON.parse(rastro.detalhe as string)).toEqual({ versaoDoFormato: 1 })
  })

  it('o arquivo não leva o próprio rastro, e a segunda exportação leva o da primeira', async () => {
    const admin = await criarAdmin()
    const primeira = JSON.parse((await exportarDadosDaFamilia(admin, AGORA)).conteudo)
    expect(primeira.atividade.filter((a: { acao: string }) => a.acao === 'familia.exportada')).toHaveLength(0)
    const segunda = JSON.parse((await exportarDadosDaFamilia(admin, AGORA)).conteudo)
    expect(segunda.atividade.filter((a: { acao: string }) => a.acao === 'familia.exportada')).toHaveLength(1)
  })

  it('se o rastro falha, não há arquivo', async () => {
    const admin = await criarAdmin()
    let erro: unknown
    let resultado: unknown
    try {
      resultado = await exportarDadosDaFamilia({ ...admin, id: '' }, AGORA)
    } catch (e) {
      erro = e
    }
    expect(resultado).toBeUndefined()
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(await prisma.atividade.count()).toBe(0)
  })
})

describe('o nome do arquivo', () => {
  it('leva o dia de São Paulo, não o de UTC', () => {
    expect(nomeDoArquivoDeExportacao(new Date('2026-10-28T15:00:00Z'))).toBe('dados-da-familia-2026-10-28.json')
    expect(nomeDoArquivoDeExportacao(new Date('2026-10-29T01:30:00Z'))).toBe('dados-da-familia-2026-10-28.json')
    expect(nomeDoArquivoDeExportacao(new Date('2026-10-28T02:30:00Z'))).toBe('dados-da-familia-2026-10-27.json')
  })

  it('o serviço devolve o nome pronto para o cabeçalho', async () => {
    const admin = await criarAdmin()
    const r = await exportarDadosDaFamilia(admin, AGORA)
    expect(r.nomeDoArquivo).toBe('dados-da-familia-2026-10-28.json')
  })
})

describe('volume razoável', () => {
  it('exporta 5.000 lançamentos e 3.000 movimentos sem estourar o prazo', async () => {
    const admin = await criarAdmin()
    const categoria = await criarCategoria(admin, { nome: 'Volume', tipo: 'despesa' })
    const filho = await cadastrarFilho(admin, { nome: 'Volume', valor: '1,00', periodicidade: 'mensal' })
    await prisma.lancamento.createMany({
      data: Array.from({ length: 5000 }, (_, i) => ({
        tipo: 'despesa',
        valorCentavos: (i % 997) + 1,
        data: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        descricao: `Compra número ${i} com acentuação`,
        categoriaId: categoria.id,
      })),
    })
    await prisma.movimentoDeMesada.createMany({
      data: Array.from({ length: 3000 }, (_, i) => ({
        filhoId: filho.id,
        tipo: i % 3 === 0 ? 'credito' : 'gasto',
        valorCentavos: 1,
        data: '2026-10-05',
      })),
    })

    const inicio = Date.now()
    const { conteudo } = await exportarDadosDaFamilia(admin, AGORA)
    const duracao = Date.now() - inicio

    const doc = JSON.parse(conteudo)
    expect(doc.lancamentos).toHaveLength(5000)
    expect(doc.movimentos_de_mesada).toHaveLength(3000)
    // 1.000 créditos e 2.000 gastos de 1 centavo.
    expect(doc.filhos[0].saldo_centavos).toBe(-1000)
    expect(duracao).toBeLessThan(10_000)
  })
})

describe('PR-02 no serviço de privacidade', () => {
  it('não usa ponto flutuante nem conversão numérica', () => {
    const fonte = readFileSync(path.join(process.cwd(), 'src/servicos/privacidade.ts'), 'utf8')
    for (const proibido of ['parseFloat', 'Number(', 'toFixed', 'Math.round', 'Float', 'Decimal']) {
      expect(fonte, proibido).not.toContain(proibido)
    }
  })
})
