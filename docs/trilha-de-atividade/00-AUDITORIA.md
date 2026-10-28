# Auditoria — trilha-de-atividade

Data: 2026-10-28 — rodada 1. Auditora: a mesma sessão, sem o agente `auditor-plano` neste harness; a regra "só aponta, nunca corrige" depende de disciplina.

## Achados desta rodada

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-01/tasks.md | A transação interativa do Prisma com o adaptador `better-sqlite3` não tem uso prévio no repositório (D-04 depende dela). | O teste de integração da T-01.02 já prova commit e rollback; se falhar, volta-se à D-04 com registro em `00-BLOQUEIOS.md`, sem pergunta ao usuário |
| MÉDIA | sprint-02/tasks.md | A T-02.01 altera `src/servicos/usuarios.ts` e desloca as linhas citadas no `CONVENCOES.md`. | A T-02.01 já lista o `CONVENCOES.md` em `altera`; a T-03.03 reconfere as citações |
| BAIXA | sprint-01/tasks.md | O nome da migration está como `NNNN_atividade`. | O Prisma gera o prefixo de data ao criar; registrar o nome real na entrega |
| BAIXA | sprint-03/tasks.md | A T-03.01 altera `tests/ajuda-estatica.ts` sem que o teste dependa disso. | Aceitável: só entra se a guarda de tokens precisar varrer o novo componente |

Conferências feitas sem achado: todos os `depende_de` apontam para ids existentes e não há ciclo; nenhuma task depende de decisão humana; as três tasks de serviço e as duas de ligação têm teste que discrimina (rollback, chave proibida, papel igual ao atual, último administrador); toda task tem os dois testes não vazios; a sprint 01 entrega o serviço sem interface; os critérios de PR-10 (quem, o quê, quando; nunca senha, hash, token, dado financeiro) e PR-11 (sem remoção) têm teste; a tela cobre vazio, carregando (herdado, com teste) e erro (herdado); não há valor monetário; os `arquivos` das 8 tasks cobrem os pontos de contato.

Nenhum achado de severidade ALTA: nenhuma volta à F3 (0 de 2 usadas).

VEREDITO: SIM — o plano está pronto para execução autônoma.
