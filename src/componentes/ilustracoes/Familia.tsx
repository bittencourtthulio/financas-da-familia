/**
 * A família do sistema, em desenho. Cada pessoa é um `Personagem` montado a
 * partir do avatar escolhido (src/lib/avatar.ts): figura (pai, mãe, menino,
 * menina), tom de pele, cor do cabelo, cor da roupa e óculos. Quem ainda não
 * escolheu aparece como uma figura neutra. O cachorro é o mascote e está em
 * toda família. Tudo é SVG com formas simples e toda cor vem dos tokens
 * (PR-07): nenhum valor literal aqui. As figuras são decorativas por padrão
 * (aria-hidden); com `titulo` viram imagem com rótulo. Olhos piscam e o rabo
 * abana por CSS (global.css); quem prefere menos movimento recebe menos.
 */
import {
  FAMILIA_PADRAO,
  TOKEN_DA_ROUPA,
  tokenDaPele,
  tokenDoCabelo,
  type Avatar,
} from '@/lib/avatar'

type Props = { className?: string; titulo?: string }

const svg = (className: string | undefined, titulo: string | undefined) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  className: className ? `ilustracao ${className}` : 'ilustracao',
  role: titulo ? ('img' as const) : undefined,
  'aria-hidden': titulo ? undefined : ('true' as const),
  'aria-label': titulo,
  focusable: 'false' as const,
})

/** Uma figura neutra, para quem ainda não escolheu o avatar: as cores variam pelo índice. */
export type FiguraDesenhada = Avatar['figura'] | 'adulto' | 'crianca'
export interface Aparencia {
  figura: FiguraDesenhada
  pele: string
  cabelo: string
  roupa: string
  oculos: boolean
}

const NEUTRAS: ReadonlyArray<Pick<Aparencia, 'pele' | 'cabelo' | 'roupa'>> = [
  { pele: 'var(--ilu-pele-1)', cabelo: 'var(--ilu-cabelo-1)', roupa: 'var(--cor-lilas)' },
  { pele: 'var(--ilu-pele-3)', cabelo: 'var(--ilu-cabelo-3)', roupa: 'var(--cor-ceu)' },
  { pele: 'var(--ilu-pele-2)', cabelo: 'var(--ilu-cabelo-2)', roupa: 'var(--cor-menta)' },
  { pele: 'var(--ilu-pele-4)', cabelo: 'var(--ilu-cabelo-1)', roupa: 'var(--cor-laranja)' },
]

export function aparenciaDe(avatar: Avatar | null, tipo: 'adulto' | 'crianca', indice = 0): Aparencia {
  if (avatar) {
    return {
      figura: avatar.figura,
      pele: tokenDaPele(avatar.pele),
      cabelo: tokenDoCabelo(avatar.cabelo),
      roupa: TOKEN_DA_ROUPA[avatar.roupa],
      oculos: avatar.oculos,
    }
  }
  const n = NEUTRAS[Math.abs(indice) % NEUTRAS.length] as (typeof NEUTRAS)[number]
  return { figura: tipo, ...n, oculos: false }
}

/* ---------- peças compartilhadas ---------- */

