---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: backup-e-saude
origem_buildx: financas-da-familia
feature_id: FT-08
atualizado_em: 2026-10-28
sprint_id: sprint-02
sprint:
  titulo: Rota de saude e configuracao que falha no start
  status: pendente
  criterio_saida: A suite inteira termina com 0 failed; GET /api/saude responde 200 e 503 no servidor real, sem dado pessoal; servidor com configuracao invalida nao sobe
  riscos: [register do instrumentation nao derrubar o next start, import do Prisma derrubar a rota]
  fora_de_escopo: [Backup]
fases:
  - id: F-02.1
    titulo: Saude
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01]
  - id: F-02.2
    titulo: Configuracao no start e rotas
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.02, T-02.03]
tasks:
  - id: T-02.01
    titulo: "Servico de saude e rota GET /api/saude"
    fase: F-02.1
    status: pendente
    objetivo: Responder 200 {status ok, banco ok} quando o banco responde e 503 quando nao, sem versao, caminho nem pilha
    arquivos:
      cria: ["src/servicos/saude.ts", "src/app/api/saude/route.ts", "tests/saude.test.ts"]
      altera: []
    teste_integracao: Com o banco da suite, verificarSaude devolve ok; com consulta que lanca, devolve indisponivel e registra o evento no log sem a mensagem do erro; a rota devolve 200 e 503 com no-store
    teste_funcional: O corpo tem exatamente as duas chaves e nenhum caminho, versao nem e-mail; prazo estourado vira 503
    criterio_aceite: tests/saude.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: null
    suite: null

  - id: T-02.02
    titulo: "validarAmbiente e instrumentation que derruba o start"
    fase: F-02.2
    status: pendente
    objetivo: Configuracao invalida (DATABASE_URL ou JWT_SECRET ausente, TTL invalido) falha ao subir o servidor, com todos os problemas numa mensagem em portugues
    arquivos:
      cria: ["src/instrumentation.ts", "tests/ambiente-start.test.ts"]
      altera: ["src/lib/ambiente.ts"]
    teste_integracao: validarAmbiente lista todos os problemas de uma vez e nunca imprime o valor de um segredo; next start de verdade sem JWT_SECRET termina com codigo diferente de zero e mensagem nomeando a variavel
    teste_funcional: Ambiente valido nao falha; TTL zero ou texto falha; o servidor com ambiente valido sobe e responde
    criterio_aceite: tests/ambiente-start.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: null
    suite: null

  - id: T-02.03
    titulo: "Rota publica no teste de rotas e 503 no servidor real"
    fase: F-02.2
    status: pendente
    objetivo: Provar com o servidor de producao que /api/saude e publica, nao tem dado pessoal e responde 503 com banco inacessivel
    arquivos:
      cria: ["tests/saude-rotas.test.ts"]
      altera: ["tests/rotas.test.ts"]
    teste_integracao: tests/rotas.test.ts pede /api/saude sem cookie e recebe 200 sem redirecionar; tests/saude-rotas.test.ts sobe outro servidor com DATABASE_URL de diretorio inexistente e recebe 503
    teste_funcional: A resposta nao traz cookie, nem corpo alem de status e banco; a pagina de entrada continua abrindo
    criterio_aceite: tests/rotas.test.ts e tests/saude-rotas.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-02.01, T-02.02]
    paralelizavel: false
    concluida_em: null
    suite: null

---

# Plano — Sprint 02 — Saúde e configuração no start

## Objetivo da sprint

Rota de saúde e configuração que falha no start (PR-14).

## Critério de saída da sprint

A suíte inteira termina com 0 failed; `/api/saude` responde 200 e 503 no servidor real; configuração inválida não sobe.
