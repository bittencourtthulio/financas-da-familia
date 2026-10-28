import { usuarioAtual } from '@/app/sessao-servidor'
import { ErroDeAplicacao, registrarErroInesperado } from '@/lib/erros'
import { exportarDadosDaFamilia } from '@/servicos/privacidade'

/**
 * Download dos dados da família (FT-07, PR-34). Só POST: a rota grava na
 * trilha, e o cookie `sameSite: lax` seguiria um link de outro site, então um
 * GET seria disparável de fora (os outros métodos caem no 405 do Next). Sem
 * sessão: 401. Outro papel que não o responsável: 403, verificado no serviço.
 */
export async function POST() {
  const semCache = { 'Cache-Control': 'no-store' }
  const autor = await usuarioAtual()
  if (!autor) {
    return Response.json({ erro: 'Sessão inválida ou expirada.' }, { status: 401, headers: semCache })
  }

  try {
    const arquivo = await exportarDadosDaFamilia(autor)
    return new Response(arquivo.conteudo, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${arquivo.nomeDoArquivo}"`,
        ...semCache,
      },
    })
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao) {
      return Response.json({ erro: erro.message }, { status: erro.status, headers: semCache })
    }
    const codigo = registrarErroInesperado(erro)
    return Response.json(
      { erro: 'Não foi possível gerar o arquivo. Tente de novo.', codigo },
      { status: 500, headers: semCache },
    )
  }
}
