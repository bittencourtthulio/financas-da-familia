import Link from 'next/link'

/** Anterior e Próxima por link, para a lista longa; com uma página só, nada. */
export function PaginacaoDeAtividade({
  pagina,
  paginas,
}: {
  pagina: number
  paginas: number
}) {
  if (paginas <= 1) return null

  return (
    <nav
      aria-label="Páginas da atividade"
      style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 16 }}
    >
      {pagina > 1 && <Link href={`/atividade?pagina=${pagina - 1}`}>Anterior</Link>}
      <span>
        Página {pagina} de {paginas}
      </span>
      {pagina < paginas && <Link href={`/atividade?pagina=${pagina + 1}`}>Próxima</Link>}
    </nav>
  )
}
