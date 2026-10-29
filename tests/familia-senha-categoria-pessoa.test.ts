/**
 * Três regras da reestruturação da família e dos lançamentos:
 * - o responsável redefine a senha de quem é da família (adulto e filho);
 * - a categoria nasce e morre no campo do lançamento, sem tela própria;
 * - o lançamento diz quem da família gastou, e Nossas Finanças soma por
 *   categoria e por pessoa, com filtro por pessoa.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { senhaConfere } from '@/lib/senha'
import { redefinirSenha } from '@/servicos/usuarios'
import { cadastrarFilho, criarLoginDoFilho, redefinirSenhaDoFilho } from '@/servicos/filhos'
import {
  apagarCategoria,
  criarLancamento,
  editarLancamento,
  obterOuCriarCategoria,
} from '@/servicos/lancamentos'
import { financasDoMes, resumoDoMes } from '@/servicos/resumo'
import { criarAdmin, criarCategoriaNoBanco, criarUsuario, limparBanco, familiaPadrao } from './ajuda'

beforeEach(limparBanco)

const AGORA = new Date('2026-10-28T15:00:00Z')

describe('redefinirSenha: o responsável define a senha de quem é da família', () => {
  it('troca a senha do adulto, derruba as sessões dele e deixa rastro sem a senha', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario({ papel: 'usuario' })

    const antes = Date.now()
    await redefinirSenha(admin, adulto.id, { senha: 'senha-nova-123' })

    const depois = await prisma.usuario.findUniqueOrThrow({ where: { id: adulto.id } })
    expect(await senhaConfere('senha-nova-123', depois.senhaHash)).toBe(true)
    // O corte é o próximo segundo cheio: fica à frente do instante em que a troca começou.
    expect(depois.sessoesValidasDesde.getTime()).toBeGreaterThan(antes)
    const rastro = await prisma.atividade.findFirstOrThrow({ where: { acao: 'usuario.senha_redefinida' } })
    expect(JSON.stringify(rastro)).not.toContain('senha-nova-123')
    expect(rastro.entidadeId).toBe(adulto.id)
  })

  it('troca a senha do login do filho', async () => {
    const admin = await criarAdmin()
    const filho = await cadastrarFilho(admin, { nome: 'Ana', valor: '10,00', periodicidade: 'semanal' })
    await criarLoginDoFilho(admin, filho.id, { email: 'ana@exemplo.local', senha: 'senha-do-filho-1' })

    await redefinirSenhaDoFilho(admin, filho.id, { senha: 'senha-nova-123' })

    const login = await prisma.usuario.findUniqueOrThrow({ where: { email: 'ana@exemplo.local' } })
    expect(await senhaConfere('senha-nova-123', login.senhaHash)).toBe(true)
  })

  it('recusa senha curta, a própria senha, filho sem login e quem não é o responsável', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario({ papel: 'usuario' })
    const filho = await cadastrarFilho(admin, { nome: 'Bia', valor: '10,00', periodicidade: 'mensal' })

    await expect(redefinirSenha(admin, adulto.id, { senha: 'curta' })).rejects.toThrow(/ao menos 8/)
    await expect(redefinirSenha(admin, admin.id, { senha: 'senha-nova-123' })).rejects.toThrow(/Meu perfil/)
    await expect(redefinirSenhaDoFilho(admin, filho.id, { senha: 'senha-nova-123' })).rejects.toThrow(/não tem login/)
    await expect(redefinirSenha(adulto, admin.id, { senha: 'senha-nova-123' })).rejects.toThrow()
    const intacto = await prisma.usuario.findUniqueOrThrow({ where: { id: adulto.id } })
    expect(await senhaConfere(adulto.senha, intacto.senhaHash)).toBe(true)
  })
})

describe('categoria no campo do lançamento', () => {
  it('escrever um nome novo cadastra; o mesmo nome em outra caixa acha a que já existe', async () => {
    const admin = await criarAdmin()
    const criada = await obterOuCriarCategoria(admin, { nome: 'Pet', tipo: 'despesa' })
    const igual = await obterOuCriarCategoria(admin, { nome: 'pet', tipo: 'despesa' })
    expect(igual.id).toBe(criada.id)
    const deReceita = await obterOuCriarCategoria(admin, { nome: 'Pet', tipo: 'receita' })
    expect(deReceita.id).not.toBe(criada.id)
    expect(await prisma.categoria.count()).toBe(2)
  })

  it('apaga a categoria sem lançamento e recusa a que tem, dizendo quantos', async () => {
    const admin = await criarAdmin()
    const livre = await criarCategoriaNoBanco('despesa', 'Livre')
    const usada = await criarCategoriaNoBanco('despesa', 'Usada')
    await prisma.lancamento.create({ data: { familiaId: await familiaPadrao(), tipo: 'despesa', valorCentavos: 100, data: '2026-10-01', categoriaId: usada.id } })

    await apagarCategoria(admin, livre.id)
    expect(await prisma.categoria.findUnique({ where: { id: livre.id } })).toBeNull()
    await expect(apagarCategoria(admin, usada.id)).rejects.toThrow(/tem 1 lançamento/)
    expect(await prisma.categoria.findUnique({ where: { id: usada.id } })).not.toBeNull()
  })

  it('o filho não cria nem apaga categoria', async () => {
    const filho = await criarUsuario({ papel: 'filho' })
    const c = await criarCategoriaNoBanco('despesa', 'X')
    await expect(obterOuCriarCategoria(filho, { nome: 'Y', tipo: 'despesa' })).rejects.toThrow()
    await expect(apagarCategoria(filho, c.id)).rejects.toThrow()
  })
})

describe('quem gastou e Nossas Finanças', () => {
  async function cenario() {
    const admin = await criarAdmin()
    const adulto = await criarUsuario({ papel: 'usuario' })
    const filho = await cadastrarFilho(admin, { nome: 'Ana', valor: '10,00', periodicidade: 'semanal' })
    const mercado = await criarCategoriaNoBanco('despesa', 'Mercado')
    const lazer = await criarCategoriaNoBanco('despesa', 'Lazer')
    const dados = (categoriaId: string, valor: string, pessoaId: string | null) => ({
      tipo: 'despesa', valor, data: '2026-10-10', categoriaId, pessoaId,
    })
    await criarLancamento(admin, dados(mercado.id, '100,00', admin.id))
    await criarLancamento(admin, dados(lazer.id, '30,00', admin.id))
    await criarLancamento(admin, dados(lazer.id, '50,00', filho.id))
    await criarLancamento(admin, dados(mercado.id, '20,00', null))
    return { admin, adulto, filho, mercado, lazer }
  }

  it('o lançamento guarda a pessoa, aceita só gente da família e a edição troca', async () => {
    const { admin, filho, mercado } = await cenario()
    await expect(
      criarLancamento(admin, { tipo: 'despesa', valor: '1,00', data: '2026-10-10', categoriaId: mercado.id, pessoaId: 'de-fora' }),
    ).rejects.toThrow(/não é da família/)
    const l = await prisma.lancamento.findFirstOrThrow({ where: { valorCentavos: 2000 } })
    expect(l.pessoaId).toBeNull()
    const editado = await editarLancamento(admin, l.id, {
      tipo: 'despesa', valor: '20,00', data: '2026-10-10', categoriaId: mercado.id, pessoaId: filho.id,
    })
    expect(editado.pessoaId).toBe(filho.id)
  })

  it('o resumo do painel soma por pessoa, da maior para a menor, com "Sem pessoa"', async () => {
    const { admin, filho } = await cenario()
    const r = await resumoDoMes(admin, { mes: '2026-10' }, AGORA)
    expect(r.despesasPorPessoa.map((p) => [p.nome, p.totalCentavos])).toEqual([
      [admin.nome, 13000],
      ['Ana', 5000],
      ['Sem pessoa', 2000],
    ])
    expect(r.despesasPorPessoa[1]?.pessoaId).toBe(filho.id)
    expect(r.despesasPorPessoa.reduce((s, p) => s + p.totalCentavos, 0)).toBe(r.despesasCentavos)
  })

  it('Nossas Finanças: sem filtro soma a casa; com pessoa, mostra só as categorias dela', async () => {
    const { admin, filho } = await cenario()
    const casa = await financasDoMes(admin, { mes: '2026-10' }, AGORA)
    expect(casa.pessoa).toBeNull()
    expect(casa.despesasCentavos).toBe(20000)
    expect(casa.despesasPorCategoria.map((c) => [c.nome, c.totalCentavos])).toEqual([
      ['Mercado', 12000],
      ['Lazer', 8000],
    ])

    const dela = await financasDoMes(admin, { mes: '2026-10', pessoa: filho.id }, AGORA)
    expect(dela.pessoa).toEqual({ id: filho.id, nome: 'Ana' })
    expect(dela.despesasCentavos).toBe(5000)
    expect(dela.despesasPorCategoria.map((c) => c.nome)).toEqual(['Lazer'])
    expect(dela.despesasPorPessoa).toHaveLength(3)
  })

  it('pessoa que não é da família no filtro é ignorada, e o filho não vê o relatório', async () => {
    const { admin } = await cenario()
    const r = await financasDoMes(admin, { mes: '2026-10', pessoa: 'de-fora' }, AGORA)
    expect(r.pessoa).toBeNull()
    expect(r.despesasCentavos).toBe(20000)
    const filhoLogin = await criarUsuario({ papel: 'filho' })
    await expect(financasDoMes(filhoLogin, { mes: '2026-10' }, AGORA)).rejects.toThrow()
  })
})
