---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: backup-e-saude
origem_buildx: financas-da-familia
feature_id: FT-08
entregue_por: mergex
titulo: Backup, restauração e saúde
tipo_trabalho: feature
tipo_ocorrencia: null
estado: entregue
versionado: true
branch: feat/ft-08-backup-e-saude
branch_base: feat/ft-07-privacidade-dos-dados
commits:
  - task: T-01.01
    commit: 440b9df
  - task: T-01.02
    commit: 013a22e
  - task: T-01.03
    commit: 3e99250
  - task: T-02.01
    commit: 5621878
  - task: T-02.02
    commit: 679c7b7
  - task: T-02.03
    commit: 1f36f7d
  - task: T-03.01
    commit: 4415e3c
  - task: T-03.02
    commit: 1ec0202
  - task: T-03.03
    commit: 79badf5
  - task: T-03.04
    commit: 649e385
modulo_afetado: [lib, aplicacao, apresentacao, scripts, testes, documentacao]
arquivos_alterados: [.env.example, .gitignore, README.md, docs/backup-e-saude/00-AUDITORIA.md, docs/backup-e-saude/00-BLOQUEIOS.md, docs/backup-e-saude/00-DECISOES.md, docs/backup-e-saude/ATENCAO.md, docs/backup-e-saude/ENTREGA.md, docs/backup-e-saude/FECHAMENTO.md, docs/backup-e-saude/ORQUESTRADOR.md, docs/backup-e-saude/PR.md, docs/backup-e-saude/QA-PACOTE.md, docs/backup-e-saude/base/00-INDICE.md, docs/backup-e-saude/base/00-LACUNAS.md, docs/backup-e-saude/sprint-01/tasks.md, docs/backup-e-saude/sprint-02/tasks.md, docs/backup-e-saude/sprint-03/tasks.md, docs/projeto/MAPA.md, docs/projeto/PREMISSAS.md, docs/projeto/PROJETO.md, docs/stack/CONVENCOES.md, docs/stack/LACUNAS.md, package-lock.json, package.json, scripts/backup.ts, scripts/limpar-logs.ts, scripts/restaurar.ts, src/app/acoes.ts, src/app/api/privacidade/exportar/route.ts, src/app/api/saude/route.ts, src/app/api/sessao/renovar/route.ts, src/instrumentation.ts, src/lib/ambiente.ts, src/lib/backup.ts, src/lib/chaves-proibidas.ts, src/lib/erros.ts, src/lib/log-arquivo.ts, src/lib/log.ts, src/lib/restauracao.ts, src/servicos/atividade.ts, src/servicos/saude.ts, tests/ambiente-start.test.ts, tests/backup-ponta-a-ponta.test.ts, tests/backup.test.ts, tests/banco-temporario.ts, tests/convencoes.test.ts, tests/erro-rotas.test.ts, tests/erro-sem-pilha.test.ts, tests/log-retencao.test.ts, tests/log.test.ts, tests/premissas.test.ts, tests/restauracao.test.ts, tests/rotas.test.ts, tests/saude-rotas.test.ts, tests/saude.test.ts, tests/setup.ts]
faixa_atencao:
  - arquivo: .env.example
    faixa: media
  - arquivo: .gitignore
    faixa: media
  - arquivo: README.md
    faixa: media
  - arquivo: docs/backup-e-saude/00-AUDITORIA.md
    faixa: baixa
  - arquivo: docs/backup-e-saude/00-BLOQUEIOS.md
    faixa: baixa
  - arquivo: docs/backup-e-saude/00-DECISOES.md
    faixa: baixa
  - arquivo: docs/backup-e-saude/ATENCAO.md
    faixa: baixa
  - arquivo: docs/backup-e-saude/ENTREGA.md
    faixa: baixa
  - arquivo: docs/backup-e-saude/FECHAMENTO.md
    faixa: baixa
  - arquivo: docs/backup-e-saude/ORQUESTRADOR.md
    faixa: baixa
  - arquivo: docs/backup-e-saude/PR.md
    faixa: baixa
  - arquivo: docs/backup-e-saude/QA-PACOTE.md
    faixa: baixa
  - arquivo: docs/backup-e-saude/base/00-INDICE.md
    faixa: baixa
  - arquivo: docs/backup-e-saude/base/00-LACUNAS.md
    faixa: baixa
  - arquivo: docs/backup-e-saude/sprint-01/tasks.md
    faixa: baixa
  - arquivo: docs/backup-e-saude/sprint-02/tasks.md
    faixa: baixa
  - arquivo: docs/backup-e-saude/sprint-03/tasks.md
    faixa: baixa
  - arquivo: docs/projeto/MAPA.md
    faixa: baixa
  - arquivo: docs/projeto/PREMISSAS.md
    faixa: media
  - arquivo: docs/projeto/PROJETO.md
    faixa: baixa
  - arquivo: docs/stack/CONVENCOES.md
    faixa: media
  - arquivo: docs/stack/LACUNAS.md
    faixa: media
  - arquivo: package-lock.json
    faixa: media
  - arquivo: package.json
    faixa: media
  - arquivo: scripts/backup.ts
    faixa: media
  - arquivo: scripts/limpar-logs.ts
    faixa: media
  - arquivo: scripts/restaurar.ts
    faixa: media
  - arquivo: src/app/acoes.ts
    faixa: media
  - arquivo: src/app/api/privacidade/exportar/route.ts
    faixa: media
  - arquivo: src/app/api/saude/route.ts
    faixa: alta
  - arquivo: src/app/api/sessao/renovar/route.ts
    faixa: media
  - arquivo: src/instrumentation.ts
    faixa: alta
  - arquivo: src/lib/ambiente.ts
    faixa: media
  - arquivo: src/lib/backup.ts
    faixa: alta
  - arquivo: src/lib/chaves-proibidas.ts
    faixa: alta
  - arquivo: src/lib/erros.ts
    faixa: alta
  - arquivo: src/lib/log-arquivo.ts
    faixa: media
  - arquivo: src/lib/log.ts
    faixa: alta
  - arquivo: src/lib/restauracao.ts
    faixa: alta
  - arquivo: src/servicos/atividade.ts
    faixa: media
  - arquivo: src/servicos/saude.ts
    faixa: alta
  - arquivo: tests/ambiente-start.test.ts
    faixa: baixa
  - arquivo: tests/backup-ponta-a-ponta.test.ts
    faixa: baixa
  - arquivo: tests/backup.test.ts
    faixa: baixa
  - arquivo: tests/banco-temporario.ts
    faixa: baixa
  - arquivo: tests/convencoes.test.ts
    faixa: baixa
  - arquivo: tests/erro-rotas.test.ts
    faixa: baixa
  - arquivo: tests/erro-sem-pilha.test.ts
    faixa: baixa
  - arquivo: tests/log-retencao.test.ts
    faixa: baixa
  - arquivo: tests/log.test.ts
    faixa: baixa
  - arquivo: tests/premissas.test.ts
    faixa: baixa
  - arquivo: tests/restauracao.test.ts
    faixa: baixa
  - arquivo: tests/rotas.test.ts
    faixa: baixa
  - arquivo: tests/saude-rotas.test.ts
    faixa: baixa
  - arquivo: tests/saude.test.ts
    faixa: baixa
  - arquivo: tests/setup.ts
    faixa: baixa
