/**
 * O serviço de avatares e da família desenhada (FT-10): cada um escolhe o seu,
 * o filho com login escolhe no registro do filho, o responsável escolhe o de
 * qualquer um, o adulto não mexe no dos outros, e o filho nunca vê o irmão
 * nem no desenho (PR-31). Nada disso entra na trilha de atividade.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  adultoDaFamilia,
  avataresDosFilhos,
  definirAvatarDoFilho,
  definirAvatarDoUsuario,
  definirMeuAvatar,
  familiaDe,
  membrosDoPainel,
  meuAvatar,
} from '@/servicos/avatares'
import { cadastrarFilho, criarLoginDoFilho } from '@/servicos/filhos'
import { entrar } from '@/servicos/autenticacao'
import { ErroDeAplicacao } from '@/lib/erros'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

const AVATAR = { figura: 'menino', pele: 3, cabelo: 3, roupa: 'verde', oculos: false }
const PAI = { figura: 'pai', pele: 2, cabelo: 1, roupa: 'azul', oculos: true }

const status = async (promessa: Promise<unknown>) => {
  const erro = await promessa.then(() => null, (e) => e)
  expect(erro).toBeInstanceOf(ErroDeAplicacao)
  return (erro as ErroDeAplicacao).status
}

async function filhoComLogin(admin: Awaited<ReturnType<typeof criarAdmin>>, nome: string, email: string) {
  const filho = await cadastrarFilho(admin, { nome, valor: '10,00', periodicidade: 'mensal' })
  await criarLoginDoFilho(admin, filho.id, { email, senha: 'senha-do-filho-123' })
  const { usuario } = await entrar({ email, senha: 'senha-do-filho-123' })
  return { filho, sessao: usuario }
}

describe('cada um escolhe o seu', () => {
  it('o adulto grava o próprio avatar e o lê de volta; nada vai para a trilha', async () => {
    const adulto = await criarUsuario()
    expect(await meuAvatar(adulto)).toBeNull()
    await definirMeuAvatar(adulto, PAI)
    expect(await meuAvatar(adulto)).toEqual(PAI)
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('o filho com login grava no registro do filho, e o responsável vê o mesmo avatar na lista', async () => {
    const admin = await criarAdmin()
    const { filho, sessao } = await filhoComLogin(admin, 'Ana', 'ana@teste.local')
    await definirMeuAvatar(sessao, AVATAR)
    expect(await meuAvatar(sessao)).toEqual(AVATAR)
    expect((await avataresDosFilhos(admin))[filho.id]).toEqual(AVATAR)
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: sessao.id } })).avatar).toBeNull()
  })

  it('avatar inválido é entrada inválida (422) e não grava', async () => {
    const adulto = await criarUsuario()
    expect(await status(definirMeuAvatar(adulto, { ...PAI, figura: 'robo' }))).toBe(422)
    expect(await status(definirMeuAvatar(adulto, undefined))).toBe(422)
    expect(await meuAvatar(adulto)).toBeNull()
  })
})

describe('o responsável escolhe o dos outros', () => {
  it('define o avatar de um filho e de um adulto; id que não existe é 404', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario()
    const filho = await cadastrarFilho(admin, { nome: 'Bia', valor: '5,00', periodicidade: 'semanal' })
    await definirAvatarDoFilho(admin, filho.id, AVATAR)
    await definirAvatarDoUsuario(admin, adulto.id, PAI)
    expect((await avataresDosFilhos(admin))[filho.id]).toEqual(AVATAR)
    expect((await adultoDaFamilia(admin, adulto.id)).avatar).toEqual(PAI)
    expect(await status(definirAvatarDoFilho(admin, 'nao-existe', AVATAR))).toBe(404)
    expect(await status(definirAvatarDoUsuario(admin, 'nao-existe', PAI))).toBe(404)
  })

  it('o login do filho não é "adulto": não se edita por esse caminho', async () => {
    const admin = await criarAdmin()
    const { sessao } = await filhoComLogin(admin, 'Ana', 'ana@teste.local')
    expect(await status(definirAvatarDoUsuario(admin, sessao.id, PAI))).toBe(404)
    expect(await status(adultoDaFamilia(admin, sessao.id))).toBe(404)
  })

  it('o adulto e o filho são negados em tudo que é do responsável', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario()
    const { filho, sessao } = await filhoComLogin(admin, 'Ana', 'ana@teste.local')
    for (const quem of [adulto, sessao]) {
      expect(await status(definirAvatarDoFilho(quem, filho.id, AVATAR))).toBe(403)
      expect(await status(definirAvatarDoUsuario(quem, adulto.id, PAI))).toBe(403)
      expect(await status(avataresDosFilhos(quem))).toBe(403)
      expect(await status(adultoDaFamilia(quem, adulto.id))).toBe(403)
    }
  })
})

describe('a família desenhada', () => {
  it('lista adultos primeiro e depois os filhos, com papel e avatar; o filho não lista', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario()
    const { filho, sessao } = await filhoComLogin(admin, 'Ana', 'ana@teste.local')
    await definirAvatarDoFilho(admin, filho.id, AVATAR)
    const familia = await familiaDe(adulto)
    expect(familia.map((m) => [m.tipo, m.papel, m.avatar])).toEqual([
      ['adulto', 'admin', null],
      ['adulto', 'usuario', null],
      ['crianca', 'filho', AVATAR],
    ])
    expect(familia.find((m) => m.id === sessao.id)).toBeUndefined()
    expect(await status(familiaDe(sessao))).toBe(403)
  })

  it('no painel, o filho vê só a si mesmo (nunca o irmão); o adulto vê todo mundo ativo', async () => {
    const admin = await criarAdmin()
    const { sessao: ana } = await filhoComLogin(admin, 'Ana', 'ana@teste.local')
    const { filho: bia } = await filhoComLogin(admin, 'Bia', 'bia@teste.local')
    await definirAvatarDoFilho(admin, bia.id, AVATAR)
    const inativo = await criarUsuario({ ativo: false })
    expect(inativo.id).toBeTruthy()

    expect(await membrosDoPainel(ana)).toEqual([{ avatar: null, tipo: 'crianca' }])
    const painel = await membrosDoPainel(admin)
    expect(painel).toEqual([
      { avatar: null, tipo: 'adulto' },
      { avatar: null, tipo: 'crianca' },
      { avatar: AVATAR, tipo: 'crianca' },
    ])
  })
})
