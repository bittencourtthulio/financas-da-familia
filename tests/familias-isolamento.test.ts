/**
 * Isolamento entre famílias. Cada família é dona dos próprios dados, e quem é
 * de uma não lê, não altera nem apaga nada da outra, nem sabendo o id. É o
 * teste que sustenta o autocadastro: sem ele, qualquer pessoa que criasse uma
 * conta poderia ver o dinheiro de outra casa.
 *
 * Duas famílias completas (adulto, filho com login, categoria, lançamento,
 * recorrência e movimento de mesada); a família A tenta tudo contra os ids da B.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { entrar, reiniciarLimiteDeLogin, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { cadastrarFamilia, reiniciarLimiteDeCadastro } from '@/servicos/familias'
import { criar, desativar, editar, listar, redefinirSenha } from '@/servicos/usuarios'
import {
  cadastrarFilho,
  criarLoginDoFilho,
  desativarLoginDoFilho,
  editarFilho,
  listarFilhos,
  obterFilho,
  redefinirSenhaDoFilho,
} from '@/servicos/filhos'
import {
  alternarPago,
  apagarCategoria,
  apagarLancamento,
  criarLancamento,
  editarLancamento,
  listarCategorias,
  listarLancamentos,
  obterLancamento,
  obterOuCriarCategoria,
} from '@/servicos/lancamentos'
import { garantirRecorrencias } from '@/servicos/recorrencias'
import {
  apagarMovimento,
  editarMovimento,
  extratoDoFilho,
  obterMovimento,
  registrarMovimento,
  saldosDosFilhos,
} from '@/servicos/mesada'
import { financasDoMes, resumoDoMes } from '@/servicos/resumo'
import {
  adultoDaFamilia,
  avataresDosFilhos,
  definirAvatarDoFilho,
  definirAvatarDoUsuario,
  familiaDe,
} from '@/servicos/avatares'
import { exportarDadosDaFamilia, excluirFilho } from '@/servicos/privacidade'
import { listarAtividade } from '@/servicos/atividade'
import { criarAdmin, criarFamilia, criarUsuario, limparBanco } from './ajuda'

beforeEach(async () => {
  await limparBanco()
  reiniciarLimiteDeLogin()
  reiniciarLimiteDeCadastro()
})

const AGORA = new Date('2026-10-28T15:00:00Z')
const SENHA_DO_FILHO = 'senha-do-filho-1'

interface Casa {
  admin: UsuarioAutenticado & { senha: string }
  adulto: UsuarioAutenticado & { senha: string }
  filhoId: string
  filhoEmail: string
  categoriaId: string
  lancamentoId: string
  recorrenciaId: string
  movimentoId: string
  segredo: string
}

/** Uma família completa, com um texto marcador que não pode vazar para a outra. */
async function montar(rotulo: string): Promise<Casa> {
  const familiaId = await criarFamilia(`Família ${rotulo}`)
  const admin = await criarUsuario({ papel: 'admin', familiaId, email: `admin.${rotulo}@teste.local` })
  const adulto = await criarUsuario({ papel: 'usuario', familiaId, email: `adulto.${rotulo}@teste.local` })
  const segredo = `SEGREDO-${rotulo}`
  const filho = await cadastrarFilho(admin, { nome: `Filho ${segredo}`, valor: '10,00', periodicidade: 'semanal' })
  const filhoEmail = `filho.${rotulo}@teste.local`
  await criarLoginDoFilho(admin, filho.id, { email: filhoEmail, senha: SENHA_DO_FILHO })
  const categoria = await obterOuCriarCategoria(admin, { nome: `Categoria ${segredo}`, tipo: 'despesa' })
  const lancamento = await criarLancamento(admin, {
    tipo: 'despesa',
    valor: '100,00',
    data: '2026-10-10',
    categoriaId: categoria.id,
    descricao: `Lançamento ${segredo}`,
    pessoaId: adulto.id,
    repete: 'on',
  })
  const movimento = await registrarMovimento(admin, filho.id, {
    tipo: 'credito',
    valor: '5,00',
    data: '2026-10-05',
    descricao: `Mesada ${segredo}`,
  })
  return {
    admin,
    adulto,
    filhoId: filho.id,
    filhoEmail,
    categoriaId: categoria.id,
    lancamentoId: lancamento.id,
    recorrenciaId: lancamento.recorrenciaId as string,
    movimentoId: movimento.movimento.id,
    segredo,
  }
}

const recusa = async (promessa: Promise<unknown>) => {
  await expect(promessa).rejects.toMatchObject({ status: expect.any(Number) })
  const erro = (await promessa.catch((e: unknown) => e)) as { status: number }
  expect([403, 404, 409, 422]).toContain(erro.status)
}
const naoEncontrado = (promessa: Promise<unknown>) => expect(promessa).rejects.toMatchObject({ status: 404 })

