'use client'

import { useState } from 'react'
import { CampoDeTipo } from '@/componentes/CampoDeTipo'
import { CampoDeCategoria, type CategoriaDoCampo } from '@/componentes/CampoDeCategoria'

export type { CategoriaDoCampo }

export interface LancamentoInicial {
  id: string
  tipo: string
  /** No formato do campo, "1234,56". */
  valor: string
  data: string
  categoriaId: string
  pessoaId?: string | null
  /** Pago ou recebido. */
  pago?: boolean
  /** Se é um mês de lançamento recorrente. */
  recorrente?: boolean
  descricao: string
}

export interface PessoaDoCampo {
  id: string
  nome: string
}

/** Só as categorias do tipo: a categoria pertence a um tipo (PR-27). */
export function categoriasDoTipo(categorias: CategoriaDoCampo[], tipo: string) {
  return categorias.filter((c) => c.tipo === tipo)
}

/**
 * Os campos do lançamento, para o formulário de novo e o de edição. O tipo
 * escolhido filtra as categorias oferecidas; a categoria é um campo com busca
 * que também cadastra e apaga (CampoDeCategoria). O valor é um campo de texto, não
 * numérico: o formato brasileiro usa vírgula e o servidor é quem lê (PR-02).
 */
export function CamposDeLancamento({
  categorias,
  pessoas = [],
  pessoaPadrao,
  hoje,
  inicial,
}: {
  categorias: CategoriaDoCampo[]
  pessoas?: PessoaDoCampo[]
  /** Quem vem marcado num lançamento novo (quem está lançando). */
  pessoaPadrao?: string
  hoje: string
  inicial?: LancamentoInicial
}) {
  const [tipo, setTipo] = useState(inicial?.tipo ?? 'despesa')

  return (
    <>
      {inicial && <input type="hidden" name="id" value={inicial.id} />}

      <CampoDeTipo selecionado={tipo} aoMudar={setTipo} />

      <label className="campo">
        <span>Valor (R$)</span>
        <input
          type="text"
          name="valor"
          inputMode="decimal"
          placeholder="0,00"
          autoComplete="off"
          defaultValue={inicial?.valor}
          required
        />
      </label>

      <label className="campo">
        <span>Data</span>
        <input type="date" name="data" defaultValue={inicial?.data ?? hoje} required />
      </label>

      <CampoDeCategoria categorias={categorias} tipo={tipo} inicialId={inicial?.tipo === tipo ? inicial.categoriaId : undefined} />

      <label className="campo">
        <span>{tipo === 'receita' ? 'Quem recebeu' : 'Quem gastou'} (opcional)</span>
        <select name="pessoaId" defaultValue={inicial ? (inicial.pessoaId ?? '') : (pessoaPadrao ?? '')}>
          <option value="">Ninguém em especial</option>
          {pessoas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="campo-de-opcao">
        <legend>Situação</legend>
        <div className="opcoes">
          <label>
            <input type="radio" name="pago" value="sim" defaultChecked={inicial?.pago ?? true} />
            {tipo === 'receita' ? 'Recebido' : 'Pago'}
          </label>
          <label>
            <input type="radio" name="pago" value="nao" defaultChecked={inicial ? inicial.pago === false : false} />
            Em aberto
          </label>
        </div>
      </fieldset>

      {inicial?.recorrente ? (
        <fieldset className="campo-de-opcao">
          <legend>Este lançamento se repete todo mês. Aplicar a</legend>
          <div className="opcoes">
            <label>
              <input type="radio" name="escopo" value="este" defaultChecked />
              Só este mês
            </label>
            <label>
              <input type="radio" name="escopo" value="proximos" />
              Este e os próximos meses
            </label>
          </div>
          <p className="nota-do-campo">Pago ou em aberto vale só para este mês.</p>
        </fieldset>
      ) : (
        <label className="campo campo-de-marca">
          <input type="checkbox" name="repete" />
          <span>Repete todo mês, no mesmo dia</span>
        </label>
      )}

      <label className="campo">
        <span>Descrição (opcional)</span>
        <input
          type="text"
          name="descricao"
          maxLength={200}
          autoComplete="off"
          defaultValue={inicial?.descricao}
        />
      </label>
    </>
  )
}
