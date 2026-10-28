---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: trilha-de-atividade
origem_buildx: financas-da-familia
feature_id: FT-02
atualizado_em: 2026-10-28
sprint_id: sprint-02
sprint:
  titulo: Ligar as acoes de usuario ao registro
  status: pendente
  criterio_saida: Criar usuario, mudar papel e desativar usuario gravam o registro na mesma transacao; a suite inteira esta verde
  riscos: [A tela de edicao manda o papel mesmo quando nao muda, o registro deve ocorrer so na mudanca real, As citacoes de linha do CONVENCOES.md em src/servicos/usuarios.ts deslocam]
  fora_de_escopo: [Reativacao e edicao de nome ou e-mail, Tela]
fases:
  - id: F-02.1
    titulo: Ligacao
    status: pendente
    criterio_saida: Os quatro testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01, T-02.02]
tasks:
  - id: T-02.01
    titulo: Criar usuario registra a atividade
    fase: F-02.1
    status: pendente
    objetivo: criar grava o usuario e o registro usuario.criado (alvoNome, papel) na mesma transacao
    arquivos:
      cria: [tests/usuarios-atividade.test.ts]
      altera: [src/servicos/usuarios.ts, docs/stack/CONVENCOES.md]
    teste_integracao: Admin cria um usuario e o banco tem exatamente uma Atividade com atorId e atorNome do admin, acao usuario.criado, entidade usuario e entidadeId igual ao id criado; se o registro falhar a transacao desfaz e o usuario nao existe
    teste_funcional: O detalhe tem alvoNome e papel, e nao contem a senha nem o hash nem o e-mail do criado; criacao recusada (e-mail repetido, usuario comum) nao grava registro
    criterio_aceite: Os casos novos de tests/usuarios-atividade.test.ts passam e a suite inteira esta verde
    depende_de: [T-01.03]
    paralelizavel: false
  - id: T-02.02
    titulo: Mudar papel e desativar registram a atividade
    fase: F-02.1
    status: pendente
    objetivo: editar registra usuario.papel_alterado (de, para) so quando o papel muda, e usuario.desativado quando o usuario passa de ativo para desativado, na mesma transacao da gravacao
    arquivos:
      cria: []
      altera: [src/servicos/usuarios.ts, tests/usuarios-atividade.test.ts]
    teste_integracao: Admin promove um adulto e depois desativa outro; o banco tem uma linha usuario.papel_alterado com de usuario e para admin e uma usuario.desativado, ambas com o ator correto
    teste_funcional: Editar com o mesmo papel, editar so o nome e desativar quem ja esta desativado nao gravam registro; a guarda do ultimo administrador (409) nao grava registro
    criterio_aceite: Os casos novos de tests/usuarios-atividade.test.ts passam e a suite inteira esta verde
    depende_de: [T-02.01]
    paralelizavel: false
---

# Plano — Sprint 02 — Ligar as ações de usuário ao registro

## Objetivo da sprint

Fazer as ações que já existem na FT-01 deixarem rastro, atomicamente. O serviço de usuários chama `registrarAtividade` com o cliente da transação.

## Critério de saída da sprint

A suíte inteira (`npm test`) termina com 0 failed.
