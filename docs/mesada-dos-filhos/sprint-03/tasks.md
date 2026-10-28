---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: mesada-dos-filhos
origem_buildx: financas-da-familia
feature_id: FT-06
atualizado_em: 2026-10-28
sprint_id: sprint-03
sprint:
  titulo: Seed, premissas e convencoes
  status: concluido
  criterio_saida: A suite inteira termina com 0 failed; a seed cria movimentos ficticios para os dois filhos sem duplicar; PR-01, PR-32 e PR-33 realizadas; CONVENCOES.md com evidencia conferida; quatro comandos verdes
  riscos: [citacoes de linha deslocadas por linhas novas, saldo da seed dependente do relogio]
  fora_de_escopo: [Exportar e apagar dados do filho]
fases:
  - id: F-03.1
    titulo: Seed de demonstracao
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01]
  - id: F-03.2
    titulo: Premissas, convencoes e README
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.02]
tasks:
  - id: T-03.01
    titulo: "Seed de demonstracao com movimentos de mesada"
    fase: F-03.1
    status: concluida
    objetivo: Estender prisma/demonstracao.ts com movimentos ficticios de credito e gasto para Ana (saldo positivo) e Pedro (saldo negativo), ids fixos, upsert sem sobrescrever, e prisma/seed.ts se preciso
    arquivos:
      cria: []
      altera: ["prisma/demonstracao.ts", "tests/demonstracao.test.ts"]
    teste_integracao: A seed cria movimentos para os dois filhos, rodar duas vezes nao duplica, e o servico calcula Ana com saldo positivo e Pedro com saldo negativo; Ana entra e meuExtrato traz so os dela
    teste_funcional: Todo valor da seed e inteiro positivo em centavos; as datas sao dias civis validos; nao roda em producao; nenhum movimento aponta para filho inexistente
    criterio_aceite: tests/demonstracao.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-02.03]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (1182 testes)

  - id: T-03.02
    titulo: "Premissas realizadas, convencoes com evidencia, README e mapa"
    fase: F-03.2
    status: concluida
    objetivo: Marcar PR-01, PR-32 e PR-33 como realizadas em FT-06, documentar no CONVENCOES.md a mesada com evidencia arquivo:linha (dinheiro, autorizacao, dados, auditoria, nota para a FT-07), atualizar README, MAPA e PROJETO, e reconferir todas as citacoes de linha
    arquivos:
      cria: []
      altera: ["docs/projeto/PREMISSAS.md", "docs/stack/CONVENCOES.md", "docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "README.md", "tests/premissas.test.ts", "tests/convencoes.test.ts"]
    teste_integracao: tests/premissas.test.ts confere PR-01, PR-32 e PR-33 Realizada em FT-06 e o frontmatter; tests/convencoes.test.ts confere cada citacao nova da mesada contra a linha que contem o nome citado
    teste_funcional: As PR-32 e PR-33 sao f2_autonoma, provisorias e dizem o que as invalidaria; a seccao de dinheiro cita o saldo por groupBy e o Cascade; nenhuma citacao quebrada; a nota para a FT-07 esta no arquivo
    criterio_aceite: tests/premissas.test.ts e tests/convencoes.test.ts terminam com 0 failed e npm run verificar termina com codigo 0
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (1193 testes)

---

# Plano — Sprint 03 — Seed, premissas e convenções

## Objetivo da sprint

Seed, premissas e convenções.

## Critério de saída da sprint

A suite inteira termina com 0 failed; a seed cria movimentos ficticios para os dois filhos sem duplicar; PR-01, PR-32 e PR-33 realizadas; CONVENCOES.md com evidencia conferida; quatro comandos verdes
