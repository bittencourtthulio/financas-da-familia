// Dados de demonstração (PR-04). Contas fictícias para uso local e para o
// roteiro do QA. Usuários e a trilha de atividade deles (FT-02), categorias e
// lançamentos de três meses (FT-03 e FT-04), dois filhos com login (FT-05) e os
// movimentos de mesada deles (FT-06): Ana com saldo positivo e Pedro com saldo
// negativo, para mostrar os dois estados.
import type { PrismaClient } from '../src/gerado/prisma/client.js'
import { hashDeSenha } from '../src/lib/senha.js'
import { hojeEmSaoPaulo, mesAnterior, mesDaData } from '../src/lib/datas.js'

/** A família da demonstração: todas as contas e dados fictícios são dela. */
export const FAMILIA_DA_DEMONSTRACAO = 'demonstracao-familia'

export const DEMONSTRACAO = [
  {
    nome: 'Responsável de demonstração',
    email: 'responsavel@exemplo.local',
    senha: 'demo1234',
    papel: 'admin',
  },
  {
    nome: 'Adulto de demonstração',
    email: 'adulto@exemplo.local',
    senha: 'demo1234',
    papel: 'usuario',
  },
] as const

// Dois filhos fictícios, ambos com login, para demonstrar o isolamento entre
// irmãos (FT-05). Mesada em centavos inteiros (PR-02); só os campos que a PR-09
// permite. Credenciais de demonstração, conhecidas: nunca em produção.
export const DEMONSTRACAO_FILHOS = [
  {
    slug: 'ana',
    nome: 'Ana',
    nascimento: '2015-03-20',
    mesadaCentavos: 5000,
    periodicidade: 'semanal',
    email: 'ana@exemplo.local',
    senha: 'demo1234',
  },
  {
    slug: 'pedro',
    nome: 'Pedro',
    nascimento: '2011-09-30',
    mesadaCentavos: 12000,
    periodicidade: 'mensal',
    email: 'pedro@exemplo.local',
    senha: 'demo1234',
  },
] as const

/**
 * Cria (sem sobrescrever) as contas de demonstração. Nunca roda em produção:
 * as contas têm senha conhecida.
 */
export async function semearDemonstracao(
  prisma: Pick<PrismaClient, 'familia' | 'usuario' | 'atividade' | 'categoria' | 'lancamento' | 'filho' | 'movimentoDeMesada'>,
  agora: Date = new Date(),
): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'A seed de demonstração não roda em produção. ' +
        'Ela cria contas com senha conhecida.',
    )
  }

  await prisma.familia.upsert({
    where: { id: FAMILIA_DA_DEMONSTRACAO },
    update: {},
    create: { id: FAMILIA_DA_DEMONSTRACAO, nome: 'Família de demonstração' },
  })

  for (const conta of DEMONSTRACAO) {
    await prisma.usuario.upsert({
      where: { email: conta.email },
      update: {},
      create: {
        nome: conta.nome,
        email: conta.email,
        senhaHash: await hashDeSenha(conta.senha),
        papel: conta.papel,
        familiaId: FAMILIA_DA_DEMONSTRACAO,
      },
    })
  }
  await semearAtividade(prisma)
  await semearLancamentos(prisma, agora)
  await semearFilhos(prisma)
  await semearMesada(prisma, agora)
}

const DIA = 24 * 60 * 60 * 1000

/**
 * Duas entradas fictícias para a tela Atividade não nascer vazia: o
 * responsável criou o adulto como responsável e depois o rebaixou a adulto,
 * o que coincide com o estado das contas semeadas. Id fixo, então rodar de
 * novo não duplica.
 */
async function semearAtividade(
  prisma: Pick<PrismaClient, 'usuario' | 'atividade'>,
): Promise<void> {
  const responsavel = await prisma.usuario.findUniqueOrThrow({
    where: { email: DEMONSTRACAO[0].email },
  })
  const adulto = await prisma.usuario.findUniqueOrThrow({
    where: { email: DEMONSTRACAO[1].email },
  })
  const agora = Date.now()
  const comum = {
    atorId: responsavel.id,
    atorNome: responsavel.nome,
    entidade: 'usuario',
    entidadeId: adulto.id,
    familiaId: FAMILIA_DA_DEMONSTRACAO,
  }

  await prisma.atividade.upsert({
    where: { id: 'demonstracao-atividade-1' },
    update: {},
    create: {
      id: 'demonstracao-atividade-1',
      ...comum,
      acao: 'usuario.criado',
      detalhe: JSON.stringify({ alvoNome: adulto.nome, papel: 'admin' }),
      criadoEm: new Date(agora - 5 * DIA),
    },
  })
  await prisma.atividade.upsert({
    where: { id: 'demonstracao-atividade-2' },
    update: {},
    create: {
      id: 'demonstracao-atividade-2',
      ...comum,
      acao: 'usuario.papel_alterado',
      detalhe: JSON.stringify({ alvoNome: adulto.nome, de: 'admin', para: 'usuario' }),
      criadoEm: new Date(agora - 4 * DIA),
    },
  })
}

