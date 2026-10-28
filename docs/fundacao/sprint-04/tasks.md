---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: fundacao
origem_buildx: financas-da-familia
feature_id: FT-01
sprint_id: sprint-04
atualizado_em: 2026-10-28
sprint:
  titulo: Seguranca, qualidade e convencoes
  status: concluido
  criterio_saida: A suite inteira, o lint, o build e a auditoria de dependencia terminam verdes e o CONVENCOES.md nao tem mais regra sem evidencia
  riscos: [Renovar sessao sem revalidar ressuscitaria sessao derrubada por troca de senha, Pinar versoes exige atualizar o lock sem rede]
  fora_de_escopo: [Log estruturado, rota de saude, backup, trilha de atividade, papel filho]
fases:
  - id: F-04.1
    titulo: Seguranca, pipeline e convencoes
    status: concluido
    criterio_saida: Os cinco conjuntos de testes da sprint passam e a suite inteira, lint, build e audit estao verdes
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.01, T-04.02, T-04.03, T-04.04, T-04.05]
tasks:
  - id: T-04.01
    titulo: Limite de tentativas de login
    fase: F-04.1
    status: concluida
    objetivo: Bloquear por 15 minutos o e-mail que errou a senha cinco vezes seguidas, conforme a PR-22
    arquivos:
      cria: [src/lib/limite-de-tentativas.ts, tests/limite-de-tentativas.test.ts]
      altera: [src/servicos/autenticacao.ts, src/lib/erros.ts, tests/autenticacao.test.ts]
    teste_integracao: Chamando entrar cinco vezes com senha errada a sexta tentativa com a senha certa recusa com status 429 e outro e-mail continua entrando
    teste_funcional: Com relogio injetado cinco falhas bloqueiam, apos 15 minutos libera, e um sucesso zera o contador
    criterio_aceite: tests/limite-de-tentativas.test.ts e tests/autenticacao.test.ts terminam com 0 failed e a mensagem do bloqueio esta em portugues
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
  - id: T-04.02
    titulo: Renovacao deslizante da sessao
    fase: F-04.1
    status: concluida
    objetivo: Renovar a sessao na metade do tempo de vida do token enquanto a aba esta aberta, revalidando conta e corte de senha, conforme a PR-21
    arquivos:
      cria: [src/app/api/sessao/renovar/route.ts, src/componentes/RenovadorDeSessao.tsx, src/lib/renovacao.ts, tests/renovacao.test.ts]
      altera: [src/servicos/autenticacao.ts, src/app/(sistema)/layout.tsx, tests/rotas.test.ts]
    teste_integracao: Com o servidor de pe POST em api sessao renovar com cookie valido responde 200 e novo cookie de sessao, sem cookie responde 401, e com token anterior a uma troca de senha responde 401 sem novo cookie
    teste_funcional: renovarSessao de um token valido devolve token do mesmo usuario com emitidoEm maior ou igual, e de usuario desativado ou de sessao anterior ao corte lanca nao autenticado
    criterio_aceite: tests/renovacao.test.ts e tests/rotas.test.ts terminam com 0 failed
    depende_de: [T-04.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
  - id: T-04.03
    titulo: Confirmacao da seguranca de base
    fase: F-04.1
    status: concluida
    objetivo: Provar por teste os itens da PR-12 que o codigo cumpre mas nenhum teste afirma - cookie de sessao e variavel de ambiente obrigatoria
    arquivos:
      cria: [tests/seguranca-base.test.ts]
      altera: []
    teste_integracao: Contra src/lib/sessao.ts e src/lib/ambiente.ts reais o cookie de sessao e httpOnly com sameSite lax e secure so em producao, e JWT_SECRET ausente faz a leitura falhar com mensagem em portugues
    teste_funcional: Dado NODE_ENV production opcoesDoCookie devolve secure true, e dado NODE_ENV test devolve secure false, com maxAge igual ao tempo de vida do token
    criterio_aceite: tests/seguranca-base.test.ts termina com 0 failed e nenhum arquivo de src foi alterado por esta task
    depende_de: [T-04.02]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
  - id: T-04.04
    titulo: Pipeline de verificacao e versoes fixadas
    fase: F-04.1
    status: concluida
    objetivo: Criar o comando npm run verificar, o fluxo de exemplo do GitHub Actions e fixar todas as versoes do package.json
    arquivos:
      cria: [.github/workflows/verificar.yml, tests/qualidade.test.ts]
      altera: [package.json, package-lock.json, tests/ajuda-estatica.ts]
    teste_integracao: Le package.json e o fluxo reais e afirma que os scripts typecheck e verificar existem, que nenhuma versao tem prefixo circunflexo ou til e que o fluxo chama npm run verificar sem segredo literal
    teste_funcional: A funcao que detecta versao nao fixada devolve a dependencia com circunflexo e devolve vazio para versao exata
    criterio_aceite: tests/qualidade.test.ts termina com 0 failed e npm run typecheck termina com codigo 0
    depende_de: [T-04.03]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
  - id: T-04.05
    titulo: Convencoes com evidencia e premissas coerentes
    fase: F-04.1
    status: concluida
    objetivo: Rodar o stackx-detectar, converter decidido_pelo_buildx em evidencia arquivo e linha e registrar Realizada em FT-01 nas premissas
    arquivos:
      cria: [tests/convencoes.test.ts, tests/premissas.test.ts, docs/stack/LACUNAS.md, docs/fundacao/]
      altera: [docs/stack/CONVENCOES.md, docs/projeto/PREMISSAS.md, docs/projeto/MAPA.md, docs/projeto/PROJETO.md, README.md, .gitignore]
    teste_integracao: Toda citacao arquivo e linha de CONVENCOES.md aponta para arquivo que existe com a linha dentro do tamanho, e toda regra ainda marcada decidido_pelo_buildx traz no mesmo item o texto evidencia na FT- seguido do numero da feature que a produzira
    teste_funcional: Os totais do frontmatter de PREMISSAS.md batem com os blocos PR-NN e toda premissa que a FT-01 realiza no MAPA.md tem Realizada em FT-01
    criterio_aceite: tests/convencoes.test.ts e tests/premissas.test.ts terminam com 0 failed
    depende_de: [T-04.04]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
---

# Plano — Sprint 04 — Segurança, qualidade e convenções

## Objetivo da sprint

Fechar o que as premissas prometem e o código não cumpre: limite de tentativas (PR-12/PR-22), renovação de sessão (PR-05/PR-21), pipeline e versões fixadas (PR-15/PR-12/PR-23), e a revisão de convenções do B2 (stackx-detectar) com a rastreabilidade das premissas.

## Critério de saída da sprint

`npm run build`, `npm test`, `npm run lint` e `npm audit --audit-level=high` terminam com código 0.

## Riscos conhecidos

- Renovar sem revalidar ressuscitaria sessão derrubada por troca de senha — `base/02-autenticacao-e-sessao.md`.
- Atualizar o `package-lock.json` pode exigir rede — sem rede, edita-se a raiz do lock à mão e valida-se com `npm ls`.

## Fora de escopo

- Log estruturado, `/api/saude`, backup — FT-08. Trilha de atividade — FT-02.

## Fase F-04.1 — Segurança, pipeline e convenções

**Objetivo:** fechar segurança, pipeline e convenções.

**Tasks:** T-04.01, T-04.02, T-04.03, T-04.04, T-04.05

**Critério de saída:** os testes da sprint passam e a suíte inteira, lint, build e audit estão verdes.

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
%% Grafo de tasks — sprint-04 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_04_1["F-04.1 Seguranca, pipeline e convencoes"]
    T_04_01["T-04.01<br/>Limite de tentativas"]
    T_04_02["T-04.02<br/>Renovacao da sessao"]
    T_04_03["T-04.03<br/>Seguranca de base"]
    T_04_04["T-04.04<br/>Pipeline e versoes"]
    T_04_05["T-04.05<br/>Convencoes e premissas"]
  end
  T_04_01 --> T_04_02
  T_04_02 --> T_04_03
  T_04_03 --> T_04_04
  T_04_04 --> T_04_05
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_04_01 pendente
  class T_04_02 pendente
  class T_04_03 pendente
  class T_04_04 pendente
  class T_04_05 pendente
  class T_04_01,T_04_02,T_04_03,T_04_04,T_04_05 critico
```

## Tasks

Os campos de cada task estão no frontmatter acima (fonte única).

- **T-04.01** — D-10. **T-04.02** — D-09. **T-04.03** — D-12 (confirma a PR-12 por teste). **T-04.04** — D-11. **T-04.05** — D-12, D-14; declara também os artefatos do planejamento (`docs/fundacao/`) e o `.gitignore`.
- **T-04.01** concluída em 2026-10-28 · suíte: 131 passed, 0 failed · real: 0,6 h (aprox.)
- **T-04.02** concluída em 2026-10-28 · suíte: 141 passed, 0 failed · real: 0,9 h (aprox.)
- Divergência da T-04.02: `src/lib/renovacao.ts` foi acrescentado (a conta do intervalo precisa existir fora do componente cliente, porque o layout, do servidor, a chama); o teste passou a vermelho de verdade quando a função estava dentro do arquivo cliente (500 em todas as páginas).
- **T-04.03** concluída em 2026-10-28 · suíte: 150 passed, 0 failed · real: 0,4 h (aprox.)
- **T-04.04** concluída em 2026-10-28 · suíte: 158 passed, 0 failed (via npm run verificar) · real: 0,6 h (aprox.)
- **T-04.05** concluída em 2026-10-28 · suíte: 173 passed, 0 failed · real: 1,0 h (aprox.)
- Fechamento da sprint 04 em 2026-10-28: `npm run lint`, `npx tsc --noEmit`, `npm run build` e `npm test` → 19 arquivos, 173 passed, 0 failed; `npm run verificar` já tinha passado na T-04.04. Divergência: `docs/stack/LACUNAS.md` foi criado pelo stackx-detectar (não estava na lista).
