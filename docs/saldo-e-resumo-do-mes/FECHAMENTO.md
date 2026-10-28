---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: saldo-e-resumo-do-mes
origem_buildx: financas-da-familia
feature_id: FT-04
titulo: Saldo e resumo do mês
tipo_trabalho: feature
fechado_em: 2026-10-28
modulo_afetado: [aplicacao, apresentacao, lib, estilos, dados, testes, documentacao]
arquivos_alterados: ver ENTREGA.md
sprints: 3
tasks: 5
testes_novos: 108
suite_final: 696
---

# Fechamento — saldo-e-resumo-do-mes

## O que foi entregue

- Serviço `src/servicos/resumo.ts` (`resumoDoMes`): receitas, despesas, saldo e despesas por categoria do mês, somados no banco por `groupBy` em centavos inteiros e com o saldo por subtração de inteiros. Mês pela consulta, validado com `zod` (inválido, ausente ou repetido vira o mês corrente de São Paulo, relógio injetável). Guarda por lista de permitidos (`admin`, `usuario`): outro papel recebe 403.
- Painel inicial `/` com seletor de mês por link (`/?mes=AAAA-MM`), três cartões (Receitas, Despesas, Saldo do mês) e a lista de despesas por categoria com barra proporcional. Título e subtítulo do P-9 foram mantidos. Saldo negativo com sinal de menos, frase e borda por token (nunca só cor). Mês sem lançamento mostra mensagem e atalho para Lançamentos; carregando e erro vêm do grupo `(sistema)`. Quem não lança (o filho de amanhã) recebe só título, subtítulo e uma frase neutra, sem consulta ao serviço.
- Seed: oito lançamentos no mês corrente, cinco no anterior e dois no retrasado (este com saldo negativo), idempotente e sem produção.
- Acabamento com a skill `frontend-design` (PR-08) dentro dos tokens; nenhuma cor literal, nenhum tema novo.
- PR-08 realizada; PR-29 criada (`f2_autonoma`, provisória); CONVENCOES.md com evidência.

## Sprints

| Sprint | Tasks | Resultado |
|---|---|---|
| sprint-01 | T-01.01, T-01.02 | concluído |
| sprint-02 | T-02.01, T-02.02 | concluído |
| sprint-03 | T-03.01 | concluído |

## Testes

108 testes novos (588 → 696), em três arquivos novos (`resumo`, `resumo-papeis`, `resumo-tela`) e ampliações em demonstração, rotas, premissas e convenções. Casos de borda: 0,10 + 0,20, 100 parcelas de 10 centavos, teto de R$ 1.000.000,00, primeiro e último dia, virada de ano, fevereiro bissexto, 23h30 de 31/10 em São Paulo, mês inválido em doze formas.

## Pendências e observações

- `decisao_humana` (não bloqueante): a família quer saldo acumulado (o saldo de um mês carregar o do anterior)? Hoje: só o mês escolhido (PR-29).
- `recurso_externo`: não há remoto; o PR não foi aberto.
- Observação: a lista de despesas por categoria só traz categorias com despesa no mês; receita não é aberta por categoria (PR-29).
- Observação: a barra de cada categoria é a parte inteira (0 a 100) da despesa total; é decorativa e o valor em reais é o dado.
- Observação para a FT-07: o resumo não grava nada; a exportação lê `lancamentos` e `categorias`.
- Não exercitado: o painel em navegador real (aparência em dois temas e no celular); a prova é por renderização, por regra de CSS lida por teste e pelo servidor de produção.
