---
expx-schema: v1
skill: stackx
documento: convencoes
gerado-em: 2026-10-28
commit-referencia: e83574e
projeto-legado: nao
---

# Convenções técnicas — financas-da-familia

> **Revisão depois da primeira feature (FT-01).** O stackx-detectar varreu o
> código real e converteu em evidência `arquivo:linha` as regras que o B2 tinha
> apenas prescrito. Sobraram só as regras cuja primeira evidência nasce em
> outra feature; cada uma diz qual (`evidência na FT-NN`) e
> `tests/convencoes.test.ts` confere que nenhuma citação aponta para linha que
> não existe. Uma regra foi contradita pelo código e corrigida (ver seção 5).

## 1. Identidade técnica

| Item | Valor | Origem |
| ---- | ----- | ------ |
| Linguagem | TypeScript estrito (5.9.3) | `tsconfig.json:11`, `package.json:42` |
| Runtime | Node.js 22 (22.23.3 na máquina de build) | `.github/workflows/verificar.yml:17` |
| Gerenciador de pacotes | npm, lock versionado, versões exatas no manifesto | `package-lock.json`, `tests/qualidade.test.ts:37` |
| Framework | Next.js 16.4.3, App Router, React 19.2.8 | `package.json:29` |
| Banco | SQLite via Prisma 7.10.1 com adaptador better-sqlite3 | `prisma/schema.prisma:10`, `src/lib/prisma.ts:13` |

**Evidência:** `tsconfig.json:11`, `package.json:29`, `prisma/schema.prisma:10`, `src/lib/prisma.ts:13`

---

## 2. Comandos que funcionam de verdade

| Alvo | Comando | Origem |
| ---- | ------- | ------ |
| Suíte inteira | `npm test` | `package.json:13` |
| Um teste só | `npx vitest run tests/estados.test.ts` | `vitest.config.ts:7` |
| Com cobertura | — (LACUNA) | ver `docs/stack/LACUNAS.md`, L-02 |
| Lint | `npm run lint` | `package.json:10` |
| Formatador | — (LACUNA) | ver `docs/stack/LACUNAS.md`, L-03 |
| Type check | `npm run typecheck` | `package.json:11` |
| Build | `npm run build` | `package.json:8` |
| Subir ambiente local | `npm run dev` | `package.json:7` |
| Preparar banco | `npm run setup` | `package.json:18` |
| Verificação completa | `npm run verificar` | `package.json:12` |
| Auditoria de dependência | `npm audit --audit-level=high` | `package.json:12` |

Variáveis exigidas: `DATABASE_URL` e `JWT_SECRET` (modelo no arquivo de exemplo de ambiente versionado). O teste de rotas serve o build: rode `npm run build` antes de `npm test` quando a mudança altera HTML.

**Evidência:** `package.json:7`, `package.json:12`, `package.json:13`, `vitest.config.ts:7`

---

## 3. Testes

| Item | Convenção |
| ---- | --------- |
| Onde o arquivo mora | `tests/`, plano (sem subpastas) — `vitest.config.ts:7` |
| Nome do arquivo | `<assunto>.test.ts`, em português — `tests/usuarios.test.ts:1` |
| Nome do caso | frase em português no `it('...')` — `tests/usuarios.test.ts:10` |
| Runner e versão | Vitest 4.1.11, ambiente node — `package.json:43` |
| Biblioteca de asserção | `expect` do próprio Vitest |
| Montagem de dado | funções de ajuda — `tests/ajuda.ts:10` (`criarUsuario`, `criarAdmin`) |
| Marcação de teste lento | timeout global de 30 s e do gancho de 180 s — `vitest.config.ts:9` |
| Paralelismo do runner | desligado entre arquivos — `vitest.config.ts:14` |

**Teste exemplar:** `tests/usuarios.test.ts` — é a forma que o teste de serviço novo copia: `beforeEach(limparBanco)` (linha 7), um `describe` por assunto, casos que afirmam status e mensagem do `ErroDeAplicacao`.

**Estrutura típica.** Arranjo com `criarUsuario()`, ação chamando o serviço real, asserção sobre o resultado e sobre o banco. Testes de interface usam o harness `tests/renderizar.ts:8` (renderização para HTML sem navegador); testes de leitura de código usam `tests/ajuda-estatica.ts` (camadas, tokens, versões).

**O que se mocka e o que fica real**

