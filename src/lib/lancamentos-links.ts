// Endereços da lista de lançamentos (D-12): mês, tipo e página vão na
// consulta, para o filtro funcionar por link, sem JavaScript.

export interface ConsultaDaLista {
  mes?: string | null
  tipo?: string | null
  pagina?: number | null
}

export function enderecoDaLista({ mes, tipo, pagina }: ConsultaDaLista): string {
  const partes: string[] = []
  if (mes) partes.push(`mes=${mes}`)
  if (tipo) partes.push(`tipo=${tipo}`)
  if (pagina && pagina > 1) partes.push(`pagina=${pagina}`)
  return partes.length > 0 ? `/lancamentos?${partes.join('&')}` : '/lancamentos'
}
