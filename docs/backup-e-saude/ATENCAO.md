# Onde gastar atencao — backup-e-saude

Branch: `feat/ft-08-backup-e-saude` -> `feat/ft-07-privacidade-dos-dados` (empilhada sobre as branches das FT-01 a FT-06; nada foi mergeado)
Data: 2026-10-28

**56 arquivos — 8 olho obrigatorio, 17 leitura rapida, 31 dispensavel**

A classificacao e derivada de evidencia registrada, nunca de sensacao. Tamanho de diff nao e criterio. (Feita pela mesma sessao que implementou, sem o agente `revisor-diff` neste harness; na duvida, sobe para a faixa mais rigorosa.)

## OLHO OBRIGATORIO — ler linha a linha

| Arquivo | Mudanca | Por que |
|---|---|---|
| `src/lib/restauracao.ts` | A | sobrescreve o banco de producao: validacao antes de tocar, copia previa, troca atomica, limpeza de journal. Um erro aqui perde o historico da familia |
| `src/lib/backup.ts` | A | gera o arquivo que leva hashes de senha e todo o dinheiro da casa: permissoes 0700/0600, nome sem sobrescrita, `VACUUM INTO` |
| `src/app/api/saude/route.ts` e `src/servicos/saude.ts` | A | rota PUBLICA sem sessao: o corpo precisa ficar so com `status` e `banco`, sem versao, caminho nem pilha |
| `src/lib/log.ts` e `src/lib/chaves-proibidas.ts` | A | o que nunca pode ir para o log (segredo, hash, e-mail, valor): a redacao e a ultima barreira; a lista agora e compartilhada com a trilha |
| `src/instrumentation.ts` | A | chama `process.exit(1)` no start; tem de ser so com configuracao invalida, e nunca imprimir o valor de uma variavel |
| `src/lib/erros.ts` | M | decide o que o usuario ve de um erro inesperado (frase generica e codigo, nunca mensagem nem pilha) |

## LEITURA RAPIDA — conferir a intencao

| Arquivo | Por que |
|---|---|
| `package.json` e `package-lock.json` | `better-sqlite3` 12.11.1 passa a ser dependencia direta (ja existia no arvore, transitiva); `@types/better-sqlite3` em desenvolvimento; tres scripts |
| `.gitignore` | `backups/` e `logs/` fora do git |
| `.env.example` | variavel opcional `LOG_DIR`, comentada |
| `README.md` | runbook de backup, restauracao, saude, log e configuracao: texto que governa a operacao |
| `docs/projeto/PREMISSAS.md` | PR-36, PR-37, PR-38 novas; PR-11, PR-13, PR-14 realizadas |
| `docs/stack/CONVENCOES.md` | secoes 6 e 7 reescritas com evidencia |
| `src/app/acoes.ts`, `src/app/api/sessao/renovar/route.ts`, `src/app/api/privacidade/exportar/route.ts` | trocam `console.error(erro)` por `mensagemSegura` / `registrarErroInesperado`; a resposta de erro ganha o campo `codigo` |
| `src/lib/log-arquivo.ts` | descarte de log por nome de arquivo: confere que so apaga `app-AAAA-MM-DD.log` |
| `src/lib/ambiente.ts` | `problemasDeAmbiente` e `validarAmbiente` |
| `src/servicos/atividade.ts` | so troca a definicao local das chaves proibidas pelo import |
| `scripts/backup.ts`, `scripts/restaurar.ts`, `scripts/limpar-logs.ts` | finos; imprimem o aviso de guarda do backup |
| `docs/stack/LACUNAS.md` | L-01 marcada como resolvida |

## DISPENSAVEL — a maquina ja provou

Documentos do processo (`docs/backup-e-saude/`, `docs/projeto/MAPA.md`, `docs/projeto/PROJETO.md`) e testes (`tests/log*.test.ts`, `tests/erro-*.test.ts`, `tests/saude*.test.ts`, `tests/ambiente-start.test.ts`, `tests/backup*.test.ts`, `tests/restauracao.test.ts`, `tests/banco-temporario.ts`, ampliacoes em `tests/rotas.test.ts`, `tests/convencoes.test.ts`, `tests/premissas.test.ts`, `tests/setup.ts`).

## O que nenhum teste prova

- Restaurar com o servidor de producao rodando: o runbook manda parar o sistema, e nada impede quem esquecer. O efeito seria o servidor ler o arquivo antigo.
- Um disco cheio no meio do backup ou da restauracao (o codigo apaga o parcial, mas isso nao foi simulado).
- Navegador real: a feature nao tem tela; a tela de erro ja existia.
