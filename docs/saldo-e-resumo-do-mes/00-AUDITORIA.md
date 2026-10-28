# Auditoria — saldo-e-resumo-do-mes

Data: 2026-10-28 — rodada 1. Auditora: a mesma sessão, sem o agente `auditor-plano` neste harness; a regra "só aponta, nunca corrige" depende de disciplina.

## Achados desta rodada

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-02/tasks.md | `tests/rotas.test.ts` afirma o texto do painel vazio antigo ("Ainda não há movimentações para mostrar") para o adulto; a T-02.02 o torna falso. | A T-02.02 reescreve essa afirmação no mesmo commit (já listada em `altera`) |
| MÉDIA | sprint-03/tasks.md | A T-02.02 e a T-03.01 desloc am linhas citadas no `CONVENCOES.md` (`sessao-servidor.ts`, `acoes.ts` não mudam, mas `rotas.test.ts` e `page.tsx` sim). | A T-03.01 reconfere todas as citações; `tests/convencoes.test.ts` as valida |
| MÉDIA | sprint-01/tasks.md | O `groupBy` do Prisma sobre SQLite pode devolver `_sum` como `null` ou `number`; o plano supõe `number`. | A T-01.01 trata `null` como zero e testa mês vazio |
| BAIXA | sprint-01/tasks.md | O varredor `tests/lancamentos-papeis.test.ts` só enxerga `lancamentos.ts`; o resumo precisa do seu próprio. | Já previsto: `tests/resumo-papeis.test.ts` varre as exportações de `resumo.ts` |
| BAIXA | sprint-02/tasks.md | A T-02.01 é a maior task (dois componentes, links, estilos). | Aceitável: um só caminho de código e um teste de tela; ordem interna é links, seletor, resumo, estilos |

Conferências feitas sem achado: todos os `depende_de` apontam para ids existentes e não há ciclo; nenhuma task depende de decisão humana (a pendência `decisao_humana` do saldo acumulado é não bloqueante e tem opção reversível, PR-29); toda task tem os dois testes não vazios e discriminantes (0,10 + 0,20, mês limite, virada de ano, fuso, mês inválido, papel desconhecido, saldo negativo sem depender de cor, filho sem dado financeiro); o escopo não invade FT-03 (nenhuma escrita de lançamento), FT-05 e FT-06 (nenhum saldo de filho), nem o fora de escopo do PROJETO.md (nenhum acumulado, orçamento, comparativo ou gráfico de evolução); PR-02 tem teste que proíbe ponto flutuante no serviço novo; a tela cobre vazio, carregando (herdado) e erro (herdado); os `arquivos` das 5 tasks cobrem os pontos de contato (inclui `tests/rotas.test.ts` e `README.md`); nenhuma migration e nenhuma dependência nova.

Nenhum achado de severidade ALTA: nenhuma volta à F3 (0 de 2 usadas).

VEREDITO: SIM — o plano está pronto para execução autônoma.
