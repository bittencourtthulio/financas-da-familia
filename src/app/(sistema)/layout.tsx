import Link from 'next/link'
import { exigirUsuario } from '@/app/sessao-servidor'
import { Navegacao } from '@/componentes/Navegacao'
import { AlternadorDeTema } from '@/componentes/AlternadorDeTema'
import { CascaDoSistema } from '@/componentes/CascaDoSistema'
import { BotaoDaGaveta } from '@/componentes/BotaoDaGaveta'
import { RenovadorDeSessao } from '@/componentes/RenovadorDeSessao'
import { intervaloDeRenovacao } from '@/lib/renovacao'
import { ambiente } from '@/lib/ambiente'
import { sair } from '@/app/acoes'
import { papelPodeLancar } from '@/servicos/autenticacao'
import { NOME_DO_SISTEMA } from '@/lib/marca'
import { rotuloDoPapel } from '@/lib/papeis'

/**
 * A casca do sistema: barra de atividade, barra lateral, conteúdo e barra
 * de status. Toda tela autenticada mora aqui dentro.
 */
export default async function LayoutDoSistema({
  children,
}: {
  children: React.ReactNode
}) {
  const usuario = await exigirUsuario()

  return (
    <CascaDoSistema>
      <RenovadorDeSessao intervaloMs={intervaloDeRenovacao(ambiente.jwtTtlSegundos)} />
      <div className="barra-de-atividade" role="presentation" />

      <aside className="barra-lateral" id="barra-lateral">
        <div className="marca">{NOME_DO_SISTEMA}</div>
        <Navegacao
          ehAdmin={usuario.papel === 'admin'}
          podeLancar={papelPodeLancar(usuario.papel)}
        />
      </aside>

      <main className="conteudo">{children}</main>

      <footer className="barra-de-status">
        <BotaoDaGaveta />
        <Link href="/perfil" style={{ color: 'inherit', textDecoration: 'none' }}>
          {usuario.nome}
        </Link>
        <span>{rotuloDoPapel(usuario.papel)}</span>
        <span className="espaco" />
        <AlternadorDeTema />
        <form action={sair}>
          <button type="submit">Sair</button>
        </form>
      </footer>
    </CascaDoSistema>
  )
}
