// Data civil (PR-16, PR-26): o dia de um lançamento é um texto AAAA-MM-DD no
// fuso da família, não um instante. Um instante em UTC faria um lançamento
// das 23h de 27/10 em São Paulo cair em 28/10. Comparar o texto equivale a
// comparar o calendário, e o filtro de mês fica uma comparação de texto.

// O fuso é o mesmo de `formato.ts` (FUSO_DA_FAMILIA); este módulo não o importa
// porque `formato.ts` importa daqui, e `tests/datas.test.ts` confere que os
// dois concordam.
const FUSO_DA_FAMILIA = 'America/Sao_Paulo'

export const DATA_MINIMA = '2000-01-01'
export const DATA_MAXIMA = '2100-12-31'

const ANO_MINIMO = 2000
const ANO_MAXIMO = 2100

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

const doisDigitos = (n: number) => String(n).padStart(2, '0')

/** "2026-10-28" que existe no calendário e está entre 2000 e 2100. */
export function dataCivilValida(entrada: unknown): entrada is string {
  if (typeof entrada !== 'string') return false
  const achado = /^(\d{4})-(\d{2})-(\d{2})$/.exec(entrada)
  if (!achado) return false
  if (entrada < DATA_MINIMA || entrada > DATA_MAXIMA) return false

  const ano = parseInt(achado[1] as string, 10)
  const mes = parseInt(achado[2] as string, 10)
  const dia = parseInt(achado[3] as string, 10)
  const conferida = new Date(Date.UTC(ano, mes - 1, dia))
  return (
    conferida.getUTCFullYear() === ano &&
    conferida.getUTCMonth() === mes - 1 &&
    conferida.getUTCDate() === dia
  )
}

const partesDoDia = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO_DA_FAMILIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** O dia de hoje em São Paulo; o relógio é injetável para o teste. */
export function hojeEmSaoPaulo(agora: Date = new Date()): string {
  const partes = Object.fromEntries(
    partesDoDia.formatToParts(agora).map((p) => [p.type, p.value]),
  )
  return `${partes.year}-${partes.month}-${partes.day}`
}

/** "2026-10" do dia de hoje em São Paulo. */
export function mesAtualEmSaoPaulo(agora: Date = new Date()): string {
  return mesDaData(hojeEmSaoPaulo(agora))
}

/** "2026-10-28" → "2026-10". */
export function mesDaData(data: string): string {
  return data.slice(0, 7)
}

/** "AAAA-MM" com mês de 01 a 12 e ano de 2000 a 2100. */
export function mesValido(entrada: unknown): entrada is string {
  if (typeof entrada !== 'string') return false
  const achado = /^(\d{4})-(\d{2})$/.exec(entrada)
  if (!achado) return false
  const ano = parseInt(achado[1] as string, 10)
  const mes = parseInt(achado[2] as string, 10)
  return ano >= ANO_MINIMO && ano <= ANO_MAXIMO && mes >= 1 && mes <= 12
}

function partesDoMes(mes: string): { ano: number; mes: number } {
  return {
    ano: parseInt(mes.slice(0, 4), 10),
    mes: parseInt(mes.slice(5, 7), 10),
  }
}

/** Primeiro dia do mês (incluído) e primeiro dia do seguinte (excluído). */
export function intervaloDoMes(mes: string): { de: string; ate: string } {
  return { de: `${mes}-01`, ate: `${mesSeguinte(mes)}-01` }
}

export function mesSeguinte(mes: string): string {
  const { ano, mes: m } = partesDoMes(mes)
  return m === 12 ? `${ano + 1}-01` : `${ano}-${doisDigitos(m + 1)}`
}

export function mesAnterior(mes: string): string {
  const { ano, mes: m } = partesDoMes(mes)
  return m === 1 ? `${ano - 1}-12` : `${ano}-${doisDigitos(m - 1)}`
}

/** "2026-10" → "outubro de 2026". */
export function rotuloDoMes(mes: string): string {
  const { ano, mes: m } = partesDoMes(mes)
  return `${MESES[m - 1]} de ${ano}`
}

/** O dia da recorrência dentro do mês: em mês mais curto vale o último dia (dia 31 em fevereiro → 28 ou 29). */
export function dataDaRecorrencia(mes: string, dia: number): string {
  const { ano, mes: m } = partesDoMes(mes)
  const ultimo = new Date(Date.UTC(ano, m, 0)).getUTCDate()
  return `${mes}-${doisDigitos(Math.min(Math.max(1, dia), ultimo))}`
}

/** Soma `n` meses a um "AAAA-MM". */
export function somarMeses(mes: string, n: number): string {
  let resultado = mes
  for (let i = 0; i < n; i += 1) resultado = mesSeguinte(resultado)
  return resultado
}
