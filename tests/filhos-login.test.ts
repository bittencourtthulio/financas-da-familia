/**
 * O login do filho (PR-31) e o isolamento entre irmãos (PR-06): o login é um
 * usuário de papel `filho` ligado 1 para 1 ao registro; o filho entra com o
 * serviço real de autenticação, lê só a própria mesada e não alcança o irmão
 * por id, nem por serviço (IDOR). A resposta ao id de um irmão e ao de um id
 * que não existe é a mesma: nada vaza a existência.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  cadastrarFilho,
  criarLoginDoFilho,
  desativarLoginDoFilho,
  editarFilho,
  listarFilhos,
  minhaMesada,
  obterFilho,
} from '@/servicos/filhos'
import { entrar, reiniciarLimiteDeLogin, usuarioDaSessao, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { ErroDeAplicacao } from '@/lib/erros'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(async () => {
  await limparBanco()
  reiniciarLimiteDeLogin()
})

const ANA = { nome: 'Ana', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' }
const BIA = { nome: 'Bia', nascimento: '2012-07-01', valor: '120,00', periodicidade: 'mensal' }
const SENHA = 'senha-do-filho-123'

const erroDe = async (promessa: Promise<unknown>) => {
  const erro = await promessa.then(
    () => null,
    (e) => e,
  )
  expect(erro).toBeInstanceOf(ErroDeAplicacao)
  return erro as ErroDeAplicacao
}

/** Dois irmãos com login, o responsável e a forma autenticada de cada filho. */
async function irmaos() {
  const admin = await criarAdmin()
  const ana = await cadastrarFilho(admin, ANA)
  const bia = await cadastrarFilho(admin, BIA)
  await criarLoginDoFilho(admin, ana.id, { email: 'ana@exemplo.local', senha: SENHA })
  await criarLoginDoFilho(admin, bia.id, { email: 'bia@exemplo.local', senha: SENHA })
  const sessaoDe = async (email: string): Promise<UsuarioAutenticado> => {
    const { token } = await entrar({ email, senha: SENHA })
    return usuarioDaSessao(token)
  }
  return { admin, ana, bia, usuarioAna: await sessaoDe('ana@exemplo.local'), usuarioBia: await sessaoDe('bia@exemplo.local') }
}

