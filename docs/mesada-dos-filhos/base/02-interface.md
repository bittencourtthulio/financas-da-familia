# Página /mesada, páginas do responsável, formulários, ações e estilos

## Contrato de entrada

- `src/app/(sistema)/mesada/page.tsx` e `src/componentes/MesadaDoFilho.tsx`: hoje mostram o combinado e "Ainda não há movimentos de mesada"; a página não lê parâmetro. `tests/filhos-mesada.test.ts` afirma que não há saldo, extrato, `<form` nem `<button` nela: essas afirmações mudam nesta feature.
- `src/app/(sistema)/filhos/[id]/page.tsx`, `src/app/(sistema)/filhos/page.tsx` e `ListaDeFilhos`: o responsável edita o filho e vê a lista com situação do login; sem mesada.
- `src/app/acoes.ts` ('use server'): ações de filho chamam `exigirUsuarioAdmin()` fora do `try`; `tests/filhos-acoes.test.ts` tem a tabela de ações sensíveis e exige que ela cubra toda ação exportada.
- `src/app/formularios.ts`: leitores de formulário que só copiam campos.
- Componentes: `Formulario`, `Campo`, `ApagarLancamento` (dois passos), `TabelaDeLancamentos` (classes `valor-receita`, `valor-despesa`), `PaginacaoDeLancamentos`, `ResumoDoMes` (`data-saldo` positivo e negativo com frase).
- Estilos: `src/estilos/global.css` e `tokens.css`; `tests/ajuda-estatica.ts` barra cor literal; bloco de celular (até 768px) dá 44px a link e botão.
- `loading.tsx`, `error.tsx` e `not-found.tsx` do grupo `(sistema)` dão carregando, erro e não encontrado.

## Contrato de saída

Rotas `/filhos/[id]/mesada` (extrato, saldo e formulário rápido) e `/filhos/[id]/mesada/[movimentoId]` (editar e apagar), só `admin`; `/mesada` do filho com saldo em destaque e extrato paginado por `?pagina=`; saldo na lista de filhos do responsável; três ações de servidor novas.

## Limites e cotas

Celular abaixo de 768px, dois temas, só `var(--token)`. NÃO DOCUMENTADO: tela em navegador real (a prova é por renderização, CSS lido por teste e servidor de produção).

## Erros conhecidos e tratamento

- Citações de linha do `CONVENCOES.md` deslocam quando `acoes.ts`, `schema.prisma`, `ajuda.ts` e `atividade.ts` ganham linhas: a T-03.02 reconfere todas.
- Esconder item de menu não é controle: cada página e ação chama a guarda no servidor.
