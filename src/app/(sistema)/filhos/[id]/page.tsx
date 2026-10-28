import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { obterFilho } from '@/servicos/filhos'
import { salvarFilho } from '@/app/acoes'
import { Formulario } from '@/componentes/Formulario'
import { CamposDoFilho } from '@/componentes/CamposDoFilho'
import { LoginDoFilho } from '@/componentes/LoginDoFilho'
import { ErroDeAplicacao } from '@/lib/erros'
import { centavosParaCampo } from '@/lib/dinheiro'

/**
 * Editar um filho e gerenciar o login dele. Só o responsável; id que não
 * existe cai em "não encontrado".
 */
export default async function EditarFilho({ params }: { params: Promise<{ id: string }> }) {
  const admin = await exigirUsuarioAdmin()
  const { id } = await params

  let filho
  try {
    filho = await obterFilho(admin, id)
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao && erro.status === 404) notFound()
    throw erro
  }

  return (
    <>
      <h1 className="titulo-da-tela">{filho.nome}</h1>
      <p className="subtitulo-da-tela">
        Corrija os dados e salve. <Link href="/filhos">Voltar para a lista</Link>
      </p>

      <Formulario acao={salvarFilho} rotulo="Salvar alterações">
        <CamposDoFilho
          inicial={{
            id: filho.id,
            nome: filho.nome,
            nascimento: filho.nascimento ?? '',
            valor: centavosParaCampo(filho.mesadaCentavos),
            periodicidade: filho.periodicidade,
          }}
        />
      </Formulario>

      <LoginDoFilho filhoId={filho.id} login={filho.login} />
    </>
  )
}
