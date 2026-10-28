---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: fundacao
origem_buildx: financas-da-familia
feature_id: FT-01
entregue_por: mergex
titulo: Fundacao - acesso, papeis e esqueleto
tipo_trabalho: feature
tipo_ocorrencia: null
estado: entregue
versionado: true
branch: feat/ft-01-fundacao
branch_base: main
commits:
  - task: T-01.01
    commit: 0833374
  - task: T-01.02
    commit: f52ae67
  - task: T-01.03
    commit: 0f68f90
  - task: T-02.01
    commit: fc97a26
  - task: T-02.02
    commit: bc812fa
  - task: T-02.03
    commit: 985e88c
  - task: T-03.01
    commit: e9f2793
  - task: T-03.02
    commit: a42ba54
  - task: T-03.03
    commit: 2d4f954
  - task: T-04.01
    commit: 71d7d2b
  - task: T-04.02
    commit: 7fbf9cb
  - task: T-04.03
    commit: c164c11
  - task: T-04.04
    commit: e83574e
  - task: T-04.05
    commit: 2a4068d
modulo_afetado: [apresentacao, aplicacao, dados, lib, estilos, testes, infra, documentacao]
arquivos_alterados: [.github/workflows/verificar.yml, .gitignore, README.md, docs/fundacao/00-AUDITORIA.md, docs/fundacao/00-BLOQUEIOS.md, docs/fundacao/00-DECISOES.md, docs/fundacao/ATENCAO.md, docs/fundacao/ENTREGA.md, docs/fundacao/FECHAMENTO.md, docs/fundacao/ORQUESTRADOR.md, docs/fundacao/PR.md, docs/fundacao/QA-PACOTE.md, docs/fundacao/base/00-INDICE.md, docs/fundacao/base/00-LACUNAS.md, docs/fundacao/base/01-casca-e-navegacao.md, docs/fundacao/base/02-autenticacao-e-sessao.md, docs/fundacao/base/03-testes-seed-e-qualidade.md, docs/fundacao/sprint-01/tasks.md, docs/fundacao/sprint-02/tasks.md, docs/fundacao/sprint-03/tasks.md, docs/fundacao/sprint-04/tasks.md, docs/projeto/MAPA.md, docs/projeto/PREMISSAS.md, docs/sprintx/estimativas/HISTORICO.md, docs/stack/CONVENCOES.md, docs/stack/LACUNAS.md, package-lock.json, package.json, prisma/demonstracao.ts, prisma/seed.ts, src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx, src/app/(sistema)/configuracoes/usuarios/page.tsx, src/app/(sistema)/error.tsx, src/app/(sistema)/layout.tsx, src/app/(sistema)/loading.tsx, src/app/(sistema)/page.tsx, src/app/(sistema)/perfil/page.tsx, src/app/(sistema)/perfil/senha/page.tsx, src/app/acoes.ts, src/app/api/sessao/renovar/route.ts, src/app/entrar/page.tsx, src/app/error.tsx, src/app/layout.tsx, src/app/not-found.tsx, src/app/sessao-servidor.ts, src/componentes/BotaoDaGaveta.tsx, src/componentes/CascaDoSistema.tsx, src/componentes/EstadoDeCarregando.tsx, src/componentes/EstadoDeErro.tsx, src/componentes/RenovadorDeSessao.tsx, src/estilos/global.css, src/estilos/tokens.css, src/lib/erros.ts, src/lib/formato.ts, src/lib/gaveta.ts, src/lib/limite-de-tentativas.ts, src/lib/marca.ts, src/lib/papeis.ts, src/lib/renovacao.ts, src/servicos/autenticacao.ts, tests/ajuda-estatica.ts, tests/autenticacao.test.ts, tests/camadas.test.ts, tests/convencoes.test.ts, tests/demonstracao.test.ts, tests/estados.test.ts, tests/formato.test.ts, tests/gaveta.test.ts, tests/harness-componentes.test.ts, tests/limite-de-tentativas.test.ts, tests/marca.test.ts, tests/papeis.test.ts, tests/premissas.test.ts, tests/qualidade.test.ts, tests/renderizar.ts, tests/renovacao.test.ts, tests/rotas.test.ts, tests/seguranca-base.test.ts, tests/tema.test.ts]
faixa_atencao:
  - arquivo: .github/workflows/verificar.yml
    faixa: alta
  - arquivo: .gitignore
    faixa: baixa
  - arquivo: README.md
    faixa: media
  - arquivo: docs/fundacao/00-AUDITORIA.md
    faixa: baixa
  - arquivo: docs/fundacao/00-BLOQUEIOS.md
    faixa: baixa
  - arquivo: docs/fundacao/00-DECISOES.md
    faixa: baixa
  - arquivo: docs/fundacao/ATENCAO.md
    faixa: baixa
  - arquivo: docs/fundacao/ENTREGA.md
    faixa: baixa
  - arquivo: docs/fundacao/FECHAMENTO.md
    faixa: baixa
  - arquivo: docs/fundacao/ORQUESTRADOR.md
    faixa: baixa
  - arquivo: docs/fundacao/PR.md
    faixa: baixa
  - arquivo: docs/fundacao/QA-PACOTE.md
    faixa: baixa
  - arquivo: docs/fundacao/base/00-INDICE.md
    faixa: baixa
  - arquivo: docs/fundacao/base/00-LACUNAS.md
    faixa: baixa
  - arquivo: docs/fundacao/base/01-casca-e-navegacao.md
    faixa: baixa
  - arquivo: docs/fundacao/base/02-autenticacao-e-sessao.md
    faixa: baixa
  - arquivo: docs/fundacao/base/03-testes-seed-e-qualidade.md
    faixa: baixa
  - arquivo: docs/fundacao/sprint-01/tasks.md
    faixa: baixa
  - arquivo: docs/fundacao/sprint-02/tasks.md
    faixa: baixa
  - arquivo: docs/fundacao/sprint-03/tasks.md
    faixa: baixa
  - arquivo: docs/fundacao/sprint-04/tasks.md
    faixa: baixa
  - arquivo: docs/projeto/MAPA.md
    faixa: baixa
  - arquivo: docs/projeto/PREMISSAS.md
    faixa: media
  - arquivo: docs/sprintx/estimativas/HISTORICO.md
    faixa: baixa
  - arquivo: docs/stack/CONVENCOES.md
    faixa: media
  - arquivo: docs/stack/LACUNAS.md
    faixa: media
  - arquivo: package-lock.json
    faixa: alta
  - arquivo: package.json
    faixa: alta
  - arquivo: prisma/demonstracao.ts
    faixa: alta
  - arquivo: prisma/seed.ts
    faixa: alta
  - arquivo: src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx
    faixa: media
  - arquivo: src/app/(sistema)/configuracoes/usuarios/page.tsx
    faixa: alta
  - arquivo: src/app/(sistema)/error.tsx
    faixa: media
  - arquivo: src/app/(sistema)/layout.tsx
    faixa: alta
  - arquivo: src/app/(sistema)/loading.tsx
    faixa: media
  - arquivo: src/app/(sistema)/page.tsx
    faixa: media
  - arquivo: src/app/(sistema)/perfil/page.tsx
    faixa: baixa
  - arquivo: src/app/(sistema)/perfil/senha/page.tsx
    faixa: baixa
  - arquivo: src/app/acoes.ts
    faixa: media
  - arquivo: src/app/api/sessao/renovar/route.ts
    faixa: alta
  - arquivo: src/app/entrar/page.tsx
    faixa: media
  - arquivo: src/app/error.tsx
    faixa: media
  - arquivo: src/app/layout.tsx
    faixa: media
  - arquivo: src/app/not-found.tsx
    faixa: media
  - arquivo: src/app/sessao-servidor.ts
    faixa: alta
  - arquivo: src/componentes/BotaoDaGaveta.tsx
    faixa: media
  - arquivo: src/componentes/CascaDoSistema.tsx
    faixa: media
  - arquivo: src/componentes/EstadoDeCarregando.tsx
    faixa: media
  - arquivo: src/componentes/EstadoDeErro.tsx
    faixa: media
  - arquivo: src/componentes/RenovadorDeSessao.tsx
    faixa: alta
  - arquivo: src/estilos/global.css
    faixa: media
  - arquivo: src/estilos/tokens.css
    faixa: media
  - arquivo: src/lib/erros.ts
    faixa: alta
  - arquivo: src/lib/formato.ts
    faixa: media
  - arquivo: src/lib/gaveta.ts
    faixa: media
  - arquivo: src/lib/limite-de-tentativas.ts
    faixa: alta
  - arquivo: src/lib/marca.ts
    faixa: media
  - arquivo: src/lib/papeis.ts
    faixa: media
  - arquivo: src/lib/renovacao.ts
    faixa: media
  - arquivo: src/servicos/autenticacao.ts
    faixa: alta
  - arquivo: tests/ajuda-estatica.ts
    faixa: media
  - arquivo: tests/autenticacao.test.ts
    faixa: baixa
  - arquivo: tests/camadas.test.ts
    faixa: baixa
  - arquivo: tests/convencoes.test.ts
    faixa: baixa
  - arquivo: tests/demonstracao.test.ts
    faixa: baixa
  - arquivo: tests/estados.test.ts
    faixa: baixa
  - arquivo: tests/formato.test.ts
    faixa: baixa
  - arquivo: tests/gaveta.test.ts
    faixa: baixa
  - arquivo: tests/harness-componentes.test.ts
    faixa: baixa
  - arquivo: tests/limite-de-tentativas.test.ts
    faixa: baixa
  - arquivo: tests/marca.test.ts
    faixa: baixa
  - arquivo: tests/papeis.test.ts
    faixa: baixa
  - arquivo: tests/premissas.test.ts
    faixa: baixa
  - arquivo: tests/qualidade.test.ts
    faixa: baixa
  - arquivo: tests/renderizar.ts
    faixa: baixa
  - arquivo: tests/renovacao.test.ts
    faixa: baixa
  - arquivo: tests/rotas.test.ts
    faixa: baixa
  - arquivo: tests/seguranca-base.test.ts
    faixa: media
  - arquivo: tests/tema.test.ts
    faixa: baixa
