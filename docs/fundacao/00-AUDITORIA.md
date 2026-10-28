# Auditoria — fundacao

Data: 2026-10-28 — rodada 2 (reauditoria depois de uma volta à F3). Auditora: a mesma sessão, sem o agente `auditor-plano` neste harness; a regra "só aponta, nunca corrige" depende de disciplina.

## Histórico

A rodada 1 reprovou o plano por um achado de severidade ALTA: a PR-12 (cookie `secure`/`sameSite` e variável obrigatória ausente) não tinha task nem teste que a confirmasse. O plano foi regerado na F3: nasceu a T-04.03 (`tests/seguranca-base.test.ts`), as tasks seguintes foram renumeradas, o critério de `tests/convencoes.test.ts` ficou binário (formato `evidencia na FT-NN`) e o orquestrador passou a exigir `suite: verde` por task (compatível com os portões E1 e V2 da mergex). Voltas à F3 usadas: 1 de 2.

## Achados desta rodada

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| BAIXA | sprint-01/tasks.md | T-01.02 depende de T-01.01 sem dependência real de arquivos (caminho crítico sequencial). | Aceitável: a feature não é paralelizável e há um agente só |
| BAIXA | sprint-04/tasks.md | `docs/fundacao/` aparece como diretório em `cria` (T-04.05); o portão V9 compara arquivos. | Tratar o prefixo de diretório ao rodar o V9 |
| BAIXA | sprint-04/tasks.md | A atualização do `package-lock.json` pode exigir rede (risco já declarado na sprint). | Se a rede faltar, editar a raiz do lock e validar com `npm ls` |
| MÉDIA | sprint-03/tasks.md | T-03.01 testa a casca (componente cliente com `usePathname`) fora do runtime do Next; se a renderização no vitest não funcionar, o teste funcional precisa ficar na lógica pura de `src/lib/gaveta.ts`. | Manter a lógica de estado em `src/lib/gaveta.ts` (já declarada) e renderizar a casca só como bônus |

Conferências feitas sem achado: todos os `depende_de` apontam para ids existentes e não há ciclo; nenhuma task depende de decisão humana; os testes de T-01.01, T-03.03 e T-04.03 discriminam (fixture violador, fuso de São Paulo diferente do UTC, `NODE_ENV` production versus test); toda task tem os dois testes não vazios; a sprint 01 entrega capacidade de testar; os `arquivos` das 14 tasks cobrem os pontos de contato das 11 premissas mais PR-21 a PR-24.

VEREDITO: SIM — o plano está pronto para execução autônoma.
