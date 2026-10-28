import Link from 'next/link'
import { exigirUsuarioDeLancamentos } from '@/app/sessao-servidor'
import { listarCategorias } from '@/servicos/lancamentos'
import { registrarCategoria } from '@/app/acoes'
import { Formulario } from '@/componentes/Formulario'
import { CampoDeTipo } from '@/componentes/CampoDeTipo'

/**
 * Categorias dos lançamentos (PR-27): ficam dentro de Lançamentos, não em
 * Configurações. Cria-se, mas por ora não se edita nem se apaga.
 */
export default async function Categorias() {
  const usuario = await exigirUsuarioDeLancamentos()
  const categorias = await listarCategorias(usuario)

  const grupos = [
    { titulo: 'Despesas', tipo: 'despesa' },
    { titulo: 'Receitas', tipo: 'receita' },
  ]

  return (
    <>
      <h1 className="titulo-da-tela">Categorias</h1>
      <p className="subtitulo-da-tela">
        Cada categoria é de despesa ou de receita. <Link href="/lancamentos">Voltar para os lançamentos</Link>
      </p>

      {grupos.map((g) => {
        const lista = categorias.filter((c) => c.tipo === g.tipo)
        return (
          <section key={g.tipo} aria-label={g.titulo}>
            <h2 style={{ fontSize: 15 }}>{g.titulo}</h2>
            {lista.length === 0 ? (
              <p className="vazio">
                Ainda não há categoria de {g.tipo}. Crie a primeira no formulário abaixo.
              </p>
            ) : (
              <div className="tabela-rolavel">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((c) => (
                      <tr key={c.id}>
                        <td>{c.nome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )
      })}

      <h2 style={{ marginTop: 32, fontSize: 15 }}>Nova categoria</h2>
      <Formulario acao={registrarCategoria} rotulo="Criar categoria">
        <label className="campo">
          <span>Nome</span>
          <input type="text" name="nome" maxLength={40} autoComplete="off" required />
        </label>
        <CampoDeTipo />
      </Formulario>
    </>
  )
}
