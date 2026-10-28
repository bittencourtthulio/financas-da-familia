'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { entrar } from '@/servicos/autenticacao'
import { excluirFilho } from '@/servicos/privacidade'
import { criar, editar, desativar } from '@/servicos/usuarios'
import { atualizarPerfil, trocarSenha } from '@/servicos/perfil'
import {
  apagarLancamento,
  criarCategoria,
  criarLancamento,
  editarLancamento,
} from '@/servicos/lancamentos'
import {
  cadastrarFilho,
  criarLoginDoFilho,
  desativarLoginDoFilho,
  editarFilho,
} from '@/servicos/filhos'
import {
  apagarMovimento,
  editarMovimento,
  registrarMovimento,
} from '@/servicos/mesada'
import {
  lerFormularioDeCategoria,
  lerFormularioDeFilho,
  lerFormularioDeLancamento,
  lerFormularioDeLoginDoFilho,
  lerFormularioDeMovimento,
} from '@/app/formularios'
import { mesDaData } from '@/lib/datas'
import { enderecoDaLista } from '@/lib/lancamentos-links'
import { avisoDeSaldoNegativo, enderecoDoExtratoDoFilho } from '@/lib/mesada'
import { ErroDeAplicacao } from '@/lib/erros'
import {
  exigirUsuario,
  exigirUsuarioAdmin,
  exigirUsuarioDeLancamentos,
  gravarCookieDeSessao,
  apagarCookieDeSessao,
} from '@/app/sessao-servidor'

export interface EstadoDoFormulario {
  erro?: string
  sucesso?: string
}

/**
 * Converte o erro em mensagem para a tela. Erro de aplicação carrega
 * mensagem segura; qualquer outro vira uma frase genérica — rastro de
 * pilha não chega ao usuário (L17).
 */
function mensagemDe(erro: unknown): string {
  if (erro instanceof ErroDeAplicacao) return erro.message
  console.error(erro)
  return 'Não foi possível concluir. Tente de novo.'
}

export async function autenticar(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    const { token } = await entrar({
      email: form.get('email'),
      senha: form.get('senha'),
    })
    await gravarCookieDeSessao(token)
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  redirect('/')
}

export async function sair(): Promise<void> {
  await apagarCookieDeSessao()
  redirect('/entrar')
}

// As ações de usuário exigem o responsável FORA do try: o redirecionamento da
// guarda é uma exceção do Next e, dentro do try, viraria "Não foi possível
// concluir" em vez de levar o intruso embora (defeito achado na FT-05).

