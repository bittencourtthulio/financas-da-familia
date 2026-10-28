/**
 * A prova de que apagar é de verdade (FT-07, PR-09): depois de excluir o
 * filho, o banco INTEIRO (toda tabela, lida direto do SQLite, sem passar pelo
 * Prisma) não tem o nome, o e-mail, o nascimento nem o que ele escreveu.
 * Antes da exclusão a mesma varredura ACHA tudo, para provar que ela enxerga.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { excluirFilho } from '@/servicos/privacidade'
import { cadastrarFilho, criarLoginDoFilho, desativarLoginDoFilho, editarFilho } from '@/servicos/filhos'
import { editarMovimento, registrarMovimento } from '@/servicos/mesada'
import { criarCategoria, criarLancamento } from '@/servicos/lancamentos'
import { reiniciarLimiteDeLogin } from '@/servicos/autenticacao'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(async () => {
  await limparBanco()
  reiniciarLimiteDeLogin()
})

/** Todas as tabelas do banco, linha a linha, em texto. */
async function bancoInteiro(): Promise<Record<string, string>> {
  const tabelas = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  )
  const dump: Record<string, string> = {}
  for (const { name } of tabelas) {
    const linhas = await prisma.$queryRawUnsafe<unknown[]>(`SELECT * FROM "${name}"`)
    dump[name] = JSON.stringify(linhas, (_c, v) => (typeof v === 'bigint' ? v.toString() : v))
  }
  return dump
}

const achadosEm = (dump: Record<string, string>, agulha: string) =>
  Object.entries(dump).filter(([, texto]) => texto.includes(agulha)).map(([tabela]) => tabela)

const AGULHAS = {
  nome: 'Marina Quintanilha Prado',
  nomeAntigo: 'Marininha Antiga',
  email: 'marina.prado@exemplo.local',
  nascimento: '2013-05-17',
  descricaoDoCredito: 'Presente da vovó Zuleide',
  descricaoDoGasto: 'Caderno de desenho da Marina',
}

describe('depois da exclusão não sobra nada do filho em tabela alguma', () => {
  it('a varredura acha o filho em várias tabelas antes e em nenhuma depois', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario({ papel: 'usuario' })
    const categoria = await criarCategoria(admin, { nome: 'Escola', tipo: 'despesa' })
    await criarLancamento(adulto, { tipo: 'despesa', valor: '45,00', data: '2026-10-05', categoriaId: categoria.id, descricao: 'Material da escola' })

    const marina = await cadastrarFilho(admin, { nome: AGULHAS.nomeAntigo, nascimento: AGULHAS.nascimento, valor: '40,00', periodicidade: 'semanal' })
    await criarLoginDoFilho(admin, marina.id, { email: AGULHAS.email, senha: 'senha-do-filho-1' })
    await editarFilho(admin, marina.id, { nome: AGULHAS.nome, nascimento: AGULHAS.nascimento, valor: '40,00', periodicidade: 'semanal' })
    const credito = await registrarMovimento(admin, marina.id, { tipo: 'credito', valor: '9.876,54', data: '2026-10-05', descricao: AGULHAS.descricaoDoCredito })
    await registrarMovimento(admin, marina.id, { tipo: 'gasto', valor: '3,21', data: '2026-10-06', descricao: AGULHAS.descricaoDoGasto })
    await editarMovimento(admin, credito.movimento.id, { tipo: 'credito', valor: '9.876,54', data: '2026-10-05', descricao: AGULHAS.descricaoDoCredito })
    await desativarLoginDoFilho(admin, marina.id)

    const outro = await cadastrarFilho(admin, { nome: 'Tomás Irmão', valor: '10,00', periodicidade: 'mensal' })
    await registrarMovimento(admin, outro.id, { tipo: 'credito', valor: '1,00', data: '2026-10-05', descricao: 'Moedinha do Tomás' })

    const antes = await bancoInteiro()
    // O login acompanha o cadastro (FT-09, PR-39): filho e login têm o nome novo.
    expect(achadosEm(antes, AGULHAS.nome).sort()).toEqual(['atividades', 'filhos', 'usuarios'])
    expect(achadosEm(antes, AGULHAS.nomeAntigo)).toEqual(['atividades'])
    expect(achadosEm(antes, AGULHAS.email)).toEqual(['usuarios'])
    expect(achadosEm(antes, AGULHAS.nascimento)).toEqual(['filhos'])
    expect(achadosEm(antes, AGULHAS.descricaoDoCredito)).toEqual(['movimentos_de_mesada'])
    expect(achadosEm(antes, AGULHAS.descricaoDoGasto)).toEqual(['movimentos_de_mesada'])

    await excluirFilho(admin, marina.id, { confirmacao: AGULHAS.nome })

    const depois = await bancoInteiro()
    for (const [rotulo, agulha] of Object.entries(AGULHAS)) {
      expect(achadosEm(depois, agulha), rotulo).toEqual([])
    }
    // Também as partes do nome, que uma busca por pedaço acharia.
    for (const parte of ['Marina', 'Quintanilha', 'Marininha', 'Zuleide', 'marina.prado', 'Caderno de desenho']) {
      expect(achadosEm(depois, parte), parte).toEqual([])
    }
    // O que não é do filho continua onde estava.
    expect(achadosEm(depois, 'Tomás Irmão').sort()).toEqual(['atividades', 'filhos'])
    expect(achadosEm(depois, 'Moedinha do Tomás')).toEqual(['movimentos_de_mesada'])
    expect(achadosEm(depois, 'Material da escola')).toEqual(['lancamentos'])
    expect(achadosEm(depois, 'filho removido')).toEqual(['atividades'])
  })
})
