O sistema Finanças da Família ganha a fundação (FT-01 do projeto `financas-da-familia`): o responsável entra com e-mail e senha, vê o "Painel da família", cadastra um adulto, edita o perfil e troca a senha, em português, com tema claro e escuro e menu em gaveta no celular.
O código vinha do template do buildx; esta entrega adapta os textos ao domínio, fecha o que as premissas prometiam e o template não cumpria (menu do celular, estados de tela, limite de tentativas de login, renovação de sessão, pipeline, versões fixadas) e deixa as convenções do projeto com evidência `arquivo:linha`.

## Arquivos alterados

```
./
  M .gitignore
  M README.md
  M package-lock.json
  M package.json
.github/workflows/
  A verificar.yml
docs/fundacao/
  A 00-AUDITORIA.md
  A 00-BLOQUEIOS.md
  A 00-DECISOES.md
  A ATENCAO.md
  A ENTREGA.md
  A FECHAMENTO.md
  A ORQUESTRADOR.md
  A PR.md
  A QA-PACOTE.md
docs/fundacao/base/
  A 00-INDICE.md
  A 00-LACUNAS.md
  A 01-casca-e-navegacao.md
  A 02-autenticacao-e-sessao.md
  A 03-testes-seed-e-qualidade.md
docs/fundacao/sprint-01/
  A tasks.md
docs/fundacao/sprint-02/
  A tasks.md
docs/fundacao/sprint-03/
  A tasks.md
docs/fundacao/sprint-04/
  A tasks.md
docs/projeto/
  M MAPA.md
  M PREMISSAS.md
docs/sprintx/estimativas/
  A HISTORICO.md
docs/stack/
  M CONVENCOES.md
  A LACUNAS.md
prisma/
  A demonstracao.ts
  M seed.ts
src/app/
  M acoes.ts
  A error.tsx
  M layout.tsx
  A not-found.tsx
  R sessao-servidor.ts
src/app/(sistema)/
  A error.tsx
  M layout.tsx
  A loading.tsx
  M page.tsx
src/app/(sistema)/configuracoes/usuarios/
  M LinhaDeUsuario.tsx
  M page.tsx
src/app/(sistema)/perfil/
  M page.tsx
src/app/(sistema)/perfil/senha/
  M page.tsx
src/app/api/sessao/renovar/
  A route.ts
src/app/entrar/
  M page.tsx
src/componentes/
  A BotaoDaGaveta.tsx
  A CascaDoSistema.tsx
  A EstadoDeCarregando.tsx
  A EstadoDeErro.tsx
  A RenovadorDeSessao.tsx
src/estilos/
  M global.css
  M tokens.css
src/lib/
  M erros.ts
  A formato.ts
  A gaveta.ts
  A limite-de-tentativas.ts
  A marca.ts
  A papeis.ts
  A renovacao.ts
src/servicos/
  M autenticacao.ts
tests/
  A ajuda-estatica.ts
  M autenticacao.test.ts
  A camadas.test.ts
  A convencoes.test.ts
  A demonstracao.test.ts
  A estados.test.ts
  A formato.test.ts
  A gaveta.test.ts
  A harness-componentes.test.ts
  A limite-de-tentativas.test.ts
  A marca.test.ts
  A papeis.test.ts
  A premissas.test.ts
  A qualidade.test.ts
  A renderizar.ts
  A renovacao.test.ts
  M rotas.test.ts
  A seguranca-base.test.ts
  A tema.test.ts
```

Total: 79 arquivos. A lista é completa; nenhum arquivo foi omitido. Um arquivo foi renomeado sem mudar de conteúdo: `src/lib/sessao-servidor.ts` → `src/app/sessao-servidor.ts` (R100, ver D-18).

## Origem

Feature `FT-01` (slug `fundacao`) do projeto `financas-da-familia`, planejada pelo sprintx em `docs/fundacao/` (4 sprints, 14 tasks). Decisões respondidas pelo buildx em `00-DECISOES.md` (D-00 a D-18); premissas novas PR-21 a PR-24 em `docs/projeto/PREMISSAS.md`. Branch `feat/ft-01-fundacao`, sem remoto (o PR não pôde ser aberto automaticamente).

## O que foi testado

Um item por task; cada uma rodou a suíte inteira antes do commit.

