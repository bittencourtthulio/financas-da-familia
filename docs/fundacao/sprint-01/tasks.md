---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: fundacao
origem_buildx: financas-da-familia
feature_id: FT-01
sprint_id: sprint-01
atualizado_em: 2026-10-28
sprint:
  titulo: Guardas e harness de teste
  status: em_andamento
  criterio_saida: A suite inteira (npm test) termina com 0 failed e existem guardas executaveis de camadas e de tokens e um harness que testa componentes .tsx
  riscos: [O esbuild do vitest nao transforma JSX sem configuracao (base/03-testes-seed-e-qualidade.md)]
  fora_de_escopo: [Qualquer mudanca de texto ou de comportamento da interface]
fases:
  - id: F-01.1
    titulo: Guardas e harness
    status: em_andamento
    criterio_saida: Os tres testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02, T-01.03]
tasks:
  - id: T-01.01
    titulo: Guarda de camadas
    fase: F-01.1
    status: concluida
    objetivo: Transformar a regra de camadas da PR-17 em teste que falha quando a apresentacao importa o Prisma ou o servico importa a apresentacao
    arquivos:
      cria: [tests/ajuda-estatica.ts, tests/camadas.test.ts]
      altera: [src/lib/sessao-servidor.ts, src/app/sessao-servidor.ts, src/app/acoes.ts, src/app/(sistema)/layout.tsx, src/app/(sistema)/page.tsx, src/app/(sistema)/perfil/page.tsx, src/app/(sistema)/perfil/senha/page.tsx, src/app/(sistema)/configuracoes/usuarios/page.tsx, src/app/entrar/page.tsx]
    teste_integracao: Varre o src real e afirma que src/app e src/componentes nao importam o cliente do Prisma e que src/servicos e src/lib nao importam src/app
    teste_funcional: Dado um diretorio temporario com um componente que importa @/lib/prisma a checagem devolve essa violacao, e sem violacao devolve lista vazia
    criterio_aceite: tests/camadas.test.ts termina com 0 failed e a checagem aponta o arquivo e o import do fixture violador
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
  - id: T-01.02
    titulo: Guarda de tokens, temas e celular
    fase: F-01.1
    status: concluida
    objetivo: Provar por teste que os dois temas definem os mesmos tokens, que nao ha cor literal fora de tokens.css e que existe a regra de 768px
    arquivos:
      cria: [tests/tema.test.ts]
      altera: [src/estilos/tokens.css, src/estilos/global.css, tests/ajuda-estatica.ts]
    teste_integracao: Le tokens.css e global.css reais e afirma que o tema claro e o modo sistema redefinem todo token de cor que difere do escuro e que global.css nao tem cor literal
    teste_funcional: Dado o texto color com valor hexadecimal literal a varredura devolve um achado, e dado var(--fg-default) devolve zero
    criterio_aceite: tests/tema.test.ts termina com 0 failed e global.css nao contem rgb nem hexadecimal fora de tokens.css
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
  - id: T-01.03
    titulo: Harness de componentes tsx
    fase: F-01.1
    status: pendente
    objetivo: Permitir que o vitest importe e renderize componentes .tsx para testar a interface sem navegador
    arquivos:
      cria: [tests/renderizar.ts, tests/harness-componentes.test.ts]
      altera: [vitest.config.ts]
    teste_integracao: Importa o componente Campo de src/componentes/Formulario.tsx dentro do vitest e o renderiza para HTML
    teste_funcional: Campo com nome email rotulo E-mail e tipo email renderiza um label com o texto E-mail e um input type email obrigatorio
    criterio_aceite: tests/harness-componentes.test.ts termina com 0 failed
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Plano — Sprint 01 — Guardas e harness de teste

## Objetivo da sprint

Entregar a capacidade de testar o que a FT-01 vai tocar: guardas executáveis de camadas (PR-17) e de tokens e temas (PR-07), e um harness que renderiza componentes `.tsx`. Nenhuma funcionalidade de negócio.

## Critério de saída da sprint

`export DATABASE_URL="file:./dev.db" JWT_SECRET="<gerado>" && npm test` termina com 0 failed (suíte inteira).

## Riscos conhecidos

- O esbuild do vitest não transforma JSX sem `esbuild.jsx: 'automatic'` — `base/03-testes-seed-e-qualidade.md`.
- O teste de rotas exige build prévio — `base/03-testes-seed-e-qualidade.md`.

## Fora de escopo

- Mudança de texto ou de comportamento da interface — pertence à sprint 02 em diante.

## Fase F-01.1 — Guardas e harness

**Objetivo:** guardas de camadas e de tema, e o harness de componentes.

**Tasks:** T-01.01, T-01.02, T-01.03

**Critério de saída:** os três testes novos passam e a suíte inteira está verde.

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_01_1["F-01.1 Guardas e harness"]
    T_01_01["T-01.01<br/>Guarda de camadas"]
    T_01_02["T-01.02<br/>Guarda de tokens, temas"]
    T_01_03["T-01.03<br/>Harness de componentes"]
  end
  T_01_01 --> T_01_02
  T_01_02 --> T_01_03
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_01_01 pendente
  class T_01_02 pendente
  class T_01_03 pendente
  class T_01_01,T_01_02,T_01_03 critico
```

## Tasks

Os campos de cada task estão no frontmatter acima (fonte única; YAML e prosa dizem a mesma coisa).

- **T-01.01** — Guarda de camadas: a PR-17 deixa de ser prescrição e vira teste.
- **T-01.02** — Guarda de tokens, temas e celular: corrige o único literal de cor (`rgb(255 255 255 / 0.12)` em `src/estilos/global.css:92`) criando o token `--statusbar-hover`.
- **T-01.03** — Harness de componentes `.tsx`: habilita as sprints 02 e 03.
- **T-01.01** concluída em 2026-10-28 · suíte: 65 passed, 0 failed · real: 0,4 h (aprox.)
- **T-01.02** concluída em 2026-10-28 · suíte: 75 passed, 0 failed · real: 0,5 h (aprox.)
