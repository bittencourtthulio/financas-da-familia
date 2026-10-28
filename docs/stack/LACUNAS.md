---
expx-schema: v1
skill: stackx
documento: lacunas
gerado-em: 2026-10-28
commit-referencia: e83574e
---

# Lacunas — financas-da-familia

Pontos sobre os quais o repositório **não tem evidência**. Cada lacuna traz o
impacto de não saber aquilo — não a ausência em si.

Companheiro de `docs/stack/CONVENCOES.md`.

## Resumo

| Impacto | Quantidade |
| ------- | ---------- |
| ALTO | 1 |
| MÉDIO | 2 |
| BAIXO | 1 |

## Índice

| ID | Ponto | Impacto | Proposta registrada? |
| -- | ----- | ------- | -------------------- |
| L-01 | Log estruturado, correlação e campos que nunca vão para o log | ALTO | Resolvida na FT-08 — §6 do CONVENCOES.md, com evidência |
| L-02 | Cobertura de teste | MÉDIO | Não |
| L-03 | Formatador de código | MÉDIO | Não |
| L-04 | Reversão de migration | BAIXO | Não |

---

### L-01 — Log estruturado · impacto ALTO

**O que falta:** o projeto só tem `console.error` na ação de formulário; não há biblioteca de log, formato estruturado, identificador de correlação nem lista de campos que nunca vão para o log.

**Impacto:** qualquer task que precise registrar um evento (trilha de atividade, backup, erro de integração) vai inventar o formato do log, e a primeira que registrar um e-mail ou uma senha em texto vai vazar dado pessoal de um menor sem que nada a barre. A PR-14 e a PR-11 pedem log sem dado pessoal, e a FT-08 é quem cria a base.

**Onde se procurou:** `src/` (busca por `console.`, `logger`, `pino`, `winston`) e `package.json`.

**Proposta registrada?** Resolvida na FT-08: `src/lib/log.ts`, lista de chaves proibidas em `src/lib/chaves-proibidas.ts` e código de correlação em `mensagemSegura` (PR-14, PR-36); §6 do CONVENCOES.md deixou de ser PROPOSTA.

**Como fecha:** a FT-08 entregar o log estruturado com teste de redação de campos.

---

### L-02 — Cobertura de teste · impacto MÉDIO

**O que falta:** nenhum comando de cobertura (`vitest run --coverage`) nem provedor instalado.

**Impacto:** o portão de prontidão da mergex conta testes por task, mas ninguém sabe quanto do código a suíte alcança; uma task pode passar sem tocar um ramo de erro.

**Onde se procurou:** `package.json` (scripts e dependências), `vitest.config.ts`.

**Proposta registrada?** Não — instalar um pacote de cobertura é decisão de dependência nova.

**Como fecha:** decisão de adicionar `@vitest/coverage-v8` com versão fixada.

---

### L-03 — Formatador de código · impacto MÉDIO

**O que falta:** não há Prettier nem formatador equivalente; só o ESLint.

**Impacto:** cada sessão formata do seu jeito (aspas, ponto e vírgula, quebra de linha), e o diff do revisor mistura estilo com mudança real.

**Onde se procurou:** `package.json`, `eslint.config.mjs`, raiz do repositório (busca por `.prettierrc`).

**Proposta registrada?** Não — decisão de estilo precisa do usuário.

**Como fecha:** decisão de adotar um formatador, ou declarar o estilo atual como convenção.

---

### L-04 — Reversão de migration · impacto BAIXO

**O que falta:** o Prisma Migrate não gera reversão; o projeto só avança (`npx prisma migrate deploy`).

**Impacto:** desfazer uma migration de produção depende do backup (FT-08), não de um comando.

**Onde se procurou:** `prisma/migrations/`, `package.json`.

**Proposta registrada?** Não — o backup restaurável da PR-13 é a resposta pretendida.

**Como fecha:** a FT-08 entregar backup e restauração testados.

---

## Conflitos em aberto

Nenhum.

---

## Limitações da detecção

- Sem remoto configurado, o fluxo de CI (`.github/workflows/verificar.yml`) nunca rodou em serviço; só o comando `npm run verificar` foi exercitado.
- O `npm audit` ainda reporta duas vulnerabilidades `moderate` em ferramenta de teste (`vitest`/`@vitest/mocker`); o portão do projeto é `--audit-level=high`.

---

## Lacunas fechadas

| Data | ID | Como fechou |
| ---- | -- | ----------- |