raio: null
atencao:
  olho_obrigatorio: 13
  leitura_rapida: 26
  dispensavel: 40
portao: pronto
desvios: []
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-10-28
atualizado_em: 2026-10-28
entregue_em: 2026-10-28
---

# Entrega — Fundação: acesso, papéis e esqueleto

Fundação do Finanças da Família entregue na branch `feat/ft-01-fundacao` (14 commits de task mais o de planejamento), pronta para revisão; o pull request não pôde ser aberto porque o repositório não tem remoto.

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
- Commits: 14, um por task
- Atenção humana: 13 olho obrigatório, 26 leitura rápida, 40 dispensável
- Push: não feito — não há remoto configurado
- Pull request: não aberto — pendência `recurso_externo` (criar o remoto, empurrar a branch e abrir o PR com o conteúdo de PR.md)
- Falta para o merge: revisão humana, QA com o pacote, e um remoto. O merge é decisão humana e não foi feito.

## Portão de prontidão (E2) — 2026-10-28

| # | Verificação | Resultado |
|---|---|---|
| V1 | Tasks concluídas | OK (14 de 14) |
| V2 | Suíte verde por task | OK |
| V3 | Dois testes por task | OK |
| V4 | Teste de regressão na primeira task (bug da runx) | n/a |
| V5 | QA da runx aprovado | n/a |
| V6 | Auditoria da sprintx aprovada | OK (`VEREDITO: SIM`, uma volta à F3) |
| V7 | Bloqueio aberto no escopo entregue | OK (nenhum bloqueio) |
| V8 | Modo legado | n/a (sem `docs/legado/PERFIL.md`) |
| V9 | Arquivo alterado fora da lista declarada | OK (os arquivos novos de `docs/` foram declarados por diretório) |
| V10 | Segredo, credencial ou dado real de cliente | OK com aviso |

## Avisos

- Os artefatos desta entrega ficam em `docs/fundacao/` (não em `docs/entregas/fundacao/`), por determinação do orquestrador do buildx (PR-24).
- V10: o diff contém senhas fictícias de demonstração (`demo1234`, na seed e no README) e de teste; são intencionais (PR-04), não há chave, token nem dado real.
- V6: auditoria e classificação de atenção feitas pela mesma sessão que implementou (sem os agentes `auditor-plano`, `revisor-testes` e `revisor-diff` neste harness).
- Sem `DIVIDA.md`, sem raio de impacto e sem índice do memox: seções correspondentes omitidas.

## Desvios

Nenhum arquivo fora da lista declarada nas tasks. Divergências de método registradas nas tasks (ver `sprint-0N/tasks.md`).
