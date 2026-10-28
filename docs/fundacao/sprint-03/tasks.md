---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: fundacao
origem_buildx: financas-da-familia
feature_id: FT-01
sprint_id: sprint-03
atualizado_em: 2026-10-28
sprint:
  titulo: Celular, estados e formato brasileiro
  status: concluido
  criterio_saida: A suite inteira termina com 0 failed, a gaveta abre e fecha no celular, ha estados carregando erro e nao encontrado em portugues e o formato brasileiro existe
  riscos: [Componente cliente com estado precisa funcionar na renderizacao do servidor e no vitest sem navegador]
  fora_de_escopo: [Telas de dominio, qualquer data ou valor exibido ao usuario]
fases:
  - id: F-03.1
    titulo: Gaveta, estados e formato
    status: concluido
    criterio_saida: Os tres conjuntos de testes da sprint passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02, T-03.03]
tasks:
  - id: T-03.01
    titulo: Gaveta de navegacao no celular
    fase: F-03.1
    status: concluida
    objetivo: Dar ao celular um botao Menu que abre e fecha a barra lateral e fecha ao navegar, e deixar a tabela de usuarios rolavel
    arquivos:
      cria: [src/lib/gaveta.ts, src/componentes/CascaDoSistema.tsx, src/componentes/BotaoDaGaveta.tsx, tests/gaveta.test.ts]
      altera: [src/app/(sistema)/layout.tsx, src/app/(sistema)/configuracoes/usuarios/page.tsx, src/estilos/global.css, tests/rotas.test.ts]
    teste_integracao: Com o servidor de pe o HTML do painel contem o botao Menu com aria-controls e aria-expanded false e a tela Usuarios contem o envoltorio rolavel da tabela
    teste_funcional: Alternar a gaveta fechada na rota raiz abre na rota raiz, alternar de novo fecha, e a gaveta aberta na raiz conta como fechada na rota perfil
    criterio_aceite: tests/gaveta.test.ts e tests/rotas.test.ts terminam com 0 failed e global.css so mostra o botao Menu dentro da regra max-width 768px
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
  - id: T-03.02
    titulo: Estados carregando, erro e nao encontrado
    fase: F-03.1
    status: concluida
    objetivo: Cobrir os estados carregando, erro e pagina inexistente com telas em portugues que nunca mostram mensagem tecnica
    arquivos:
      cria: [src/componentes/EstadoDeCarregando.tsx, src/componentes/EstadoDeErro.tsx, src/app/(sistema)/loading.tsx, src/app/(sistema)/error.tsx, src/app/error.tsx, src/app/not-found.tsx, tests/estados.test.ts]
      altera: [src/estilos/global.css, tests/rotas.test.ts]
    teste_integracao: Com o servidor de pe uma rota inexistente responde 404 com a frase Pagina nao encontrada em portugues
    teste_funcional: EstadoDeErro renderizado com um erro cuja mensagem e SELECT secreto nao contem essa mensagem nem a palavra stack e oferece o botao Tentar de novo com role alert, e EstadoDeCarregando tem role status e o texto Carregando
    criterio_aceite: tests/estados.test.ts e tests/rotas.test.ts terminam com 0 failed e nenhum dos arquivos de estado exibe error.message
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
  - id: T-03.03
    titulo: Formato brasileiro de valor e data
    fase: F-03.1
    status: concluida
    objetivo: Prover formatacao de valor em centavos e de data no formato e no fuso brasileiros para as features seguintes
    arquivos:
      cria: [src/lib/formato.ts, tests/formato.test.ts]
      altera: []
    teste_integracao: A formatacao usa o ICU real do Node para pt-BR e BRL e nao depende do fuso da maquina que roda o teste
    teste_funcional: formatarMoeda de 123456 devolve R$ 1.234,56, formatarMoeda de 10.5 lanca erro porque centavos sao inteiros, e formatarData de 2026-10-28T02:30:00Z devolve 27/10/2026
    criterio_aceite: tests/formato.test.ts termina com 0 failed
    depende_de: [T-03.02]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
---

# Plano — Sprint 03 — Celular, estados e formato brasileiro

## Objetivo da sprint

Fechar a PR-16: celular com gaveta (abaixo de 768px), estados vazio, carregando e erro em português, e formato brasileiro de valor e data no fuso `America/Sao_Paulo`. O estado vazio já existe no painel (T-02.01).

## Critério de saída da sprint

`npm run build` seguido de `npm test` termina com 0 failed (suíte inteira).

## Riscos conhecidos

- Componente cliente com estado precisa renderizar no servidor e no vitest sem navegador — `base/01-casca-e-navegacao.md`.
- A gaveta hoje não tem acionador (`src/estilos/global.css:176-190`) — `base/00-LACUNAS.md`.

## Fora de escopo

- Telas de domínio e qualquer data ou valor exibido — FT-03 em diante.

## Fase F-03.1 — Gaveta, estados e formato

**Objetivo:** gaveta, estados e formato.

**Tasks:** T-03.01, T-03.02, T-03.03

**Critério de saída:** os testes da sprint passam e a suíte inteira está verde.

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
%% Grafo de tasks — sprint-03 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_03_1["F-03.1 Gaveta, estados e formato"]
    T_03_01["T-03.01<br/>Gaveta de navegacao"]
    T_03_02["T-03.02<br/>Estados carregando, erro"]
    T_03_03["T-03.03<br/>Formato brasileiro"]
  end
  T_03_01 --> T_03_02
  T_03_02 --> T_03_03
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_03_01 pendente
  class T_03_02 pendente
  class T_03_03 pendente
  class T_03_01,T_03_02,T_03_03 critico
```

## Tasks

Os campos de cada task estão no frontmatter acima (fonte única).

- **T-03.01** — D-06. **T-03.02** — D-07. **T-03.03** — D-08.
- **T-03.01** concluída em 2026-10-28 · suíte: 104 passed, 0 failed · real: 0,8 h (aprox.)
- **T-03.02** concluída em 2026-10-28 · suíte: 113 passed, 0 failed · real: 0,8 h (aprox.)
- Divergência da T-03.02: o `loading.tsx` do sistema coloca as páginas dentro de um limite de streaming; a negação de `/configuracoes/usuarios` para o adulto deixou de ser um 307 e passou a ser um `meta refresh` para `/` no corpo (status 200), sem nenhum dado de administração. O teste de rotas foi reescrito para afirmar o que importa (redirecionamento sem vazamento). Registrado como D-17 e como risco residual no FECHAMENTO.
- **T-03.03** concluída em 2026-10-28 · suíte: 121 passed, 0 failed · real: 0,4 h (aprox.)
- Fechamento da sprint 03 em 2026-10-28: `npm run build` + `npm test` → 13 arquivos, 121 passed, 0 failed.