raio: null
atencao:
  olho_obrigatorio: 8
  leitura_rapida: 17
  dispensavel: 31
portao: pronto
desvios: [ver Desvios]
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-10-28
atualizado_em: 2026-10-28
entregue_em: 2026-10-28
---
# Entrega — Backup, restauração e saúde

Backup, restauração e saúde entregues na branch `feat/ft-08-backup-e-saude` (10 commits de task, mais o de planejamento e o de fechamento), empilhada sobre `feat/ft-07-privacidade-dos-dados`, que está sobre as branches das FT-01 a FT-06; nada foi mergeado. O pull request não pôde ser aberto porque o repositório não tem remoto; quando existir, ele mira a branch da FT-07 (ou `main`, depois que as anteriores forem mergeadas).

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
- Commits: 10, um por task
- Atenção humana: 8 olho obrigatório, 17 leitura rápida, 31 dispensável
- Push: não feito — não há remoto configurado
- Pull request: não aberto — pendência `recurso_externo` (criar o remoto, empurrar a branch e abrir o PR com o conteúdo de PR.md, mirando `feat/ft-07-privacidade-dos-dados`)
- Falta para o merge: revisão humana, QA com o pacote, um remoto, e o merge da FT-01 a FT-07 antes (ou junto). O merge é decisão humana e não foi feito.

## Portão de prontidão (E2) — 2026-10-28

| # | Verificação | Resultado |
|---|---|---|
| V1 | Tasks concluídas | OK (10 de 10) |
| V2 | Suíte verde por task | OK com ressalva: teste da task e lint/tipos a cada task; suíte inteira ao fim de cada sprint e no `verificar` final (1444 testes). Ver Desvios |
| V3 | Dois testes por task | OK (integração e funcional em cada task) |
| V4 | Teste de regressão na primeira task (bug da runx) | n/a |
| V5 | QA da runx aprovado | n/a |
| V6 | Auditoria da sprintx aprovada | OK (`VEREDITO: SIM`, nenhuma volta à F3) |
| V7 | Bloqueio aberto no escopo entregue | OK (nenhum bloqueio; seis pendências não bloqueantes) |
| V8 | Modo legado | n/a (sem `docs/legado/PERFIL.md`) |
| V9 | Arquivo alterado fora da lista declarada | OK com aviso (ver Avisos) |
| V10 | Segredo, credencial ou dado real de cliente | OK |

