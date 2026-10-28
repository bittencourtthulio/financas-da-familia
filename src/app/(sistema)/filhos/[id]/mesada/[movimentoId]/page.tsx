import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { obterMovimento } from '@/servicos/mesada'
import { salvarMovimentoDeMesada } from '@/app/acoes'
import { Formulario } from '@/componentes/Formulario'
import { CamposDeMovimento } from '@/componentes/CamposDeMovimento'
import { ApagarMovimento } from '@/componentes/ApagarMovimento'
import { centavosParaCampo } from '@/lib/dinheiro'
import { hojeEmSaoPaulo } from '@/lib/datas'
import { enderecoDoExtratoDoFilho } from '@/lib/mesada'
import { ErroDeAplicacao } from '@/lib/erros'

/**
 * Editar ou apagar um movimento de mesada. Só o responsável. O movimento tem de
 * ser do filho da URL: de outro filho, ou inexistente, cai em "não encontrado".
 */
export default async function EditarMovimento({
  params,
}: {
  params: Promise<{ id: string; movimentoId: string }>
}) {
  const admin = await exigirUsuarioAdmin()
  const { id, movimentoId } = await params

  let movimento
  try {
    movimento = await obterMovimento(admin, movimentoId)
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao && erro.status === 404) notFound()
    throw erro
  }
  if (movimento.filhoId !== id) notFound()

  return (
    <>
      <h1 className="titulo-da-tela">Movimento de {movimento.filhoNome}</h1>
      <p className="subtitulo-da-tela">
        Corrija os dados e salve. <Link href={enderecoDoExtratoDoFilho(id)}>Voltar para o extrato</Link>
      </p>

      <Formulario acao={salvarMovimentoDeMesada} rotulo="Salvar alterações">
        <CamposDeMovimento
          hoje={hojeEmSaoPaulo()}
          inicial={{
            id: movimento.id,
            tipo: movimento.tipo,
            valor: centavosParaCampo(movimento.valorCentavos),
            data: movimento.data,
            descricao: movimento.descricao,
          }}
        />
      </Formulario>

      <ApagarMovimento id={movimento.id} />
    </>
  )
}
