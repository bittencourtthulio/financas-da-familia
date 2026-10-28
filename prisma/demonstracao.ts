// Dados de demonstração (PR-04). Contas fictícias para uso local e para o
// roteiro do QA. Só usuários: lançamentos, filhos e mesada nascem nas
// features FT-03, FT-05 e FT-06, e cada uma acrescenta a sua parte aqui.
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
  prisma: Pick<PrismaClient, 'usuario'>,
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
}