// As categorias são dado de demonstração, não regra do sistema: a família cria
// as suas (PR-27). Id fixo, para a seed ser idempotente.
const CATEGORIAS_DA_DEMONSTRACAO = [
  { slug: 'mercado', nome: 'Mercado', tipo: 'despesa' },
  { slug: 'moradia', nome: 'Moradia', tipo: 'despesa' },
  { slug: 'transporte', nome: 'Transporte', tipo: 'despesa' },
  { slug: 'saude', nome: 'Saúde', tipo: 'despesa' },
  { slug: 'lazer', nome: 'Lazer', tipo: 'despesa' },
  { slug: 'salario', nome: 'Salário', tipo: 'receita' },
  { slug: 'outras-receitas', nome: 'Outras receitas', tipo: 'receita' },
] as const

// Valores em centavos inteiros (PR-02). `meses` é quantos meses antes do
// corrente: 0 é o mês corrente, 1 o anterior e 2 o retrasado (FT-04, para o
// resumo ter o que mostrar em mais de uma categoria, em mais de um mês e com
// um mês de saldo negativo). Os seis primeiros são da FT-03 e não mudam.
const LANCAMENTOS_DA_DEMONSTRACAO = [
  { n: 1, categoria: 'salario', tipo: 'receita', valorCentavos: 520000, dia: 5, descricao: 'Salário do mês' },
  { n: 2, categoria: 'outras-receitas', tipo: 'receita', valorCentavos: 35000, dia: 12, descricao: 'Venda de móveis usados' },
  { n: 3, categoria: 'moradia', tipo: 'despesa', valorCentavos: 180000, dia: 6, descricao: 'Aluguel' },
  { n: 4, categoria: 'mercado', tipo: 'despesa', valorCentavos: 64235, dia: 9, descricao: 'Compras da semana' },
  { n: 5, categoria: 'transporte', tipo: 'despesa', valorCentavos: 12000, dia: 15, descricao: 'Combustível' },
  { n: 6, categoria: 'lazer', tipo: 'despesa', valorCentavos: 8990, dia: 18, descricao: 'Cinema em família' },
  { n: 7, categoria: 'mercado', tipo: 'despesa', valorCentavos: 31250, dia: 21, descricao: 'Feira do mês' },
  { n: 8, categoria: 'lazer', tipo: 'despesa', valorCentavos: 6000, dia: 25, descricao: 'Passeio no parque' },
  { n: 9, categoria: 'salario', tipo: 'receita', valorCentavos: 520000, dia: 5, descricao: 'Salário do mês anterior', meses: 1 },
  { n: 10, categoria: 'moradia', tipo: 'despesa', valorCentavos: 180000, dia: 6, descricao: 'Aluguel do mês anterior', meses: 1 },
  { n: 11, categoria: 'mercado', tipo: 'despesa', valorCentavos: 71890, dia: 10, descricao: 'Compras do mês anterior', meses: 1 },
  { n: 12, categoria: 'saude', tipo: 'despesa', valorCentavos: 23500, dia: 14, descricao: 'Farmácia', meses: 1 },
  { n: 13, categoria: 'transporte', tipo: 'despesa', valorCentavos: 9800, dia: 20, descricao: 'Combustível do mês anterior', meses: 1 },
  { n: 14, categoria: 'outras-receitas', tipo: 'receita', valorCentavos: 20000, dia: 8, descricao: 'Venda de bicicleta', meses: 2 },
  { n: 15, categoria: 'saude', tipo: 'despesa', valorCentavos: 85000, dia: 12, descricao: 'Consulta e exames', meses: 2 },
] as ReadonlyArray<{
  n: number
  categoria: string
  tipo: string
  valorCentavos: number
  dia: number
  descricao: string
  meses?: number
}>

/**
 * Sete categorias e quinze lançamentos fictícios: oito no mês corrente em São
 * Paulo, cinco no anterior e dois no retrasado.
 * `upsert` sem atualizar: rodar de novo não duplica nem desfaz o que a
 * família editou na demonstração.
 */
async function semearLancamentos(
  prisma: Pick<PrismaClient, 'categoria' | 'lancamento'>,
  agora: Date,
): Promise<void> {
  const mesCorrente = mesDaData(hojeEmSaoPaulo(agora))
  const mesAtras = (meses: number) => {
    let mes = mesCorrente
    for (let i = 0; i < meses; i += 1) mes = mesAnterior(mes)
    return mes
  }

  for (const c of CATEGORIAS_DA_DEMONSTRACAO) {
    await prisma.categoria.upsert({
      where: { id: `demonstracao-categoria-${c.slug}` },
      update: {},
      create: { id: `demonstracao-categoria-${c.slug}`, nome: c.nome, tipo: c.tipo, familiaId: FAMILIA_DA_DEMONSTRACAO },
    })
  }

  for (const l of LANCAMENTOS_DA_DEMONSTRACAO) {
    await prisma.lancamento.upsert({
      where: { id: `demonstracao-lancamento-${l.n}` },
      update: {},
      create: {
        id: `demonstracao-lancamento-${l.n}`,
        tipo: l.tipo,
        valorCentavos: l.valorCentavos,
        data: `${mesAtras(l.meses ?? 0)}-${String(l.dia).padStart(2, '0')}`,
        descricao: l.descricao,
        categoriaId: `demonstracao-categoria-${l.categoria}`,
        familiaId: FAMILIA_DA_DEMONSTRACAO,
      },
    })
  }
}

