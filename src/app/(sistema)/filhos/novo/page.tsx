import Link from 'next/link'
import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { registrarFilho } from '@/app/acoes'
import { Formulario } from '@/componentes/Formulario'
import { CamposDoFilho } from '@/componentes/CamposDoFilho'

/** Cadastro de um filho. O login, se a família quiser, vem na página dele. */
export default async function NovoFilho() {
  await exigirUsuarioAdmin()

  return (
    <>
      <h1 className="titulo-da-tela">Cadastrar filho</h1>
      <p className="subtitulo-da-tela">
        Nome e mesada combinada. <Link href="/filhos">Voltar para a lista</Link>
      </p>

      <Formulario acao={registrarFilho} rotulo="Cadastrar filho">
        <CamposDoFilho />
      </Formulario>
    </>
  )
}
