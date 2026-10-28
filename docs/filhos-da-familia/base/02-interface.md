# Casca, navegação, formulários e estados que as telas de filhos reaproveitam

## Contrato de entrada

- `src/app/(sistema)/layout.tsx` monta a casca e passa `ehAdmin` e `podeLancar` à `Navegacao`; o rótulo do papel na barra de status vem de `rotuloDoPapel`.
- `src/componentes/Navegacao.tsx` (cliente): Painel, Lançamentos e Categorias (se `podeLancar`), Atividade (se `ehAdmin`), Configurações > Usuários (se `ehAdmin`) e Meu perfil.
- `src/app/(sistema)/page.tsx`: o painel mostra o resumo só a quem `papelPodeLancar`; os demais veem título, subtítulo e a frase neutra "Não há resumo da casa para o seu perfil." (a FT-04 mantém isso para o filho).
- `src/app/acoes.ts` ('use server'): `mensagemDe`, `EstadoDoFormulario`, ações de usuário e de lançamento; as de lançamento chamam a guarda FORA do `try` porque o redirecionamento do Next é uma exceção.
- `src/componentes/Formulario.tsx` (`Formulario`, `Campo`), `CampoDeTipo`, `CamposDeLancamento` e `ApagarLancamento` são o modelo de formulário com erro, sucesso e envio.
- Estados: `loading.tsx` e `error.tsx` do grupo `(sistema)`, `not-found.tsx`; a tela de erro nunca lê `message` nem `stack`.
- Estilos: `src/estilos/global.css` e `tokens.css` (Dark+ e Light+); `tests/ajuda-estatica.ts` barra cor literal em componente; o bloco de celular (até 768px) dá 44px a link e botão.
- `tests/rotas.test.ts` sobe o servidor de produção; já tem um usuário de papel cru `filho` e prova a negação nas telas de lançamento. `tests/renderizar.ts` renderiza componente sem navegador.

## Contrato de saída

Rotas `/filhos`, `/filhos/novo`, `/filhos/[id]` (só `admin`) e `/mesada` (só `filho`); item "Filhos" para o responsável e "Minha mesada" para o filho; barra lateral do filho com Painel, Minha mesada e Meu perfil.

## Limites e cotas

NÃO DOCUMENTADO: quantos filhos cabem na lista (sem paginação, uma família tem poucos).

## Erros conhecidos e tratamento

- `Navegacao` esconder o item não é controle: cada página chama a guarda no servidor (L2).
- Erro de formulário vira `aviso erro`; sucesso, `aviso sucesso`; envio, botão desabilitado.
- Citações de linha no `CONVENCOES.md` (`tests/convencoes.test.ts`) deslocam quando `acoes.ts`, `sessao-servidor.ts`, `page.tsx`, `autenticacao.ts`, `atividade.ts` (lib) e `tests/rotas.test.ts` ganham linhas acima delas: a T-03.02 reconfere todas.
