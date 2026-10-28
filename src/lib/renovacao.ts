// Renovação deslizante da sessão (PR-21): a conta do intervalo vive fora do
// componente cliente porque o layout, que é do servidor, também precisa dela.

/** Renova na metade do tempo de vida do token, com piso de 30 segundos. */
export function intervaloDeRenovacao(ttlSegundos: number): number {
  return Math.max(30_000, Math.floor(ttlSegundos * 500))
}
