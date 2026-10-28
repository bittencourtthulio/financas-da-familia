# Lacunas da base — saldo-e-resumo-do-mes

Uma linha por lacuna: o que se procurou, onde, e o que isso implica para a F2.

- Soma, total ou saldo de lançamentos — procurado em `src/servicos`, `src/lib` (busca por `aggregate`, `groupBy`, `_sum`, `reduce`, `saldo`): NÃO ENCONTRADO. A FT-03 deixou isso de propósito (`src/servicos/lancamentos.ts`, comentário de `listarLancamentos`). Implica: a F2 define onde o cálculo mora (serviço novo) e como somar sem ponto flutuante.
- Regra de saldo acumulado ou transportado entre meses — procurado em `docs/projeto/PROJETO.md`, `PREMISSAS.md`, `docs/produto/`: NÃO DOCUMENTADO. O critério de aceite diz "saldo do mês"; nada diz que o saldo de um mês carrega o do anterior. Implica: não inventar; a F2 registra premissa e pendência `decisao_humana` e segue só com o mês.
- Parâmetro de URL de mês na tela inicial — procurado em `src/app/(sistema)/page.tsx`: NÃO ENCONTRADO (a página não lê `searchParams`). A lista de lançamentos já usa `?mes=`. Implica: a F2 reaproveita o formato `AAAA-MM` e `mesValido`, e valida com `zod` no servidor.
- Componente de cartão de resumo, barra e seletor de mês fora da lista de lançamentos — procurado em `src/componentes`, `src/estilos/global.css`: NÃO ENCONTRADO (só `FiltrosDeLancamentos`, acoplado ao endereço de `/lancamentos`). Implica: F3 prevê componentes e estilos novos.
- Dado de demonstração do mês anterior e de mais de um lançamento por categoria — procurado em `prisma/demonstracao.ts`: NÃO ENCONTRADO (seis lançamentos do mês corrente, um por categoria). Implica: F3 prevê estender a seed.
- Gráfico ou barra com tokens — procurado em `src/estilos/global.css`, `src/estilos/tokens.css`: NÃO ENCONTRADO. Implica: barras só com tokens existentes.
