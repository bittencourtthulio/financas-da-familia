import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { assinarSessao } from '@/lib/sessao'
import { conflito, entradaInvalida, limiteExcedido } from '@/lib/erros'
import { criarLimitador } from '@/lib/limite-de-tentativas'
import { registrarAtividade } from '@/servicos/atividade'
import type { UsuarioAutenticado } from '@/servicos/autenticacao'

/**
 * Cadastro de uma família nova (autocadastro). Quem chega cria a família e a
 * própria conta de responsável (`admin`) numa transação só, com o rastro. Cada
 * família é dona dos próprios dados: o resto do sistema nunca atravessa de uma
 * para outra. O e-mail é único no sistema todo, porque é o login.
 */

const NOME_MAXIMO_DA_FAMILIA = 60

const emailNormalizado = z.string().trim().toLowerCase().pipe(z.email('E-mail inválido.'))

export const entradaDeCadastro = z
  .object({
    familia: z
      .string({ message: 'Informe o nome da família.' })
      .trim()
      .min(1, 'Informe o nome da família.')
      .max(NOME_MAXIMO_DA_FAMILIA, `O nome da família tem no máximo ${NOME_MAXIMO_DA_FAMILIA} caracteres.`),
    nome: z.string({ message: 'Informe o seu nome.' }).trim().min(1, 'Informe o seu nome.'),
    email: emailNormalizado,
    senha: z.string({ message: 'Informe a senha.' }).min(8, 'A senha precisa de ao menos 8 caracteres.'),
    confirmacao: z.string({ message: 'Confirme a senha.' }),
  })
  .refine((d) => d.senha === d.confirmacao, {
    message: 'A confirmação não é igual à senha.',
    path: ['confirmacao'],
  })

// Cinco cadastros por origem em uma hora: o suficiente para uma casa errar o
// formulário, pouco para quem quer encher o banco de famílias. O contador vive
// na memória do processo, como o do login.
const limiteDeCadastro = criarLimitador({ maximo: 5, janelaMs: 60 * 60_000, bloqueioMs: 60 * 60_000 })

/** Zera o contador de cadastros. Só os testes precisam disso. */
export function reiniciarLimiteDeCadastro(): void {
  limiteDeCadastro.limpar()
}

const ehViolacaoDeUnico = (erro: unknown) =>
  typeof erro === 'object' && erro !== null && (erro as { code?: unknown }).code === 'P2002'

export async function cadastrarFamilia(
  entrada: unknown,
  origem = 'desconhecida',
): Promise<{ token: string; usuario: UsuarioAutenticado }> {
  if (limiteDeCadastro.restanteDoBloqueio(origem) > 0) throw limiteExcedido()

  const dados = entradaDeCadastro.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  }
  // Toda tentativa válida conta, deu certo ou não: é o ritmo que se limita.
  limiteDeCadastro.registrarFalha(origem)

  const { familia, nome, email, senha } = dados.data
  if (await prisma.usuario.findUnique({ where: { email } })) {
    throw conflito('Já existe uma conta com este e-mail. Entre, ou use outro e-mail.')
  }

  const senhaHash = await hashDeSenha(senha)

  try {
    const usuario = await prisma.$transaction(async (tx) => {
      const criada = await tx.familia.create({ data: { nome: familia } })
      const responsavel = await tx.usuario.create({
        data: { nome, email, senhaHash, papel: 'admin', familiaId: criada.id },
      })
      await registrarAtividade(
        {
          ator: { id: responsavel.id, nome: responsavel.nome, familiaId: criada.id },
          acao: 'familia.criada',
          entidade: 'familia',
          entidadeId: criada.id,
          detalhe: { alvoNome: criada.nome },
        },
        tx,
      )
      return responsavel
    })

    return {
      token: await assinarSessao(usuario.id, usuario.papel),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        familiaId: usuario.familiaId,
      },
    }
  } catch (erro) {
    // Dois cadastros com o mesmo e-mail ao mesmo tempo: o banco recusa o segundo.
    if (ehViolacaoDeUnico(erro)) {
      throw conflito('Já existe uma conta com este e-mail. Entre, ou use outro e-mail.')
    }
    throw erro
  }
}
