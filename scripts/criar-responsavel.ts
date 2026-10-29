// Cria uma família e o seu responsável (papel admin) direto no banco, por
// exemplo no de produção. Não usa a seed de demonstração, que cria contas de
// senha conhecida. Quem usa o site pode se cadastrar em /cadastrar; este script
// serve para criar a primeira conta sem passar pela tela.
//
//   RESPONSAVEL_NOME="Fulana" RESPONSAVEL_EMAIL="fulana@exemplo.com" \
//   RESPONSAVEL_SENHA="uma senha de 8+ caracteres" npm run responsavel:criar
//
// Opcional: RESPONSAVEL_FAMILIA com o nome da família. Não faz nada se o e-mail
// já tem conta.
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
  if (await prisma.usuario.findUnique({ where: { email } })) {
    console.log('Já existe uma conta com este e-mail. Nada foi criado.')
  } else {
    // Cria a família junto, como o autocadastro faz.
    await prisma.familia.create({
      data: {
        nome: process.env.RESPONSAVEL_FAMILIA?.trim() || `Família de ${nome}`,
        usuarios: { create: { nome, email, papel: 'admin', senhaHash: await hashDeSenha(senha) } },
      },
    })
    console.log(`Família e responsável criados: ${email}`)
  }
} finally {
  await prisma.$disconnect()
}
