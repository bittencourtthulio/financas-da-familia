# Onde gastar atencao — lancamentos-da-casa

Branch: `feat/ft-03-lancamentos-da-casa` -> `feat/ft-02-trilha-de-atividade` (empilhada sobre `feat/ft-01-fundacao`; nada foi mergeado em `main`)
Data: 2026-10-28

**65 arquivos — 8 olho obrigatorio, 23 leitura rapida, 34 dispensavel**

A classificacao e derivada de evidencia registrada, nunca de sensacao. Tamanho de diff nao e criterio. (Classificacao feita pela mesma sessao que implementou, sem o agente `revisor-diff` neste harness; a regra "sobe para a mais rigorosa na duvida" foi aplicada.)

## OLHO OBRIGATORIO — ler linha a linha

| Arquivo | Mudanca | Tamanho | Por que |
|---|---|---|---|
| `prisma/demonstracao.ts` | M | +64/-4 | seed com dados fixos de demonstracao; guarda contra producao preservada |
| `prisma/migrations/20261028150000_lancamentos/migration.sql` | A | +27/-0 | migration: cria as tabelas categorias e lancamentos, valor INTEGER; sem reversao declarada (L-04) |
| `prisma/schema.prisma` | A | +34/-0 | dados: entidades novas; valor so como Int em centavos, sem Float nem Decimal (PR-02) |
| `src/app/acoes.ts` | A | +75/-0 | acoes de formulario que gravam dinheiro; erro vira mensagem sem pilha; guarda fora do try |
| `src/app/sessao-servidor.ts` | A | +12/-0 | autorizacao: guarda de pagina e acao; redirecionamento |
| `src/lib/dinheiro.ts` | A | +45/-0 | leitor do valor digitado: erro aqui vira saldo errado (PR-02) |
| `src/servicos/autenticacao.ts` | A | +18/-0 | autorizacao: lista de permitidos admin/usuario (papel desconhecido e negado) |
| `src/servicos/lancamentos.ts` | A | +353/-0 | regra de negocio e autorizacao: validacao do valor e da categoria, guarda de papel em toda funcao, transacao com a trilha, exclusao definitiva |

## LEITURA RAPIDA — conferir a intencao

| Arquivo | Mudanca | Tamanho | Por que |
|---|---|---|---|
| `README.md` | M | +13/-7 | convencao ou premissa nova; texto que governa as proximas features |
| `docs/projeto/PREMISSAS.md` | M | +42/-3 | convencao ou premissa nova; texto que governa as proximas features |
| `docs/stack/CONVENCOES.md` | M | +16/-15 | convencao ou premissa nova; texto que governa as proximas features |
| `src/app/(sistema)/lancamentos/[id]/page.tsx` | A | +58/-0 | tela ou componente novo que renderiza e envia dado do usuario |
| `src/app/(sistema)/lancamentos/categorias/page.tsx` | A | +69/-0 | tela ou componente novo que renderiza e envia dado do usuario |
| `src/app/(sistema)/lancamentos/novo/page.tsx` | A | +26/-0 | tela ou componente novo que renderiza e envia dado do usuario |
| `src/app/(sistema)/lancamentos/page.tsx` | A | +46/-0 | tela ou componente novo que renderiza e envia dado do usuario |
| `src/app/(sistema)/layout.tsx` | M | +5/-1 | apoio de teste ou estilo |
| `src/app/formularios.ts` | A | +23/-0 | apoio de teste ou estilo |
| `src/componentes/ApagarLancamento.tsx` | A | +47/-0 | tela ou componente novo que renderiza e envia dado do usuario |
| `src/componentes/CampoDeTipo.tsx` | A | +40/-0 | tela ou componente novo que renderiza e envia dado do usuario |
| `src/componentes/CamposDeLancamento.tsx` | A | +105/-0 | tela ou componente novo que renderiza e envia dado do usuario |
| `src/componentes/FiltrosDeLancamentos.tsx` | A | +45/-0 | tela ou componente novo que renderiza e envia dado do usuario |
| `src/componentes/Navegacao.tsx` | M | +28/-1 | tela ou componente novo que renderiza e envia dado do usuario |
| `src/componentes/PaginacaoDeLancamentos.tsx` | A | +27/-0 | tela ou componente novo que renderiza e envia dado do usuario |
| `src/componentes/TabelaDeLancamentos.tsx` | A | +77/-0 | tela ou componente novo que renderiza e envia dado do usuario |
| `src/estilos/global.css` | M | +84/-3 | apoio de teste ou estilo |
| `src/lib/atividade.ts` | A | +14/-0 | logica pura de data, exibicao ou catalogo; coberta por teste |
| `src/lib/datas.ts` | A | +113/-0 | logica pura de data, exibicao ou catalogo; coberta por teste |
| `src/lib/formato.ts` | A | +11/-0 | logica pura de data, exibicao ou catalogo; coberta por teste |
| `src/lib/lancamentos-links.ts` | A | +16/-0 | logica pura de data, exibicao ou catalogo; coberta por teste |
| `tests/ajuda.ts` | A | +15/-0 | apoio de teste ou estilo |
| `tests/rotas.test.ts` | M | +147/-1 | apoio de teste ou estilo |

