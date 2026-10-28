// Banco SQLite temporário com o esquema REAL: aplica, em ordem, o SQL das
// migrations versionadas. Os testes de backup e restauração usam um banco
// próprio (D-12) porque o cliente da suíte mantém o arquivo do banco de teste
// aberto, e trocar o arquivo debaixo dele daria falha intermitente.
import Database from 'better-sqlite3'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { PrismaClient } from '@/gerado/prisma/client'

export interface BancoTemporario {
  pasta: string
  arquivo: string
  url: string
  limpar: () => void
}

export function criarBancoTemporario(): BancoTemporario {
  const pasta = mkdtempSync(path.join(tmpdir(), 'banco-'))
  const arquivo = path.join(pasta, 'familia.db')
  const db = new Database(arquivo)
  const raiz = path.resolve(process.cwd(), 'prisma/migrations')
  for (const nome of readdirSync(raiz).sort()) {
    if (nome.endsWith('.toml')) continue
    db.exec(readFileSync(path.join(raiz, nome, 'migration.sql'), 'utf8'))
  }
  db.close()
  return {
    pasta,
    arquivo,
    url: `file:${arquivo}`,
    limpar: () => rmSync(pasta, { recursive: true, force: true }),
  }
}

export function clienteDe(arquivo: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${arquivo}` }) })
}
