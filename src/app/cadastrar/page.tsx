import Link from 'next/link'
import { redirect } from 'next/navigation'
import { usuarioAtual } from '@/app/sessao-servidor'
import { cadastrarConta } from '@/app/acoes'
import { Formulario, Campo } from '@/componentes/Formulario'
import { Familia, Logotipo } from '@/componentes/ilustracoes/Familia'
import { NOME_DO_SISTEMA } from '@/lib/marca'

/**
 * Autocadastro: quem chega cria a conta de responsável e, com ela, a própria
 * família. Os dados de cada família são só dela. Quem já tem sessão vai ao painel.
 */
export default async function Cadastrar() {
  if (await usuarioAtual()) redirect('/')

  return (
    <main className="entrada">
      <section className="entrada-boas-vindas" aria-hidden="true">
        <span className="bolha bolha-1" />
        <span className="bolha bolha-2" />
        <span className="bolha bolha-3" />
        <span className="bolha bolha-4" />
        <h2>Vamos montar a sua família</h2>
        <Familia />
        <p>Crie a sua conta e depois cadastre quem mora com você: adultos e crianças, cada um com o seu lugar.</p>
      </section>

      <section className="entrada-cartao">
        <div className="marca marca-do-login">
          <Logotipo />
          {NOME_DO_SISTEMA}
        </div>
        <h1 className="titulo-da-tela">Criar minha família</h1>
        <p className="subtitulo-da-tela">Você será o responsável: cuida da família, dos filhos e das contas.</p>

        <Formulario acao={cadastrarConta} rotulo="Criar minha família">
          <Campo nome="familia" rotulo="Nome da família" />
          <Campo nome="nome" rotulo="Seu nome" />
          <Campo nome="email" rotulo="E-mail" tipo="email" />
          <Campo nome="senha" rotulo="Senha (mínimo de 8 caracteres)" tipo="password" />
          <Campo nome="confirmacao" rotulo="Confirme a senha" tipo="password" />
        </Formulario>

        <p className="rodape-da-entrada">
          Já tem conta? <Link href="/entrar">Entrar</Link>.
        </p>
      </section>
    </main>
  )
}
