// Os papéis gravados no banco são `admin` e `usuario`; a família os conhece
// como Responsável e Adulto (PROJETO.md, L2). O papel `filho` entra na FT-05.

const ROTULOS: Record<string, string> = {
  admin: 'Responsável',
  usuario: 'Adulto',
}

/** O nome do papel como a interface o mostra; desconhecido volta como veio. */
export function rotuloDoPapel(papel: string): string {
  return ROTULOS[papel] ?? papel
}

/** As opções do campo Papel, na ordem em que a tela as oferece. */
export const PAPEIS_DA_INTERFACE = [
  { valor: 'usuario', rotulo: ROTULOS.usuario as string },
  { valor: 'admin', rotulo: ROTULOS.admin as string },
]
