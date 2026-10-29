'use client'

import { useState } from 'react'
import {
  CABELOS,
  PELES,
  ROTULOS,
  ROUPAS,
  TOKEN_DA_ROUPA,
  tokenDaPele,
  tokenDoCabelo,
  type Avatar,
  type Figura,
} from '@/lib/avatar'
import { Personagem } from '@/componentes/ilustracoes/Familia'

/**
 * O editor do avatar: a pessoa escolhe figura, tom de pele, cabelo, roupa e
 * óculos e vê o desenho mudar na hora. São campos de formulário de verdade
 * (`avatarFigura`, `avatarPele`…): vão junto com o formulário que envolve o
 * editor e funcionam sem JavaScript; com JavaScript, a prévia acompanha. Quem
 * usa o editor passa uma `key` com o avatar salvo: o React reinicia o
 * formulário depois da ação, e a chave nova remonta o editor já com o que foi gravado.
 */
export function EditorDeAvatar({
  inicial,
  figuras,
  tipo,
}: {
  inicial: Avatar | null
  /** As figuras oferecidas: pai e mãe para adultos; menino e menina para crianças. */
  figuras: ReadonlyArray<Figura>
  tipo: 'adulto' | 'crianca'
}) {
  const [avatar, setAvatar] = useState<Avatar>(
    inicial ?? { figura: figuras[0] ?? 'pai', pele: 1, cabelo: 1, roupa: 'azul', oculos: false },
  )
  const mudar = <K extends keyof Avatar>(campo: K, valor: Avatar[K]) =>
    setAvatar((a) => ({ ...a, [campo]: valor }))

  return (
    <div className="editor-de-avatar">
      <div className="previa-do-avatar" aria-live="polite">
        <Personagem avatar={avatar} tipo={tipo} titulo={`Prévia: ${ROTULOS.figura[avatar.figura]}`} />
      </div>

      <div className="escolhas-do-avatar">
        <fieldset className="campo-de-opcao">
          <legend>Figura</legend>
          <div className="opcoes">
            {figuras.map((f) => (
              <label key={f}>
                <input
                  type="radio"
                  name="avatarFigura"
                  value={f}
                  checked={avatar.figura === f}
                  onChange={() => mudar('figura', f)}
                />
                {ROTULOS.figura[f]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="campo-de-opcao amostras">
          <legend>Tom de pele</legend>
          <div className="opcoes">
            {PELES.map((p) => (
              <label key={p} title={ROTULOS.pele[p]}>
                <input type="radio" name="avatarPele" value={p} checked={avatar.pele === p} onChange={() => mudar('pele', p)} />
                <span className="amostra" style={{ background: tokenDaPele(p) }} aria-hidden="true" />
                <span className="rotulo-da-amostra">{ROTULOS.pele[p]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="campo-de-opcao amostras">
          <legend>Cabelo</legend>
          <div className="opcoes">
            {CABELOS.map((c) => (
              <label key={c} title={ROTULOS.cabelo[c]}>
                <input type="radio" name="avatarCabelo" value={c} checked={avatar.cabelo === c} onChange={() => mudar('cabelo', c)} />
                <span className="amostra" style={{ background: tokenDoCabelo(c) }} aria-hidden="true" />
                <span className="rotulo-da-amostra">{ROTULOS.cabelo[c]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="campo-de-opcao amostras">
          <legend>Roupa</legend>
          <div className="opcoes">
            {ROUPAS.map((r) => (
              <label key={r} title={ROTULOS.roupa[r]}>
                <input type="radio" name="avatarRoupa" value={r} checked={avatar.roupa === r} onChange={() => mudar('roupa', r)} />
                <span className="amostra" style={{ background: TOKEN_DA_ROUPA[r] }} aria-hidden="true" />
                <span className="rotulo-da-amostra">{ROTULOS.roupa[r]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="caixa-de-marcar">
          <input type="checkbox" name="avatarOculos" value="true" checked={avatar.oculos} onChange={(e) => mudar('oculos', e.target.checked)} />
          <span>Usa óculos</span>
        </label>
      </div>
    </div>
  )
}
