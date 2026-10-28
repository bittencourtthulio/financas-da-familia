Mesada dos filhos (FT-06 do projeto `financas-da-familia`): o responsável registra créditos de mesada e gastos de cada filho e vê o saldo e o extrato dele; o filho consulta o próprio extrato e saldo, sem ver nem alterar os do irmão.

**Base:** `feat/ft-05-filhos-da-familia` (empilhada sobre `feat/ft-04-saldo-e-resumo-do-mes`, `feat/ft-03-lancamentos-da-casa`, `feat/ft-02-trilha-de-atividade` e `feat/ft-01-fundacao`; nada foi mergeado em `main`). Este PR mira essa branch; o diff contém só a FT-06. Realiza a PR-01 e cria a PR-32 e a PR-33.

## O que muda para quem usa

- O responsável abre **Filhos > Ver mesada** e vê o **saldo em destaque** (disponível, zerado ou negativo, sempre em palavras), os totais recebido e gasto, o **formulário rápido** (crédito ou gasto, valor em formato brasileiro, data de hoje por padrão, descrição opcional) e o **extrato** do mais recente ao mais antigo, 30 por página. Cada linha leva a **editar** o movimento ou **apagá-lo** (definitivo, com confirmação em dois passos).
- A lista de filhos mostra o saldo de cada um. A página do filho tem o link para a mesada dele.
- O saldo é créditos menos gastos, somado em centavos inteiros no servidor, sem corte por data. O gasto acima do saldo **não é bloqueado**: o saldo fica negativo, sai com sinal de menos e a frase "Saldo negativo", e o registro avisa o responsável.
- O **filho** abre **Minha mesada**: saldo em destaque, extrato paginado e o combinado como referência. A página é só leitura, não tem id nem formulário, e nunca mostra o irmão.
- O adulto não vê nem mexe na mesada. O valor combinado da FT-05 continua só informativo: nada é creditado sozinho.
- A tela Atividade passa a mostrar registro, alteração e exclusão de movimento, sem valor, saldo nem descrição.
- A seed de demonstração cria movimentos fictícios: Ana com saldo positivo e Pedro com saldo negativo.

## O que muda no código

- `prisma/schema.prisma` e migration `20261028190000_mesada`: tabela `movimentos_de_mesada` (valor em `Int`, chave estrangeira para `filhos` com `Cascade`, índice por filho e data).
- `src/servicos/mesada.ts`: `registrarMovimento`, `editarMovimento`, `apagarMovimento`, `obterMovimento`, `extratoDoFilho`, `saldosDosFilhos` (só `admin`) e `meuExtrato` (só `filho`, sem id). Saldo por `groupBy` de inteiros.
- `src/app/acoes.ts` (três ações com a guarda fora do `try`), `src/app/formularios.ts`, `src/lib/mesada.ts`, `src/lib/atividade.ts` (três ações na trilha).
- Páginas `/filhos/[id]/mesada`, `/filhos/[id]/mesada/[movimentoId]` e `/mesada` (preenchida); componentes `SaldoDaMesada`, `ExtratoDeMesada`, `CamposDeMovimento`, `ApagarMovimento`, `PaginacaoDoExtrato`; estilos só com `var(--token)`.
- `prisma/demonstracao.ts`, `docs/stack/CONVENCOES.md`, `docs/projeto/PREMISSAS.md` (PR-01 realizada, PR-32, PR-33), `README.md`.

## Onde pedir olho

Ler linha a linha: `src/servicos/mesada.ts`, `src/app/acoes.ts`, as três páginas de mesada, `prisma/schema.prisma`, a migration e `prisma/demonstracao.ts`. A lista completa está em [ATENCAO.md](ATENCAO.md).

## Como foi testado

TDD em 7 tasks e 3 sprints, um commit por task, sem desvio. Suíte: 1193 testes (233 novos). Um filho real é negado em toda função do responsável; o adulto, o vazio e o desconhecido também; o filho A recebe o mesmo 403 para o movimento do irmão e para um id inexistente; as ações são executadas com sessão simulada de filho, adulto e visitante e não gravam nada; o servidor de produção real prova as telas do responsável e do filho, o isolamento entre irmãos (consulta e caminho), o extrato longo paginado e os estados negativo e zerado. O saldo é provado com `0,10 + 0,20 - 0,30 = 0` e com mil movimentos. `npm run verificar` verde (resultado literal em [ENTREGA.md](ENTREGA.md)).

## Decisões em nome da família

PR-32 (forma do movimento e saldo: centavos inteiros, data civil, saldo de tudo, negativo permitido e sinalizado, sem mesada automática) e PR-33 (só o responsável escreve, o adulto não vê, apagar é definitivo com dois passos, `Cascade` para o filho). Decisões D-01 a D-17 em [00-DECISOES.md](00-DECISOES.md).

## Pendências

- `decisao_humana` (não bloqueante): bloquear gasto acima do saldo, mesada automática, aprovação ou pedido de gasto, metas, juros, tarefas ou transferência entre filhos?
- `decisao_humana` (não bloqueante): o adulto deve ver ou lançar a mesada?
- `decisao_humana` (não bloqueante): lixeira ou desfazer ao apagar movimento?
- `decisao_humana` (não bloqueante): data futura de movimento e saldo por período.
- `recurso_externo`: sem remoto, o PR não foi aberto e nada foi empurrado; esta descrição está pronta para colar.
