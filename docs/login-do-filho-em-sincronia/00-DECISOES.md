---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: login-do-filho-em-sincronia
origem_buildx: financas-da-familia
feature_id: FT-09
respondido_por: buildx
densidade: enxuta
modo_construcao: autonomo
atualizado_em: 2026-10-28
decisoes:
  - id: D-00
    decisao: densidade enxuta (feature pequena, 1 sprint, 3 tasks), construcao autonoma
    alternativa_descartada: null
    motivo: "respondido pelo buildx: modo autonomo do projeto; fonte PR-01. Origem recursao (PEND-18), sem premissa de origem"
    status: fechada
    bloqueante: false
  - id: D-01
    decisao: "Escopo - editarFilho renomeia o usuario de login ligado ao filho na mesma transacao; sem login nada muda; sem tela nova, sem migration"
    alternativa_descartada: Sincronizar tambem no sentido contrario (renomear o usuario na tela Usuarios muda o filho)
    motivo: "PEND-18. O sentido contrario muda outra tela e outra regra; registrado como pendencia"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: "O usuario acompanha o nome do filho sempre que os dois divergem (compara com o nome do usuario, nao com o nome antigo do filho)"
    alternativa_descartada: "Renomear so quando o nome do filho muda"
    motivo: "Cura o login que ja divergia por causa do defeito (dados criados antes da FT-09), sem script de migracao; custo: uma comparacao"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: O e-mail do login nunca e alterado pela edicao do filho
    alternativa_descartada: Acompanhar o e-mail ao nome
    motivo: "E-mail e credencial (PR-31); muda-lo trancaria o filho para fora. Se a familia quiser troca de e-mail, e decisao humana (pendencia)"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: "A trilha de filho.alterado ganha o campo 'login' em campos quando o nome do usuario foi mesmo reescrito; o rotulo na tela e 'nome do login'. O detalhe continua so com alvoNome e nomes de campos, nunca o nome antigo nem o e-mail"
    alternativa_descartada: Acao nova no catalogo (filho.login_renomeado); gravar de/para como usuario.papel_alterado faz
    motivo: "De/para levaria o nome antigo para a trilha e reabriria o que a FT-07 anonimiza (PR-35). Um campo a mais reaproveita o catalogo e a anonimizacao"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Autorizacao permanece so do admin (exigirAdmin ja e a primeira linha)
    alternativa_descartada: null
    motivo: "PR-06; a feature nao muda quem pode editar"
    status: fechada
    bloqueante: false
---

# Decisões — login-do-filho-em-sincronia

Respondidas pelo buildx em modo autônomo. Cria a PR-39 (`f2_autonoma`, provisória) com D-02, D-03 e D-04.
