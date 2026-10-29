import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { adultoDaFamilia } from '@/servicos/avatares'
import { editarUsuario } from '@/app/acoes'
import { salvarAvatarDoUsuario } from '@/app/acoes-avatar'
import { Formulario, Campo } from '@/componentes/Formulario'
import { EditorDeAvatar } from '@/componentes/EditorDeAvatar'
import { RedefinirSenha } from '@/componentes/RedefinirSenha'
import { DesativarAdulto } from '@/componentes/DesativarAdulto'
import { PAPEIS_DA_INTERFACE } from '@/lib/papeis'
import { ErroDeAplicacao } from '@/lib/erros'

/**
 * Um adulto da família (FT-10): o responsável edita nome, e-mail, o papel de
 * acesso (Responsável ou Adulto) e o avatar. O serviço de usuários continua
 * sendo quem decide (último responsável, e-mail repetido, filho não muda aqui).
 */
export default async function EditarAdulto({ params }: { params: Promise<{ id: string }> }) {
  const admin = await exigirUsuarioAdmin()
  const { id } = await params

  let adulto
  try {
    adulto = await adultoDaFamilia(admin, id)
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao && erro.status === 404) notFound()
    throw erro
  }

  return (
    <div className="tela-de-formulario">
      <h1 className="titulo-da-tela">{adulto.nome}</h1>
      <p className="subtitulo-da-tela">
        Dados, acesso e avatar. <Link href="/familia">Voltar para a família</Link>
      </p>

      <Formulario acao={editarUsuario} rotulo="Salvar alterações">
        <input type="hidden" name="id" value={adulto.id} />
        <Campo nome="nome" rotulo="Nome" padrao={adulto.nome} />
        <Campo nome="email" rotulo="E-mail" tipo="email" padrao={adulto.email} />
        <label className="campo">
          <span>Acesso</span>
          <select name="papel" defaultValue={adulto.papel}>
            {PAPEIS_DA_INTERFACE.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.rotulo}
              </option>
            ))}
          </select>
        </label>
        <p className="nota-do-campo">
          O responsável cuida de tudo: família, filhos, mesada, privacidade e usuários. O adulto lança e vê
          as contas da casa.
        </p>
      </Formulario>

      <section className="secao-do-avatar" aria-labelledby="titulo-do-avatar">
        <h2 id="titulo-do-avatar" className="titulo-menor">
          Avatar de {adulto.nome}
        </h2>
        <Formulario acao={salvarAvatarDoUsuario} rotulo="Salvar avatar">
          <input type="hidden" name="id" value={adulto.id} />
          <EditorDeAvatar key={JSON.stringify(adulto.avatar)} inicial={adulto.avatar} figuras={['pai', 'mae']} tipo="adulto" />
        </Formulario>
      </section>

      {adulto.id !== admin.id && <RedefinirSenha id={adulto.id} nome={adulto.nome} tipo="adulto" />}

      {adulto.ativo && adulto.id !== admin.id && <DesativarAdulto id={adulto.id} nome={adulto.nome} />}
    </div>
  )
}