export async function criarUsuario(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioAdmin()
  try {
    await criar(autor, {
      nome: form.get('nome'),
      email: form.get('email'),
      senha: form.get('senha'),
      papel: form.get('papel') ?? 'usuario',
    })
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/configuracoes/usuarios')
  return { sucesso: 'Usuário criado.' }
}

export async function editarUsuario(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioAdmin()
  try {
    const id = String(form.get('id'))
    await editar(autor, id, {
      nome: form.get('nome'),
      email: form.get('email'),
      papel: form.get('papel'),
    })
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/configuracoes/usuarios')
  return { sucesso: 'Usuário atualizado.' }
}

export async function desativarUsuario(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioAdmin()
  try {
    await desativar(autor, String(form.get('id')))
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/configuracoes/usuarios')
  return { sucesso: 'Usuário desativado.' }
}

export async function salvarPerfil(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    const usuario = await exigirUsuario()
    await atualizarPerfil(usuario, {
      nome: form.get('nome'),
      email: form.get('email'),
    })
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/perfil')
  return { sucesso: 'Perfil atualizado.' }
}

export async function salvarSenha(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    const usuario = await exigirUsuario()
    // O token novo mantém quem trocou a senha dentro da sessão; as outras
    // sessões do mesmo usuário caem.
    const { token } = await trocarSenha(usuario, {
      senhaAtual: form.get('senhaAtual'),
      senhaNova: form.get('senhaNova'),
      confirmacao: form.get('confirmacao'),
    })
    await gravarCookieDeSessao(token)
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  return { sucesso: 'Senha alterada. As outras sessões foram encerradas.' }
}

/** O mês do lançamento, para a lista abrir onde ele acabou de entrar. */
function listaDoMesDe(data: FormDataEntryValue | null): string {
  return enderecoDaLista({ mes: typeof data === 'string' ? mesDaData(data) : null })
}

// As ações de lançamento exigem quem lança FORA do try: o redirecionamento da
// guarda é uma exceção do Next e não pode virar mensagem de erro. O serviço
// verifica o papel de novo.

export async function registrarLancamento(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioDeLancamentos()
  try {
    await criarLancamento(autor, lerFormularioDeLancamento(form))
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/lancamentos')
  redirect(listaDoMesDe(form.get('data')))
}

export async function salvarLancamento(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioDeLancamentos()
  try {
    await editarLancamento(autor, String(form.get('id')), lerFormularioDeLancamento(form))
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/lancamentos')
  redirect(listaDoMesDe(form.get('data')))
}

export async function excluirLancamento(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioDeLancamentos()
  try {
    await apagarLancamento(autor, String(form.get('id')))
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/lancamentos')
  redirect('/lancamentos')
}

export async function registrarCategoria(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioDeLancamentos()
  try {
    await criarCategoria(autor, lerFormularioDeCategoria(form))
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/lancamentos/categorias')
  return { sucesso: 'Categoria criada.' }
}

// As ações de filho exigem o responsável FORA do try, como as de lançamento: o
// redirecionamento da guarda é uma exceção do Next. O serviço verifica de novo.

export async function registrarFilho(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioAdmin()
  let id: string
  try {
    id = (await cadastrarFilho(autor, lerFormularioDeFilho(form))).id
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/filhos')
  redirect(`/filhos/${id}`)
}

export async function salvarFilho(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioAdmin()
  try {
    await editarFilho(autor, String(form.get('id')), lerFormularioDeFilho(form))
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/filhos')
  return { sucesso: 'Filho atualizado.' }
}

export async function criarLoginDeFilho(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioAdmin()
  try {
    await criarLoginDoFilho(autor, String(form.get('id')), lerFormularioDeLoginDoFilho(form))
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/filhos')
  return { sucesso: 'Login criado.' }
}

export async function desativarLoginDeFilho(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioAdmin()
  try {
    await desativarLoginDoFilho(autor, String(form.get('id')))
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/filhos')
  return { sucesso: 'Login desativado.' }
}

// As ações de mesada exigem o responsável FORA do try, como as de filho: o
// redirecionamento da guarda é uma exceção do Next. O serviço verifica de novo.
// O filho e o adulto nunca chegam ao serviço; o saldo negativo não bloqueia nada
// (PR-32), só avisa.

/** Atualiza as telas que mostram a mesada de um filho. */
function atualizarMesada(filhoId: string): void {
  revalidatePath(`/filhos/${filhoId}/mesada`)
  revalidatePath('/filhos')
  revalidatePath('/mesada')
}

export async function registrarMovimentoDeMesada(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioAdmin()
  const filhoId = String(form.get('filhoId'))
  let saldoCentavos: number
  try {
    saldoCentavos = (await registrarMovimento(autor, filhoId, lerFormularioDeMovimento(form))).saldoCentavos
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  atualizarMesada(filhoId)
  const aviso = avisoDeSaldoNegativo(saldoCentavos)
  return { sucesso: aviso ? `Movimento registrado. ${aviso}` : 'Movimento registrado.' }
}

export async function salvarMovimentoDeMesada(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioAdmin()
  let filhoId: string
  try {
    const { movimento } = await editarMovimento(autor, String(form.get('id')), lerFormularioDeMovimento(form))
    filhoId = movimento.filhoId
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  atualizarMesada(filhoId)
  redirect(enderecoDoExtratoDoFilho(filhoId))
}

export async function excluirMovimentoDeMesada(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioAdmin()
  let filhoId: string
  try {
    filhoId = (await apagarMovimento(autor, String(form.get('id')))).filhoId
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  atualizarMesada(filhoId)
  redirect(enderecoDoExtratoDoFilho(filhoId))
}

// A exclusão da conta do filho (FT-07, PR-35) exige o responsável FORA do try,
// como as demais. O servidor confere o nome digitado; a tela não basta.
export async function excluirContaDoFilho(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const autor = await exigirUsuarioAdmin()
  try {
    await excluirFilho(autor, String(form.get('id')), { confirmacao: form.get('confirmacao') ?? undefined })
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/filhos')
  revalidatePath('/privacidade')
  revalidatePath('/atividade')
  revalidatePath('/')
  redirect('/privacidade?excluido=1')
}
