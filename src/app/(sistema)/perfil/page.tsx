import Link from 'next/link'
import { exigirUsuario } from '@/app/sessao-servidor'
import { salvarPerfil } from '@/app/acoes'
import { salvarMeuAvatar } from '@/app/acoes-avatar'
import { meuAvatar } from '@/servicos/avatares'
import { Formulario, Campo } from '@/componentes/Formulario'
import { EditorDeAvatar } from '@/componentes/EditorDeAvatar'

/**
 * Perfil do usuário logado (P-9, E-3): nome, e-mail e o avatar desenhado
 * (FT-10). Papel não se muda aqui: é do responsável, na área Família.
 */
export default async function Perfil() {
  const usuario = await exigirUsuario()
  const avatar = await meuAvatar(usuario)
  const ehFilho = usuario.papel === 'filho'

  return (
    <div className="tela-de-formulario">
      <h1 className="titulo-da-tela">Meu perfil</h1>
      <p className="subtitulo-da-tela">Seus dados de conta e o seu bonequinho na família.</p>

      <Formulario acao={salvarPerfil} rotulo="Salvar">
        <Campo nome="nome" rotulo="Nome" padrao={usuario.nome} />
        <Campo nome="email" rotulo="E-mail" tipo="email" padrao={usuario.email} />
      </Formulario>

      <section className="secao-do-avatar" aria-labelledby="titulo-do-avatar">
        <h2 id="titulo-do-avatar" className="titulo-menor">
          Meu avatar
        </h2>
        <p className="nota-do-campo">
          É você, desenhado: aparece no painel da família e no cabeçalho. Escolha como quiser.
        </p>
        <Formulario acao={salvarMeuAvatar} rotulo="Salvar avatar">
          <EditorDeAvatar
            key={JSON.stringify(avatar)}
            inicial={avatar}
            figuras={ehFilho ? ['menino', 'menina'] : ['pai', 'mae']}
            tipo={ehFilho ? 'crianca' : 'adulto'}
          />
        </Formulario>
      </section>

      <p className="nota-do-campo">
        <Link href="/perfil/senha">Trocar minha senha</Link>
      </p>
    </div>
  )
}
