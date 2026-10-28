import { BaixarDados } from '@/componentes/BaixarDados'
import { ApagarFilho } from '@/componentes/ApagarFilho'
import type { FilhoListado } from '@/servicos/filhos'

/**
 * A página Privacidade (FT-07, PR-09): primeiro levar os dados, depois apagar a
 * conta de um filho. Duas seções com o que cada uma faz dito em português; a
 * segunda é a que não tem volta, e a tela diz para baixar antes.
 */
export function PainelDePrivacidade({
  filhos,
  excluido,
}: {
  filhos: FilhoListado[]
  excluido: boolean
}) {
  return (
    <div className="painel-de-privacidade">
      <h1 className="titulo-da-tela">Privacidade</h1>
      <p className="subtitulo-da-tela">Leve os dados da família ou apague de vez a conta de um filho.</p>

      {excluido && (
        <p className="aviso sucesso" role="status">
          A conta e o histórico do filho foram apagados.
        </p>
      )}

      <section aria-labelledby="levar-os-dados">
        <h2 id="levar-os-dados">Levar os dados</h2>
        <p>O arquivo é um JSON com tudo o que a família guarda aqui:</p>
        <ul>
          <li>usuários (nome, e-mail, papel);</li>
          <li>categorias e lançamentos da casa;</li>
          <li>filhos, com o saldo, e os movimentos de mesada;</li>
          <li>a atividade, que é o registro de quem fez o quê.</li>
        </ul>
        <p>
          Os valores vão em centavos inteiros e as datas no formato AAAA-MM-DD. O arquivo nunca leva
          senhas, tokens nem dados de sessão. Cada download fica registrado em Atividade.
        </p>
        <BaixarDados />
      </section>

      <section aria-labelledby="apagar-a-conta" className="apagar-a-conta">
        <h2 id="apagar-a-conta">Apagar a conta de um filho</h2>
        <p>
          A exclusão apaga de verdade, de uma vez só: o cadastro do filho, os movimentos de mesada e o
          login dele, que deixa de entrar. Na Atividade, o nome dele é trocado por “filho removido” e
          fica o registro de que a exclusão aconteceu. Esta ação não pode ser desfeita: baixe os dados
          antes.
        </p>
        {filhos.length === 0 ? (
          <p className="vazio">Nenhum filho cadastrado. Quando houver, a exclusão aparece aqui.</p>
        ) : (
          <ul className="lista-de-apagar" aria-label="Filhos da família">
            {filhos.map((f) => (
              <li key={f.id} className="apagar-por-filho">
                <h3>{f.nome}</h3>
                <ApagarFilho filhoId={f.id} nome={f.nome} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
