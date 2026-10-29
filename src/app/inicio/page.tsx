import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { usuarioAtual } from '@/app/sessao-servidor'
import { Apresentacao } from '@/componentes/Apresentacao'
import { NOME_DO_SISTEMA, DESCRICAO_DO_SISTEMA } from '@/lib/marca'

export const metadata: Metadata = {
  title: `${NOME_DO_SISTEMA} — as finanças da casa, em família`,
  description: DESCRICAO_DO_SISTEMA,
}

/**
 * A apresentação pública. É o que a raiz do site mostra a quem ainda não
 * entrou (src/proxy.ts reescreve `/` para cá sem cookie de sessão); quem já
 * tem sessão vai direto ao painel.
 */
export default async function Inicio() {
  if (await usuarioAtual()) redirect('/')
  return <Apresentacao />
}
