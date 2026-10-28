/**
 * Backup do banco (PR-13): um arquivo SQLite consistente, com nome datado,
 * numa pasta fora do git e só do dono. O banco usado é temporário, com as
 * migrations reais.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { caminhoDoBanco, gerarBackup, nomeDoBackup } from '@/lib/backup'
import { criarBancoTemporario, type BancoTemporario } from './banco-temporario'

let banco: BancoTemporario
beforeEach(() => {
  banco = criarBancoTemporario()
  const db = new Database(banco.arquivo)
  const inserir = db.prepare('INSERT INTO categorias (id, nome, tipo) VALUES (?, ?, ?)')
  inserir.run('c1', 'Mercado', 'despesa')
  inserir.run('c2', 'Salário', 'receita')
  db.close()
})
afterEach(() => banco.limpar())

const AGORA = new Date('2026-10-28T15:04:05.000Z') // 12:04:05 em São Paulo

describe('nome do arquivo', () => {
  it('backup-AAAA-MM-DD-HHMMSS.db no horário de São Paulo', () => {
    expect(nomeDoBackup(AGORA)).toBe('backup-2026-10-28-120405.db')
  })

  it('perto da meia-noite o dia é o de São Paulo, não o de UTC', () => {
    expect(nomeDoBackup(new Date('2026-10-29T02:30:00.000Z'))).toBe('backup-2026-10-28-233000.db')
  })
})

describe('caminhoDoBanco', () => {
  it('lê o caminho de uma URL file: relativa ou absoluta', () => {
    expect(caminhoDoBanco('file:./dev.db', '/raiz')).toBe('/raiz/dev.db')
    expect(caminhoDoBanco('file:/abs/familia.db', '/raiz')).toBe('/abs/familia.db')
    expect(caminhoDoBanco('file:./dev.db?connection_limit=1', '/raiz')).toBe('/raiz/dev.db')
  })

  it('ausente ou de outro tipo de banco é erro em português', () => {
    expect(() => caminhoDoBanco(undefined, '/raiz')).toThrowError(/DATABASE_URL/)
    expect(() => caminhoDoBanco('postgres://h/b', '/raiz')).toThrowError(/DATABASE_URL/)
  })
})

describe('gerarBackup', () => {
  it('gera um SQLite íntegro com as mesmas linhas, no nome datado', () => {
    const pasta = path.join(banco.pasta, 'backups')
    const r = gerarBackup({ banco: banco.arquivo, pasta, agora: AGORA })
    expect(path.basename(r.caminho)).toBe('backup-2026-10-28-120405.db')
    expect(readdirSync(pasta)).toEqual(['backup-2026-10-28-120405.db'])
    expect(readFileSync(r.caminho).subarray(0, 15).toString()).toBe('SQLite format 3')
    const db = new Database(r.caminho, { readonly: true })
    expect(db.pragma('integrity_check', { simple: true })).toBe('ok')
    expect(db.prepare('SELECT nome FROM categorias ORDER BY nome').all()).toEqual([
      { nome: 'Mercado' },
      { nome: 'Salário' },
    ])
    db.close()
  })

  it('o backup é consistente mesmo com o banco original aberto e com transação recente', () => {
    const aberto = new Database(banco.arquivo)
    aberto.prepare("INSERT INTO categorias (id, nome, tipo) VALUES ('c3', 'Lazer', 'despesa')").run()
    const r = gerarBackup({ banco: banco.arquivo, pasta: path.join(banco.pasta, 'b'), agora: AGORA })
    aberto.close()
    const db = new Database(r.caminho, { readonly: true })
    expect(db.prepare('SELECT COUNT(*) AS n FROM categorias').get()).toEqual({ n: 3 })
    db.close()
  })

  it('pasta só do dono (0700) e arquivo só do dono (0600): o backup leva hash de senha', () => {
    const pasta = path.join(banco.pasta, 'backups')
    const r = gerarBackup({ banco: banco.arquivo, pasta, agora: AGORA })
    expect(statSync(pasta).mode & 0o777).toBe(0o700)
    expect(statSync(r.caminho).mode & 0o777).toBe(0o600)
  })

  it('não altera o banco original', () => {
    const antes = readFileSync(banco.arquivo)
    gerarBackup({ banco: banco.arquivo, pasta: path.join(banco.pasta, 'b'), agora: AGORA })
    expect(readFileSync(banco.arquivo).equals(antes)).toBe(true)
  })

  it('dois backups no mesmo segundo não se sobrescrevem', () => {
    const pasta = path.join(banco.pasta, 'b')
    const a = gerarBackup({ banco: banco.arquivo, pasta, agora: AGORA })
    const b = gerarBackup({ banco: banco.arquivo, pasta, agora: AGORA })
    expect(a.caminho).not.toBe(b.caminho)
    expect(readdirSync(pasta)).toHaveLength(2)
  })

  it('banco de origem inexistente: erro em português e nenhum arquivo criado', () => {
    const pasta = path.join(banco.pasta, 'b')
    expect(() => gerarBackup({ banco: path.join(banco.pasta, 'nao-existe.db'), pasta, agora: AGORA })).toThrowError(
      /banco.*não encontrado/i,
    )
    expect(existsSync(pasta) ? readdirSync(pasta) : []).toEqual([])
  })

  it('origem que não é um SQLite não vira "backup" válido e não deixa arquivo', () => {
    const falso = path.join(banco.pasta, 'falso.db')
    execFileSync('sh', ['-c', `echo "isto nao e um banco, apenas texto longo o bastante para parecer arquivo" > '${falso}'`])
    const pasta = path.join(banco.pasta, 'b')
    expect(() => gerarBackup({ banco: falso, pasta, agora: AGORA })).toThrowError()
    expect(existsSync(pasta) ? readdirSync(pasta) : []).toEqual([])
  })
})

describe('o comando npm run backup', () => {
  it('gera o arquivo de verdade, imprime o caminho e avisa para guardar com cuidado', () => {
    const pasta = path.join(banco.pasta, 'cmd')
    const r = spawnSync('npx', ['tsx', 'scripts/backup.ts'], {
      env: { ...process.env, DATABASE_URL: banco.url, BACKUP_DIR: pasta },
      encoding: 'utf8',
    })
    expect(r.status).toBe(0)
    const [arquivo] = readdirSync(pasta)
    expect(arquivo).toMatch(/^backup-\d{4}-\d{2}-\d{2}-\d{6}\.db$/)
    expect(r.stdout).toContain(arquivo as string)
    expect(r.stdout).toMatch(/hash|senha/i)
    expect(r.stdout).toMatch(/fora do git|guarde/i)
  })

  it('banco inexistente: código diferente de zero e mensagem em português, sem pilha', () => {
    const r = spawnSync('npx', ['tsx', 'scripts/backup.ts'], {
      env: { ...process.env, DATABASE_URL: `file:${path.join(banco.pasta, 'nada.db')}`, BACKUP_DIR: path.join(banco.pasta, 'cmd') },
      encoding: 'utf8',
    })
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/não encontrado/i)
    expect(r.stderr).not.toMatch(/\n\s+at /)
  })
})
