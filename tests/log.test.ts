/**
 * Log estruturado (PR-14): uma linha JSON por evento, com nível, instante,
 * evento e contexto. O que é segredo, hash, e-mail ou dinheiro nunca é gravado.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { hash } from 'bcryptjs'
import { montarLinha, registrar, log, definirDestinoDoLog, redigir } from '@/lib/log'
import { CHAVE_PROIBIDA, VALOR_PROIBIDO } from '@/lib/chaves-proibidas'

const AGORA = new Date('2026-10-28T15:04:05.678Z')

function capturar() {
  const linhas: string[] = []
  definirDestinoDoLog((l) => linhas.push(l))
  return linhas
}

afterEach(() => definirDestinoDoLog(null))

describe('formato da linha', () => {
  it('é um JSON de uma linha só com nível, instante ISO, evento e contexto', () => {
    const linha = montarLinha('info', 'servidor.iniciado', { porta: 3000 }, AGORA)
    expect(linha).not.toContain('\n')
    expect(JSON.parse(linha)).toEqual({
      nivel: 'info',
      instante: '2026-10-28T15:04:05.678Z',
      evento: 'servidor.iniciado',
      contexto: { porta: 3000 },
    })
  })

  it('contexto ausente vira objeto vazio e a ordem dos campos é fixa', () => {
    const linha = montarLinha('aviso', 'saude.lenta', undefined, AGORA)
    expect(Object.keys(JSON.parse(linha))).toEqual(['nivel', 'instante', 'evento', 'contexto'])
    expect(JSON.parse(linha).contexto).toEqual({})
  })

  it('evento fora do formato minúsculo.com.ponto é recusado, para o log não virar texto livre', () => {
    expect(() => montarLinha('info', 'Evento Com Espaço', {}, AGORA)).toThrow(/evento/i)
    expect(() => montarLinha('info', '', {}, AGORA)).toThrow(/evento/i)
  })

  it('registrar entrega a linha ao destino e log.erro usa o nível erro', () => {
    const linhas = capturar()
    registrar('info', 'um.evento', { a: 1 }, AGORA)
    log.erro('outro.evento', { codigo: 'P2002' })
    expect(linhas).toHaveLength(2)
    expect(JSON.parse(linhas[0] as string).nivel).toBe('info')
    expect(JSON.parse(linhas[1] as string)).toMatchObject({ nivel: 'erro', evento: 'outro.evento' })
  })
})

describe('o que nunca vai para o log', () => {
  it('chave proibida da trilha tem o valor trocado, qualquer que seja o valor', () => {
    const saida = redigir({
      senha: 'abc',
      password: 'abc',
      senhaHash: 'x',
      token: 'x',
      jwtSecret: 'x',
      email: 'ana@casa.com',
      valorCentavos: 12345,
      saldo: 10,
      cpf: '1',
      porta: 3000,
    })
    expect(saida).toEqual({
      senha: '[removido]',
      password: '[removido]',
      senhaHash: '[removido]',
      token: '[removido]',
      jwtSecret: '[removido]',
      email: '[removido]',
      valorCentavos: '[removido]',
      saldo: '[removido]',
      cpf: '[removido]',
      porta: 3000,
    })
  })

  it('a lista de chaves é a mesma da trilha de atividade (uma só fonte)', () => {
    expect(CHAVE_PROIBIDA.test('senhaHash')).toBe(true)
    expect(CHAVE_PROIBIDA.test('porta')).toBe(false)
    expect(VALOR_PROIBIDO.test('eyJhbGciOi.eyJzdWIi.assinatura')).toBe(true)
  })

  it('valor com cara de hash bcrypt real, JWT ou e-mail em texto é trocado mesmo sob chave inocente', async () => {
    const bcrypt = await hash('senha-qualquer', 4)
    const linha = montarLinha(
      'erro',
      'falha.qualquer',
      {
        detalhe: bcrypt,
        outro: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.assinatura',
        texto: 'falhou para ana.silva@casa.com ao salvar',
        normal: 'tudo certo',
      },
      AGORA,
    )
    expect(linha).not.toContain(bcrypt)
    expect(linha).not.toContain('eyJhbGci')
    expect(linha).not.toContain('ana.silva')
    expect(linha).not.toContain('@')
    expect(JSON.parse(linha).contexto.normal).toBe('tudo certo')
  })

  it('contexto aninhado também é redigido, em lista e em objeto', () => {
    const saida = redigir({ usuario: { nome: 'Ana', senha: 'x' }, itens: [{ valor: 5 }, 'ok'] })
    expect(saida).toEqual({ usuario: { nome: 'Ana', senha: '[removido]' }, itens: [{ valor: '[removido]' }, 'ok'] })
  })

  it('texto longo é cortado e profundidade excessiva não estoura', () => {
    const saida = redigir({ longo: 'x'.repeat(500) })
    expect((saida.longo as string).length).toBeLessThanOrEqual(201)
    const fundo: Record<string, unknown> = {}
    let atual = fundo
    for (let i = 0; i < 20; i += 1) {
      const proximo: Record<string, unknown> = {}
      atual.n = proximo
      atual = proximo
    }
    expect(() => JSON.stringify(redigir(fundo))).not.toThrow()
  })

  it('erro de verdade no contexto vira só nome, sem mensagem nem pilha', () => {
    const erro = new Error('falhou para ana@casa.com')
    const linha = montarLinha('erro', 'falha.qualquer', { erro }, AGORA)
    expect(linha).not.toContain('ana@casa.com')
    expect(linha).not.toContain('stack')
    expect(linha).not.toMatch(/at .*\.ts/)
    expect(JSON.parse(linha).contexto.erro).toBe('Error')
  })
})

describe('o log nunca derruba quem o chamou', () => {
  it('destino que lança não propaga a exceção', () => {
    definirDestinoDoLog(() => {
      throw new Error('disco cheio')
    })
    expect(() => log.info('um.evento', {})).not.toThrow()
  })

  it('evento inválido em log.info não propaga a exceção', () => {
    capturar()
    expect(() => log.info('Evento Inválido', {})).not.toThrow()
  })

  it('contexto circular não propaga a exceção', () => {
    const linhas = capturar()
    const a: Record<string, unknown> = {}
    a.si = a
    expect(() => log.info('um.evento', a)).not.toThrow()
    expect(linhas).toHaveLength(1)
  })
})
