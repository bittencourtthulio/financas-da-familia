---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: fundacao
origem_buildx: financas-da-familia
feature_id: FT-01
sprint_id: sprint-02
atualizado_em: 2026-10-28
sprint:
  titulo: Dominio Financas da Familia e demonstracao
  status: em_andamento
  criterio_saida: A suite inteira termina com 0 failed, o painel e a navegacao falam Financas da Familia e Responsavel e Adulto, e a seed cria so responsavel e adulto
  riscos: [tests/rotas.test.ts afirma o texto antigo do painel e precisa mudar antes do codigo]
  fora_de_escopo: [Filhos, lancamentos e mesada na seed, papel filho]
fases:
  - id: F-02.1
    titulo: Textos do dominio e seed
    status: em_andamento
    criterio_saida: Os tres conjuntos de testes da sprint passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01, T-02.02, T-02.03]
tasks:
  - id: T-02.01
    titulo: Nome do sistema e painel da familia
    fase: F-02.1
    status: concluida
    objetivo: Trocar os textos genericos do template por titulo, subtitulo, estado vazio e nome do sistema do dominio
    arquivos:
      cria: [src/lib/marca.ts, tests/marca.test.ts]
      altera: [tests/rotas.test.ts, src/app/layout.tsx, src/app/(sistema)/page.tsx, src/app/(sistema)/layout.tsx, src/app/entrar/page.tsx, src/estilos/global.css]
    teste_integracao: Com o servidor de producao de pe o painel autenticado contem Painel da familia e o nome do sistema na lateral e a tela de login contem o nome do sistema e a meta description em portugues
    teste_funcional: A descricao do sistema em src/lib/marca.ts esta em portugues e nao menciona buildx nem Gerado
    criterio_aceite: tests/rotas.test.ts e tests/marca.test.ts terminam com 0 failed e nenhum arquivo de src contem a frase Esta e a tela inicial do sistema
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
  - id: T-02.02
    titulo: Rotulos Responsavel e Adulto
    fase: F-02.1
    status: concluida
    objetivo: Mostrar o papel admin como Responsavel e o papel usuario como Adulto em toda a interface
    arquivos:
      cria: [src/lib/papeis.ts, tests/papeis.test.ts]
      altera: [tests/rotas.test.ts, src/app/(sistema)/layout.tsx, src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx, src/app/(sistema)/configuracoes/usuarios/page.tsx]
    teste_integracao: Com o servidor de pe a tela Usuarios do responsavel lista Responsavel e Adulto nas linhas e nas opcoes do campo Papel e nao contem a palavra Administrador
    teste_funcional: rotuloDoPapel de admin devolve Responsavel e de usuario devolve Adulto, e um papel desconhecido devolve o proprio valor
    criterio_aceite: tests/papeis.test.ts e tests/rotas.test.ts terminam com 0 failed e a palavra Administrador nao aparece em src
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
  - id: T-02.03
    titulo: Seed de demonstracao testavel
    fase: F-02.1
    status: pendente
    objetivo: Extrair a seed para uma funcao testavel que cria so o responsavel e o adulto de demonstracao e nunca roda em producao
    arquivos:
      cria: [prisma/demonstracao.ts, tests/demonstracao.test.ts]
      altera: [prisma/seed.ts, README.md]
    teste_integracao: semearDemonstracao contra o banco de teste cria as duas contas e ambas entram pelo servico entrar com a senha de demonstracao, e uma segunda execucao nao duplica
    teste_funcional: Com NODE_ENV production a funcao lanca erro e nao cria nada, e os papeis criados sao exatamente admin e usuario
    criterio_aceite: tests/demonstracao.test.ts termina com 0 failed e README.md lista as credenciais de demonstracao novas
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Plano — Sprint 02 — Domínio Finanças da Família e demonstração

## Objetivo da sprint

Adaptar os textos do template ao domínio (PR-03), usar os rótulos Responsável e Adulto (PR-06 parcial, sem o papel `filho`) e entregar a seed de demonstração testável (PR-04).

## Critério de saída da sprint

`npm run build` seguido de `npm test` termina com 0 failed (suíte inteira).

## Riscos conhecidos

- `tests/rotas.test.ts:98` afirma o texto antigo do painel: o teste muda antes do código (`base/01-casca-e-navegacao.md`).
- O teste de rotas serve o build; cada task que muda HTML exige `npm run build` antes da suíte.

## Fora de escopo

- Filhos, lançamentos e mesada na seed — nascem nas FT-05, FT-03 e FT-06.
- Papel `filho` — FT-05.

## Fase F-02.1 — Textos do domínio e seed

**Objetivo:** textos do domínio, rótulos de papel e seed testável.

**Tasks:** T-02.01, T-02.02, T-02.03

**Critério de saída:** os testes da sprint passam e a suíte inteira está verde.

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
%% Grafo de tasks — sprint-02 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_02_1["F-02.1 Textos do dominio e seed"]
    T_02_01["T-02.01<br/>Nome do sistema e painel"]
    T_02_02["T-02.02<br/>Rotulos Responsavel e Adulto"]
    T_02_03["T-02.03<br/>Seed de demonstracao"]
  end
  T_02_01 --> T_02_02
  T_02_02 --> T_02_03
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_02_01 pendente
  class T_02_02 pendente
  class T_02_03 pendente
  class T_02_01,T_02_02,T_02_03 critico
```

## Tasks

Os campos de cada task estão no frontmatter acima (fonte única).

- **T-02.01** — D-03 e D-04. **T-02.02** — D-02. **T-02.03** — D-05 e D-13.
- **T-02.01** concluída em 2026-10-28 · suíte: 84 passed, 0 failed · real: 0,6 h (aprox.)
- **T-02.02** concluída em 2026-10-28 · suíte: 90 passed, 0 failed · real: 0,4 h (aprox.)
