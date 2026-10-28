---
kind: avaliacao
schema: expx-schema-v1
pd_id: PD-2026-0001
data: 2026-10-28
dentro_do_escopo: sim
beneficiario: todos
serve_objetivo: sim
custo_de_nao_fazer: processo_manual
tem_solucao_fora_do_software: true
recorrencia: 0
---

# PD-2026-0001 — Avaliação

## 1. Está dentro do que o produto é?
**sim.** Nenhuma negativa do PRODUTO.md cobre o pedido.

## 2. Quem se beneficia?
**todos** os membros da família.

## 3. Qual objetivo de negócio isso serve?
Os dois objetivos do PRODUTO.md: saber o saldo do mês e controlar a mesada.

## 4. Qual o custo de NÃO fazer?
**processo manual** (planilha ou caderno).

## 5. Existe solução fora do software?
**sim**: planilha. O usuário já decidiu construir o sistema; registrado, sem efeito no veredito (o veredito no buildx é `fazer` por construção).

## 6. Escopo mínimo

**A versão dez vezes menor:** lançar receitas e despesas da casa com categoria, ver o saldo do mês, e cadastrar filhos com o extrato da mesada (créditos e gastos) e saldo de cada um.
**O que ela deliberadamente deixa de fora:** metas e poupança, orçamento por categoria, relatórios comparativos, exportação, lançamentos recorrentes automáticos.

## 7. Recorrência
**recorrencia:** 0. Sem pedido anterior.

## Achados destacados
- A descrição não traz regra de mesada (valor, periodicidade, o que acontece com saldo não gasto, aprovação de gasto). Quem define é a família, nos dados; o sistema não impõe regra. Itens que seriam regra nova vão para "Fora de escopo".

## O que muda a recomendação
Se a família quiser que o sistema calcule ou imponha regras de mesada (tarefas que rendem valor, juros, bloqueio de gasto), o escopo da feature de mesada muda e precisa de decisão humana.
