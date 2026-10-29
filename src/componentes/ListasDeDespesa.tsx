import Link from 'next/link'
import { formatarMoeda } from '@/lib/formato'
import { Rostinho } from '@/componentes/ilustracoes/Familia'
import { parteEmPercentual } from '@/lib/resumo-links'
import type { CategoriaDoResumo, PessoaDoResumo } from '@/servicos/resumo'

const quantidadeEmTexto = (n: number) => (n === 1 ? '1 lançamento' : `${n} lançamentos`)

/** Despesas por categoria: nome, quantidade, valor e uma barra proporcional. */
export function ListaDeCategorias({ itens, total }: { itens: CategoriaDoResumo[]; total: number }) {
  return (
    <ul className="lista-de-categorias">
      {itens.map((c) => (
        <li key={c.categoriaId} className="linha-de-categoria">
          <span className="nome-da-categoria">{c.nome}</span>
          <span className="quantidade-da-categoria">{quantidadeEmTexto(c.quantidade)}</span>
          <span className="valor valor-da-categoria">{formatarMoeda(c.totalCentavos)}</span>
          <span className="barra-de-categoria" aria-hidden="true">
            <span style={{ width: `${parteEmPercentual(c.totalCentavos, total)}%` }} />
          </span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Quem da família gasta mais, da maior soma para a menor. Com `endereco`, cada
 * pessoa vira um link (o filtro de Nossas Finanças); `selecionada` marca a
 * que está filtrada, em texto e não só em cor.
 */
export function ListaDePessoas({
  itens,
  total,
  endereco,
  selecionada,
}: {
  itens: PessoaDoResumo[]
  total: number
  endereco?: (pessoaId: string) => string
  selecionada?: string | null
}) {
  return (
    <ul className="lista-de-categorias lista-de-pessoas">
      {itens.map((p) => {
        const marcada = p.pessoaId !== null && p.pessoaId === selecionada
        const nome =
          endereco && p.pessoaId ? (
            <Link href={endereco(p.pessoaId)} aria-current={marcada ? 'true' : undefined}>
              {p.nome}
            </Link>
          ) : (
            p.nome
          )
        return (
          <li key={p.pessoaId ?? 'sem-pessoa'} className="linha-de-categoria linha-de-pessoa" data-marcada={marcada ? 'sim' : 'nao'}>
            {p.pessoaId ? (
              <Rostinho avatar={p.avatar} tipo={p.tipo} className="avatar" titulo={p.nome} />
            ) : (
              <span className="rostinho-vazio" aria-hidden="true">?</span>
            )}
            <span className="nome-da-categoria">
              {nome}
              {marcada && <span className="discreto"> (filtrada)</span>}
            </span>
            <span className="quantidade-da-categoria">{quantidadeEmTexto(p.quantidade)}</span>
            <span className="valor valor-da-categoria">{formatarMoeda(p.totalCentavos)}</span>
            <span className="barra-de-categoria" aria-hidden="true">
              <span style={{ width: `${parteEmPercentual(p.totalCentavos, total)}%` }} />
            </span>
          </li>
        )
      })}
    </ul>
  )
}
