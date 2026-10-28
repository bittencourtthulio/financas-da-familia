Backup, restauracao e saude (FT-08 do projeto `financas-da-familia`): quem opera o sistema gera um backup do banco e o restaura com um comando, consulta `/api/saude`, e o log passa a ser estruturado e descartado apos 90 dias.

**Base:** `feat/ft-07-privacidade-dos-dados` (empilhada sobre as branches das FT-01 a FT-06; nada foi mergeado em `main`). Este PR mira a branch da FT-07 (ou `main`, depois que as anteriores forem mergeadas).

## O que muda para quem opera

- `npm run backup` cria `backups/backup-AAAA-MM-DD-HHMMSS.db`, uma copia consistente do banco (pode ser feita com o sistema no ar). **O arquivo leva hashes de senha e todo o dinheiro da casa**: pasta 0700, arquivo 0600, fora do git, sem criptografia. Guardar com cuidado.
- `npm run restaurar -- <arquivo>` (com o sistema **parado**) so aceita SQLite integro com as seis tabelas do sistema; preserva o banco atual em `backups/antes-da-restauracao-*.db` antes de trocar; arquivo invalido e recusado sem tocar no banco.
- `GET /api/saude` e publica e responde `200 {"status":"ok","banco":"ok"}` ou `503 {"status":"indisponivel","banco":"falha"}`. Sem versao, caminho, usuario nem pilha.
- Log em JSON por linha (`nivel`, `instante`, `evento`, `contexto`), na saida padrao e em `logs/app-AAAA-MM-DD.log`. Nunca grava senha, hash, token, e-mail nem valor em dinheiro. Arquivos com mais de 90 dias sao descartados ao subir o servidor e por `npm run log:limpar`.
- Erro inesperado mostra "Nao foi possivel concluir" com um codigo de 12 caracteres; a linha `erro.inesperado` do log tem o mesmo codigo, o nome e o codigo do erro, e nunca a mensagem nem a pilha.
- Configuracao invalida (`DATABASE_URL`, `JWT_SECRET`, `JWT_TTL_SEGUNDOS`) imprime todos os problemas sem repetir valor e **encerra o processo com codigo 1**. Achado: o Next anuncia "Ready" antes do gancho de start e, se ele so lancar, segue de pe sem atender; por isso o `process.exit(1)`.

## O que muda no codigo

- `src/lib/log.ts`, `src/lib/log-arquivo.ts`, `src/lib/chaves-proibidas.ts` (lista movida de `src/servicos/atividade.ts`, uma so para trilha e log), `src/lib/backup.ts`, `src/lib/restauracao.ts`, `src/lib/erros.ts` (`mensagemSegura`, `registrarErroInesperado`), `src/lib/ambiente.ts` (`validarAmbiente`).
- `src/servicos/saude.ts`, `src/app/api/saude/route.ts`, `src/instrumentation.ts`.
- `scripts/backup.ts`, `scripts/restaurar.ts`, `scripts/limpar-logs.ts`.
- `src/app/acoes.ts` e as duas rotas de API que tinham `console.error(erro)`.
- Dependencia: `better-sqlite3` 12.11.1 (ja estava na arvore, transitivo) e `@types/better-sqlite3` 9.6.0 em desenvolvimento. Nenhuma migration.
- `README.md` (runbook), `.gitignore`, `.env.example` (`LOG_DIR`), `docs/stack/CONVENCOES.md`, `docs/projeto/PREMISSAS.md` (PR-11, PR-13, PR-14 realizadas; PR-36 a PR-38 novas), `docs/projeto/MAPA.md`, `docs/projeto/PROJETO.md`.

## Onde pedir olho

Ler linha a linha: `src/lib/restauracao.ts`, `src/lib/backup.ts`, `src/app/api/saude/route.ts` e `src/servicos/saude.ts`, `src/lib/log.ts` e `src/lib/chaves-proibidas.ts`, `src/instrumentation.ts`, `src/lib/erros.ts`. Lista completa em [ATENCAO.md](ATENCAO.md).

## Como foi testado

TDD em 10 tasks e 3 sprints, um commit por task. Suite: 1444 testes (120 novos). O ciclo cria dados, faz backup, altera e apaga, restaura e confere cada tabela linha a linha e o login com a senha original. O descarte de log e testado com datas injetadas (89, 90, 91 e 400 dias). A saude e provada no servidor de producao de verdade, com banco bom (200) e com banco inacessivel (503). O start com configuracao invalida e provado com `next start` real (codigo 1).

## Decisoes em nome da familia

PR-36 (formato do log, o que ele redige, erro com codigo), PR-37 (forma do backup e da restauracao, sem rotacao nem criptografia) e PR-38 (saude publica e start que falha). Decisoes D-01 a D-12 em [00-DECISOES.md](00-DECISOES.md).

## Pendencias

- `decisao_humana`: agendamento automatico do backup e retencao dos arquivos de backup antigos.
- `decisao_humana`: criptografia do backup.
- `decisao_humana`: restauracao pela interface.
- `recurso_externo`: backup remoto ou em nuvem.
- `recurso_externo`: sem remoto git, o PR nao foi aberto; esta descricao esta pronta para colar.
- `trabalho_novo`: renomear o filho nao renomeia o usuario de login dele (FT-05).
