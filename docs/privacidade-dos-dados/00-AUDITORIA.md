# Auditoria — privacidade-dos-dados

Data: 2026-10-28 — rodada 1. Auditora: a mesma sessão, sem o agente `auditor-plano` neste harness; a regra "só aponta, nunca corrige" depende de disciplina.

## Achados desta rodada

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-01/tasks.md | `tests/filhos-papeis.test.ts` varre toda função exportada de `src/servicos/filhos.ts`; pôr a exclusão ali quebraria a varredura e misturaria assuntos. | Serviço novo `src/servicos/privacidade.ts` (D-08) com varredura própria em `tests/privacidade-papeis.test.ts` |
| MÉDIA | sprint-02/tasks.md | `tests/filhos-acoes.test.ts` exige que a tabela de ações sensíveis cubra toda ação exportada; a ação nova a quebra. | A T-02.01 amplia a tabela ANTES de escrever a ação (teste primeiro) |
| MÉDIA | sprint-01/tasks.md | O nome do filho vive em texto JSON na trilha e pode ter mudado de nome; achar as linhas pelo nome deixaria o nome antigo. | D-11: achar por `entidadeId` e `filhoId` no `detalhe`; teste com filho renomeado e inspeção do banco inteiro |
| MÉDIA | sprint-03/tasks.md | A T-01.01, T-01.02 e T-02.01 deslocam linhas citadas no `CONVENCOES.md` (`atividade.ts`, `autenticacao.ts`, `acoes.ts`, `tests/filhos-acoes.test.ts`). | A T-03.02 reconfere todas as citações; `tests/convencoes.test.ts` as valida |
| BAIXA | sprint-02/tasks.md | Sem navegador real, a aparência dos dois temas, do celular e do download não é exercitada. | Registrado como não exercitado; prova por renderização, CSS lido por teste e servidor de produção com `fetch` |
| BAIXA | sprint-01/tasks.md | A transação de exclusão não prova falha no meio com o SQLite real sem dublê. | Teste força o erro dentro da transação (ator inexistente no rastro) e confere que nada foi apagado |

Conferências feitas sem achado: todos os `depende_de` apontam para ids existentes e não há ciclo; nenhuma task depende de decisão humana; toda task tem os dois testes não vazios e discriminantes (campo proibido injetado, hash real procurado no texto, filho real negado, nome errado, token antigo, banco inteiro inspecionado, filho renomeado); o escopo não invade o fora de escopo do PROJETO.md (família inteira, adulto, CSV, importação, consentimento) nem a FT-08; PR-02 tem teste de centavos inteiros no arquivo; PR-10 e PR-25 têm teste de rastro sem conteúdo; a tela cobre vazio, carregando (herdado e do botão) e erro; os `arquivos` das 7 tasks cobrem os pontos de contato; nenhuma dependência nova nem migration.

Nenhum achado de severidade ALTA: nenhuma volta à F3 (0 de 2 usadas).

VEREDITO: SIM — o plano está pronto para execução autônoma.