describe('a família A não alcança a família B por id', () => {
  it('usuários: listar, editar, desativar e trocar senha', async () => {
    const A = await montar('a')
    const B = await montar('b')
    const nomes = (await listar(A.admin)).map((u) => u.email)
    expect(nomes).toContain(A.adulto.email)
    expect(nomes).not.toContain(B.adulto.email)
    expect(nomes).not.toContain(B.admin.email)

    await naoEncontrado(editar(A.admin, B.adulto.id, { nome: 'Invadido' }))
    await naoEncontrado(desativar(A.admin, B.adulto.id))
    await naoEncontrado(redefinirSenha(A.admin, B.adulto.id, { senha: 'senha-invasora-1' }))
    const intacto = await prisma.usuario.findUniqueOrThrow({ where: { id: B.adulto.id } })
    expect(intacto.nome).toBe(B.adulto.nome)
    expect(intacto.ativo).toBe(true)
    // A senha de B continua valendo; a "nova" não entra.
    await expect(entrar({ email: B.adulto.email, senha: 'senha-invasora-1' })).rejects.toMatchObject({ status: 401 })
    await expect(entrar({ email: B.adulto.email, senha: B.adulto.senha })).resolves.toBeDefined()
  })

  it('o responsável de A cria usuários só na própria família', async () => {
    const A = await montar('a')
    const B = await montar('b')
    const novo = await criar(A.admin, { nome: 'Novo', email: 'novo.a@teste.local', senha: 'senha-nova-123', papel: 'usuario' })
    const gravado = await prisma.usuario.findUniqueOrThrow({ where: { id: novo.id } })
    expect(gravado.familiaId).toBe(A.admin.familiaId)
    expect((await listar(B.admin)).map((u) => u.id)).not.toContain(novo.id)
  })

  it('família, avatares e filhos', async () => {
    const A = await montar('a')
    const B = await montar('b')
    const membros = (await familiaDe(A.admin)).map((m) => m.id)
    expect(membros).toContain(A.adulto.id)
    expect(membros).toContain(A.filhoId)
    expect(membros).not.toContain(B.adulto.id)
    expect(membros).not.toContain(B.filhoId)
    expect(Object.keys(await avataresDosFilhos(A.admin))).toEqual([A.filhoId])

    const avatar = { figura: 'pai', pele: 1, cabelo: 1, roupa: 'azul', oculos: false }
    await naoEncontrado(definirAvatarDoFilho(A.admin, B.filhoId, avatar))
    await naoEncontrado(definirAvatarDoUsuario(A.admin, B.adulto.id, avatar))
    await naoEncontrado(adultoDaFamilia(A.admin, B.adulto.id))

    expect((await listarFilhos(A.admin)).map((f) => f.id)).toEqual([A.filhoId])
    await naoEncontrado(obterFilho(A.admin, B.filhoId))
    await naoEncontrado(editarFilho(A.admin, B.filhoId, { nome: 'Invadido', valor: '1,00', periodicidade: 'mensal' }))
    await naoEncontrado(criarLoginDoFilho(A.admin, B.filhoId, { email: 'invasor@teste.local', senha: SENHA_DO_FILHO }))
    await naoEncontrado(desativarLoginDoFilho(A.admin, B.filhoId))
    await naoEncontrado(redefinirSenhaDoFilho(A.admin, B.filhoId, { senha: 'senha-invasora-1' }))
    const filhoB = await prisma.filho.findUniqueOrThrow({ where: { id: B.filhoId } })
    expect(filhoB.nome).toContain('SEGREDO-b')
    await expect(entrar({ email: B.filhoEmail, senha: SENHA_DO_FILHO })).resolves.toBeDefined()
  })

  it('lançamentos e categorias', async () => {
    const A = await montar('a')
    const B = await montar('b')
    expect((await listarCategorias(A.admin)).map((c) => c.id)).toEqual([A.categoriaId])
    const lista = await listarLancamentos(A.admin, { mes: '2026-10' }, AGORA)
    expect(lista.itens.map((l) => l.id)).toContain(A.lancamentoId)
    expect(lista.itens.map((l) => l.id)).not.toContain(B.lancamentoId)

    await naoEncontrado(obterLancamento(A.admin, B.lancamentoId))
    await naoEncontrado(
      editarLancamento(A.admin, B.lancamentoId, { tipo: 'despesa', valor: '1,00', data: '2026-10-10', categoriaId: A.categoriaId }),
    )
    await naoEncontrado(alternarPago(A.admin, B.lancamentoId))
    await naoEncontrado(apagarLancamento(A.admin, B.lancamentoId))
    await naoEncontrado(apagarLancamento(A.admin, B.lancamentoId, 'proximos'))
    await naoEncontrado(apagarCategoria(A.admin, B.categoriaId))
    expect(await prisma.lancamento.count({ where: { familiaId: B.admin.familiaId } })).toBeGreaterThan(0)

    // Lançar em A com a categoria ou a pessoa de B é recusado.
    await recusa(
      criarLancamento(A.admin, { tipo: 'despesa', valor: '1,00', data: '2026-10-10', categoriaId: B.categoriaId }),
    )
    await recusa(
      criarLancamento(A.admin, { tipo: 'despesa', valor: '1,00', data: '2026-10-10', categoriaId: A.categoriaId, pessoaId: B.adulto.id }),
    )
  })

  it('o mesmo nome de categoria pode existir nas duas famílias, sem se misturar', async () => {
    const A = await montar('a')
    const B = await montar('b')
    const deA = await obterOuCriarCategoria(A.admin, { nome: 'Mercado', tipo: 'despesa' })
    const deB = await obterOuCriarCategoria(B.admin, { nome: 'Mercado', tipo: 'despesa' })
    expect(deA.id).not.toBe(deB.id)
    expect((await listarCategorias(A.admin)).filter((c) => c.nome === 'Mercado')).toHaveLength(1)
  })

  it('recorrências: gerar os meses de A não toca em B', async () => {
    const A = await montar('a')
    const B = await montar('b')
    const antesB = await prisma.lancamento.count({ where: { recorrenciaId: B.recorrenciaId } })
    await garantirRecorrencias(A.admin.familiaId, '2027-03', AGORA)
    expect(await prisma.lancamento.count({ where: { recorrenciaId: B.recorrenciaId } })).toBe(antesB)
    expect(await prisma.lancamento.count({ where: { recorrenciaId: A.recorrenciaId } })).toBeGreaterThan(1)
  })

  it('mesada: movimentos, extrato e saldos', async () => {
    const A = await montar('a')
    const B = await montar('b')
    await naoEncontrado(registrarMovimento(A.admin, B.filhoId, { tipo: 'credito', valor: '1,00', data: '2026-10-05' }))
    await naoEncontrado(editarMovimento(A.admin, B.movimentoId, { tipo: 'credito', valor: '1,00', data: '2026-10-05' }))
    await naoEncontrado(apagarMovimento(A.admin, B.movimentoId))
    await naoEncontrado(obterMovimento(A.admin, B.movimentoId))
    await naoEncontrado(extratoDoFilho(A.admin, B.filhoId))
    expect(Object.keys(await saldosDosFilhos(A.admin))).toEqual([A.filhoId])
    expect(await prisma.movimentoDeMesada.count({ where: { familiaId: B.admin.familiaId } })).toBe(1)
  })

  it('resumo e Nossas Finanças somam só a própria família', async () => {
    const A = await montar('a')
    const B = await montar('b')
    await criarLancamento(B.admin, { tipo: 'despesa', valor: '900,00', data: '2026-10-12', categoriaId: B.categoriaId })
    const resumo = await resumoDoMes(A.admin, { mes: '2026-10' }, AGORA)
    expect(resumo.despesasCentavos).toBe(10000)
    expect(resumo.despesasPorPessoa.map((p) => p.pessoaId)).not.toContain(B.adulto.id)
    expect(resumo.despesasPorCategoria.map((c) => c.categoriaId)).toEqual([A.categoriaId])

    const financas = await financasDoMes(A.admin, { mes: '2026-10', pessoa: B.adulto.id }, AGORA)
    expect(financas.pessoa).toBeNull() // a pessoa de B não é da família de A: o filtro é ignorado
    expect(financas.despesasCentavos).toBe(10000)
    expect(financas.pessoas.map((p) => p.id)).not.toContain(B.adulto.id)
  })

  it('exportação, exclusão de filho e trilha ficam dentro da família', async () => {
    const A = await montar('a')
    const B = await montar('b')
    const exportado = (await exportarDadosDaFamilia(A.admin, AGORA)).conteudo
    expect(exportado).toContain('SEGREDO-a')
    expect(exportado).not.toContain('SEGREDO-b')
    expect(exportado).not.toContain(B.admin.email)
    expect(exportado).not.toContain(B.filhoId)

    await naoEncontrado(excluirFilho(A.admin, B.filhoId, { confirmacao: `Filho ${B.segredo}` }))
    expect(await prisma.filho.findUnique({ where: { id: B.filhoId } })).not.toBeNull()

    const trilha = JSON.stringify((await listarAtividade(A.admin)).itens)
    expect(trilha).not.toContain('SEGREDO-b')
    expect(trilha).not.toContain(B.admin.id)
  })

  it('o filho de A lê só a própria mesada', async () => {
    const A = await montar('a')
    await montar('b')
    const login = await prisma.usuario.findUniqueOrThrow({ where: { email: A.filhoEmail } })
    expect(login.familiaId).toBe(A.admin.familiaId)
  })
})

