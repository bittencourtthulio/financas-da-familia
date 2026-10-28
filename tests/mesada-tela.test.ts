/**
 * As telas da mesada (FT-06): saldo em destaque dito em texto, extrato com valor
 * de sinal, estado vazio, formulário rápido, apagar em dois passos, paginação,
 * saldo na lista de filhos e só tokens (PR-07, PR-16). Renderização sem
 * navegador; a negação por papel no servidor real é provada em
 * `mesada-rotas.test.ts`.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { SaldoDaMesada } from '@/componentes/SaldoDaMesada'
import { ExtratoDeMesada } from '@/componentes/ExtratoDeMesada'
import { CamposDeMovimento } from '@/componentes/CamposDeMovimento'
import { ApagarMovimento } from '@/componentes/ApagarMovimento'
import { PaginacaoDoExtrato } from '@/componentes/PaginacaoDoExtrato'
import { ListaDeFilhos } from '@/componentes/ListaDeFilhos'
import type { FilhoListado } from '@/servicos/filhos'
import { coresLiterais } from './ajuda-estatica'
import { renderizar } from './renderizar'

const SRC = path.resolve(process.cwd(), 'src')
const limpo = (html: string) => html.replaceAll('<!-- -->', '').replaceAll(' ', ' ')

const itens = [
  { id: 'm2', filhoId: 'f1', tipo: 'gasto', valorCentavos: 1230, data: '2026-10-06', descricao: 'Sorvete' },
  { id: 'm1', filhoId: 'f1', tipo: 'credito', valorCentavos: 123456, data: '2026-10-05', descricao: '' },
]

describe('SaldoDaMesada', () => {
  it('saldo positivo: valor, rótulo em texto, totais e a situação no atributo', () => {
    const html = limpo(renderizar(SaldoDaMesada, { saldoCentavos: 122226, creditosCentavos: 123456, gastosCentavos: 1230 }))
    expect(html).toContain('R$ 1.222,26')
    expect(html).toContain('Saldo disponível')
    expect(html).toContain('data-saldo="positivo"')
    expect(html).toContain('R$ 1.234,56')
    expect(html).toContain('R$ 12,30')
    expect(html).toMatch(/Recebido/)
    expect(html).toMatch(/Gasto/)
  })

  it('saldo negativo: sinal de menos E a frase, não só a cor', () => {
    const html = limpo(renderizar(SaldoDaMesada, { saldoCentavos: -1550, creditosCentavos: 1000, gastosCentavos: 2550 }))
    expect(html).toContain('-R$ 15,50')
    expect(html).toContain('Saldo negativo')
    expect(html).toContain('Os gastos passaram do que foi recebido.')
    expect(html).toContain('data-saldo="negativo"')
  })

  it('saldo zerado diz que está zerado', () => {
    const html = limpo(renderizar(SaldoDaMesada, { saldoCentavos: 0, creditosCentavos: 0, gastosCentavos: 0 }))
    expect(html).toContain('R$ 0,00')
    expect(html).toContain('Saldo zerado')
    expect(html).toContain('data-saldo="zerado"')
  })
})

describe('ExtratoDeMesada', () => {
  it('lista data, tipo em palavras, descrição e valor com sinal, na ordem recebida', () => {
    const html = limpo(renderizar(ExtratoDeMesada, { itens }))
    expect(html.indexOf('06/10/2026')).toBeLessThan(html.indexOf('05/10/2026'))
    expect(html).toContain('Gasto')
    expect(html).toContain('Crédito')
    expect(html).toContain('Sorvete')
    expect(html).toContain('-R$ 12,30')
    expect(html).toContain('R$ 1.234,56')
    expect(html).not.toContain('+R$')
    expect(html).toContain('valor-despesa')
    expect(html).toContain('valor-receita')
    expect(html).toContain('<th')
  })

  it('descrição vazia sai como traço, e o valor nunca vira texto de ponto flutuante', () => {
    const html = limpo(renderizar(ExtratoDeMesada, { itens }))
    expect(html).toContain('—')
    expect(html).not.toMatch(/NaN|undefined|\d+\.\d+(?!\d*[.,])\b/)
  })

  it('sem edição, não há link de editar nem de apagar (tela do filho)', () => {
    const html = limpo(renderizar(ExtratoDeMesada, { itens }))
    expect(html).not.toMatch(/Editar|Apagar|<form|<button/)
  })

  it('com edição (responsável), cada linha leva ao movimento do filho certo', () => {
    const html = limpo(renderizar(ExtratoDeMesada, { itens, editarDoFilho: 'f1' }))
    expect(html).toContain('href="/filhos/f1/mesada/m2"')
    expect(html).toContain('href="/filhos/f1/mesada/m1"')
    expect(html).toMatch(/Editar/)
  })

  it('vazio: diz o que fazer, diferente para o responsável e para o filho', () => {
    const responsavel = limpo(renderizar(ExtratoDeMesada, { itens: [], editarDoFilho: 'f1' }))
    expect(responsavel).toContain('Nenhum movimento ainda')
    expect(responsavel).toMatch(/formulário|Registre/i)
    const filho = limpo(renderizar(ExtratoDeMesada, { itens: [] }))
    expect(filho).toContain('Ainda não há movimentos de mesada.')
    expect(filho).not.toMatch(/<table/)
  })

  it('a tabela rola no celular em vez de estourar a tela', () => {
    expect(renderizar(ExtratoDeMesada, { itens })).toContain('tabela-rolavel')
  })
})

describe('CamposDeMovimento', () => {
  it('traz tipo (crédito e gasto), valor, data de hoje e descrição, todos rotulados', () => {
    const html = limpo(renderizar(CamposDeMovimento, { hoje: '2026-10-28' }))
    expect(html).toMatch(/name="tipo"[^>]*value="credito"/)
    expect(html).toMatch(/name="tipo"[^>]*value="gasto"/)
    expect(html).toContain('name="valor"')
    expect(html).toContain('inputMode="decimal"')
    expect(html).toMatch(/name="data"[^>]*value="2026-10-28"/)
    expect(html).toContain('name="descricao"')
    expect(html).toContain('maxLength="200"')
    for (const rotulo of ['Tipo', 'Valor (R$)', 'Data', 'Descrição (opcional)']) expect(html).toContain(rotulo)
    expect(html).not.toContain('name="id"')
  })

  it('na edição, leva o id e os valores atuais, com o valor no formato do campo', () => {
    const html = limpo(
      renderizar(CamposDeMovimento, {
        hoje: '2026-10-28',
        inicial: { id: 'm2', tipo: 'gasto', valor: '12,30', data: '2026-10-06', descricao: 'Sorvete' },
      }),
    )
    expect(html).toMatch(/name="id"[^>]*value="m2"/)
    expect(html).toMatch(/name="valor"[^>]*value="12,30"/)
    expect(html).toMatch(/checked=""[^>]*value="gasto"/)
    expect(html).not.toMatch(/checked=""[^>]*value="credito"/)
    expect(html).toMatch(/name="data"[^>]*value="2026-10-06"/)
    expect(html).toContain('value="Sorvete"')
  })
})

describe('ApagarMovimento (definitivo, em dois passos)', () => {
  it('primeiro passo: só o botão, sem formulário de exclusão', () => {
    const html = limpo(renderizar(ApagarMovimento, { id: 'm1' }))
    expect(html).toContain('Apagar movimento')
    expect(html).not.toContain('Confirmar exclusão')
    expect(html).not.toContain('<form')
  })

  it('segundo passo: avisa que não desfaz e pede a confirmação', () => {
    const html = limpo(renderizar(ApagarMovimento, { id: 'm1', confirmandoInicial: true }))
    expect(html).toContain('Confirmar exclusão')
    expect(html).toMatch(/não pode ser desfeita/)
    expect(html).toMatch(/name="id"[^>]*value="m1"/)
    expect(html).toContain('Cancelar')
  })
})

describe('PaginacaoDoExtrato', () => {
  it('com uma página só, não aparece', () => {
    expect(renderizar(PaginacaoDoExtrato, { pagina: 1, paginas: 1 })).toBe('')
  })

  it('do filho: Anterior e Próxima por link, sem id nenhum no endereço', () => {
    const html = limpo(renderizar(PaginacaoDoExtrato, { pagina: 2, paginas: 3 }))
    expect(html).toContain('href="/mesada"')
    expect(html).toContain('href="/mesada?pagina=3"')
    expect(html).toContain('Página 2 de 3')
    expect(html).toMatch(/aria-label="Páginas do extrato"/)
  })

  it('do responsável: os links mantêm o filho', () => {
    const html = limpo(renderizar(PaginacaoDoExtrato, { pagina: 1, paginas: 2, filhoId: 'f1' }))
    expect(html).toContain('href="/filhos/f1/mesada?pagina=2"')
    expect(html).not.toContain('Anterior')
  })
})

describe('lista de filhos com saldo', () => {
  const filho: FilhoListado = {
    id: 'f1', nome: 'Ana', nascimento: null, mesadaCentavos: 5000, periodicidade: 'semanal', login: null,
  }
  it('mostra o saldo de cada filho em texto e o link do extrato', () => {
    const html = limpo(renderizar(ListaDeFilhos, { filhos: [filho, { ...filho, id: 'f2', nome: 'Bia' }], saldos: { f1: 3770, f2: -800 } }))
    expect(html).toContain('R$ 37,70')
    expect(html).toContain('Saldo disponível')
    expect(html).toContain('-R$ 8,00')
    expect(html).toContain('Saldo negativo')
    expect(html).toContain('href="/filhos/f1/mesada"')
  })

  it('sem o mapa de saldos, a lista continua como na FT-05', () => {
    const html = limpo(renderizar(ListaDeFilhos, { filhos: [filho] }))
    expect(html).not.toContain('Saldo')
  })
})

describe('só tokens', () => {
  it.each([
    'src/componentes/SaldoDaMesada.tsx',
    'src/componentes/ExtratoDeMesada.tsx',
    'src/componentes/CamposDeMovimento.tsx',
    'src/componentes/ApagarMovimento.tsx',
    'src/componentes/PaginacaoDoExtrato.tsx',
    'src/lib/mesada.ts',
  ])('%s não escreve cor por extenso', (arquivo) => {
    expect(coresLiterais(readFileSync(path.resolve(process.cwd(), arquivo), 'utf8'))).toEqual([])
  })

  it('os estilos da mesada usam só var(--token), cobrem os três saldos e o celular', () => {
    const css = readFileSync(path.join(SRC, 'estilos/global.css'), 'utf8')
    const inicio = css.indexOf('/* ---------- mesada (FT-06) ---------- */')
    expect(inicio).toBeGreaterThan(0)
    const bloco = css.slice(inicio, css.indexOf('/* ---------- celular ---------- */'))
    for (const s of ['positivo', 'zerado', 'negativo']) expect(bloco).toContain(`data-saldo='${s}'`)
    expect(bloco).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(bloco).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/)
    const celular = css.slice(css.indexOf('@media (max-width: 768px)'))
    expect(celular).toContain('.saldo-da-mesada')
  })
})