## Avisos

- Os artefatos desta entrega ficam em `docs/backup-e-saude/`, por determinação do orquestrador do buildx (PR-24).
- Branch empilhada: a base é `feat/ft-07-privacidade-dos-dados`; o diff do PR contém só a FT-08.
- V9: `src/app/acoes.ts`, `src/app/api/sessao/renovar/route.ts`, `src/app/api/privacidade/exportar/route.ts` (troca de `console.error`), `src/servicos/atividade.ts` (lista de chaves movida), `tests/setup.ts`, `docs/stack/LACUNAS.md` (L-01) foram tocados além do plano inicial; `docs/projeto/*`, `README.md` e `docs/stack/CONVENCOES.md` são registros do processo.
- O commit de planejamento (`d63989b`) já incluiu `package.json`/`package-lock.json` com a dependência e os três scripts, porque foram preparados antes do primeiro commit; o código dos scripts veio nas tasks T-01.02, T-03.01 e T-03.02.
- A prova do servidor real da saúde ficou em `tests/saude-rotas.test.ts` (banco inacessível) e num bloco ao fim de `tests/rotas.test.ts` (rota pública), sem deslocar as citações de linha do CONVENCOES.md.
- V6: auditoria e classificação feitas pela mesma sessão que implementou (sem os agentes `auditor-plano`, `revisor-testes` e `revisor-diff` neste harness).
- Não há middleware nem proxy no projeto (cada página e rota guarda a si mesma), então não há lista de rotas públicas para ampliar; a prova de que só `/api/saude` e `/entrar` são públicas está em `tests/rotas.test.ts`.

## Defeitos achados

1. O gancho `register()` do Next que lança NÃO derruba o processo: o Next imprime "Ready", registra "Failed to prepare server" e segue de pé sem atender. Achado pelo teste do `next start` real (visto falhar) e corrigido com `process.exit(1)` depois de imprimir a mensagem.
2. `console.error(erro)` em `src/app/acoes.ts` e nas rotas `sessao/renovar` e `privacidade/exportar` imprimia mensagem e pilha (que pode trazer e-mail ou valor) sem identificador. Trocado por log estruturado com código de correlação.
3. O servidor de produção subido pelos testes escrevia em `logs/` na raiz do projeto, e um teste meu ("sem LOG_DIR nada é gravado") falhou na suíte inteira por causa disso (passou isolado). Corrigido: `tests/setup.ts` desliga o arquivo de log nos testes e o teste compara o conteúdo de `logs/` antes e depois.
4. Uma execução de `mv` no meio de uma verificação de "teste vermelho" sobrescreveu `src/lib/backup.ts` com o script de mesmo nome; o arquivo foi recriado antes de qualquer commit e a suíte reexecutada.
5. Achado fora do escopo, não corrigido: `editarFilho` não atualiza o `nome` do usuário de login do filho (FT-05). Pendência `trabalho_novo`.
6. O `dev.db` antigo da raiz só tem a tabela `usuarios` (nunca recebeu as migrations); a restauração o trataria como arquivo sem as tabelas esperadas.

## Desvios

- Suíte inteira por task: não foi rodada ao fim de cada task, e sim ao fim da sprint 02 (1386 de 1387 verdes) e no `verificar` final (1444 de 1444). Cada task rodou os testes da área, `eslint` e `tsc`. A suíte inteira leva cerca de quatro minutos.
- TDD: teste visto falhar antes do código em T-01.01, T-01.02, T-01.03, T-02.01, T-02.02 (o teste de `next start` falhou primeiro contra o gancho que só lançava), T-03.01 a T-03.03 (código removido de propósito para ver o erro de módulo ausente). Exceções: em T-03.04 os testes novos de convenções e premissas foram escritos depois da edição dos documentos (a primeira execução só falhou em testes antigos que fixavam 35 premissas); em T-02.03 os testes de rota pública e de 503 do servidor real passaram de primeira porque o comportamento foi implementado na T-02.01 (são provas, não guia de código); em T-03.01 a T-03.03 a primeira execução vermelha foi feita depois de o código existir, movendo-o para fora e restaurando, em vez de antes de escrevê-lo.
- Auditoria e classificação de atenção feitas pela mesma sessão.
- Não exercitado em navegador real: a feature não tem tela nova; só `fetch` ao servidor de produção.

## Verificação final — 2026-10-28

`npm run verificar` terminou com código 0: `eslint .` sem achados, `tsc --noEmit` sem erro, `next build` ok (nova rota `/api/saude`), `vitest run` com `Test Files  74 passed (74)` e `Tests  1444 passed (1444)`, e `npm audit --audit-level=high` com código 0 (restam as `2 moderate severity vulnerabilities` do `vitest`/`@vitest/mocker`, só de ferramenta de teste, já registradas na FT-01). O `tests/rotas.test.ts` passou de primeira, sem precisar de nova execução.
