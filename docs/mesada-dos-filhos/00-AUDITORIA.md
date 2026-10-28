# Auditoria — mesada-dos-filhos

Data: 2026-10-28 — rodada 1. Auditora: a mesma sessão, sem o agente `auditor-plano` neste harness; a regra "só aponta, nunca corrige" depende de disciplina.

## Achados desta rodada

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-01/tasks.md | `tests/filhos-papeis.test.ts` varre toda função exportada de `src/servicos/filhos.ts`; pôr a mesada ali quebraria a varredura e misturaria assuntos. | Serviço novo `src/servicos/mesada.ts` (D-08), com a própria varredura em `tests/mesada-papeis.test.ts` |
| MÉDIA | sprint-02/tasks.md | `tests/filhos-acoes.test.ts` exige que a tabela de ações sensíveis cubra toda ação exportada; três ações novas a quebram. | A T-02.01 amplia a tabela ANTES de escrever as ações (teste primeiro) |
| MÉDIA | sprint-02/tasks.md | `tests/filhos-mesada.test.ts` afirma que `/mesada` não tem saldo, extrato, `<form` nem `<button`; a página agora tem saldo e extrato. | A T-02.03 reescreve as afirmações no mesmo commit (já em `altera`): continua sem formulário e botão, passa a ter saldo e extrato |
| MÉDIA | sprint-03/tasks.md | A T-01.01, T-02.01 e T-02.02 deslocam linhas citadas no `CONVENCOES.md` (`tests/ajuda.ts`, `acoes.ts`, `atividade.ts`). | A T-03.02 reconfere todas as citações; `tests/convencoes.test.ts` as valida |
| BAIXA | sprint-01/tasks.md | A T-01.02 junta serviço, saldo e isolamento em quatro arquivos de teste. | Aceitável: um só arquivo de código; ordem interna é validação, escrita, leitura, papéis |
| BAIXA | sprint-02/tasks.md | Sem navegador real, a aparência dos dois temas e do celular não é exercitada. | Registrado como não exercitado; prova por renderização, CSS lido por teste e servidor de produção |

Conferências feitas sem achado: todos os `depende_de` apontam para ids existentes e não há ciclo; nenhuma task depende de decisão humana; toda task tem os dois testes não vazios e discriminantes (0,10 + 0,20, extrato de mil movimentos, filho real negado em cada função, id de irmão igual a id inexistente, ação executada como filho, adulto e visitante, servidor real com os dois irmãos); o escopo não invade a FT-07 (nenhum apagar de filho nem exportar), a FT-08 nem o fora de escopo do PROJETO.md (mesada automática, aprovação, metas, juros, tarefas); PR-02 tem teste que proíbe ponto flutuante no serviço novo e no esquema; PR-10 e PR-25 têm teste de rastro sem valor; a tela cobre vazio, carregando (herdado) e erro (herdado); os `arquivos` das 7 tasks cobrem os pontos de contato; nenhuma dependência nova.

Nenhum achado de severidade ALTA: nenhuma volta à F3 (0 de 2 usadas).

VEREDITO: SIM — o plano está pronto para execução autônoma.
