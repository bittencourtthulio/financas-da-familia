// Leitor do valor digitado (PR-02, PR-26). Todo valor do sistema é inteiro em
// centavos; esta é a única porta de entrada do texto digitado em reais. Ela
// trabalha só com texto e inteiros: nenhuma conversão para número com casa
// decimal, porque 19,99 * 100 em ponto flutuante não dá 1999 exato.

/** R$ 1.000.000,00: barra erro de digitação e cabe no inteiro do banco. */
export const VALOR_MAXIMO_EM_CENTAVOS = 100_000_000

// Inteiro com milhar opcional ("1.234.567" ou "1234567"), vírgula e até dois
// decimais, "R$" opcional na frente. O ponto só existe como separador de
// milhar, em grupos de três: "1234.56" é recusado por ser ambíguo.
const FORMATO_BRASILEIRO = /^(?:R\$\s*)?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/

/**
 * Lê "1.234,56" e devolve 123456. Devolve `null` para tudo que não for um
 * valor em reais positivo até o teto: vazio, letras, notação científica,
 * sinal, mais de dois decimais, ponto decimal, zero e acima de R$ 1.000.000,00.
 */
export function lerValorEmReais(entrada: unknown): number | null {
  if (typeof entrada !== 'string') return null
  const achado = FORMATO_BRASILEIRO.exec(entrada.trim())
  if (!achado) return null

  const inteiro = (achado[1] as string).replaceAll('.', '')
  const decimais = (achado[2] ?? '').padEnd(2, '0')
  // Mais de nove dígitos já passa do teto, e evita número grande demais.
  if (inteiro.length > 9) return null

  const centavos = parseInt(inteiro + decimais, 10)
  if (!Number.isSafeInteger(centavos)) return null
  if (centavos < 1 || centavos > VALOR_MAXIMO_EM_CENTAVOS) return null
  return centavos
}

/**
 * Centavos para o campo de edição: 123456 vira "1234,56" (sem milhar, para
 * ser lido de volta por `lerValorEmReais`). Montado por texto.
 */
export function centavosParaCampo(centavos: number): string {
  if (!Number.isSafeInteger(centavos) || centavos < 0) {
    throw new Error('O valor em centavos precisa ser um número inteiro não negativo.')
  }
  const digitos = String(centavos).padStart(3, '0')
  return `${digitos.slice(0, -2)},${digitos.slice(-2)}`
}
