---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: fundacao
origem_buildx: financas-da-familia
feature_id: FT-01
titulo: Fundacao - acesso, papeis e esqueleto
tipo_trabalho: feature
fechado_em: 2026-10-28
modulo_afetado: [apresentacao, aplicacao, dados, lib, estilos, testes, infra, documentacao]
arquivos_alterados: [tests/ajuda-estatica.ts, tests/camadas.test.ts, src/lib/sessao-servidor.ts, src/app/sessao-servidor.ts, src/app/acoes.ts, src/app/(sistema)/layout.tsx, src/app/(sistema)/page.tsx, src/app/(sistema)/perfil/page.tsx, src/app/(sistema)/perfil/senha/page.tsx, src/app/(sistema)/configuracoes/usuarios/page.tsx, src/app/entrar/page.tsx, tests/tema.test.ts, src/estilos/tokens.css, src/estilos/global.css, tests/renderizar.ts, tests/harness-componentes.test.ts, src/lib/marca.ts, tests/marca.test.ts, tests/rotas.test.ts, src/app/layout.tsx, src/lib/papeis.ts, tests/papeis.test.ts, src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx, prisma/demonstracao.ts, tests/demonstracao.test.ts, prisma/seed.ts, README.md, src/lib/gaveta.ts, src/componentes/CascaDoSistema.tsx, src/componentes/BotaoDaGaveta.tsx, tests/gaveta.test.ts, src/componentes/EstadoDeCarregando.tsx, src/componentes/EstadoDeErro.tsx, src/app/(sistema)/loading.tsx, src/app/(sistema)/error.tsx, src/app/error.tsx, src/app/not-found.tsx, tests/estados.test.ts, src/lib/formato.ts, tests/formato.test.ts, src/lib/limite-de-tentativas.ts, tests/limite-de-tentativas.test.ts, src/servicos/autenticacao.ts, src/lib/erros.ts, tests/autenticacao.test.ts, src/app/api/sessao/renovar/route.ts, src/componentes/RenovadorDeSessao.tsx, src/lib/renovacao.ts, tests/renovacao.test.ts, tests/seguranca-base.test.ts, .github/workflows/verificar.yml, tests/qualidade.test.ts, package.json, package-lock.json, tests/convencoes.test.ts, tests/premissas.test.ts, docs/stack/LACUNAS.md, docs/fundacao/, docs/sprintx/estimativas/HISTORICO.md, docs/stack/CONVENCOES.md, docs/projeto/PREMISSAS.md, docs/projeto/MAPA.md, docs/projeto/PROJETO.md, .gitignore]
palavras_chave: [acesso, papeis, painel, sessao, tema, celular, seed, convencoes]
resumo: O sistema agora fala Financas da Familia em portugues, com gaveta no celular, estados de tela, limite de tentativas, renovacao de sessao, seed de responsavel e adulto e convencoes com evidencia
decisao_principal: Fechar por teste o que as premissas prometiam e o template nao cumpria (gaveta, estados, limite, renovacao, pipeline, versoes fixadas), sem criar entidade de dominio
risco_residual: A interacao do clique no Menu e a renovacao no navegador nao foram exercitadas em navegador real; o contador de tentativas vive em memoria; a negacao do adulto em Usuarios virou meta refresh com status 200
testes_adicionados: 112
---

# Fechamento — fundacao

## O que foi entregue

A fundação do Finanças da Família: o responsável entra, vê o "Painel da família", cadastra um adulto, edita o perfil e troca a senha, com os papéis mostrados como Responsável e Adulto. Foram corrigidas as lacunas que o template trazia e as premissas prometiam: menu em gaveta no celular, estados de carregamento, erro e página inexistente em português, limite de cinco tentativas de login por e-mail, renovação deslizante da sessão, formato brasileiro de valor e data, `npm run verificar` com fluxo de exemplo e versões fixadas. A seed cria só o responsável e o adulto de demonstração.

## Decisão principal

Fechar por teste o que as premissas prometiam e o template não cumpria, sem criar entidade de domínio (D-01, D-13).

## Risco residual

- O clique no botão Menu, a hidratação da casca e o `setInterval` de renovação só foram exercitados por renderização no servidor e por testes de lógica; nenhum navegador real rodou nesta feature.
- O contador de tentativas de login vive na memória do processo (PR-22): reiniciar o servidor o zera, e um terceiro pode travar o login de um e-mail por 15 minutos.
- A negação de `/configuracoes/usuarios` ao adulto passou a ser um `meta refresh` com status 200, sem dado de administração (D-17).
- O fluxo do GitHub Actions nunca rodou em serviço (não há remoto); `npm audit` ainda lista duas vulnerabilidades `moderate` em ferramenta de teste (`vitest`).
- PR-04 está realizada só na parte de usuários: filhos, lançamentos e mesada de demonstração entram nas FT-03, FT-05 e FT-06.

## Confirmação das premissas contra o código

| Premissa | Evidência |
|---|---|
| PR-03 esqueleto | rotas `/`, `/configuracoes/usuarios`, `/perfil`, `/perfil/senha` em `tests/rotas.test.ts` |
| PR-04 seed | `prisma/demonstracao.ts:7`, `tests/demonstracao.test.ts:15` (parcial: só usuários) |
| PR-05 autenticação | `src/lib/sessao.ts:54`, `src/servicos/autenticacao.ts:118` (renovação, PR-21) |
| PR-07 design system | `tests/tema.test.ts:34` (dois temas, tokens, sem cor literal) |
| PR-12 segurança | `tests/seguranca-base.test.ts`, `tests/autenticacao.test.ts` (limite), versões exatas em `tests/qualidade.test.ts` |
| PR-15 qualidade | `package.json:12` (`verificar`), `.github/workflows/verificar.yml` |
| PR-16 idioma e celular | `src/lib/formato.ts`, `tests/gaveta.test.ts`, `tests/estados.test.ts`, `src/app/layout.tsx:12` |
| PR-17 template como esqueleto | `tests/camadas.test.ts:14` (achou e corrigiu uma violação) |
| PR-18 uma família | `prisma/schema.prisma:13` — o modelo `Usuario` não tem coluna de família nem de inquilino |
| PR-19 suíte Expx | `.expx/expx-lock.json` lista sprintx, runx, memox, prodx, buildx, designx, stackx e mergex; harness `claude` |
| PR-20 dependências | `package.json:29` (Next 16.4.3), `:25` (Prisma 7.10.1), `:32` (Zod 4.6.7), overrides em `:45`; `npm audit --audit-level=high` com código 0 |

Defeitos reais achados e corrigidos: `lib` importava serviço (D-18); cor literal em `global.css`; menu do celular sem acionador; sem tela de carregamento, erro ou 404 em português; sem limite de tentativas; sem renovação de sessão; duas versões não fixadas; sem script de checagem de tipos nem pipeline.
