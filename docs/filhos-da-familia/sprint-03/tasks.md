---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: filhos-da-familia
origem_buildx: financas-da-familia
feature_id: FT-05
atualizado_em: 2026-10-28
sprint_id: sprint-03
sprint:
  titulo: Seed, convencoes e fechamento
  status: pendente
  criterio_saida: A suite inteira termina com 0 failed; a seed cria dois filhos com login e o isolamento e provado sobre ela; o CONVENCOES.md tem a evidencia do papel filho; PR-06 realizada; README e MAPA descrevem a entrega
  riscos: [citacoes arquivo:linha do CONVENCOES.md deslocadas por linhas novas]
  fora_de_escopo: [Codigo de producao novo]
fases:
  - id: F-03.1
    titulo: Seed de demonstracao
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01]
  - id: F-03.2
    titulo: Convencoes e fechamento
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.02]
tasks:
  - id: T-03.01
    titulo: Seed de demonstracao com dois filhos com login
    fase: F-03.1
    status: pendente
    objetivo: Estender prisma/demonstracao.ts e prisma/seed.ts com dois filhos ficticios, ambos com login de papel filho e credenciais de demonstracao ficticias, ids fixos e upsert sem sobrescrever, e documentar no README
    arquivos:
      cria: []
      altera: ["prisma/demonstracao.ts", "prisma/seed.ts", "tests/demonstracao.test.ts", "README.md"]
    teste_integracao: Depois da seed, os dois filhos existem com nome, valor em centavos inteiros e periodicidade, cada um com usuario de papel filho ligado; entrar() com cada credencial de demonstracao devolve sessao filho; minhaMesada de cada um devolve o proprio registro e nunca o do irmao; listarFilhos do responsavel devolve os dois
    teste_funcional: Rodar a seed duas vezes nao duplica nem desfaz o que foi editado; a seed continua recusando NODE_ENV=production; valores sao inteiros positivos; ids fixos; as credenciais aparecem na saida da seed e no README e sao ficticias
    criterio_aceite: tests/demonstracao.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-02.03]
    paralelizavel: false
    concluida_em: null
    suite: pendente

  - id: T-03.02
    titulo: Convencoes com evidencia do papel filho, premissas e README
    fase: F-03.2
    status: pendente
    objetivo: Atualizar a secao de autorizacao, dados e auditoria do CONVENCOES.md com a evidencia do papel filho, reconferir todas as citacoes deslocadas, marcar a PR-06 como realizada em FT-05, cobrir PR-06, PR-30 e PR-31 em tests/premissas.test.ts e a convencao nova em tests/convencoes.test.ts, e atualizar o README
    arquivos:
      cria: []
      altera: ["docs/stack/CONVENCOES.md", "docs/projeto/PREMISSAS.md", "tests/premissas.test.ts", "tests/convencoes.test.ts", "README.md"]
    teste_integracao: tests/convencoes.test.ts confere que toda citacao arquivo:linha existe e que cada linha nova contem o nome citado, inclusive src/servicos/filhos.ts; tests/premissas.test.ts confere que a PR-06 esta Realizada em FT-05, que PR-30 e PR-31 sao f2_autonoma e que o frontmatter bate com os blocos
    teste_funcional: A PR-30 e a PR-31 dizem o que as invalidaria e sao provisorias; o MAPA lista a PR-06 para a FT-05; a secao de Autorizacao diz que o papel filho e negado por lista de permitidos e que a pagina do filho nao recebe id; a secao de Auditoria cita as quatro acoes novas e diz que valor, e-mail e nascimento nunca entram
    criterio_aceite: tests/convencoes.test.ts e tests/premissas.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: null
    suite: pendente

---

# Plano — Sprint 03 — Seed, convencoes e fechamento

## Objetivo da sprint

Seed, convencoes e fechamento.

## Critério de saída da sprint

A suite inteira termina com 0 failed; a seed cria dois filhos com login e o isolamento e provado sobre ela; o CONVENCOES.md tem a evidencia do papel filho; PR-06 realizada; README e MAPA descrevem a entrega
