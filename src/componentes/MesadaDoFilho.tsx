import { descricaoDaMesada } from '@/lib/filhos'
import type { MesadaDoFilho as Mesada } from '@/servicos/filhos'

/**
 * A página de mesada do próprio filho (FT-05): o que ficou combinado e, por
 * ora, o estado vazio dos movimentos (os créditos, gastos e o saldo são da
 * FT-06). O valor é o combinado, em centavos inteiros formatados (PR-02), e
 * não um saldo: a frase abaixo diz isso em palavras.
 */
export function MesadaDoFilho({ mesada }: { mesada: Mesada }) {
  return (
    <>
      <h1 className="titulo-da-tela">Minha mesada</h1>
      <p className="subtitulo-da-tela">Olá, {mesada.nome}. Aqui está a sua mesada.</p>

      <section className="mesada-combinada-do-filho" aria-labelledby="rotulo-combinado">
        <h2 id="rotulo-combinado" className="rotulo-do-cartao">
          Mesada combinada
        </h2>
        <p className="valor-da-mesada">{descricaoDaMesada(mesada.mesadaCentavos, mesada.periodicidade)}</p>
        <p className="nota-do-campo">Este é o combinado com o responsável, não um saldo.</p>
      </section>

      <section aria-labelledby="titulo-dos-movimentos">
        <h2 id="titulo-dos-movimentos" className="titulo-da-secao">
          Movimentos
        </h2>
        <p className="vazio">Ainda não há movimentos de mesada.</p>
      </section>
    </>
  )
}
