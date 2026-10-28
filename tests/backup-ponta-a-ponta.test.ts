/**
 * O ciclo que a família precisa poder contar (PR-13): cria dados, faz o backup,
 * altera e apaga, restaura e confere que voltou TUDO, inclusive o login com a
 * senha original. Banco temporário com as migrations reais e cliente Prisma
 * próprio (D-12).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Database from 'better-sqlite3'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { gerarBackup } from '@/lib/backup'
import { restaurarBackup } from '@/lib/restauracao'
import { hashDeSenha, senhaConfere } from '@/lib/senha'
import { clienteDe, criarBancoTemporario, type BancoTemporario } from './banco-temporario'

const TABELAS = ['usuarios', 'atividades', 'categorias', 'lancamentos', 'filhos', 'movimentos_de_mesada']
const SENHA = 'senha-original-123'

let banco: BancoTemporario
let hashOriginal: string

function foto(arquivo: string): Record<string, unknown[]> {
  const db = new Database(arquivo, { readonly: true })
  const f: Record<string, unknown[]> = {}
  for (const t of TABELAS) f[t] = db.prepare(`SELECT * FROM ${t} ORDER BY id`).all()
  db.close()
  return f
}

beforeAll(async () => {
  banco = criarBancoTemporario()
  hashOriginal = await hashDeSenha(SENHA)
})
afterAll(() => banco.limpar())

describe('cria, faz backup, altera e apaga, restaura e confere', () => {
  it('os dados voltam exatamente como estavam, e o que mudou depois do backup some', async () => {
    // 1. Cria dados.
    const c1 = clienteDe(banco.arquivo)
    const admin = await c1.usuario.create({
      data: { nome: 'Responsável', email: 'resp@casa.local', senhaHash: hashOriginal, papel: 'admin' },
    })
    const categoria = await c1.categoria.create({ data: { nome: 'Mercado', tipo: 'despesa' } })
    for (const [valorCentavos, descricao] of [
      [1234, 'Feira'],
      [500000, 'Aluguel'],
      [99, 'Pão'],
    ] as const) {
      await c1.lancamento.create({
        data: { tipo: 'despesa', valorCentavos, data: '2026-10-20', descricao, categoriaId: categoria.id },
      })
    }
    const filho = await c1.filho.create({
      data: { nome: 'Ana', mesadaCentavos: 5000, periodicidade: 'semanal' },
    })
    await c1.movimentoDeMesada.createMany({
      data: [
        { filhoId: filho.id, tipo: 'credito', valorCentavos: 5000, data: '2026-10-01' },
        { filhoId: filho.id, tipo: 'gasto', valorCentavos: 1250, data: '2026-10-03' },
      ],
    })
    await c1.atividade.create({
      data: { atorId: admin.id, atorNome: 'Responsável', acao: 'usuario.criado', entidade: 'usuario', entidadeId: admin.id },
    })
    await c1.$disconnect()
    const antes = foto(banco.arquivo)
    expect(antes.lancamentos).toHaveLength(3)
    expect(antes.movimentos_de_mesada).toHaveLength(2)

    // 2. Backup.
    const { caminho } = gerarBackup({
      banco: banco.arquivo,
      pasta: path.join(banco.pasta, 'backups'),
      agora: new Date('2026-10-28T15:00:00Z'),
    })

    // O backup leva o hash da senha: por isso ele é guardado com cuidado e fica fora do git.
    expect(readFileSync(caminho).includes(Buffer.from(hashOriginal))).toBe(true)

    // 3. Altera e apaga.
    const c2 = clienteDe(banco.arquivo)
    await c2.lancamento.updateMany({ data: { valorCentavos: 1 } })
    await c2.lancamento.deleteMany({ where: { descricao: 'Aluguel' } })
    await c2.filho.delete({ where: { id: filho.id } }) // Cascade leva os movimentos
    await c2.usuario.update({ where: { id: admin.id }, data: { senhaHash: await hashDeSenha('outra-senha-456') } })
    await c2.categoria.create({ data: { nome: 'Criada depois do backup', tipo: 'receita' } })
    await c2.$disconnect()
    const depois = foto(banco.arquivo)
    expect(depois).not.toEqual(antes)
    expect(depois.filhos).toHaveLength(0)
    expect(depois.movimentos_de_mesada).toHaveLength(0)

    // 4. Restaura.
    const r = restaurarBackup({
      arquivo: caminho,
      banco: banco.arquivo,
      pasta: path.join(banco.pasta, 'backups'),
      agora: new Date('2026-10-28T15:10:00Z'),
    })

    // 5. Confere: cada tabela, linha a linha, igual ao instante do backup.
    expect(foto(banco.arquivo)).toEqual(antes)
    expect(foto(r.preservado as string)).toEqual(depois)

    const c3 = clienteDe(banco.arquivo)
    const lancamentos = await c3.lancamento.findMany({ orderBy: { valorCentavos: 'asc' } })
    expect(lancamentos.map((l) => l.valorCentavos)).toEqual([99, 1234, 500000])
    expect(lancamentos.every((l) => Number.isInteger(l.valorCentavos))).toBe(true)
    const movimentos = await c3.movimentoDeMesada.findMany({ where: { filhoId: filho.id } })
    const saldo = movimentos.reduce((s, m) => s + (m.tipo === 'credito' ? m.valorCentavos : -m.valorCentavos), 0)
    expect(saldo).toBe(3750)
    const quem = await c3.usuario.findUniqueOrThrow({ where: { email: 'resp@casa.local' } })
    expect(await senhaConfere(SENHA, quem.senhaHash)).toBe(true)
    expect(await senhaConfere('outra-senha-456', quem.senhaHash)).toBe(false)

    // O banco restaurado volta a aceitar escrita.
    await c3.categoria.create({ data: { nome: 'Depois da restauração', tipo: 'receita' } })
    expect(await c3.categoria.count()).toBe(2)
    await c3.$disconnect()
  })
})

describe('o arquivo de backup fica fora do git', () => {
  it('o .gitignore cobre backups/ e logs/', () => {
    for (const caminho of ['backups/backup-2026-10-28-120405.db', 'backups/antes-da-restauracao-x.db', 'logs/app-2026-10-28.log']) {
      expect(() => execFileSync('git', ['check-ignore', '-q', caminho], { stdio: 'pipe' }), caminho).not.toThrow()
    }
  })

  it('nenhum arquivo de backup está versionado', () => {
    const versionados = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n')
    expect(versionados.filter((f) => /^backups\/|\.db$/.test(f))).toEqual([])
  })
})

describe('o runbook no README', () => {
  const readme = readFileSync('README.md', 'utf8')

  it.each([
    ['backup', /npm run backup/],
    ['restaurar', /npm run restaurar -- /],
    ['parar o sistema antes de restaurar', /pare o sistema|parar o sistema/i],
    ['saúde', /\/api\/saude/],
    ['log de 90 dias', /90 dias/],
    ['limpar o log', /npm run log:limpar/],
    ['guardar com cuidado: leva hash de senha', /hash(es)? de senha/i],
    ['fora do git', /fora do git/i],
    ['o que ficou de fora', /agendamento/i],
  ])('explica %s', (_nome, padrao) => {
    expect(readme).toMatch(padrao)
  })
})
