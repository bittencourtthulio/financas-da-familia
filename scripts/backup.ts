// npm run backup — gera um backup consistente do banco SQLite (PR-13).
import path from 'node:path'
import { ErroDeBackup, PASTA_DE_BACKUP_PADRAO, caminhoDoBanco, gerarBackup } from '../src/lib/backup'

try {
  const pasta = path.resolve(process.cwd(), process.env.BACKUP_DIR || PASTA_DE_BACKUP_PADRAO)
  const r = gerarBackup({ banco: caminhoDoBanco(process.env.DATABASE_URL), pasta })
  console.log(`Backup gerado: ${r.caminho} (${r.tamanho} bytes).`)
  console.log('Guarde este arquivo com cuidado: ele leva os hashes de senha e todo o dinheiro da família.')
  console.log('A pasta de backups fica fora do git (.gitignore); não a versione nem a envie por canal aberto.')
  console.log('Para restaurar: npm run restaurar -- <arquivo>')
} catch (erro) {
  console.error(erro instanceof ErroDeBackup ? erro.message : 'Não foi possível gerar o backup.')
  process.exit(1)
}