## DISPENSAVEL — a maquina ja provou

| Arquivo | Mudanca | Tamanho | Por que |
|---|---|---|---|
| `docs/lancamentos-da-casa/00-AUDITORIA.md` | A | +19/-0 |  |
| `docs/lancamentos-da-casa/00-BLOQUEIOS.md` | A | +30/-0 |  |
| `docs/lancamentos-da-casa/00-DECISOES.md` | A | +175/-0 |  |
| `docs/lancamentos-da-casa/ATENCAO.md` | A | +85/-0 |  |
| `docs/lancamentos-da-casa/ENTREGA.md` | A | +60/-0 |  |
| `docs/lancamentos-da-casa/FECHAMENTO.md` | A | +49/-0 |  |
| `docs/lancamentos-da-casa/ORQUESTRADOR.md` | A | +81/-0 |  |
| `docs/lancamentos-da-casa/PR.md` | A | +39/-0 |  |
| `docs/lancamentos-da-casa/QA-PACOTE.md` | A | +142/-0 |  |
| `docs/lancamentos-da-casa/base/00-INDICE.md` | A | +36/-0 |  |
| `docs/lancamentos-da-casa/base/00-LACUNAS.md` | A | +10/-0 |  |
| `docs/lancamentos-da-casa/base/01-autorizacao-e-trilha.md` | A | +23/-0 |  |
| `docs/lancamentos-da-casa/base/02-dados-e-testes.md` | A | +23/-0 |  |
| `docs/lancamentos-da-casa/base/03-interface.md` | A | +22/-0 |  |
| `docs/lancamentos-da-casa/sprint-01/tasks.md` | A | +68/-0 |  |
| `docs/lancamentos-da-casa/sprint-02/tasks.md` | A | +99/-0 |  |
| `docs/lancamentos-da-casa/sprint-03/tasks.md` | A | +83/-0 |  |
| `docs/projeto/MAPA.md` | M | +7/-4 |  |
| `docs/projeto/PROJETO.md` | M | +1/-1 |  |
| `tests/atividade-dados.test.ts` | M | +5/-1 |  |
| `tests/atividade-tela.test.ts` | A | +29/-0 |  |
| `tests/categorias.test.ts` | A | +136/-0 |  |
| `tests/convencoes.test.ts` | A | +72/-0 |  |
| `tests/datas.test.ts` | A | +129/-0 |  |
| `tests/demonstracao.test.ts` | A | +54/-0 |  |
| `tests/dinheiro.test.ts` | A | +129/-0 |  |
| `tests/lancamentos-dados.test.ts` | A | +148/-0 |  |
| `tests/lancamentos-edicao.test.ts` | A | +215/-0 |  |
| `tests/lancamentos-formulario.test.ts` | A | +245/-0 |  |
| `tests/lancamentos-listagem.test.ts` | A | +191/-0 |  |
| `tests/lancamentos-papeis.test.ts` | A | +106/-0 |  |
| `tests/lancamentos-tela.test.ts` | A | +217/-0 |  |
| `tests/lancamentos.test.ts` | A | +200/-0 |  |
| `tests/premissas.test.ts` | M | +29/-1 |  |

