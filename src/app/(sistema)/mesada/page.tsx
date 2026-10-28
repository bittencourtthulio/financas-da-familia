import { notFound } from 'next/navigation'
import { exigirUsuarioFilho } from '@/app/sessao-servidor'
import { meuExtrato } from '@/servicos/mesada'
import { MesadaDoFilho } from '@/componentes/MesadaDoFilho'
import { lerPagina } from '@/lib/mesada'
import { ErroDeAplicacao } from '@/lib/erros'

/**
 * A mesada do próprio filho (PR-06). A página não recebe id e só lê o parâmetro
 * `pagina`: o registro vem do usuário da sessão, então um filho nunca alcança o
 * do irmão. Só o papel `filho` chega aqui; os outros voltam ao painel.
 */
export default async function MinhaMesada({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const usuario = await exigirUsuarioFilho()
  const consulta = await searchParams

  let extrato
  try {
    extrato = await meuExtrato(usuario, { pagina: lerPagina(consulta.pagina) })
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao && erro.status === 404) notFound()
    throw erro
  }

  return <MesadaDoFilho extrato={extrato} />
}
