import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirUsuarioDeLancamentos } from '@/app/sessao-servidor'
import { listarCategorias, obterLancamento } from '@/servicos/lancamentos'
import { pessoasDaFamilia } from '@/servicos/avatares'
import { salvarLancamento } from '@/app/acoes'
import { Formulario } from '@/componentes/Formulario'
import { CamposDeLancamento } from '@/componentes/CamposDeLancamento'
import { ApagarLancamento } from '@/componentes/ApagarLancamento'
import { ErroDeAplicacao } from '@/lib/erros'
import { centavosParaCampo } from '@/lib/dinheiro'
import { hojeEmSaoPaulo, mesDaData } from '@/lib/datas'
import { enderecoDaLista } from '@/lib/lancamentos-links'

/** Editar e apagar um lançamento. Id que não existe cai em "não encontrado". */
export default async function EditarLancamento({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const usuario = await exigirUsuarioDeLancamentos()
  const { id } = await params

  let lancamento
  try {
    lancamento = await obterLancamento(usuario, id)
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao && erro.status === 404) notFound()
    throw erro
  }
  const categorias = await listarCategorias(usuario)
  const pessoas = await pessoasDaFamilia(usuario)

  return (
    <div className="tela-de-formulario">
      <h1 className="titulo-da-tela">Editar lançamento</h1>
      <p className="subtitulo-da-tela">
        Corrija os dados e salve.{' '}
        <Link href={enderecoDaLista({ mes: mesDaData(lancamento.data) })}>Voltar para a lista</Link>
      </p>

      <Formulario acao={salvarLancamento} rotulo="Salvar alterações">
        <CamposDeLancamento
          categorias={categorias}
          pessoas={pessoas}
          hoje={hojeEmSaoPaulo()}
          inicial={{
            id: lancamento.id,
            tipo: lancamento.tipo,
            valor: centavosParaCampo(lancamento.valorCentavos),
            data: lancamento.data,
            categoriaId: lancamento.categoriaId,
            pessoaId: lancamento.pessoaId,
            pago: lancamento.pago,
            recorrente: lancamento.recorrenciaId !== null,
            descricao: lancamento.descricao,
          }}
        />
      </Formulario>

      <ApagarLancamento id={lancamento.id} recorrente={lancamento.recorrenciaId !== null} />
    </div>
  )
}
