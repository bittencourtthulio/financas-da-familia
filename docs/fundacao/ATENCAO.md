# Onde gastar atenção — fundacao

Branch: `feat/ft-01-fundacao` → `main`
Data: 2026-10-28

**79 arquivos — 13 olho obrigatório, 26 leitura rápida, 40 dispensável**

A classificação é derivada de evidência registrada, nunca de sensação.
Tamanho de diff não é critério. (Classificação feita pela mesma sessão que
implementou, sem o agente `revisor-diff` neste harness; a regra "sobe para a
mais rigorosa na dúvida" foi aplicada.)

## OLHO OBRIGATÓRIO — ler linha a linha

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

## LEITURA RÁPIDA — conferir intenção, não implementação

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

## DISPENSÁVEL — a máquina já provou

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

## Fontes consultadas

- `docs/fundacao/sprint-0N/tasks.md` — arquivos declarados e testes de cada task
- `git diff --name-status` e `--numstat` contra `main` — o que mudou de verdade
- `docs/stack/CONVENCOES.md` — camadas e autorização (seções 5 e 7)
- `docs/projeto/PREMISSAS.md` — zonas sensíveis (PR-05, PR-12, PR-21, PR-22)

## Fontes ausentes

- `docs/legado/PERFIL.md` — projeto novo, sem zonas de risco declaradas nem raio de impacto: dimensão não avaliada, não avaliada como baixa.
- Índice do `memox` — sem histórico de regressão por arquivo: a faixa não desceu nem subiu por isso.
- Os arquivos novos de `docs/fundacao/` listados acima ainda não tinham tamanho no momento da classificação.
