// Estado da gaveta de navegação do celular. O estado guarda a rota em que a
// gaveta foi aberta: ao navegar para outra rota, ela conta como fechada sem
// nenhum efeito colateral para zerar o estado.

export type EstadoDaGaveta = string | null

/** Abre a gaveta na rota atual, ou fecha se ela já estava aberta nela. */
export function alternarGaveta(estado: EstadoDaGaveta, rota: string): EstadoDaGaveta {
  return estado === rota ? null : rota
}

/** A gaveta está aberta só se foi aberta nesta mesma rota. */
export function gavetaAberta(estado: EstadoDaGaveta, rota: string): boolean {
  return estado !== null && estado === rota
}
