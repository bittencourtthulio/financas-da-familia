# Filho, guardas, trilha, dinheiro e datas que a mesada reaproveita

## Contrato de entrada

- `Filho` (`prisma/schema.prisma`): `id`, `nome`, `mesadaCentavos Int` e `periodicidade` informativos, `usuarioId` único opcional (login do filho, `SetNull`). `minhaMesada(autor)` (`src/servicos/filhos.ts`) começa por `exigirFilho` e acha o filho por `usuarioId`, sem receber id.
- Guardas (`src/servicos/autenticacao.ts`): `exigirAdmin`, `exigirFilho`, `exigirAdultoOuResponsavel`; as de página em `src/app/sessao-servidor.ts` (`exigirUsuarioAdmin`, `exigirUsuarioFilho`).
- `registrarAtividade(entrada, cliente)` (`src/servicos/atividade.ts`): ação do catálogo fechado `src/lib/atividade.ts`; `detalhe` plano; chave que casa `senha|hash|token|valor|centavo|saldo|e-?mail|cpf` é recusada. `descreverAtividade` traduz o registro para a tela.
- Dinheiro: `lerValorEmReais` (`src/lib/dinheiro.ts`), `centavosParaCampo`, `formatarMoeda` (aceita negativo). Data civil: `dataCivilValida`, `hojeEmSaoPaulo`, `formatarDataCivil` (`src/lib/datas.ts`, `src/lib/formato.ts`).
- Agregação em inteiros: `resumoDoMes` usa `groupBy` com `_sum` (`src/servicos/resumo.ts`).
- Testes: `tests/ajuda.ts` (`limparBanco` precisa conhecer toda tabela nova); `tests/filhos-papeis.test.ts` varre as funções exportadas de `filhos.ts` (por isso a mesada vai para outro arquivo de serviço).
- Seed (`prisma/demonstracao.ts`): dois filhos com login, `upsert` sem sobrescrever, id fixo, guarda de produção.

## Contrato de saída

Tabela `movimentos_de_mesada` (migration nova) ligada a `filhos` por chave estrangeira `Cascade`; serviço `src/servicos/mesada.ts`; três ações novas no catálogo da trilha; lógica pura de apresentação em `src/lib/mesada.ts`.

## Limites e cotas

Valor de R$ 0,01 a R$ 1.000.000,00 por movimento (PR-26); descrição até 200 caracteres; 30 movimentos por página. NÃO DOCUMENTADO: número máximo de movimentos por filho (o saldo é uma soma no banco, então o extrato longo não pesa na tela).

## Erros conhecidos e tratamento

- O filho A nunca alcança o filho B: as funções do filho não recebem id; as que recebem id são do `admin` e respondem 403 ao filho, igual para id de irmão e inexistente.
- A barreira de `detalhe` recusa chave com `valor` ou `saldo`: o rastro leva `tipo`, `filhoId` e `alvoNome`, nunca o valor.
- Soma em ponto flutuante faria `0,10 + 0,20` divergir de `0,30`; a soma é de inteiros no banco.
- Saldo negativo é permitido e sinalizado (PR-32), nunca bloqueado.
