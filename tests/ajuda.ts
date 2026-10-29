import { prisma } from '../src/lib/prisma.js'
import { hashDeSenha } from '../src/lib/senha.js'
import type { UsuarioAutenticado } from '../src/servicos/autenticacao.js'

export const SENHA_PADRAO = 'senha-de-teste-123'

let contador = 0

/**
 * A família que os testes usam quando não dizem qual: criada uma vez por teste
 * (o `limparBanco` esvazia tudo, inclusive ela). Para provar isolamento, crie
 * outra com `criarFamilia` e passe o `familiaId`.
 */
export async function familiaPadrao(): Promise<string> {
  const existente = await prisma.familia.findFirst({ where: { nome: 'Família de teste' } })
  if (existente) return existente.id
  return (await prisma.familia.create({ data: { nome: 'Família de teste' } })).id
}

let contadorDeFamilia = 0

/** Cria outra família, para os testes de isolamento entre famílias. */
export async function criarFamilia(nome?: string): Promise<string> {
  contadorDeFamilia += 1
  return (await prisma.familia.create({ data: { nome: nome ?? `Outra família ${contadorDeFamilia}` } })).id
}

/** Cria um usuário no banco e devolve a forma autenticada dele. */
export async function criarUsuario(opcoes?: {
  papel?: string
  ativo?: boolean
  senha?: string
  email?: string
  /** Sem ele, vale a família padrão do teste. */
  familiaId?: string
}): Promise<UsuarioAutenticado & { senha: string }> {
  contador += 1
  const senha = opcoes?.senha ?? SENHA_PADRAO
  const usuario = await prisma.usuario.create({
    data: {
      nome: `Usuário ${contador}`,
      email: opcoes?.email ?? `usuario${contador}@teste.local`,
      senhaHash: await hashDeSenha(senha),
      papel: opcoes?.papel ?? 'usuario',
      ativo: opcoes?.ativo ?? true,
      familiaId: opcoes?.familiaId ?? (await familiaPadrao()),
    },
  })
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    familiaId: usuario.familiaId,
    senha,
  }
}

export const criarAdmin = () => criarUsuario({ papel: 'admin' })

/** Esvazia a tabela entre testes, para que um não veja o que o outro criou. */
export async function limparBanco(): Promise<void> {
  await prisma.movimentoDeMesada.deleteMany()
  await prisma.filho.deleteMany()
  await prisma.lancamento.deleteMany()
  await prisma.recorrencia.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.atividade.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.familia.deleteMany()
}

let contadorDeCategoria = 0

/** Cria uma categoria direto no banco (sem passar pelo serviço nem pela trilha). */
export async function criarCategoriaNoBanco(
  tipo: 'receita' | 'despesa' = 'despesa',
  nome?: string,
  familiaId?: string,
) {
  contadorDeCategoria += 1
  return prisma.categoria.create({
    data: { tipo, nome: nome ?? `Categoria ${contadorDeCategoria}`, familiaId: familiaId ?? (await familiaPadrao()) },
  })
}
