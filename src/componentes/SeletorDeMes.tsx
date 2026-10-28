import Link from 'next/link'
import { rotuloDoMes } from '@/lib/datas'
import { enderecoDoPainel, mesesVizinhos } from '@/lib/resumo-links'

const comMaiuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

/**
 * O mês do resumo, por link e sem JavaScript: o mês por extenso ao centro, os
 * vizinhos nas pontas e, fora do mês corrente, o atalho para voltar a ele.
 * Nos limites (2000-01 e 2100-12) o link que sairia do intervalo não aparece.
 */
export function SeletorDeMes({ mes, mesAtual }: { mes: string; mesAtual: string }) {
  const { anterior, seguinte } = mesesVizinhos(mes)

  return (
    <nav aria-label="Mês do resumo" className="seletor-do-resumo">
      <div className="seletor-de-mes">
        {anterior ? (
          <Link href={enderecoDoPainel(anterior)}>Mês anterior</Link>
        ) : (
          <span aria-hidden="true" className="seletor-sem-vizinho" />
        )}
        <strong>{comMaiuscula(rotuloDoMes(mes))}</strong>
        {seguinte ? (
          <Link href={enderecoDoPainel(seguinte)}>Próximo mês</Link>
        ) : (
          <span aria-hidden="true" className="seletor-sem-vizinho" />
        )}
      </div>
      {mes !== mesAtual && (
        <Link href={enderecoDoPainel(null)} className="atalho-mes-atual">
          Mês atual
        </Link>
      )}
    </nav>
  )
}
