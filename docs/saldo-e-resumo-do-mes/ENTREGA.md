---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: saldo-e-resumo-do-mes
origem_buildx: financas-da-familia
feature_id: FT-04
entregue_por: mergex
titulo: Saldo e resumo do mês
tipo_trabalho: feature
tipo_ocorrencia: null
estado: entregue
versionado: true
branch: feat/ft-04-saldo-e-resumo-do-mes
branch_base: feat/ft-03-lancamentos-da-casa
commits:
  - task: T-01.01
    commit: 2d327bd
  - task: T-01.02
    commit: f539a8e
  - task: T-02.01
    commit: 5752f51
  - task: T-02.02
    commit: 6bd87ff
  - task: T-03.01
    commit: 3de4c67
modulo_afetado: [aplicacao, apresentacao, lib, estilos, dados, testes, documentacao]
arquivos_alterados: [README.md, docs/projeto/MAPA.md, docs/projeto/PREMISSAS.md, docs/saldo-e-resumo-do-mes/00-AUDITORIA.md, docs/saldo-e-resumo-do-mes/00-BLOQUEIOS.md, docs/saldo-e-resumo-do-mes/00-DECISOES.md, docs/saldo-e-resumo-do-mes/ATENCAO.md, docs/saldo-e-resumo-do-mes/ENTREGA.md, docs/saldo-e-resumo-do-mes/FECHAMENTO.md, docs/saldo-e-resumo-do-mes/ORQUESTRADOR.md, docs/saldo-e-resumo-do-mes/PR.md, docs/saldo-e-resumo-do-mes/QA-PACOTE.md, docs/saldo-e-resumo-do-mes/base/00-INDICE.md, docs/saldo-e-resumo-do-mes/base/00-LACUNAS.md, docs/saldo-e-resumo-do-mes/base/01-dados-e-servico.md, docs/saldo-e-resumo-do-mes/base/02-interface.md, docs/saldo-e-resumo-do-mes/sprint-01/tasks.md, docs/saldo-e-resumo-do-mes/sprint-02/tasks.md, docs/saldo-e-resumo-do-mes/sprint-03/tasks.md, docs/stack/CONVENCOES.md, prisma/demonstracao.ts, src/app/(sistema)/page.tsx, src/componentes/ResumoDoMes.tsx, src/componentes/SeletorDeMes.tsx, src/estilos/global.css, src/lib/resumo-links.ts, src/servicos/resumo.ts, tests/convencoes.test.ts, tests/demonstracao.test.ts, tests/premissas.test.ts, tests/resumo-papeis.test.ts, tests/resumo-tela.test.ts, tests/resumo.test.ts, tests/rotas.test.ts]
faixa_atencao:
  - arquivo: README.md
    faixa: media
  - arquivo: docs/projeto/MAPA.md
    faixa: baixa
  - arquivo: docs/projeto/PREMISSAS.md
    faixa: media
  - arquivo: docs/saldo-e-resumo-do-mes/00-AUDITORIA.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/00-BLOQUEIOS.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/00-DECISOES.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/ATENCAO.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/ENTREGA.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/FECHAMENTO.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/ORQUESTRADOR.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/PR.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/QA-PACOTE.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/base/00-INDICE.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/base/00-LACUNAS.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/base/01-dados-e-servico.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/base/02-interface.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/sprint-01/tasks.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/sprint-02/tasks.md
    faixa: baixa
  - arquivo: docs/saldo-e-resumo-do-mes/sprint-03/tasks.md
    faixa: baixa
  - arquivo: docs/stack/CONVENCOES.md
    faixa: media
  - arquivo: prisma/demonstracao.ts
    faixa: alta
  - arquivo: src/app/(sistema)/page.tsx
    faixa: alta
  - arquivo: src/componentes/ResumoDoMes.tsx
    faixa: media
  - arquivo: src/componentes/SeletorDeMes.tsx
    faixa: media
  - arquivo: src/estilos/global.css
    faixa: media
  - arquivo: src/lib/resumo-links.ts
    faixa: media
  - arquivo: src/servicos/resumo.ts
    faixa: alta
  - arquivo: tests/convencoes.test.ts
    faixa: baixa
  - arquivo: tests/demonstracao.test.ts
    faixa: baixa
  - arquivo: tests/premissas.test.ts
    faixa: baixa
  - arquivo: tests/resumo-papeis.test.ts
    faixa: baixa
  - arquivo: tests/resumo-tela.test.ts
    faixa: baixa
  - arquivo: tests/resumo.test.ts
    faixa: baixa
  - arquivo: tests/rotas.test.ts
    faixa: baixa
raio: null
atencao:
  olho_obrigatorio: 3
  leitura_rapida: 7
  dispensavel: 24
