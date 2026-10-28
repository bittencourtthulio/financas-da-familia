# Auditoria — login-do-filho-em-sincronia

Data: 2026-10-28 — rodada 1. Auditora: a mesma sessão que planejou e implementou, sem o agente `auditor-plano` neste harness; a regra "só aponta, nunca corrige" depende de disciplina. O plano foi escrito depois de o primeiro teste da T-01.01 já ter sido visto falhar e passar (desvio registrado em `FECHAMENTO.md`).

## Achados desta rodada

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-01/tasks.md | Acrescentar `login` aos `campos` muda o detalhe de `filho.alterado` para filho com login; três testes antigos (`privacidade-exclusao`, `privacidade-banco`, e a citação em `convencoes`) fixam o comportamento anterior. | Atualizar esses testes na task que muda o comportamento e dizer por quê; não esconder a mudança. |
| MÉDIA | sprint-01/tasks.md | Inserir linhas em `editarFilho` desloca as citações de `src/servicos/filhos.ts` em `CONVENCOES.md` e em `tests/convencoes.test.ts`. | Reconferir as quatro citações depois do código; `convencoes.test.ts` verde. |
| BAIXA | sprint-01/tasks.md | A tela Usuários ainda deixa renomear o usuário de um filho, e a próxima edição do filho sobrescreve esse nome. | Registrar como pendência (`decisao_humana`); não tocar nesta feature. |
| BAIXA | sprint-01/tasks.md | Falha no meio da transação é simulada com `vi.spyOn(registrarAtividade)`, não com falha real de disco. | Aceito, é o padrão do repositório (`tests/usuarios-atividade.test.ts`). |

Conferências sem achado: `depende_de` aponta para ids existentes, sem ciclo; nenhuma task depende de decisão humana; toda task tem os dois testes e critério verificável; FT-05 e FT-07 estão entregues.

Nenhum achado ALTA.

VEREDITO: SIM — o plano está pronto para execução autônoma.
