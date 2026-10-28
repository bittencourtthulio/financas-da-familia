---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: mesada-dos-filhos
origem_buildx: financas-da-familia
feature_id: FT-06
atualizado_em: 2026-10-28
sprint_id: sprint-01
sprint:
  titulo: Dados e servico da mesada
  status: pendente
  criterio_saida: A suite inteira termina com 0 failed; o responsavel registra, edita, apaga e consulta movimentos e o saldo em centavos inteiros, com a trilha sem valor; adulto e filho sao negados nas funcoes do responsavel; o filho le so o proprio extrato sem informar id
  riscos: [migration em banco SQLite, citacoes de linha do CONVENCOES.md deslocadas por linhas novas em ajuda.ts e atividade.ts, soma em ponto flutuante]
  fora_de_escopo: [Telas, acoes de servidor, seed]
fases:
  - id: F-01.1
    titulo: Entidade, migration e trilha
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01]
  - id: F-01.2
    titulo: Servico de mesada
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.02]
tasks:
  - id: T-01.01
    titulo: "Entidade MovimentoDeMesada, migration e acoes da trilha"
    fase: F-01.1
    status: pendente
    objetivo: Criar o modelo MovimentoDeMesada (tabela movimentos_de_mesada, valorCentavos Int, filhoId com Cascade, indice por filho e data) com migration, incluir a tabela em limparBanco e acrescentar as tres acoes mesada.registrada, mesada.alterada e mesada.apagada ao catalogo da trilha com a descricao delas
    arquivos:
      cria: ["prisma/migrations/20261028190000_mesada/migration.sql", "tests/mesada-dados.test.ts"]
      altera: ["prisma/schema.prisma", "tests/ajuda.ts", "src/lib/atividade.ts", "tests/atividade-dados.test.ts"]
    teste_integracao: Com o banco migrado, um movimento grava filhoId, tipo, valorCentavos, data e descricao; apagar o filho leva os movimentos dele (Cascade) e nao os do irmao; movimento sem filho existente e recusado pela chave estrangeira; o catalogo tem as tres acoes e descreverAtividade as traduz por tipo sem nenhum valor
    teste_funcional: A coluna e INTEGER na migration e Int no esquema, sem Float nem Decimal; a tabela tem indice por filho e data; limparBanco esvazia movimentos antes de filhos; rotuloDoTipo traduz credito e gasto; acao desconhecida continua voltando como veio
    criterio_aceite: tests/mesada-dados.test.ts e tests/atividade-dados.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: null

  - id: T-01.02
    titulo: "Servico de mesada: movimentos, extrato, saldo e leitura do filho"
    fase: F-01.2
    status: pendente
    objetivo: Criar src/servicos/mesada.ts com registrarMovimento, editarMovimento, apagarMovimento, obterMovimento, extratoDoFilho e saldosDosFilhos (so admin) e meuExtrato (so filho, sem id), validados com zod, saldo por groupBy de inteiros, rastro na mesma transacao
    arquivos:
      cria: ["src/servicos/mesada.ts", "tests/mesada.test.ts", "tests/mesada-saldo.test.ts", "tests/mesada-papeis.test.ts", "tests/mesada-isolamento.test.ts"]
      altera: ["src/lib/atividade.ts"]
    teste_integracao: registrarMovimento de credito e de gasto grava o movimento e mesada.registrada com tipo, filhoId e alvoNome e sem valor nem descricao; editarMovimento muda os campos e grava mesada.alterada so quando algo mudou; apagarMovimento remove a linha e grava mesada.apagada; extratoDoFilho devolve saldo, itens em ordem decrescente e 30 por pagina; meuExtrato devolve so os movimentos do filho da sessao; falha no rastro desfaz o movimento
    teste_funcional: Valor '50,00' vira 5000 e '1.234,56' vira 123456; zero, negativo, '12.5', 'abc', vazio e acima de R$ 1.000.000,00 devolvem 422; tipo fora de credito e gasto, data 2026-02-30 e descricao com mais de 200 caracteres devolvem 422; filho inexistente e movimento inexistente devolvem 404; 0,10 mais 0,20 de credito e 0,30 de gasto zeram o saldo; 1.000 movimentos pequenos somam exato; saldo negativo e devolvido, nao bloqueado; adulto, vazio e papel desconhecido recebem 403 em toda funcao do responsavel e o responsavel recebe 403 em meuExtrato; um filho real recebe 403 em toda funcao do responsavel, igual para id de irmao e id inexistente, e nada grava; meuExtrato do filho A nunca traz movimento do filho B; o arquivo novo nao usa parseFloat, Number( nem toFixed
    criterio_aceite: tests/mesada.test.ts, tests/mesada-saldo.test.ts, tests/mesada-papeis.test.ts e tests/mesada-isolamento.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: null
    suite: null

---

# Plano — Sprint 01 — Dados e serviço da mesada

## Objetivo da sprint

Dados e serviço da mesada.

## Critério de saída da sprint

A suite inteira termina com 0 failed; o responsavel registra, edita, apaga e consulta movimentos e o saldo em centavos inteiros, com a trilha sem valor; adulto e filho sao negados nas funcoes do responsavel; o filho le so o proprio extrato sem informar id
