import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { listarFilhos } from '@/servicos/filhos'
import { PainelDePrivacidade } from '@/componentes/PainelDePrivacidade'

/**
 * Privacidade dos dados da família (FT-07, PR-09). Só o responsável chega aqui:
 * a guarda de página e o serviço verificam o papel no servidor. Carregando e
 * erro vêm do `loading.tsx` e do `error.tsx` do grupo (sistema).
 */
export default async function Privacidade({
  searchParams,
}: {
  searchParams: Promise<{ excluido?: string }>
}) {
  const admin = await exigirUsuarioAdmin()
  const { excluido } = await searchParams
  const filhos = await listarFilhos(admin)

  return <PainelDePrivacidade filhos={filhos} excluido={excluido === '1'} />
}
