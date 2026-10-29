'use client'

import { useActionState, useState } from 'react'
import { criarLoginDeFilho, desativarLoginDeFilho } from '@/app/acoes'
import { Formulario, Campo } from '@/componentes/Formulario'
import { CaixaDeConfirmacao } from '@/componentes/CaixaDeConfirmacao'
import { situacaoDoLogin } from '@/lib/filhos'

/**
 * O login do filho (PR-31). Sem login, o responsável cria um com e-mail e
 * senha provisória. Com login, vê a situação em texto e, se estiver ativo,
 * pode desativá-lo em dois passos (não há como reativar nesta feature).
 */
export function LoginDoFilho({
  filhoId,
  login,
  confirmandoInicial = false,
}: {
  filhoId: string
  login: { ativo: boolean; email: string } | null
  confirmandoInicial?: boolean
}) {
  const [confirmando, setConfirmando] = useState(confirmandoInicial)
  const [estado, executar] = useActionState(desativarLoginDeFilho, {})

  if (!login) {
    return (
      <section className="login-do-filho" aria-label="Login do filho">
        <h2 className="titulo-da-secao">Login do filho</h2>
        <p className="nota-do-campo">
          Sem login, o filho não entra no sistema. Com ele, o filho vê só a própria página de mesada.
        </p>
        <Formulario acao={criarLoginDeFilho} rotulo="Criar login">
          <input type="hidden" name="id" value={filhoId} />
          <Campo nome="email" rotulo="E-mail de login" tipo="email" />
          <Campo nome="senha" rotulo="Senha provisória (mínimo de 8 caracteres)" tipo="password" />
        </Formulario>
      </section>
    )
  }

  return (
    <section className="login-do-filho" aria-label="Login do filho">
      <h2 className="titulo-da-secao">Login do filho</h2>
      <p className="situacao-do-login" data-login={login.ativo ? 'ativo' : 'desativado'}>
        {situacaoDoLogin(login)}
      </p>
      <p>
        E-mail de login: <strong>{login.email}</strong>
      </p>
      {estado.erro && (
        <p className="aviso erro" role="alert">
          {estado.erro}
        </p>
      )}
      {estado.sucesso && (
        <p className="aviso sucesso" role="status">
          {estado.sucesso}
        </p>
      )}
      {login.ativo &&
        (!confirmando ? (
          <button type="button" className="secundario" onClick={() => setConfirmando(true)}>
            Desativar login
          </button>
        ) : (
          <CaixaDeConfirmacao tom="atencao">
            <form action={executar}>
              <p>O filho deixa de entrar no sistema. Não há como reativar o login por aqui.</p>
              <input type="hidden" name="id" value={filhoId} />
              <div className="acoes">
                <button type="submit" className="perigo">
                  Confirmar desativação
                </button>
                <button type="button" className="secundario" onClick={() => setConfirmando(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </CaixaDeConfirmacao>
        ))}
    </section>
  )
}
