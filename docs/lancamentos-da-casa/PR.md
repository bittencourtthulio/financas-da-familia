Lançamentos da casa (FT-03 do projeto `financas-da-familia`): o responsável ou o adulto registra receitas e despesas com valor, data, categoria e descrição, cria categorias, edita e apaga lançamento, e cada alteração entra na trilha de atividade (FT-02), sem nunca gravar o valor.

**Base:** `feat/ft-02-trilha-de-atividade` (empilhada sobre `feat/ft-01-fundacao`; nada foi mergeado em `main`). Este PR mira essa branch; o diff contém só a FT-03. Realiza a PR-02 e cria a PR-26, a PR-27 e a PR-28.

## O que muda para quem usa

- Item **Lançamentos** no menu, com **Categorias** aninhado, para o responsável e o adulto. Quem tiver outro papel (o filho, na FT-05) não vê o item e, se abrir o endereço, é mandado ao painel sem receber dado algum.
- Lista do mês com data, tipo, categoria, descrição e valor (despesa em vermelho com sinal de menos, receita em verde), filtro por mês e por tipo, 50 por página. Não há total nem saldo: isso é da FT-04.
- Formulário de novo lançamento: tipo, valor (digita-se "1.234,56"), data (hoje por padrão, no fuso de São Paulo), categoria (só as do tipo escolhido) e descrição opcional. A edição vem preenchida; apagar pede uma segunda confirmação e não dá para desfazer.
- Tela de categorias: criar categoria de despesa ou de receita. Não há renomear nem apagar.
- Cada criação, edição e exclusão de lançamento e cada categoria criada aparecem em **Atividade** (para o responsável), com o tipo e sem o valor.
- A seed de demonstração cria sete categorias e seis lançamentos fictícios do mês corrente.

## O que muda no código

- `prisma/schema.prisma` + migration `20261028150000_lancamentos`: `Categoria` e `Lancamento`; o valor é `Int` em centavos (nunca `Float`/`Decimal`), o dia é texto `AAAA-MM-DD`. O lançamento não guarda quem o criou (isso é da trilha).
- `src/lib/dinheiro.ts` (leitor do valor em formato brasileiro, sem ponto flutuante, teto de R$ 1.000.000,00) e `src/lib/datas.ts` (dia civil, mês, hoje em São Paulo).
- `src/servicos/lancamentos.ts`: o serviço; `exigirAdultoOuResponsavel` (lista de permitidos) é a primeira linha de cada função. Criar, editar e apagar gravam o rastro na mesma transação; reenviar dados iguais não grava rastro.
- `src/servicos/autenticacao.ts`, `src/app/sessao-servidor.ts`: a guarda e `exigirUsuarioDeLancamentos`.
- `src/app/acoes.ts`, `src/app/formularios.ts`, páginas em `src/app/(sistema)/lancamentos/` e componentes novos.
- `src/lib/atividade.ts`: quatro ações novas no catálogo e a descrição delas na tela.
- `docs/stack/CONVENCOES.md`: dinheiro, autorização, dados e auditoria com evidência `arquivo:linha`.

## Onde pedir olho

Ler linha a linha: `src/servicos/lancamentos.ts`, `src/lib/dinheiro.ts`, `src/servicos/autenticacao.ts`, `src/app/sessao-servidor.ts`, `src/app/acoes.ts`, `prisma/schema.prisma` e a migration, `prisma/demonstracao.ts`. A lista completa está em [ATENCAO.md](ATENCAO.md).

## Como foi testado

TDD estrito, 9 tasks em 3 sprints, um commit por task. Suíte: 588 testes (338 novos). O leitor do valor é testado com entradas hostis (ponto decimal, notação científica, negativo, zero, acima do teto, não texto); o esquema é testado contra `Float`; a guarda de papel varre todas as funções do serviço com `filho`, vazio e desconhecido; o servidor de produção real prova as telas, o filtro, o 404 da edição e a negação ao papel `filho`. `npm run verificar` verde (resultado literal em [ENTREGA.md](ENTREGA.md)).

## Decisões em nome da família

PR-26 (forma do lançamento: centavos, data civil, teto, descrição opcional), PR-27 (categorias só se criam; nenhum conjunto oficial) e PR-28 (apagar é definitivo, com rastro sem valor). O que as invalidaria está em cada uma. Decisões D-01 a D-18 em [00-DECISOES.md](00-DECISOES.md).

## Pendências

- `decisao_humana` (não bloqueante): a família quer categorias padrão, renomear ou apagar categoria? E lixeira ou desfazer para lançamento apagado?
- `recurso_externo`: sem remoto, o PR não foi aberto e nada foi empurrado; esta descrição está pronta para colar.
