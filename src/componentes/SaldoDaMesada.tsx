import { formatarMoeda } from '@/lib/formato'
import { situacaoDoSaldo } from '@/lib/mesada'

/**
 * O saldo da mesada em destaque (PR-32). O número vem com sinal de menos
 * quando é negativo e sempre acompanhado do rótulo e da frase: a cor da borda
 * só reforça o que o texto já diz (PR-16). Os totais são dois inteiros somados
 * pelo servidor; a tela só formata.
 */
export function SaldoDaMesada({
  saldoCentavos,
  creditosCentavos,
  gastosCentavos,
}: {
  saldoCentavos: number
  creditosCentavos: number
  gastosCentavos: number
}) {
  const saldo = situacaoDoSaldo(saldoCentavos)

  return (
    <section className="saldo-da-mesada" aria-labelledby="rotulo-do-saldo" data-saldo={saldo.situacao}>
      <h2 id="rotulo-do-saldo" className="rotulo-do-cartao">
        {saldo.rotulo}
      </h2>
      <p className="valor-do-saldo">{formatarMoeda(saldoCentavos)}</p>
      <p className="frase-do-saldo">{saldo.frase}</p>
      <dl className="totais-da-mesada">
        <div>
          <dt>Recebido</dt>
          <dd className="valor-receita">{formatarMoeda(creditosCentavos)}</dd>
        </div>
        <div>
          <dt>Gasto</dt>
          <dd className="valor-despesa">{formatarMoeda(gastosCentavos)}</dd>
        </div>
      </dl>
    </section>
  )
}
