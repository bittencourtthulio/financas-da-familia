import Link from 'next/link'
import { Cachorro, Familia, Logotipo, Mae, Menina, Pai } from '@/componentes/ilustracoes/Familia'
import { NOME_DO_SISTEMA } from '@/lib/marca'

const RECURSOS = [
  {
    cor: 'sol',
    titulo: 'As contas da casa',
    texto: 'Receitas e despesas com categoria, mês a mês, em reais e sem conta de cabeça.',
    icone: 'M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2zM8 8h8v2H8zm0 4h8v2H8z',
  },
  {
    cor: 'ceu',
    titulo: 'O resumo do mês',
    texto: 'Quanto entrou, quanto saiu, quanto sobrou e para onde foi o dinheiro.',
    icone: 'M4 20V10h4v10zm6 0V4h4v16zm6 0v-7h4v7z',
  },
  {
    cor: 'rosa',
    titulo: 'A mesada das crianças',
    texto: 'Cada filho com o seu cofrinho: o que recebeu, o que gastou e o saldo em palavras.',
    icone: 'M7 12a6 6 0 0 1 11.3-2.8L21 9v5h-2.3a6 6 0 0 1-1.2 1.9L18 20h-2l-.6-2.2a6 6 0 0 1-2.8 0L12 20h-2l.5-4.1A6 6 0 0 1 7 12zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-11-1 2 2-2 2z',
  },
  {
    cor: 'grama',
    titulo: 'Cada um vê o seu',
    texto: 'O responsável cuida de tudo, o adulto lança, e o filho só vê a própria mesada.',
    icone: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zm-1 13 6-6-1.4-1.4L11 12.2 9.4 10.6 8 12z',
  },
] as const

/**
 * A página de apresentação (landing), pública: diz o que o sistema faz, para
 * quem, e leva ao login. Não busca dado nenhum; é a mesma página para todo
 * visitante. Aparece na raiz do site para quem ainda não entrou.
 */
export function Apresentacao() {
  return (
    <div className="apresentacao">
      <header className="apresentacao-topo">
        <div className="marca">
          <Logotipo />
          <span>{NOME_DO_SISTEMA}</span>
        </div>
        <nav className="acoes" aria-label="Acesso">
          <Link href="/entrar" className="botao secundario">
            Entrar
          </Link>
          <Link href="/cadastrar" className="botao primario">
            Criar minha família
          </Link>
        </nav>
      </header>

      <section className="heroi" aria-labelledby="titulo-da-apresentacao">
        <span className="bolha bolha-2" />
        <span className="bolha bolha-4" />
        <div>
          <h1 id="titulo-da-apresentacao">
            A grana da casa, <em>em família</em>.
          </h1>
          <p>
            Um lugar simples e alegre para registrar as contas, acompanhar o mês e cuidar da mesada
            das crianças — com cada um vendo só o que é seu.
          </p>
          <div className="acoes">
            <Link href="/cadastrar" className="botao primario grande">
              Criar minha família
            </Link>
            <Link href="/entrar" className="botao secundario grande">
              Já tenho conta
            </Link>
            <a href="#como-funciona" className="botao secundario grande">
              Como funciona
            </a>
          </div>
        </div>
        <div className="heroi-ilustracao">
          <Familia titulo="A família: pai, mãe, um menino, uma menina e o cachorro" />
        </div>
      </section>

      <section className="recursos" aria-labelledby="titulo-dos-recursos">
        <h2 id="titulo-dos-recursos">Tudo o que a família precisa</h2>
        <p>Sem planilha, sem conta de cabeça e sem susto no fim do mês.</p>
        <ul className="grade-de-recursos">
          {RECURSOS.map((r) => (
            <li key={r.titulo} className="recurso">
              <span className="selo" data-cor={r.cor} aria-hidden="true">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
                  <path d={r.icone} />
                </svg>
              </span>
              <h3>{r.titulo}</h3>
              <p>{r.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="passos" id="como-funciona" aria-labelledby="titulo-dos-passos">
        <h2 id="titulo-dos-passos">Como funciona</h2>
        <p>Três passos, e a casa inteira na mesma página.</p>
        <ol className="lista-de-passos">
          <li className="passo">
            <Pai className="avatar" />
            <h3>O responsável organiza</h3>
            <p>Cria as categorias, cadastra quem é da casa e combina a mesada de cada filho.</p>
          </li>
          <li className="passo">
            <Mae className="avatar" />
            <h3>Os adultos registram</h3>
            <p>Cada compra e cada receita entram em segundos, e o resumo do mês se monta sozinho.</p>
          </li>
          <li className="passo">
            <Menina className="avatar" />
            <h3>As crianças acompanham</h3>
            <p>Com o próprio login, cada filho vê o seu cofrinho: o que recebeu, o que gastou e o saldo.</p>
          </li>
        </ol>
      </section>

      <section className="chamada" aria-labelledby="titulo-da-chamada">
        <Cachorro className="avatar" />
        <h2 id="titulo-da-chamada">Pronto para cuidar das contas juntos?</h2>
        <p>Crie a sua família em um minuto, ou entre com o e-mail e a senha que o responsável criou para você.</p>
        <div className="acoes">
          <Link href="/cadastrar" className="botao primario grande">
            Criar minha família
          </Link>
          <Link href="/entrar" className="botao secundario grande">
            Entrar
          </Link>
        </div>
      </section>

      <footer className="rodape-da-apresentacao">
        {NOME_DO_SISTEMA} vem de bufunfa: a grana da casa, em família. Feito com carinho, cachorro incluído.
      </footer>
    </div>
  )
}
