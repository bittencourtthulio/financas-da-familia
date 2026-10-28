import { notFound } from 'next/navigation'
import { exigirUsuarioFilho } from '@/app/sessao-servidor'
import { minhaMesada } from '@/servicos/filhos'
import { MesadaDoFilho } from '@/componentes/MesadaDoFilho'
import { ErroDeAplicacao } from '@/lib/erros'

/**
 * A mesada do próprio filho (PR-06). A página não recebe id nem lê parâmetro:
 * o registro vem do usuário da sessão, então um filho nunca alcança o do
 * irmão. Só o papel `filho` chega aqui; os outros voltam ao painel.
 */
export default async function MinhaMesada() {
  const usuario = await exigirUsuarioFilho()

  let mesada
  try {
    mesada = await minhaMesada(usuario)
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao && erro.status === 404) notFound()
    throw erro
  }

  return <MesadaDoFilho mesada={mesada} />
}
