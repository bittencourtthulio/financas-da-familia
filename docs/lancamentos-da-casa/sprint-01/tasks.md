---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: lancamentos-da-casa
origem_buildx: financas-da-familia
feature_id: FT-03
atualizado_em: 2026-10-28
sprint_id: sprint-01
sprint:
  titulo: Valor, data e dados
  status: concluido
  criterio_saida: A suite inteira termina com 0 failed; existe o leitor de valor em centavos, a data civil no fuso de Sao Paulo, as tabelas de categorias e lancamentos por migration e o catalogo da trilha com as acoes novas
  riscos: [Gerar a migration sem banco interativo, Chave estrangeira entre categoria e lancamento no SQLite]
  fora_de_escopo: [Servico, tela, seed]
fases:
  - id: F-01.1
    titulo: Regras puras e dados
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
tasks:
  - id: T-01.01
    titulo: Leitor de valor em reais e datas civis
    fase: F-01.1
    status: concluida
    objetivo: Criar src/lib/dinheiro.ts (texto brasileiro para centavos inteiros, centavos para campo, limites) e src/lib/datas.ts (dia civil AAAA-MM-DD, hoje e mes no fuso de Sao Paulo, intervalo do mes, rotulo do mes) mais formatarDataCivil em formato.ts, tudo sem ponto flutuante
    arquivos:
      cria: [src/lib/dinheiro.ts, src/lib/datas.ts, tests/dinheiro.test.ts, tests/datas.test.ts]
      altera: [src/lib/formato.ts]
    teste_integracao: Do texto digitado ao banco-formato - "1.234,56" vira 123456 e volta como "1234,56" para o campo; o intervalo de outubro de 2026 e [2026-10-01, 2026-11-01) e dezembro vira janeiro do ano seguinte; as 23h de 27/10 em Sao Paulo (02:30Z de 28/10) ainda sao o dia 2026-10-27
    teste_funcional: Aceita "1.234,56", "1234,56", "12,5", "12", "R$ 1.234,56", "0,01" e o teto "1.000.000,00"; recusa "", "abc", "1.2.3", "1234.56", "1,234,56", "12,345", "-5", "0", "0,00", "1.000.000,01", "NaN", "Infinity", "1e3", "999999999999999999" e nao-texto; nenhum numero devolvido e fracionario; data 2026-02-30, 2025-02-29, 26-10-28, vazia e fora de 2000 a 2100 sao recusadas, 2024-02-29 vale
    criterio_aceite: tests/dinheiro.test.ts e tests/datas.test.ts terminam com 0 failed, o codigo novo nao contem parseFloat, Number( nem Math.round sobre valor, e a suite inteira esta verde
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (349 testes)

  - id: T-01.02
    titulo: Entidades Categoria e Lancamento, migration e catalogo de acoes
    fase: F-01.1
    status: concluida
    objetivo: Criar os modelos Categoria e Lancamento no Prisma (valorCentavos Int, data texto, categoriaId com chave estrangeira) com migration versionada, limpar as tabelas em limparBanco e acrescentar lancamento.criado, lancamento.alterado, lancamento.apagado e categoria.criada ao catalogo com descricao em portugues na tela
    arquivos:
      cria: [prisma/migrations/NNNN_lancamentos/migration.sql, tests/lancamentos-dados.test.ts]
      altera: [prisma/schema.prisma, src/lib/atividade.ts, tests/ajuda.ts, tests/atividade-tela.test.ts]
    teste_integracao: Com as migrations reais aplicadas, cria Categoria e Lancamento pelo cliente Prisma e le de volta valorCentavos como inteiro, data como texto e categoria; a coluna valor_centavos e INTEGER no SQL; categoria repetida no mesmo tipo e recusada pelo banco e em tipos diferentes e aceita; categoria com lancamento nao pode ser apagada
    teste_funcional: O schema nao tem Float nem Decimal; o catalogo tem as quatro acoes novas com rotulo nao vazio; descreverAtividade diz "Criou o lancamento" com detalhe "Despesa", "Criou a categoria Mercado" com detalhe "Despesa" e nunca mostra codigo tecnico nem valor
    criterio_aceite: tests/lancamentos-dados.test.ts e tests/atividade-tela.test.ts terminam com 0 failed; npx prisma migrate deploy num banco novo cria as tabelas categorias e lancamentos; suite inteira verde
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (367 testes)
    nota: tests/atividade-dados.test.ts (FT-02) afirmava as tres acoes exatas do catalogo; passou a afirmar o catalogo com as quatro acoes novas

---

# Plano — Sprint 01 — Valor, data e dados

## Objetivo da sprint

Entregar as regras puras de valor e data e o esquema, sem serviço nem tela.

## Critério de saída da sprint

A suite inteira termina com 0 failed; existe o leitor de valor em centavos, a data civil no fuso de Sao Paulo, as tabelas de categorias e lancamentos por migration e o catalogo da trilha com as acoes novas
