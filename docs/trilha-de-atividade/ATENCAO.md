# Onde gastar atenção — trilha-de-atividade

Branch: `feat/ft-02-trilha-de-atividade` → `feat/ft-01-fundacao` (empilhada; a FT-01 ainda não foi mergeada em `main`)
Data: 2026-10-28

**43 arquivos — 6 olho obrigatório, 9 leitura rápida, 28 dispensável**

A classificação é derivada de evidência registrada, nunca de sensação. Tamanho de diff não é critério. (Classificação feita pela mesma sessão que implementou, sem o agente `revisor-diff` neste harness; a regra "sobe para a mais rigorosa na dúvida" foi aplicada.)

## OLHO OBRIGATÓRIO — ler linha a linha

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `prisma/demonstracao.ts` | M | +54/-3 | seed com credenciais conhecidas ganhou duas atividades; guarda contra producao preservada |
| `prisma/migrations/20261028143052_atividade/migration.sql` | A | +14/-0 | migration: cria a tabela atividades; sem reversao declarada (L-04) |
| `prisma/schema.prisma` | M | +19/-0 | dados: entidade nova sem chave estrangeira de proposito (sobrevive a conta apagada, PR-09) |
| `src/app/(sistema)/atividade/page.tsx` | A | +32/-0 | autorizacao: tela so do responsavel, verificada no servidor antes de ler o registro |
| `src/servicos/atividade.ts` | A | +165/-0 | seguranca: barreira contra senha, hash, token e dado financeiro no detalhe (PR-10, PR-25); leitura so do admin |
| `src/servicos/usuarios.ts` | M | +63/-17 | autorizacao e dados: criar e editar viraram transacao que grava a acao e o rastro juntos; so registra mudanca real |

## LEITURA RÁPIDA — conferir a intenção

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `README.md` | M | +13/-6 | texto de uso |
| `docs/projeto/PREMISSAS.md` | M | +16/-3 | premissa nova PR-25 e PR-10 realizada |
| `docs/stack/CONVENCOES.md` | M | +9/-5 | convencao nova (Auditoria) e citacoes de linha deslocadas |
| `src/componentes/Navegacao.tsx` | M | +5/-0 | item novo so para admin (conveniencia; o controle e o servidor) |
| `src/componentes/PaginacaoDeAtividade.tsx` | A | +25/-0 | componente novo, links de pagina |
| `src/componentes/TabelaDeAtividade.tsx` | A | +45/-0 | componente novo que renderiza dado vindo do banco |
| `src/lib/atividade.ts` | A | +59/-0 | catalogo de acoes e texto da tela; regra de exibicao de papel |
| `tests/ajuda.ts` | M | +1/-0 | limparBanco passa a limpar atividades |
| `tests/rotas.test.ts` | M | +62/-1 | teste de rotas ampliado com a tela Atividade |

## DISPENSÁVEL — a máquina já provou

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `docs/projeto/MAPA.md` | M | +4/-4 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/projeto/PROJETO.md` | M | — | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/sprintx/estimativas/HISTORICO.md` | M | — | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/00-AUDITORIA.md` | A | +18/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/00-BLOQUEIOS.md` | A | +16/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/00-DECISOES.md` | A | +151/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/ATENCAO.md` | A | — | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/ENTREGA.md` | A | — | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/FECHAMENTO.md` | A | — | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/ORQUESTRADOR.md` | A | +80/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/PR.md` | A | — | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/QA-PACOTE.md` | A | — | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/base/00-INDICE.md` | A | +36/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/base/00-LACUNAS.md` | A | +9/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/base/01-usuarios-e-autorizacao.md` | A | +24/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/base/02-dados-e-testes.md` | A | +22/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/base/03-interface.md` | A | +20/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/sprint-01/tasks.md` | A | +81/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/sprint-02/tasks.md` | A | +65/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `docs/trilha-de-atividade/sprint-03/tasks.md` | A | +81/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `tests/atividade-dados.test.ts` | A | +75/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `tests/atividade-leitura.test.ts` | A | +98/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `tests/atividade-tela.test.ts` | A | +154/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `tests/atividade.test.ts` | A | +130/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `tests/convencoes.test.ts` | M | +31/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `tests/demonstracao.test.ts` | M | +45/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `tests/premissas.test.ts` | M | +32/-2 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |
| `tests/usuarios-atividade.test.ts` | A | +151/-0 | artefato do metodo ou arquivo de teste; so acrescenta casos, suite verde |

Nenhum arquivo ficou sem faixa.
