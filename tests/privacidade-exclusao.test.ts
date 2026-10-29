/**
 * Apagar de verdade a conta de um filho (FT-07, PR-09, PR-35): numa transação,
 * o registro do filho, os movimentos de mesada (a chave estrangeira `Cascade`
 * da PR-33) e o usuário de login saem; a trilha é anonimizada, não apagada; o
 * login e o token do filho morrem; o irmão, os lançamentos e os adultos ficam.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { excluirFilho } from '@/servicos/privacidade'
import { cadastrarFilho, criarLoginDoFilho, editarFilho } from '@/servicos/filhos'
import { registrarMovimento } from '@/servicos/mesada'
import { criarCategoria, criarLancamento } from '@/servicos/lancamentos'
import {
  entrar,
  esquecerTentativasDeLogin,
  renovarSessao,
  reiniciarLimiteDeLogin,
  usuarioDaSessao,
} from '@/servicos/autenticacao'
import { MARCADOR_DO_FILHO_REMOVIDO } from '@/lib/privacidade'
import { ErroDeAplicacao } from '@/lib/erros'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco, familiaPadrao } from './ajuda'

beforeEach(async () => {
  await limparBanco()
  reiniciarLimiteDeLogin()
})

const SENHA = 'senha-do-filho-1'

async function cenario() {
  const admin = await criarAdmin()
  const adulto = await criarUsuario({ papel: 'usuario' })
  const categoria = await criarCategoria(admin, { nome: 'Mercado', tipo: 'despesa' })
  await criarLancamento(admin, { tipo: 'despesa', valor: '10,00', data: '2026-10-05', categoriaId: categoria.id })
  const ana = await cadastrarFilho(admin, { nome: 'Ana Nome Antigo', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' })
  const pedro = await cadastrarFilho(admin, { nome: 'Pedro Lima', valor: '120,00', periodicidade: 'mensal' })
  await criarLoginDoFilho(admin, ana.id, { email: 'ana@exemplo.local', senha: SENHA })
  await criarLoginDoFilho(admin, pedro.id, { email: 'pedro@exemplo.local', senha: SENHA })
  // O filho muda de nome: as linhas antigas da trilha ainda levam o nome antigo.
  await editarFilho(admin, ana.id, { nome: 'Ana Nome Novo', nascimento: '2015-03-20', valor: '50,00', periodicidade: 'semanal' })
  await registrarMovimento(admin, ana.id, { tipo: 'credito', valor: '100,00', data: '2026-10-05', descricao: 'Mesada da Ana' })
  const gasto = await registrarMovimento(admin, ana.id, { tipo: 'gasto', valor: '12,30', data: '2026-10-06', descricao: 'Sorvete da Ana' })
  await registrarMovimento(admin, pedro.id, { tipo: 'credito', valor: '30,00', data: '2026-10-05', descricao: 'Mesada do Pedro' })
  return { admin, adulto, categoria, ana, pedro, movimentoDaAna: gasto.movimento.id }
}

const CONFIRMA_ANA = { confirmacao: 'Ana Nome Novo' }

describe('apagar a conta de um filho', () => {
  it('remove o filho, os movimentos dele e o usuário de login', async () => {
    const { admin, ana } = await cenario()
    const login = await prisma.usuario.findUniqueOrThrow({ where: { email: 'ana@exemplo.local' } })
    expect(await prisma.movimentoDeMesada.count({ where: { filhoId: ana.id } })).toBe(2)

    await excluirFilho(admin, ana.id, CONFIRMA_ANA)

    expect(await prisma.filho.findUnique({ where: { id: ana.id } })).toBeNull()
    expect(await prisma.movimentoDeMesada.count({ where: { filhoId: ana.id } })).toBe(0)
    expect(await prisma.usuario.findUnique({ where: { id: login.id } })).toBeNull()
    expect(await prisma.usuario.findUnique({ where: { email: 'ana@exemplo.local' } })).toBeNull()
  })

  it('o histórico sai pela chave estrangeira Cascade: o serviço não apaga movimento linha a linha', () => {
    const fonte = readFileSync(path.join(process.cwd(), 'src/servicos/privacidade.ts'), 'utf8')
    expect(fonte).not.toMatch(/movimentoDeMesada\.(delete|deleteMany)/)
  })

  it('não toca no irmão, nos lançamentos, nas categorias, nos adultos nem no responsável', async () => {
    const { admin, adulto, ana, pedro } = await cenario()
    const antes = {
      pedro: await prisma.filho.findUniqueOrThrow({ where: { id: pedro.id } }),
      movimentosDoPedro: await prisma.movimentoDeMesada.findMany({ where: { filhoId: pedro.id } }),
      loginDoPedro: await prisma.usuario.findUniqueOrThrow({ where: { email: 'pedro@exemplo.local' } }),
      lancamentos: await prisma.lancamento.findMany(),
      categorias: await prisma.categoria.findMany(),
      rastroDoPedro: await prisma.atividade.findMany({ where: { detalhe: { contains: 'Pedro Lima' } } }),
    }

    await excluirFilho(admin, ana.id, CONFIRMA_ANA)

    expect(await prisma.filho.findUniqueOrThrow({ where: { id: pedro.id } })).toEqual(antes.pedro)
    expect(await prisma.movimentoDeMesada.findMany({ where: { filhoId: pedro.id } })).toEqual(antes.movimentosDoPedro)
    expect(await prisma.usuario.findUniqueOrThrow({ where: { email: 'pedro@exemplo.local' } })).toEqual(antes.loginDoPedro)
    expect(await prisma.lancamento.findMany()).toEqual(antes.lancamentos)
    expect(await prisma.categoria.findMany()).toEqual(antes.categorias)
    expect(await prisma.atividade.findMany({ where: { detalhe: { contains: 'Pedro Lima' } } })).toEqual(antes.rastroDoPedro)
    expect(await prisma.usuario.findUnique({ where: { id: adulto.id } })).not.toBeNull()
    expect(await prisma.usuario.findUnique({ where: { id: admin.id } })).not.toBeNull()
    // O irmão continua entrando.
    expect((await entrar({ email: 'pedro@exemplo.local', senha: SENHA })).usuario.papel).toBe('filho')
  })

  it('apaga o filho que nunca teve login', async () => {
    const admin = await criarAdmin()
    const filho = await cadastrarFilho(admin, { nome: 'Sem Login', valor: '1,00', periodicidade: 'mensal' })
    await registrarMovimento(admin, filho.id, { tipo: 'credito', valor: '5,00', data: '2026-10-05' })
    const usuarios = await prisma.usuario.count()
    const r = await excluirFilho(admin, filho.id, { confirmacao: 'Sem Login' })
    expect(r.tinhaLogin).toBe(false)
    expect(await prisma.filho.count()).toBe(0)
    expect(await prisma.movimentoDeMesada.count()).toBe(0)
    expect(await prisma.usuario.count()).toBe(usuarios)
  })
})

describe('confirmação digitando o nome (PR-35)', () => {
  it.each([
    ['nome de outro filho', 'Pedro Lima'],
    ['o nome antigo', 'Ana Nome Antigo'],
    ['caixa diferente', 'ana nome novo'],
    ['vazio', ''],
    ['só espaços', '   '],
    ['nome com texto a mais', 'Ana Nome Novo e mais'],
  ])('%s: devolve 422 e não apaga nada', async (_caso, digitado) => {
    const { admin, ana } = await cenario()
    const antes = { filhos: await prisma.filho.count(), usuarios: await prisma.usuario.count(), movimentos: await prisma.movimentoDeMesada.count(), atividades: await prisma.atividade.count() }
    await expect(excluirFilho(admin, ana.id, { confirmacao: digitado })).rejects.toMatchObject({ status: 422 })
    expect({ filhos: await prisma.filho.count(), usuarios: await prisma.usuario.count(), movimentos: await prisma.movimentoDeMesada.count(), atividades: await prisma.atividade.count() }).toEqual(antes)
  })

  it.each([undefined, null, {}, 'Ana Nome Novo', { confirmacao: 42 }])('entrada %j inválida devolve 422', async (entrada) => {
    const { admin, ana } = await cenario()
    await expect(excluirFilho(admin, ana.id, entrada)).rejects.toMatchObject({ status: 422 })
    expect(await prisma.filho.findUnique({ where: { id: ana.id } })).not.toBeNull()
  })

  it('aceita espaços nas pontas', async () => {
    const { admin, ana } = await cenario()
    await excluirFilho(admin, ana.id, { confirmacao: '  Ana Nome Novo ' })
    expect(await prisma.filho.findUnique({ where: { id: ana.id } })).toBeNull()
  })

  it('id inexistente devolve 404, e apagar duas vezes também', async () => {
    const { admin, ana } = await cenario()
    await expect(excluirFilho(admin, 'nao-existe', CONFIRMA_ANA)).rejects.toMatchObject({ status: 404 })
    await excluirFilho(admin, ana.id, CONFIRMA_ANA)
    await expect(excluirFilho(admin, ana.id, CONFIRMA_ANA)).rejects.toMatchObject({ status: 404 })
  })
})

describe('a trilha é anonimizada, não apagada (PR-10, PR-25, PR-35)', () => {
  it('as linhas do filho trocam o nome, inclusive o nome antigo, e as de mesada também', async () => {
    const { admin, ana, movimentoDaAna } = await cenario()
    const doFilho = (a: { entidade: string; entidadeId: string; detalhe: string | null }) =>
      (a.entidade === 'filho' && a.entidadeId === ana.id) || (a.detalhe ?? '').includes(`"filhoId":"${ana.id}"`)
    const antes = (await prisma.atividade.findMany({ orderBy: { id: 'asc' } })).filter(doFilho)
    // cadastro, edição, login, 2 registros de mesada (a edição do nome também é do filho)
    expect(antes.map((a) => a.acao).sort()).toEqual(
      ['filho.alterado', 'filho.cadastrado', 'filho.login_criado', 'mesada.registrada', 'mesada.registrada'],
    )
    expect(antes.some((a) => (a.detalhe ?? '').includes('Ana Nome Antigo'))).toBe(true)
    expect(movimentoDaAna).toBeTruthy()

    await excluirFilho(admin, ana.id, CONFIRMA_ANA)

    const depois = (await prisma.atividade.findMany({ orderBy: { id: 'asc' } })).filter(doFilho).filter((a) => a.acao !== 'filho.excluido')
    expect(depois).toHaveLength(antes.length)
    for (const linha of depois) {
      const detalhe = JSON.parse(linha.detalhe as string)
      expect(detalhe.alvoNome, linha.acao).toBe(MARCADOR_DO_FILHO_REMOVIDO)
      expect(linha.detalhe).not.toMatch(/Ana/)
    }
    // O fato de a ação ter ocorrido fica: ator, ação, quando e o resto do detalhe.
    const alterada = depois.find((a) => a.acao === 'filho.alterado')
    expect(JSON.parse(alterada?.detalhe as string)).toEqual({ alvoNome: MARCADOR_DO_FILHO_REMOVIDO, campos: 'nome,login' })
    const original = antes.find((a) => a.acao === 'filho.alterado')
    expect(alterada).toMatchObject({ atorId: original?.atorId, atorNome: original?.atorNome, criadoEm: original?.criadoEm })
    const mesada = depois.find((a) => a.acao === 'mesada.registrada')
    expect(JSON.parse(mesada?.detalhe as string)).toMatchObject({ filhoId: ana.id, tipo: expect.any(String) })
  })

  it('grava filho.excluido com o ator e o id opaco, sem nome nem dado financeiro', async () => {
    const { admin, ana } = await cenario()
    const total = await prisma.atividade.count()
    await excluirFilho(admin, ana.id, CONFIRMA_ANA)
    expect(await prisma.atividade.count()).toBe(total + 1)
    const rastro = await prisma.atividade.findFirstOrThrow({ where: { acao: 'filho.excluido' } })
    expect(rastro).toMatchObject({ atorId: admin.id, atorNome: admin.nome, entidade: 'filho', entidadeId: ana.id })
    expect(JSON.parse(rastro.detalhe as string)).toEqual({ tinhaLogin: true, linhasAnonimizadas: 5 })
    for (const texto of Object.values(rastro)) expect(String(texto)).not.toMatch(/Ana|ana@|2015-03-20|Sorvete|Mesada/)
  })

  it('as linhas do usuário de login (como entidade ou ator) também perdem o nome', async () => {
    const { admin, ana } = await cenario()
    const login = await prisma.usuario.findUniqueOrThrow({ where: { email: 'ana@exemplo.local' } })
    await prisma.atividade.create({
      data: { familiaId: await familiaPadrao(), atorId: admin.id, atorNome: admin.nome, acao: 'usuario.desativado', entidade: 'usuario', entidadeId: login.id, detalhe: JSON.stringify({ alvoNome: 'Ana Nome Novo' }) },
    })
    await prisma.atividade.create({
      data: { familiaId: await familiaPadrao(), atorId: login.id, atorNome: 'Ana Nome Novo', acao: 'usuario.criado', entidade: 'usuario', entidadeId: 'outro', detalhe: JSON.stringify({ alvoNome: 'Outro' }) },
    })
    await excluirFilho(admin, ana.id, CONFIRMA_ANA)
    const todas = await prisma.atividade.findMany()
    expect(JSON.stringify(todas)).not.toContain('Ana Nome')
    const doAtor = todas.find((a) => a.acao === 'usuario.criado')
    expect(doAtor?.atorNome).toBe(MARCADOR_DO_FILHO_REMOVIDO)
    expect(JSON.parse(doAtor?.detalhe as string)).toEqual({ alvoNome: 'Outro' })
  })

  it('uma falha no meio desfaz tudo: nada é apagado nem anonimizado', async () => {
    const { admin, ana } = await cenario()
    const antes = {
      filhos: await prisma.filho.count(),
      usuarios: await prisma.usuario.count(),
      movimentos: await prisma.movimentoDeMesada.count(),
      trilha: JSON.stringify(await prisma.atividade.findMany({ orderBy: { id: 'asc' } })),
    }
    // O rastro final exige um autor com id: sem ele a transação inteira volta.
    await expect(excluirFilho({ ...admin, id: '' }, ana.id, CONFIRMA_ANA)).rejects.toBeInstanceOf(ErroDeAplicacao)
    expect(await prisma.filho.count()).toBe(antes.filhos)
    expect(await prisma.usuario.count()).toBe(antes.usuarios)
    expect(await prisma.movimentoDeMesada.count()).toBe(antes.movimentos)
    expect(JSON.stringify(await prisma.atividade.findMany({ orderBy: { id: 'asc' } }))).toBe(antes.trilha)
    expect(await prisma.usuario.findUnique({ where: { email: 'ana@exemplo.local' } })).not.toBeNull()
  })
})

describe('o login e a sessão do filho morrem', () => {
  it('o token emitido antes deixa de valer, nem renova', async () => {
    const { admin, ana } = await cenario()
    const { token } = await entrar({ email: 'ana@exemplo.local', senha: SENHA })
    expect((await usuarioDaSessao(token)).papel).toBe('filho')

    await excluirFilho(admin, ana.id, CONFIRMA_ANA)

    await expect(usuarioDaSessao(token)).rejects.toMatchObject({ status: 401 })
    await expect(renovarSessao(token)).rejects.toMatchObject({ status: 401 })
  })

  it('o login falha com a mesma mensagem de e-mail desconhecido', async () => {
    const { admin, ana } = await cenario()
    await excluirFilho(admin, ana.id, CONFIRMA_ANA)
    await expect(entrar({ email: 'ana@exemplo.local', senha: SENHA })).rejects.toMatchObject({
      status: 401,
      message: 'E-mail ou senha incorretos.',
    })
  })

  it('o estado de tentativas de login do e-mail é esquecido', async () => {
    const { admin, ana } = await cenario()
    for (let i = 0; i < 5; i += 1) {
      await expect(entrar({ email: 'ana@exemplo.local', senha: 'errada' })).rejects.toMatchObject({ status: 401 })
    }
    // Bloqueado: nem a senha certa entra.
    await expect(entrar({ email: 'ana@exemplo.local', senha: SENHA })).rejects.toMatchObject({ status: 429 })

    await excluirFilho(admin, ana.id, CONFIRMA_ANA)

    // Outra pessoa passa a usar o e-mail e entra de primeira, sem herdar o bloqueio.
    await criarUsuario({ email: 'ana@exemplo.local', senha: SENHA })
    expect((await entrar({ email: 'ana@exemplo.local', senha: SENHA })).usuario.email).toBe('ana@exemplo.local')
  })

  it('esquecerTentativasDeLogin normaliza o e-mail como o login faz', async () => {
    await criarUsuario({ email: 'caixa@exemplo.local', senha: SENHA })
    for (let i = 0; i < 5; i += 1) {
      await expect(entrar({ email: 'caixa@exemplo.local', senha: 'errada' })).rejects.toMatchObject({ status: 401 })
    }
    await expect(entrar({ email: 'caixa@exemplo.local', senha: SENHA })).rejects.toMatchObject({ status: 429 })
    esquecerTentativasDeLogin('  CAIXA@Exemplo.local ')
    expect((await entrar({ email: 'caixa@exemplo.local', senha: SENHA })).usuario.email).toBe('caixa@exemplo.local')
  })
})

describe('o arquivo exportado antes e depois', () => {
  it('antes tem o filho e o dinheiro dele; depois não tem', async () => {
    const { exportarDadosDaFamilia } = await import('@/servicos/privacidade')
    const { admin, ana } = await cenario()
    const antes = (await exportarDadosDaFamilia(admin)).conteudo
    expect(antes).toContain('Ana Nome Novo')
    expect(antes).toContain('Sorvete da Ana')
    await excluirFilho(admin, ana.id, CONFIRMA_ANA)
    const depois = (await exportarDadosDaFamilia(admin)).conteudo
    for (const sobra of ['Ana Nome', 'ana@exemplo.local', 'Sorvete da Ana', 'Mesada da Ana', '2015-03-20']) {
      expect(depois, sobra).not.toContain(sobra)
    }
    expect(depois).toContain('Pedro Lima')
    expect(depois).toContain(MARCADOR_DO_FILHO_REMOVIDO)
  })
})
