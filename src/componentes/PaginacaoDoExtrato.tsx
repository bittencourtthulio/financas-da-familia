import Link from 'next/link'
import { enderecoDoExtrato, enderecoDoExtratoDoFilho } from '@/lib/mesada'

/**
 * Anterior e Próxima por link, sem JavaScript. Do filho, o endereço não leva
 * id nenhum (`/mesada`); do responsável, leva o filho. Com uma página só, nada.
 */
export function PaginacaoDoExtrato({
  pagina,
  paginas,
  filhoId,
}: {
  pagina: number
  paginas: number
  filhoId?: string
}) {
  if (paginas <= 1) return null
  const para = (p: number) => (filhoId ? enderecoDoExtratoDoFilho(filhoId, p) : enderecoDoExtrato(p))

  return (
    <nav aria-label="Páginas do extrato" className="paginacao">
      {pagina > 1 && <Link href={para(pagina - 1)}>Anterior</Link>}
      <span>
        Página {pagina} de {paginas}
      </span>
      {pagina < paginas && <Link href={para(pagina + 1)}>Próxima</Link>}
    </nav>
  )
}
