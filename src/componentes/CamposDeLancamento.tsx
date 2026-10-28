'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CampoDeTipo } from '@/componentes/CampoDeTipo'

export interface CategoriaDoCampo {
  id: string
  nome: string
  tipo: string
}

export interface LancamentoInicial {
  id: string
  tipo: string
  /** No formato do campo, "1234,56". */
  valor: string
  data: string
  categoriaId: string
  descricao: string
}

/** Só as categorias do tipo: a categoria pertence a um tipo (PR-27). */
export function categoriasDoTipo(categorias: CategoriaDoCampo[], tipo: string) {
  return categorias.filter((c) => c.tipo === tipo)
}

/**
 * Os campos do lançamento, para o formulário de novo e o de edição. O tipo
 * escolhido filtra as categorias oferecidas. O valor é um campo de texto, não
 * numérico: o formato brasileiro usa vírgula e o servidor é quem lê (PR-02).
 */
export function CamposDeLancamento({
  categorias,
  hoje,
  inicial,
}: {
  categorias: CategoriaDoCampo[]
  hoje: string
  inicial?: LancamentoInicial
}) {
  const [tipo, setTipo] = useState(inicial?.tipo ?? 'despesa')
  const doTipo = categoriasDoTipo(categorias, tipo)
  const rotuloDoTipo = tipo === 'receita' ? 'receita' : 'despesa'

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

      {doTipo.length === 0 ? (
        <p className="aviso" role="status">
          Ainda não há categoria de {rotuloDoTipo}. <Link href="/lancamentos/categorias">Crie uma em Categorias</Link>{' '}
          e volte para lançar.
        </p>
      ) : (
        <label className="campo">
          <span>Categoria</span>
          <select
            key={tipo}
            name="categoriaId"
            defaultValue={inicial?.tipo === tipo ? inicial.categoriaId : doTipo[0]?.id}
            required
          >
            {doTipo.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
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
