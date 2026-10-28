---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: mesada-dos-filhos
origem_buildx: financas-da-familia
feature_id: FT-06
titulo: Mesada dos filhos
tipo_trabalho: feature
fechado_em: 2026-10-28
modulo_afetado: [aplicacao, apresentacao, lib, estilos, dados, testes, documentacao]
arquivos_alterados: ver ENTREGA.md
sprints: 3
tasks: 7
testes_novos: 233
suite_final: 1193
---

# Fechamento — mesada-dos-filhos

## O que foi entregue

- Entidade `MovimentoDeMesada` (tabela `movimentos_de_mesada`, migration `20261028190000_mesada`): crédito ou gasto de um filho, valor em centavos inteiros, data civil, descrição opcional, chave estrangeira para o filho com `Cascade` e índice por filho e data.
- Serviço `src/servicos/mesada.ts`: o responsável registra, edita, apaga, lê e soma; o saldo é créditos menos gastos por `groupBy` de inteiros no banco, sem corte por data, podendo ser negativo; `meuExtrato` entrega ao filho só o próprio extrato, sem receber id. Rastro de auditoria na mesma transação, com tipo, id e nome do filho, nunca valor, saldo nem descrição.
- Telas do responsável `/filhos/[id]/mesada` (saldo em destaque, formulário rápido, extrato paginado) e `/filhos/[id]/mesada/[movimentoId]` (editar e apagar em dois passos); saldo na lista de filhos; página `/mesada` do filho preenchida (saldo em destaque, extrato paginado, só leitura); estilos só com tokens e acabamento com a skill `frontend-design` (PR-08).
- Seed com movimentos fictícios: Ana com saldo positivo, Pedro com saldo negativo.
- PR-01, PR-32 e PR-33 realizadas; PR-32 e PR-33 criadas (`f2_autonoma`, provisórias); CONVENCOES.md com evidência.

## Sprints

| Sprint | Tasks | Resultado |
|---|---|---|
| sprint-01 | T-01.01, T-01.02 | concluído |
| sprint-02 | T-02.01, T-02.02, T-02.03 | concluído |
| sprint-03 | T-03.01, T-03.02 | concluído |

## Testes

233 testes novos (960 → 1193), em onze arquivos novos (`mesada`, `mesada-dados`, `mesada-saldo`, `mesada-papeis`, `mesada-isolamento`, `mesada-lib`, `mesada-acoes`, `mesada-tela`, `mesada-rotas-responsavel`, `mesada-rotas`) e ampliações em atividade-dados, demonstração, filhos-acoes, filhos-mesada, premissas e convenções.

## Pendências e observações

- `decisao_humana` (não bloqueante): bloquear gasto acima do saldo, mesada automática, aprovação ou pedido de gasto, metas, juros, tarefas, transferência entre filhos (PR-32).
- `decisao_humana` (não bloqueante): o adulto ver ou lançar a mesada (PR-33).
- `decisao_humana` (não bloqueante): lixeira ou desfazer ao apagar movimento (PR-33).
- `decisao_humana` (não bloqueante): data futura de movimento e saldo por período (PR-32).
- `recurso_externo`: não há remoto; o PR não foi aberto.
- Observação para a FT-07: `movimentos_de_mesada.filhoId` usa `CASCADE`; apagar o registro do filho leva o histórico dele, e exportar por filho é uma consulta por `filhoId`. A trilha guarda o nome do filho em `alvoNome` (PR-25) e a FT-07 decide se o apaga ou anonimiza; o apagar da conta do filho (`filhos.usuarioId` é `SET NULL`) decide apagar ou anonimizar o registro.
- Não exercitado: as telas em navegador real (aparência em dois temas e no celular); a prova é por renderização, por regra de CSS lida por teste e pelo servidor de produção.
