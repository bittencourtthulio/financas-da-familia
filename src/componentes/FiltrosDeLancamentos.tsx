import Link from 'next/link'
import { mesAnterior, mesSeguinte, rotuloDoMes } from '@/lib/datas'
import { enderecoDaLista } from '@/lib/lancamentos-links'

const TIPOS = [
  { valor: null, rotulo: 'Todos' },
  { valor: 'receita', rotulo: 'Receitas' },
  { valor: 'despesa', rotulo: 'Despesas' },
] as const

const comMaiuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

/**
 * Mês e tipo por link, sem JavaScript: o mês ao centro, com os vizinhos nas
 * pontas, e o tipo em três opções. Trocar o mês mantém o tipo e vice-versa;
 * trocar qualquer um volta à primeira página.
 */
export function FiltrosDeLancamentos({
  mes,
  tipo,
}: {
  mes: string
  tipo: string | null
}) {
  return (
    <div className="filtros-de-lancamentos">
      <nav aria-label="Mês" className="seletor-de-mes">
        <Link href={enderecoDaLista({ mes: mesAnterior(mes), tipo })}>Mês anterior</Link>
        <strong>{comMaiuscula(rotuloDoMes(mes))}</strong>
        <Link href={enderecoDaLista({ mes: mesSeguinte(mes), tipo })}>Próximo mês</Link>
      </nav>
      <nav aria-label="Tipo" className="seletor-de-tipo">
        {TIPOS.map((t) => (
          <Link
            key={t.rotulo}
            href={enderecoDaLista({ mes, tipo: t.valor })}
            {...(t.valor === tipo ? { 'aria-current': 'true' } : {})}
          >
            {t.rotulo}
          </Link>
        ))}
      </nav>
    </div>
  )
}