| Eixo | Tratamento | Evidência |
| ---- | ---------- | --------- |
| HTTP de saída | não existe no projeto | — |
| HTTP de entrada | real: o teste de rotas sobe `next start` e faz `fetch` | `tests/rotas.test.ts:59` |
| Relógio | injetado por parâmetro nos componentes que dependem dele | `src/lib/limite-de-tentativas.ts:19` |
| Sistema de arquivos | diretório temporário criado e apagado no próprio teste | `tests/camadas.test.ts:21` |
| Fila / mensageria | não existe no projeto | — |
| Serviço externo | não existe no projeto | — |

**Evidência:** `tests/usuarios.test.ts:7`, `tests/ajuda.ts:10`, `tests/rotas.test.ts:59`, `vitest.config.ts:14`

---

## 4. Banco de dados em teste

| Item | Valor |
| ---- | ----- |
| Engine e versão | SQLite (arquivo), `prisma/schema.prisma:10` |
| ORM / camada de acesso | Prisma 7.10.1, `src/lib/prisma.ts:13` |
| **Isolamento entre testes** | arquivo SQLite próprio (`prisma/test.db`), recriado por arquivo de teste, com as migrations reais — `tests/setup.ts:9`, `tests/setup.ts:25`; cada arquivo limpa as tabelas que usa — `tests/ajuda.ts:40` |
| Combinação isolamento × paralelismo | um arquivo de banco só, por isso `fileParallelism: false` — `vitest.config.ts:14` |
| Semeadura de dado de teste | funções de ajuda no próprio teste — `tests/ajuda.ts:10`; a seed de demonstração tem teste próprio — `tests/demonstracao.test.ts:15` |
| Onde vivem as migrações | `prisma/migrations/` — `prisma/migrations/20260830193658_esquema_inicial/migration.sql:2` |
| Comando de rodar migração | `npx prisma migrate deploy` (`npm run db:migrate`) — `package.json:15` |
| Comando de reverter migração | — (LACUNA) ver `docs/stack/LACUNAS.md`, L-04 |
| Migrações têm reversão declarada? | não |

**Evidência:** `tests/setup.ts:9`, `tests/setup.ts:25`, `tests/ajuda.ts:40`, `vitest.config.ts:14`

---

## 5. Estrutura e camadas

| Camada (nome no repositório) | Pasta | Pode importar de | Não importa de |
| ---------------------------- | ----- | ---------------- | -------------- |
| Apresentação | `src/app`, `src/componentes` | `src/servicos`, `src/lib` | o cliente do Prisma |
| Aplicação | `src/servicos` | `src/lib` | `src/app`, `src/componentes` |
| Dados e utilitários | `src/lib`, `prisma/` | nada acima | `src/servicos`, `src/app`, `src/componentes` |

**Força da evidência de dependência:** teste que falha (`tests/camadas.test.ts:14`, regras em `tests/ajuda-estatica.ts`), nenhuma regra de lint. A guarda achou, na primeira execução, uma violação existente: `src/lib/sessao-servidor.ts` importava `@/servicos/autenticacao`. O arquivo foi movido para a apresentação (`src/app/sessao-servidor.ts:31`), que é o seu lugar (usa `cookies()` e `redirect()` do Next).

**Onde entra código novo**

| Tipo | Pasta | Arquivo exemplar |
| ---- | ----- | ---------------- |
| Caso de uso | `src/servicos` | `src/servicos/usuarios.ts:53` |
| Utilitário puro / acesso a dados | `src/lib` | `src/lib/formato.ts:12` |
| Ação de formulário | `src/app/acoes.ts` | `src/app/acoes.ts:1` |
| Rota de API | `src/app/api/<assunto>/<ação>/route.ts` | `src/app/api/sessao/renovar/route.ts:11` |
| Componente de interface | `src/componentes` | `src/componentes/Formulario.tsx:20` |
| Estado de tela (carregando, erro, não encontrado) | `loading.tsx`, `error.tsx`, `not-found.tsx` | `src/componentes/EstadoDeErro.tsx:7`, `src/app/not-found.tsx:4` |

**Violações existentes:** nenhuma depois da correção acima (`tests/camadas.test.ts:14`).

**Evidência:** `tests/camadas.test.ts:14`, `src/app/sessao-servidor.ts:31`, `src/lib/prisma.ts:13`

---

## 6. Padrões de código com consequência

### Sinalização de erro
Serviço sinaliza erro lançando `ErroDeAplicacao` pelos construtores `naoAutenticado`, `naoAutorizado`, `naoEncontrado`, `entradaInvalida`, `limiteExcedido` e `conflito`; a ação converte em mensagem para a tela e nenhum rastro de pilha chega ao usuário: erro desconhecido vira frase genérica e a tela de erro nunca lê `message` nem `stack`.
**Evidência:** `src/lib/erros.ts:4`, `src/lib/erros.ts:27`, `src/app/acoes.ts:26`, `src/componentes/EstadoDeErro.tsx:7`, `tests/estados.test.ts:38`

