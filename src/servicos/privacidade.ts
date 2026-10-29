import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { entradaInvalida, naoEncontrado } from '@/lib/erros'
import {
  esquecerTentativasDeLogin,
  exigirAdmin,
  type UsuarioAutenticado,
} from '@/servicos/autenticacao'
import { registrarAtividade } from '@/servicos/atividade'
import { saldosDosFilhos } from '@/servicos/mesada'
import {
  MARCADOR_DO_FILHO_REMOVIDO,
  nomeDoArquivoDeExportacao,
  VERSAO_DO_FORMATO,
} from '@/lib/privacidade'
import type { PrismaClient } from '@/gerado/prisma/client'
import { avatarDoJson } from '@/lib/avatar'

/**
 * Privacidade dos dados da família (FT-07, PR-09). Só o responsável (`admin`)
 * exporta os dados e apaga a conta de um filho; a verificação é a primeira
 * linha de cada função, no servidor (PR-06).
 * A exportação (PR-34) é um documento JSON versionado, com todo valor em
 * centavos inteiros (PR-02) e toda data em ISO. Os campos de cada tabela são
 * listados um a um: o hash de senha, o corte de sessão e qualquer dado interno
 * nunca são lidos, então não há como irem para o arquivo por descuido.
 */

export interface ArquivoExportado {
  nomeDoArquivo: string
  /** O JSON, em UTF-8, pronto para o download. */
  conteudo: string
}

const iso = (d: Date): string => d.toISOString()

function lerDetalhe(texto: string | null): unknown {
  if (!texto) return {}
  try {
    return JSON.parse(texto) as unknown
  } catch {
    return {}
  }
}

/**
 * Monta o arquivo com todos os dados da família e grava `familia.exportada` na
 * trilha (PR-10), sem conteúdo. O rastro é gravado antes da entrega: se ele
 * falha, não há arquivo. O arquivo não leva o rastro da própria exportação.
 */
export async function exportarDadosDaFamilia(
  autor: UsuarioAutenticado,
  agora: Date = new Date(),
): Promise<ArquivoExportado> {
  exigirAdmin(autor)

  // Uma leitura só, para o arquivo mostrar um instante coerente do banco.
  // Só os dados da família de quem exporta: nenhuma leitura atravessa para outra.
  const daFamilia = { familiaId: autor.familiaId }
  const [usuarios, categorias, lancamentos, recorrencias, filhos, movimentos, atividades] = await prisma.$transaction([
    prisma.usuario.findMany({
      where: daFamilia,
      select: { id: true, nome: true, email: true, papel: true, ativo: true, criadoEm: true, avatar: true },
      orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }],
    }),
    prisma.categoria.findMany({ where: daFamilia, orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] }),
    prisma.lancamento.findMany({ where: daFamilia, orderBy: [{ data: 'asc' }, { criadoEm: 'asc' }, { id: 'asc' }] }),
    prisma.recorrencia.findMany({ where: daFamilia, orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] }),
    prisma.filho.findMany({ where: daFamilia, orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] }),
    prisma.movimentoDeMesada.findMany({ where: daFamilia, orderBy: [{ data: 'asc' }, { criadoEm: 'asc' }, { id: 'asc' }] }),
    prisma.atividade.findMany({ where: daFamilia, orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] }),
  ])
  const saldos = await saldosDosFilhos(autor)

  const documento = {
    sistema: 'financas-da-familia',
    versao_do_formato: VERSAO_DO_FORMATO,
    gerado_em: iso(agora),
    moeda: 'BRL',
    usuarios: usuarios.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      papel: u.papel,
      ativo: u.ativo, avatar: avatarDoJson(u.avatar),
      criado_em: iso(u.criadoEm),
    })),
    categorias: categorias.map((c) => ({
      id: c.id,
      nome: c.nome,
      tipo: c.tipo,
      criado_em: iso(c.criadoEm),
    })),
    lancamentos: lancamentos.map((l) => ({
      id: l.id,
      tipo: l.tipo,
      valor_centavos: l.valorCentavos,
      data: l.data,
      descricao: l.descricao,
      categoria_id: l.categoriaId,
      pessoa_id: l.pessoaId,
      pago: l.pago,
      recorrencia_id: l.recorrenciaId,
      criado_em: iso(l.criadoEm),
      atualizado_em: iso(l.atualizadoEm),
    })),
    recorrencias: recorrencias.map((r) => ({
      id: r.id,
      tipo: r.tipo,
      valor_centavos: r.valorCentavos,
      dia_do_mes: r.diaDoMes,
      descricao: r.descricao,
      categoria_id: r.categoriaId,
      pessoa_id: r.pessoaId,
      inicio: r.inicio,
      fim: r.fim,
      gerado_ate: r.geradoAte,
      criado_em: iso(r.criadoEm),
    })),
    filhos: filhos.map((f) => ({
      id: f.id,
      nome: f.nome,
      nascimento: f.nascimento,
      mesada_combinada_centavos: f.mesadaCentavos,
      periodicidade: f.periodicidade, avatar: avatarDoJson(f.avatar),
      usuario_id: f.usuarioId,
      saldo_centavos: saldos[f.id] ?? 0,
      criado_em: iso(f.criadoEm),
      atualizado_em: iso(f.atualizadoEm),
    })),
    movimentos_de_mesada: movimentos.map((m) => ({
      id: m.id,
      filho_id: m.filhoId,
      tipo: m.tipo,
      valor_centavos: m.valorCentavos,
      data: m.data,
      descricao: m.descricao,
      criado_em: iso(m.criadoEm),
      atualizado_em: iso(m.atualizadoEm),
    })),
    atividade: atividades.map((a) => ({
      id: a.id,
      ator_id: a.atorId,
      ator_nome: a.atorNome,
      acao: a.acao,
      entidade: a.entidade,
      entidade_id: a.entidadeId,
      detalhe: lerDetalhe(a.detalhe),
      criado_em: iso(a.criadoEm),
    })),
  }

  // Sem conteúdo: o rastro leva só a versão do formato (PR-25).
  await registrarAtividade({
    ator: autor,
    acao: 'familia.exportada',
    entidade: 'exportacao',
    entidadeId: randomUUID(),
    detalhe: { versaoDoFormato: VERSAO_DO_FORMATO },
  })

  return {
    nomeDoArquivo: nomeDoArquivoDeExportacao(agora),
    conteudo: JSON.stringify(documento, null, 2),
  }
}

