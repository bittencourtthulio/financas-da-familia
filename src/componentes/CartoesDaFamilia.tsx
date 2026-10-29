import Link from 'next/link'
import { rotuloDoPapel } from '@/lib/papeis'
import { descricaoDaMesada, situacaoDoLogin } from '@/lib/filhos'
import { formatarMoeda } from '@/lib/formato'
import { situacaoDoSaldo } from '@/lib/mesada'
import { Rostinho } from '@/componentes/ilustracoes/Familia'
import type { MembroDaFamilia } from '@/servicos/avatares'
import type { FilhoListado } from '@/servicos/filhos'

/**
 * A família em cartões (FT-10): um por pessoa, com o rostinho, o nome, o papel
 * e o caminho para editar. Adultos vão para a página do adulto (dados, papel e
 * avatar); filhos, para a página do filho, que já existia.
 */
export function CartoesDaFamilia({
  membros,
  filhos = [],
  saldos = {},
}: {
  membros: MembroDaFamilia[]
  /** Os cadastros dos filhos: a mesada combinada e o login aparecem no cartão da criança. */
  filhos?: FilhoListado[]
  /** O saldo de cada filho, por id. */
  saldos?: Record<string, number>
}) {
  if (membros.length === 0) {
    return <p className="vazio">Ninguém cadastrado ainda.</p>
  }
  return (
    <ul className="cartoes-da-familia" aria-label="Pessoas da família">
      {membros.map((m, i) => (
        <li key={m.id} className="cartao-de-membro" data-ativo={m.ativo ? 'sim' : 'nao'}>
          <Rostinho avatar={m.avatar} tipo={m.tipo} indice={i} className="avatar" />
          <h3>{m.nome}</h3>
          <p className="papel-do-membro">
            {rotuloDoPapel(m.papel)}
            {!m.ativo && ' · desativado'}
          </p>
          <p className="situacao-do-avatar">{m.avatar ? 'Avatar escolhido' : 'Ainda sem avatar'}</p>
          {m.tipo === 'crianca' && <DetalhesDoFilho filho={filhos.find((f) => f.id === m.id)} saldo={saldos[m.id] ?? 0} />}
          <Link
            href={m.tipo === 'crianca' ? `/filhos/${m.id}` : `/familia/adultos/${m.id}`}
            className="botao secundario"
          >
            {m.avatar ? 'Editar' : 'Escolher avatar'}
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** A mesada combinada, a situação do login e o saldo do filho, com o caminho para a mesada dele. */
function DetalhesDoFilho({ filho, saldo }: { filho: FilhoListado | undefined; saldo: number }) {
  if (!filho) return null
  const situacao = situacaoDoSaldo(saldo)
  return (
    <>
      <p className="mesada-combinada">{descricaoDaMesada(filho.mesadaCentavos, filho.periodicidade)}</p>
      <p className="situacao-do-login">{situacaoDoLogin(filho.login)}</p>
      <p className="saldo-do-filho" data-saldo={situacao.situacao}>
        <span>{situacao.rotulo}: </span>
        <strong>{formatarMoeda(saldo)}</strong> <Link href={`/filhos/${filho.id}/mesada`}>Ver mesada</Link>
      </p>
    </>
  )
}
