import { exigirUsuario } from '@/app/sessao-servidor'

/**
 * O painel da família — a tela inicial (P-9, E-1). O corpo está vazio de
 * propósito: o saldo, o resumo do mês e a mesada chegam nas features
 * seguintes, e este estado vazio diz o que vai aparecer aqui.
 */
export default async function Painel() {
  const usuario = await exigirUsuario()

  return (
    <>
      <h1 className="titulo-da-tela">Painel da família</h1>
      <p className="subtitulo-da-tela">
        Bem-vindo, {usuario.nome}. Aqui você acompanha as finanças da casa.
      </p>

      <p className="vazio">
        Ainda não há movimentações para mostrar. Receitas, despesas e a mesada
        dos filhos aparecem aqui conforme forem registradas.
      </p>
    </>
  )
}
