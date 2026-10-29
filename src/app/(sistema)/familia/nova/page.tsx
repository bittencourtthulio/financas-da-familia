import Link from 'next/link'
import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { criarUsuario, registrarFilho } from '@/app/acoes'
import { Formulario, Campo } from '@/componentes/Formulario'
import { CamposDoFilho } from '@/componentes/CamposDoFilho'
import { PAPEIS_DA_INTERFACE } from '@/lib/papeis'

/**
 * Cadastro de uma pessoa da família: filho (nome e mesada) ou adulto (com
 * login e papel de acesso). Um só lugar para cadastrar todo mundo; o tipo vem
 * da consulta e o padrão é filho.
 */
export default async function NovaPessoa({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>
}) {
  await exigirUsuarioAdmin()
  const { tipo } = await searchParams
  const adulto = tipo === 'adulto'

  return (
    <div className="tela-de-formulario">
      <h1 className="titulo-da-tela">Adicionar à família</h1>
      <p className="subtitulo-da-tela">
        {adulto ? 'Quem vai usar o sistema, e com qual acesso.' : 'Nome e mesada combinada.'}{' '}
        <Link href="/familia">Voltar para a família</Link>
      </p>

      <nav className="escolha-de-tipo" aria-label="Quem você quer adicionar">
        <Link href="/familia/nova?tipo=filho" {...(!adulto ? { 'aria-current': 'page' as const } : {})}>
          Filho
        </Link>
        <Link href="/familia/nova?tipo=adulto" {...(adulto ? { 'aria-current': 'page' as const } : {})}>
          Adulto
        </Link>
      </nav>

      {adulto ? (
        <Formulario acao={criarUsuario} rotulo="Adicionar adulto">
          <Campo nome="nome" rotulo="Nome" />
          <Campo nome="email" rotulo="E-mail" tipo="email" />
          <Campo nome="senha" rotulo="Senha provisória" tipo="password" />
          <label className="campo">
            <span>Acesso</span>
            <select name="papel" defaultValue="usuario">
              {PAPEIS_DA_INTERFACE.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.rotulo}
                </option>
              ))}
            </select>
          </label>
        </Formulario>
      ) : (
        <Formulario acao={registrarFilho} rotulo="Adicionar filho">
          <CamposDoFilho />
        </Formulario>
      )}
    </div>
  )
}
