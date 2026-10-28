import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/gerado/prisma/client.js'
import { DEMONSTRACAO, DEMONSTRACAO_FILHOS, semearDemonstracao } from './demonstracao.js'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL ausente. Veja o modelo de ambiente.')

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) })

semearDemonstracao(prisma)
  .then(() => {
    console.log('Seed de demonstração aplicada:')
    for (const conta of DEMONSTRACAO) {
      console.log(`  ${conta.papel.padEnd(8)} ${conta.email}  senha: ${conta.senha}`)
    }
    for (const conta of DEMONSTRACAO_FILHOS) {
      console.log(`  ${'filho'.padEnd(8)} ${conta.email}  senha: ${conta.senha}  (${conta.nome})`)
    }
    return prisma.$disconnect()
  })
  .catch(async (erro) => {
    console.error(erro)
    await prisma.$disconnect()
    process.exit(1)
  })