- T-01.01 — guarda de camadas: varre `src` real e prova, com fixtures violadores, que apresentação não importa o Prisma e que `lib` e serviços não importam a camada de cima (achou e corrigiu `lib/sessao-servidor`).
- T-01.02 — guarda de tokens: dois temas definem os mesmos tokens, nenhuma cor literal fora de `tokens.css`, regra de 768px.
- T-01.03 — harness: componentes `.tsx` renderizam no vitest.
- T-02.01 — painel, barra lateral, login e meta description no servidor de produção.
- T-02.02 — Responsável e Adulto na tela de usuários e na barra de status.
- T-02.03 — seed: entra com as duas contas, idempotente, recusa produção, só os papéis `admin` e `usuario`.
- T-03.01 — gaveta: abrir, fechar, fechar ao navegar; botão só dentro de 768px; tabela rolável.
- T-03.02 — carregando, erro (sem mensagem técnica nem pilha) e 404 em português.
- T-03.03 — valor em centavos e data no fuso de São Paulo, independente do fuso da máquina.
- T-04.01 — sexta tentativa após cinco erros recusa com 429; outro e-mail segue entrando.
- T-04.02 — renovação: 200 com cookie novo, 401 sem cookie e após troca de senha; papel vem do banco.
- T-04.03 — cookie `httpOnly`, `sameSite` lax, `secure` só em produção; ambiente obrigatório; hash.
- T-04.04 — `npm run verificar`, versões exatas, fluxo sem segredo literal.
- T-04.05 — toda citação do `CONVENCOES.md` existe; totais e `Realizada em` das premissas batem.

Suíte: 19 arquivos, 173 testes (61 herdados + 112 novos), 0 falhas — `npm test` (rode `npm run build` antes). `npm run lint`, `npm run typecheck`, `npm run build` e `npm audit --audit-level=high` com código 0.

## Roteiro de teste manual

[QA-PACOTE.md](QA-PACOTE.md) — 12 casos.
Colaterais a observar: tela de perfil e troca de senha depois de mexer no menu do celular; tela de login depois de cinco erros; qualquer tela depois de 15 minutos abertas.

### OLHO OBRIGATÓRIO — ler linha a linha

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `.github/workflows/verificar.yml` | A | +25/-0 | pipeline: gera o segredo de assinatura no próprio passo, sem valor literal |
| `package-lock.json` | M | +2/-2 | dependências: raiz do lock acompanha as versões fixadas (2 linhas) |
| `package.json` | M | +4/-2 | dependências: versões fixadas e dois scripts novos (`typecheck`, `verificar`) |
| `prisma/demonstracao.ts` | A | +48/-0 | credenciais conhecidas de demonstração e guarda contra produção (PR-04) |
| `prisma/seed.ts` | M | +10/-48 | executa a seed com credenciais conhecidas; reduzido a chamar a função testável |
| `src/app/(sistema)/configuracoes/usuarios/page.tsx` | M | +25/-19 | autorização: tela só do responsável; a negação ao adulto virou meta refresh por causa do `loading.tsx` (D-17) |
| `src/app/(sistema)/layout.tsx` | M | +15/-5 | autenticação: porta de entrada do sistema; ganhou casca, botão Menu e renovador |
| `src/app/api/sessao/renovar/route.ts` | A | +34/-0 | autenticação e contrato público novo: rota POST que emite cookie de sessão (PR-21) |
| `src/app/sessao-servidor.ts` | R | — | autorização: onde `exigirUsuarioAdmin` verifica o papel no servidor; movido de `src/lib`, conteúdo idêntico (R100) |
| `src/componentes/RenovadorDeSessao.tsx` | A | +26/-0 | sessão: manda o navegador para o login quando a renovação é recusada |
| `src/lib/erros.ts` | M | +4/-0 | contrato público de erro: novo código 429 `muitas_tentativas` |
| `src/lib/limite-de-tentativas.ts` | A | +58/-0 | autenticação: decide quem fica bloqueado e por quanto tempo (PR-22) |
| `src/servicos/autenticacao.ts` | M | +43/-4 | autenticação: acrescenta o limite de tentativas e a renovação de sessão ao login (T-04.01, T-04.02) |