describe('criarLoginDoFilho', () => {
  it('cria um usuário de papel filho com o nome do filho, ligado ao registro', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, ANA)
    const filho = await criarLoginDoFilho(admin, ana.id, { email: ' Ana@Exemplo.Local ', senha: SENHA })

    expect(filho.login).toEqual({ ativo: true, email: 'ana@exemplo.local' })
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { email: 'ana@exemplo.local' } })
    expect(usuario).toMatchObject({ nome: 'Ana', papel: 'filho', ativo: true })
    expect(usuario.senhaHash).not.toContain(SENHA)
    expect((await prisma.filho.findUniqueOrThrow({ where: { id: ana.id } })).usuarioId).toBe(usuario.id)
  })

  it('o filho entra com o serviço real de autenticação, com papel filho', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, ANA)
    await criarLoginDoFilho(admin, ana.id, { email: 'ana@exemplo.local', senha: SENHA })
    const { token, usuario } = await entrar({ email: 'ana@exemplo.local', senha: SENHA })
    expect(usuario.papel).toBe('filho')
    expect((await usuarioDaSessao(token)).papel).toBe('filho')
  })

  it('grava filho.login_criado com o nome do filho e sem e-mail, senha nem valor', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, ANA)
    await criarLoginDoFilho(admin, ana.id, { email: 'ana@exemplo.local', senha: SENHA })
    const rastro = await prisma.atividade.findFirstOrThrow({ where: { acao: 'filho.login_criado' } })
    expect(rastro).toMatchObject({ atorId: admin.id, entidade: 'filho', entidadeId: ana.id })
    expect(JSON.parse(rastro.detalhe ?? '{}')).toEqual({ alvoNome: 'Ana' })
    const linha = JSON.stringify(rastro)
    for (const proibido of ['ana@exemplo.local', SENHA, '5000', '50,00']) expect(linha).not.toContain(proibido)
  })

  it('e-mail já usado devolve 409 e não cria usuário, vínculo nem rastro', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, ANA)
    const outro = await criarUsuario({ email: 'ocupado@exemplo.local' })
    const antes = await prisma.usuario.count()
    const erro = await erroDe(criarLoginDoFilho(admin, ana.id, { email: outro.email, senha: SENHA }))
    expect(erro.status).toBe(409)
    expect(await prisma.usuario.count()).toBe(antes)
    expect((await prisma.filho.findUniqueOrThrow({ where: { id: ana.id } })).usuarioId).toBeNull()
    expect(await prisma.atividade.count({ where: { acao: 'filho.login_criado' } })).toBe(0)
  })

  it('segundo login para o mesmo filho devolve 409 e o primeiro continua', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, ANA)
    await criarLoginDoFilho(admin, ana.id, { email: 'ana@exemplo.local', senha: SENHA })
    const erro = await erroDe(criarLoginDoFilho(admin, ana.id, { email: 'ana2@exemplo.local', senha: SENHA }))
    expect(erro.status).toBe(409)
    expect(await prisma.usuario.findUnique({ where: { email: 'ana2@exemplo.local' } })).toBeNull()
    expect(await prisma.usuario.count({ where: { papel: 'filho' } })).toBe(1)
  })

  it.each([
    [{ email: 'sem-arroba', senha: SENHA }],
    [{ email: '', senha: SENHA }],
    [{ email: 'ana@exemplo.local', senha: 'curta' }],
    [{ email: 'ana@exemplo.local', senha: '' }],
    [{ email: 'ana@exemplo.local' }],
    [{}],
    [null],
  ])('entrada inválida %j devolve 422 e não grava', async (entrada) => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, ANA)
    const antes = await prisma.usuario.count()
    expect((await erroDe(criarLoginDoFilho(admin, ana.id, entrada))).status).toBe(422)
    expect(await prisma.usuario.count()).toBe(antes)
  })

  it('filho inexistente devolve 404', async () => {
    const admin = await criarAdmin()
    expect((await erroDe(criarLoginDoFilho(admin, 'nao-existe', { email: 'a@exemplo.local', senha: SENHA }))).status).toBe(404)
  })

  it('o login criado aparece na lista do responsável', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, ANA)
    await criarLoginDoFilho(admin, ana.id, { email: 'ana@exemplo.local', senha: SENHA })
    expect((await listarFilhos(admin))[0]?.login).toEqual({ ativo: true, email: 'ana@exemplo.local' })
  })
})

describe('desativarLoginDoFilho', () => {
  it('desativa a conta, mantém o vínculo, grava o rastro e o filho deixa de entrar', async () => {
    const { admin, ana } = await irmaos()
    const filho = await desativarLoginDoFilho(admin, ana.id)
    expect(filho.login).toEqual({ ativo: false, email: 'ana@exemplo.local' })
    expect((await prisma.usuario.findUniqueOrThrow({ where: { email: 'ana@exemplo.local' } })).ativo).toBe(false)
    expect((await prisma.filho.findUniqueOrThrow({ where: { id: ana.id } })).usuarioId).not.toBeNull()

    const rastro = await prisma.atividade.findFirstOrThrow({ where: { acao: 'filho.login_desativado' } })
    expect(rastro).toMatchObject({ atorId: admin.id, entidade: 'filho', entidadeId: ana.id })
    expect(JSON.parse(rastro.detalhe ?? '{}')).toEqual({ alvoNome: 'Ana' })
    expect(JSON.stringify(rastro)).not.toContain('ana@exemplo.local')

    expect((await erroDe(entrar({ email: 'ana@exemplo.local', senha: SENHA }))).status).toBe(401)
  })

  it('a sessão que o filho já tinha deixa de valer', async () => {
    const { admin, ana } = await irmaos()
    const { token } = await entrar({ email: 'ana@exemplo.local', senha: SENHA })
    await desativarLoginDoFilho(admin, ana.id)
    expect((await erroDe(usuarioDaSessao(token))).status).toBe(401)
  })

  it('desativar de novo não duplica o rastro', async () => {
    const { admin, ana } = await irmaos()
    await desativarLoginDoFilho(admin, ana.id)
    await desativarLoginDoFilho(admin, ana.id)
    expect(await prisma.atividade.count({ where: { acao: 'filho.login_desativado' } })).toBe(1)
  })

  it('só o login do filho certo é desativado: o do irmão continua', async () => {
    const { admin, ana } = await irmaos()
    await desativarLoginDoFilho(admin, ana.id)
    await expect(entrar({ email: 'bia@exemplo.local', senha: SENHA })).resolves.toBeTruthy()
  })

  it('filho sem login devolve 404 e filho inexistente também', async () => {
    const admin = await criarAdmin()
    const ana = await cadastrarFilho(admin, ANA)
    expect((await erroDe(desativarLoginDoFilho(admin, ana.id))).status).toBe(404)
    expect((await erroDe(desativarLoginDoFilho(admin, 'nao-existe'))).status).toBe(404)
    expect(await prisma.atividade.count({ where: { acao: 'filho.login_desativado' } })).toBe(0)
  })
})

