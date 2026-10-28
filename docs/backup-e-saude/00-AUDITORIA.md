# Auditoria — backup-e-saude

Data: 2026-10-28 — rodada 1. Auditora: a mesma sessão, sem o agente `auditor-plano` neste harness; a regra "só aponta, nunca corrige" depende de disciplina.

## Achados desta rodada

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-01/tasks.md | A lista de chaves proibidas vive em `src/servicos/atividade.ts`; `src/lib` não pode importar serviço. | T-01.01 move a lista para `src/lib/chaves-proibidas.ts` e o serviço passa a importá-la; `tests/atividade-dados.test.ts` continua guardando a trilha. |
| MÉDIA | sprint-02/tasks.md | Falha ao abrir o banco acontece no import de `src/lib/prisma.ts`; uma rota que o importa no topo daria 500, não 503. | T-02.01 importa o Prisma sob demanda dentro do `try`; teste com servidor real e `DATABASE_URL` inválida. |
| MÉDIA | sprint-02/tasks.md | Não sei se `register()` derrubando o start é respeitado pelo `next start`. | T-02.02 verifica com processo real e documenta o comportamento observado; se não derrubar, replaneja. |
| MÉDIA | sprint-03/tasks.md | `tests/convencoes.test.ts` falha se linhas citadas deslocarem; `package.json`, `tests/rotas.test.ts` e `src/app/acoes.ts` mudam. | Teste novo de rotas vai no fim de `tests/rotas.test.ts`; T-03.04 reconfere todas as citações. |
| BAIXA | sprint-03/tasks.md | Teste de restauração sobre o banco compartilhado da suíte seria instável (cliente com arquivo aberto). | D-12: banco temporário próprio. |
| BAIXA | sprint-02/tasks.md | Sem navegador real; a feature não tem tela. | Registrado como não exercitado; prova por servidor de produção com `fetch`. |

Conferências sem achado: `depende_de` apontam para ids existentes, sem ciclo; nenhuma task depende de decisão humana; toda task tem os dois testes e critério verificável.

Nenhum achado de severidade ALTA: nenhuma volta à F3 (0 de 2 usadas).

VEREDITO: SIM — o plano está pronto para execução autônoma.
