// Catálogo das ações da trilha de atividade (PR-10). Cada ação tem um código
// `entidade.verbo` e o rótulo em português que a tela mostra. O serviço
// recusa ação fora deste catálogo: sem rótulo, a tela mostraria código
// técnico. As features seguintes (lançamentos, mesada) acrescentam as suas.

export const ACOES: Record<string, string> = {
  'usuario.criado': 'Criou o usuário',
  'usuario.papel_alterado': 'Alterou o papel de',
  'usuario.desativado': 'Desativou o usuário',
}

/** O rótulo da ação; ação desconhecida volta como veio. */
export function rotuloDaAcao(acao: string): string {
  return ACOES[acao] ?? acao
}
