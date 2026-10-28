# Lançamentos, categorias, datas e a guarda de papel que o resumo reaproveita

## Contrato de entrada

- `Lancamento` (`prisma/schema.prisma:68`): `tipo` ("receita" | "despesa"), `valorCentavos Int` sempre positivo (o sinal vem do tipo), `data` texto `AAAA-MM-DD`, `categoriaId` com chave estrangeira `Restrict`; índice em `data`. `Categoria` (`prisma/schema.prisma:54`) tem `nome` e `tipo`.
- `src/lib/datas.ts`: `mesValido`, `mesAtualEmSaoPaulo(agora)` (relógio injetável), `intervaloDoMes` (`de` incluído, `ate` excluído), `mesAnterior`, `mesSeguinte`, `rotuloDoMes`. O filtro de mês é comparação de texto.
- `src/lib/formato.ts`: `formatarMoeda(centavos)` aceita inteiro seguro, inclusive negativo ("-R$ 1,00").
- `exigirAdultoOuResponsavel` (`src/servicos/autenticacao.ts`) é a guarda por lista de permitidos; `papelPodeLancar` decide o menu e a página.
- `listarLancamentos` não soma de propósito (D-01 da FT-03).
- Seed (`prisma/demonstracao.ts`): sete categorias e seis lançamentos do mês corrente, id fixo, `upsert` sem sobrescrever, guarda contra produção.
- Apagar lançamento é definitivo (PR-28): não existe linha lógica "apagada" que o saldo precise filtrar.

## Contrato de saída

Esta feature não grava nada. Ela lê `lancamentos` e `categorias` e devolve totais em centavos inteiros. Nenhuma migration.

## Limites e cotas

Valor por lançamento até R$ 1.000.000,00 (100.000.000 centavos, PR-26). Um inteiro seguro do JavaScript comporta somas de mais de 90 milhões de lançamentos no teto; sem risco prático.

## Erros conhecidos e tratamento

- Somar `Float` ou no cliente quebraria `0,10 + 0,20` (PR-02): a soma é feita no banco, em inteiros, ou por inteiros no servidor.
- `groupBy` do Prisma devolve `_sum.valorCentavos` como `number | null`; `null` aparece só em grupo vazio, que o `groupBy` não devolve.
- Data fora do formato não entra no banco (a FT-03 valida), então o filtro por texto cobre todo o mês sem tratamento de hora ou fuso.
