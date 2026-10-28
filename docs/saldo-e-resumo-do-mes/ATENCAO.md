# Onde gastar atencao — saldo-e-resumo-do-mes

Branch: `feat/ft-04-saldo-e-resumo-do-mes` -> `feat/ft-03-lancamentos-da-casa` (empilhada sobre `feat/ft-02-trilha-de-atividade` e `feat/ft-01-fundacao`; nada foi mergeado em `main`)
Data: 2026-10-28

**34 arquivos — 3 olho obrigatorio, 7 leitura rapida, 24 dispensavel**

A classificacao e derivada de evidencia registrada, nunca de sensacao. Tamanho de diff nao e criterio. (Classificacao feita pela mesma sessao que implementou, sem o agente `revisor-diff` neste harness; a regra "sobe para a mais rigorosa na duvida" foi aplicada.)

## OLHO OBRIGATORIO — ler linha a linha

| Arquivo | Mudanca | Tamanho | Por que |
|---|---|---|---|
| `prisma/demonstracao.ts` | M/A | +33/-7 | seed com dados fixos de demonstracao; guarda contra producao preservada |
| `src/app/(sistema)/page.tsx` | M/A | +37/-9 | autorizacao: decide quem recebe dado financeiro na pagina de todos os papeis; filho nao dispara a consulta |
| `src/servicos/resumo.ts` | M/A | +117/-0 | regra de negocio e dinheiro: soma de centavos por groupBy, saldo, validacao do mes, guarda de papel como primeira linha |

## LEITURA RAPIDA — conferir a intencao

| Arquivo | Mudanca | Tamanho | Por que |
|---|---|---|---|
| `README.md` | M/A | +7/-2 | convencao ou premissa nova; texto que governa as proximas features |
| `docs/projeto/PREMISSAS.md` | M/A | +16/-3 | convencao ou premissa nova; PR-29 e PR-08 realizada |
| `docs/stack/CONVENCOES.md` | M/A | +3/-2 | convencao ou premissa nova; citacoes arquivo:linha conferidas por teste |
| `src/componentes/ResumoDoMes.tsx` | M/A | +111/-0 | tela ou componente novo que renderiza valor financeiro; saldo negativo sem depender de cor |
| `src/componentes/SeletorDeMes.tsx` | M/A | +37/-0 | tela ou componente novo; navegacao por link |
| `src/estilos/global.css` | M/A | +75/-0 | apoio de estilo; so var(--token), conferido por teste |
| `src/lib/resumo-links.ts` | M/A | +35/-0 | logica pura de endereco e percentual inteiro; coberta por teste |

## DISPENSAVEL — a maquina ja provou

Documentos do processo (`docs/saldo-e-resumo-do-mes/`, `docs/projeto/MAPA.md`, `docs/projeto/PROJETO.md`) e testes (`tests/resumo.test.ts`, `tests/resumo-papeis.test.ts`, `tests/resumo-tela.test.ts`, e ampliacoes em `tests/demonstracao.test.ts`, `tests/rotas.test.ts`, `tests/premissas.test.ts`, `tests/convencoes.test.ts`).

| Arquivo | Tamanho |
|---|---|
| `docs/projeto/MAPA.md` | +4/-4 |
| `docs/saldo-e-resumo-do-mes/00-AUDITORIA.md` | +19/-0 |
| `docs/saldo-e-resumo-do-mes/00-BLOQUEIOS.md` | +26/-0 |
| `docs/saldo-e-resumo-do-mes/00-DECISOES.md` | +153/-0 |
| `docs/saldo-e-resumo-do-mes/ATENCAO.md` | +0/-0 |
| `docs/saldo-e-resumo-do-mes/ENTREGA.md` | +0/-0 |
| `docs/saldo-e-resumo-do-mes/FECHAMENTO.md` | +0/-0 |
| `docs/saldo-e-resumo-do-mes/ORQUESTRADOR.md` | +83/-0 |
| `docs/saldo-e-resumo-do-mes/PR.md` | +0/-0 |
| `docs/saldo-e-resumo-do-mes/QA-PACOTE.md` | +0/-0 |
| `docs/saldo-e-resumo-do-mes/base/00-INDICE.md` | +32/-0 |
| `docs/saldo-e-resumo-do-mes/base/00-LACUNAS.md` | +10/-0 |
| `docs/saldo-e-resumo-do-mes/base/01-dados-e-servico.md` | +25/-0 |
| `docs/saldo-e-resumo-do-mes/base/02-interface.md` | +24/-0 |
| `docs/saldo-e-resumo-do-mes/sprint-01/tasks.md` | +67/-0 |
| `docs/saldo-e-resumo-do-mes/sprint-02/tasks.md` | +67/-0 |
| `docs/saldo-e-resumo-do-mes/sprint-03/tasks.md` | +51/-0 |
| `tests/convencoes.test.ts` | +49/-1 |
| `tests/demonstracao.test.ts` | +90/-8 |
| `tests/premissas.test.ts` | +28/-0 |
| `tests/resumo-papeis.test.ts` | +62/-0 |
| `tests/resumo-tela.test.ts` | +240/-0 |
| `tests/resumo.test.ts` | +393/-0 |
| `tests/rotas.test.ts` | +88/-3 |
