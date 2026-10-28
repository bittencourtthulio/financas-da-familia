// Formato brasileiro (PR-16): valor em reais e data no fuso da família.
// Valor monetário é sempre inteiro em centavos (PR-02); a formatação não
// passa por ponto flutuante.

export const FUSO_DA_FAMILIA = 'America/Sao_Paulo'

const NBSP = ' '

const milhares = new Intl.NumberFormat('pt-BR')

/** 123456 → "R$ 1.234,56". Centavos precisam ser um inteiro seguro. */
export function formatarMoeda(centavos: number): string {
  if (!Number.isSafeInteger(centavos)) {
    throw new Error('O valor em centavos precisa ser um número inteiro.')
  }
  const negativo = centavos < 0
  const absoluto = Math.abs(centavos)
  const reais = Math.trunc(absoluto / 100)
  const resto = String(absoluto % 100).padStart(2, '0')
  return `${negativo ? '-' : ''}R$${NBSP}${milhares.format(reais)},${resto}`
}

function comoData(valor: Date | string | number): Date {
  const data = valor instanceof Date ? valor : new Date(valor)
  if (Number.isNaN(data.getTime())) throw new Error('Data inválida.')
  return data
}

const soData = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO_DA_FAMILIA,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dataEHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO_DA_FAMILIA,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** "27/10/2026", no dia de São Paulo. */
export function formatarData(valor: Date | string | number): string {
  return soData.format(comoData(valor))
}

/** "27/10/2026 23:30", no horário de São Paulo. */
export function formatarDataEHora(valor: Date | string | number): string {
  return dataEHora.format(comoData(valor)).replace(', ', ' ')
}
