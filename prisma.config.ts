import path from 'node:path'
import dotenv from 'dotenv'
import { defineConfig } from 'prisma/config'

// O que é local da máquina fica no arquivo de ambiente local (vence); o resto,
// no arquivo de ambiente comum. O `dotenv` não sobrescreve variável já
// definida, então o primeiro da lista ganha.
dotenv.config({ path: ['.env.local', '.env'], quiet: true })

// Prisma 7: a URL do banco sai do schema e vem para cá. O schema descreve
// o modelo; a conexão é configuração, e configuração é lida por ambiente.
// As migrations usam a conexão direta (DATABASE_URL_UNPOOLED), porque o
// pooler do Neon não aguenta o que o Prisma Migrate faz; sem ela, vale a
// DATABASE_URL (no Postgres local as duas são a mesma).
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url:
      process.env.DATABASE_URL_UNPOOLED ??
      process.env.DATABASE_URL ??
      'postgresql://localhost:5432/financas_dev',
  },
})
