# Casca, navegação, formulários, estados e estilos

## Contrato de entrada

- `Navegacao` (`src/componentes/Navegacao.tsx`) recebe só `ehAdmin`; as features acrescentam itens e não recriam a área de Configurações. Itens atuais: Painel, Atividade (admin), Configurações > Usuários (admin), Meu perfil.
- `Formulario` (`src/componentes/Formulario.tsx`) já resolve envio, erro e sucesso (`useActionState`); `Campo` só faz `<input>` de texto. Não há `select` reutilizável, input de data, grupo de opção nem área de texto.
- Telas dentro do grupo `(sistema)` herdam `loading.tsx` e `error.tsx`; `not-found.tsx` na raiz.
- `src/estilos/global.css` tem `.titulo-da-tela`, `.campo`, `button.primario|secundario`, tabela, `.tabela-rolavel`, `.vazio`, `.aviso`; o bloco de celular (≤768px) dá `min-height: 44px` a `input`, botão e link de navegação.

## Contrato de saída

- Tokens em `src/estilos/tokens.css` (Dark+ e Light+); `tests/ajuda-estatica.ts` (`coresLiterais`) barra cor por extenso em componente.
- O harness `tests/renderizar.ts` renderiza componente para HTML sem navegador; a prova da tela no servidor real mora em `tests/rotas.test.ts`.

## Limites e cotas

NÃO DOCUMENTADO: seletor de mês e filtro de listagem (não existe tela filtrável).

## Erros conhecidos e tratamento

- `input[type='date']` e `input[type='number']` não estão no seletor de estilo de `input`; o seletor lista só `text`, `email`, `password` e `select`. Sem ajuste, o campo de data nasce com a aparência do navegador e, no tema escuro, com o seletor de data claro.
- O erro de ação não vaza pilha (CONVENCOES, seção 6); a tela de erro nunca lê `message`.
