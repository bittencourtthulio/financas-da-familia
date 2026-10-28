import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { exigirAdmin, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { registrarAtividade } from '@/servicos/atividade'
import { saldosDosFilhos } from '@/servicos/mesada'
import { nomeDoArquivoDeExportacao, VERSAO_DO_FORMATO } from '@/lib/privacidade'

/**
 * Privacidade dos dados da família (FT-07, PR-09). Só o responsável (`admin`)
 * exporta os dados e apaga a conta de um filho; a verificação é a primeira
 * linha de cada função, no servidor (PR-06).
 *
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
  const [usuarios, categorias, lancamentos, filhos, movimentos, atividades] = await prisma.$transaction([
    prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, papel: true, ativo: true, criadoEm: true },
      orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }],
    }),
    prisma.categoria.findMany({ orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] }),
    prisma.lancamento.findMany({ orderBy: [{ data: 'asc' }, { criadoEm: 'asc' }, { id: 'asc' }] }),
    prisma.filho.findMany({ orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] }),
    prisma.movimentoDeMesada.findMany({ orderBy: [{ data: 'asc' }, { criadoEm: 'asc' }, { id: 'asc' }] }),
    prisma.atividade.findMany({ orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] }),
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
      ativo: u.ativo,
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
      criado_em: iso(l.criadoEm),
      atualizado_em: iso(l.atualizadoEm),
    })),
    filhos: filhos.map((f) => ({
      id: f.id,
      nome: f.nome,
      nascimento: f.nascimento,
      mesada_combinada_centavos: f.mesadaCentavos,
      periodicidade: f.periodicidade,
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