function Rosto({
  cx,
  cy,
  r,
  pele,
  sorriso = 'feliz',
}: {
  cx: number
  cy: number
  r: number
  pele: string
  sorriso?: 'feliz' | 'preocupado' | 'surpreso'
}) {
  const olhoY = cy - r * 0.1
  const dx = r * 0.38
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={pele} />
      <circle cx={cx - dx} cy={olhoY} r={r * 0.11} fill="var(--ilu-traco)" className="olho" />
      <circle cx={cx + dx} cy={olhoY} r={r * 0.11} fill="var(--ilu-traco)" className="olho" />
      <circle cx={cx - dx - r * 0.18} cy={cy + r * 0.28} r={r * 0.16} fill="var(--ilu-bochecha)" opacity="0.7" />
      <circle cx={cx + dx + r * 0.18} cy={cy + r * 0.28} r={r * 0.16} fill="var(--ilu-bochecha)" opacity="0.7" />
      {sorriso === 'feliz' && (
        <path
          d={`M${cx - r * 0.3} ${cy + r * 0.35} Q${cx} ${cy + r * 0.72} ${cx + r * 0.3} ${cy + r * 0.35}`}
          fill="none"
          stroke="var(--ilu-traco)"
          strokeWidth={r * 0.1}
          strokeLinecap="round"
        />
      )}
      {sorriso === 'preocupado' && (
        <>
          <path
            d={`M${cx - r * 0.28} ${cy + r * 0.55} Q${cx} ${cy + r * 0.3} ${cx + r * 0.28} ${cy + r * 0.55}`}
            fill="none"
            stroke="var(--ilu-traco)"
            strokeWidth={r * 0.1}
            strokeLinecap="round"
          />
          <path d={`M${cx - dx - r * 0.2} ${olhoY - r * 0.32} l${r * 0.4} ${r * 0.12}`} stroke="var(--ilu-traco)" strokeWidth={r * 0.09} strokeLinecap="round" />
          <path d={`M${cx + dx + r * 0.2} ${olhoY - r * 0.32} l-${r * 0.4} ${r * 0.12}`} stroke="var(--ilu-traco)" strokeWidth={r * 0.09} strokeLinecap="round" />
        </>
      )}
      {sorriso === 'surpreso' && <circle cx={cx} cy={cy + r * 0.5} r={r * 0.14} fill="var(--ilu-traco)" />}
    </g>
  )
}

