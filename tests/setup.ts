// Todos os arquivos de teste rodam contra o mesmo Postgres de teste (recriado
// uma vez em `global-setup.ts`). Cada arquivo começa com as tabelas vazias, o
// que o mantém independente dos outros; os testes rodam um arquivo por vez.
import pg from 'pg'
import { beforeAll } from 'vitest'
import { urlDeTeste } from './url-de-teste'

const url = urlDeTeste()

process.env.DATABASE_URL = url
process.env.DATABASE_URL_UNPOOLED = url
process.env.JWT_SECRET = 'segredo-de-teste-nao-usar-em-producao'
process.env.JWT_TTL_SEGUNDOS = '900'
// Log em arquivo desligado nos testes (FT-08): os servidores de produção que os
// testes sobem herdam isto e não escrevem em logs/ na raiz do projeto.
process.env.LOG_DIR = ''
// NODE_ENV é somente-leitura nos tipos do Node; o vitest já o define como
// 'test', e a atribuição direta não compila.
Object.assign(process.env, { NODE_ENV: 'test' })

beforeAll(async () => {
  const cliente = new pg.Client({ connectionString: url })
  await cliente.connect()
  try {
    const { rows } = await cliente.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'",
    )
    if (rows.length > 0) {
      const tabelas = rows.map((r) => `"${r.tablename}"`).join(', ')
      await cliente.query(`TRUNCATE ${tabelas} RESTART IDENTITY CASCADE`)
    }
  } finally {
    await cliente.end()
  }
})