portao: pronto
desvios: []
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-10-28
atualizado_em: 2026-10-28
entregue_em: 2026-10-28
---
# Entrega — Saldo e resumo do mês

Saldo e resumo do mês entregues na branch `feat/ft-04-saldo-e-resumo-do-mes` (5 commits de task mais o de planejamento e o de fechamento), empilhada sobre `feat/ft-03-lancamentos-da-casa`, que está sobre `feat/ft-02-trilha-de-atividade` e `feat/ft-01-fundacao`; nada foi mergeado. O pull request não pôde ser aberto porque o repositório não tem remoto; quando existir, ele mira a branch da FT-03 (ou `main`, depois que as anteriores forem mergeadas).

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
- Commits: 5, um por task
- Atenção humana: 3 olho obrigatório, 7 leitura rápida, 24 dispensável
- Push: não feito — não há remoto configurado
- Pull request: não aberto — pendência `recurso_externo` (criar o remoto, empurrar a branch e abrir o PR com o conteúdo de PR.md, mirando `feat/ft-03-lancamentos-da-casa`)
- Falta para o merge: revisão humana, QA com o pacote, um remoto, e o merge da FT-01, FT-02 e FT-03 antes (ou junto). O merge é decisão humana e não foi feito.

## Portão de prontidão (E2) — 2026-10-28

| # | Verificação | Resultado |
|---|---|---|
| V1 | Tasks concluídas | OK (5 de 5) |
| V2 | Suíte verde por task | OK (644, 651, 675, 688, 696 testes) |
| V3 | Dois testes por task | OK |
| V4 | Teste de regressão na primeira task (bug da runx) | n/a |
| V5 | QA da runx aprovado | n/a |
| V6 | Auditoria da sprintx aprovada | OK (`VEREDITO: SIM`, nenhuma volta à F3) |
| V7 | Bloqueio aberto no escopo entregue | OK (nenhum bloqueio; uma pendência `decisao_humana` não bloqueante) |
| V8 | Modo legado | n/a (sem `docs/legado/PERFIL.md`) |
| V9 | Arquivo alterado fora da lista declarada | OK com aviso (ver Avisos) |
| V10 | Segredo, credencial ou dado real de cliente | OK |

## Avisos

- Os artefatos desta entrega ficam em `docs/saldo-e-resumo-do-mes/` (não em `docs/entregas/saldo-e-resumo-do-mes/`), por determinação do orquestrador do buildx (PR-24).
- Branch empilhada: a base é `feat/ft-03-lancamentos-da-casa`; o diff do PR contém só a FT-04.
- V9: `tests/rotas.test.ts` teve a afirmação do painel vazio substituída pela do resumo e uma citação de linha no `CONVENCOES.md` e em `tests/convencoes.test.ts` foi deslocada (206 para 207); `tests/demonstracao.test.ts` teve contagens atualizadas (seis para quinze lançamentos); `docs/projeto/*`, `README.md` e `docs/stack/CONVENCOES.md` são registros do processo.
- A seed passou a ter oito lançamentos no mês corrente (eram seis): o roteiro de QA da FT-03 fala em seis linhas na lista.
- V10: o diff contém só as senhas fictícias de demonstração já existentes (`demo1234`) e nenhuma chave, token ou dado real.
- V6: auditoria e classificação de atenção feitas pela mesma sessão que implementou (sem os agentes `auditor-plano`, `revisor-testes` e `revisor-diff` neste harness).
- Sem `DIVIDA.md`, sem raio de impacto e sem índice do memox: seções correspondentes omitidas. A F3.5 (estimativa) é opcional no modo autônomo e foi pulada.

## Desvios

Nenhum arquivo fora do escopo da feature. Divergências de método: (1) um comando encadeado commitou o painel (T-02.02) antes de eu notar que `tests/convencoes.test.ts` falhava por citação deslocada; o commit foi corrigido com `--amend` antes de qualquer outra coisa, ainda na mesma task, e a suíte inteira foi rodada verde depois; (2) a skill `dataviz` era opcional e não foi usada (a barra é um trilho sob cada categoria, sem gráfico); (3) as premissas PR-08 e PR-29 foram marcadas realizadas no planejamento, antes do código, e o teste que as confere (T-03.01) só foi escrito no fim.

## Verificação final — 2026-10-28

`npm run verificar` terminou com código 0: `eslint .` sem achados, `tsc --noEmit` sem erro, `next build` ok (o painel `/` passou a ser dinâmico por ler `?mes=`), `vitest run` com `Test Files  37 passed (37)` e `Tests  696 passed (696)`, e `npm audit --audit-level=high` sem achado alto ou crítico (restam as `2 moderate severity vulnerabilities` do `vitest`/`@vitest/mocker`, só de ferramenta de teste, já registradas na FT-01).
