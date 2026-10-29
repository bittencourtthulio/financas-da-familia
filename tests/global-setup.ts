// Roda uma vez antes de todos os testes: zera o banco de teste e aplica as
// migrations versionadas — as mesmas que rodam em produção. Um banco montado
// por outro caminho testaria um esquema que ninguém vai usar. O banco só é
// zerado se o nome dele tiver "test" (ver `url-de-teste.ts`).
import { execSync } from 'node:child_process'
import pg from 'pg'
import { urlDeTeste } from './url-de-teste'

export default async function setup() {
  const url = urlDeTeste()

  const cliente = new pg.Client({ connectionString: url })
  await cliente.connect()
  try {
    await cliente.query('DROP SCHEMA IF EXISTS public CASCADE')
    await cliente.query('CREATE SCHEMA public')
  } finally {
    await cliente.end()
  }

  execSync('npx prisma migrate deploy', {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: url, DATABASE_URL_UNPOOLED: url },
  })
}
