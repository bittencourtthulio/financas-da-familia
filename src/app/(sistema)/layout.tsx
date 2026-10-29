import Link from 'next/link'
import { exigirUsuario } from '@/app/sessao-servidor'
import { Navegacao } from '@/componentes/Navegacao'
import { AlternadorDeTema } from '@/componentes/AlternadorDeTema'
import { CascaDoSistema } from '@/componentes/CascaDoSistema'
import { BotaoDaGaveta } from '@/componentes/BotaoDaGaveta'
import { MenuDoUsuario } from '@/componentes/MenuDoUsuario'
import { RenovadorDeSessao } from '@/componentes/RenovadorDeSessao'
import { Logotipo } from '@/componentes/ilustracoes/Familia'
import { intervaloDeRenovacao } from '@/lib/renovacao'
import { ambiente } from '@/lib/ambiente'
import { sair } from '@/app/acoes'
import { papelPodeLancar } from '@/servicos/autenticacao'
import { meuAvatar } from '@/servicos/avatares'
import { NOME_DO_SISTEMA } from '@/lib/marca'
import { rotuloDoPapel } from '@/lib/papeis'

/**
 * A casca do sistema: o cabeçalho com a marca e o menu do usuário, a barra
 * lateral com a navegação e o Sair no rodapé, e o conteúdo. Toda tela
 * autenticada mora aqui dentro.
 */
export default async function LayoutDoSistema({
  children,
}: {
  children: React.ReactNode
}) {
  const usuario = await exigirUsuario()
  const papel = rotuloDoPapel(usuario.papel)
  const avatar = await meuAvatar(usuario)

  return (
    <CascaDoSistema>
      <RenovadorDeSessao intervaloMs={intervaloDeRenovacao(ambiente.jwtTtlSegundos)} />

      <header className="topo">
        <BotaoDaGaveta />
        <Link href="/" className="marca-do-topo">
          <Logotipo />
          <span className="marca">{NOME_DO_SISTEMA}</span>
        </Link>
        <span className="espaco" />
        <MenuDoUsuario
          nome={usuario.nome}
          email={usuario.email}
          papel={papel}
          avatar={avatar}
          tipo={usuario.papel === 'filho' ? 'crianca' : 'adulto'}
        >
          <AlternadorDeTema />
          <form action={sair}>
            <button type="submit" role="menuitem">
              Sair
            </button>
          </form>
        </MenuDoUsuario>
      </header>

      <aside className="barra-lateral" id="barra-lateral">
        <Navegacao
          ehAdmin={usuario.papel === 'admin'}
          podeLancar={papelPodeLancar(usuario.papel)}
          ehFilho={usuario.papel === 'filho'}
        />
        <div className="rodape-da-lateral">
          <form action={sair}>
            <button type="submit" className="secundario">
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="conteudo">{children}</main>
    </CascaDoSistema>
  )
}
