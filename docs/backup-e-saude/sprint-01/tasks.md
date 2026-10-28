---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: backup-e-saude
origem_buildx: financas-da-familia
feature_id: FT-08
atualizado_em: 2026-10-28
sprint_id: sprint-01
sprint:
  titulo: Log estruturado, retencao de 90 dias e erro sem pilha
  status: pendente
  criterio_saida: A suite inteira termina com 0 failed; o log nunca grava segredo, hash, e-mail nem valor; logs com mais de 90 dias sao descartados com data injetada; erro inesperado nao mostra pilha nem mensagem ao usuario
  riscos: [citacoes de linha deslocadas em acoes.ts, lib de log importada pelo cliente]
  fora_de_escopo: [Backup, rota de saude]
fases:
  - id: F-01.1
    titulo: Modulo de log
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
  - id: F-01.2
    titulo: Erro sem pilha
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.03]
tasks:
  - id: T-01.01
    titulo: "Chaves proibidas compartilhadas e log estruturado com redacao"
    fase: F-01.1
    status: pendente
    objetivo: Mover a lista de chaves proibidas da trilha para src/lib e criar o log em JSON por linha (nivel, instante, evento, contexto) que redige o que e proibido
    arquivos:
      cria: ["src/lib/chaves-proibidas.ts", "src/lib/log.ts", "tests/log.test.ts"]
      altera: ["src/servicos/atividade.ts"]
    teste_integracao: O log escreve uma linha JSON valida com os quatro campos num destino injetado; contexto com senha, hash bcrypt, JWT, e-mail em texto e valor em centavos sai com "[removido]"; a trilha continua recusando as mesmas chaves
    teste_funcional: Evento fora do formato, contexto aninhado e texto longo sao tratados; o log nunca lanca excecao nem quando o destino falha
    criterio_aceite: tests/log.test.ts e tests/atividade-dados.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: null

  - id: T-01.02
    titulo: "Arquivo de log por dia e descarte apos 90 dias"
    fase: F-01.1
    status: pendente
    objetivo: Gravar em logs/app-AAAA-MM-DD.log e descartar arquivos com mais de 90 dias, com a data injetada, mais o comando npm run log:limpar
    arquivos:
      cria: ["scripts/limpar-logs.ts", "tests/log-retencao.test.ts"]
      altera: ["src/lib/log.ts", ".gitignore", ".env.example", "package.json"]
    teste_integracao: Numa pasta temporaria com arquivos de 0, 89, 90, 91 e 400 dias, so os de 91 dias ou mais somem; arquivo com outro nome fica; pasta inexistente nao e erro; o log escreve no arquivo do dia UTC
    teste_funcional: O comando npm run log:limpar roda de verdade sobre uma pasta temporaria e imprime quantos descartou; sem pasta de log configurada no teste, nada e gravado em disco
    criterio_aceite: tests/log-retencao.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: null
    suite: null

  - id: T-01.03
    titulo: "Erro inesperado sem pilha, com identificador de correlacao"
    fase: F-01.2
    status: pendente
    objetivo: Trocar o console.error(erro) por log estruturado com nome, codigo e identificador, e mostrar o identificador ao usuario
    arquivos:
      cria: ["tests/erro-sem-pilha.test.ts"]
      altera: ["src/app/acoes.ts", "src/lib/erros.ts"]
    teste_integracao: Uma acao cujo servico lanca um erro com e-mail e pilha na mensagem devolve a frase generica com o identificador, e a linha de log tem nome, codigo e o mesmo identificador, sem a mensagem nem a pilha
    teste_funcional: Erro de aplicacao continua devolvendo a mensagem propria sem log de erro; dois erros seguidos tem identificadores diferentes
    criterio_aceite: tests/erro-sem-pilha.test.ts, tests/estados.test.ts e as suites de acoes terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: null
    suite: null

---

# Plano — Sprint 01 — Log estruturado, retenção e erro sem pilha

## Objetivo da sprint

Log estruturado, retenção de 90 dias e erro sem pilha (PR-11, PR-14).

## Critério de saída da sprint

A suíte inteira termina com 0 failed; o log nunca grava segredo, hash, e-mail nem valor; logs com mais de 90 dias são descartados; erro inesperado não mostra pilha nem mensagem.
