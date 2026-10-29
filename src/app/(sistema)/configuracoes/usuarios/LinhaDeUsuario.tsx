'use client'

import { useActionState } from 'react'
import { desativarUsuario } from '@/app/acoes'
import { rotuloDoPapel } from '@/lib/papeis'

interface Props {
  usuario: {
    id: string
    nome: string
    email: string
    papel: string
    ativo: boolean
    ehVoce: boolean
  }
}

export function LinhaDeUsuario({ usuario }: Props) {
  const [estado, executar] = useActionState(desativarUsuario, {})

  return (
    <tr>
      <td>
        {usuario.nome}
        {usuario.ehVoce && <span className="discreto"> (você)</span>}
      </td>
      <td>{usuario.email}</td>
      <td>{rotuloDoPapel(usuario.papel)}</td>
      <td>{usuario.ativo ? 'Ativo' : 'Desativado'}</td>
      <td className="celula-acoes">
        {usuario.ativo && (
          <form action={executar}>
            <input type="hidden" name="id" value={usuario.id} />
            <button type="submit" className="secundario">
              Desativar
            </button>
          </form>
        )}
        {estado.erro && (
          <span className="aviso erro" role="alert">
            {estado.erro}
          </span>
        )}
      </td>
    </tr>
  )
}
