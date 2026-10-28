// Os papéis gravados no banco são `admin`, `usuario` e `filho`; a família os
// conhece como Responsável, Adulto e Filho (PROJETO.md, L2). O papel `filho`
// (FT-05) não é uma opção da tela Usuários: nasce na página do filho (PR-31).

const ROTULOS: Record<string, string> = {
  admin: 'Responsável',
  usuario: 'Adulto',
  filho: 'Filho',
}

/** O nome do papel como a interface o mostra; desconhecido volta como veio. */
export function rotuloDoPapel(papel: string): string {
  return ROTULOS[papel] ?? papel
}

/** As opções do campo Papel, na ordem em que a tela as oferece (sem Filho: PR-31). */
export const PAPEIS_DA_INTERFACE = [
  { valor: 'usuario', rotulo: ROTULOS.usuario as string },
  { valor: 'admin', rotulo: ROTULOS.admin as string },
]
