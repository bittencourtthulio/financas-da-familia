import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { extratoDoFilho } from '@/servicos/mesada'
import { registrarMovimentoDeMesada } from '@/app/acoes'
import { Formulario } from '@/componentes/Formulario'
import { CamposDeMovimento } from '@/componentes/CamposDeMovimento'
import { SaldoDaMesada } from '@/componentes/SaldoDaMesada'
import { ExtratoDeMesada } from '@/componentes/ExtratoDeMesada'
import { PaginacaoDoExtrato } from '@/componentes/PaginacaoDoExtrato'
import { descricaoDaMesada } from '@/lib/filhos'
import { hojeEmSaoPaulo } from '@/lib/datas'
import { lerPagina } from '@/lib/mesada'
import { ErroDeAplicacao } from '@/lib/erros'

/**
 * O extrato e o saldo de um filho, com o formulário rápido de movimento. Só o
 * responsável (PR-33): a guarda de página e o serviço verificam o papel no
 * servidor. Filho que não existe cai em "não encontrado"; carregando e erro vêm
 * do `loading.tsx` e do `error.tsx` do grupo (sistema).
 */
export default async function MesadaDeUmFilho({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const admin = await exigirUsuarioAdmin()
  const { id } = await params
  const consulta = await searchParams

  let extrato
  try {
    extrato = await extratoDoFilho(admin, id, { pagina: lerPagina(consulta.pagina) })
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao && erro.status === 404) notFound()
    throw erro
  }

  return (
    <>
      <h1 className="titulo-da-tela">Mesada de {extrato.filho.nome}</h1>
      <p className="subtitulo-da-tela">
        Registre créditos e gastos e acompanhe o saldo. <Link href="/familia">Voltar para a família</Link>
      </p>
      <p className="mesada-referencia">
        Mesada combinada: {descricaoDaMesada(extrato.filho.mesadaCentavos, extrato.filho.periodicidade)}. É só
        uma referência: o sistema não credita sozinho.
      </p>

      <SaldoDaMesada
        saldoCentavos={extrato.saldoCentavos}
        creditosCentavos={extrato.creditosCentavos}
        gastosCentavos={extrato.gastosCentavos}
      />

      <section className="formulario-rapido" aria-labelledby="titulo-do-formulario">
        <h2 id="titulo-do-formulario" className="titulo-da-secao">
          Novo movimento
        </h2>
        <Formulario acao={registrarMovimentoDeMesada} rotulo="Registrar movimento">
          <input type="hidden" name="filhoId" value={extrato.filho.id} />
          <CamposDeMovimento hoje={hojeEmSaoPaulo()} />
        </Formulario>
      </section>

      <section aria-labelledby="titulo-do-extrato">
        <h2 id="titulo-do-extrato" className="titulo-da-secao">
          Extrato
        </h2>
        <ExtratoDeMesada itens={extrato.itens} editarDoFilho={extrato.filho.id} />
        <PaginacaoDoExtrato pagina={extrato.pagina} paginas={extrato.paginas} filhoId={extrato.filho.id} />
      </section>
    </>
  )
}
