'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Avatar } from '@/lib/avatar'
import { Rostinho } from '@/componentes/ilustracoes/Familia'

/**
 * O badge do usuário no cabeçalho, com o menu suspenso: quem é (rostinho ou
 * inicial, nome, papel, e-mail), os atalhos da conta, o tema e o Sair. Fecha
 * ao clicar fora, ao apertar Esc e ao escolher um atalho. O que vai dentro
 * do menu (o alternador de tema e o formulário de sair) vem de quem usa, para
 * o componente não conhecer ação de servidor nenhuma.
 */
export function MenuDoUsuario({
  nome,
  email,
  papel,
  avatar = null,
  tipo = 'adulto',
  children,
}: {
  nome: string
  email: string
  /** O rótulo do papel, já no vocabulário do domínio (Responsável, Adulto, Filho). */
  papel: string
  avatar?: Avatar | null
  tipo?: 'adulto' | 'crianca'
  children: React.ReactNode
}) {
  const [aberto, setAberto] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const inicial = nome.trim().charAt(0).toUpperCase() || '?'
  const fechar = () => setAberto(false)

  useEffect(() => {
    if (!aberto) return
    const foraDoMenu = (evento: MouseEvent) => {
      if (raiz.current && !raiz.current.contains(evento.target as Node)) setAberto(false)
    }
    const esc = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', foraDoMenu)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', foraDoMenu)
      document.removeEventListener('keydown', esc)
    }
  }, [aberto])

  const rosto = (classe: string) =>
    avatar ? (
      <Rostinho avatar={avatar} tipo={tipo} className={classe} />
    ) : (
      <span className={`avatar-inicial ${classe}`} aria-hidden="true">
        {inicial}
      </span>
    )

  return (
    <div className="menu-do-usuario" ref={raiz}>
      <button
        type="button"
        className="badge-do-usuario"
        onClick={() => setAberto((a) => !a)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls="painel-do-usuario"
      >
        {rosto('avatar-do-badge')}
        <span className="nome-do-usuario">{nome}</span>
        <span>{papel}</span>
        <span className="seta" aria-hidden="true" />
      </button>

      {aberto && (
        <div className="painel-do-usuario" id="painel-do-usuario" role="menu" aria-label="Menu do usuário">
          <div className="quem-esta-logado">
            {rosto('grande')}
            <div>
              <strong>{nome}</strong>
              <small>{email}</small>
            </div>
          </div>
          <Link href="/perfil" role="menuitem" onClick={fechar}>
            Meu perfil e avatar
          </Link>
          <Link href="/perfil/senha" role="menuitem" onClick={fechar}>
            Trocar senha
          </Link>
          <div className="separador-do-menu" role="separator" />
          {children}
        </div>
      )}
    </div>
  )
}
