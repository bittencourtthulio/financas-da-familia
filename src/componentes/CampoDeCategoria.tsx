'use client'

import { useId, useMemo, useRef, useState } from 'react'
import { apagarCategoriaDoCampo, criarCategoriaDoCampo } from '@/app/acoes'

export interface CategoriaDoCampo {
  id: string
  nome: string
  tipo: string
}

const semCaixa = (t: string) => t.trim().toLocaleLowerCase('pt-BR')

/**
 * A categoria do lançamento, num campo só: abre a lista, filtra enquanto se
 * escreve, e um nome novo vira categoria na hora ("Criar …"). Cada categoria
 * da lista tem "Apagar" (em dois passos); só some a que nenhum lançamento usa.
 * Sem escolher na lista, o nome digitado segue no formulário (`categoriaNome`)
 * e o servidor cadastra ao salvar. O que vale para o servidor é `categoriaId`.
 */
export function CampoDeCategoria({
  categorias,
  tipo,
  inicialId,
}: {
  categorias: CategoriaDoCampo[]
  tipo: string
  inicialId?: string
}) {
  const [lista, setLista] = useState(categorias)
  const doTipo = useMemo(() => lista.filter((c) => c.tipo === tipo), [lista, tipo])
  const inicial = doTipo.find((c) => c.id === inicialId)
  const [texto, setTexto] = useState(inicial?.nome ?? '')
  const [escolhidaId, setEscolhidaId] = useState(inicial?.id ?? '')
  const [aberto, setAberto] = useState(false)
  const [apagando, setApagando] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const idDaLista = useId()
  const caixa = useRef<HTMLDivElement>(null)

  // Trocar o tipo troca as categorias oferecidas: a escolha antiga não vale.
  const [tipoAnterior, setTipoAnterior] = useState(tipo)
  if (tipoAnterior !== tipo) {
    setTipoAnterior(tipo)
    setTexto('')
    setEscolhidaId('')
    setApagando(null)
  }

  const busca = semCaixa(texto)
  const filtradas = doTipo.filter((c) => semCaixa(c.nome).includes(busca))
  const igual = doTipo.find((c) => semCaixa(c.nome) === busca)
  const podeCriar = busca !== '' && !igual

  function escolher(c: CategoriaDoCampo) {
    setTexto(c.nome)
    setEscolhidaId(c.id)
    setAberto(false)
    setAviso('')
  }

  async function criar() {
    setOcupado(true)
    const r = await criarCategoriaDoCampo(texto.trim(), tipo)
    setOcupado(false)
    if (r.erro || !r.categoria) return setAviso(r.erro ?? 'Não foi possível criar a categoria.')
    const nova = r.categoria
    setLista((l) => (l.some((c) => c.id === nova.id) ? l : [...l, nova]))
    escolher(nova)
  }

  async function apagar(c: CategoriaDoCampo) {
    setOcupado(true)
    const r = await apagarCategoriaDoCampo(c.id)
    setOcupado(false)
    setApagando(null)
    if (r.erro) return setAviso(r.erro)
    setLista((l) => l.filter((x) => x.id !== c.id))
    if (escolhidaId === c.id) {
      setEscolhidaId('')
      setTexto('')
    }
    setAviso(`Categoria "${c.nome}" apagada.`)
  }

  return (
    <div
      className="campo campo-de-categoria"
      ref={caixa}
      onBlur={(e) => {
        if (!caixa.current?.contains(e.relatedTarget as Node | null)) setAberto(false)
      }}
    >
      <label>
        <span>Categoria</span>
        <input
          type="text"
          role="combobox"
          aria-expanded={aberto}
          aria-controls={idDaLista}
          aria-autocomplete="list"
          name="categoriaNome"
          value={texto}
          maxLength={40}
          autoComplete="off"
          placeholder="Escolha ou escreva uma nova"
          required
          onFocus={() => setAberto(true)}
          onChange={(e) => {
            setTexto(e.target.value)
            const exata = doTipo.find((c) => semCaixa(c.nome) === semCaixa(e.target.value))
            setEscolhidaId(exata?.id ?? '')
            setAberto(true)
            setAviso('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setAberto(false)
            if (e.key === 'Enter' && aberto) {
              e.preventDefault()
              if (igual) escolher(igual)
              else if (podeCriar) void criar()
            }
          }}
        />
      </label>
      <input type="hidden" name="categoriaId" value={escolhidaId} />

      {aberto && (
        <ul className="opcoes-de-categoria" id={idDaLista} role="listbox" aria-label="Categorias">
          {filtradas.map((c) => (
            <li key={c.id} role="option" aria-selected={c.id === escolhidaId}>
              {apagando === c.id ? (
                <span className="confirmar-apagar">
                  Apagar “{c.nome}”?
                  <button type="button" className="perigo" disabled={ocupado} onClick={() => void apagar(c)}>
                    Apagar
                  </button>
                  <button type="button" className="secundario" onClick={() => setApagando(null)}>
                    Não
                  </button>
                </span>
              ) : (
                <>
                  <button type="button" className="escolher" onClick={() => escolher(c)}>
                    {c.nome}
                  </button>
                  <button
                    type="button"
                    className="apagar"
                    aria-label={`Apagar a categoria ${c.nome}`}
                    onClick={() => setApagando(c.id)}
                  >
                    ×
                  </button>
                </>
              )}
            </li>
          ))}
          {podeCriar && (
            <li role="option" aria-selected={false}>
              <button type="button" className="escolher criar" disabled={ocupado} onClick={() => void criar()}>
                Criar “{texto.trim()}”
              </button>
            </li>
          )}
          {filtradas.length === 0 && !podeCriar && <li className="sem-opcao">Nenhuma categoria ainda. Escreva o nome para criar.</li>}
        </ul>
      )}
      {aviso && (
        <p className="nota-do-campo" role="status">
          {aviso}
        </p>
      )}
    </div>
  )
}
