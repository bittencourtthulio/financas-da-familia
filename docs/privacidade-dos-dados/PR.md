Privacidade dos dados da família (FT-07 do projeto `financas-da-familia`): o responsável baixa um arquivo com todos os dados da família e apaga de verdade a conta de um filho com o histórico dele.

**Base:** `feat/ft-06-mesada-dos-filhos` (empilhada sobre `feat/ft-05-filhos-da-familia`, `feat/ft-04-saldo-e-resumo-do-mes`, `feat/ft-03-lancamentos-da-casa`, `feat/ft-02-trilha-de-atividade` e `feat/ft-01-fundacao`; nada foi mergeado em `main`). Este PR mira essa branch; o diff contém só a FT-07. Realiza a PR-09 e cria a PR-34 e a PR-35.

## O que muda para quem usa

- O menu do responsável ganha **Privacidade**. Ali, **Baixar os dados da família** entrega um arquivo `dados-da-familia-AAAA-MM-DD.json` com usuários, categorias, lançamentos, filhos (com saldo), movimentos de mesada e a atividade. Valores em centavos inteiros, datas AAAA-MM-DD. O arquivo nunca leva senha, hash, token nem dado de sessão. Cada download aparece em Atividade ("Exportou os dados da família"), sem conteúdo.
- **Apagar a conta de um filho** (na página Privacidade e na página do filho): primeiro passo mostra o aviso, segundo exige digitar o nome do filho. Apaga o cadastro, os movimentos de mesada e o login; o filho deixa de entrar e o acesso aberto dele deixa de valer. Não dá para desfazer; a tela manda baixar os dados antes.
- Na Atividade, as linhas antigas que citavam o filho passam a dizer "filho removido" (o fato fica, o nome some) e entra "Excluiu a conta de um filho", sem nome, e-mail nem valor.
- Só o responsável usa as duas coisas; o adulto e o filho (nem o próprio) são negados no servidor.

## O que muda no código

- `src/servicos/privacidade.ts`: `exportarDadosDaFamilia` e `excluirFilho` (só `admin`). A exclusão é uma transação: anonimiza a trilha por id, apaga o filho (os movimentos saem pelo `Cascade` da PR-33) e o usuário de login, e registra `filho.excluido`. `esquecerTentativasDeLogin` em `src/servicos/autenticacao.ts`.
- `src/app/api/privacidade/exportar/route.ts`: só POST (a rota grava na trilha); 401 sem sessão, 403 para outro papel, anexo com `Cache-Control: no-store`.
- `src/app/acoes.ts`: `excluirContaDoFilho` com a guarda do responsável fora do `try`.
- `src/lib/privacidade.ts`, `src/lib/atividade.ts` (duas ações no catálogo).
- Página `/privacidade`; componentes `PainelDePrivacidade`, `BaixarDados`, `ApagarFilho`; item de menu; estilos só com `var(--token)`.
- Nenhuma migration, nenhuma dependência, nenhuma variável de ambiente nova. `README.md`, `docs/stack/CONVENCOES.md` e `docs/projeto/PREMISSAS.md` (PR-09 realizada, PR-34, PR-35).

## Onde pedir olho

Ler linha a linha: `src/servicos/privacidade.ts`, `src/app/api/privacidade/exportar/route.ts`, `src/app/acoes.ts`, `src/servicos/autenticacao.ts` e `src/app/(sistema)/privacidade/page.tsx`. A lista completa está em [ATENCAO.md](ATENCAO.md).

## Como foi testado

TDD em 7 tasks e 3 sprints, um commit por task. Suíte: 1324 testes (131 novos). O arquivo exportado é varrido atrás de campos proibidos e dos valores reais do hash e do segredo. Depois da exclusão, o SQLite inteiro (toda tabela) é lido e não tem o nome, o e-mail, o nascimento nem o que o filho escreveu; antes, a mesma varredura os acha. Falha no meio da exclusão desfaz tudo. O token emitido antes da exclusão não abre página alguma no servidor de produção real. Usuário, filho (inclusive o próprio titular), vazio e desconhecido são negados em toda função, na ação e na rota. `npm run verificar` verde (resultado literal em [ENTREGA.md](ENTREGA.md)).

## Decisões em nome da família

PR-34 (formato versionado, centavos inteiros, trilha incluída, só POST, sem CSV/PDF/importação) e PR-35 (nome digitado, transação única, trilha anonimizada e não apagada, definitivo, sem consentimento registrado). Decisões D-01 a D-19 em [00-DECISOES.md](00-DECISOES.md).

## Pendências

- `decisao_humana` (não bloqueante): exclusão da família inteira ou de adulto, prazo legal de resposta, termo de consentimento, anonimizar em vez de excluir?
- `decisao_humana` (não bloqueante): CSV ou PDF, texto formatado, importação, exportação parcial?
- `decisao_humana` (não bloqueante): lixeira ou desfazer ao apagar a conta do filho?
- `trabalho_novo`: renomear o filho não renomeia o usuário de login dele (FT-05).
- `recurso_externo`: sem remoto, o PR não foi aberto e nada foi empurrado; esta descrição está pronta para colar.
