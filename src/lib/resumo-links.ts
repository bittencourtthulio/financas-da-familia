// Endereços e contas de exibição do resumo do mês (FT-04). O mês vai na
// consulta da tela inicial, como em `lancamentos-links.ts`, para a navegação
// funcionar por link, sem JavaScript.
import { mesAnterior, mesSeguinte, mesValido } from '@/lib/datas'

/** "/" para o mês corrente (sem consulta) ou "/?mes=AAAA-MM". */
export function enderecoDoPainel(mes: string | null): string {
  return mes ? `/?mes=${mes}` : '/'
}

/**
 * Os meses vizinhos que a tela pode oferecer. Fora de 2000 a 2100 não há
 * vizinho (`null`): o link some em vez de levar a um mês que o servidor
 * trataria como o corrente.
 */
export function mesesVizinhos(mes: string): { anterior: string | null; seguinte: string | null } {
  const anterior = mesAnterior(mes)
  const seguinte = mesSeguinte(mes)
  return {
    anterior: mesValido(anterior) ? anterior : null,
    seguinte: mesValido(seguinte) ? seguinte : null,
  }
}

/**
 * Quanto a parte pesa no total, como inteiro de 0 a 100, só com divisão exata
 * de inteiros (PR-02). Serve à largura da barra; o valor que a pessoa lê é
 * sempre o da soma em centavos.
 */
export function parteEmPercentual(parte: number, total: number): number {
  if (total <= 0 || parte <= 0) return 0
  if (parte >= total) return 100
  const cem = parte * 100
  return (cem - (cem % total)) / total
}

/** "/financas" com mês e pessoa na consulta; sem nenhum dos dois, o endereço limpo. */
export function enderecoDasFinancas({ mes, pessoa }: { mes?: string | null; pessoa?: string | null }): string {
  const consulta = new URLSearchParams()
  if (mes) consulta.set('mes', mes)
  if (pessoa) consulta.set('pessoa', pessoa)
  const texto = consulta.toString()
  return texto ? `/financas?${texto}` : '/financas'
}
