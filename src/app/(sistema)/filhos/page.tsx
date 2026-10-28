import Link from 'next/link'
import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { listarFilhos } from '@/servicos/filhos'
import { ListaDeFilhos } from '@/componentes/ListaDeFilhos'

/**
 * Os filhos da família (FT-05). Só o responsável chega aqui: a guarda de
 * página e o serviço verificam o papel no servidor. Carregando e erro vêm do
 * `loading.tsx` e do `error.tsx` do grupo (sistema).
 */
export default async function Filhos() {
  const admin = await exigirUsuarioAdmin()
  const filhos = await listarFilhos(admin)

  return (
    <>
      <div className="cabecalho-da-tela">
        <div>
          <h1 className="titulo-da-tela">Filhos</h1>
          <p className="subtitulo-da-tela">Quem recebe mesada na família e quem tem login para consultá-la.</p>
        </div>
        <Link href="/filhos/novo" className="botao primario">
          Cadastrar filho
        </Link>
      </div>
      <ListaDeFilhos filhos={filhos} />
    </>
  )
}
