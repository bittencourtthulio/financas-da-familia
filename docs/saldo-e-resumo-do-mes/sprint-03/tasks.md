---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: saldo-e-resumo-do-mes
origem_buildx: financas-da-familia
feature_id: FT-04
atualizado_em: 2026-10-28
sprint_id: sprint-03
sprint:
  titulo: Convenções, premissas e fechamento
  status: concluido
  criterio_saida: A suite inteira termina com 0 failed; o CONVENCOES.md cita a evidencia do resumo, a PR-08 e a PR-29 estao conferidas por teste, o README e o MAPA descrevem a entrega
  riscos: [Citacoes arquivo:linha do CONVENCOES.md deslocadas por linhas novas]
  fora_de_escopo: [Codigo de producao novo]
fases:
  - id: F-03.1
    titulo: Convencoes e fechamento
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01]
tasks:
  - id: T-03.01
    titulo: Convencoes com evidencia, premissas conferidas e README
    fase: F-03.1
    status: concluida
    objetivo: Acrescentar ao CONVENCOES.md a evidencia do calculo do resumo em centavos, da guarda por lista de permitidos no resumo e do parametro de mes validado com zod; reconferir as citacoes deslocadas; cobrir a PR-08 e a PR-29 em tests/premissas.test.ts e a convencao nova em tests/convencoes.test.ts; atualizar README
    arquivos:
      cria: []
      altera: [docs/stack/CONVENCOES.md, tests/premissas.test.ts, tests/convencoes.test.ts, README.md]
    teste_integracao: tests/convencoes.test.ts confere que toda citacao arquivo:linha existe, inclusive as novas para src/servicos/resumo.ts; tests/premissas.test.ts confere que a PR-08 e a PR-29 estao Realizada em FT-04 e que o frontmatter bate com os blocos
    teste_funcional: A PR-29 e f2_autonoma, provisoria e diz o que a invalidaria; a PR-08 deixou de ser null; o MAPA lista a PR-08 para a FT-04; a seção de Dinheiro do CONVENCOES cita o servico de resumo
    criterio_aceite: tests/convencoes.test.ts e tests/premissas.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (696 testes)

---

# Plano — Sprint 03 — Convenções, premissas e fechamento

## Objetivo da sprint

Fechar a feature: evidência nas convenções, premissas conferidas e README.

## Critério de saída da sprint

A suite inteira termina com 0 failed; o CONVENCOES.md cita a evidencia do resumo, a PR-08 e a PR-29 estao conferidas por teste, o README e o MAPA descrevem a entrega
