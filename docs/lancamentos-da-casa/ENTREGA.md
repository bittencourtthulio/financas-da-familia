---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: lancamentos-da-casa
origem_buildx: financas-da-familia
feature_id: FT-03
entregue_por: mergex
titulo: Lançamentos da casa
tipo_trabalho: feature
tipo_ocorrencia: null
estado: entregue
versionado: true
branch: feat/ft-03-lancamentos-da-casa
branch_base: feat/ft-02-trilha-de-atividade
commits:
  - task: T-01.01
    commit: 4b101b5
  - task: T-01.02
    commit: 1c68102
  - task: T-02.01
    commit: 912d921
  - task: T-02.02
    commit: 8457575
  - task: T-02.03
    commit: 2f4cb01
  - task: T-02.04
    commit: cdb6be1
  - task: T-03.01
    commit: e038ac8
  - task: T-03.02
    commit: d7d6274
  - task: T-03.03
    commit: e056ef0
modulo_afetado: [dados, aplicacao, apresentacao, lib, estilos, testes, documentacao]
arquivos_alterados: [README.md, docs/lancamentos-da-casa/00-AUDITORIA.md, docs/lancamentos-da-casa/00-BLOQUEIOS.md, docs/lancamentos-da-casa/00-DECISOES.md, docs/lancamentos-da-casa/ATENCAO.md, docs/lancamentos-da-casa/ENTREGA.md, docs/lancamentos-da-casa/FECHAMENTO.md, docs/lancamentos-da-casa/ORQUESTRADOR.md, docs/lancamentos-da-casa/PR.md, docs/lancamentos-da-casa/QA-PACOTE.md, docs/lancamentos-da-casa/base/00-INDICE.md, docs/lancamentos-da-casa/base/00-LACUNAS.md, docs/lancamentos-da-casa/base/01-autorizacao-e-trilha.md, docs/lancamentos-da-casa/base/02-dados-e-testes.md, docs/lancamentos-da-casa/base/03-interface.md, docs/lancamentos-da-casa/sprint-01/tasks.md, docs/lancamentos-da-casa/sprint-02/tasks.md, docs/lancamentos-da-casa/sprint-03/tasks.md, docs/projeto/MAPA.md, docs/projeto/PREMISSAS.md, docs/projeto/PROJETO.md, docs/stack/CONVENCOES.md, prisma/demonstracao.ts, prisma/migrations/20261028150000_lancamentos/migration.sql, prisma/schema.prisma, src/app/(sistema)/lancamentos/[id]/page.tsx, src/app/(sistema)/lancamentos/categorias/page.tsx, src/app/(sistema)/lancamentos/novo/page.tsx, src/app/(sistema)/lancamentos/page.tsx, src/app/(sistema)/layout.tsx, src/app/acoes.ts, src/app/formularios.ts, src/app/sessao-servidor.ts, src/componentes/ApagarLancamento.tsx, src/componentes/CampoDeTipo.tsx, src/componentes/CamposDeLancamento.tsx, src/componentes/FiltrosDeLancamentos.tsx, src/componentes/Navegacao.tsx, src/componentes/PaginacaoDeLancamentos.tsx, src/componentes/TabelaDeLancamentos.tsx, src/estilos/global.css, src/lib/atividade.ts, src/lib/datas.ts, src/lib/dinheiro.ts, src/lib/formato.ts, src/lib/lancamentos-links.ts, src/servicos/autenticacao.ts, src/servicos/lancamentos.ts, tests/ajuda.ts, tests/atividade-dados.test.ts, tests/atividade-tela.test.ts, tests/categorias.test.ts, tests/convencoes.test.ts, tests/datas.test.ts, tests/demonstracao.test.ts, tests/dinheiro.test.ts, tests/lancamentos-dados.test.ts, tests/lancamentos-edicao.test.ts, tests/lancamentos-formulario.test.ts, tests/lancamentos-listagem.test.ts, tests/lancamentos-papeis.test.ts, tests/lancamentos-tela.test.ts, tests/lancamentos.test.ts, tests/premissas.test.ts, tests/rotas.test.ts]
faixa_atencao:
  - arquivo: README.md
    faixa: media
  - arquivo: docs/lancamentos-da-casa/00-AUDITORIA.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/00-BLOQUEIOS.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/00-DECISOES.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/ATENCAO.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/ENTREGA.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/FECHAMENTO.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/ORQUESTRADOR.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/PR.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/QA-PACOTE.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/base/00-INDICE.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/base/00-LACUNAS.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/base/01-autorizacao-e-trilha.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/base/02-dados-e-testes.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/base/03-interface.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/sprint-01/tasks.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/sprint-02/tasks.md
    faixa: baixa
  - arquivo: docs/lancamentos-da-casa/sprint-03/tasks.md
    faixa: baixa
  - arquivo: docs/projeto/MAPA.md
    faixa: baixa
  - arquivo: docs/projeto/PREMISSAS.md
    faixa: media
  - arquivo: docs/projeto/PROJETO.md
    faixa: baixa
  - arquivo: docs/stack/CONVENCOES.md
    faixa: media
  - arquivo: prisma/demonstracao.ts
    faixa: alta
  - arquivo: prisma/migrations/20261028150000_lancamentos/migration.sql
    faixa: alta
  - arquivo: prisma/schema.prisma
    faixa: alta
  - arquivo: src/app/(sistema)/lancamentos/[id]/page.tsx
    faixa: media
  - arquivo: src/app/(sistema)/lancamentos/categorias/page.tsx
    faixa: media
  - arquivo: src/app/(sistema)/lancamentos/novo/page.tsx
    faixa: media
  - arquivo: src/app/(sistema)/lancamentos/page.tsx
    faixa: media
  - arquivo: src/app/(sistema)/layout.tsx
    faixa: media
  - arquivo: src/app/acoes.ts
    faixa: alta
  - arquivo: src/app/formularios.ts
    faixa: media
  - arquivo: src/app/sessao-servidor.ts
    faixa: alta
  - arquivo: src/componentes/ApagarLancamento.tsx
    faixa: media
  - arquivo: src/componentes/CampoDeTipo.tsx
    faixa: media
  - arquivo: src/componentes/CamposDeLancamento.tsx
    faixa: media
  - arquivo: src/componentes/FiltrosDeLancamentos.tsx
    faixa: media
  - arquivo: src/componentes/Navegacao.tsx
    faixa: media
  - arquivo: src/componentes/PaginacaoDeLancamentos.tsx
    faixa: media
  - arquivo: src/componentes/TabelaDeLancamentos.tsx
    faixa: media
  - arquivo: src/estilos/global.css
    faixa: media
  - arquivo: src/lib/atividade.ts
    faixa: media
  - arquivo: src/lib/datas.ts
    faixa: media
  - arquivo: src/lib/dinheiro.ts
    faixa: alta
  - arquivo: src/lib/formato.ts
    faixa: media
  - arquivo: src/lib/lancamentos-links.ts
    faixa: media
  - arquivo: src/servicos/autenticacao.ts
    faixa: alta
  - arquivo: src/servicos/lancamentos.ts
    faixa: alta
  - arquivo: tests/ajuda.ts
    faixa: media
  - arquivo: tests/atividade-dados.test.ts
    faixa: baixa
  - arquivo: tests/atividade-tela.test.ts
    faixa: baixa
  - arquivo: tests/categorias.test.ts
    faixa: baixa
  - arquivo: tests/convencoes.test.ts
    faixa: baixa
  - arquivo: tests/datas.test.ts
    faixa: baixa
  - arquivo: tests/demonstracao.test.ts
    faixa: baixa
  - arquivo: tests/dinheiro.test.ts
    faixa: baixa
  - arquivo: tests/lancamentos-dados.test.ts
    faixa: baixa
  - arquivo: tests/lancamentos-edicao.test.ts
    faixa: baixa
  - arquivo: tests/lancamentos-formulario.test.ts
    faixa: baixa
  - arquivo: tests/lancamentos-listagem.test.ts
    faixa: baixa
  - arquivo: tests/lancamentos-papeis.test.ts
    faixa: baixa
  - arquivo: tests/lancamentos-tela.test.ts
    faixa: baixa
  - arquivo: tests/lancamentos.test.ts
    faixa: baixa
  - arquivo: tests/premissas.test.ts
    faixa: baixa
  - arquivo: tests/rotas.test.ts
    faixa: media
