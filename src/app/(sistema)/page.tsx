import Link from 'next/link'
import { exigirUsuario } from '@/app/sessao-servidor'
import { mesAtualEmSaoPaulo } from '@/lib/datas'
import { papelPodeLancar } from '@/servicos/autenticacao'
import { resumoDoMes } from '@/servicos/resumo'
import { membrosDoPainel } from '@/servicos/avatares'
import { ResumoDoMes } from '@/componentes/ResumoDoMes'
import { SeletorDeMes } from '@/componentes/SeletorDeMes'
import { FamiliaDesenhada } from '@/componentes/ilustracoes/Familia'

/**
 * O painel da família — a tela inicial (P-9, E-1). A família desenhada é a
 * real (FT-10): o filho vê só a si mesmo e o cachorro. O resumo do mês (FT-04)
 * é só do responsável e do adulto; `resumoDoMes` verifica o papel de novo.
 */
export default async function Painel({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string | string[] }>
}) {
  const usuario = await exigirUsuario()
  const consulta = await searchParams
  const membros = await membrosDoPainel(usuario)

  const cabecalho = (
    <header className="boas-vindas">
      <div>
        <h1 className="titulo-da-tela">Painel da família</h1>
        <p className="subtitulo-da-tela">Bem-vindo, {usuario.nome}. Aqui você acompanha as finanças da casa.</p>
      </div>
      <FamiliaDesenhada membros={membros} />
    </header>
  )
  if (!papelPodeLancar(usuario.papel)) {
    return (
      <>
        {cabecalho}
        <p className="vazio">
          Não há resumo da casa para o seu perfil.
          {usuario.papel === 'filho' && (
            <>
              {' '}
              <Link href="/mesada">Ver minha mesada</Link>
            </>
          )}
        </p>
      </>
    )
  }

  const agora = new Date()
  const resumo = await resumoDoMes(usuario, consulta, agora)

  return (
    <>
      {cabecalho}
      <SeletorDeMes mes={resumo.mes} mesAtual={mesAtualEmSaoPaulo(agora)} />
      <ResumoDoMes resumo={resumo} />
    </>
  )
}
