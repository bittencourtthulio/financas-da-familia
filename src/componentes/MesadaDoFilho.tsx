import { descricaoDaMesada } from '@/lib/filhos'
import { SaldoDaMesada } from '@/componentes/SaldoDaMesada'
import { ExtratoDeMesada } from '@/componentes/ExtratoDeMesada'
import { PaginacaoDoExtrato } from '@/componentes/PaginacaoDoExtrato'
import type { ExtratoDeMesada as Extrato } from '@/servicos/mesada'

/**
 * A página de mesada do próprio filho (FT-05 e FT-06): o saldo em destaque, dito
 * em texto, o extrato do mais recente ao mais antigo e o que ficou combinado
 * como referência. Somente leitura: nenhum formulário, botão nem link de
 * edição, e nenhum id na página. Os totais vêm somados do servidor (PR-02).
 */
export function MesadaDoFilho({ extrato }: { extrato: Extrato }) {
  const { filho } = extrato

  return (
    <>
      <h1 className="titulo-da-tela">Minha mesada</h1>
      <p className="subtitulo-da-tela">Olá, {filho.nome}. Aqui estão o seu saldo e o seu extrato.</p>

      <SaldoDaMesada
        saldoCentavos={extrato.saldoCentavos}
        creditosCentavos={extrato.creditosCentavos}
        gastosCentavos={extrato.gastosCentavos}
      />

      <section className="mesada-combinada-do-filho" aria-labelledby="rotulo-combinado">
        <h2 id="rotulo-combinado" className="rotulo-do-cartao">
          Mesada combinada
        </h2>
        <p className="valor-da-mesada">{descricaoDaMesada(filho.mesadaCentavos, filho.periodicidade)}</p>
        <p className="nota-do-campo">Este é o combinado com o responsável, não um saldo.</p>
      </section>

      <section aria-labelledby="titulo-dos-movimentos">
        <h2 id="titulo-dos-movimentos" className="titulo-da-secao">
          Movimentos
        </h2>
        <ExtratoDeMesada itens={extrato.itens} />
        <PaginacaoDoExtrato pagina={extrato.pagina} paginas={extrato.paginas} />
      </section>
    </>
  )
}
