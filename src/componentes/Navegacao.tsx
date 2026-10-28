'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * A navegação padrão do P-9. As features do projeto acrescentam itens
 * aqui; não recriam a área de Configurações.
 */
export function Navegacao({
  ehAdmin,
  podeLancar = false,
  ehFilho = false,
}: {
  ehAdmin: boolean
  podeLancar?: boolean
  ehFilho?: boolean
}) {
  const atual = usePathname()
  const marca = (href: string) =>
    atual === href ? ({ 'aria-current': 'page' } as const) : {}

  // Lançamentos fica marcado também em "novo" e na edição, mas não em Categorias.
  const marcaLancamentos = (rota: string | null) =>
    rota === '/lancamentos' ||
    (rota?.startsWith('/lancamentos/') && rota !== '/lancamentos/categorias')
      ? ({ 'aria-current': 'page' } as const)
      : {}

  return (
    <nav className="navegacao" aria-label="Navegação principal">
      <Link href="/" {...marca('/')}>
        Painel
      </Link>
      {podeLancar && (
        <>
          <Link href="/lancamentos" {...marcaLancamentos(atual)}>
            Lançamentos
          </Link>
          <Link
            href="/lancamentos/categorias"
            className="aninhado"
            {...marca('/lancamentos/categorias')}
          >
            Categorias
          </Link>
        </>
      )}
      {ehFilho && (
        <Link href="/mesada" {...marca('/mesada')}>
          Minha mesada
        </Link>
      )}
      {ehAdmin && (
        <Link
          href="/filhos"
          {...(atual === '/filhos' || atual?.startsWith('/filhos/')
            ? ({ 'aria-current': 'page' } as const)
            : {})}
        >
          Filhos
        </Link>
      )}
      {ehAdmin && (
        <Link href="/atividade" {...marca('/atividade')}>
          Atividade
        </Link>
      )}

      <h2>Configurações</h2>
      {ehAdmin && (
        <Link
          href="/configuracoes/usuarios"
          className="aninhado"
          {...marca('/configuracoes/usuarios')}
        >
          Usuários
        </Link>
      )}
      <Link href="/perfil" className="aninhado" {...marca('/perfil')}>
        Meu perfil
      </Link>
    </nav>
  )
}
