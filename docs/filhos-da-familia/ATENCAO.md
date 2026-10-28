# Onde gastar atencao — filhos-da-familia

Branch: `feat/ft-05-filhos-da-familia` -> `feat/ft-04-saldo-e-resumo-do-mes` (empilhada sobre `feat/ft-03-lancamentos-da-casa`, `feat/ft-02-trilha-de-atividade` e `feat/ft-01-fundacao`; nada foi mergeado em `main`)
Data: 2026-10-28

**60 arquivos — 9 olho obrigatorio, 18 leitura rapida, 33 dispensavel**

A classificacao e derivada de evidencia registrada, nunca de sensacao. Tamanho de diff nao e criterio. (Classificacao feita pela mesma sessao que implementou, sem o agente `revisor-diff` neste harness; a regra "sobe para a mais rigorosa na duvida" foi aplicada.)

## OLHO OBRIGATORIO — ler linha a linha

| Arquivo | Mudanca | Tamanho | Por que |
|---|---|---|---|
| `prisma/demonstracao.ts` | M/A | +55/-4 | seed com credenciais fixas de demonstracao; guarda contra producao preservada |
| `prisma/migrations/20261028170000_filhos/migration.sql` | M/A | +15/-0 | migration: tabela filhos, vinculo unico com usuarios, INTEGER na mesada |
| `prisma/schema.prisma` | M/A | +24/-0 | esquema de dado de menor; valor em Int, vinculo 1 para 1 |
| `src/app/(sistema)/mesada/page.tsx` | M/A | +24/-0 | autorizacao: pagina do filho sem id, decide o que um filho ve |
| `src/app/acoes.ts` | M/A | +79/-4 | autorizacao: acoes de servidor; guarda de usuario movida para fora do try |
| `src/app/sessao-servidor.ts` | M/A | +11/-0 | autorizacao: guarda de pagina do papel filho |
| `src/servicos/autenticacao.ts` | M/A | +8/-0 | autorizacao: exigirFilho |
| `src/servicos/filhos.ts` | M/A | +321/-0 | regra de negocio, dado de menor, dinheiro, autorizacao, login e isolamento entre irmaos |
| `src/servicos/usuarios.ts` | M/A | +6/-0 | autorizacao: a tela Usuarios recusa mudar o papel de um filho |

## LEITURA RAPIDA — conferir a intencao

| Arquivo | Mudanca | Tamanho | Por que |
|---|---|---|---|
| `README.md` | M/A | +21/-6 | convencao ou premissa nova; texto que governa as proximas features |
| `docs/projeto/PREMISSAS.md` | M/A | +29/-3 | convencao ou premissa nova; PR-30, PR-31 e PR-06 realizada |
| `docs/stack/CONVENCOES.md` | M/A | +7/-6 | convencao ou premissa nova; citacoes arquivo:linha conferidas por teste |
| `src/app/(sistema)/filhos/[id]/page.tsx` | M/A | +50/-0 | tela nova com dado de menor, so o responsavel |
| `src/app/(sistema)/filhos/novo/page.tsx` | M/A | +23/-0 | tela nova, so o responsavel |
| `src/app/(sistema)/filhos/page.tsx` | M/A | +29/-0 | tela nova com dado de menor, so o responsavel |
| `src/app/(sistema)/layout.tsx` | M/A | +1/-0 | casca: passa o papel a navegacao |
| `src/app/(sistema)/page.tsx` | M/A | +10/-1 | painel de todos os papeis; filho continua sem valor e ganha um link |
| `src/app/formularios.ts` | M/A | +16/-0 | leitura de formulario; so copia campos |
| `src/componentes/CamposDoFilho.tsx` | M/A | +56/-0 | campos do formulario do filho; so os da PR-09 |
| `src/componentes/ListaDeFilhos.tsx` | M/A | +33/-0 | tela ou componente novo |
| `src/componentes/LoginDoFilho.tsx` | M/A | +81/-0 | tela nova com credencial provisoria e desativacao em dois passos |
| `src/componentes/MesadaDoFilho.tsx` | M/A | +32/-0 | tela nova do filho; sem saldo |
| `src/componentes/Navegacao.tsx` | M/A | +17/-0 | menu por papel (conveniencia; o controle e do servidor) |
| `src/estilos/global.css` | M/A | +39/-0 | apoio de estilo; so var(--token), conferido por teste |
| `src/lib/atividade.ts` | M/A | +19/-0 | catalogo da trilha; rotulos e descricao sem valor |
| `src/lib/filhos.ts` | M/A | +31/-0 | logica pura de apresentacao; coberta por teste |
| `src/lib/papeis.ts` | M/A | +5/-3 | rotulo do papel |

## DISPENSAVEL — a maquina ja provou

Documentos do processo (`docs/filhos-da-familia/`, `docs/projeto/MAPA.md`, `docs/projeto/PROJETO.md`) e testes (`tests/papel-filho.test.ts`, `tests/filhos*.test.ts`, e ampliacoes em `tests/atividade-dados.test.ts`, `tests/papeis.test.ts`, `tests/demonstracao.test.ts`, `tests/premissas.test.ts`, `tests/convencoes.test.ts`, `tests/rotas.test.ts`, `tests/ajuda.ts`).

| Arquivo | Tamanho |
|---|---|
| `docs/filhos-da-familia/00-AUDITORIA.md` | +20/-0 |
| `docs/filhos-da-familia/00-BLOQUEIOS.md` | +30/-0 |
| `docs/filhos-da-familia/00-DECISOES.md` | +168/-0 |
| `docs/filhos-da-familia/ATENCAO.md` | +0/-0 |
| `docs/filhos-da-familia/ENTREGA.md` | +0/-0 |
| `docs/filhos-da-familia/FECHAMENTO.md` | +0/-0 |
| `docs/filhos-da-familia/ORQUESTRADOR.md` | +85/-0 |
| `docs/filhos-da-familia/PR.md` | +0/-0 |
| `docs/filhos-da-familia/QA-PACOTE.md` | +0/-0 |
| `docs/filhos-da-familia/base/00-INDICE.md` | +32/-0 |
| `docs/filhos-da-familia/base/00-LACUNAS.md` | +10/-0 |
| `docs/filhos-da-familia/base/01-dados-e-servico.md` | +27/-0 |
| `docs/filhos-da-familia/base/02-interface.md` | +26/-0 |
| `docs/filhos-da-familia/sprint-01/tasks.md` | +74/-0 |
| `docs/filhos-da-familia/sprint-02/tasks.md` | +97/-0 |
| `docs/filhos-da-familia/sprint-03/tasks.md` | +74/-0 |
| `docs/projeto/MAPA.md` | +4/-4 |
| `prisma/seed.ts` | +4/-1 |
| `tests/ajuda.ts` | +1/-0 |
| `tests/atividade-dados.test.ts` | +5/-1 |
| `tests/convencoes.test.ts` | +79/-11 |
| `tests/demonstracao.test.ts` | +66/-7 |
| `tests/filhos-acoes.test.ts` | +210/-0 |
| `tests/filhos-dados.test.ts` | +122/-0 |
| `tests/filhos-login.test.ts` | +256/-0 |
| `tests/filhos-mesada.test.ts` | +278/-0 |
| `tests/filhos-papeis.test.ts` | +82/-0 |
| `tests/filhos-tela.test.ts` | +156/-0 |
| `tests/filhos.test.ts` | +266/-0 |
| `tests/papeis.test.ts` | +8/-3 |
| `tests/papel-filho.test.ts` | +185/-0 |
| `tests/premissas.test.ts` | +36/-0 |
| `tests/rotas.test.ts` | +2/-2 |
