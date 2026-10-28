/**
 * Retenção do log (PR-11): arquivo por dia, e o que tem mais de 90 dias é
 * descartado. As datas são injetadas, então o limite é exato.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  RETENCAO_DIAS,
  nomeDoArquivoDeLog,
  pastaDeLog,
  descartarLogsAntigos,
} from '@/lib/log-arquivo'
import { registrar, definirDestinoDoLog } from '@/lib/log'

const AGORA = new Date('2026-10-28T12:00:00.000Z')
let pasta: string

beforeEach(() => {
  pasta = mkdtempSync(path.join(tmpdir(), 'log-'))
})
afterEach(() => {
  rmSync(pasta, { recursive: true, force: true })
  delete process.env.LOG_DIR
  definirDestinoDoLog(null)
})

function arquivoComIdade(dias: number): string {
  const dia = new Date(AGORA.getTime() - dias * 86_400_000).toISOString().slice(0, 10)
  const nome = `app-${dia}.log`
  writeFileSync(path.join(pasta, nome), '{"nivel":"info"}\n')
  return nome
}

describe('nome do arquivo e pasta', () => {
  it('um arquivo por dia UTC: app-AAAA-MM-DD.log', () => {
    expect(nomeDoArquivoDeLog(new Date('2026-10-28T23:59:59.999Z'))).toBe('app-2026-10-28.log')
    expect(nomeDoArquivoDeLog(new Date('2026-10-29T00:00:00.000Z'))).toBe('app-2026-10-29.log')
  })

  it('a retenção declarada é de 90 dias', () => {
    expect(RETENCAO_DIAS).toBe(90)
  })

  it('LOG_DIR manda; vazio desliga; sem nada, no teste não grava, fora dele usa logs/', () => {
    expect(pastaDeLog({ LOG_DIR: '/tmp/x' })).toBe('/tmp/x')
    expect(pastaDeLog({ LOG_DIR: '' })).toBeNull()
    expect(pastaDeLog({ NODE_ENV: 'test' })).toBeNull()
    expect(pastaDeLog({ NODE_ENV: 'production' })).toBe(path.resolve(process.cwd(), 'logs'))
  })
})

describe('descarte de logs com mais de 90 dias', () => {
  it('apaga 91 e 400 dias; guarda 0, 89 e 90 dias', () => {
    const guardados = [arquivoComIdade(0), arquivoComIdade(89), arquivoComIdade(90)]
    const apagados = [arquivoComIdade(91), arquivoComIdade(400)]
    const saida = descartarLogsAntigos(pasta, AGORA)
    expect(saida.sort()).toEqual([...apagados].sort())
    expect(readdirSync(pasta).sort()).toEqual([...guardados].sort())
  })

  it('o limite acompanha a data injetada, não o relógio', () => {
    const nome = arquivoComIdade(60)
    expect(descartarLogsAntigos(pasta, AGORA)).toEqual([])
    const maisTarde = new Date(AGORA.getTime() + 31 * 86_400_000)
    expect(descartarLogsAntigos(pasta, maisTarde)).toEqual([nome])
  })

  it('só mexe em arquivo com o nome do log: outro nome, subpasta e data impossível ficam', () => {
    writeFileSync(path.join(pasta, 'notas-2020-01-01.txt'), 'x')
    writeFileSync(path.join(pasta, 'app-2020-01-01.log.bak'), 'x')
    writeFileSync(path.join(pasta, 'app-2020-13-45.log'), 'x')
    mkdirSync(path.join(pasta, 'app-2020-01-01.log.d'))
    expect(descartarLogsAntigos(pasta, AGORA)).toEqual([])
    expect(readdirSync(pasta)).toHaveLength(4)
  })

  it('pasta que não existe não é erro', () => {
    expect(descartarLogsAntigos(path.join(pasta, 'nao-existe'), AGORA)).toEqual([])
  })

  it('aceita outro prazo, para o teste mostrar que o número não está fixo na regra', () => {
    const nome = arquivoComIdade(10)
    expect(descartarLogsAntigos(pasta, AGORA, 5)).toEqual([nome])
  })
})

describe('gravação no arquivo do dia', () => {
  it('com LOG_DIR, cada evento vira uma linha no arquivo do dia do evento', () => {
    process.env.LOG_DIR = path.join(pasta, 'aninhada', 'logs')
    registrar('info', 'um.evento', { a: 1 }, new Date('2026-10-28T10:00:00Z'))
    registrar('aviso', 'outro.evento', { senha: 'x' }, new Date('2026-10-29T10:00:00Z'))
    const dir = process.env.LOG_DIR
    const dia28 = readFileSync(path.join(dir, 'app-2026-10-28.log'), 'utf8')
    const dia29 = readFileSync(path.join(dir, 'app-2026-10-29.log'), 'utf8')
    expect(dia28.trim().split('\n')).toHaveLength(1)
    expect(JSON.parse(dia28)).toMatchObject({ evento: 'um.evento' })
    expect(dia29).not.toContain('"x"')
    expect(dia29).toContain('[removido]')
    expect(statSync(dir).mode & 0o777).toBe(0o700)
  })

  it('sem LOG_DIR, no teste, nada é gravado em disco', () => {
    registrar('info', 'um.evento', {}, AGORA)
    expect(existsSync(path.join(process.cwd(), 'logs'))).toBe(false)
  })

  it('falha ao gravar o arquivo não propaga', () => {
    writeFileSync(path.join(pasta, 'ocupado'), 'x')
    process.env.LOG_DIR = path.join(pasta, 'ocupado', 'dentro')
    expect(() => registrar('info', 'um.evento', {}, AGORA)).not.toThrow()
  })
})

describe('o comando npm run log:limpar', () => {
  it('descarta de verdade e diz quantos', () => {
    const velho = arquivoComIdade(5000)
    const novo = arquivoComIdade(1)
    const saida = execFileSync('npx', ['tsx', 'scripts/limpar-logs.ts'], {
      env: { ...process.env, LOG_DIR: pasta },
      encoding: 'utf8',
    })
    expect(saida).toMatch(/1 arquivo/)
    expect(saida).toContain('90 dias')
    expect(readdirSync(pasta)).toEqual([novo])
    expect(readdirSync(pasta)).not.toContain(velho)
  })

  it('sem pasta de log configurada, avisa e sai sem erro', () => {
    const saida = execFileSync('npx', ['tsx', 'scripts/limpar-logs.ts'], {
      env: { ...process.env, LOG_DIR: '' },
      encoding: 'utf8',
    })
    expect(saida).toMatch(/desligad|não há pasta/i)
  })
})
