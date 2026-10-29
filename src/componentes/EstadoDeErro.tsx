import { Cachorro } from '@/componentes/ilustracoes/Familia'

/**
 * O estado de erro de qualquer tela (PR-16). Nunca mostra a mensagem do erro
 * nem o rastro de pilha (L17): só uma frase, o botão para tentar de novo e,
 * quando existe, o código de correlação (`digest`) que o servidor gravou no
 * log e que a família pode passar a quem cuida do sistema.
 */
export function EstadoDeErro({
  erro,
  aoTentarDeNovo,
}: {
  erro: Error & { digest?: string }
  aoTentarDeNovo: () => void
}) {
  return (
    <div className="estado estado-erro" role="alert">
      <Cachorro humor="preocupado" />
      <h1 className="titulo-da-tela">Algo deu errado</h1>
      <p>
        Não foi possível mostrar esta tela. Tente de novo; se o problema
        continuar, avise quem cuida do sistema.
      </p>
      {erro.digest && <p className="codigo-do-erro">Código: {erro.digest}</p>}
      <div>
        <button type="button" className="primario" onClick={aoTentarDeNovo}>
          Tentar de novo
        </button>
      </div>
    </div>
  )
}
