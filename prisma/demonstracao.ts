// Dados de demonstração (PR-04). Contas fictícias para uso local e para o
// roteiro do QA. Usuários e a trilha de atividade deles (FT-02): lançamentos,
// filhos e mesada nascem nas features FT-03, FT-05 e FT-06, e cada uma
// acrescenta a sua parte aqui.
import type { PrismaClient } from '../src/gerado/prisma/client.js'
import { hashDeSenha } from '../src/lib/senha.js'

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
  prisma: Pick<PrismaClient, 'usuario' | 'atividade'>,
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
