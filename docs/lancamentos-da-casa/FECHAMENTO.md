---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: lancamentos-da-casa
origem_buildx: financas-da-familia
feature_id: FT-03
titulo: Lançamentos da casa
tipo_trabalho: feature
fechado_em: 2026-10-28
modulo_afetado: [dados, aplicacao, apresentacao, lib, estilos, testes, documentacao]
arquivos_alterados: ver ENTREGA.md
sprints: 3
tasks: 9
testes_novos: 338
suite_final: 588
---

# Fechamento — lancamentos-da-casa

## O que foi entregue

- Entidades `Categoria` e `Lancamento` (tabelas `categorias` e `lancamentos`, migration `20261028150000_lancamentos`): valor em `valorCentavos Int`, dia civil como texto `AAAA-MM-DD`, chave estrangeira só entre lançamento e categoria.
- Leitor do valor digitado (`src/lib/dinheiro.ts`), sem ponto flutuante, e data civil no fuso de São Paulo (`src/lib/datas.ts`).
- Serviço `src/servicos/lancamentos.ts`: criar e listar categoria; criar, ler, editar, apagar e listar lançamento (mês, tipo, 50 por página). Guarda por lista de permitidos (`admin`, `usuario`) em toda função. Cada criação, edição e exclusão grava a trilha (FT-02) na mesma transação, com tipo e id da categoria e nunca o valor.
- Telas `/lancamentos` (filtros por link), `/lancamentos/novo`, `/lancamentos/[id]` (editar e apagar em dois passos) e `/lancamentos/categorias`; item "Lançamentos" no menu com "Categorias" aninhado, só para quem lança.
- Seed: sete categorias e seis lançamentos fictícios do mês corrente, idempotentes.
- PR-02 realizada; PR-26, PR-27 e PR-28 criadas (`f2_autonoma`); seção de dinheiro do CONVENCOES.md com evidência.

## Sprints

| Sprint | Tasks | Resultado |
|---|---|---|
| sprint-01 | T-01.01, T-01.02 | concluído |
| sprint-02 | T-02.01 a T-02.04 | concluído |
| sprint-03 | T-03.01 a T-03.03 | concluído |

## Testes

338 testes novos (250 → 588), em 11 arquivos novos e ampliações em atividade, demonstração, rotas, premissas e convenções.

## Pendências e observações

- `decisao_humana` (não bloqueante): conjunto padrão, renomear, ocultar ou apagar categoria (PR-27); lixeira ou desfazer exclusão de lançamento (PR-28).
- `recurso_externo`: não há remoto; o PR não foi aberto.
- Observação: id de lançamento inexistente mostra a página "não encontrado" com status HTTP 200, porque a tela já começou a ser enviada (carregando); o formulário não aparece.
- Observação para a FT-04: o saldo soma `valorCentavos` por tipo com inteiros; a listagem do serviço não traz totais de propósito.
- Observação para a FT-07: o rastro de lançamento apagado guarda só ids; a exportação lê `lancamentos` e `categorias`.
- Não exercitado: o envio dos formulários pelo navegador (ações de servidor). As ações são finas e o serviço é testado; as telas são provadas por renderização e no servidor real.
