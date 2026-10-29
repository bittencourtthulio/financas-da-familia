import Link from 'next/link'
import { rotuloDoPapel } from '@/lib/papeis'
import { Rostinho } from '@/componentes/ilustracoes/Familia'
import type { MembroDaFamilia } from '@/servicos/avatares'

/**
 * A família em cartões (FT-10): um por pessoa, com o rostinho, o nome, o papel
 * e o caminho para editar. Adultos vão para a página do adulto (dados, papel e
 * avatar); filhos, para a página do filho, que já existia.
 */
export function CartoesDaFamilia({ membros }: { membros: MembroDaFamilia[] }) {
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
