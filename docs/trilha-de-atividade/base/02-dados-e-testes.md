# Esquema, migrations, ajuda de teste e seed

## Contrato de entrada

- `prisma/schema.prisma` tem só o modelo `Usuario` (`@@map("usuarios")`), cuid como chave, `DateTime @default(now())`.
- Migration única `prisma/migrations/20260830193658_esquema_inicial/`; o teste aplica as migrations reais num banco SQLite próprio por arquivo (`tests/setup.ts`).
- `limparBanco` (`tests/ajuda.ts`) apaga só `usuario`; qualquer tabela nova precisa entrar nele, senão um teste enxerga o que o outro criou.
- `semearDemonstracao(prisma)` (`prisma/demonstracao.ts`) recebe `Pick<PrismaClient, 'usuario'>` e cria responsável e adulto fictícios, idempotente, recusa produção.

## Contrato de saída

- Cliente Prisma gerado em `src/gerado/prisma` (ignorado pelo git); depois de mudar o esquema é preciso `npx prisma generate`.
- A seed só aparece nos testes de `tests/demonstracao.test.ts`, que contam usuários e papéis.

## Limites e cotas

NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

- `prisma migrate dev` é interativo; a migration será gerada com `prisma migrate dev --name` num banco descartável ou escrita a mão e conferida com `migrate deploy` + `migrate diff`.
- Interação transação × adaptador `better-sqlite3` com `$transaction` interativo: NÃO ENCONTRADO uso no repositório (ver `00-LACUNAS.md`).
