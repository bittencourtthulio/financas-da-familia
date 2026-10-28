---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: lancamentos-da-casa
origem_buildx: financas-da-familia
feature_id: FT-03
atualizado_em: 2026-10-28
sprint_id: sprint-03
sprint:
  titulo: Telas, seed e fechamento
  status: pendente
  criterio_saida: A suite inteira termina com 0 failed; o responsavel e o adulto lancam, editam e apagam lancamento e criam categoria pela interface em dois temas e no celular; a seed demonstra; o servidor real prova as telas e a negacao do filho
  riscos: [Formulario com campo dependente (tipo filtra categoria) em componente de cliente, tests/rotas.test.ts depende do build]
  fora_de_escopo: [Saldo, resumo, exportacao]
fases:
  - id: F-03.1
    titulo: Interface e fechamento
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02, T-03.03]
tasks:
  - id: T-03.01
    titulo: Navegacao e lista de lancamentos
    fase: F-03.1
    status: concluida
    objetivo: Item Lancamentos (com Categorias aninhado) na barra lateral para admin e usuario, guarda de pagina exigirUsuarioDeLancamentos, pagina /lancamentos com filtros de mes e tipo por link, tabela com valor em reais, estado vazio, paginacao, estilos de valor e filtro sobre os tokens
    arquivos:
      cria: [src/app/(sistema)/lancamentos/page.tsx, src/componentes/TabelaDeLancamentos.tsx, src/componentes/FiltrosDeLancamentos.tsx, src/componentes/PaginacaoDeLancamentos.tsx, tests/lancamentos-tela.test.ts]
      altera: [src/componentes/Navegacao.tsx, src/app/(sistema)/layout.tsx, src/app/sessao-servidor.ts, src/estilos/global.css]
    teste_integracao: Renderizada com tres lancamentos, a tabela mostra data 27/10/2026, tipo, categoria, descricao, valor "-R$ 12,34" para despesa e "R$ 1.234,56" para receita e o link Editar de cada um; sem lancamento mostra o estado vazio e nenhuma tabela; filtros e paginacao montam os links com mes, tipo e pagina
    teste_funcional: O adulto e o responsavel veem o link Lancamentos e Categorias no menu e quem nao e admin nem usuario nao; Atividade continua so do responsavel; nenhum arquivo novo escreve cor por extenso; a rota herda carregando e erro do grupo; a pagina exige a guarda antes de ler
    criterio_aceite: tests/lancamentos-tela.test.ts e tests/atividade-tela.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-02.04]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (533 testes)

  - id: T-03.02
    titulo: Formularios, acoes, edicao, exclusao e categorias
    fase: F-03.1
    status: pendente
    objetivo: Acoes criarLancamento, editarLancamento, apagarLancamento e criarCategoria em acoes.ts; paginas /lancamentos/novo, /lancamentos/[id] e /lancamentos/categorias; campos de lancamento (tipo filtra categoria, valor, data, descricao) e confirmacao de exclusao em dois passos; estilos de data e opcao
    arquivos:
      cria: [src/app/(sistema)/lancamentos/novo/page.tsx, src/app/(sistema)/lancamentos/[id]/page.tsx, src/app/(sistema)/lancamentos/categorias/page.tsx, src/componentes/CamposDeLancamento.tsx, src/componentes/ApagarLancamento.tsx, tests/lancamentos-formulario.test.ts]
      altera: [src/app/acoes.ts, src/estilos/global.css, docs/stack/CONVENCOES.md]
    teste_integracao: Os campos renderizados oferecem so as categorias do tipo escolhido (despesa por padrao), nomes valor, data, categoriaId, descricao e tipo, e na edicao vem preenchidos com o valor em "1234,56"; a exclusao so mostra o botao de confirmar depois do primeiro clique
    teste_funcional: As acoes chamam a guarda de pagina, convertem erro de aplicacao em mensagem sem rastro e redirecionam ao sucesso; a pagina de edicao de id inexistente cai em nao encontrado; a tela de categorias lista por tipo e tem estado vazio; nenhuma cor por extenso; campos com rotulo associado
    criterio_aceite: tests/lancamentos-formulario.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-03.01]
    paralelizavel: false
  - id: T-03.03
    titulo: Seed, prova no servidor real e fechamento das convencoes
    fase: F-03.1
    status: pendente
    objetivo: Seed de demonstracao com categorias e lancamentos do mes; tests/rotas.test.ts prova as telas no servidor de producao (papel, filtros, filho negado, valor fora da trilha); CONVENCOES.md (dinheiro, autorizacao, dados, auditoria) com evidencia arquivo:linha; premissas e README
    arquivos:
      cria: []
      altera: [prisma/demonstracao.ts, tests/demonstracao.test.ts, tests/rotas.test.ts, tests/premissas.test.ts, tests/convencoes.test.ts, docs/stack/CONVENCOES.md, docs/projeto/PREMISSAS.md, docs/projeto/PROJETO.md, README.md]
    teste_integracao: Rodar a seed duas vezes deixa 7 categorias e 6 lancamentos, todos do mes corrente em Sao Paulo, e recusa NODE_ENV=production; no servidor real o adulto abre /lancamentos e /lancamentos/categorias, o filho recebe redirecionamento sem dado, e a pagina de Atividade do responsavel mostra a criacao sem o valor digitado
    teste_funcional: A PR-02 esta Realizada em FT-03 e PR-26 a PR-28 existem como f2_autonoma; cada citacao nova do CONVENCOES.md aponta para a linha que contem o nome citado; a secao de dinheiro cita src/lib/dinheiro.ts, o campo valorCentavos e o teste que proibe Float
    criterio_aceite: npm test, npm run lint, npm run typecheck, npm run build e npm audit --audit-level=high com codigo 0
    depende_de: [T-03.02]
    paralelizavel: false
---

# Plano — Sprint 03 — Telas, seed e fechamento

## Objetivo da sprint

Entregar as telas, a seed e a prova no servidor real, e fechar as convenções e premissas.

## Critério de saída da sprint

A suite inteira termina com 0 failed; o responsavel e o adulto lancam, editam e apagam lancamento e criam categoria pela interface em dois temas e no celular; a seed demonstra; o servidor real prova as telas e a negacao do filho
