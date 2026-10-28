'use client'

import { useState } from 'react'
import { ENDERECO_DA_EXPORTACAO } from '@/lib/privacidade'

export type SituacaoDoDownload = 'repouso' | 'preparando' | 'erro' | 'pronto'

/**
 * Baixar os dados da família (FT-07, PR-34). É um formulário POST comum, que
 * funciona sem JavaScript; com JavaScript, o envio vira um `fetch` para a tela
 * dizer em texto que está preparando, que deu certo ou que falhou (L30). A
 * autorização é do servidor: a rota nega quem não é o responsável.
 */
export function BaixarDados({ situacaoInicial = 'repouso' }: { situacaoInicial?: SituacaoDoDownload }) {
  const [situacao, setSituacao] = useState<SituacaoDoDownload>(situacaoInicial)

  async function baixar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setSituacao('preparando')
    try {
      const resposta = await fetch(ENDERECO_DA_EXPORTACAO, { method: 'POST' })
      if (!resposta.ok) throw new Error('falhou')
      const nome = /filename="([^"]+)"/.exec(resposta.headers.get('content-disposition') ?? '')?.[1]
      const url = URL.createObjectURL(await resposta.blob())
      const ancora = document.createElement('a')
      ancora.href = url
      ancora.download = nome ?? 'dados-da-familia.json'
      document.body.append(ancora)
      ancora.click()
      ancora.remove()
      URL.revokeObjectURL(url)
      setSituacao('pronto')
    } catch {
      setSituacao('erro')
    }
  }

  return (
    <form method="post" action={ENDERECO_DA_EXPORTACAO} onSubmit={baixar} className="baixar-dados">
      {situacao === 'erro' && (
        <p className="aviso erro" role="alert">
          Não foi possível baixar o arquivo. Tente de novo; se continuar, saia e entre outra vez.
        </p>
      )}
      {situacao === 'preparando' && (
        <p className="aviso" role="status">
          Preparando o arquivo…
        </p>
      )}
      {situacao === 'pronto' && (
        <p className="aviso sucesso" role="status">
          Arquivo baixado. Guarde-o em lugar seguro: ele leva nomes, e-mails e todo o dinheiro da família.
        </p>
      )}
      <button type="submit" className="primario" disabled={situacao === 'preparando'}>
        Baixar os dados da família
      </button>
    </form>
  )
}
