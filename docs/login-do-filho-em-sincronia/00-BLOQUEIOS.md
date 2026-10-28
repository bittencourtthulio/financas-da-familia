---
expx_schema: 1
expx_tool: sprintx
kind: bloqueios
trabalho_id: login-do-filho-em-sincronia
origem_buildx: financas-da-familia
feature_id: FT-09
atualizado_em: 2026-10-28
bloqueios: []
pendencias_nao_bloqueantes:
  - classe: decisao_humana
    assunto: "E-mail do login do filho: a familia quer trocar o e-mail do filho? Hoje o e-mail e fixo e a edicao do filho nunca o muda"
    seguiu_com: e-mail intocado (credencial, PR-39); nao ha tela para trocar e-mail de filho
  - classe: decisao_humana
    assunto: "Renomear o usuario do filho pela tela Usuarios: deve mudar tambem o cadastro do filho, ou ser bloqueado, ou continuar livre?"
    seguiu_com: nada mudou; a proxima edicao do filho reescreve o nome do login com o nome do cadastro (PR-39)
  - classe: recurso_externo
    assunto: Remoto git para abrir o pull request
    seguiu_com: branch local; descricao pronta em PR.md
---

# Bloqueios

Nenhum bloqueio registrado.

## Pendências não bloqueantes

| Classe | Assunto | Seguiu com |
|---|---|---|
| `decisao_humana` | Trocar o e-mail de login do filho | E-mail fixo; a edição do filho nunca o muda |
| `decisao_humana` | Renomear o usuário do filho pela tela Usuários (sentido contrário da sincronia) | Livre como antes; a próxima edição do filho reescreve o nome do login |
| `recurso_externo` | Remoto git para o pull request | Branch local, PR.md pronto |
