// npm run restaurar -- <arquivo> — restaura o banco SQLite de um backup (PR-13).
import path from 'node:path'
import { ErroDeBackup, PASTA_DE_BACKUP_PADRAO, caminhoDoBanco } from '../src/lib/backup'
import { restaurarBackup } from '../src/lib/restauracao'

const arquivo = process.argv[2]
if (!arquivo) {
  console.error('Informe o arquivo de backup: npm run restaurar -- backups/backup-AAAA-MM-DD-HHMMSS.db')
  process.exit(1)
}

try {
  const pasta = path.resolve(process.cwd(), process.env.BACKUP_DIR || PASTA_DE_BACKUP_PADRAO)
  const r = restaurarBackup({
    arquivo: path.resolve(process.cwd(), arquivo),
    banco: caminhoDoBanco(process.env.DATABASE_URL),
    pasta,
  })
  console.log(`Banco restaurado de ${arquivo}.`)
  if (r.preservado) console.log(`O banco que existia antes foi preservado em: ${r.preservado}`)
  console.log('O sistema precisa estar parado durante a restauração: reinicie-o agora para ele ler o banco restaurado.')
} catch (erro) {
  console.error(erro instanceof ErroDeBackup ? erro.message : 'Não foi possível restaurar o backup.')
  process.exit(1)
}
