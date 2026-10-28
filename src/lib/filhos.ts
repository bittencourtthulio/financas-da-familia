// Apresentação da mesada combinada do filho (PR-30): o valor é inteiro em
// centavos (PR-02) e só informativo. Funções puras, sem banco.

import { formatarMoeda } from '@/lib/formato'

const POR_PERIODO: Record<string, string> = {
  semanal: 'por semana',
  mensal: 'por mês',
}

const NOME_DO_PERIODO: Record<string, string> = {
  semanal: 'semanal',
  mensal: 'mensal',
}

/** "semanal" → "semanal"; desconhecido volta como veio. */
export function rotuloDaPeriodicidade(periodicidade: string): string {
  return NOME_DO_PERIODO[periodicidade] ?? periodicidade
}

/** 5000, "semanal" → "R$ 50,00 por semana". */
export function descricaoDaMesada(centavos: number, periodicidade: string): string {
  const periodo = POR_PERIODO[periodicidade]
  return periodo ? `${formatarMoeda(centavos)} ${periodo}` : formatarMoeda(centavos)
}

/** A situação do login em texto, para nunca depender só de cor. */
export function situacaoDoLogin(login: { ativo: boolean } | null): string {
  if (!login) return 'Sem login'
  return login.ativo ? 'Login ativo' : 'Login desativado'
}
