import Link from 'next/link'
import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { familiaDe } from '@/servicos/avatares'
import { listarFilhos } from '@/servicos/filhos'
import { saldosDosFilhos } from '@/servicos/mesada'
import { CartoesDaFamilia } from '@/componentes/CartoesDaFamilia'
import { FamiliaDesenhada } from '@/componentes/ilustracoes/Familia'

/**
 * A área Família (FT-10): todo mundo da casa, desenhado e em cartões, com o
 * caminho para cadastrar quem entra e para editar cada pessoa (dados,
 * papel de acesso e avatar). Só o responsável chega aqui.
 */
export default async function Familia() {
  const admin = await exigirUsuarioAdmin()
  const membros = await familiaDe(admin)
  const filhos = await listarFilhos(admin)
  const saldos = await saldosDosFilhos(admin)
  const adultos = membros.filter((m) => m.tipo === 'adulto')
  const criancas = membros.filter((m) => m.tipo === 'crianca')

  return (
    <>
      <div className="cabecalho-da-tela">
        <div>
          <h1 className="titulo-da-tela">Nossa família</h1>
          <p className="subtitulo-da-tela">
            Quem é da casa, quem tem acesso e como cada um aparece desenhado.
          </p>
        </div>
        <Link href="/familia/nova" className="botao primario">
          Adicionar pessoa
        </Link>
      </div>

      <section className="retrato-da-familia" aria-label="A família desenhada">
        <FamiliaDesenhada
          membros={membros.filter((m) => m.ativo).map((m) => ({ avatar: m.avatar, tipo: m.tipo }))}
          titulo="A família desenhada, do primeiro adulto ao cachorro"
        />
      </section>

      <section aria-labelledby="titulo-dos-adultos">
        <h2 id="titulo-dos-adultos" className="titulo-da-secao">
          Adultos
        </h2>
        <CartoesDaFamilia membros={adultos} />
      </section>

      <section aria-labelledby="titulo-das-criancas">
        <h2 id="titulo-das-criancas" className="titulo-da-secao">
          Crianças
        </h2>
        <CartoesDaFamilia membros={criancas} filhos={filhos} saldos={saldos} />
      </section>
    </>
  )
}