### LEITURA RÁPIDA — conferir intenção, não implementação

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `README.md` | M | +45/-51 | documentação do projeto; reescrito de template para produto |
| `docs/projeto/PREMISSAS.md` | M | +58/-8 | decisões em nome da família; PR-21 a PR-24 são novas (f2_autonoma) e valem leitura do "o que invalida" |
| `docs/stack/CONVENCOES.md` | M | +163/-43 | convenções com evidência; conferidas por `tests/convencoes.test.ts` (citações existem) |
| `docs/stack/LACUNAS.md` | A | +107/-0 | lacunas do stackx; sem execução |
| `src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx` | M | +2/-1 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/app/(sistema)/error.tsx` | A | +14/-0 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/app/(sistema)/loading.tsx` | A | +6/-0 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/app/(sistema)/page.tsx` | M | +8/-7 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/app/acoes.ts` | M | +1/-1 | só o caminho do import mudou (`sessao-servidor`); arquivo de autenticação, por isso sobe de dispensável |
| `src/app/entrar/page.tsx` | M | +3/-1 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/app/error.tsx` | A | +18/-0 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/app/layout.tsx` | M | +3/-2 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/app/not-found.tsx` | A | +16/-0 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/componentes/BotaoDaGaveta.tsx` | A | +20/-0 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/componentes/CascaDoSistema.tsx` | A | +39/-0 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/componentes/EstadoDeCarregando.tsx` | A | +8/-0 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/componentes/EstadoDeErro.tsx` | A | +27/-0 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/estilos/global.css` | M | +26/-1 | estilo: dois temas e celular conferidos por `tests/tema.test.ts`; o aspecto visual só se vê no navegador |
| `src/estilos/tokens.css` | M | +2/-0 | estilo: dois temas e celular conferidos por `tests/tema.test.ts`; o aspecto visual só se vê no navegador |
| `src/lib/formato.ts` | A | +54/-0 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/lib/gaveta.ts` | A | +15/-0 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/lib/marca.ts` | A | +8/-0 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/lib/papeis.ts` | A | +18/-0 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `src/lib/renovacao.ts` | A | +7/-0 | código novo ou editado em camada isolada, com os dois testes da task verdes |
| `tests/ajuda-estatica.ts` | A | +140/-0 | define as regras que as guardas de camadas, tokens e versões aplicam; erro aqui enfraquece três testes |
| `tests/seguranca-base.test.ts` | A | +115/-0 | afirma o cookie, o ambiente e o hash; o revisor confere se os valores esperados são os certos |

### DISPENSÁVEL — a máquina já provou

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `.gitignore` | M | +4/-0 | duas linhas de arquivos locais da máquina (rastro e estado de exibição) |
| `docs/fundacao/00-AUDITORIA.md` | A | +20/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/00-BLOQUEIOS.md` | A | +16/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/00-DECISOES.md` | A | +158/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/ATENCAO.md` | A | — | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/ENTREGA.md` | A | +47/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/FECHAMENTO.md` | A | — | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/ORQUESTRADOR.md` | A | +95/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/PR.md` | A | — | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/QA-PACOTE.md` | A | — | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/base/00-INDICE.md` | A | +36/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/base/00-LACUNAS.md` | A | +13/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/base/01-casca-e-navegacao.md` | A | +34/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/base/02-autenticacao-e-sessao.md` | A | +34/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/base/03-testes-seed-e-qualidade.md` | A | +33/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/sprint-01/tasks.md` | A | +135/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/sprint-02/tasks.md` | A | +133/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/sprint-03/tasks.md` | A | +133/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/fundacao/sprint-04/tasks.md` | A | +171/-0 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/projeto/MAPA.md` | M | +5/-5 | artefato do método (plano, decisões, entrega); sem execução |
| `docs/sprintx/estimativas/HISTORICO.md` | A | — | artefato do método (plano, decisões, entrega); sem execução |
| `src/app/(sistema)/perfil/page.tsx` | M | +1/-1 | alteração mecânica de um import, coberta pelos testes de rotas |
| `src/app/(sistema)/perfil/senha/page.tsx` | M | +1/-1 | alteração mecânica de um import, coberta pelos testes de rotas |
| `tests/autenticacao.test.ts` | M | +63/-2 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/camadas.test.ts` | A | +75/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/convencoes.test.ts` | A | +95/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/demonstracao.test.ts` | A | +59/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/estados.test.ts` | A | +86/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/formato.test.ts` | A | +65/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/gaveta.test.ts` | A | +64/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/harness-componentes.test.ts` | A | +34/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/limite-de-tentativas.test.ts` | A | +70/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/marca.test.ts` | A | +33/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/papeis.test.ts` | A | +34/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/premissas.test.ts` | A | +103/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/qualidade.test.ts` | A | +74/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/renderizar.ts` | A | +13/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/renovacao.test.ts` | A | +87/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/rotas.test.ts` | M | +115/-5 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |
| `tests/tema.test.ts` | A | +86/-0 | arquivo de teste: só acrescenta casos; a suíte inteira está verde |

Nenhum arquivo ficou sem faixa. A classificação foi feita pela mesma sessão que implementou (sem agente revisor neste harness).
