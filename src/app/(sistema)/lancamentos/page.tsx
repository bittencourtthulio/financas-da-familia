import Link from 'next/link'
import { exigirUsuarioDeLancamentos } from '@/app/sessao-servidor'
import { listarLancamentos } from '@/servicos/lancamentos'
import { familiaDe } from '@/servicos/avatares'
import { TabelaDeLancamentos } from '@/componentes/TabelaDeLancamentos'
import { FiltrosDeLancamentos } from '@/componentes/FiltrosDeLancamentos'
import { PaginacaoDeLancamentos } from '@/componentes/PaginacaoDeLancamentos'

/**
 * Os lançamentos da casa (FT-03). Só o responsável e o adulto chegam aqui:
 * `exigirUsuarioDeLancamentos` verifica no servidor, e `listarLancamentos`
 * verifica de novo. Carregando e erro vêm do `loading.tsx` e do `error.tsx`
 * do grupo (sistema). Mês, tipo e página vêm da consulta, e o serviço trata
 * valor inválido.
 */
export default async function Lancamentos({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; tipo?: string; pagina?: string }>
}) {
  const usuario = await exigirUsuarioDeLancamentos()
  const { mes, tipo, pagina } = await searchParams
  const lista = await listarLancamentos(usuario, { mes, tipo, pagina: Number(pagina) })
  const pessoas = Object.fromEntries(
    (await familiaDe(usuario)).map((m) => [m.id, { nome: m.nome, tipo: m.tipo, avatar: m.avatar }]),
  )

  return (
    <>
      <div className="cabecalho-da-tela">
        <div>
          <h1 className="titulo-da-tela">Lançamentos</h1>
          <p className="subtitulo-da-tela">Receitas e despesas da casa, mês a mês.</p>
        </div>
        <Link href="/lancamentos/novo" className="botao primario">
          Novo lançamento
        </Link>
      </div>

      <FiltrosDeLancamentos mes={lista.mes} tipo={lista.tipo} />
      <TabelaDeLancamentos itens={lista.itens} mes={lista.mes} tipo={lista.tipo} pessoas={pessoas} />
      <PaginacaoDeLancamentos
        pagina={lista.pagina}
        paginas={lista.paginas}
        mes={lista.mes}
        tipo={lista.tipo}
      />
    </>
  )
}
