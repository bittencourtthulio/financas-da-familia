/**
 * Restauração (PR-13): só aceita um SQLite íntegro com as tabelas esperadas,
 * preserva uma cópia do banco atual antes de trocar e, diante de arquivo
 * inválido, deixa o banco atual exatamente como estava.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { gerarBackup } from '@/lib/backup'
import { TABELAS_ESPERADAS, restaurarBackup, validarBackup } from '@/lib/restauracao'
import { criarBancoTemporario, type BancoTemporario } from './banco-temporario'

let atual: BancoTemporario
let origem: BancoTemporario
let backup: string
let pastaDePreservacao: string

const AGORA = new Date('2026-10-28T15:04:05.000Z')

function categorias(arquivo: string): string[] {
  const db = new Database(arquivo, { readonly: true })
  const nomes = (db.prepare('SELECT nome FROM categorias ORDER BY nome').all() as Array<{ nome: string }>).map(
    (l) => l.nome,
  )
  db.close()
  return nomes
}

function semear(arquivo: string, nome: string) {
  const db = new Database(arquivo)
  db.prepare('INSERT INTO categorias (id, nome, tipo) VALUES (?, ?, ?)').run(`id-${nome}`, nome, 'despesa')
  db.close()
}

beforeEach(() => {
  atual = criarBancoTemporario()
  origem = criarBancoTemporario()
  semear(atual.arquivo, 'Atual')
  semear(origem.arquivo, 'DoBackup')
  backup = gerarBackup({ banco: origem.arquivo, pasta: path.join(origem.pasta, 'b'), agora: AGORA }).caminho
  pastaDePreservacao = path.join(atual.pasta, 'backups')
})
afterEach(() => {
  atual.limpar()
  origem.limpar()
})

describe('as tabelas esperadas', () => {
  it('são exatamente as tabelas de dado do banco migrado de verdade', () => {
    const db = new Database(origem.arquivo, { readonly: true })
    const reais = (
      db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
        .all() as Array<{ name: string }>
    ).map((l) => l.name)
    db.close()
    expect([...TABELAS_ESPERADAS].sort()).toEqual(reais)
  })
})

describe('validarBackup recusa o que não é um backup', () => {
  function recusa(arquivo: string, padrao: RegExp) {
    expect(() => validarBackup(arquivo)).toThrowError(padrao)
  }

  it('aceita um backup de verdade', () => {
    expect(() => validarBackup(backup)).not.toThrow()
  })

  it('arquivo que não existe', () => recusa(path.join(atual.pasta, 'nada.db'), /não encontrado/i))

  it('uma pasta no lugar do arquivo', () => recusa(atual.pasta, /não é um arquivo/i))

  it('arquivo vazio', () => {
    const f = path.join(atual.pasta, 'vazio.db')
    writeFileSync(f, '')
    recusa(f, /SQLite/i)
  })

  it('texto qualquer', () => {
    const f = path.join(atual.pasta, 'texto.db')
    writeFileSync(f, 'isto nao e um banco de dados, e apenas um texto comprido o bastante '.repeat(5))
    recusa(f, /não é um banco SQLite/i)
  })

  it('SQLite truncado no meio', () => {
    const f = path.join(atual.pasta, 'truncado.db')
    writeFileSync(f, readFileSync(backup).subarray(0, 6000))
    expect(() => validarBackup(f)).toThrowError(/íntegro|corromp|abrir|tabelas/i)
  })

  it('SQLite íntegro mas de outro sistema (sem as tabelas esperadas)', () => {
    const f = path.join(atual.pasta, 'outro.db')
    const db = new Database(f)
    db.exec('CREATE TABLE coisas (id INTEGER PRIMARY KEY)')
    db.close()
    recusa(f, /faltam as tabelas/i)
  })

  it('SQLite com uma tabela de dado a menos', () => {
    const f = path.join(atual.pasta, 'incompleto.db')
    const db = new Database(f)
    db.exec(readdirSync('prisma/migrations').filter((n) => !n.endsWith('.toml')).sort().map((n) => readFileSync(path.join('prisma/migrations', n, 'migration.sql'), 'utf8')).join('\n'))
    db.exec('DROP TABLE movimentos_de_mesada')
    db.close()
    recusa(f, /faltam as tabelas.*movimentos_de_mesada/i)
  })

  it('SQLite com o conteúdo adulterado no meio (página corrompida)', () => {
    const f = path.join(atual.pasta, 'adulterado.db')
    const bytes = Buffer.from(readFileSync(backup))
    // Zera uma página de dados inteira, depois do cabeçalho e do esquema.
    bytes.fill(0xff, 8192, Math.min(bytes.length, 8192 + 4096))
    writeFileSync(f, bytes)
    expect(() => validarBackup(f)).toThrowError(/íntegro|corromp|abrir|tabelas/i)
  })
})

describe('restaurarBackup', () => {
  it('troca os dados pelos do backup e guarda uma cópia do banco atual que ainda abre', () => {
    const r = restaurarBackup({ arquivo: backup, banco: atual.arquivo, pasta: pastaDePreservacao, agora: AGORA })
    expect(categorias(atual.arquivo)).toEqual(['DoBackup'])
    expect(r.preservado).not.toBeNull()
    expect(path.basename(r.preservado as string)).toBe('antes-da-restauracao-2026-10-28-120405.db')
    expect(categorias(r.preservado as string)).toEqual(['Atual'])
    expect(statSync(r.preservado as string).mode & 0o777).toBe(0o600)
  })

  it('o banco restaurado é íntegro, só do dono, e não sobram arquivos temporários nem de journal', () => {
    writeFileSync(`${atual.arquivo}-journal`, 'lixo')
    writeFileSync(`${atual.arquivo}-wal`, 'lixo')
    writeFileSync(`${atual.arquivo}-shm`, 'lixo')
    restaurarBackup({ arquivo: backup, banco: atual.arquivo, pasta: pastaDePreservacao, agora: AGORA })
    const db = new Database(atual.arquivo, { readonly: true })
    expect(db.pragma('integrity_check', { simple: true })).toBe('ok')
    db.close()
    expect(statSync(atual.arquivo).mode & 0o777).toBe(0o600)
    expect(readdirSync(atual.pasta).sort()).toEqual(['backups', 'familia.db'])
  })

  it('o arquivo de backup original continua intacto e utilizável', () => {
    const antes = readFileSync(backup)
    restaurarBackup({ arquivo: backup, banco: atual.arquivo, pasta: pastaDePreservacao, agora: AGORA })
    expect(readFileSync(backup).equals(antes)).toBe(true)
  })

  it('banco atual que ainda não existe (máquina nova): restaura sem cópia a preservar', () => {
    const novo = path.join(atual.pasta, 'novo', 'familia.db')
    mkdirSync(path.dirname(novo))
    const r = restaurarBackup({ arquivo: backup, banco: novo, pasta: pastaDePreservacao, agora: AGORA })
    expect(r.preservado).toBeNull()
    expect(categorias(novo)).toEqual(['DoBackup'])
  })

  it('restaurar o próprio banco por cima dele mesmo é recusado', () => {
    expect(() =>
      restaurarBackup({ arquivo: atual.arquivo, banco: atual.arquivo, pasta: pastaDePreservacao, agora: AGORA }),
    ).toThrowError(/próprio banco/i)
  })

  it.each([
    ['texto', (f: string) => writeFileSync(f, 'texto qualquer que nao e sqlite '.repeat(10))],
    ['vazio', (f: string) => writeFileSync(f, '')],
    ['sem as tabelas', (f: string) => { const db = new Database(f); db.exec('CREATE TABLE x (id INT)'); db.close() }],
  ])('arquivo inválido (%s): recusa e o banco atual fica byte a byte igual, sem cópia nem lixo', (_nome, fabricar) => {
    const ruim = path.join(atual.pasta, 'ruim.db')
    fabricar(ruim)
    const antes = readFileSync(atual.arquivo)
    expect(() =>
      restaurarBackup({ arquivo: ruim, banco: atual.arquivo, pasta: pastaDePreservacao, agora: AGORA }),
    ).toThrowError()
    expect(readFileSync(atual.arquivo).equals(antes)).toBe(true)
    expect(existsSync(pastaDePreservacao)).toBe(false)
    expect(readdirSync(atual.pasta).sort()).toEqual(['familia.db', 'ruim.db'])
  })

  it('arquivo que não existe: recusa e o banco atual fica igual', () => {
    const antes = readFileSync(atual.arquivo)
    expect(() =>
      restaurarBackup({ arquivo: path.join(atual.pasta, 'nada.db'), banco: atual.arquivo, pasta: pastaDePreservacao, agora: AGORA }),
    ).toThrowError(/não encontrado/i)
    expect(readFileSync(atual.arquivo).equals(antes)).toBe(true)
  })
})

describe('o comando npm run restaurar', () => {
  const rodar = (args: string[], env: Record<string, string>) =>
    spawnSync('npx', ['tsx', 'scripts/restaurar.ts', ...args], {
      env: { ...process.env, ...env },
      encoding: 'utf8',
    })

  it('restaura de verdade e diz onde ficou a cópia do banco anterior', () => {
    const r = rodar([backup], { DATABASE_URL: atual.url, BACKUP_DIR: pastaDePreservacao })
    expect(r.status).toBe(0)
    expect(categorias(atual.arquivo)).toEqual(['DoBackup'])
    expect(r.stdout).toMatch(/antes-da-restauracao-\d{4}-\d{2}-\d{2}-\d{6}\.db/)
    expect(r.stdout).toMatch(/parad|reinici/i)
  })

  it('arquivo inválido: código diferente de zero, mensagem em português, banco intacto', () => {
    const ruim = path.join(atual.pasta, 'ruim.db')
    writeFileSync(ruim, 'nao sou sqlite '.repeat(30))
    const antes = readFileSync(atual.arquivo)
    const r = rodar([ruim], { DATABASE_URL: atual.url, BACKUP_DIR: pastaDePreservacao })
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/não é um banco SQLite/i)
    expect(r.stderr).not.toMatch(/\n\s+at /)
    expect(readFileSync(atual.arquivo).equals(antes)).toBe(true)
  })

  it('sem o argumento: mostra como usar e sai com código diferente de zero', () => {
    const r = rodar([], { DATABASE_URL: atual.url, BACKUP_DIR: pastaDePreservacao })
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/npm run restaurar -- /)
  })
})
