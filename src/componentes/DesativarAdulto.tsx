'use client'

import { useActionState } from 'react'
import { desativarUsuario } from '@/app/acoes'

/** Desativa o acesso de um adulto. O serviço decide (não deixa desativar o último responsável). */
export function DesativarAdulto({ id, nome }: { id: string; nome: string }) {
  const [estado, executar] = useActionState(desativarUsuario, {})
  return (
    <section className="zona-de-perigo" aria-labelledby="titulo-desativar">
      <h2 id="titulo-desativar" className="titulo-menor">
        Acesso de {nome}
      </h2>
      <p className="nota-do-campo">Desativado, {nome} deixa de entrar no sistema.</p>
      {estado.erro && (
        <p className="aviso erro" role="alert">
          {estado.erro}
        </p>
      )}
      {estado.sucesso && (
        <p className="aviso sucesso" role="status">
          {estado.sucesso}
        </p>
      )}
      <form action={executar}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className="secundario">
          Desativar acesso
        </button>
      </form>
    </section>
  )
}
