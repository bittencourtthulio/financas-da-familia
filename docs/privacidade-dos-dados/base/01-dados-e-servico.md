# Dados da família, trilha, sessão e limite de tentativas

## Contrato de entrada

- Tabelas (`prisma/schema.prisma`): `usuarios` (`senhaHash`, `sessoesValidasDesde` são internos), `categorias`, `lancamentos` (`valorCentavos Int`, `data` texto AAAA-MM-DD), `filhos` (`usuarioId` único opcional, `SET NULL`), `movimentos_de_mesada` (`filhoId` com `Cascade`), `atividades` (sem chave estrangeira).
- Trilha (`src/servicos/atividade.ts`, `src/lib/atividade.ts`): `registrarAtividade` com catálogo fechado e barreira de chave (`senha|hash|token|valor|centavo|saldo|e-?mail|cpf`). Os rastros do filho levam `alvoNome` (e `filhoId` na mesada) no `detalhe`; `entidade` `filho` com `entidadeId` do filho.
- Sessão (`src/lib/sessao.ts`, `src/servicos/autenticacao.ts`): JWT em cookie, sem tabela; `usuarioDaSessao` exige usuário existente e ativo. O limite de tentativas (`criarLimitador`) é um `Map` em memória, privado em `autenticacao.ts`, com chave igual ao e-mail normalizado.
- Guardas: `exigirAdmin` (serviço), `exigirUsuarioAdmin` e `usuarioAtual` (`src/app/sessao-servidor.ts`).
- Agregação de inteiros por `groupBy` (`mesada.ts`, `resumo.ts`); `formatarMoeda`, `dataCivilValida`.
- Testes: `tests/ajuda.ts` (`limparBanco`, `criarAdmin`, `criarUsuario`), `tests/mesada-dados.test.ts` (prova do `Cascade`), `tests/mesada-papeis.test.ts` (varredura por papel), `tests/mesada-rotas.test.ts` (servidor real).

## Contrato de saída

`src/servicos/privacidade.ts` com `exportarDadosDaFamilia(autor)` e `excluirFilho(autor, id, entrada)`, ambos só do `admin`; duas ações novas no catálogo (`familia.exportada`, `filho.excluido`); `esquecerTentativasDeLogin(email)` em `autenticacao.ts`; `src/lib/privacidade.ts` com nome do arquivo, texto do marcador "filho removido" e a lista de campos proibidos no arquivo.

## Limites e cotas

NÃO DOCUMENTADO: volume máximo de lançamentos. A exportação lê as tabelas inteiras em memória e serializa uma vez; o teste prova milhares de lançamentos e de movimentos. Sem fatiamento, sem fila.

## Erros conhecidos e tratamento

- O hash de senha, o corte de sessão (`sessoesValidasDesde`) e o contador de tentativas não podem ir para o arquivo: teste varre o texto procurando esses campos e os valores reais.
- O nome do filho vive em `atividades.detalhe` (texto JSON) e pode ter mudado de nome: as linhas se acham por `entidadeId` e por `filhoId` no `detalhe`, não pelo nome.
- A exclusão em duas etapas (filho, depois usuário) precisa de uma transação só: falha no meio desfaz tudo.
- O token emitido antes da exclusão fica inútil porque o usuário deixa de existir.