function Oculos({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const dx = r * 0.38
  const olhoY = cy - r * 0.1
  return (
    <g>
      <circle cx={cx - dx} cy={olhoY} r={r * 0.27} fill="none" stroke="var(--ilu-traco)" strokeWidth="2" />
      <circle cx={cx + dx} cy={olhoY} r={r * 0.27} fill="none" stroke="var(--ilu-traco)" strokeWidth="2" />
      <path d={`M${cx - dx + r * 0.27} ${olhoY} H${cx + dx - r * 0.27}`} stroke="var(--ilu-traco)" strokeWidth="2" />
    </g>
  )
}

/* ---------- as figuras, sem o <svg> de fora, para caberem num desenho só ---------- */

function CorpoAdulto({ a, vestido }: { a: Aparencia; vestido: boolean }) {
  return (
    <>
      {vestido ? (
        <>
          <rect x="44" y="136" width="14" height="38" rx="7" fill={a.pele} />
          <rect x="62" y="136" width="14" height="38" rx="7" fill={a.pele} />
          <rect x="40" y="166" width="21" height="12" rx="6" fill="var(--ilu-coleira)" />
          <rect x="59" y="166" width="21" height="12" rx="6" fill="var(--ilu-coleira)" />
          <path d="M38 78 Q60 70 82 78 L96 142 Q60 150 24 142 Z" fill={a.roupa} />
          <circle cx="60" cy="96" r="4" fill="var(--ilu-branco)" opacity="0.8" />
          <circle cx="60" cy="112" r="4" fill="var(--ilu-branco)" opacity="0.8" />
          <rect x="20" y="84" width="13" height="42" rx="7" fill={a.pele} transform="rotate(14 26 105)" />
          <rect x="87" y="84" width="13" height="42" rx="7" fill={a.pele} transform="rotate(-14 94 105)" />
        </>
      ) : (
        <>
          <rect x="40" y="128" width="17" height="46" rx="8" fill="var(--ilu-calca)" />
          <rect x="63" y="128" width="17" height="46" rx="8" fill="var(--ilu-calca)" />
          <rect x="37" y="166" width="23" height="12" rx="6" fill="var(--ilu-sapato)" />
          <rect x="60" y="166" width="23" height="12" rx="6" fill="var(--ilu-sapato)" />
          <rect x="30" y="76" width="60" height="60" rx="20" fill={a.roupa} />
          <path d="M52 76 L60 90 L68 76 Z" fill="var(--ilu-branco)" opacity="0.6" />
          <rect x="18" y="82" width="14" height="44" rx="7" fill={a.roupa} transform="rotate(12 25 104)" />
          <rect x="88" y="82" width="14" height="44" rx="7" fill={a.roupa} transform="rotate(-12 95 104)" />
          <circle cx="21" cy="128" r="7" fill={a.pele} />
          <circle cx="99" cy="128" r="7" fill={a.pele} />
        </>
      )}
    </>
  )
}

function CorpoCrianca({ a, vestido }: { a: Aparencia; vestido: boolean }) {
  return (
    <>
      {vestido ? (
        <>
          <rect x="45" y="146" width="13" height="28" rx="6" fill={a.pele} />
          <rect x="62" y="146" width="13" height="28" rx="6" fill={a.pele} />
          <rect x="41" y="166" width="21" height="12" rx="6" fill="var(--ilu-roupa-mae)" />
          <rect x="58" y="166" width="21" height="12" rx="6" fill="var(--ilu-roupa-mae)" />
          <path d="M42 98 Q60 92 78 98 L90 150 Q60 158 30 150 Z" fill={a.roupa} />
          <circle cx="50" cy="124" r="4" fill="var(--ilu-branco)" opacity="0.8" />
          <circle cx="66" cy="136" r="4" fill="var(--ilu-branco)" opacity="0.8" />
          <circle cx="70" cy="114" r="3" fill="var(--ilu-branco)" opacity="0.8" />
          <rect x="26" y="102" width="12" height="36" rx="6" fill={a.pele} transform="rotate(-28 32 120)" />
          <rect x="82" y="102" width="12" height="36" rx="6" fill={a.pele} transform="rotate(12 88 120)" />
        </>
      ) : (
        <>
          <rect x="43" y="140" width="15" height="34" rx="7" fill="var(--ilu-calca)" />
          <rect x="62" y="140" width="15" height="34" rx="7" fill="var(--ilu-calca)" />
          <rect x="39" y="166" width="22" height="12" rx="6" fill="var(--ilu-roupa-pai)" />
          <rect x="59" y="166" width="22" height="12" rx="6" fill="var(--ilu-roupa-pai)" />
          <rect x="34" y="96" width="52" height="50" rx="18" fill={a.roupa} />
          <rect x="34" y="110" width="52" height="8" fill="var(--ilu-branco)" opacity="0.65" />
          <rect x="34" y="126" width="52" height="8" fill="var(--ilu-branco)" opacity="0.65" />
          <rect x="24" y="100" width="12" height="36" rx="6" fill={a.pele} transform="rotate(10 30 118)" />
          <rect x="84" y="100" width="12" height="36" rx="6" fill={a.pele} transform="rotate(-30 90 118)" />
        </>
      )}
    </>
  )
}

/** A pessoa inteira (120 × 190), já com cabeça, cabelo e óculos. */
function FiguraInterna({ a }: { a: Aparencia }) {
  const adulto = a.figura === 'pai' || a.figura === 'mae' || a.figura === 'adulto'
  const vestido = a.figura === 'mae' || a.figura === 'menina'
  const cy = adulto ? 46 : 66
  const r = adulto ? 30 : 28
  return (
    <>
      {adulto ? <CorpoAdulto a={a} vestido={vestido} /> : <CorpoCrianca a={a} vestido={vestido} />}
      {a.figura === 'mae' && (
        <path d="M26 46 Q26 8 60 10 Q94 8 94 46 L96 96 Q78 104 60 100 Q42 104 24 96 Z" fill={a.cabelo} />
      )}
      {a.figura === 'menina' && (
        <>
          <circle cx="26" cy="72" r="13" fill={a.cabelo} />
          <circle cx="94" cy="72" r="13" fill={a.cabelo} />
          <path d="M22 60 l8 -4 l-2 8 l-6 2 Z" fill="var(--ilu-coleira)" />
          <path d="M98 60 l-8 -4 l2 8 l6 2 Z" fill="var(--ilu-coleira)" />
        </>
      )}
      <Rosto cx={60} cy={cy} r={r} pele={a.pele} />
      {adulto ? (
        <path d="M30 42 Q33 12 60 14 Q88 12 90 42 Q74 26 60 32 Q46 26 30 42 Z" fill={a.cabelo} />
      ) : (
        <path d="M33 60 Q36 34 60 36 Q84 34 87 60 Q74 48 60 52 Q46 48 33 60 Z" fill={a.cabelo} />
      )}
      {a.figura === 'menino' && (
        <path d="M42 40 L48 26 L54 40 Z M54 38 L60 22 L66 38 Z M66 40 L72 26 L78 40 Z" fill={a.cabelo} />
      )}
      {a.figura === 'mae' && (
        <>
          <circle cx="31" cy="54" r="3.5" fill="var(--cor-sol)" />
          <circle cx="89" cy="54" r="3.5" fill="var(--cor-sol)" />
        </>
      )}
      {a.oculos && <Oculos cx={60} cy={cy} r={r} />}
    </>
  )
}

function CachorroInterno({ humor = 'feliz' }: { humor?: 'feliz' | 'preocupado' | 'perdido' }) {
  const traco = 'var(--ilu-traco)'
  return (
    <>
      <path className="rabo" d="M28 78 Q6 66 12 46" fill="none" stroke="var(--ilu-cachorro)" strokeWidth="10" strokeLinecap="round" />
      <rect x="26" y="62" width="82" height="46" rx="22" fill="var(--ilu-cachorro)" />
      <ellipse cx="70" cy="92" rx="22" ry="12" fill="var(--ilu-cachorro-mancha)" />
      <rect x="34" y="96" width="14" height="24" rx="7" fill="var(--ilu-cachorro)" />
      <rect x="54" y="98" width="14" height="22" rx="7" fill="var(--ilu-cachorro)" />
      <rect x="84" y="98" width="14" height="22" rx="7" fill="var(--ilu-cachorro)" />
      <rect x="100" y="96" width="14" height="24" rx="7" fill="var(--ilu-cachorro)" />
      <circle cx="118" cy="56" r="30" fill="var(--ilu-cachorro)" />
      <ellipse cx="126" cy="66" rx="18" ry="13" fill="var(--ilu-cachorro-mancha)" />
      <path d="M92 40 Q78 56 90 78 Q102 70 104 46 Z" fill="var(--ilu-cabelo-1)" />
      <path d="M138 34 Q152 46 146 66 Q136 62 132 40 Z" fill="var(--ilu-cabelo-1)" />
      <path d="M94 80 Q118 92 140 78" fill="none" stroke="var(--ilu-coleira)" strokeWidth="7" strokeLinecap="round" />
      <circle cx="118" cy="88" r="4.5" fill="var(--cor-sol)" />
      <ellipse cx="134" cy="62" rx="5.5" ry="4.5" fill={traco} />
      {humor === 'feliz' && (
        <>
          <path d="M122 70 Q130 78 138 70" fill="none" stroke={traco} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M128 73 Q131 84 136 74 Z" fill="var(--ilu-lingua)" />
        </>
      )}
      {humor === 'preocupado' && (
        <path d="M122 76 Q130 68 138 76" fill="none" stroke={traco} strokeWidth="2.5" strokeLinecap="round" />
      )}
      {humor === 'perdido' && <circle cx="130" cy="74" r="3.5" fill={traco} />}
      <circle cx="110" cy="50" r="5" fill="var(--ilu-branco)" />
      <circle cx="126" cy="48" r="5" fill="var(--ilu-branco)" />
      <circle cx="111" cy="51" r="2.6" fill={traco} className="olho" />
      <circle cx="127" cy="49" r="2.6" fill={traco} className="olho" />
      {humor !== 'feliz' && (
        <>
          <path d="M104 40 l10 4" stroke={traco} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M132 38 l-10 4" stroke={traco} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {humor === 'perdido' && (
        <text x="146" y="30" fontSize="26" fontWeight="800" fill="var(--accent)" fontFamily="var(--font-ui)">
          ?
        </text>
      )}
    </>
  )
}

/* ---------- personagens ---------- */

/** Uma pessoa inteira, a partir do avatar escolhido (ou neutra, sem avatar). */
export function Personagem({
  avatar,
  tipo = 'adulto',
  indice = 0,
  className,
  titulo,
}: Props & { avatar: Avatar | null; tipo?: 'adulto' | 'crianca'; indice?: number }) {
  const a = aparenciaDe(avatar, tipo, indice)
  return (
    <svg viewBox="0 0 120 190" {...svg(className, titulo)}>
      <ellipse cx="60" cy="184" rx="30" ry="5" fill="var(--ilu-sombra)" />
      <FiguraInterna a={a} />
    </svg>
  )
}

const padrao = (i: number) => FAMILIA_PADRAO[i] as Avatar
export const Pai = (p: Props) => <Personagem avatar={padrao(0)} {...p} />
export const Mae = (p: Props) => <Personagem avatar={padrao(1)} {...p} />
export const Menino = (p: Props) => <Personagem avatar={padrao(2)} tipo="crianca" {...p} />
export const Menina = (p: Props) => <Personagem avatar={padrao(3)} tipo="crianca" {...p} />

export function Cachorro({
  className,
  titulo,
  humor = 'feliz',
}: Props & { humor?: 'feliz' | 'preocupado' | 'perdido' }) {
  return (
    <svg viewBox="0 0 160 130" {...svg(className, titulo)}>
      <ellipse cx="82" cy="124" rx="48" ry="5" fill="var(--ilu-sombra)" />
      <CachorroInterno humor={humor} />
    </svg>
  )
}

/** Só o rosto, redondo: o avatar pequeno do cabeçalho e das listas. */
export function Rostinho({
  avatar,
  tipo = 'adulto',
  indice = 0,
  className,
  titulo,
}: Props & { avatar: Avatar | null; tipo?: 'adulto' | 'crianca'; indice?: number }) {
  const a = aparenciaDe(avatar, tipo, indice)
  const longo = a.figura === 'mae'
  return (
    <svg viewBox="0 0 120 120" {...svg(className ? `rostinho ${className}` : 'rostinho', titulo)}>
      <circle cx="60" cy="60" r="58" fill={a.roupa} opacity="0.35" />
      {longo && <path d="M24 58 Q24 14 60 16 Q96 14 96 58 L98 110 Q60 118 22 110 Z" fill={a.cabelo} />}
      {a.figura === 'menina' && (
        <>
          <circle cx="22" cy="74" r="14" fill={a.cabelo} />
          <circle cx="98" cy="74" r="14" fill={a.cabelo} />
        </>
      )}
      <Rosto cx={60} cy={62} r={34} pele={a.pele} />
      <path d="M26 58 Q28 22 60 24 Q92 22 94 58 Q78 40 60 44 Q42 40 26 58 Z" fill={a.cabelo} />
      {a.figura === 'menino' && (
        <path d="M40 36 L47 20 L54 36 Z M53 34 L60 16 L67 34 Z M66 36 L73 20 L80 36 Z" fill={a.cabelo} />
      )}
      {a.oculos && <Oculos cx={60} cy={62} r={34} />}
    </svg>
  )
}

/** Uma criança neutra para avatar de cartão: o cabelo varia pelo índice. */
export function Crianca({ indice = 0, className, titulo }: Props & { indice?: number }) {
  return <Rostinho avatar={null} tipo="crianca" indice={indice} className={className ? `avatar ${className}` : 'avatar'} titulo={titulo} />
}

export interface MembroDesenhado {
  avatar: Avatar | null
  tipo: 'adulto' | 'crianca'
}

/**
 * A família inteira, lado a lado, do primeiro membro ao cachorro. Cada um
 * flutua no seu ritmo. O grupo de fora só posiciona; o de dentro é o que
 * flutua: um transform por CSS substituiria o atributo transform do mesmo
 * elemento e todos cairiam na origem, empilhados.
 */
export function FamiliaDesenhada({
  membros,
  className,
  titulo,
}: Props & { membros: ReadonlyArray<MembroDesenhado> }) {
  const passo = 108
  const larguraDoCachorro = 150
  const largura = Math.max(1, membros.length) * passo + larguraDoCachorro + 20
  return (
    <div className={className ? `familia ${className}` : 'familia'} aria-hidden={titulo ? undefined : 'true'} role={titulo ? 'img' : undefined} aria-label={titulo}>
      <svg viewBox={`0 0 ${largura} 200`} xmlns="http://www.w3.org/2000/svg" focusable="false" className="ilustracao">
        <ellipse cx={largura / 2} cy="192" rx={largura / 2 - 20} ry="6" fill="var(--ilu-sombra)" />
        {membros.map((m, i) => (
          <g key={i} transform={`translate(${10 + i * passo} ${m.tipo === 'crianca' ? 5 : 5})`}>
            <g className="personagem">
              <FiguraInterna a={aparenciaDe(m.avatar, m.tipo, i)} />
            </g>
          </g>
        ))}
        <g transform={`translate(${10 + membros.length * passo} 60) scale(0.85)`}>
          <g className="personagem">
            <CachorroInterno />
          </g>
        </g>
      </svg>
    </div>
  )
}

const MEMBROS_PADRAO: ReadonlyArray<MembroDesenhado> = [
  { avatar: padrao(0), tipo: 'adulto' },
  { avatar: padrao(1), tipo: 'adulto' },
  { avatar: padrao(2), tipo: 'crianca' },
  { avatar: padrao(3), tipo: 'crianca' },
]

/** A família padrão: pai, mãe, menino, menina e o cachorro. Fora do sistema (apresentação e login). */
export function Familia({ className, titulo }: Props) {
  return <FamiliaDesenhada membros={MEMBROS_PADRAO} className={className} titulo={titulo} />
}

/** O cofrinho da mesada. */
export function Cofrinho({ className, titulo }: Props) {
  return (
    <svg viewBox="0 0 140 120" {...svg(className, titulo)}>
      <ellipse cx="70" cy="114" rx="46" ry="5" fill="var(--ilu-sombra)" />
      <rect x="30" y="86" width="14" height="22" rx="6" fill="var(--cor-rosa)" />
      <rect x="92" y="86" width="14" height="22" rx="6" fill="var(--cor-rosa)" />
      <ellipse cx="68" cy="66" rx="50" ry="38" fill="var(--cor-rosa)" />
      <ellipse cx="116" cy="70" rx="14" ry="11" fill="var(--cor-rosa)" />
      <ellipse cx="119" cy="70" rx="3" ry="3.5" fill="var(--ilu-traco)" opacity="0.5" />
      <ellipse cx="112" cy="70" rx="3" ry="3.5" fill="var(--ilu-traco)" opacity="0.5" />
      <path d="M40 36 L48 20 L58 36 Z" fill="var(--cor-rosa)" />
      <circle cx="92" cy="56" r="4" fill="var(--ilu-traco)" className="olho" />
      <circle cx="84" cy="66" r="5" fill="var(--ilu-bochecha)" opacity="0.8" />
      <rect x="56" y="30" width="30" height="7" rx="3.5" fill="var(--ilu-traco)" opacity="0.6" />
      <g transform="rotate(-20 72 18)">
        <circle cx="72" cy="18" r="11" fill="var(--cor-sol)" stroke="var(--ilu-cabelo-2)" strokeWidth="2" />
        <text x="72" y="23" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--ilu-traco)" fontFamily="var(--font-ui)">
          $
        </text>
      </g>
      <path d="M22 72 Q14 80 24 86" fill="none" stroke="var(--cor-rosa)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

/**
 * A marca do Bufi: uma moedinha sorridente (a bufunfa) num quadrado
 * arredondado, com um coração: dinheiro, sim, mas em família.
 */
export function Logotipo({ className, titulo }: Props) {
  return (
    <svg viewBox="0 0 48 48" {...svg(className ? `logotipo ${className}` : 'logotipo', titulo)}>
      <rect width="48" height="48" rx="14" fill="var(--accent)" />
      <circle cx="23" cy="25" r="15" fill="var(--ilu-cabelo-2)" />
      <circle cx="23" cy="25" r="12" fill="var(--cor-sol)" />
      <circle cx="18.5" cy="23" r="1.7" fill="var(--ilu-traco)" className="olho" />
      <circle cx="27.5" cy="23" r="1.7" fill="var(--ilu-traco)" className="olho" />
      <path d="M18 28 Q23 33 28 28" fill="none" stroke="var(--ilu-traco)" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 8c-2 0-3.2 1.3-3.6 2.3C34 9.3 32.8 8 30.8 8A3.8 3.8 0 0 0 27 11.8c0 3.7 4.6 6.3 7.4 8.7 2.8-2.4 7.4-5 7.4-8.7A3.8 3.8 0 0 0 38 8z" fill="var(--cor-rosa)" />
    </svg>
  )
}
