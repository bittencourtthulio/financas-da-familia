---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: backup-e-saude
origem_buildx: financas-da-familia
feature_id: FT-08
atualizado_em: 2026-10-28
sprint_id: sprint-03
sprint:
  titulo: Backup, restauracao testada, runbook e premissas
  status: concluido
  criterio_saida: A suite inteira termina com 0 failed; backup e restauracao funcionam de ponta a ponta e recusam arquivo invalido; PR-11, PR-13 e PR-14 realizadas; CONVENCOES.md com evidencia conferida; quatro comandos verdes
  riscos: [citacoes de linha deslocadas, restauracao sobre banco aberto]
  fora_de_escopo: [Agendamento, nuvem, criptografia, restauracao pela interface]
fases:
  - id: F-03.1
    titulo: Backup e restauracao
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02, T-03.03]
  - id: F-03.2
    titulo: Premissas e convencoes
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.04]
tasks:
  - id: T-03.01
    titulo: "Gerar backup consistente com nome datado"
    fase: F-03.1
    status: concluida
    objetivo: Funcao e comando npm run backup que geram backups/backup-AAAA-MM-DD-HHMMSS.db por VACUUM INTO
    arquivos:
      cria: ["src/lib/backup.ts", "scripts/backup.ts", "tests/backup.test.ts"]
      altera: [".gitignore"]
    teste_integracao: Sobre um banco temporario com as migrations reais e dados, o backup abre como SQLite, passa no integrity_check e tem as mesmas linhas; o nome segue o padrao datado em Sao Paulo (data injetada); pasta 0700 e arquivo 0600
    teste_funcional: Banco de origem inexistente e erro claro em portugues e nao cria arquivo; dois backups no mesmo segundo nao se sobrescrevem; o comando npm run backup roda de verdade e imprime o caminho
    criterio_aceite: tests/backup.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: "suite inteira verde no verificar final: 1444 testes"

  - id: T-03.02
    titulo: "Validar e restaurar preservando o banco atual"
    fase: F-03.1
    status: concluida
    objetivo: Funcao e comando npm run restaurar que validam o arquivo, preservam copia do banco atual e trocam o banco de forma atomica
    arquivos:
      cria: ["src/lib/restauracao.ts", "scripts/restaurar.ts", "tests/restauracao.test.ts"]
      altera: ["src/lib/backup.ts"]
    teste_integracao: Backup valido restaura e o banco passa a ter os dados do backup; a copia do banco anterior existe e abre; arquivo que nao e SQLite, arquivo truncado, SQLite sem as tabelas esperadas e caminho inexistente sao recusados sem alterar o banco atual (byte a byte)
    teste_funcional: A lista de tabelas esperadas bate com as tabelas do banco migrado de verdade; o comando npm run restaurar sai com codigo diferente de zero e mensagem em portugues para arquivo invalido
    criterio_aceite: tests/restauracao.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: "suite inteira verde no verificar final: 1444 testes"

  - id: T-03.03
    titulo: "Teste de ponta a ponta e runbook no README"
    fase: F-03.1
    status: concluida
    objetivo: Provar o ciclo cria dados, faz backup, altera e apaga, restaura e confere; documentar o runbook
    arquivos:
      cria: ["tests/backup-ponta-a-ponta.test.ts"]
      altera: ["README.md", ".env.example"]
    teste_integracao: Com cliente Prisma proprio sobre banco temporario, usuarios, filho, lancamentos e movimentos sao criados, o backup e gerado, os dados sao alterados e apagados, a restauracao devolve exatamente os dados e o login com a senha original funciona
    teste_funcional: O README cita backup, restaurar, parar o sistema, /api/saude, log de 90 dias, guardar o arquivo com cuidado e que ele fica fora do git; .gitignore cobre backups/ e logs/
    criterio_aceite: tests/backup-ponta-a-ponta.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-03.02, T-02.03]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: "suite inteira verde no verificar final: 1444 testes"

  - id: T-03.04
    titulo: "PR-11, PR-13 e PR-14 realizadas, convencoes com evidencia e fechamento"
    fase: F-03.2
    status: concluida
    objetivo: Criar PR-36 a PR-38, marcar PR-11, PR-13, PR-14 e as novas como Realizada em FT-08, atualizar CONVENCOES.md com evidencia arquivo:linha e fechar MAPA e PROJETO
    arquivos:
      cria: []
      altera: ["docs/stack/CONVENCOES.md", "docs/projeto/PREMISSAS.md", "docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "tests/premissas.test.ts", "tests/convencoes.test.ts"]
    teste_integracao: tests/convencoes.test.ts confere cada citacao nova e nenhuma antiga ficou quebrada; tests/premissas.test.ts confere PR-11, PR-13, PR-14, PR-36, PR-37 e PR-38 como Realizada em FT-08
    teste_funcional: Premissas de outras features nao foram marcadas por engano; o total de premissas bate com o frontmatter; MAPA diz 8 entregues e PROJETO diz features_entregues 8; os quatro comandos terminam com codigo 0
    criterio_aceite: tests/convencoes.test.ts e tests/premissas.test.ts terminam com 0 failed e npm run verificar passa
    depende_de: [T-03.03]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: "suite inteira verde no verificar final: 1444 testes"

---

# Plano — Sprint 03 — Backup, restauração, runbook e premissas

## Objetivo da sprint

Backup com restauração testada, runbook e fechamento das premissas (PR-11, PR-13, PR-14).

## Critério de saída da sprint

A suíte inteira termina com 0 failed; backup e restauração de ponta a ponta; PR-11, PR-13, PR-14 realizadas; CONVENCOES.md com evidência conferida.
