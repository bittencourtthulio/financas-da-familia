import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { senhaConfere } from '@/lib/senha'
import { assinarSessao, lerSessao, type Sessao } from '@/lib/sessao'
import {
  entradaInvalida,
  limiteExcedido,
  naoAutenticado,
  naoAutorizado,
} from '@/lib/erros'
import { criarLimitador } from '@/lib/limite-de-tentativas'

// O trim e o lowercase acontecem ANTES da validação: um e-mail digitado
// com espaço à frente ou em caixa alta é o mesmo e-mail, e recusá-lo seria
// um defeito de usabilidade disfarçado de validação.
const emailNormalizado = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('E-mail inválido.'))

export const entradaDeLogin = z.object({
  email: emailNormalizado,
  senha: z.string().min(1, 'Informe a senha.'),
})

// Cinco falhas por e-mail em 15 minutos bloqueiam esse e-mail por 15 minutos
// (PR-22). A chave é o e-mail já normalizado, para caixa e espaço não
// escaparem do contador.
const limiteDeLogin = criarLimitador()

/** Zera o contador de tentativas. Só os testes precisam disso. */
export function reiniciarLimiteDeLogin(): void {
  limiteDeLogin.limpar()
}

export interface UsuarioAutenticado {
  id: string
  nome: string
  email: string
  papel: string
  /** A família de quem pergunta: toda consulta de negócio fica dentro dela. */
  familiaId: string
}

/**
 * Autentica e devolve o token. A mensagem de falha é a mesma para e-mail
 * inexistente, senha errada e conta desativada — dizer qual das três é
 * entregar meio caminho a quem está tentando adivinhar.
 */
export async function entrar(entrada: unknown): Promise<{
  token: string
  usuario: UsuarioAutenticado
}> {
  const dados = entradaDeLogin.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  }

  const chave = dados.data.email
  if (limiteDeLogin.restanteDoBloqueio(chave) > 0) throw limiteExcedido()

  const usuario = await prisma.usuario.findUnique({
    where: { email: chave },
  })

  const falha = naoAutenticado('E-mail ou senha incorretos.')
  if (!usuario || !usuario.ativo) {
    limiteDeLogin.registrarFalha(chave)
    throw falha
  }
  if (!(await senhaConfere(dados.data.senha, usuario.senhaHash))) {
    limiteDeLogin.registrarFalha(chave)
    throw falha
  }
  limiteDeLogin.registrarSucesso(chave)

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
}

/**
 * Resolve o usuário por trás de um token, verificando o que o token sozinho
 * não sabe: se a conta ainda existe, ainda está ativa, e se a sessão não foi
 * invalidada por uma troca de senha posterior à emissão.
 */
export async function usuarioDaSessao(token: string): Promise<UsuarioAutenticado> {
  const sessao: Sessao = await lerSessao(token)

  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.usuarioId },
  })
  if (!usuario || !usuario.ativo) throw naoAutenticado()

  const invalidasAte = Math.floor(usuario.sessoesValidasDesde.getTime() / 1000)
  if (sessao.emitidoEm < invalidasAte) {
    throw naoAutenticado('Sessão encerrada por troca de senha.')
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    familiaId: usuario.familiaId,
  }
}

/**
 * Renovação deslizante (PR-21): passa pela mesma verificação de qualquer
 * sessão (conta ativa, corte de troca de senha) e emite um token novo com o
 * papel que o banco tem agora, não o do token velho.
 */
export async function renovarSessao(token: string): Promise<{
  token: string
  usuario: UsuarioAutenticado
}> {
  const usuario = await usuarioDaSessao(token)
  return { token: await assinarSessao(usuario.id, usuario.papel), usuario }
}

/** Exige que o usuário seja admin. A verificação é aqui, no servidor (L2). */
export function exigirAdmin(usuario: UsuarioAutenticado): void {
  if (usuario.papel !== 'admin') throw naoAutorizado()
}

// Quem lança e lê o dinheiro da casa (PR-06, D-08 da FT-03). Lista de
// permitidos: um papel novo, como o futuro `filho`, nasce sem acesso.
const PAPEIS_DOS_LANCAMENTOS = ['admin', 'usuario']

/**
 * Exige que o usuário seja o responsável (`admin`) ou o adulto (`usuario`).
 * Qualquer outro papel, inclusive vazio ou desconhecido, é negado (403). A
 * verificação é aqui, no servidor (L2).
 */
export function exigirAdultoOuResponsavel(usuario: UsuarioAutenticado): void {
  if (!papelPodeLancar(usuario.papel)) throw naoAutorizado()
}

/** O papel lança e lê o dinheiro da casa? Também decide o item do menu. */
export function papelPodeLancar(papel: string): boolean {
  return PAPEIS_DOS_LANCAMENTOS.includes(papel)
}

/**
 * Exige que o usuário seja um filho (PR-06, PR-31): é a guarda da página de
 * mesada. Qualquer outro papel é negado (403); a verificação é aqui, no servidor.
 */
export function exigirFilho(usuario: UsuarioAutenticado): void {
  if (usuario.papel !== 'filho') throw naoAutorizado()
}

/**
 * Esquece o contador de tentativas de um e-mail (FT-07, PR-35): a exclusão da
 * conta de um filho não deixa na memória do processo o estado de login dele.
 */
export function esquecerTentativasDeLogin(email: string): void {
  limiteDeLogin.registrarSucesso(email.trim().toLowerCase())
}
