// Apresentação da mesada dos filhos (FT-06): funções puras, sem banco. Todo
// valor é inteiro em centavos (PR-02); o saldo é dito em texto, nunca só por
// cor (PR-16), e o gasto sai com sinal de menos.

import { formatarMoeda } from '@/lib/formato'

export type SituacaoDoSaldo = 'positivo' | 'zerado' | 'negativo'

export interface DescricaoDoSaldo {
  situacao: SituacaoDoSaldo
  /** Rótulo curto, que a tela mostra junto do valor. */
  rotulo: string
  /** Frase que explica a situação em palavras. */
  frase: string
}

/** O saldo em texto: disponível, zerado ou negativo (PR-32). */
export function situacaoDoSaldo(saldoCentavos: number): DescricaoDoSaldo {
  if (!Number.isSafeInteger(saldoCentavos)) {
    throw new Error('O saldo em centavos precisa ser um número inteiro.')
  }
  if (saldoCentavos < 0) {
    return {
      situacao: 'negativo',
      rotulo: 'Saldo negativo',
      frase: 'Os gastos passaram do que foi recebido.',
    }
  }
  if (saldoCentavos === 0) {
    return { situacao: 'zerado', rotulo: 'Saldo zerado', frase: 'Saldo zerado: não sobrou nada por enquanto.' }
  }
  return { situacao: 'positivo', rotulo: 'Saldo disponível', frase: 'O que sobra entre o recebido e o gasto.' }
}

/** O crédito sai sem sinal e o gasto com sinal de menos: "R$ 50,00", "-R$ 12,30". */
export function valorDoMovimento(tipo: string, centavos: number): string {
  return formatarMoeda(tipo === 'gasto' ? -centavos : centavos)
}

/** O aviso ao registrar um gasto que deixou o saldo negativo; `null` se não deixou. */
export function avisoDeSaldoNegativo(saldoCentavos: number): string | null {
  return saldoCentavos < 0 ? 'Atenção: o saldo ficou negativo.' : null
}

const comPagina = (base: string, pagina?: number | null) =>
  pagina && pagina > 1 ? `${base}?pagina=${pagina}` : base

/** O endereço do extrato do próprio filho. */
export function enderecoDoExtrato(pagina?: number | null): string {
  return comPagina('/mesada', pagina)
}

/** O endereço do extrato de um filho, para o responsável. */
export function enderecoDoExtratoDoFilho(filhoId: string, pagina?: number | null): string {
  return comPagina(`/filhos/${filhoId}/mesada`, pagina)
}

/**
 * A página pedida na URL. Só texto de dígitos de tamanho razoável vale; lista,
 * objeto, sinal, ponto, letra e notação científica são ignorados (o serviço
 * ainda trava a página no intervalo).
 */
export function lerPagina(consulta: unknown): number | undefined {
  if (typeof consulta !== 'string' || !/^\d{1,6}$/.test(consulta)) return undefined
  return parseInt(consulta, 10)
}
