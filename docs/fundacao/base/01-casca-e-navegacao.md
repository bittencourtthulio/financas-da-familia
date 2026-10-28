# Casca da aplicação e navegação

## Contrato de entrada

- `LayoutDoSistema` (`src/app/(sistema)/layout.tsx:11`) recebe `children` e exige usuário logado via `exigirUsuario()` (`src/app/(sistema)/layout.tsx:16`).
- `Navegacao` (`src/componentes/Navegacao.tsx:10`) recebe `ehAdmin: boolean`; o item Usuários só aparece para admin (`src/componentes/Navegacao.tsx:23`).
- `Painel` (`src/app/(sistema)/page.tsx:8`) exige usuário e exibe `usuario.nome`.

## Contrato de saída

- A casca renderiza `div.aplicacao` com barra de atividade, `aside.barra-lateral`, `main.conteudo` e `footer.barra-de-status` (`src/app/(sistema)/layout.tsx:19-39`).
- O papel aparece na barra de status como "Administrador" ou "Usuário" (`src/app/(sistema)/layout.tsx:32`); o mesmo rótulo se repete em `src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx:27` e `src/app/(sistema)/configuracoes/usuarios/page.tsx:48`.
- Título do painel: "Painel"; subtítulo: "Bem-vindo, {nome}. Esta é a tela inicial do sistema." (`src/app/(sistema)/page.tsx:12-16`). O texto é do template, não do domínio.
- Metadados: título "Finanças da Família", descrição "Gerado pelo buildx." (`src/app/layout.tsx:5-6`).

## Limites e cotas

NÃO DOCUMENTADO (a casca não tem paginação nem cota).

## Erros conhecidos e tratamento

- Sem sessão, `exigirUsuario` redireciona para `/entrar` (`src/lib/sessao-servidor.ts:21-24`).
- Não existe `loading.tsx`, `error.tsx` nem `not-found.tsx` em `src/app/` (ver `00-LACUNAS.md`).
- Não existe componente que aplique a classe `gaveta-aberta`; no celular o menu fica oculto sem como abri-lo (`src/estilos/global.css:176-190`).

## Riscos para a nossa implementação

- A tabela de Usuários (`src/app/(sistema)/configuracoes/usuarios/page.tsx:20-37`) tem cinco colunas e pode estourar a largura em tela de celular.
- O texto do painel é afirmado por `tests/rotas.test.ts:98` ("Esta é a tela inicial do sistema"); mudar o texto exige mudar o teste antes.
- Cor literal em componente: `rgb(255 255 255 / 0.12)` em `src/estilos/global.css:92` contraria a regra de tokens (P-6).

## Fonte

Arquivos citados acima, lidos integralmente — acessado em 2026-10-28.
