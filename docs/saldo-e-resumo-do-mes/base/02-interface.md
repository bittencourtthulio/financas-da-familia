# Painel inicial, navegação por mês, estilos e estados

## Contrato de entrada

- `src/app/(sistema)/page.tsx` é o painel: título "Painel da família", subtítulo "Bem-vindo, {nome}. Aqui você acompanha as finanças da casa." e um parágrafo `.vazio`. Usa `exigirUsuario` (todos os papéis chegam). O título e o subtítulo são E-1 do P-9 e ficam.
- `FiltrosDeLancamentos` (`src/componentes/FiltrosDeLancamentos.tsx`) é o seletor de mês por link, sem JavaScript, acoplado a `enderecoDaLista` (`/lancamentos?...`).
- Classes existentes em `src/estilos/global.css`: `.titulo-da-tela`, `.subtitulo-da-tela`, `.vazio`, `.tabela-rolavel`, `.valor`, `.valor-despesa`, `.valor-receita`, `.seletor-de-mes`, `.botao`, `.aviso`. O bloco de celular (≤768px) dá `min-height: 44px` a link de navegação e botão.
- O grupo `(sistema)` herda `loading.tsx` (`EstadoDeCarregando`) e `error.tsx` (`EstadoDeErro`); a tela de erro nunca lê `message` nem `stack`.
- Tokens em `src/estilos/tokens.css` (Dark+ e Light+); `tests/ajuda-estatica.ts` (`coresLiterais`) barra cor por extenso em componente.
- Design system: `references/08-design-system.md` do buildx. Tokens do VS Code, dois temas, nenhum tema novo, nenhuma cor literal.

## Contrato de saída

O painel passa a mostrar quatro blocos (receitas, despesas, saldo, despesas por categoria) com o seletor de mês, para quem lança. Quem tem outro papel recebe só título, subtítulo e a frase neutra.

## Limites e cotas

NÃO DOCUMENTADO: número máximo de categorias no resumo. Em uma família, dezenas no máximo; a lista não pagina.

## Erros conhecidos e tratamento

- A página não pode dar erro com `?mes=` inválido: cai no mês corrente (D-12 da FT-03; padrão repetido aqui).
- O teste `tests/rotas.test.ts` afirma o texto do painel vazio ("Ainda não há movimentações para mostrar") para o adulto; o painel com resumo muda essa afirmação.
- `tests/rotas.test.ts` serve o build: rodar `npm run build` antes quando a tela muda.
