import Link from 'next/link'
import { formatarMoeda } from '@/lib/formato'
import { rotuloDoMes } from '@/lib/datas'
import { enderecoDasFinancas } from '@/lib/resumo-links'
import { ListaDeCategorias, ListaDePessoas } from '@/componentes/ListasDeDespesa'
import { enderecoDaLista } from '@/lib/lancamentos-links'
import type { ResumoDoMes as Resumo } from '@/servicos/resumo'

function estadoDoSaldo(saldoCentavos: number) {
  if (saldoCentavos < 0) {
    return {
      estado: 'negativo',
      frase: 'Saldo negativo: as despesas passaram das receitas.',
      classe: 'valor-despesa',
    }
  }
  if (saldoCentavos === 0) {
    return {
      estado: 'zerado',
      frase: 'Saldo zerado: receitas e despesas se igualaram.',
      classe: '',
    }
  }
  return {
    estado: 'positivo',
    frase: 'Saldo positivo: sobrou dinheiro no mês.',
    classe: 'valor-receita',
  }
}

/**
 * O resumo do mês no painel (FT-04): receitas, despesas, saldo e as despesas
 * por categoria. Os valores chegam prontos, em centavos inteiros, do servidor
 * (PR-02); aqui só se formata. O saldo nunca depende só de cor: leva sinal de
 * menos e uma frase. Mês sem lançamento mostra o estado vazio com atalho.
 */
export function ResumoDoMes({ resumo }: { resumo: Resumo }) {
  const mesPorExtenso = rotuloDoMes(resumo.mes)

  if (resumo.quantidadeDeLancamentos === 0) {
    return (
      <p className="vazio">
        Nenhum lançamento em {mesPorExtenso}. Use{' '}
        <Link href="/lancamentos/novo">Novo lançamento</Link> para registrar uma receita ou uma
        despesa, ou abra <Link href={enderecoDaLista({ mes: resumo.mes })}>Lançamentos</Link>.
      </p>
    )
  }

  const saldo = estadoDoSaldo(resumo.saldoCentavos)

  return (
    <div className="resumo-do-mes">
      <section className="cartoes-do-resumo" aria-label={`Totais de ${mesPorExtenso}`}>
        <div className="cartao-do-resumo" data-cartao="receitas" role="group" aria-labelledby="rotulo-receitas">
          <h2 id="rotulo-receitas" className="rotulo-do-cartao">
            Receitas
          </h2>
          <p className="valor-do-cartao valor-receita">{formatarMoeda(resumo.receitasCentavos)}</p>
        </div>

        <div className="cartao-do-resumo" data-cartao="despesas" role="group" aria-labelledby="rotulo-despesas">
          <h2 id="rotulo-despesas" className="rotulo-do-cartao">
            Despesas
          </h2>
          <p className="valor-do-cartao valor-despesa">{formatarMoeda(resumo.despesasCentavos)}</p>
        </div>

        <div
          className="cartao-do-resumo cartao-do-saldo"
          role="group"
          aria-labelledby="rotulo-saldo"
          data-saldo={saldo.estado}
        >
          <h2 id="rotulo-saldo" className="rotulo-do-cartao">
            Saldo do mês
          </h2>
          <p className={`valor-do-cartao ${saldo.classe}`.trim()}>
            {formatarMoeda(resumo.saldoCentavos)}
          </p>
          <p className="frase-do-saldo">{saldo.frase}</p>
        </div>
      </section>

      <div className="listas-do-resumo">
        <section className="categorias-do-resumo" aria-labelledby="titulo-categorias">
          <h2 id="titulo-categorias" className="titulo-da-secao">
            Despesas por categoria
          </h2>
          {resumo.despesasPorCategoria.length === 0 ? (
            <p className="vazio">Nenhuma despesa em {mesPorExtenso}.</p>
          ) : (
            <ListaDeCategorias itens={resumo.despesasPorCategoria} total={resumo.despesasCentavos} />
          )}
        </section>

        <section className="pessoas-do-resumo" aria-labelledby="titulo-pessoas">
          <h2 id="titulo-pessoas" className="titulo-da-secao">
            Quem mais gasta
          </h2>
          {resumo.despesasPorPessoa.length === 0 ? (
            <p className="vazio">Nenhuma despesa em {mesPorExtenso}.</p>
          ) : (
            <ListaDePessoas itens={resumo.despesasPorPessoa} total={resumo.despesasCentavos} />
          )}
          <p className="nota-do-campo">
            <Link href={enderecoDasFinancas({ mes: resumo.mes })}>Ver Nossas Finanças</Link>
          </p>
        </section>
      </div>
    </div>
  )
}
