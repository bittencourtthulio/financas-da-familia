Trilha de atividade (FT-02 do projeto `financas-da-familia`): o responsável abre a tela **Atividade** e vê quem criou ou desativou um usuário e quem mudou o papel de alguém, com data e hora. O serviço `registrarAtividade` fica pronto, com entidade e migration, para a FT-03 (lançamentos) e a FT-06 (mesada) chamarem.

**Base:** `feat/ft-01-fundacao` (a FT-01 ainda não foi mergeada em `main`). Este PR mira essa branch; o diff contém só a FT-02. Realiza a PR-10 e cria a PR-25.

## O que muda para quem usa

- Item **Atividade** no menu, só para o responsável (`admin`); o adulto não vê o item e, se abrir o endereço, é mandado ao painel sem receber dado algum.
- Tabela com **Quando**, **Quem**, **Ação** e **Detalhe**, em português, no horário de São Paulo, do mais recente para o mais antigo, 50 por página. Estado vazio com texto próprio; carregando e erro herdados das outras telas.
- Criar usuário, mudar o papel de alguém e desativar usuário passam a deixar rastro. Reativar e editar nome ou e-mail não (nenhuma tela reativa; PR-10 limita o escopo).
- A seed de demonstração ganha duas entradas fictícias, então a tela já nasce com o que mostrar.

## O que muda no código

- `prisma/schema.prisma` + migration `20261028143052_atividade`: tabela `atividades` (quem, o quê, quando, detalhe), **sem chave estrangeira** para usuários, de propósito (a exclusão de conta da FT-07 não pode ser barrada nem apagar o rastro por cascata).
- `src/servicos/atividade.ts`: `registrarAtividade(entrada, cliente?)` e `listarAtividade`. Recusa ação fora do catálogo e detalhe com chave que lembre senha, hash, token, segredo, valor, saldo, e-mail ou CPF, texto com cara de hash ou token, detalhe aninhado ou grande. Não oferece editar nem apagar (PR-11).
- `src/servicos/usuarios.ts`: `criar` e `editar` agora são transações que gravam a ação e o registro juntos; se o registro falha, a ação é desfeita. Só a mudança real de papel registra (o formulário reenvia o papel atual).
- `src/lib/atividade.ts`: catálogo de ações com rótulo em português e o texto das colunas.
- Tela `src/app/(sistema)/atividade/page.tsx`, componentes `TabelaDeAtividade` e `PaginacaoDeAtividade`, item em `Navegacao`.
- `docs/stack/CONVENCOES.md` ganha a seção "Auditoria"; `docs/projeto/PREMISSAS.md` ganha a PR-25 e a PR-10 vira realizada.

## Onde pedir olho

Ler linha a linha: `src/servicos/atividade.ts` (a barreira do detalhe), `src/servicos/usuarios.ts` (transações e quando registrar), `src/app/(sistema)/atividade/page.tsx` (autorização), `prisma/schema.prisma` e a migration, `prisma/demonstracao.ts`. A lista completa está em [ATENCAO.md](ATENCAO.md).

## Como foi testado

TDD estrito, 8 tasks em 3 sprints, um commit por task. Suíte: 250 testes (77 novos). A tela é provada no servidor de produção real (`tests/rotas.test.ts`): o responsável vê as linhas, o adulto é barrado sem vazamento, sem sessão vai ao login. `npm run verificar` verde (ver resultado literal em [ENTREGA.md](ENTREGA.md) e no relatório final).

## Decisões em nome da família

PR-25 (`f2_autonoma`): forma do registro e o que ele nunca guarda. O que a invalidaria: querer auditar reativação ou edição de perfil, ou ver o histórico dos adultos sobre a própria conta. Decisões D-01 a D-15 em [00-DECISOES.md](00-DECISOES.md).

## Pendências

- `recurso_externo`: sem remoto, o PR não foi aberto e nada foi empurrado; esta descrição está pronta para colar.
- Para a FT-07: o `detalhe` guarda o nome do usuário afetado; ao apagar a conta de um filho, decidir se as linhas que o citam são apagadas ou anonimizadas.
