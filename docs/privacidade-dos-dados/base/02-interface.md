# Rota de download, página Privacidade, páginas do filho e menu

## Contrato de entrada

- `src/app/api/sessao/renovar/route.ts`: único exemplo de rota de API (POST, 401 sem sessão, `Cache-Control: no-store`).
- `src/app/(sistema)/atividade/page.tsx` e `src/app/(sistema)/filhos/[id]/page.tsx`: páginas do responsável com `exigirUsuarioAdmin`.
- `src/app/acoes.ts` ('use server'): ações com `exigirUsuarioAdmin()` fora do `try`; `tests/filhos-acoes.test.ts` tem a tabela de ações sensíveis e exige que ela cubra toda ação exportada.
- Componentes: `ApagarMovimento` (dois passos, `zona-de-perigo`), `Formulario`, `Campo`, `EstadoDeErro`; `Navegacao` com itens por papel.
- Estilos: `src/estilos/global.css` e `tokens.css`; cor literal é barrada por teste; bloco de celular dá 44px a link e botão.
- `loading.tsx`, `error.tsx` e `not-found.tsx` do grupo `(sistema)`.

## Contrato de saída

Rota `POST /api/privacidade/exportar` (só `admin`; 401 sem sessão, 403 para outro papel, 405 para GET); página `/privacidade` (só `admin`) com explicação, botão de baixar e a lista de filhos com o apagar; componente `ApagarFilho` também na página do filho; item **Privacidade** no menu do responsável; ação `excluirContaDoFilho`.

## Limites e cotas

Celular abaixo de 768px, dois temas, só `var(--token)`. NÃO DOCUMENTADO: tela em navegador real (a prova é por renderização, CSS lido por teste e servidor de produção).

## Erros conhecidos e tratamento

- Uma rota GET que grava na trilha seria disparável por link de outro site (cookie `sameSite: lax` segue em navegação de topo): a rota é só POST.
- Citações de linha do `CONVENCOES.md` deslocam quando `acoes.ts`, `autenticacao.ts`, `atividade.ts` e `tests/filhos-acoes.test.ts` ganham linhas: a T-03.02 reconfere todas.
- Esconder item de menu não é controle: página, rota e ação chamam a guarda no servidor.
