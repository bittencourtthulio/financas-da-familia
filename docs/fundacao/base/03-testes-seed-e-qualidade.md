# Testes, seed e qualidade

## Contrato de entrada

- Vitest 4.1.11, `environment: node`, `include: tests/**/*.test.ts`, `fileParallelism: false` (`vitest.config.ts:4-17`, `package.json` devDependencies).
- `tests/setup.ts:9-35` cria um SQLite próprio (`prisma/test.db`) aplicando as migrations e define `JWT_SECRET` de teste.
- `tests/ajuda.ts:12-41` oferece `criarUsuario`, `criarAdmin` e `limparBanco`.
- A seed de demonstração (`prisma/seed.ts:1-61`) cria dois usuários (admin e usuário) com senha `demo1234`, recusa rodar em produção (`prisma/seed.ts:28-33`) e imprime as credenciais.

## Contrato de saída

- Comandos: `npm test`, `npm run lint`, `npm run build`, `npm run setup` (`package.json` scripts).
- 61 testes no B2 (`docs/stack/CONVENCOES.md`, seção 2). O teste de rotas sobe `next start` na porta 3178 e exige build prévio (`tests/rotas.test.ts:16-17,59-62`).

## Limites e cotas

- `testTimeout` 30 s e `hookTimeout` 180 s (`vitest.config.ts:9-10`). O primeiro `npm test` após build pode estourar o timeout do teste de rotas (relato do orquestrador do buildx).
- Não há script de checagem de tipos isolado (`package.json` scripts): o tipo só é checado dentro de `next build`.
- Não há `.github/` no repositório: nenhum pipeline automatizado.

## Erros conhecidos e tratamento

- Arquivo `.tsx` importado por teste: o `tsconfig.json` declara `jsx` do Next (preserve); o esbuild do vitest precisa de `esbuild.jsx: 'automatic'` para transformar JSX. NÃO DOCUMENTADO que o template trate isso (nenhum teste atual importa `.tsx`).
- A seed não tem teste (`tests/` não importa `prisma/seed.ts`).

## Riscos para a nossa implementação

- Qualquer mudança de interface exige `npm run build` antes do teste de rotas, senão ele serve o HTML velho.
- A seed executa ao ser importada (`prisma/seed.ts:54-60` chama `semear()` no topo do módulo); para ser testável precisa ser separada em função exportada.

## Fonte

`vitest.config.ts`, `tests/setup.ts`, `tests/ajuda.ts`, `tests/rotas.test.ts`, `prisma/seed.ts`, `package.json` — acessado em 2026-10-28.