/**
 * Dois filhos com login de papel `filho`. `upsert` sem atualizar, com id fixo:
 * rodar de novo não duplica nem desfaz o que o responsável editou.
 */
async function semearFilhos(prisma: Pick<PrismaClient, 'usuario' | 'filho'>): Promise<void> {
  for (const f of DEMONSTRACAO_FILHOS) {
    const usuario = await prisma.usuario.upsert({
      where: { email: f.email },
      update: {},
      create: {
        nome: f.nome,
        email: f.email,
        senhaHash: await hashDeSenha(f.senha),
        papel: 'filho',
        familiaId: FAMILIA_DA_DEMONSTRACAO,
      },
    })
    await prisma.filho.upsert({
      where: { id: `demonstracao-filho-${f.slug}` },
      update: {},
      create: {
        id: `demonstracao-filho-${f.slug}`,
        familiaId: FAMILIA_DA_DEMONSTRACAO,
        nome: f.nome,
        nascimento: f.nascimento,
        mesadaCentavos: f.mesadaCentavos,
        periodicidade: f.periodicidade,
        usuarioId: usuario.id,
      },
    })
  }
}

// Movimentos de mesada fictícios, em centavos inteiros (PR-02). `meses` é
// quantos meses antes do corrente. Ana recebe 3 × R$ 50,00 e gasta R$ 71,40:
// saldo de R$ 78,60. Pedro recebe R$ 120,00 e gasta R$ 149,90: saldo de
// -R$ 29,90, para a demonstração mostrar o saldo negativo (PR-32).
const MESADA_DA_DEMONSTRACAO = [
  { n: 1, filho: 'ana', tipo: 'credito', valorCentavos: 5000, dia: 1, descricao: 'Mesada da semana' },
  { n: 2, filho: 'ana', tipo: 'gasto', valorCentavos: 1850, dia: 3, descricao: 'Sorvete e figurinhas' },
  { n: 3, filho: 'ana', tipo: 'credito', valorCentavos: 5000, dia: 8, descricao: 'Mesada da semana' },
  { n: 4, filho: 'ana', tipo: 'gasto', valorCentavos: 3290, dia: 10, descricao: 'Livro de história' },
  { n: 5, filho: 'ana', tipo: 'credito', valorCentavos: 5000, dia: 24, descricao: 'Mesada da semana', meses: 1 },
  { n: 6, filho: 'ana', tipo: 'gasto', valorCentavos: 2000, dia: 26, descricao: 'Presente de aniversário', meses: 1 },
  { n: 7, filho: 'pedro', tipo: 'credito', valorCentavos: 12000, dia: 1, descricao: 'Mesada do mês', meses: 1 },
  { n: 8, filho: 'pedro', tipo: 'gasto', valorCentavos: 6990, dia: 12, descricao: 'Fone de ouvido', meses: 1 },
  { n: 9, filho: 'pedro', tipo: 'gasto', valorCentavos: 4500, dia: 5, descricao: 'Jogo no celular' },
  { n: 10, filho: 'pedro', tipo: 'gasto', valorCentavos: 3500, dia: 9, descricao: 'Lanche com os amigos' },
] as ReadonlyArray<{
  n: number
  filho: string
  tipo: string
  valorCentavos: number
  dia: number
  descricao: string
  meses?: number
}>

/**
 * Dez movimentos fictícios para os dois filhos. `upsert` sem atualizar, com id
 * fixo: rodar de novo não duplica nem desfaz o que o responsável editou. O
 * saldo nunca é gravado; é sempre somado do extrato.
 */
async function semearMesada(
  prisma: Pick<PrismaClient, 'movimentoDeMesada'>,
  agora: Date,
): Promise<void> {
  const mesCorrente = mesDaData(hojeEmSaoPaulo(agora))
  const mesAtras = (meses: number) => {
    let mes = mesCorrente
    for (let i = 0; i < meses; i += 1) mes = mesAnterior(mes)
    return mes
  }

  for (const m of MESADA_DA_DEMONSTRACAO) {
    await prisma.movimentoDeMesada.upsert({
      where: { id: `demonstracao-mesada-${m.n}` },
      update: {},
      create: {
        id: `demonstracao-mesada-${m.n}`,
        familiaId: FAMILIA_DA_DEMONSTRACAO,
        filhoId: `demonstracao-filho-${m.filho}`,
        tipo: m.tipo,
        valorCentavos: m.valorCentavos,
        data: `${mesAtras(m.meses ?? 0)}-${String(m.dia).padStart(2, '0')}`,
        descricao: m.descricao,
      },
    })
  }
}
