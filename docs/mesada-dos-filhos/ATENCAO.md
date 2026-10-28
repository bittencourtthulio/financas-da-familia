# Onde gastar atencao — mesada-dos-filhos

Branch: `feat/ft-06-mesada-dos-filhos` -> `feat/ft-05-filhos-da-familia` (empilhada sobre `feat/ft-04-saldo-e-resumo-do-mes`, `feat/ft-03-lancamentos-da-casa`, `feat/ft-02-trilha-de-atividade` e `feat/ft-01-fundacao`; nada foi mergeado em `main`)
Data: 2026-10-28

**60 arquivos — 8 olho obrigatorio, 16 leitura rapida, 36 dispensavel**

A classificacao e derivada de evidencia registrada, nunca de sensacao. Tamanho de diff nao e criterio. (Classificacao feita pela mesma sessao que implementou, sem o agente `revisor-diff` neste harness; a regra "sobe para a mais rigorosa na duvida" foi aplicada.)

## OLHO OBRIGATORIO — ler linha a linha

| Arquivo | Mudanca | Tamanho | Por que |
|---|---|---|---|
| `prisma/demonstracao.ts` | M/A | +62/-3 | seed com dados ficticios de demonstracao; guarda contra producao preservada |
| `prisma/migrations/20261028190000_mesada/migration.sql` | M/A | +15/-0 | migration: tabela movimentos_de_mesada, INTEGER, Cascade |
| `prisma/schema.prisma` | M/A | +25/-0 | esquema de dado de menor; valor em Int, chave estrangeira com Cascade |
| `src/app/(sistema)/filhos/[id]/mesada/[movimentoId]/page.tsx` | M/A | +58/-0 | tela do responsavel; confere que o movimento e do filho da URL |
| `src/app/(sistema)/filhos/[id]/mesada/page.tsx` | M/A | +77/-0 | tela do responsavel com dado de menor; guarda de pagina |
| `src/app/(sistema)/mesada/page.tsx` | M/A | +14/-8 | autorizacao: pagina do filho sem id; decide o que um filho ve |
| `src/app/acoes.ts` | M/A | +67/-0 | autorizacao: tres acoes de escrita com a guarda do responsavel fora do try |
| `src/servicos/mesada.ts` | M/A | +327/-0 | regra de negocio, dinheiro de menor, saldo por soma de inteiros, autorizacao e isolamento entre irmaos |

## LEITURA RAPIDA — conferir a intencao

| Arquivo | Mudanca | Tamanho | Por que |
|---|---|---|---|
| `README.md` | M/A | +20/-7 | convencao ou premissa nova; texto que governa as proximas features |
| `docs/projeto/PREMISSAS.md` | M/A | +29/-3 | convencao ou premissa nova; texto que governa as proximas features |
| `docs/stack/CONVENCOES.md` | M/A | +8/-6 | convencao ou premissa nova; texto que governa as proximas features |
| `src/app/(sistema)/filhos/[id]/page.tsx` | M/A | +3/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/app/(sistema)/filhos/page.tsx` | M/A | +3/-1 | tela, componente ou logica pura nova; coberta por teste |
| `src/app/formularios.ts` | M/A | +9/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/componentes/ApagarMovimento.tsx` | M/A | +50/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/componentes/CamposDeMovimento.tsx` | M/A | +70/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/componentes/ExtratoDeMesada.tsx` | M/A | +71/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/componentes/ListaDeFilhos.tsx` | M/A | +17/-1 | tela, componente ou logica pura nova; coberta por teste |
| `src/componentes/MesadaDoFilho.tsx` | M/A | +21/-9 | tela, componente ou logica pura nova; coberta por teste |
| `src/componentes/PaginacaoDoExtrato.tsx` | M/A | +29/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/componentes/SaldoDaMesada.tsx` | M/A | +40/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/estilos/global.css` | M/A | +32/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/lib/atividade.ts` | M/A | +12/-1 | tela, componente ou logica pura nova; coberta por teste |
| `src/lib/mesada.ts` | M/A | +66/-0 | tela, componente ou logica pura nova; coberta por teste |

## DISPENSAVEL — a maquina ja provou

Documentos do processo (`docs/mesada-dos-filhos/`, `docs/projeto/MAPA.md`, `docs/projeto/PROJETO.md`) e testes (`tests/mesada*.test.ts`, e ampliacoes em `tests/filhos-acoes.test.ts`, `tests/filhos-mesada.test.ts`, `tests/atividade-dados.test.ts`, `tests/demonstracao.test.ts`, `tests/premissas.test.ts`, `tests/convencoes.test.ts`, `tests/ajuda.ts`).

| Arquivo | Tamanho |
|---|---|
| `docs/mesada-dos-filhos/00-AUDITORIA.md` | +20/-0 |
| `docs/mesada-dos-filhos/00-BLOQUEIOS.md` | +38/-0 |
| `docs/mesada-dos-filhos/00-DECISOES.md` | +170/-0 |
| `docs/mesada-dos-filhos/ATENCAO.md` | +0/-0 |
| `docs/mesada-dos-filhos/ENTREGA.md` | +0/-0 |
| `docs/mesada-dos-filhos/FECHAMENTO.md` | +0/-0 |
| `docs/mesada-dos-filhos/ORQUESTRADOR.md` | +85/-0 |
| `docs/mesada-dos-filhos/PR.md` | +0/-0 |
| `docs/mesada-dos-filhos/QA-PACOTE.md` | +0/-0 |
| `docs/mesada-dos-filhos/base/00-INDICE.md` | +32/-0 |
| `docs/mesada-dos-filhos/base/00-LACUNAS.md` | +10/-0 |
| `docs/mesada-dos-filhos/base/01-dados-e-servico.md` | +26/-0 |
| `docs/mesada-dos-filhos/base/02-interface.md` | +24/-0 |
| `docs/mesada-dos-filhos/sprint-01/tasks.md` | +74/-0 |
| `docs/mesada-dos-filhos/sprint-02/tasks.md` | +97/-0 |
| `docs/mesada-dos-filhos/sprint-03/tasks.md` | +74/-0 |
| `docs/projeto/MAPA.md` | +4/-4 |
| `docs/projeto/PROJETO.md` | +0/-0 |
| `prisma/seed.ts` | +1/-0 |
| `tests/ajuda.ts` | +1/-0 |
| `tests/atividade-dados.test.ts` | +4/-1 |
| `tests/convencoes.test.ts` | +76/-4 |
| `tests/demonstracao.test.ts` | +80/-0 |
| `tests/filhos-acoes.test.ts` | +5/-1 |
| `tests/filhos-mesada.test.ts` | +3/-3 |
| `tests/mesada-acoes.test.ts` | +206/-0 |
| `tests/mesada-dados.test.ts` | +146/-0 |
| `tests/mesada-isolamento.test.ts` | +138/-0 |
| `tests/mesada-lib.test.ts` | +98/-0 |
| `tests/mesada-papeis.test.ts` | +105/-0 |
| `tests/mesada-rotas-responsavel.test.ts` | +233/-0 |
| `tests/mesada-rotas.test.ts` | +203/-0 |
| `tests/mesada-saldo.test.ts` | +110/-0 |
| `tests/mesada-tela.test.ts` | +213/-0 |
| `tests/mesada.test.ts` | +361/-0 |
| `tests/premissas.test.ts` | +43/-0 |
