import { verificarSaude } from '@/servicos/saude'

/**
 * Saúde (PR-14, L18). Pública de propósito: um monitor precisa perguntar sem
 * entrar. Por isso a resposta é só `{ status, banco }`: sem versão, caminho,
 * usuário nem pilha. 200 quando o banco responde, 503 quando não.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const { http, corpo } = await verificarSaude()
  return Response.json(corpo, { status: http, headers: { 'Cache-Control': 'no-store' } })
}
