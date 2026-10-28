---
expx_schema: 1
expx_tool: sprintx
kind: bloqueios
trabalho_id: mesada-dos-filhos
origem_buildx: financas-da-familia
feature_id: FT-06
atualizado_em: 2026-10-28
bloqueios: []
pendencias_nao_bloqueantes:
  - classe: decisao_humana
    assunto: Bloquear gasto acima do saldo, mesada automatica, aprovacao e pedido de gasto, metas, juros, tarefas e transferencia entre filhos
    seguiu_com: nada disso existe; saldo negativo permitido e sinalizado (PR-32)
  - classe: decisao_humana
    assunto: O adulto ver ou lancar a mesada dos filhos
    seguiu_com: so o responsavel; o adulto e negado (PR-33)
  - classe: decisao_humana
    assunto: Lixeira ou desfazer ao apagar movimento de mesada
    seguiu_com: apagar e definitivo, com dois passos e rastro sem valor (PR-33)
  - classe: decisao_humana
    assunto: Data futura de movimento e saldo por periodo
    seguiu_com: data futura vale e o saldo soma todos os movimentos (PR-32)
---

# Bloqueios

> Criado vazio na F1 e preenchido na execução (F6). Um bloqueio nunca vira pergunta ao usuário: registre aqui, marque a task `bloqueada` e siga para a próxima paralelizável.

Nenhum bloqueio registrado.

## Pendências não bloqueantes

| Classe | Assunto | Seguiu com |
|---|---|---|
| `decisao_humana` | Bloquear gasto acima do saldo, mesada automática, aprovação e pedido de gasto, metas, juros, tarefas e transferência entre filhos | Nada disso existe; saldo negativo permitido e sinalizado (PR-32) |
| `decisao_humana` | O adulto ver ou lançar a mesada dos filhos | Só o responsável; o adulto é negado (PR-33) |
| `decisao_humana` | Lixeira ou desfazer ao apagar movimento de mesada | Apagar é definitivo, com dois passos e rastro sem valor (PR-33) |
| `decisao_humana` | Data futura de movimento e saldo por período | Data futura vale e o saldo soma todos os movimentos (PR-32) |
