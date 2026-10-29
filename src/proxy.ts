import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_SESSAO } from '@/lib/sessao'

/**
 * A raiz do site tem duas caras: sem cookie de sessão, o visitante vê a
 * apresentação (reescrita interna para /inicio, a URL continua `/`); com o
 * cookie, a requisição segue para o painel, que valida a sessão de verdade e
 * manda para o login se o token não valer. Nada aqui decide autorização: a
 * presença do cookie só escolhe qual página pública ou protegida responde.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/' && !request.cookies.has(COOKIE_SESSAO)) {
    return NextResponse.rewrite(new URL('/inicio', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/'] }
