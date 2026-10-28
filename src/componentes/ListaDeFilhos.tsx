import Link from 'next/link'
import { descricaoDaMesada, situacaoDoLogin } from '@/lib/filhos'
import { formatarMoeda } from '@/lib/formato'
import { situacaoDoSaldo } from '@/lib/mesada'
import type { FilhoListado } from '@/servicos/filhos'

/**
 * Os filhos da família, um cartão por filho: nome, a mesada combinada e a
 * situação do login em texto. Sem filho cadastrado, o estado vazio convida a
 * cadastrar o primeiro.
 */
export function ListaDeFilhos({
  filhos,
  saldos,
}: {
  filhos: FilhoListado[]
  /** O saldo de cada filho, por id (FT-06); sem ele a lista é a da FT-05. */
  saldos?: Record<string, number>
}) {
  if (filhos.length === 0) {
    return (
      <p className="vazio">
        Nenhum filho cadastrado ainda. <Link href="/filhos/novo">Cadastre o primeiro filho</Link> para
        registrar a mesada combinada e, se quiser, criar o login dele.
      </p>
    )
  }

  return (
    <ul className="lista-de-filhos" aria-label="Filhos da família">
      {filhos.map((f) => (
        <li key={f.id} className="cartao-de-filho" data-login={f.login ? (f.login.ativo ? 'ativo' : 'desativado') : 'sem'}>
          <h2 className="nome-do-filho">
            <Link href={`/filhos/${f.id}`}>{f.nome}</Link>
          </h2>
          <p className="mesada-combinada">{descricaoDaMesada(f.mesadaCentavos, f.periodicidade)}</p>
          <p className="situacao-do-login">{situacaoDoLogin(f.login)}</p>
          {saldos && (
            <p className="saldo-do-filho" data-saldo={situacaoDoSaldo(saldos[f.id] ?? 0).situacao}>
              <span>{situacaoDoSaldo(saldos[f.id] ?? 0).rotulo}: </span>
              <strong>{formatarMoeda(saldos[f.id] ?? 0)}</strong>{' '}
              <Link href={`/filhos/${f.id}/mesada`}>Ver mesada</Link>
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
