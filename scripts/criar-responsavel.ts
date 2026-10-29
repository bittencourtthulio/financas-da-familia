// Cria o primeiro responsável (papel admin) de um banco novo, por exemplo o de
// produção. Não usa a seed de demonstração, que cria contas de senha conhecida.
//
//   RESPONSAVEL_NOME="Fulana" RESPONSAVEL_EMAIL="fulana@exemplo.com" \
//   RESPONSAVEL_SENHA="uma senha de 8+ caracteres" npm run responsavel:criar
//
// Não faz nada se já existir algum responsável: depois do primeiro, quem cria
// usuários é a própria tela Família.
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/gerado/prisma/client.js'
import { hashDeSenha } from '../src/lib/senha.js'

const url = process.env.DATABASE_URL
const nome = process.env.RESPONSAVEL_NOME?.trim()
const email = process.env.RESPONSAVEL_EMAIL?.trim().toLowerCase()
const senha = process.env.RESPONSAVEL_SENHA

if (!url) throw new Error('DATABASE_URL ausente.')
if (!nome || !email || !senha) {
  throw new Error('Informe RESPONSAVEL_NOME, RESPONSAVEL_EMAIL e RESPONSAVEL_SENHA.')
}
if (senha.length < 8) throw new Error('A senha precisa de ao menos 8 caracteres.')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })

try {
  const jaTem = await prisma.usuario.count({ where: { papel: 'admin' } })
  if (jaTem > 0) {
    console.log('Já existe um responsável neste banco. Nada foi criado.')
  } else {
    await prisma.usuario.create({
      data: { nome, email, papel: 'admin', senhaHash: await hashDeSenha(senha) },
    })
    console.log(`Responsável criado: ${email}`)
  }
} finally {
  await prisma.$disconnect()
}
