import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { obterFilho } from '@/servicos/filhos'
import { avataresDosFilhos } from '@/servicos/avatares'
import { salvarFilho } from '@/app/acoes'
import { salvarAvatarDoFilho } from '@/app/acoes-avatar'
import { Formulario } from '@/componentes/Formulario'
import { CamposDoFilho } from '@/componentes/CamposDoFilho'
import { EditorDeAvatar } from '@/componentes/EditorDeAvatar'
import { RedefinirSenha } from '@/componentes/RedefinirSenha'
import { LoginDoFilho } from '@/componentes/LoginDoFilho'
import { ApagarFilho } from '@/componentes/ApagarFilho'
import { ErroDeAplicacao } from '@/lib/erros'
import { centavosParaCampo } from '@/lib/dinheiro'

/**
 * Editar um filho, o avatar dele (FT-10) e gerenciar o login. Só o
 * responsável; id que não existe cai em "não encontrado".
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
  const avatar = (await avataresDosFilhos(admin))[filho.id] ?? null

  return (
    <div className="tela-de-formulario">
      <h1 className="titulo-da-tela">{filho.nome}</h1>
      <p className="subtitulo-da-tela">
        Corrija os dados e salve. <Link href="/familia">Voltar para a família</Link>
      </p>
      <p>
        <Link href={`/filhos/${filho.id}/mesada`}>Ver mesada e extrato de {filho.nome}</Link>
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

      <section className="secao-do-avatar" aria-labelledby="titulo-do-avatar">
        <h2 id="titulo-do-avatar" className="titulo-menor">
          Avatar de {filho.nome}
        </h2>
        <p className="nota-do-campo">
          O bonequinho que representa {filho.nome} no painel da família. {filho.login ? 'Com login, o próprio filho também pode escolher em Meu perfil.' : ''}
        </p>
        <Formulario acao={salvarAvatarDoFilho} rotulo="Salvar avatar">
          <input type="hidden" name="id" value={filho.id} />
          <EditorDeAvatar key={JSON.stringify(avatar)} inicial={avatar} figuras={['menino', 'menina']} tipo="crianca" />
        </Formulario>
      </section>

      <LoginDoFilho filhoId={filho.id} login={filho.login} />
      {filho.login && <RedefinirSenha id={filho.id} nome={filho.nome} tipo="filho" />}

      <ApagarFilho filhoId={filho.id} nome={filho.nome} />
    </div>
  )
}
