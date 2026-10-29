import Link from 'next/link'
import { redirect } from 'next/navigation'
import { usuarioAtual } from '@/app/sessao-servidor'
import { autenticar } from '@/app/acoes'
import { Formulario, Campo } from '@/componentes/Formulario'
import { Familia, Logotipo } from '@/componentes/ilustracoes/Familia'
import { NOME_DO_SISTEMA } from '@/lib/marca'

/**
 * A porta de entrada: a família na metade de boas-vindas e o cartão com o
 * formulário na outra. Quem já tem sessão vai direto ao painel.
 */
export default async function Entrar() {
  if (await usuarioAtual()) redirect('/')

  return (
    <main className="entrada">
      <section className="entrada-boas-vindas" aria-hidden="true">
        <span className="bolha bolha-1" />
        <span className="bolha bolha-2" />
        <span className="bolha bolha-3" />
        <span className="bolha bolha-4" />
        <h2>Que bom ter você de volta!</h2>
        <Familia />
        <p>As contas da casa e a mesada das crianças, num lugar só, para a família inteira.</p>
      </section>

      <section className="entrada-cartao">
        <div className="marca marca-do-login">
          <Logotipo />
          {NOME_DO_SISTEMA}
        </div>
        <h1 className="titulo-da-tela">Entrar</h1>
        <p className="subtitulo-da-tela">Informe suas credenciais para continuar.</p>

        <Formulario acao={autenticar} rotulo="Entrar">
          <Campo nome="email" rotulo="E-mail" tipo="email" />
          <Campo nome="senha" rotulo="Senha" tipo="password" />
        </Formulario>

        <p className="rodape-da-entrada">
          Ainda não conhece o sistema? <Link href="/inicio">Veja como ele funciona</Link>.
        </p>
      </section>
    </main>
  )
}