### Validação de entrada
Esquema `zod` no servidor, na camada de aplicação, antes de tocar o banco.
**Evidência:** `src/servicos/usuarios.ts:20`, `src/servicos/autenticacao.ts:22`

### Log
Apenas `console.error` na ação de formulário; não há biblioteca, formato estruturado nem correlação de requisição.
**Nunca vai para o log:** — (LACUNA) ver `docs/stack/LACUNAS.md`, L-01
> **PROPOSTA** — sem evidência no repositório. Não governa: as skills irmãs tratam este ponto como decisão a levantar, não como regra. Log estruturado sem segredo, com identificador de correlação, é a PR-14; chega na FT-08.

**Evidência:** `src/app/acoes.ts:28`

### Configuração e segredo
Variável obrigatória ausente falha na leitura, com mensagem em português, não em produção; segredo só no arquivo local de ambiente, que o `.gitignore` exclui, e o modelo versionado traz o segredo vazio.
**Evidência:** `src/lib/ambiente.ts:4`, `src/lib/ambiente.ts:26`, `.gitignore:12`, `tests/seguranca-base.test.ts:58`

### Nomeação

| Elemento | Forma | Observação |
| -------- | ----- | ---------- |
| Arquivo de serviço e de lib | minúsculo, sem acento; hífen quando composto — `limite-de-tentativas.ts` | `src/lib/limite-de-tentativas.ts:19` |
| Componente | PascalCase em português — `EstadoDeErro.tsx` | `src/componentes/EstadoDeErro.tsx:7` |
| Função / método | camelCase em português — `formatarMoeda`, `renovarSessao` | `src/lib/formato.ts:12`, `src/servicos/autenticacao.ts:118` |
| Variável de ambiente | MAIÚSCULAS com sublinhado — `JWT_SECRET` | `src/lib/ambiente.ts:26` |

---

## 7. Regras do projeto (dos premissas, com a evidência que existe hoje)

### Dinheiro
Todo valor monetário é inteiro em centavos (BRL); a formatação recusa não inteiro e não passa por ponto flutuante — `src/lib/formato.ts:13`, `tests/formato.test.ts:29`. Nunca `Float` no esquema: `decidido_pelo_buildx` (PR-02, evidência na FT-03), porque o esquema ainda não tem coluna de dinheiro.

### Autorização
Papéis gravados `admin` e `usuario` (interface: Responsável e Adulto); a checagem acontece no servidor, em serviço ou ação, nunca só na interface — `src/app/sessao-servidor.ts:31`, `src/servicos/autenticacao.ts:127`, `src/servicos/usuarios.ts:53`, `tests/rotas.test.ts:147`. O papel `filho`: `decidido_pelo_buildx` (PR-06, evidência na FT-05).

### Dados do domínio
Toda entidade de domínio nasce numa feature do B4, sob TDD, com migration, e entrada validada com `zod` no servidor — validação: `src/servicos/usuarios.ts:20`; migration: `prisma/migrations/20260830193658_esquema_inicial/migration.sql:2`. Primeira entidade de domínio nova sob esta regra: `decidido_pelo_buildx` (evidência na FT-03).

### Versionamento
Uma branch por feature, `feat/ft-NN-<slug>`, na árvore principal, um commit por task, sem push forçado nem merge no fluxo automático — `docs/projeto/PREMISSAS.md:326` (PR-24). Mensagens de commit seguem Conventional Commits em português (`git log`).

**Evidência:** `src/lib/formato.ts:13`, `src/app/sessao-servidor.ts:31`, `docs/projeto/PREMISSAS.md:326`

---

## Conflitos em aberto

Nenhum.

## Decisões registradas

| Data | Quem decidiu | Ponto | Decisão | Dialeto abandonado |
| ---- | ------------ | ----- | ------- | ------------------ |
| 2026-10-28 | buildx (FT-01, D-12) | Direção das camadas | `src/lib` não importa serviço nem apresentação; `sessao-servidor` mora em `src/app` | `src/lib/sessao-servidor.ts` importando `@/servicos` |

## Histórico de atualização

| Data | Commit | O que mudou |
| ---- | ------ | ----------- |
| 2026-10-28 | inicial | B2 do buildx: regras prescritas, só comandos com evidência |
| 2026-10-28 | e83574e | FT-01: stackx-detectar converteu as regras em evidência `arquivo:linha`, adicionou comandos `typecheck` e `verificar`, e corrigiu a camada de `sessao-servidor` |

---

<!-- Lacunas: docs/stack/LACUNAS.md -->
