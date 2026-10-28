import { cookies } from 'next/headers'
import { COOKIE_SESSAO, opcoesDoCookie } from '@/lib/sessao'
import { ErroDeAplicacao } from '@/lib/erros'
import { renovarSessao } from '@/servicos/autenticacao'

/**
 * Renovação da sessão (PR-21). Lê o cookie, passa pela mesma verificação de
 * uma sessão normal e devolve o cookie novo. Sem cookie ou com sessão
 * inválida: 401 e nenhum cookie.
 */
export async function POST() {
  const jar = await cookies()
  const token = jar.get(COOKIE_SESSAO)?.value
  const semCache = { 'Cache-Control': 'no-store' }

  if (!token) {
    return Response.json({ erro: 'Sessão inválida ou expirada.' }, { status: 401, headers: semCache })
  }

  try {
    const { token: novo } = await renovarSessao(token)
    jar.set(COOKIE_SESSAO, novo, opcoesDoCookie())
    return Response.json({ ok: true }, { headers: semCache })
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao) {
      return Response.json({ erro: erro.message }, { status: erro.status, headers: semCache })
    }
    console.error(erro)
    return Response.json(
      { erro: 'Não foi possível renovar a sessão.' },
      { status: 500, headers: semCache },
    )
  }
}
