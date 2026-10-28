Filhos da família (FT-05 do projeto `financas-da-familia`): o responsável cadastra um filho (nome, valor de mesada combinado e periodicidade, só informativos, e nascimento opcional) e, se quiser, cria o login dele com o papel `filho`, que ao entrar vê só a própria página de mesada.

**Base:** `feat/ft-04-saldo-e-resumo-do-mes` (empilhada sobre `feat/ft-03-lancamentos-da-casa`, `feat/ft-02-trilha-de-atividade` e `feat/ft-01-fundacao`; nada foi mergeado em `main`). Este PR mira essa branch; o diff contém só a FT-05. Realiza a PR-06 e cria a PR-30 e a PR-31.

## O que muda para quem usa

- Novo item **Filhos** no menu do responsável: lista de filhos (nome, mesada combinada, situação do login), **Cadastrar filho**, e a página de cada filho para corrigir os dados e **criar** ou **desativar** o login (e-mail e senha provisória de ao menos 8 caracteres).
- O valor da mesada é digitado em formato brasileiro ("50,00") e guardado em centavos inteiros; a periodicidade é semanal ou mensal. Os dois são **só um combinado**: o sistema não credita nem calcula mesada.
- O **filho** entra e vê o painel neutro (sem nenhum valor da casa), **Minha mesada** (nome, valor combinado, periodicidade e "Ainda não há movimentos de mesada"), **Meu perfil** e a troca de senha. A barra lateral dele tem só esses três itens.
- O servidor nega ao filho lançamentos, categorias, resumo, atividade, usuários e filhos, e ele nunca alcança o registro do irmão. O adulto não gerencia filhos (só o responsável).
- A tela Usuários não cria nem muda papel para `filho` (o papel nasce na página do filho).
- A tela Atividade passa a mostrar o cadastro e a alteração de filho e a criação e desativação do login, sem valor, e-mail nem nascimento.
- A seed de demonstração cria dois filhos com login: `ana@exemplo.local` e `pedro@exemplo.local`, senha `demo1234` (fictícias; a seed não roda em produção).

## O que muda no código

- `prisma/schema.prisma` e migration `20261028170000_filhos`: tabela `filhos` (mesada em `Int`, vínculo único com `usuarios`).
- `src/servicos/filhos.ts`: `listarFilhos`, `obterFilho`, `cadastrarFilho`, `editarFilho`, `criarLoginDoFilho`, `desativarLoginDoFilho` (só `admin`) e `minhaMesada` (só `filho`, sem id).
- `src/servicos/autenticacao.ts` (`exigirFilho`), `src/servicos/usuarios.ts` (recusa mudar o papel de um filho), `src/app/sessao-servidor.ts` (`exigirUsuarioFilho`), `src/app/acoes.ts` (quatro ações de filho; a guarda das três ações de usuário saiu de dentro do `try`), `src/lib/atividade.ts` (quatro ações na trilha), `src/lib/papeis.ts` (rótulo Filho).
- Páginas `/filhos`, `/filhos/novo`, `/filhos/[id]`, `/mesada`; componentes `ListaDeFilhos`, `CamposDoFilho`, `LoginDoFilho`, `MesadaDoFilho`; menu e estilos só com `var(--token)`.
- `prisma/demonstracao.ts`, `docs/stack/CONVENCOES.md`, `docs/projeto/PREMISSAS.md` (PR-06 realizada, PR-30, PR-31), `README.md`.

## Onde pedir olho

Ler linha a linha: `src/servicos/filhos.ts`, `src/servicos/usuarios.ts`, `src/servicos/autenticacao.ts`, `src/app/sessao-servidor.ts`, `src/app/acoes.ts`, `src/app/(sistema)/mesada/page.tsx`, `prisma/schema.prisma`, a migration e `prisma/demonstracao.ts`. A lista completa está em [ATENCAO.md](ATENCAO.md).

## Como foi testado

TDD em 7 tasks e 3 sprints, um commit por task (um desvio de ordem na T-02.02, descrito em [ENTREGA.md](ENTREGA.md)). Suíte: 960 testes (264 novos). Um filho real é negado em toda função exportada de lançamentos, resumo, atividade e usuários; as funções de filhos negam adulto, filho, vazio e desconhecido; o filho A recebe o mesmo 403 para o id do irmão e para um id inexistente; as ações de servidor são executadas com sessão simulada de filho, adulto e visitante e não gravam nada; o servidor de produção real prova as páginas do filho, o que ele não alcança, o painel sem valor e o login desativado. Valor em formato brasileiro, nascimento futuro, e-mail repetido, segundo login e rastro sem valor nem e-mail estão cobertos. `npm run verificar` verde (resultado literal em [ENTREGA.md](ENTREGA.md)).

## Decisões em nome da família

PR-30 (forma do cadastro do filho: valor e periodicidade obrigatórios e só informativos) e PR-31 (login do filho ligado 1 para 1, criado só pelo responsável, desativável, sem reativar). Decisões D-01 a D-17 em [00-DECISOES.md](00-DECISOES.md).

## Pendências

- `decisao_humana` (não bloqueante): a família quer filho sem mesada combinada ou outras periodicidades além de semanal e mensal?
- `decisao_humana` (não bloqueante): reativar o login ou redefinir a senha esquecida de um filho pelo responsável?
- `recurso_externo`: sem remoto, o PR não foi aberto e nada foi empurrado; esta descrição está pronta para colar.
