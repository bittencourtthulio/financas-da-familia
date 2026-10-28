---
expx_schema: 1
expx_tool: sprintx
kind: bloqueios
trabalho_id: lancamentos-da-casa
origem_buildx: financas-da-familia
feature_id: FT-03
atualizado_em: 2026-10-28
bloqueios: []
pendencias_nao_bloqueantes:
  - classe: decisao_humana
    assunto: Categorias - conjunto padrao, renomear, ocultar ou apagar
    seguiu_com: criar categoria apenas, sem conjunto oficial (PR-27)
  - classe: decisao_humana
    assunto: Apagar lancamento - lixeira ou desfazer
    seguiu_com: exclusao definitiva com rastro sem valor (PR-28)
---

# Bloqueios

> Criado vazio na F1 e preenchido na execução (F6). Um bloqueio nunca vira pergunta ao usuário: registre aqui, marque a task `bloqueada` e siga para a próxima paralelizável.

Nenhum bloqueio registrado.

## Pendências não bloqueantes

| Classe | Assunto | Seguiu com |
|---|---|---|
| `decisao_humana` | Categorias: conjunto padrão, renomear, ocultar ou apagar | Criar categoria apenas, sem conjunto oficial; categorias de exemplo só na seed (PR-27) |
| `decisao_humana` | Apagar lançamento: lixeira ou desfazer | Exclusão definitiva, com rastro sem valor e confirmação em dois passos (PR-28) |
