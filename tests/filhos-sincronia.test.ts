/**
 * FT-09, o login do filho acompanha o cadastro (PR-39): ao editar o nome do
 * filho, o nome do usuário de login ligado a ele muda na mesma transação. O
 * e-mail é credencial e nunca é tocado. Sem login, nada mais muda.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { cadastrarFilho, criarLoginDoFilho, editarFilho } from '@/servicos/filhos'
import { entrar, reiniciarLimiteDeLogin, usuarioDaSessao } from '@/servicos/autenticacao'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(async () => {
  await limparBanco()
  reiniciarLimiteDeLogin()
})

const ANA = { nome: 'Ana', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' }
const BIA = { nome: 'Bia', nascimento: '2012-07-01', valor: '120,00', periodicidade: 'mensal' }
const SENHA = 'senha-do-filho-123'

async function filhoComLogin(dados = ANA, email = 'ana@exemplo.local') {
  const admin = await criarAdmin()
  const filho = await cadastrarFilho(admin, dados)
  await criarLoginDoFilho(admin, filho.id, { email, senha: SENHA })
  return { admin, filho }
}

const usuarioDe = async (filhoId: string) => {
  const f = await prisma.filho.findUniqueOrThrow({ where: { id: filhoId }, include: { usuario: true } })
  return f.usuario
}

describe('editarFilho renomeia o login vinculado', () => {
  it('o nome do usuário de login passa a ser o novo nome do filho', async () => {
    const { admin, filho } = await filhoComLogin()
    await editarFilho(admin, filho.id, { ...ANA, nome: 'Ana Clara' })
    expect((await usuarioDe(filho.id))?.nome).toBe('Ana Clara')
  })

  it('a sessão do filho (menu, perfil) já enxerga o nome novo', async () => {
    const { admin, filho } = await filhoComLogin()
    await editarFilho(admin, filho.id, { ...ANA, nome: 'Ana Clara' })
    const { token } = await entrar({ email: 'ana@exemplo.local', senha: SENHA })
    expect((await usuarioDaSessao(token)).nome).toBe('Ana Clara')
  })

  it('o nome é aparado como o do filho (sem espaços nas pontas)', async () => {
    const { admin, filho } = await filhoComLogin()
    await editarFilho(admin, filho.id, { ...ANA, nome: '  Ana Clara  ' })
    expect((await usuarioDe(filho.id))?.nome).toBe('Ana Clara')
  })

  it('o e-mail, o papel, a situação e a senha do login ficam como estavam', async () => {
    const { admin, filho } = await filhoComLogin()
    const antes = await usuarioDe(filho.id)
    await editarFilho(admin, filho.id, { ...ANA, nome: 'Ana Clara' })
    const depois = await usuarioDe(filho.id)
    expect(depois).toMatchObject({
      id: antes?.id,
      email: 'ana@exemplo.local',
      papel: 'filho',
      ativo: true,
      senhaHash: antes?.senhaHash,
    })
  })

  it('o login desativado também acompanha o nome, e continua desativado', async () => {
    const { admin, filho } = await filhoComLogin()
    await prisma.usuario.updateMany({ where: { papel: 'filho' }, data: { ativo: false } })
    await editarFilho(admin, filho.id, { ...ANA, nome: 'Ana Clara' })
    expect(await usuarioDe(filho.id)).toMatchObject({ nome: 'Ana Clara', ativo: false })
  })

  it('mudar só a mesada não mexe no usuário', async () => {
    const { admin, filho } = await filhoComLogin()
    const antes = await usuarioDe(filho.id)
    await editarFilho(admin, filho.id, { ...ANA, valor: '80,00' })
    expect(await usuarioDe(filho.id)).toEqual(antes)
  })
})

describe('o que não pode ser tocado', () => {
  it('o irmão e o login do irmão ficam intocados', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, ANA)
    const bia = await cadastrarFilho(admin, BIA)
    await criarLoginDoFilho(admin, ana.id, { email: 'ana@exemplo.local', senha: SENHA })
    await criarLoginDoFilho(admin, bia.id, { email: 'bia@exemplo.local', senha: SENHA })
    const biaAntes = await prisma.filho.findUniqueOrThrow({ where: { id: bia.id } })
    const usuarioBiaAntes = await usuarioDe(bia.id)

    await editarFilho(admin, ana.id, { ...ANA, nome: 'Ana Clara' })

    expect(await prisma.filho.findUniqueOrThrow({ where: { id: bia.id } })).toEqual(biaAntes)
    expect(await usuarioDe(bia.id)).toEqual(usuarioBiaAntes)
  })

  it('o responsável e outro usuário que tenha o mesmo nome do filho ficam intocados', async () => {
    const { admin, filho } = await filhoComLogin()
    const homonimo = await criarUsuario({ papel: 'usuario' })
    await prisma.usuario.update({ where: { id: homonimo.id }, data: { nome: 'Ana' } })
    const adminAntes = await prisma.usuario.findUniqueOrThrow({ where: { id: admin.id } })

    await editarFilho(admin, filho.id, { ...ANA, nome: 'Ana Clara' })

    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: homonimo.id } })).nome).toBe('Ana')
    expect(await prisma.usuario.findUniqueOrThrow({ where: { id: admin.id } })).toEqual(adminAntes)
  })

  it('filho sem login: edita o filho e não cria nem altera nenhum usuário', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, ANA)
    const usuariosAntes = await prisma.usuario.findMany({ orderBy: { id: 'asc' } })

    const editada = await editarFilho(admin, ana.id, { ...ANA, nome: 'Ana Clara' })

    expect(editada).toMatchObject({ nome: 'Ana Clara', login: null })
    expect(await prisma.usuario.findMany({ orderBy: { id: 'asc' } })).toEqual(usuariosAntes)
  })
})

describe('autorização continua só do responsável', () => {
  it.each(['usuario', 'filho', '', 'visitante'])('o papel "%s" é negado (403) e nada muda', async (papel) => {
    const { filho } = await filhoComLogin()
    const alguem = { ...(await criarUsuario()), papel }
    const antes = await usuarioDe(filho.id)
    await expect(editarFilho(alguem, filho.id, { ...ANA, nome: 'Ana Clara' })).rejects.toMatchObject({ status: 403 })
    expect(await usuarioDe(filho.id)).toEqual(antes)
    expect((await prisma.filho.findUniqueOrThrow({ where: { id: filho.id } })).nome).toBe('Ana')
  })
})
