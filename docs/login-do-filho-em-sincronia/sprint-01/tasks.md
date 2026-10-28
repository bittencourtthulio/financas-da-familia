---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: login-do-filho-em-sincronia
origem_buildx: financas-da-familia
feature_id: FT-09
atualizado_em: 2026-10-28
sprint_id: sprint-01
sprint:
  titulo: O login do filho acompanha o cadastro
  status: concluido
  criterio_saida: A suite inteira termina com 0 failed; editar o nome do filho renomeia o usuario de login na mesma transacao, sem tocar e-mail, irmao nem filho sem login; a trilha nao leva nome antigo nem e-mail
  riscos: [citacoes de linha deslocadas em filhos.ts, testes antigos que fixavam o comportamento sem sincronia]
  fora_de_escopo: [Troca de e-mail, sentido contrario Usuarios para filho, tela nova]
fases:
  - id: F-01.1
    titulo: Servico e trilha
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
  - id: F-01.2
    titulo: Documentacao viva
    status: concluido
    criterio_saida: convencoes.test.ts e premissas.test.ts verdes; npm run verificar com codigo 0
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.03]
tasks:
  - id: T-01.01
    titulo: "editarFilho renomeia o usuario de login na mesma transacao"
    fase: F-01.1
    status: concluida
    objetivo: Dentro da transacao de editarFilho, atualizar usuario.nome para o nome do filho quando houver login e o nome divergir
    arquivos:
      cria: ["tests/filhos-sincronia.test.ts"]
      altera: ["src/servicos/filhos.ts", "tests/privacidade-banco.test.ts", "tests/privacidade-exclusao.test.ts", "tests/convencoes.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: Renomear filho com login muda o nome do usuario e a sessao do filho ve o nome novo; e-mail, papel, ativo e senha intocados; irmao e login do irmao intocados; homonimo e admin intocados; adulto, filho, vazio e visitante recebem 403 e nada muda
    teste_funcional: Filho sem login edita sem criar nem alterar usuario; login desativado acompanha e segue desativado; mudar so a mesada nao mexe no usuario; nome com espacos nas pontas e aparado
    criterio_aceite: tests/filhos-sincronia.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: "verde: 75 arquivos, 1457 testes"

  - id: T-01.02
    titulo: "Atomicidade, trilha sem dado pessoal e cura de divergencia"
    fase: F-01.1
    status: concluida
    objetivo: Provar que falha no rastro desfaz a renomeacao, que a trilha registra o campo login sem nome antigo nem e-mail, que a tela de atividade o descreve em portugues, e que login ja divergente e curado
    arquivos:
      cria: ["tests/filhos-sincronia-trilha.test.ts"]
      altera: ["src/lib/atividade.ts"]
    teste_integracao: Com registrarAtividade falhando, nem o filho nem o usuario mudam e nao ha rastro; a trilha traz campos com login e nenhuma coluna tem e-mail nem o nome antigo; excluir o filho depois nao deixa nome em tabela alguma
    teste_funcional: Sem login, campos nao tem login; descreverAtividade mostra "nome do login"; login que ja divergia do filho (dado antigo) e curado ao reenviar o cadastro, com rastro; sem divergencia e sem mudanca nao grava rastro
    criterio_aceite: tests/filhos-sincronia-trilha.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: "verde"

  - id: T-01.03
    titulo: "PR-39, convencoes, mapa e fechamento"
    fase: F-01.2
    status: concluida
    objetivo: Registrar a PR-39, atualizar CONVENCOES.md, MAPA.md, PROJETO.md e os testes de coerencia (nove features, 39 premissas), e fechar os artefatos
    arquivos:
      cria: ["docs/login-do-filho-em-sincronia/ENTREGA.md", "docs/login-do-filho-em-sincronia/PR.md", "docs/login-do-filho-em-sincronia/QA-PACOTE.md", "docs/login-do-filho-em-sincronia/ATENCAO.md", "docs/login-do-filho-em-sincronia/FECHAMENTO.md"]
      altera: ["docs/projeto/PREMISSAS.md", "docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "docs/stack/CONVENCOES.md", "tests/premissas.test.ts", "tests/convencoes.test.ts"]
    teste_integracao: premissas.test.ts confere 39 premissas, PR-39 f2_autonoma provisoria realizada em FT-09 e o MAPA com nove entregues; convencoes.test.ts confere a citacao nova
    teste_funcional: npm run verificar termina com codigo 0
    criterio_aceite: npm run verificar e npm audit --audit-level=high com codigo 0
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: "verde"

---

# Plano — Sprint 01 — O login do filho acompanha o cadastro

## Objetivo da sprint

Corrigir PEND-18: o usuário de login do filho acompanha o nome do cadastro (PR-39), sem tocar o e-mail.

## Critério de saída da sprint

A suíte inteira termina com 0 failed; `npm run verificar` com código 0.
