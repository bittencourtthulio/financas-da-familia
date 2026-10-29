import Link from 'next/link'
import { exigirUsuarioDeLancamentos } from '@/app/sessao-servidor'
import { listarCategorias } from '@/servicos/lancamentos'
import { pessoasDaFamilia } from '@/servicos/avatares'
import { registrarLancamento } from '@/app/acoes'
import { Formulario } from '@/componentes/Formulario'
import { CamposDeLancamento } from '@/componentes/CamposDeLancamento'
import { hojeEmSaoPaulo } from '@/lib/datas'

/** Novo lançamento. A data já vem com o dia de hoje em São Paulo. */
export default async function NovoLancamento() {
  const usuario = await exigirUsuarioDeLancamentos()
  const categorias = await listarCategorias(usuario)
  const pessoas = await pessoasDaFamilia(usuario)

  return (
    <div className="tela-de-formulario">
      <h1 className="titulo-da-tela">Novo lançamento</h1>
      <p className="subtitulo-da-tela">
        Registre uma receita ou uma despesa da casa. <Link href="/lancamentos">Voltar para a lista</Link>
      </p>

      <Formulario acao={registrarLancamento} rotulo="Salvar lançamento">
        <CamposDeLancamento categorias={categorias} pessoas={pessoas} pessoaPadrao={usuario.id} hoje={hojeEmSaoPaulo()} />
      </Formulario>
    </div>
  )
}
