# Papéis, autorização no servidor e a trilha que esta feature estende

## Contrato de entrada

- `exigirAdmin(usuario)` (`src/servicos/autenticacao.ts:127`) é a única guarda de papel do serviço; lança `naoAutorizado` (403). Não existe guarda "admin ou usuario".
- `UsuarioAutenticado` traz `id`, `nome`, `email`, `papel`; o papel vem do banco a cada requisição (`usuarioDaSessao`), não do token.
- `exigirUsuario` e `exigirUsuarioAdmin` (`src/app/sessao-servidor.ts`) são as guardas de página e ação; negado vira `redirect('/')`.
- `registrarAtividade(entrada, cliente?)` (`src/servicos/atividade.ts:83`) aceita o cliente de uma transação; valida a ação contra `ACOES` (`src/lib/atividade.ts:9`) e recusa no `detalhe` chave que case `senha|password|hash|token|jwt|segredo|secret|valor|centavo|saldo|e-?mail|cpf` e texto com cara de hash ou token (`src/servicos/atividade.ts:40`).
- `usuarios.criar` e `usuarios.editar` são o exemplo de ação + rastro na mesma `prisma.$transaction` (`src/servicos/usuarios.ts`).

## Contrato de saída

- Erros são `ErroDeAplicacao` com os construtores de `src/lib/erros.ts` (403, 404, 409, 422); a ação de formulário converte em mensagem (`src/app/acoes.ts`).
- `descreverAtividade` (`src/lib/atividade.ts`) monta as quatro colunas da tela: só sabe descrever `usuario.criado` e `usuario.papel_alterado`; as demais ações saem com o rótulo e sem detalhe.

## Limites e cotas

NÃO DOCUMENTADO para lançamentos (não há esquema). A trilha tem limite de 1000 caracteres no `detalhe` e 200 por texto.

## Erros conhecidos e tratamento

- A barreira do `detalhe` recusa a chave `valor`, `centavos` e `saldo`: a trilha de lançamento só pode levar ids, tipo e nome de categoria (PR-25).
- O papel `filho` não existe ainda (FT-05); hoje o banco só grava `admin` e `usuario`. A guarda nova deve negar por lista de permitidos (`admin`, `usuario`), não por lista de negados, para que o papel futuro nasça sem acesso.
