import Link from 'next/link'
import { enderecoDaLista } from '@/lib/lancamentos-links'

/** Anterior e Próxima por link, mantendo o mês e o tipo; com uma página só, nada. */
export function PaginacaoDeLancamentos({
  pagina,
  paginas,
  mes,
  tipo,
}: {
  pagina: number
  paginas: number
  mes: string
  tipo: string | null
}) {
  if (paginas <= 1) return null

  return (
    <nav aria-label="Páginas dos lançamentos" className="paginacao">
      {pagina > 1 && <Link href={enderecoDaLista({ mes, tipo, pagina: pagina - 1 })}>Anterior</Link>}
      <span>
        Página {pagina} de {paginas}
      </span>
      {pagina < paginas && <Link href={enderecoDaLista({ mes, tipo, pagina: pagina + 1 })}>Próxima</Link>}
    </nav>
  )
}
