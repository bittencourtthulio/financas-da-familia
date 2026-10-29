import { redefinirSenhaDeFilho, redefinirSenhaDeUsuario } from '@/app/acoes'
import { Formulario, Campo } from '@/componentes/Formulario'

/**
 * O responsável define uma senha nova para um membro da família. Para o
 * adulto, `id` é o do usuário; para o filho, o do cadastro dele.
 */
export function RedefinirSenha({
  id,
  nome,
  tipo,
}: {
  id: string
  nome: string
  tipo: 'adulto' | 'filho'
}) {
  return (
    <section className="secao-da-senha" aria-labelledby={`titulo-da-senha-${id}`}>
      <h2 id={`titulo-da-senha-${id}`} className="titulo-menor">
        Senha de {nome}
      </h2>
      <p className="nota-do-campo">
        Define uma senha nova (mínimo de 8 caracteres). {nome} é desconectado e entra com a nova.
      </p>
      <Formulario acao={tipo === 'filho' ? redefinirSenhaDeFilho : redefinirSenhaDeUsuario} rotulo="Redefinir senha">
        <input type="hidden" name="id" value={id} />
        <Campo nome="senha" rotulo="Nova senha" tipo="password" />
        <Campo nome="confirmacao" rotulo="Confirme a nova senha" tipo="password" />
      </Formulario>
    </section>
  )
}