describe('minhaMesada: o filho lê só o que é dele', () => {
  it('cada filho recebe o próprio registro: nome, valor combinado e periodicidade', async () => {
    const { usuarioAna, usuarioBia, ana, bia } = await irmaos()
    expect(await minhaMesada(usuarioAna)).toEqual({
      id: ana.id,
      nome: 'Ana',
      mesadaCentavos: 5000,
      periodicidade: 'semanal',
    })
    expect(await minhaMesada(usuarioBia)).toEqual({
      id: bia.id,
      nome: 'Bia',
      mesadaCentavos: 12000,
      periodicidade: 'mensal',
    })
  })

  it('a mesada de um filho não carrega nada do irmão nem dado pessoal além do necessário', async () => {
    const { usuarioAna } = await irmaos()
    const texto = JSON.stringify(await minhaMesada(usuarioAna))
    for (const alheio of ['Bia', '12000', '2012', 'bia@exemplo.local', '2015', 'ana@exemplo.local']) {
      expect(texto).not.toContain(alheio)
    }
  })

  it('o filho cujo login foi desligado do registro (usuário sem filho) recebe 404', async () => {
    const orfao = await criarUsuario({ papel: 'filho' })
    expect((await erroDe(minhaMesada(orfao))).status).toBe(404)
  })

  it.each(['admin', 'usuario', '', 'visitante'])('o papel "%s" recebe 403', async (papel) => {
    const alguem = { ...(await criarUsuario()), papel }
    expect((await erroDe(minhaMesada(alguem))).status).toBe(403)
  })
})

describe('IDOR: o filho A não alcança o filho B por id', () => {
  it('lê, edita e gerencia login do irmão por id: sempre 403 igual ao de um id inexistente', async () => {
    const { usuarioAna, bia } = await irmaos()
    const tentativas: Array<[string, (id: string) => Promise<unknown>]> = [
      ['obterFilho', (id) => obterFilho(usuarioAna, id)],
      ['editarFilho', (id) => editarFilho(usuarioAna, id, { ...BIA, nome: 'Invadida', valor: '999,00' })],
      ['criarLoginDoFilho', (id) => criarLoginDoFilho(usuarioAna, id, { email: 'x@exemplo.local', senha: SENHA })],
      ['desativarLoginDoFilho', (id) => desativarLoginDoFilho(usuarioAna, id)],
    ]
    for (const [nome, chamar] of tentativas) {
      const doIrmao = await erroDe(chamar(bia.id))
      const inexistente = await erroDe(chamar('id-que-nao-existe'))
      expect(doIrmao.status, nome).toBe(403)
      expect(doIrmao.status, nome).toBe(inexistente.status)
      expect(doIrmao.message, nome).toBe(inexistente.message)
      expect(doIrmao.codigo, nome).toBe(inexistente.codigo)
    }
  })

  it('a lista de filhos é negada ao filho e nada do irmão chega a ele', async () => {
    const { usuarioAna } = await irmaos()
    const erro = await erroDe(listarFilhos(usuarioAna))
    expect(erro.status).toBe(403)
    expect(JSON.stringify(erro)).not.toContain('Bia')
  })

  it('depois das tentativas, o registro do irmão está intacto e o login dele vale', async () => {
    const { usuarioAna, bia } = await irmaos()
    await obterFilho(usuarioAna, bia.id).catch(() => null)
    await editarFilho(usuarioAna, bia.id, { ...BIA, nome: 'Invadida' }).catch(() => null)
    await desativarLoginDoFilho(usuarioAna, bia.id).catch(() => null)
    const doBanco = await prisma.filho.findUniqueOrThrow({ where: { id: bia.id } })
    expect(doBanco).toMatchObject({ nome: 'Bia', mesadaCentavos: 12000 })
    await expect(entrar({ email: 'bia@exemplo.local', senha: SENHA })).resolves.toBeTruthy()
    expect(await prisma.atividade.count({ where: { acao: 'filho.alterado' } })).toBe(0)
  })
})
