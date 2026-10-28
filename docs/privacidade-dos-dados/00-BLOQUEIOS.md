---
expx_schema: 1
expx_tool: sprintx
kind: bloqueios
trabalho_id: privacidade-dos-dados
origem_buildx: financas-da-familia
feature_id: FT-07
atualizado_em: 2026-10-28
bloqueios: []
pendencias_nao_bloqueantes:
  - classe: decisao_humana
    assunto: Exclusao da familia inteira, exclusao de usuario adulto, prazo legal de resposta, termo de consentimento assinado e versionado, anonimizar em vez de excluir
    seguiu_com: nada disso existe; so a conta do filho e apagada, sem exigir consentimento registrado (PR-35)
  - classe: decisao_humana
    assunto: Exportacao em CSV ou PDF, texto formatado dos valores, importacao do arquivo, exportacao por filho ou por periodo
    seguiu_com: um unico JSON versionado, com centavos inteiros (PR-34)
  - classe: decisao_humana
    assunto: Lixeira ou desfazer ao apagar a conta do filho
    seguiu_com: apagar e definitivo, com o nome digitado e aviso para baixar a exportacao antes (PR-35)
---

# Bloqueios

> Criado vazio na F1 e preenchido na execução (F6). Um bloqueio nunca vira pergunta ao usuário: registre aqui, marque a task `bloqueada` e siga para a próxima paralelizável.

Nenhum bloqueio registrado.

## Pendências não bloqueantes

| Classe | Assunto | Seguiu com |
|---|---|---|
| `decisao_humana` | Exclusão da família inteira, de usuário adulto, prazo legal de resposta, termo de consentimento assinado e versionado, anonimizar em vez de excluir | Só a conta do filho é apagada, sem exigir consentimento registrado (PR-35) |
| `decisao_humana` | Exportação em CSV ou PDF, texto formatado dos valores, importação do arquivo, exportação por filho ou por período | Um único JSON versionado, com centavos inteiros (PR-34) |
| `decisao_humana` | Lixeira ou desfazer ao apagar a conta do filho | Apagar é definitivo, com o nome digitado e aviso para baixar a exportação antes (PR-35) |
