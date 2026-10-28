# Casca, navegação, estados e estilos

## Contrato de entrada

- `LayoutDoSistema` (`src/app/(sistema)/layout.tsx`) renderiza `Navegacao ehAdmin` (`src/componentes/Navegacao.tsx`); o item Usuários só existe para admin, mas o controle real é `exigirUsuarioAdmin` na página (`src/app/sessao-servidor.ts:31`).
- `loading.tsx` e `error.tsx` do grupo `(sistema)` valem para toda rota nova dentro dele, sem arquivo extra.
- Estilos prontos: `table`, `.tabela-rolavel`, `.vazio`, `.titulo-da-tela`, `.subtitulo-da-tela` (`src/estilos/global.css`); só tokens de `src/estilos/tokens.css`, com guarda em `tests/tema.test.ts`.
- `formatarDataEHora` mostra data e hora no fuso de São Paulo (`src/lib/formato.ts`).

## Contrato de saída

- A negação ao adulto em página só do responsável é meta refresh (200) sem dado no corpo (D-17 da FT-01); sem sessão, 307 para `/entrar` (`tests/rotas.test.ts`).

## Limites e cotas

NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

- Estado vazio das tabelas: parágrafo `.vazio`. Não há componente de paginação (ver `00-LACUNAS.md`).
