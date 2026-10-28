// Catálogo das ações da trilha de atividade (PR-10). Cada ação tem um código
// `entidade.verbo` e o rótulo em português que a tela mostra. O serviço
// recusa ação fora deste catálogo: sem rótulo, a tela mostraria código
// técnico. As features seguintes (lançamentos, mesada) acrescentam as suas.

import { formatarDataEHora } from '@/lib/formato'
import { rotuloDoPapel } from '@/lib/papeis'

export const ACOES: Record<string, string> = {
  'usuario.criado': 'Criou o usuário',
  'usuario.papel_alterado': 'Alterou o papel de',
  'usuario.desativado': 'Desativou o usuário',
  'lancamento.criado': 'Criou o lançamento',
  'lancamento.alterado': 'Alterou o lançamento',
  'lancamento.apagado': 'Apagou o lançamento',
  'categoria.criada': 'Criou a categoria',
}

/** O rótulo da ação; ação desconhecida volta como veio. */
export function rotuloDaAcao(acao: string): string {
  return ACOES[acao] ?? acao
}

/** O que a tela precisa de um registro para exibi-lo. */
export interface RegistroParaExibir {
  atorNome: string
  acao: string
  detalhe: Record<string, string | number | boolean | null>
  criadoEm: Date
}

export interface AtividadeDescrita {
  quando: string
  quem: string
  acao: string
  detalhe: string
}

const TIPOS: Record<string, string> = { receita: 'Receita', despesa: 'Despesa' }

/** "despesa" → "Despesa"; desconhecido volta como veio. */
export function rotuloDoTipo(tipo: string): string {
  return TIPOS[tipo] ?? tipo
}

const texto = (valor: unknown): string => (typeof valor === 'string' ? valor : '')

/**
 * Traduz um registro para as quatro colunas da tela, em português: papéis
 * pelos rótulos da interface (Responsável, Adulto), data e hora no fuso da
 * família. Nada de código técnico (`usuario.criado`, `admin`) chega à tela.
 */
export function descreverAtividade(registro: RegistroParaExibir): AtividadeDescrita {
  const d = registro.detalhe
  const alvo = texto(d.alvoNome)

  let detalhe = ''
  if (registro.acao === 'usuario.criado' && texto(d.papel)) {
    detalhe = `Papel: ${rotuloDoPapel(texto(d.papel))}`
  } else if (registro.acao === 'usuario.papel_alterado') {
    detalhe = `De ${rotuloDoPapel(texto(d.de))} para ${rotuloDoPapel(texto(d.para))}`
  } else if (registro.acao.startsWith('lancamento.') || registro.acao === 'categoria.criada') {
    // Só o tipo: a trilha de lançamento nunca leva o valor (PR-25).
    detalhe = texto(d.tipo) ? rotuloDoTipo(texto(d.tipo)) : ''
  }

  return {
    quando: formatarDataEHora(registro.criadoEm),
    quem: registro.atorNome,
    acao: [rotuloDaAcao(registro.acao), alvo].filter(Boolean).join(' '),
    detalhe,
  }
}
