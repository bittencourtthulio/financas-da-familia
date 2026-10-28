import { exigirUsuario } from '@/app/sessao-servidor'
import { mesAtualEmSaoPaulo } from '@/lib/datas'
import { papelPodeLancar } from '@/servicos/autenticacao'
import { resumoDoMes } from '@/servicos/resumo'
import { ResumoDoMes } from '@/componentes/ResumoDoMes'
import { SeletorDeMes } from '@/componentes/SeletorDeMes'

/**
 * O painel da família — a tela inicial (P-9, E-1). Título e subtítulo valem
 * para todo papel. O resumo do mês (FT-04) é só do responsável e do adulto:
 * quem tem outro papel, como o filho de amanhã, não dispara a consulta e não
 * recebe dado financeiro; `resumoDoMes` verifica o papel de novo. O mês vem de
 * `?mes=AAAA-MM`, validado no servidor; inválido vale o mês corrente. Carregando
 * e erro vêm do `loading.tsx` e do `error.tsx` do grupo (sistema).
 */
export default async function Painel({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string | string[] }>
}) {
  const usuario = await exigirUsuario()
  const consulta = await searchParams

  const cabecalho = (
    <>
      <h1 className="titulo-da-tela">Painel da família</h1>
      <p className="subtitulo-da-tela">
        Bem-vindo, {usuario.nome}. Aqui você acompanha as finanças da casa.
      </p>
    </>
  )

  if (!papelPodeLancar(usuario.papel)) {
    return (
      <>
        {cabecalho}
        <p className="vazio">Não há resumo da casa para o seu perfil.</p>
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
