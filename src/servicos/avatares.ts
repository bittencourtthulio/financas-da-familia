import { prisma } from '@/lib/prisma'
import { entradaInvalida, naoEncontrado } from '@/lib/erros'
import { avatarDoJson, avatarParaJson, lerAvatar, type Avatar } from '@/lib/avatar'
import {
  exigirAdmin,
  exigirAdultoOuResponsavel,
  type UsuarioAutenticado,
} from '@/servicos/autenticacao'

/**
 * Os avatares e a família desenhada (FT-10). O avatar é cosmético e escolhido
 * pela própria família: cada pessoa define o seu em Meu perfil (o filho com
 * login também), e o responsável define o de qualquer filho ou adulto. Nada
 * aqui entra na trilha de atividade: não é dado financeiro nem de acesso. A
 * autorização é a primeira linha de cada função, no servidor (PR-06).
 */

export interface MembroDaFamilia {
  id: string
  nome: string
  tipo: 'adulto' | 'crianca'
  /** `admin`, `usuario` ou `filho`, para a tela rotular. */
  papel: string
  ativo: boolean
  avatar: Avatar | null
}

function validar(entrada: unknown): Avatar {
  try {
    const avatar = lerAvatar(entrada)
    if (!avatar) throw new Error('Escolha o avatar.')
    return avatar
  } catch (erro) {
    throw entradaInvalida(erro instanceof Error ? erro.message : 'Avatar inválido.')
  }
}

/** Toda a família, adultos primeiro e depois os filhos. Só quem lança vê (o filho vê só a si). */
export async function familiaDe(autor: UsuarioAutenticado): Promise<MembroDaFamilia[]> {
  exigirAdultoOuResponsavel(autor)
  const [adultos, filhos] = await Promise.all([
    prisma.usuario.findMany({
      where: { papel: { in: ['admin', 'usuario'] } },
      select: { id: true, nome: true, papel: true, ativo: true, avatar: true },
      orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }],
    }),
    prisma.filho.findMany({
      select: { id: true, nome: true, avatar: true },
      orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }],
    }),
  ])
  return [
    ...adultos.map((u) => ({
      id: u.id,
      nome: u.nome,
      tipo: 'adulto' as const,
      papel: u.papel,
      ativo: u.ativo,
      avatar: avatarDoJson(u.avatar),
    })),
    ...filhos.map((f) => ({
      id: f.id,
      nome: f.nome,
      tipo: 'crianca' as const,
      papel: 'filho',
      ativo: true,
      avatar: avatarDoJson(f.avatar),
    })),
  ]
}

/**
 * Quem aparece desenhado no painel: para o responsável e o adulto, a família
 * ativa inteira; para o filho, só ele mesmo (um filho nunca vê o irmão, PR-31).
 */
export async function membrosDoPainel(
  autor: UsuarioAutenticado,
): Promise<Array<{ avatar: Avatar | null; tipo: 'adulto' | 'crianca' }>> {
  if (autor.papel === 'filho') {
    return [{ avatar: await meuAvatar(autor), tipo: 'crianca' }]
  }
  const familia = await familiaDe(autor)
  return familia.filter((m) => m.ativo).map((m) => ({ avatar: m.avatar, tipo: m.tipo }))
}

/**
 * As pessoas ativas da família (adultos e filhos), só id e nome: o que o
 * lançamento e o relatório precisam para dizer quem fez o gasto.
 */
export async function pessoasDaFamilia(autor: UsuarioAutenticado): Promise<Array<{ id: string; nome: string }>> {
  const familia = await familiaDe(autor)
  return familia.filter((m) => m.ativo).map((m) => ({ id: m.id, nome: m.nome }))
}

/** O avatar de quem está logado: do registro do filho, se for filho; senão, do usuário. */
export async function meuAvatar(autor: UsuarioAutenticado): Promise<Avatar | null> {
  if (autor.papel === 'filho') {
    const filho = await prisma.filho.findUnique({ where: { usuarioId: autor.id }, select: { avatar: true } })
    return avatarDoJson(filho?.avatar)
  }
  const usuario = await prisma.usuario.findUnique({ where: { id: autor.id }, select: { avatar: true } })
  return avatarDoJson(usuario?.avatar)
}

/** Cada um escolhe o próprio avatar; o filho com login também, no registro dele. */
export async function definirMeuAvatar(autor: UsuarioAutenticado, entrada: unknown): Promise<Avatar> {
  const avatar = validar(entrada)
  if (autor.papel === 'filho') {
    const filho = await prisma.filho.findUnique({ where: { usuarioId: autor.id }, select: { id: true } })
    if (!filho) throw naoEncontrado('Filho não encontrado.')
    await prisma.filho.update({ where: { id: filho.id }, data: { avatar: avatarParaJson(avatar) } })
    return avatar
  }
  await prisma.usuario.update({ where: { id: autor.id }, data: { avatar: avatarParaJson(avatar) } })
  return avatar
}

/** O responsável define o avatar de um filho. */
export async function definirAvatarDoFilho(
  autor: UsuarioAutenticado,
  filhoId: string,
  entrada: unknown,
): Promise<Avatar> {
  exigirAdmin(autor)
  const avatar = validar(entrada)
  const filho = await prisma.filho.findUnique({ where: { id: filhoId }, select: { id: true } })
  if (!filho) throw naoEncontrado('Filho não encontrado.')
  await prisma.filho.update({ where: { id: filhoId }, data: { avatar: avatarParaJson(avatar) } })
  return avatar
}

/** O responsável define o avatar de um adulto (o do filho é pelo registro do filho). */
export async function definirAvatarDoUsuario(
  autor: UsuarioAutenticado,
  usuarioId: string,
  entrada: unknown,
): Promise<Avatar> {
  exigirAdmin(autor)
  const avatar = validar(entrada)
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId }, select: { id: true, papel: true } })
  if (!usuario || usuario.papel === 'filho') throw naoEncontrado('Usuário não encontrado.')
  await prisma.usuario.update({ where: { id: usuarioId }, data: { avatar: avatarParaJson(avatar) } })
  return avatar
}

/** O avatar de cada filho, por id, para a lista de filhos. */
export async function avataresDosFilhos(autor: UsuarioAutenticado): Promise<Record<string, Avatar | null>> {
  exigirAdmin(autor)
  const filhos = await prisma.filho.findMany({ select: { id: true, avatar: true } })
  return Object.fromEntries(filhos.map((f) => [f.id, avatarDoJson(f.avatar)]))
}

/** Um adulto da família, para a página de edição do responsável. */
export async function adultoDaFamilia(autor: UsuarioAutenticado, id: string): Promise<MembroDaFamilia & { email: string }> {
  exigirAdmin(autor)
  const u = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true, nome: true, email: true, papel: true, ativo: true, avatar: true },
  })
  if (!u || u.papel === 'filho') throw naoEncontrado('Usuário não encontrado.')
  return { id: u.id, nome: u.nome, email: u.email, tipo: 'adulto', papel: u.papel, ativo: u.ativo, avatar: avatarDoJson(u.avatar) }
}
