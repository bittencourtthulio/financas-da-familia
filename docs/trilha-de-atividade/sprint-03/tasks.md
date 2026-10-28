---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: trilha-de-atividade
origem_buildx: financas-da-familia
feature_id: FT-02
atualizado_em: 2026-10-28
sprint_id: sprint-03
sprint:
  titulo: Tela Atividade, seed e fechamento
  status: pendente
  criterio_saida: O responsavel abre Atividade no servidor de producao e ve as acoes com data e hora; o adulto nao ve o item nem a tela; npm run verificar verde
  riscos: [rotas.test.ts pode estourar timeout depois do build, A pagina nova precisa de build antes do teste de rotas]
  fora_de_escopo: [Filtros, exportacao, lancamentos, mesada]
fases:
  - id: F-03.1
    titulo: Tela, seed e documentos
    status: pendente
    criterio_saida: Os testes novos passam, a suite inteira esta verde e as premissas estao coerentes
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02, T-03.03]
tasks:
  - id: T-03.01
    titulo: Pagina Atividade e item de menu
    fase: F-03.1
    status: pendente
    objetivo: Rota /atividade em (sistema) que exige admin no servidor, tabela rolavel com Quando, Quem, Acao e Detalhe em portugues, estado vazio, paginacao por links, item Atividade na barra lateral so para admin, so tokens de cor
    arquivos:
      cria: [src/app/(sistema)/atividade/page.tsx, src/componentes/TabelaDeAtividade.tsx, tests/atividade-tela.test.ts]
      altera: [src/componentes/Navegacao.tsx, src/lib/atividade.ts, src/estilos/global.css, tests/ajuda-estatica.ts]
    teste_integracao: Renderiza TabelaDeAtividade com tres registros e afirma data e hora no formato de Sao Paulo, ator, rotulo da acao em portugues e detalhe legivel (de Adulto para Responsavel); com lista vazia mostra o texto de estado vazio; a Navegacao com ehAdmin falso nao traz o link /atividade e com verdadeiro traz
    teste_funcional: descreverAtividade traduz papeis pelos rotulos Responsavel e Adulto e nao vaza codigo tecnico; global.css continua sem cor literal (guarda de tokens) e a pagina nao herda loading nem error proprios
    criterio_aceite: tests/atividade-tela.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-02.02]
    paralelizavel: false
  - id: T-03.02
    titulo: Seed de demonstracao e prova de rotas
    fase: F-03.1
    status: pendente
    objetivo: Estender semearDemonstracao com duas atividades fictícias idempotentes e provar no servidor de producao que o responsavel ve a tela, o adulto e barrado e sem sessao vai ao login
    arquivos:
      cria: []
      altera: [prisma/demonstracao.ts, tests/demonstracao.test.ts, tests/rotas.test.ts]
    teste_integracao: No servidor real, /atividade com sessao de admin devolve 200 com o titulo Atividade e as linhas semeadas; com sessao de adulto nao contem nenhum registro e nem o link no menu; sem sessao responde 307 para /entrar
    teste_funcional: Semear duas vezes deixa exatamente duas atividades; as atividades semeadas usam acoes do catalogo e nao contem senha; semear em producao continua recusado sem criar nada
    criterio_aceite: tests/demonstracao.test.ts e tests/rotas.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-03.01]
    paralelizavel: false
  - id: T-03.03
    titulo: Convenções, premissas e fechamento de registros
    fase: F-03.1
    status: pendente
    objetivo: Ajustar o teste de premissas (D-13), atualizar CONVENCOES.md com a regra de auditoria e as citacoes deslocadas, README com o item Atividade
    arquivos:
      cria: []
      altera: [tests/premissas.test.ts, tests/convencoes.test.ts, docs/stack/CONVENCOES.md, README.md]
    teste_integracao: tests/premissas.test.ts confere que PR-10 e PR-25 estao Realizada em FT-02, que o MAPA lista PR-10 para a FT-02 e que as f2_autonoma PR-21 a PR-24 seguem da FT-01
    teste_funcional: tests/convencoes.test.ts continua sem citacao quebrada e passa a exigir que a secao 7 do CONVENCOES.md trate da auditoria e cite registrarAtividade
    criterio_aceite: A suite inteira esta verde e nenhuma citacao do CONVENCOES.md aponta para linha errada
    depende_de: [T-03.02]
    paralelizavel: false
---

# Plano — Sprint 03 — Tela Atividade, seed e fechamento

## Objetivo da sprint

Mostrar a trilha ao responsável, semear a demonstração e deixar os documentos do projeto coerentes com o código.

## Critério de saída da sprint

`npm run verificar` termina com código 0.
