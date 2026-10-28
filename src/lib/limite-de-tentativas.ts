// Limite de tentativas de login (PR-12, PR-22). Cinco falhas seguidas da
// mesma chave dentro da janela bloqueiam a chave pelo tempo de bloqueio. O
// contador vive na memória do processo: serve a uma instalação de uma
// família (PR-18) e não exige serviço externo. Reiniciar o processo zera.

export interface OpcoesDoLimitador {
  maximo?: number
  janelaMs?: number
  bloqueioMs?: number
  /** O relógio, injetável para o teste não esperar. */
  agora?: () => number
}

interface Registro {
  falhas: number[]
  bloqueadoAte: number
}

export function criarLimitador(opcoes: OpcoesDoLimitador = {}) {
  const maximo = opcoes.maximo ?? 5
  const janelaMs = opcoes.janelaMs ?? 15 * 60_000
  const bloqueioMs = opcoes.bloqueioMs ?? 15 * 60_000
  const agora = opcoes.agora ?? Date.now
  const registros = new Map<string, Registro>()

  return {
    /** Milissegundos que faltam para a chave poder tentar de novo; 0 se pode. */
    restanteDoBloqueio(chave: string): number {
      const registro = registros.get(chave)
      if (!registro) return 0
      const restante = registro.bloqueadoAte - agora()
      if (restante > 0) return restante
      if (registro.bloqueadoAte > 0) registros.delete(chave)
      return 0
    },

    registrarFalha(chave: string): void {
      const agoraMs = agora()
      const registro = registros.get(chave) ?? { falhas: [], bloqueadoAte: 0 }
      registro.falhas = registro.falhas.filter((t) => agoraMs - t < janelaMs)
      registro.falhas.push(agoraMs)
      if (registro.falhas.length >= maximo) {
        registro.bloqueadoAte = agoraMs + bloqueioMs
      }
      registros.set(chave, registro)
    },

    registrarSucesso(chave: string): void {
      registros.delete(chave)
    },

    limpar(): void {
      registros.clear()
    },
  }
}

export type Limitador = ReturnType<typeof criarLimitador>
