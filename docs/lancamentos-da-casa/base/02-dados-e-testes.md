# Esquema, migrations, ajuda de teste, seed e formato

## Contrato de entrada

- `prisma/schema.prisma` tem `Usuario` e `Atividade`; nenhuma coluna de dinheiro nem de data civil. Migrations em `prisma/migrations/` (`20260830193658_esquema_inicial`, `20261028143052_atividade`); o teste aplica as migrations reais (`tests/setup.ts:25`).
- `limparBanco` (`tests/ajuda.ts`) apaga `atividade` e `usuario`; toda tabela nova entra ali (CONVENCOES, seção 7).
- A seed (`prisma/demonstracao.ts`) recebe `Pick<PrismaClient, 'usuario' | 'atividade'>`, recusa `NODE_ENV=production`, usa `upsert` com id fixo para ser idempotente.
- `src/lib/formato.ts`: `formatarMoeda(centavos)` recusa não inteiro e não usa ponto flutuante; `formatarData` e `formatarDataEHora` usam `America/Sao_Paulo` e recebem `Date`.

## Contrato de saída

- Prisma `Int` em SQLite aceita até 2.147.483.647; em centavos isso é R$ 21.474.836,47, folga sobre qualquer limite razoável de lançamento doméstico.
- `tests/convencoes.test.ts` confere que toda citação `arquivo:linha` do CONVENCOES.md aponta para linha existente.

## Limites e cotas

NÃO DOCUMENTADO: limite de valor de lançamento, tamanho de descrição e de nome de categoria (a F2 decide).

## Erros conhecidos e tratamento

- Não existe leitor de entrada em formato brasileiro ("1.234,56") em lugar nenhum; só formatação de saída. Precisa nascer, sem `parseFloat` (PR-02).
- Não existe data civil (dia sem hora). `new Date('2026-10-28')` é UTC e, em São Paulo, vira o dia 27 à noite: guardar o dia como `DateTime` reabre o erro de fuso (PR-16).
- A transação interativa do Prisma com o adaptador `better-sqlite3` já foi provada na FT-02 (`src/servicos/usuarios.ts`).
