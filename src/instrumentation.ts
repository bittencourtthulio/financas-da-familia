// Gancho de start do Next (PR-14, PR-11): roda uma vez quando o servidor Node
// sobe. Configuração inválida derruba o start aqui, em vez de aparecer só na
// primeira pessoa que tentar entrar, e o log com mais de 90 dias é descartado.
//
// O Next anuncia "Ready" antes de rodar este gancho e, se ele lançar, só
// registra o erro e segue de pé, sem ter como atender. Por isso a falha de
// configuração imprime a mensagem e encerra o processo com código 1.

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { validarAmbiente } = await import('@/lib/ambiente')
  try {
    validarAmbiente()
  } catch (erro) {
    // A mensagem de validarAmbiente nunca traz valor de variável.
    console.error(erro instanceof Error ? erro.message : 'Configuração inválida.')
    process.exit(1)
  }

  const { descartarLogsAntigos, pastaDeLog } = await import('@/lib/log-arquivo')
  const { log } = await import('@/lib/log')
  const pasta = pastaDeLog()
  const descartados = pasta ? descartarLogsAntigos(pasta, new Date()).length : 0
  log.info('servidor.iniciado', { descartados })
}
