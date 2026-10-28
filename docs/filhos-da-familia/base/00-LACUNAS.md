# Lacunas da base — filhos-da-familia

Uma linha por lacuna: o que se procurou, onde, e o que isso implica para a F2.

- Entidade de filho ou vínculo usuário-filho — procurado em `prisma/schema.prisma`, `src/servicos`: NÃO ENCONTRADO (só `Usuario`, `Atividade`, `Categoria`, `Lancamento`). Implica: F3 prevê migration e modelo novos, com chave única para o vínculo 1 para 1.
- Papel `filho` no domínio — procurado em `src/lib/papeis.ts`, `src/servicos/usuarios.ts`: NÃO ENCONTRADO como papel válido nem como rótulo (o comentário diz "entra na FT-05"); só aparece como papel cru em testes (`tests/rotas.test.ts`, `tests/lancamentos-papeis.test.ts`). Implica: rótulo "Filho", guardas e regra de que a tela Usuários não cria nem muda para `filho` (PR-31).
- Regra de idade, limite de filhos, periodicidade além de semanal e mensal, mesada opcional, reativação de login e redefinição de senha de filho — procurado em `docs/projeto/PROJETO.md`, `PREMISSAS.md`, `docs/produto/`: NÃO DOCUMENTADO. Implica: não inventar; PR-30 e PR-31 com pendência `decisao_humana` não bloqueante e opção mais simples e reversível.
- Página própria do papel, item de menu por papel e estado vazio de mesada — procurado em `src/app`, `src/componentes`: NÃO ENCONTRADO (a navegação só conhece `ehAdmin` e `podeLancar`). Implica: F3 prevê rotas `/filhos`, `/filhos/novo`, `/filhos/[id]`, `/mesada`, componente novo e ajuste da navegação.
- Guarda de servidor que rode uma ação como `filho` — procurado em `tests/`: NÃO ENCONTRADO (nenhum `vi.mock` no projeto; as ações dependem de `cookies()`). Implica: F3 prevê um teste que simula `next/headers` para provar as ações com um filho autenticado.
- Dado de demonstração de filhos — procurado em `prisma/demonstracao.ts`: NÃO ENCONTRADO. Implica: F3 prevê estender a seed (PR-04).
