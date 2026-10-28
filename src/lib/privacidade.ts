// Privacidade dos dados da família (FT-07, PR-09, PR-34, PR-35): o que não
// depende de banco nem de sessão. O formato do arquivo exportado é versionado:
// quem ler o arquivo no futuro (uma importação, por exemplo) sabe o que lê.

import { hojeEmSaoPaulo } from '@/lib/datas'

/** A versão do formato do arquivo exportado (PR-34). Muda se um campo mudar. */
export const VERSAO_DO_FORMATO = 1

/** O texto que toma o lugar do nome do filho na trilha depois da exclusão (PR-35). */
export const MARCADOR_DO_FILHO_REMOVIDO = 'filho removido'

/** "dados-da-familia-2026-10-28.json": o dia é o de São Paulo, não o de UTC. */
export function nomeDoArquivoDeExportacao(agora: Date = new Date()): string {
  return `dados-da-familia-${hojeEmSaoPaulo(agora)}.json`
}

// Nomes de campo que nunca podem aparecer no arquivo exportado: hash e senha,
// token e JWT, segredo, dado interno de sessão e contador de tentativas.
const CAMPO_PROIBIDO = /senha|password|hash|token|jwt|segredo|secret|sess[aã]o|sessoes|tentativa/i

/**
 * Varre um valor (objeto, lista, texto...) e devolve o caminho de cada campo
 * cujo NOME é proibido no arquivo exportado. Lista vazia é o que se espera.
 */
export function camposProibidosEm(valor: unknown, caminho = ''): string[] {
  if (Array.isArray(valor)) {
    return valor.flatMap((item, i) => camposProibidosEm(item, caminho ? `${caminho}.${i}` : String(i)))
  }
  if (valor && typeof valor === 'object') {
    return Object.entries(valor).flatMap(([chave, filho]) => {
      const aqui = caminho ? `${caminho}.${chave}` : chave
      return [...(CAMPO_PROIBIDO.test(chave) ? [aqui] : []), ...camposProibidosEm(filho, aqui)]
    })
  }
  return []
}

/** Para onde o formulário de download envia o POST (FT-07, PR-34). */
export const ENDERECO_DA_EXPORTACAO = '/api/privacidade/exportar'