const entradaDeExclusao = z.object(
  {
    confirmacao: z
      .string({ message: 'Digite o nome do filho para confirmar.' })
      .trim(),
  },
  { message: 'Digite o nome do filho para confirmar.' },
)

export interface ResultadoDaExclusao {
  /** O id opaco do filho apagado: é o que a trilha guarda. */
  filhoId: string
  tinhaLogin: boolean
  linhasAnonimizadas: number
}

type ClienteDaTrilha = Pick<PrismaClient, 'atividade'>

/**
 * Troca o nome do filho por um marcador neutro em toda linha da trilha que o
 * cita (PR-35). As linhas se acham pelo id, nunca pelo nome: o filho pode ter
 * mudado de nome e as linhas antigas levam o nome antigo. São as do próprio
 * filho (entidade `filho`), as de mesada (o `filhoId` está no detalhe) e as do
 * usuário de login, como alvo ou como autor. O resto do registro fica: quem, o
 * quê e quando.
 */
async function anonimizarTrilha(
  tx: ClienteDaTrilha,
  familiaId: string,
  filhoId: string,
  usuarioId: string | null,
): Promise<number> {
  const linhas = await tx.atividade.findMany({
    where: {
      familiaId,
      OR: [
        { entidade: 'filho', entidadeId: filhoId },
        { detalhe: { contains: `"filhoId":"${filhoId}"` } },
        ...(usuarioId
          ? [{ entidade: 'usuario', entidadeId: usuarioId }, { atorId: usuarioId }]
          : []),
      ],
    },
  })
  for (const linha of linhas) {
    let detalhe: Record<string, unknown> = {}
    try {
      const lido: unknown = linha.detalhe ? JSON.parse(linha.detalhe) : {}
      if (lido && typeof lido === 'object' && !Array.isArray(lido)) {
        detalhe = lido as Record<string, unknown>
      }
    } catch {
      // detalhe corrompido: o registro segue sem ele
    }
    // Quem só aparece como autor não é o alvo: o `alvoNome` dela é de outra pessoa.
    const ehAlvo =
      (linha.entidade === 'filho' && linha.entidadeId === filhoId) ||
      (usuarioId !== null && linha.entidade === 'usuario' && linha.entidadeId === usuarioId) ||
      linha.detalhe?.includes(`"filhoId":"${filhoId}"`) === true
    if (ehAlvo && 'alvoNome' in detalhe) detalhe.alvoNome = MARCADOR_DO_FILHO_REMOVIDO
    await tx.atividade.update({
      where: { id: linha.id },
      data: {
        detalhe: linha.detalhe === null ? null : JSON.stringify(detalhe),
        ...(usuarioId && linha.atorId === usuarioId ? { atorNome: MARCADOR_DO_FILHO_REMOVIDO } : {}),
      },
    })
  }
  return linhas.length
}

/**
 * Apaga de verdade a conta de um filho com o histórico dele (PR-09, PR-35).
 * Só o responsável, e só depois de digitar o nome do filho: o servidor confere,
 * a tela não basta. Numa transação só: anonimiza a trilha, apaga o filho (os
 * movimentos de mesada saem pela chave estrangeira `Cascade`, PR-33), apaga o
 * usuário de login e registra `filho.excluido` sem dado pessoal. Falha no meio
 * desfaz tudo. Não há tabela de sessão: o token emitido antes deixa de abrir
 * qualquer página porque o usuário deixa de existir. Depois do commit, o estado
 * de tentativas de login do e-mail é esquecido.
 */
export async function excluirFilho(
  autor: UsuarioAutenticado,
  id: string,
  entrada: unknown,
): Promise<ResultadoDaExclusao> {
  exigirAdmin(autor)

  const dados = entradaDeExclusao.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Digite o nome do filho para confirmar.')
  }

  const filho = await prisma.filho.findFirst({
    where: { id, familiaId: autor.familiaId },
    include: { usuario: { select: { id: true, email: true } } },
  })
  if (!filho) throw naoEncontrado('Filho não encontrado.')
  if (dados.data.confirmacao !== filho.nome) {
    throw entradaInvalida('O nome digitado não confere com o do filho. Nada foi apagado.')
  }

  const usuarioId = filho.usuario?.id ?? null
  const resultado = await prisma.$transaction(async (tx) => {
    const linhasAnonimizadas = await anonimizarTrilha(tx, autor.familiaId, filho.id, usuarioId)
    await tx.filho.delete({ where: { id: filho.id } })
    if (usuarioId) await tx.usuario.delete({ where: { id: usuarioId } })
    await registrarAtividade(
      {
        ator: autor,
        acao: 'filho.excluido',
        entidade: 'filho',
        entidadeId: filho.id,
        detalhe: { tinhaLogin: usuarioId !== null, linhasAnonimizadas },
      },
      tx,
    )
    return { filhoId: filho.id, tinhaLogin: usuarioId !== null, linhasAnonimizadas }
  })

  if (filho.usuario) esquecerTentativasDeLogin(filho.usuario.email)
  return resultado
}
