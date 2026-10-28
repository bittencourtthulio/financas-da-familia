---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: trilha-de-atividade
origem_buildx: financas-da-familia
feature_id: FT-02
titulo: Trilha de atividade
tipo_trabalho: feature
fechado_em: 2026-10-28
modulo_afetado: [dados, aplicacao, apresentacao, lib, estilos, testes, documentacao]
arquivos_alterados: [README.md, docs/projeto/MAPA.md, docs/projeto/PREMISSAS.md, docs/projeto/PROJETO.md, docs/sprintx/estimativas/HISTORICO.md, docs/stack/CONVENCOES.md, docs/trilha-de-atividade/00-AUDITORIA.md, docs/trilha-de-atividade/00-BLOQUEIOS.md, docs/trilha-de-atividade/00-DECISOES.md, docs/trilha-de-atividade/ATENCAO.md, docs/trilha-de-atividade/ENTREGA.md, docs/trilha-de-atividade/FECHAMENTO.md, docs/trilha-de-atividade/ORQUESTRADOR.md, docs/trilha-de-atividade/PR.md, docs/trilha-de-atividade/QA-PACOTE.md, docs/trilha-de-atividade/base/00-INDICE.md, docs/trilha-de-atividade/base/00-LACUNAS.md, docs/trilha-de-atividade/base/01-usuarios-e-autorizacao.md, docs/trilha-de-atividade/base/02-dados-e-testes.md, docs/trilha-de-atividade/base/03-interface.md, docs/trilha-de-atividade/sprint-01/tasks.md, docs/trilha-de-atividade/sprint-02/tasks.md, docs/trilha-de-atividade/sprint-03/tasks.md, prisma/demonstracao.ts, prisma/migrations/20261028143052_atividade/migration.sql, prisma/schema.prisma, src/app/(sistema)/atividade/page.tsx, src/componentes/Navegacao.tsx, src/componentes/PaginacaoDeAtividade.tsx, src/componentes/TabelaDeAtividade.tsx, src/lib/atividade.ts, src/servicos/atividade.ts, src/servicos/usuarios.ts, tests/ajuda.ts, tests/atividade-dados.test.ts, tests/atividade-leitura.test.ts, tests/atividade-tela.test.ts, tests/atividade.test.ts, tests/convencoes.test.ts, tests/demonstracao.test.ts, tests/premissas.test.ts, tests/rotas.test.ts, tests/usuarios-atividade.test.ts]
sprints: 3
tasks: 8
testes_novos: 77
suite_final: 250
---

# Fechamento — trilha-de-atividade

## O que foi entregue

- Entidade `Atividade` (tabela `atividades`, migration `20261028143052_atividade`), sem chave estrangeira para usuários.
- `registrarAtividade` (`src/servicos/atividade.ts`): catálogo fechado de ações, detalhe plano, barreira contra senha, hash, token, segredo, valor, saldo, e-mail e CPF, aceita o cliente de uma transação, sem como editar nem apagar.
- `listarAtividade`: só `admin`, mais recente primeiro, 50 por página.
- Criar usuário, mudar papel e desativar usuário gravam o registro na mesma transação; reativar e editar nome ou e-mail não.
- Tela `/atividade` e item de menu só para o responsável; estados vazio, carregando (herdado) e erro (herdado); dois temas e celular pelos tokens existentes.
- Seed: duas atividades fictícias idempotentes.
- PR-10 realizada; PR-25 criada (`f2_autonoma`).

## Sprints

| Sprint | Tasks | Resultado |
|---|---|---|
| sprint-01 | T-01.01 a T-01.03 | concluído |
| sprint-02 | T-02.01, T-02.02 | concluído |
| sprint-03 | T-03.01 a T-03.03 | concluído |

## Testes

77 testes novos (173 → 250), em 5 arquivos novos (dados, serviço, leitura, tela e usuários com atividade) e ampliações em rotas, seed, premissas e convenções.

## Pendências e observações

- `recurso_externo`: não há remoto; o PR não foi aberto.
- Observação para a FT-07: o registro guarda o nome do usuário afetado em `detalhe`; ao apagar de verdade uma conta de filho, a FT-07 decide se apaga ou anonimiza essas linhas (PR-09, PR-25).
- Quando FT-03 e FT-06 chegarem, cada uma acrescenta suas ações a `src/lib/atividade.ts` e chama `registrarAtividade`.
