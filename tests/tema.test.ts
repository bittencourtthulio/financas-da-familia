/**
 * Guarda de tokens, temas e celular (PR-07, PR-16, P-6): os dois temas
 * definem os mesmos tokens, nenhum componente escreve cor por extenso e
 * existe a regra que vira o menu em gaveta abaixo de 768px.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  coresLiterais,
  corpoDe,
  declaracoesDe,
  listarArquivos,
} from './ajuda-estatica'

const SRC = path.resolve(process.cwd(), 'src')
const tokens = readFileSync(path.join(SRC, 'estilos/tokens.css'), 'utf8')
const global = readFileSync(path.join(SRC, 'estilos/global.css'), 'utf8')

const escuro = declaracoesDe(corpoDe(tokens, ':root {'))
const claro = declaracoesDe(corpoDe(tokens, ":root[data-theme='light']"))
// Sem escolha pelo escuro, vale o claro (o claro é o padrão; o sistema não decide).
const padraoClaro = declaracoesDe(corpoDe(tokens, ":root:not([data-theme='dark'])"))

const ehCor = (valor: string) => /^(#|rgb|hsl)/.test(valor)
const tokensDeCor = Object.keys(escuro).filter((nome) => ehCor(escuro[nome] as string))

describe('os dois temas (PR-07)', () => {
  it('o tema escuro tem tokens de cor suficientes para a leitura ser relevante', () => {
    expect(tokensDeCor.length).toBeGreaterThan(25)
  })

  it('o tema claro redefine todo token de cor do escuro', () => {
    const faltando = tokensDeCor.filter((nome) => !(nome in claro))
    expect(faltando).toEqual([])
  })

  it('o padrão (sem escolha pelo escuro) redefine todo token que o claro muda em relação ao escuro', () => {
    const faltando = tokensDeCor.filter(
      (nome) => claro[nome] !== undefined && claro[nome] !== escuro[nome] && padraoClaro[nome] !== claro[nome],
    )
    expect(faltando).toEqual([])
  })

  it('o texto não é preto nem branco puro em nenhum dos temas', () => {
    expect(escuro['--fg-default']).not.toMatch(/^#(fff|ffffff|000|000000)$/i)
    expect(claro['--fg-default']).not.toMatch(/^#(fff|ffffff|000|000000)$/i)
  })

  it('a barra de atividade permanece escura no tema claro', () => {
    expect(claro['--bg-activitybar']).toBe('#2c2c2c')
  })
})

describe('nenhuma cor escrita por extenso fora dos tokens', () => {
  it('global.css só usa tokens', () => {
    expect(coresLiterais(global)).toEqual([])
  })

  it('nenhum componente ou tela escreve cor por extenso', () => {
    const achados = listarArquivos(SRC, ['.tsx']).flatMap((arquivo) =>
      coresLiterais(readFileSync(arquivo, 'utf8')).map((cor) => `${path.relative(SRC, arquivo)}: ${cor}`),
    )
    expect(achados).toEqual([])
  })

  it('a varredura discrimina cor literal de uso de token', () => {
    expect(coresLiterais('a { color: #fff; }')).toEqual(['#fff'])
    expect(coresLiterais('a { background: rgb(255 255 255 / 0.12); }')).toHaveLength(1)
    expect(coresLiterais('a { color: var(--fg-default); }')).toEqual([])
    expect(coresLiterais('/* cor #123456 só no comentário */ a { color: var(--accent); }')).toEqual([])
  })
})

describe('celular (PR-16)', () => {
  it('abaixo de 768px a barra lateral some e a classe gaveta-aberta a traz de volta', () => {
    const celular = corpoDe(global, '@media (max-width: 768px)')
    expect(celular).toContain('.barra-lateral')
    expect(celular).toContain('.aplicacao.gaveta-aberta')
  })

  it('o alvo de toque tem ao menos 44px no celular', () => {
    expect(corpoDe(global, '@media (max-width: 768px)')).toMatch(/min-height:\s*44px/)
  })
})

describe('o tema claro é o padrão', () => {
  it('o CSS não depende da preferência de cor do sistema', () => {
    expect(tokens).not.toContain('prefers-color-scheme')
    expect(global).not.toContain('prefers-color-scheme')
  })

  it('o script do <html> e o alternador começam no claro e só vão ao escuro por escolha', () => {
    const layout = readFileSync(path.join(SRC, 'app/layout.tsx'), 'utf8')
    expect(layout).toContain("t==='dark'?'dark':'light'")
    const alternador = readFileSync(path.join(SRC, 'componentes/AlternadorDeTema.tsx'), 'utf8')
    expect(alternador).not.toContain('matchMedia')
    expect(alternador).toContain("temaNoServidor = (): Tema => 'light'")
  })
})
