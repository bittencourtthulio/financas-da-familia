// Dados de demonstração (PR-04). Contas fictícias para uso local e para o
// roteiro do QA. Usuários e a trilha de atividade deles (FT-02) e categorias e
// lançamentos de três meses (FT-03 e FT-04): filhos e mesada nascem nas features FT-05 e
// FT-06, e cada uma acrescenta a sua parte aqui.
import type { PrismaClient } from '../src/gerado/prisma/client.js'
import { hashDeSenha } from '../src/lib/senha.js'
import { hojeEmSaoPaulo, mesAnterior, mesDaData } from '../src/lib/datas.js'

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

/**
 * Cria (sem sobrescrever) as contas de demonstração. Nunca roda em produção:
 * as contas têm senha conhecida.
 */
export async function semearDemonstracao(
  prisma: Pick<PrismaClient, 'usuario' | 'atividade' | 'categoria' | 'lancamento'>,
  agora: Date = new Date(),
): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'A seed de demonstração não roda em produção. ' +
        'Ela cria contas com senha conhecida.',
    )
  }

  for (const conta of DEMONSTRACAO) {
    await prisma.usuario.upsert({
      where: { email: conta.email },
      update: {},
      create: {
        nome: conta.nome,
        email: conta.email,
        senhaHash: await hashDeSenha(conta.senha),
        papel: conta.papel,
      },
    })
  }
  await semearAtividade(prisma)
  await semearLancamentos(prisma, agora)
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
      create: { id: `demonstracao-categoria-${c.slug}`, nome: c.nome, tipo: c.tipo },
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
      },
    })
  }
}
