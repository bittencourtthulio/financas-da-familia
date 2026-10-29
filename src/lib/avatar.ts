/**
 * O avatar desenhado de cada pessoa da família: uma figura (pai, mãe, menino
 * ou menina), o tom de pele, a cor do cabelo, a cor da roupa e óculos. É só
 * uma escolha cosmética feita pela própria família; vale como dado pessoal
 * (vai no arquivo de exportação e some com a conta) e nunca entra na trilha
 * de atividade. Guardado como JSON pequeno; nulo até alguém escolher.
 */

export const FIGURAS = ['pai', 'mae', 'menino', 'menina'] as const
export const PELES = [1, 2, 3, 4] as const
export const CABELOS = [1, 2, 3, 4, 5] as const
export const ROUPAS = ['azul', 'rosa', 'verde', 'amarelo', 'lilas', 'ceu', 'laranja', 'menta'] as const

export type Figura = (typeof FIGURAS)[number]
export type Pele = (typeof PELES)[number]
export type Cabelo = (typeof CABELOS)[number]
export type Roupa = (typeof ROUPAS)[number]

export interface Avatar {
  figura: Figura
  pele: Pele
  cabelo: Cabelo
  roupa: Roupa
  oculos: boolean
}

export const ROTULOS = {
  figura: { pai: 'Pai', mae: 'Mãe', menino: 'Menino', menina: 'Menina' },
  pele: { 1: 'Clara', 2: 'Morena clara', 3: 'Morena', 4: 'Escura' },
  cabelo: { 1: 'Castanho', 2: 'Loiro', 3: 'Preto', 4: 'Ruivo', 5: 'Grisalho' },
  roupa: {
    azul: 'Azul',
    rosa: 'Rosa',
    verde: 'Verde',
    amarelo: 'Amarelo',
    lilas: 'Lilás',
    ceu: 'Céu',
    laranja: 'Laranja',
    menta: 'Menta',
  },
} as const

/** Os tokens de cor (PR-07): nenhuma cor literal sai daqui. */
export const TOKEN_DA_ROUPA: Record<Roupa, string> = {
  azul: 'var(--ilu-roupa-pai)',
  rosa: 'var(--ilu-roupa-mae)',
  verde: 'var(--ilu-roupa-menino)',
  amarelo: 'var(--ilu-roupa-menina)',
  lilas: 'var(--cor-lilas)',
  ceu: 'var(--cor-ceu)',
  laranja: 'var(--cor-laranja)',
  menta: 'var(--cor-menta)',
}
export const tokenDaPele = (pele: Pele) => `var(--ilu-pele-${pele})`
export const tokenDoCabelo = (cabelo: Cabelo) => `var(--ilu-cabelo-${cabelo})`

const ehFigura = (v: unknown): v is Figura => typeof v === 'string' && (FIGURAS as readonly string[]).includes(v)
const ehRoupa = (v: unknown): v is Roupa => typeof v === 'string' && (ROUPAS as readonly string[]).includes(v)
const inteiro = (v: unknown): number | null => {
  if (typeof v === 'number') return Number.isInteger(v) ? v : null
  if (typeof v === 'string' && /^\d+$/.test(v.trim())) return Number(v.trim())
  return null
}
const ehPele = (v: number | null): v is Pele => v !== null && (PELES as readonly number[]).includes(v)
const ehCabelo = (v: number | null): v is Cabelo => v !== null && (CABELOS as readonly number[]).includes(v)
const ehSim = (v: unknown): boolean => v === true || v === 'true' || v === 'on' || v === '1' || v === 1

/**
 * Lê um avatar de uma entrada qualquer (formulário ou JSON). Devolve o avatar
 * válido, `null` para "nenhum" (entrada ausente), e lança para entrada inválida,
 * com uma frase que a tela pode mostrar.
 */
export function lerAvatar(entrada: unknown): Avatar | null {
  if (entrada === null || entrada === undefined) return null
  if (typeof entrada !== 'object') throw new Error('Avatar inválido.')
  const o = entrada as Record<string, unknown>
  if (!ehFigura(o.figura)) throw new Error('Escolha a figura do avatar: pai, mãe, menino ou menina.')
  const pele = inteiro(o.pele)
  if (!ehPele(pele)) throw new Error('Escolha um tom de pele do avatar.')
  const cabelo = inteiro(o.cabelo)
  if (!ehCabelo(cabelo)) throw new Error('Escolha a cor do cabelo do avatar.')
  if (!ehRoupa(o.roupa)) throw new Error('Escolha a cor da roupa do avatar.')
  return { figura: o.figura, pele, cabelo, roupa: o.roupa, oculos: ehSim(o.oculos) }
}

/** O avatar guardado no banco, tolerante: JSON quebrado ou antigo vale como nenhum. */
export function avatarDoJson(texto: string | null | undefined): Avatar | null {
  if (!texto) return null
  try {
    return lerAvatar(JSON.parse(texto) as unknown)
  } catch {
    return null
  }
}

export const avatarParaJson = (avatar: Avatar): string => JSON.stringify(avatar)

/** Os campos do formulário de avatar (`avatarFigura`, `avatarPele`…), ou `undefined` se não vieram. */
export function avatarDoFormulario(form: { get(nome: string): FormDataEntryValue | null }): unknown {
  const figura = form.get('avatarFigura')
  if (figura === null) return undefined
  return {
    figura,
    pele: form.get('avatarPele'),
    cabelo: form.get('avatarCabelo'),
    roupa: form.get('avatarRoupa'),
    oculos: form.get('avatarOculos'),
  }
}

/** A família padrão, usada fora do sistema (apresentação e login). */
export const FAMILIA_PADRAO: ReadonlyArray<Avatar> = [
  { figura: 'pai', pele: 2, cabelo: 1, roupa: 'azul', oculos: true },
  { figura: 'mae', pele: 1, cabelo: 4, roupa: 'rosa', oculos: false },
  { figura: 'menino', pele: 3, cabelo: 3, roupa: 'verde', oculos: false },
  { figura: 'menina', pele: 1, cabelo: 2, roupa: 'amarelo', oculos: false },
]
