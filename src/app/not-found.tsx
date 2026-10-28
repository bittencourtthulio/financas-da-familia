import Link from 'next/link'

/** Rota que não existe. Substitui a tela padrão do Next, que é em inglês. */
export default function NaoEncontrado() {
  return (
    <main className="conteudo">
      <div className="estado">
        <h1 className="titulo-da-tela">Página não encontrada</h1>
        <p>O endereço que você abriu não existe ou foi removido.</p>
        <p>
          <Link href="/">Voltar ao painel</Link>
        </p>
      </div>
    </main>
  )
}