raio: null
atencao:
  olho_obrigatorio: 8
  leitura_rapida: 23
  dispensavel: 34
portao: pronto
desvios: []
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-10-28
atualizado_em: 2026-10-28
entregue_em: 2026-10-28
---
# Entrega — Lançamentos da casa

Lançamentos da casa entregues na branch `feat/ft-03-lancamentos-da-casa` (9 commits de task mais o de planejamento e o de fechamento), empilhada sobre `feat/ft-02-trilha-de-atividade`, que por sua vez está sobre `feat/ft-01-fundacao`; nada foi mergeado. O pull request não pôde ser aberto porque o repositório não tem remoto; quando existir, ele mira a branch da FT-02 (ou `main`, depois que as duas anteriores forem mergeadas).

## Onde está o quê

| O quê | Onde |
|---|---|
| Descrição do pull request | [PR.md](PR.md) |
| Pacote de QA | [QA-PACOTE.md](QA-PACOTE.md) |
| Classificação da atenção | [ATENCAO.md](ATENCAO.md) |
| Trabalho de origem | [ORQUESTRADOR.md](ORQUESTRADOR.md), [FECHAMENTO.md](FECHAMENTO.md) |
| Pull request | não aberto (sem remoto) |

## Estado da entrega

- Portão de prontidão: PRONTO (V1 a V10 sem falha; V4, V5 e V8 não se aplicam)
- Commits: 9, um por task
- Atenção humana: 8 olho obrigatório, 23 leitura rápida, 34 dispensável
- Push: não feito — não há remoto configurado
- Pull request: não aberto — pendência `recurso_externo` (criar o remoto, empurrar a branch e abrir o PR com o conteúdo de PR.md, mirando `feat/ft-02-trilha-de-atividade`)
- Falta para o merge: revisão humana, QA com o pacote, um remoto, e o merge da FT-01 e da FT-02 antes (ou junto). O merge é decisão humana e não foi feito.

