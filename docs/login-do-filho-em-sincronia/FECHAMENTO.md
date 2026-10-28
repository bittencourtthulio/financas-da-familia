---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: login-do-filho-em-sincronia
origem_buildx: financas-da-familia
feature_id: FT-09
titulo: Login do filho acompanha o cadastro
tipo_trabalho: feature
fechado_em: 2026-10-28
modulo_afetado: [aplicacao, lib, testes, documentacao]
arquivos_alterados: ver ENTREGA.md
sprints: 1
tasks: 3
testes_novos: 31
suite_final: 1475
---

# Fechamento — login-do-filho-em-sincronia

## O que foi entregue

- `editarFilho` renomeia o usuário de login ligado ao filho dentro da mesma transação da edição e do rastro; sem login nada muda; o e-mail, o papel, a situação e a senha do login nunca são tocados; o login que já divergia é curado na próxima edição.
- A trilha `filho.alterado` ganha o campo `login` (rótulo "nome do login") quando o nome do usuário foi reescrito, sem e-mail nem nome antigo.
- PR-39 criada e realizada; CONVENCOES.md, MAPA.md (nove features) e PROJETO.md atualizados. Realiza a PEND-18.

## Sprints

| Sprint | Tasks | Resultado |
|---|---|---|
| sprint-01 | T-01.01, T-01.02, T-01.03 | concluído |

## Testes

31 testes novos (1444 → 1475): `tests/filhos-sincronia.test.ts` (13), `tests/filhos-sincronia-trilha.test.ts` (11) e ampliações de `premissas` e `convencoes`. `npm run verificar` terminou com código 0, `Test Files  76 passed (76)`, `Tests  1475 passed (1475)`.

## Desvios do método (honestos)

- O plano (`docs/login-do-filho-em-sincronia/`) foi escrito e commitado **depois** de o primeiro teste da T-01.01 ter sido visto falhar e o código ter ficado verde; a ordem teste-antes-do-código valeu para o código, não para os documentos do plano.
- Na T-01.02, os testes de atomicidade e de trilha passaram na primeira rodada porque o comportamento já vinha da T-01.01; só o rótulo "nome do login" foi visto falhar antes do código. Para não confiar em teste que nunca falhou, foi feita mutação manual (trocar `tx.usuario.update` por `prisma.usuario.update`): nenhum teste de comportamento a pegou, porque o adaptador SQLite do Prisma tem uma conexão só. Foi acrescentado um teste de código que exige o cliente `tx` e se viu falhar com a mutação.
- Dois testes de privacidade e a citação de linhas em `convencoes.test.ts` foram alterados porque fixavam o comportamento defeituoso; isso está explicado no commit e em `ATENCAO.md`.
- A auditoria do plano e a classificação de atenção foram feitas pela mesma sessão que implementou (não há agente `auditor-plano` nem `revisor-diff` neste harness).
- Sem navegador real: nenhuma tela mudou além de um rótulo.

## Pendências e observações

- `decisao_humana` (não bloqueante): trocar o e-mail de login de um filho.
- `decisao_humana` (não bloqueante): renomear o usuário do filho pela tela Usuários (sentido contrário); a próxima edição do filho reescreve o nome.
- `recurso_externo`: remoto git para abrir o PR.
- Observação: `npm audit` lista 2 vulnerabilidades moderadas (vitest/@vitest/mocker); o limite do projeto é `high`, código 0.
