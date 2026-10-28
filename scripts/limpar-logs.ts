// npm run log:limpar — descarta os logs com mais de 90 dias (PR-11).
import { RETENCAO_DIAS, descartarLogsAntigos, pastaDeLog } from '../src/lib/log-arquivo'

const pasta = pastaDeLog()
if (!pasta) {
  console.log('A gravação de log em arquivo está desligada (LOG_DIR vazio): não há pasta a limpar.')
} else {
  const apagados = descartarLogsAntigos(pasta, new Date())
  console.log(
    `${apagados.length} arquivo(s) de log com mais de ${RETENCAO_DIAS} dias descartado(s) em ${pasta}.`,
  )
}