## Portão de prontidão (E2) — 2026-10-28

| # | Verificação | Resultado |
|---|---|---|
| V1 | Tasks concluídas | OK (9 de 9) |
| V2 | Suíte verde por task | OK (349, 367, 407, 454, 486, 513, 533, 558, 588 testes) |
| V3 | Dois testes por task | OK |
| V4 | Teste de regressão na primeira task (bug da runx) | n/a |
| V5 | QA da runx aprovado | n/a |
| V6 | Auditoria da sprintx aprovada | OK (`VEREDITO: SIM`, nenhuma volta à F3) |
| V7 | Bloqueio aberto no escopo entregue | OK (nenhum bloqueio; duas pendências `decisao_humana` não bloqueantes) |
| V8 | Modo legado | n/a (sem `docs/legado/PERFIL.md`) |
| V9 | Arquivo alterado fora da lista declarada | OK com aviso (ver Avisos) |
| V10 | Segredo, credencial ou dado real de cliente | OK com aviso |

## Avisos

- Os artefatos desta entrega ficam em `docs/lancamentos-da-casa/` (não em `docs/entregas/lancamentos-da-casa/`), por determinação do orquestrador do buildx (PR-24).
- Branch empilhada: a base é `feat/ft-02-trilha-de-atividade`; o diff do PR contém só a FT-03.
- V9: `tests/atividade-dados.test.ts` (FT-02) afirmava as três ações exatas do catálogo e passou a afirmar as sete; `tests/premissas.test.ts` e `tests/convencoes.test.ts` ganharam blocos da FT-03; `README.md`, `docs/projeto/*` e `docs/stack/CONVENCOES.md` são registros do processo. `src/app/(sistema)/layout.tsx`, `src/app/sessao-servidor.ts`, `src/app/acoes.ts` e `src/componentes/Navegacao.tsx` são código das features anteriores tocado só para acrescentar o item de menu, a guarda e as ações.
- V10: o diff contém as senhas fictícias de demonstração já existentes (`demo1234`, na seed e no README) e segredos de teste; não há chave, token nem dado real.
- V6: auditoria e classificação de atenção feitas pela mesma sessão que implementou (sem os agentes `auditor-plano`, `revisor-testes` e `revisor-diff` neste harness).
- Sem `DIVIDA.md`, sem raio de impacto e sem índice do memox: seções correspondentes omitidas. O histórico de estimativas (`docs/sprintx/estimativas/HISTORICO.md`) não foi atualizado: a F3.5 é opcional no modo autônomo.

## Desvios

Nenhum arquivo fora do escopo da feature. Divergências de método: (1) na T-03.03 o código da seed e os testes dela foram escritos na mesma passada, então o vermelho do teste de seed não foi observado separadamente; (2) os testes de convenções e de premissas da T-03.03 tiveram a primeira edição perdida por um comando encadeado que falhou, e foram refeitos antes de qualquer commit.

## Verificação final — 2026-10-28

`npm run verificar` terminou com código 0: `eslint .` sem achados, `tsc --noEmit` sem erro, `next build` ok (rotas `/lancamentos`, `/lancamentos/[id]`, `/lancamentos/categorias` e `/lancamentos/novo` dinâmicas), `vitest run` com `Test Files  34 passed (34)` e `Tests  588 passed (588)`, e `npm audit --audit-level=high` sem achado alto ou crítico (restam as `2 moderate severity vulnerabilities` do `vitest`/`@vitest/mocker`, só de ferramenta de teste, já registradas na FT-01).