describe('autocadastro: cada cadastro cria uma família nova e separada', () => {
  const dados = (n: string) => ({
    familia: `Família ${n}`,
    nome: `Pessoa ${n}`,
    email: `${n}@cadastro.local`,
    senha: 'senha-segura-123',
    confirmacao: 'senha-segura-123',
  })

  it('cria a família, o responsável e a sessão; quem se cadastrou entra com a senha', async () => {
    const { usuario, token } = await cadastrarFamilia(dados('ana'))
    expect(token).toBeTruthy()
    expect(usuario.papel).toBe('admin')
    const familia = await prisma.familia.findUniqueOrThrow({ where: { id: usuario.familiaId } })
    expect(familia.nome).toBe('Família ana')
    const trilha = await prisma.atividade.findFirstOrThrow({ where: { acao: 'familia.criada' } })
    expect(trilha.familiaId).toBe(usuario.familiaId)
    expect(trilha.detalhe).not.toContain('senha')
    await expect(entrar({ email: 'ana@cadastro.local', senha: 'senha-segura-123' })).resolves.toBeDefined()
    const gravado = await prisma.usuario.findUniqueOrThrow({ where: { id: usuario.id } })
    expect(gravado.senhaHash).not.toContain('senha-segura-123')
  })

  it('duas famílias recém-criadas não enxergam uma à outra', async () => {
    const a = (await cadastrarFamilia(dados('ana'))).usuario
    const b = (await cadastrarFamilia(dados('bia'))).usuario
    expect(a.familiaId).not.toBe(b.familiaId)
    expect((await listar(a)).map((u) => u.email)).toEqual(['ana@cadastro.local'])
    expect((await listar(b)).map((u) => u.email)).toEqual(['bia@cadastro.local'])
    const categoria = await obterOuCriarCategoria(a, { nome: 'Luz', tipo: 'despesa' })
    await naoEncontrado(apagarCategoria(b, categoria.id))
    expect(await listarCategorias(b)).toEqual([])
  })

  it('recusa e-mail repetido (mesmo em outra caixa), senha curta, confirmação diferente e campos vazios', async () => {
    await cadastrarFamilia(dados('ana'))
    await expect(cadastrarFamilia({ ...dados('outra'), email: 'ANA@cadastro.local' })).rejects.toMatchObject({ status: 409 })
    await expect(cadastrarFamilia({ ...dados('x'), senha: 'curta', confirmacao: 'curta' })).rejects.toMatchObject({ status: 422 })
    await expect(cadastrarFamilia({ ...dados('y'), confirmacao: 'diferente-123' })).rejects.toMatchObject({ status: 422 })
    await expect(cadastrarFamilia({ ...dados('z'), familia: '   ' })).rejects.toMatchObject({ status: 422 })
    await expect(cadastrarFamilia({ ...dados('w'), email: 'não-é-email' })).rejects.toMatchObject({ status: 422 })
    expect(await prisma.familia.count()).toBe(1)
  })

  it('cadastro simultâneo com o mesmo e-mail cria uma só conta', async () => {
    const resultados = await Promise.allSettled([cadastrarFamilia(dados('dupla')), cadastrarFamilia(dados('dupla'))])
    expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(await prisma.usuario.count({ where: { email: 'dupla@cadastro.local' } })).toBe(1)
  })

  it('limita os cadastros por origem', async () => {
    for (let i = 0; i < 5; i += 1) await cadastrarFamilia(dados(`n${i}`), '203.0.113.7')
    await expect(cadastrarFamilia(dados('n5'), '203.0.113.7')).rejects.toMatchObject({ status: 429 })
    await expect(cadastrarFamilia(dados('n6'), '198.51.100.9')).resolves.toBeDefined()
  })
})

describe('papéis seguem valendo dentro da família', () => {
  it('um adulto de A continua sem poder administrar, e o admin de A não vira admin de B', async () => {
    const A = await montar('a')
    const B = await montar('b')
    await recusa(listar(A.adulto))
    const outraFamilia = await criarFamilia()
    const intruso = await criarAdmin()
    expect(intruso.familiaId).not.toBe(outraFamilia)
    expect((await listar(B.admin)).map((u) => u.id)).not.toContain(intruso.id)
  })
})
