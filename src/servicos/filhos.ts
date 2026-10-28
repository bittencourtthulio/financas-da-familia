import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { entradaInvalida, naoEncontrado } from '@/lib/erros'
import { lerValorEmReais } from '@/lib/dinheiro'
import { dataCivilValida, hojeEmSaoPaulo } from '@/lib/datas'
import { exigirAdmin, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { registrarAtividade } from '@/servicos/atividade'

/**
 * Filhos da família (FT-05). O responsável (`admin`) cadastra o filho com nome,
 * nascimento opcional e a mesada combinada, que é só informativa (PR-30): valor
 * em centavos inteiros (PR-02) e periodicidade semanal ou mensal. Só isso é
 * guardado de um menor (PR-09). Cada função começa pela guarda de papel, no
 * servidor, e cada gravação leva o rastro da trilha (PR-10) na mesma transação,
 * com o nome do filho e os nomes dos campos, nunca valor nem nascimento (PR-25).
 */

export const PERIODICIDADES = ['semanal', 'mensal'] as const
export type Periodicidade = (typeof PERIODICIDADES)[number]

const NOME_MAXIMO = 80

// O valor chega como o responsável digitou, em reais, e sai em centavos
// inteiros (PR-02), lido por `src/lib/dinheiro.ts`, sem ponto flutuante.
const valorCombinado = z
  .string({ message: 'Informe o valor combinado da mesada.' })
  .transform((texto, ctx) => {
    const centavos = lerValorEmReais(texto)
    if (centavos === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Valor da mesada inválido. Use o formato 50,00, de R$ 0,01 até R$ 1.000.000,00.',
      })
      return z.NEVER
    }
    return centavos
  })

/** O esquema de um filho; `hoje` barra nascimento no futuro (dia de São Paulo). */
function esquemaDoFilho(hoje: string) {
  return z.object(
    {
      nome: z
        .string({ message: 'Informe o nome do filho.' })
        .trim()
        .min(1, 'Informe o nome do filho.')
        .max(NOME_MAXIMO, `O nome do filho tem no máximo ${NOME_MAXIMO} caracteres.`),
      nascimento: z
        .string()
        .trim()
        .nullish()
        .transform((v) => (v ? v : null))
        .refine(
          (v) => v === null || (dataCivilValida(v) && v <= hoje),
          'Data de nascimento inválida. Use um dia que já passou.',
        ),
      valor: valorCombinado,
      periodicidade: z.enum(PERIODICIDADES, { message: 'Escolha semanal ou mensal.' }),
    },
    { message: 'Dados do filho inválidos.' },
  )
}

export interface FilhoListado {
  id: string
  nome: string
  nascimento: string | null
  mesadaCentavos: number
  periodicidade: string
  /** O login, se existir: situação e e-mail (só o responsável vê). */
  login: { ativo: boolean; email: string } | null
}

const incluirLogin = { usuario: { select: { ativo: true, email: true } } } as const

type LinhaDeFilho = {
  id: string
  nome: string
  nascimento: string | null
  mesadaCentavos: number
  periodicidade: string
  usuario: { ativo: boolean; email: string } | null
}

function paraListado(l: LinhaDeFilho): FilhoListado {
  return {
    id: l.id,
    nome: l.nome,
    nascimento: l.nascimento,
    mesadaCentavos: l.mesadaCentavos,
    periodicidade: l.periodicidade,
    login: l.usuario ? { ativo: l.usuario.ativo, email: l.usuario.email } : null,
  }
}

/** Os filhos, na ordem do cadastro. */
export async function listarFilhos(autor: UsuarioAutenticado): Promise<FilhoListado[]> {
  exigirAdmin(autor)
  const linhas = await prisma.filho.findMany({
    include: incluirLogin,
    orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }],
  })
  return linhas.map(paraListado)
}

export async function obterFilho(autor: UsuarioAutenticado, id: string): Promise<FilhoListado> {
  exigirAdmin(autor)
  const linha = await prisma.filho.findUnique({ where: { id }, include: incluirLogin })
  if (!linha) throw naoEncontrado('Filho não encontrado.')
  return paraListado(linha)
}

export async function cadastrarFilho(
  autor: UsuarioAutenticado,
  entrada: unknown,
  agora: Date = new Date(),
): Promise<FilhoListado> {
  exigirAdmin(autor)

  const dados = esquemaDoFilho(hojeEmSaoPaulo(agora)).safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Dados do filho inválidos.')
  }
  const { nome, nascimento, valor, periodicidade } = dados.data

  // O filho e o rastro nascem juntos (PR-10): se o registro falha, o cadastro
  // é desfeito. O detalhe leva só o nome (PR-25).
  const criado = await prisma.$transaction(async (tx) => {
    const filho = await tx.filho.create({
      data: { nome, nascimento, mesadaCentavos: valor, periodicidade },
      include: incluirLogin,
    })
    await registrarAtividade(
      {
        ator: autor,
        acao: 'filho.cadastrado',
        entidade: 'filho',
        entidadeId: filho.id,
        detalhe: { alvoNome: filho.nome },
      },
      tx,
    )
    return filho
  })
  return paraListado(criado)
}

export async function editarFilho(
  autor: UsuarioAutenticado,
  id: string,
  entrada: unknown,
  agora: Date = new Date(),
): Promise<FilhoListado> {
  exigirAdmin(autor)

  const dados = esquemaDoFilho(hojeEmSaoPaulo(agora)).safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Dados do filho inválidos.')
  }
  const { nome, nascimento, valor, periodicidade } = dados.data

  const atual = await prisma.filho.findUnique({ where: { id } })
  if (!atual) throw naoEncontrado('Filho não encontrado.')

  // Só a mudança real deixa rastro, e o rastro leva os nomes dos campos.
  const campos: string[] = []
  if (nome !== atual.nome) campos.push('nome')
  if (nascimento !== atual.nascimento) campos.push('nascimento')
  if (valor !== atual.mesadaCentavos) campos.push('mesada')
  if (periodicidade !== atual.periodicidade) campos.push('periodicidade')

  const atualizado = await prisma.$transaction(async (tx) => {
    const filho = await tx.filho.update({
      where: { id },
      data: { nome, nascimento, mesadaCentavos: valor, periodicidade },
      include: incluirLogin,
    })
    if (campos.length > 0) {
      await registrarAtividade(
        {
          ator: autor,
          acao: 'filho.alterado',
          entidade: 'filho',
          entidadeId: id,
          detalhe: { alvoNome: filho.nome, campos: campos.join(',') },
        },
        tx,
      )
    }
    return filho
  })
  return paraListado(atualizado)
}
