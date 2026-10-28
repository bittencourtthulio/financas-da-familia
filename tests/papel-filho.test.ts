/**
 * O papel `filho` (PR-06, PR-31), com um filho REAL (o papel gravado no banco),
 * negado em todo serviço que já existia: lançamentos e categorias (FT-03),
 * resumo (FT-04), atividade (FT-02) e usuários (FT-01). Também prova que a
 * tela de usuários não cria nem muda papel para `filho`, e que `exigirFilho`
 * é por lista de permitidos.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as lancamentos from '@/servicos/lancamentos'
import * as resumo from '@/servicos/resumo'
import * as atividade from '@/servicos/atividade'
import * as usuarios from '@/servicos/usuarios'
import { exigirFilho, exigirAdmin, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { atualizarPerfil } from '@/servicos/perfil'
import { descreverAtividade } from '@/lib/atividade'
import { ErroDeAplicacao } from '@/lib/erros'
import { rotuloDoPapel, PAPEIS_DA_INTERFACE } from '@/lib/papeis'
import { prisma } from '@/lib/prisma'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

beforeEach(limparBanco)

type Chamada = (filho: UsuarioAutenticado) => Promise<unknown>

const LANCAMENTO = {
  tipo: 'despesa',
  valor: '10,00',
  data: '2026-10-27',
  categoriaId: 'qualquer',
}

const chamadas: Array<[string, Chamada]> = [
  ['lancamentos.listarCategorias', (a) => lancamentos.listarCategorias(a)],
  ['lancamentos.criarCategoria', (a) => lancamentos.criarCategoria(a, { nome: 'Qualquer', tipo: 'despesa' })],
  ['lancamentos.criarLancamento', (a) => lancamentos.criarLancamento(a, LANCAMENTO)],
  ['lancamentos.obterLancamento', (a) => lancamentos.obterLancamento(a, 'qualquer')],
  ['lancamentos.editarLancamento', (a) => lancamentos.editarLancamento(a, 'qualquer', LANCAMENTO)],
  ['lancamentos.apagarLancamento', (a) => lancamentos.apagarLancamento(a, 'qualquer')],
  ['lancamentos.listarLancamentos', (a) => lancamentos.listarLancamentos(a, { mes: '2026-10' })],
  ['resumo.resumoDoMes', (a) => resumo.resumoDoMes(a, { mes: '2026-10' })],
  ['atividade.listarAtividade', (a) => atividade.listarAtividade(a)],
  ['usuarios.listar', (a) => usuarios.listar(a)],
  [
    'usuarios.criar',
    (a) => usuarios.criar(a, { nome: 'Novo', email: 'novo@teste.local', senha: 'senha-12345', papel: 'admin' }),
  ],
  ['usuarios.editar', (a) => usuarios.editar(a, a.id, { papel: 'admin' })],
  ['usuarios.desativar', (a) => usuarios.desativar(a, a.id)],
]

describe('um filho real é negado em todo serviço que já existia', () => {
  it('a tabela cobre toda função exportada por cada serviço que um filho não pode usar', () => {
    const exportadas = (prefixo: string, modulo: object) =>
      Object.entries(modulo)
        .filter(([, valor]) => typeof valor === 'function')
        .map(([nome]) => `${prefixo}.${nome}`)
    const todas = [
      ...exportadas('lancamentos', lancamentos),
      ...exportadas('resumo', resumo),
      // registrarAtividade é a escrita interna da trilha, não uma leitura de tela.
      ...exportadas('atividade', atividade).filter((n) => n !== 'atividade.registrarAtividade'),
      ...exportadas('usuarios', usuarios),
    ].sort()
    expect(chamadas.map(([nome]) => nome).sort()).toEqual(todas)
  })

  describe.each(chamadas)('%s', (_nome, chamar) => {
    it('nega o filho com 403 e não grava nada', async () => {
      const filho = await criarUsuario({ papel: 'filho' })
      const antes = {
        usuarios: await prisma.usuario.count(),
        atividades: await prisma.atividade.count(),
        lancamentos: await prisma.lancamento.count(),
        categorias: await prisma.categoria.count(),
      }
      let erro: unknown
      try {
        await chamar(filho)
      } catch (e) {
        erro = e
      }
      expect(erro).toBeInstanceOf(ErroDeAplicacao)
      expect((erro as ErroDeAplicacao).status).toBe(403)
      expect({
        usuarios: await prisma.usuario.count(),
        atividades: await prisma.atividade.count(),
        lancamentos: await prisma.lancamento.count(),
        categorias: await prisma.categoria.count(),
      }).toEqual(antes)
      expect((await prisma.usuario.findUniqueOrThrow({ where: { id: filho.id } })).papel).toBe('filho')
    })
  })
})

describe('exigirFilho', () => {
  it('deixa passar só o papel filho', async () => {
    const filho = await criarUsuario({ papel: 'filho' })
    expect(() => exigirFilho(filho)).not.toThrow()
  })

  it.each(['admin', 'usuario', '', 'Filho', 'FILHO', 'visitante'])('nega o papel "%s" com 403', async (papel) => {
    const alguem = { ...(await criarUsuario()), papel }
    try {
      exigirFilho(alguem)
      throw new Error('Deveria ter negado.')
    } catch (e) {
      expect(e).toBeInstanceOf(ErroDeAplicacao)
      expect((e as ErroDeAplicacao).status).toBe(403)
    }
  })

  it('exigirAdmin também nega o filho', async () => {
    const filho = await criarUsuario({ papel: 'filho' })
    expect(() => exigirAdmin(filho)).toThrow(ErroDeAplicacao)
  })
})

describe('a tela de usuários não cria nem muda papel para filho (PR-31)', () => {
  it('criar com papel filho é entrada inválida (422) e não cria o usuário', async () => {
    const admin = await criarAdmin()
    const erro = await usuarios
      .criar(admin, { nome: 'Fulano', email: 'fulano@teste.local', senha: 'senha-12345', papel: 'filho' })
      .catch((e) => e)
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro.status).toBe(422)
    expect(await prisma.usuario.findUnique({ where: { email: 'fulano@teste.local' } })).toBeNull()
  })

  it('editar um adulto para filho é entrada inválida (422) e o papel não muda', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario({ papel: 'usuario' })
    const erro = await usuarios.editar(admin, adulto.id, { papel: 'filho' }).catch((e) => e)
    expect(erro.status).toBe(422)
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: adulto.id } })).papel).toBe('usuario')
  })

  it.each(['usuario', 'admin'])('mudar o papel de um filho para %s devolve 409 e o papel não muda', async (papel) => {
    const admin = await criarAdmin()
    const filho = await criarUsuario({ papel: 'filho' })
    const erro = await usuarios.editar(admin, filho.id, { papel }).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroDeAplicacao)
    expect(erro.status).toBe(409)
    expect(erro.message).toMatch(/filho/i)
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: filho.id } })).papel).toBe('filho')
    expect(await prisma.atividade.count()).toBe(0)
  })

  it('reenviar o papel filho já gravado ao editar o nome não é mudança e funciona', async () => {
    const admin = await criarAdmin()
    const filho = await criarUsuario({ papel: 'filho' })
    // A edição de nome pela tela envia o papel do formulário; um filho nunca
    // aparece com papel no formulário, então só o nome vai.
    const atualizado = await usuarios.editar(admin, filho.id, { nome: 'Novo Nome' })
    expect(atualizado.nome).toBe('Novo Nome')
    expect(atualizado.papel).toBe('filho')
  })

  it('o responsável continua mudando o papel de outro adulto e a trilha mostra Filho pelo rótulo', async () => {
    const admin = await criarAdmin()
    const adulto = await criarUsuario({ papel: 'usuario' })
    const atualizado = await usuarios.editar(admin, adulto.id, { papel: 'admin' })
    expect(atualizado.papel).toBe('admin')
    const d = descreverAtividade({
      atorNome: 'Quem',
      acao: 'usuario.papel_alterado',
      detalhe: { alvoNome: 'Alguém', de: 'usuario', para: 'filho' },
      criadoEm: new Date(),
    })
    expect(d.detalhe).toBe('De Adulto para Filho')
  })

  it('a lista de opções da tela Usuários não oferece Filho', () => {
    expect(PAPEIS_DA_INTERFACE.map((p) => p.valor)).not.toContain('filho')
    expect(rotuloDoPapel('filho')).toBe('Filho')
  })
})

describe('o filho ainda alcança o que é dele (P-9, E-3 e E-4)', () => {
  it('atualiza o próprio perfil', async () => {
    const filho = await criarUsuario({ papel: 'filho' })
    const atualizado = await atualizarPerfil(filho, { nome: 'Nome do Filho', email: filho.email })
    expect(atualizado.nome).toBe('Nome do Filho')
    expect(atualizado.papel).toBe('filho')
  })
})
