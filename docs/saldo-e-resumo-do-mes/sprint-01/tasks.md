---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: saldo-e-resumo-do-mes
origem_buildx: financas-da-familia
feature_id: FT-04
atualizado_em: 2026-10-28
sprint_id: sprint-01
sprint:
  titulo: Cálculo do resumo e dados de demonstração
  status: concluido
  criterio_saida: A suite inteira termina com 0 failed; resumoDoMes soma receitas, despesas, saldo e despesas por categoria do mes em centavos inteiros, nega papel que nao e admin nem usuario e trata mes limite e fuso; a seed demonstra dois meses
  riscos: [groupBy do Prisma sobre SQLite devolver soma de forma inesperada, relogio e fuso na virada de mes]
  fora_de_escopo: [Tela, componentes, estilos, saldo acumulado]
fases:
  - id: F-01.1
    titulo: Servico de resumo e seed
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
tasks:
  - id: T-01.01
    titulo: Servico resumoDoMes com soma em centavos, mes validado e guarda de papel
    fase: F-01.1
    status: concluida
    objetivo: Criar src/servicos/resumo.ts com resumoDoMes(autor, consulta, agora) que valida o mes com zod e mesValido (invalido cai no corrente de Sao Paulo), soma por groupBy no banco as receitas e as despesas do mes e as despesas por categoria, calcula o saldo por subtracao de inteiros e comeca por exigirAdultoOuResponsavel
    arquivos:
      cria: [src/servicos/resumo.ts, tests/resumo.test.ts, tests/resumo-papeis.test.ts]
      altera: []
    teste_integracao: Com lancamentos reais no banco, resumoDoMes devolve receitasCentavos, despesasCentavos, saldoCentavos e despesasPorCategoria (nome, totalCentavos, quantidade) so do mes pedido; 10 + 20 centavos de despesa somam 30; lancamentos de 2026-09-30 e 2026-11-01 ficam fora de outubro, 2026-10-01 e 2026-10-31 ficam dentro; dezembro de 2025 e janeiro de 2026 nao se misturam; saldo negativo quando a despesa passa da receita; as 23h de 31/10 em Sao Paulo (02:30Z de 01/11) ainda sao outubro quando o mes nao e informado
    teste_funcional: Mes ausente, vazio, "2026-13", "2026-1", "abc", lista de dois valores, fora de 2000 a 2100 e nao-texto caem no mes corrente sem erro; mes sem lancamento devolve zeros e lista vazia; categorias ordenadas da maior soma para a menor, empate por nome; valor de 1.000.000,00 repetido nao perde centavo; nenhum numero devolvido e fracionario; o arquivo novo nao contem parseFloat, Number(, toFixed, Float nem Math.round; admin e usuario veem; filho, vazio e papel desconhecido recebem 403 e o servico nao toca no banco
    criterio_aceite: tests/resumo.test.ts e tests/resumo-papeis.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (644 testes)

  - id: T-01.02
    titulo: Seed de demonstracao com mes anterior e mais de um lancamento por categoria
    fase: F-01.1
    status: concluida
    objetivo: Estender semearLancamentos em prisma/demonstracao.ts com lancamentos do mes anterior e um segundo lancamento em Mercado e em Lazer no mes corrente, com id fixo e upsert sem sobrescrever, sem tocar nos seis lancamentos existentes
    arquivos:
      cria: []
      altera: [prisma/demonstracao.ts, tests/demonstracao.test.ts]
    teste_integracao: Depois da seed, resumoDoMes do responsavel para o mes corrente traz receitas, despesas, saldo positivo e pelo menos tres categorias de despesa, uma delas com mais de um lancamento; o mes anterior tem receita e despesa proprias e saldo diferente; rodar a seed duas vezes nao duplica nem muda valor editado
    teste_funcional: Todo valor da seed e inteiro positivo em centavos; os ids novos sao fixos; a seed continua recusando NODE_ENV=production; os seis lancamentos de antes mantem id e valor; a virada de ano e coberta quando o mes corrente e janeiro (mes anterior em dezembro)
    criterio_aceite: tests/demonstracao.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (651 testes)

---

# Plano — Sprint 01 — Cálculo do resumo e dados de demonstração

## Objetivo da sprint

Entregar o cálculo no servidor e a seed que o demonstra, sem tela.

## Critério de saída da sprint

A suite inteira termina com 0 failed; resumoDoMes soma receitas, despesas, saldo e despesas por categoria do mes em centavos inteiros, nega papel que nao e admin nem usuario e trata mes limite e fuso; a seed demonstra dois meses
