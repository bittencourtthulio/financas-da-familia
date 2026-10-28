# Usuários, papéis, auditoria e dinheiro que os filhos reaproveitam

## Contrato de entrada

- `Usuario` (`prisma/schema.prisma`): `papel` é texto com padrão `usuario`, `ativo`, `sessoesValidasDesde`; `email` único. `usuarioDaSessao` (`src/servicos/autenticacao.ts`) recusa conta inexistente, desativada ou com sessão anterior à troca de senha; o papel vem do banco a cada requisição.
- Guardas: `exigirAdmin` (só `admin`), `exigirAdultoOuResponsavel` (lista de permitidos `admin`, `usuario`; qualquer outro papel, inclusive vazio ou desconhecido, recebe 403) e `papelPodeLancar`. `src/app/sessao-servidor.ts` tem as guardas de página (`exigirUsuario`, `exigirUsuarioAdmin`, `exigirUsuarioDeLancamentos`).
- `src/servicos/usuarios.ts`: `criar` e `editar` validam o papel com `z.enum(['admin','usuario'])`; `editar` impede rebaixar ou desativar o último administrador; cria o rastro `usuario.criado`, `usuario.papel_alterado` e `usuario.desativado` na mesma transação.
- `registrarAtividade(entrada, cliente)` (`src/servicos/atividade.ts`): ação do catálogo fechado `src/lib/atividade.ts`; `detalhe` plano, chave que casa `senha|password|hash|token|jwt|segredo|secret|valor|centavo|saldo|e-?mail|cpf` é recusada. Só `admin` lê a trilha.
- Dinheiro: `lerValorEmReais` (`src/lib/dinheiro.ts`) lê o formato brasileiro e devolve centavos inteiros ou `null`; `formatarMoeda` formata. Data civil: `dataCivilValida`, `hojeEmSaoPaulo`, `formatarDataCivil`.
- `src/lib/papeis.ts`: `rotuloDoPapel` e `PAPEIS_DA_INTERFACE` (opções do campo Papel da tela Usuários).
- Testes: `tests/ajuda.ts` (`criarUsuario`, `criarAdmin`, `limparBanco`) precisa conhecer toda tabela nova; `tests/setup.ts` aplica as migrations reais.
- Seed (`prisma/demonstracao.ts`): contas fictícias com senha `demo1234`, categorias e quinze lançamentos, `upsert` sem sobrescrever, guarda contra produção.

## Contrato de saída

Tabela `filhos` (migration nova) ligada a `usuarios` por chave estrangeira única opcional; serviço `src/servicos/filhos.ts`; quatro ações novas no catálogo da trilha; papel `filho` com rótulo "Filho".

## Limites e cotas

Nome do filho até 80 caracteres; valor combinado até R$ 1.000.000,00 (PR-26 reaproveitada). NÃO DOCUMENTADO: número máximo de filhos (não inventado; a lista não pagina porque uma família tem poucos).

## Erros conhecidos e tratamento

- Um login `filho` criado pela tela Usuários ficaria sem registro: a tela não pode criá-lo nem mudar papel para ele (PR-31).
- Um `filho` autenticado já é negado por lista de permitidos nos lançamentos e no resumo; falta provar isso com um filho real, nas páginas e nas ações, e negar cadastro de filhos, atividade e usuários.
- 404 idêntico para filho inexistente e filho de outro irmão: nenhuma mensagem pode diferenciar.
- A barreira de `detalhe` recusa chave com `valor`: o rastro do filho usa `campos` com nomes de campo, nunca valor.
