---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: privacidade-dos-dados
origem_buildx: financas-da-familia
feature_id: FT-07
atualizado_em: 2026-10-28
sprint_id: sprint-03
sprint:
  titulo: Seed, premissas e convencoes
  status: concluido
  criterio_saida: A suite inteira termina com 0 failed; a seed segue idempotente; PR-09, PR-34 e PR-35 realizadas; CONVENCOES.md com evidencia conferida; quatro comandos verdes
  riscos: [citacoes de linha deslocadas por linhas novas, ordem dos testes que leem o MAPA]
  fora_de_escopo: [Backup e saude (FT-08)]
fases:
  - id: F-03.1
    titulo: Seed e README
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01]
  - id: F-03.2
    titulo: Premissas e convencoes
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.02]
tasks:
  - id: T-03.01
    titulo: "Seed continua idempotente, exportacao da demonstracao e README"
    fase: F-03.1
    status: concluida
    objetivo: Provar que a seed de demonstracao segue idempotente com a feature e que a exportacao dos dados semeados e valida e sem segredo; descrever a privacidade no README
    arquivos:
      cria: ["tests/privacidade-demonstracao.test.ts"]
      altera: ["README.md"]
    teste_integracao: Depois de rodar a seed duas vezes, a exportacao traz os 4 usuarios de demonstracao, os 2 filhos com os movimentos e o saldo de cada um, sem hash nem segredo; apagar um filho de demonstracao pelo servico deixa a seed rodar de novo sem erro
    teste_funcional: A seed continua barrada em producao; a contagem de usuarios, filhos e lancamentos depois de duas execucoes nao muda; o README cita Privacidade, o download e o apagar
    criterio_aceite: tests/privacidade-demonstracao.test.ts e tests/demonstracao.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-02.03]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (1314 testes)

  - id: T-03.02
    titulo: "PR-09 realizada, convencoes com evidencia e fechamento"
    fase: F-03.2
    status: concluida
    objetivo: Marcar PR-09, PR-34 e PR-35 como Realizada em FT-07, atualizar a secao de dados e privacidade do CONVENCOES.md com evidencia arquivo:linha, reconferir as citacoes deslocadas e fechar MAPA e PROJETO
    arquivos:
      cria: []
      altera: ["docs/stack/CONVENCOES.md", "docs/projeto/PREMISSAS.md", "docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "tests/premissas.test.ts", "tests/convencoes.test.ts"]
    teste_integracao: tests/convencoes.test.ts confere cada citacao nova da privacidade contra a linha que contem o nome citado e nenhuma citacao antiga ficou quebrada; tests/premissas.test.ts confere PR-09, PR-34 e PR-35 como Realizada em FT-07
    teste_funcional: As premissas de outras features nao foram marcadas por engano; PR-34 e PR-35 sao f2_autonoma, provisorias, com pendencia decisao_humana; o historico do CONVENCOES.md registra a FT-07; os quatro comandos terminam com codigo 0
    criterio_aceite: tests/convencoes.test.ts e tests/premissas.test.ts terminam com 0 failed e npm run verificar passa
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (1324 testes)

---

# Plano — Sprint 03 — Seed, premissas e convencoes

## Objetivo da sprint

Seed, premissas e convencoes.

## Critério de saída da sprint

A suite inteira termina com 0 failed; a seed segue idempotente; PR-09, PR-34 e PR-35 realizadas; CONVENCOES.md com evidencia conferida; quatro comandos verdes
