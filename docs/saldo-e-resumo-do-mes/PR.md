Saldo e resumo do mês (FT-04 do projeto `financas-da-familia`): ao entrar, o responsável ou o adulto vê no painel inicial o total de receitas, o total de despesas, o saldo do mês escolhido e as despesas somadas por categoria.

**Base:** `feat/ft-03-lancamentos-da-casa` (empilhada sobre `feat/ft-02-trilha-de-atividade` e `feat/ft-01-fundacao`; nada foi mergeado em `main`). Este PR mira essa branch; o diff contém só a FT-04. Realiza a PR-08 (acabamento com a skill de frontend design) e cria a PR-29.

## O que muda para quem usa

- O **Painel da família** mantém o título e o subtítulo e ganha o resumo do mês para o responsável e o adulto: cartões de **Receitas**, **Despesas** e **Saldo do mês**, e a lista **Despesas por categoria** (da maior para a menor, com barra proporcional).
- **Seletor de mês** por link (Mês anterior, Próximo mês, e Mês atual fora do mês corrente). O mês vai na URL (`/?mes=2026-09`); mês inválido não dá erro, mostra o corrente.
- **Saldo negativo** aparece com sinal de menos, a frase "Saldo negativo: as despesas passaram das receitas." e borda em tom de perigo; nunca só pela cor.
- Mês sem lançamento mostra uma mensagem com atalho para Lançamentos.
- O saldo é **só do mês escolhido**: não carrega o do mês anterior (PR-29).
- Quem tem outro papel (o filho, na FT-05) vê só título, subtítulo e uma frase neutra, sem nenhum valor.
- A seed de demonstração passa a ter lançamentos em três meses (um deles com saldo negativo).

## O que muda no código

- `src/servicos/resumo.ts`: `resumoDoMes`, soma no banco por `groupBy` em centavos inteiros (PR-02), mês validado com `zod`, guarda `exigirAdultoOuResponsavel` na primeira linha. Sem migration, sem dependência nova.
- `src/app/(sistema)/page.tsx`: lê `?mes=`, busca o resumo só para quem lança.
- `src/componentes/ResumoDoMes.tsx`, `src/componentes/SeletorDeMes.tsx`, `src/lib/resumo-links.ts`, estilos em `src/estilos/global.css` (só `var(--token)`).
- `prisma/demonstracao.ts`: nove lançamentos novos, ids fixos, idempotente.
- `docs/stack/CONVENCOES.md`, `docs/projeto/PREMISSAS.md` (PR-08 realizada, PR-29), `README.md`.

## Onde pedir olho

Ler linha a linha: `src/servicos/resumo.ts`, `src/app/(sistema)/page.tsx` e `prisma/demonstracao.ts`. A lista completa está em [ATENCAO.md](ATENCAO.md).

## Como foi testado

TDD estrito, 5 tasks em 3 sprints, um commit por task. Suíte: 696 testes (108 novos). Soma provada com 0,10 + 0,20, cem parcelas de 10 centavos e o teto de R$ 1.000.000,00; primeiro e último dia, virada de ano, ano bissexto e o fuso (23h30 de 31/10 em São Paulo ainda é outubro); mês inválido em doze formas; a guarda varre o serviço com `filho`, vazio e desconhecido; o servidor de produção real prova o painel para o adulto e o responsável, o mês sem lançamento, o mês inválido e a ausência de qualquer valor para o papel `filho`. `npm run verificar` verde (resultado literal em [ENTREGA.md](ENTREGA.md)).

## Decisões em nome da família

PR-29 (saldo é do mês escolhido, sem acumulado; só despesa é aberta por categoria). O que a invalidaria está na própria premissa. Decisões D-01 a D-15 em [00-DECISOES.md](00-DECISOES.md).

## Pendências

- `decisao_humana` (não bloqueante): a família quer saldo acumulado, isto é, o saldo de um mês carregando o do anterior?
- `recurso_externo`: sem remoto, o PR não foi aberto e nada foi empurrado; esta descrição está pronta para colar.
