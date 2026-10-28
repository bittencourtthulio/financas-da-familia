---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: trilha-de-atividade
origem_buildx: financas-da-familia
feature_id: FT-02
atualizado_em: 2026-10-28
sprint_id: sprint-01
sprint:
  titulo: Entidade e servico de registro
  status: pendente
  criterio_saida: A suite inteira termina com 0 failed; existe a tabela de atividades por migration, registrarAtividade grava quem, o que e quando sem dado proibido, e listarAtividade so responde a admin
  riscos: [Transacao interativa do Prisma com o adaptador better-sqlite3 nao tem uso no repositorio (base/00-LACUNAS.md), Gerar a migration sem banco interativo]
  fora_de_escopo: [Ligar o registro as acoes de usuario, Tela, Seed]
fases:
  - id: F-01.1
    titulo: Dados e servico
    status: pendente
    criterio_saida: Os seis testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02, T-01.03]
tasks:
  - id: T-01.01
    titulo: Entidade Atividade, migration e catalogo de acoes
    fase: F-01.1
    status: concluida
    objetivo: Criar o modelo Atividade no Prisma com migration versionada, a limpeza da tabela na ajuda de teste e o catalogo de acoes com rotulo em portugues em src/lib/atividade.ts
    arquivos:
      cria: [prisma/migrations/NNNN_atividade/migration.sql, src/lib/atividade.ts, tests/atividade-dados.test.ts]
      altera: [prisma/schema.prisma, tests/ajuda.ts]
    teste_integracao: Com as migrations reais aplicadas, cria uma Atividade pelo cliente Prisma e le de volta atorId, atorNome, acao, entidade, entidadeId, detalhe e criadoEm preenchido pelo banco; a tabela nao tem coluna de chave estrangeira para usuarios
    teste_funcional: O catalogo tem as acoes usuario.criado, usuario.papel_alterado e usuario.desativado, todas com rotulo em portugues nao vazio, e rotuloDaAcao devolve o proprio codigo para acao desconhecida
    criterio_aceite: tests/atividade-dados.test.ts termina com 0 failed e a suite inteira esta verde; npx prisma migrate deploy num banco novo cria a tabela atividades
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (179 testes)
    nota: teste de premissas da FT-01 ajustado aqui (D-13) porque a PR-25 criada na F2 o quebrava; a T-03.03 so confere
  - id: T-01.02
    titulo: Servico registrarAtividade
    fase: F-01.1
    status: pendente
    objetivo: Gravar o registro com validacao zod, catalogo fechado e barreira contra senha, hash, token, segredo, valor, saldo, e-mail e CPF no detalhe; aceitar o cliente de uma transacao
    arquivos:
      cria: [src/servicos/atividade.ts, tests/atividade.test.ts]
      altera: []
    teste_integracao: Dentro de prisma.$transaction, registrarAtividade grava a linha com o cliente da transacao e, se a transacao lanca erro depois, a linha nao existe no banco (rollback)
    teste_funcional: Registro valido guarda ator, acao, entidade, entidadeId e detalhe; acao fora do catalogo, detalhe com chave senha ou email, valor que parece hash de senha ou token, detalhe aninhado e detalhe grande demais sao recusados com status 422 e nada e gravado; o modulo nao exporta funcao de editar nem apagar
    criterio_aceite: tests/atividade.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-01.01]
    paralelizavel: false
  - id: T-01.03
    titulo: Leitura do registro so para admin
    fase: F-01.1
    status: pendente
    objetivo: listarAtividade(autor, opcoes) exige admin, ordena da mais recente para a mais antiga, pagina de 50 em 50 e devolve o detalhe como objeto
    arquivos:
      cria: [tests/atividade-leitura.test.ts]
      altera: [src/servicos/atividade.ts]
    teste_integracao: Com 120 registros, a pagina 1 traz 50, a 3 traz 20, total e paginas batem, a ordem e decrescente por criadoEm, e pagina fora do intervalo cai na ultima valida
    teste_funcional: Usuario comum recebe 403 e admin recebe a lista; o detalhe volta como objeto e detalhe corrompido no banco volta como objeto vazio sem lancar erro
    criterio_aceite: tests/atividade-leitura.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-01.02]
    paralelizavel: false
---

# Plano — Sprint 01 — Entidade e serviço de registro

## Objetivo da sprint

Entregar o serviço reutilizável (`registrarAtividade`, `listarAtividade`) com entidade e migration. Nada de interface: as features seguintes só precisam chamar o serviço.

## Critério de saída da sprint

A suíte inteira (`npm test`) termina com 0 failed.
