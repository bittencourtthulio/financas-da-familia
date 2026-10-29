'use server'

import { revalidatePath } from 'next/cache'
import { definirAvatarDoFilho, definirAvatarDoUsuario, definirMeuAvatar } from '@/servicos/avatares'
import { avatarDoFormulario } from '@/lib/avatar'
import { mensagemSegura } from '@/lib/erros'
import { exigirUsuario, exigirUsuarioAdmin } from '@/app/sessao-servidor'
import type { EstadoDoFormulario } from '@/app/acoes'

// As ações do avatar (FT-10). Mesma forma das de acoes.ts: o responsável é
// exigido FORA do try (o redirecionamento da guarda é uma exceção do Next) e o
// serviço verifica de novo.

export async function salvarMeuAvatar(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const usuario = await exigirUsuario()
  try {
    await definirMeuAvatar(usuario, avatarDoFormulario(form))
  } catch (erro) {
    return { erro: mensagemSegura(erro) }
  }
  revalidatePath('/', 'layout')
  return { sucesso: 'Avatar salvo. Já está no seu cantinho da família.' }
}

export async function salvarAvatarDoFilho(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioAdmin()
  try {
    await definirAvatarDoFilho(autor, String(form.get('id')), avatarDoFormulario(form))
  } catch (erro) {
    return { erro: mensagemSegura(erro) }
  }
  revalidatePath('/', 'layout')
  return { sucesso: 'Avatar do filho salvo.' }
}

export async function salvarAvatarDoUsuario(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioAdmin()
  try {
    await definirAvatarDoUsuario(autor, String(form.get('id')), avatarDoFormulario(form))
  } catch (erro) {
    return { erro: mensagemSegura(erro) }
  }
  revalidatePath('/', 'layout')
  return { sucesso: 'Avatar salvo.' }
}
