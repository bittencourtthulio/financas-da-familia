import Link from 'next/link'
import { exigirUsuarioDeLancamentos } from '@/app/sessao-servidor'
import { mesAtualEmSaoPaulo, rotuloDoMes } from '@/lib/datas'
import { formatarMoeda } from '@/lib/formato'
import { enderecoDasFinancas } from '@/lib/resumo-links'
import { financasDoMes } from '@/servicos/resumo'
import { SeletorDeMes } from '@/componentes/SeletorDeMes'
import { ListaDeCategorias, ListaDePessoas } from '@/componentes/ListasDeDespesa'

/**
 * Nossas Finanças: o relatório das despesas do mês por categoria e por pessoa
 * da família. Escolher uma pessoa mostra em quais categorias ela mais gastou.
 * Mês e pessoa vêm da consulta; valor inválido vira o padrão no serviço.
 */
export default async function NossasFinancas({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string | string[]; pessoa?: string | string[] }>
}) {
  const usuario = await exigirUsuarioDeLancamentos()
  const consulta = await searchParams
  const agora = new Date()
  const f = await financasDoMes(usuario, consulta, agora)
  const mesPorExtenso = rotuloDoMes(f.mes)
  const pessoaId = f.pessoa?.id ?? null

  return (
    <>
      <h1 className="titulo-da-tela">Nossas Finanças</h1>
      <p className="subtitulo-da-tela">Para onde vai o dinheiro da casa e quem da família está gastando.</p>

      <SeletorDeMes
        mes={f.mes}
        mesAtual={mesAtualEmSaoPaulo(agora)}
        endereco={(mes) => enderecoDasFinancas({ mes, pessoa: pessoaId })}
      />

      <nav className="filtro-de-pessoa" aria-label="Filtrar por pessoa da família">
        <Link href={enderecoDasFinancas({ mes: f.mes })} aria-current={pessoaId ? undefined : 'page'}>
          Todos
        </Link>
        {f.pessoas.map((p) => (
          <Link
            key={p.id}
            href={enderecoDasFinancas({ mes: f.mes, pessoa: p.id })}
            aria-current={p.id === pessoaId ? 'page' : undefined}
          >
            {p.nome}
          </Link>
        ))}
      </nav>

      <p className="total-das-financas">
        {f.pessoa ? `Despesas de ${f.pessoa.nome}` : 'Despesas da casa'} em {mesPorExtenso}:{' '}
        <strong className="valor-despesa">{formatarMoeda(f.despesasCentavos)}</strong>
      </p>

      <div className="listas-do-resumo">
        <section aria-labelledby="titulo-categorias">
          <h2 id="titulo-categorias" className="titulo-da-secao">
            {f.pessoa ? `Em que ${f.pessoa.nome} mais gasta` : 'Despesas por categoria'}
          </h2>
          {f.despesasPorCategoria.length === 0 ? (
            <p className="vazio">
              {f.pessoa ? `${f.pessoa.nome} não tem despesa` : 'Nenhuma despesa'} em {mesPorExtenso}.
            </p>
          ) : (
            <ListaDeCategorias itens={f.despesasPorCategoria} total={f.despesasCentavos} />
          )}
        </section>

        <section aria-labelledby="titulo-pessoas">
          <h2 id="titulo-pessoas" className="titulo-da-secao">
            Despesas por pessoa
          </h2>
          {f.despesasPorPessoa.length === 0 ? (
            <p className="vazio">Nenhuma despesa em {mesPorExtenso}.</p>
          ) : (
            <ListaDePessoas
              itens={f.despesasPorPessoa}
              total={f.despesasPorPessoa.reduce((soma, p) => soma + p.totalCentavos, 0)}
              endereco={(id) => enderecoDasFinancas({ mes: f.mes, pessoa: id })}
              selecionada={pessoaId}
            />
          )}
          <p className="nota-do-campo">
            Despesas sem pessoa marcada aparecem como “Sem pessoa”. Escolha quem gastou ao lançar.
          </p>
        </section>
      </div>
    </>
  )
}
