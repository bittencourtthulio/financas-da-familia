import Link from 'next/link'
import { exigirUsuario } from '@/app/sessao-servidor'
import { Navegacao } from '@/componentes/Navegacao'
import { AlternadorDeTema } from '@/componentes/AlternadorDeTema'
import { sair } from '@/app/acoes'
import { NOME_DO_SISTEMA } from '@/lib/marca'

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
    <div className="aplicacao">
      <div className="barra-de-atividade" role="presentation" />

      <aside className="barra-lateral">
        <div className="marca">{NOME_DO_SISTEMA}</div>
        <Navegacao ehAdmin={usuario.papel === 'admin'} />
      </aside>

      <main className="conteudo">{children}</main>

      <footer className="barra-de-status">
        <Link href="/perfil" style={{ color: 'inherit', textDecoration: 'none' }}>
          {usuario.nome}
        </Link>
        <span>{usuario.papel === 'admin' ? 'Administrador' : 'Usuário'}</span>
        <span className="espaco" />
        <AlternadorDeTema />
        <form action={sair}>
          <button type="submit">Sair</button>
        </form>
      </footer>
    </div>
  )
}
