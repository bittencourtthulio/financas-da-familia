import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { listarAtividade } from '@/servicos/atividade'
import { TabelaDeAtividade } from '@/componentes/TabelaDeAtividade'
import { PaginacaoDeAtividade } from '@/componentes/PaginacaoDeAtividade'

/**
 * A trilha de atividade (FT-02, PR-10). Só o responsável chega aqui:
 * `exigirUsuarioAdmin` verifica no servidor, e `listarAtividade` verifica de
 * novo. Esconder o item do menu não é o controle. Carregando e erro vêm do
 * `loading.tsx` e do `error.tsx` do grupo (sistema).
 */
export default async function Atividade({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>
}) {
  const admin = await exigirUsuarioAdmin()
  const { pagina } = await searchParams
  const registro = await listarAtividade(admin, { pagina: Number(pagina) })

  return (
    <>
      <h1 className="titulo-da-tela">Atividade</h1>
      <p className="subtitulo-da-tela">
        Quem fez cada ação auditada no sistema, do mais recente para o mais antigo.
      </p>

      <TabelaDeAtividade itens={registro.itens} />
      <PaginacaoDeAtividade pagina={registro.pagina} paginas={registro.paginas} />
    </>
  )
}
