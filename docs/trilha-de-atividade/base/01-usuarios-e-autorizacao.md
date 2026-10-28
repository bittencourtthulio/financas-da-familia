# Usuários, papéis e as ações que serão auditadas

## Contrato de entrada

- `criar(autor, entrada)` (`src/servicos/usuarios.ts:53`) exige admin (`exigirAdmin`, `src/servicos/autenticacao.ts:127`), valida com zod e grava o usuário; devolve `UsuarioListado`.
- `editar(autor, id, entrada)` (`src/servicos/usuarios.ts:80`) aceita `nome`, `email`, `papel`, `ativo`; protege o último admin ativo com `conflito`.
- `desativar(autor, id)` (`src/servicos/usuarios.ts:134`) chama `editar(..., { ativo: false })`; nunca apaga.
- `UsuarioAutenticado` traz `id`, `nome`, `email`, `papel` (`src/servicos/autenticacao.ts`).
- As ações de formulário chamam estes serviços com o autor vindo de `exigirUsuarioAdmin()` (`src/app/acoes.ts`).

## Contrato de saída

- Nenhuma das três funções grava qualquer registro de quem agiu; o autor é usado só para autorizar.
- Erros são `ErroDeAplicacao` (403 para não admin, 404 usuário inexistente, 409 último admin ou e-mail repetido, 422 entrada inválida) (`src/lib/erros.ts`).
- `criar` e `editar` não usam transação: uma gravação cada. O registro de atividade precisa nascer na mesma gravação da ação, senão há ação sem rastro (ou rastro sem ação).

## Limites e cotas

NÃO DOCUMENTADO (não há paginação em `listar`; a lista de usuários é pequena por PR-18).

## Erros conhecidos e tratamento

- Mudança de papel acontece em `editar` quando `papel` vem na entrada; a tela de usuários hoje só oferece criar e desativar, mas a ação `editarUsuario` já existe em `src/app/acoes.ts` e o formulário de edição manda `papel` mesmo quando igual ao atual: o registro só deve ocorrer quando o papel de fato muda.
- Reativação (`ativo: true`) é aceita por `editar`, mas nenhuma tela a oferece.
