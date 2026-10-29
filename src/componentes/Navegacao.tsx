'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * A navegação padrão do P-9. As features do projeto acrescentam itens aqui.
 * A área Família (FT-10) reúne o cadastro de todo mundo, filhos e adultos; Configurações fica
 * só com o perfil. O `data-icone` escolhe o ícone desenhado pelo CSS
 * (global.css): o texto do link continua sendo o rótulo.
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
  const marcaArea = (raiz: string) =>
    atual === raiz || atual?.startsWith(`${raiz}/`) ? ({ 'aria-current': 'page' } as const) : {}

  // Lançamentos fica marcado também em "novo" e na edição.
  const marcaLancamentos = (rota: string | null) =>
    rota === '/lancamentos' || rota?.startsWith('/lancamentos/')
      ? ({ 'aria-current': 'page' } as const)
      : {}

  return (
    <nav className="navegacao" aria-label="Navegação principal">
      <Link href="/" data-icone="painel" {...marca('/')}>
        Painel
      </Link>
      {podeLancar && (
        <>
          <Link href="/lancamentos" data-icone="lancamentos" {...marcaLancamentos(atual)}>
            Lançamentos
          </Link>
        </>
      )}
      {podeLancar && (
        <Link href="/financas" data-icone="financas" {...marcaArea('/financas')}>
          Nossas Finanças
        </Link>
      )}
      {ehFilho && (
        <Link href="/mesada" data-icone="mesada" {...marca('/mesada')}>
          Minha mesada
        </Link>
      )}
      {ehAdmin && (
        <>
          <Link href="/familia" data-icone="familia" {...marcaArea('/familia')}>
            Família
          </Link>
          <Link href="/atividade" data-icone="atividade" {...marca('/atividade')}>
            Atividade
          </Link>
          <Link href="/privacidade" data-icone="privacidade" {...marca('/privacidade')}>
            Privacidade
          </Link>
        </>
      )}

      <h2>Configurações</h2>
      <Link href="/perfil" className="aninhado" data-icone="perfil" {...marca('/perfil')}>
        Meu perfil
      </Link>
    </nav>
  )
}
