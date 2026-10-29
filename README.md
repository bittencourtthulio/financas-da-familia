# Bufi (antes "Finanças da Família")

Bufi vem de bufunfa: a grana da casa, em família. O visual é leve e colorido,
com a família desenhada (pai, mãe, menino, menina e o cachorro); dentro do
sistema os bonequinhos são as pessoas cadastradas, cada uma com o avatar que
escolheu em **Meu perfil** ou que o responsável definiu na área **Família**
(`/familia`). A apresentação pública abre na raiz do site para quem ainda não
entrou; quem tem sessão vê o painel. Guia do visual em
`docs/design/IDENTIDADE-VISUAL.md`.

Sistema de controle financeiro da casa de uma família e da mesada dos filhos.
Esta é a fundação (FT-01): o responsável entra com e-mail e senha, chega ao
painel da família, cadastra outro usuário, edita o próprio perfil e troca a
senha, em português, com tema claro e escuro e usável no celular.

Os lançamentos da casa (FT-03): o responsável ou o adulto registra receitas e
despesas com valor, data, categoria e descrição, cria categorias, edita e apaga,
filtrando por mês e tipo; cada alteração entra na trilha de atividade, sem o
valor.

O saldo e o resumo do mês (FT-04): ao entrar, o responsável ou o adulto vê no painel
inicial o total de receitas, o total de despesas, o saldo e as despesas por
categoria do mês, com seletor de mês (`/?mes=AAAA-MM`; mês inválido vale o mês
corrente). O saldo é só do mês escolhido, sem acumulado (PR-29).

Os filhos da família (FT-05): o responsável cadastra um filho (nome, valor de
mesada combinado e periodicidade semanal ou mensal, ambos só informativos, e
data de nascimento opcional) em **Filhos** e, se quiser, cria o login dele. O
filho entra com o papel `filho` e vê só o painel neutro, a própria página
**Minha mesada** (nome, valor combinado, periodicidade e o aviso de que ainda
não há movimentos), o perfil e a troca de senha; o servidor nega todo o resto e
um filho nunca alcança o registro do irmão.

A mesada dos filhos (FT-06): o responsável registra, edita e apaga créditos de
mesada e gastos de cada filho (valor em formato brasileiro, data e descrição
opcional) em **Filhos > Ver mesada**, e vê o saldo e o extrato de cada um; a
lista de filhos mostra o saldo de todos. O saldo é créditos menos gastos, somado
em centavos inteiros no servidor, e pode ficar negativo: o sistema avisa, não
bloqueia. O filho vê em **Minha mesada** o saldo em destaque, dito em palavras, e
o extrato do mais recente ao mais antigo, 30 por página, só para leitura. O
valor combinado continua só informativo: nada é creditado sozinho. O adulto não
vê a mesada.

A privacidade dos dados (FT-07): em **Privacidade** (`/privacidade`), o
responsável baixa um arquivo JSON versionado (`versao_do_formato`) com os
usuários, categorias, lançamentos, filhos com saldo, movimentos de mesada e a
trilha, em centavos inteiros e datas ISO, sem hash de senha, token, segredo nem
dado de sessão. O download é um POST em `/api/privacidade/exportar`, só do
responsável, e fica registrado na trilha. Ali e na página do filho, o
responsável apaga de verdade a conta de um filho, digitando o nome dele: o
cadastro, os movimentos de mesada e o login saem numa transação, o token antigo
deixa de valer, e na trilha o nome vira "filho removido" (fica o registro de que
a exclusão ocorreu). Não há desfazer: baixe os dados antes.

A trilha de atividade (FT-02) mostra ao responsável quem criou ou desativou um
usuário e quem mudou o papel de alguém, com data e hora, e agora também o
cadastro de filhos e o login deles (sem valor, e-mail nem nascimento). Os
movimentos de mesada (registrar, alterar, apagar), também sem valor, saldo nem
descrição.

## O que já vem pronto

| Camada | Conteúdo |
|---|---|
| Configuração | `package.json` com versões fixadas, TypeScript estrito, ESLint, Vitest, modelo de variáveis de ambiente |
| Banco | PostgreSQL via Prisma (Neon em produção, Postgres local em desenvolvimento e nos testes), migrations versionadas (`usuarios`, `atividades`, `categorias`, `lancamentos`, `recorrencias`, `filhos`, `movimentos_de_mesada`), seed de demonstração |
| Autenticação | e-mail e senha, hash bcrypt, sessão JWT em cookie `httpOnly`, renovação deslizante, limite de tentativas de login |
| Papéis | `admin` (responsável), `usuario` (adulto) e `filho` (só a própria mesada; nasce na página do filho, não na tela Usuários) |
| Interface | tokens do VS Code (Dark+ e Light+), alternador de tema, menu em gaveta abaixo de 768px, estados carregando, erro e não encontrado |
| Telas | painel `/` (resumo do mês, despesas por categoria e quem mais gasta), `/lancamentos` (lista, `/novo`, `/<id>`; com pago ou em aberto e lançamentos recorrentes; responsável e adulto), `/financas` (Nossas Finanças: despesas por categoria e por pessoa, com filtro por pessoa; responsável e adulto), `/familia` (cadastro de todos: `/nova`, `/adultos/<id>`, `/filhos/<id>` e a mesada em `/filhos/<id>/mesada`; só o responsável), `/mesada` (só o filho), `/atividade` (só o responsável), `/privacidade` (só o responsável), `/perfil`, `/perfil/senha` |
| Trilha | `registrarAtividade` (`src/servicos/atividade.ts`): quem, o quê e quando, na mesma transação da ação; nunca guarda senha, hash, token nem dado financeiro |
| Formato brasileiro | valor em centavos inteiros (`src/lib/dinheiro.ts` lê "1.234,56", `src/lib/formato.ts` exibe) e data no fuso `America/Sao_Paulo` (`src/lib/datas.ts`) |
| Qualidade | `npm run verificar` e fluxo de exemplo em `.github/workflows/verificar.yml` |

## Como rodar

Precisa de um Postgres local (por exemplo `brew install postgresql@17`). Crie os
bancos e defina as variáveis de ambiente (veja o modelo de ambiente versionado na
raiz do projeto; o arquivo real fica fora do versionador):

```bash
createdb financas_dev && createdb financas_teste
npm install
export DATABASE_URL="postgresql://$USER@localhost:5432/financas_dev"
export JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
npm run setup           # generate + migrate deploy + seed de demonstração
npm run dev
```

Os testes usam o banco `financas_teste` (ou `DATABASE_URL_TESTE`; o nome precisa ter
"test", porque os testes apagam as tabelas). Antes de `npm test`, rode `npm run build`
se a mudança altera HTML.

Contas de demonstração — fictícias, criadas pela seed, que **não roda em
produção**:

```
responsavel@exemplo.local   demo1234    responsável (admin)
adulto@exemplo.local        demo1234    adulto (usuario)
ana@exemplo.local           demo1234    filha (filho), mesada semanal
pedro@exemplo.local         demo1234    filho (filho), mesada mensal
```

Os dois filhos existem para provar o isolamento: cada um entra e vê só a
própria mesada; o responsável os vê em **Filhos**. A seed também cria movimentos
de mesada fictícios: Ana termina com saldo positivo e Pedro com saldo negativo,
para mostrar os dois estados.

A seed também cria duas entradas fictícias na trilha (entre como responsável e
abra **Atividade**) e, no mês corrente, sete categorias e seis lançamentos
fictícios (abra **Lançamentos**). As categorias são só dado de demonstração.

## Os comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | sobe em desenvolvimento |
| `npm run build` | build de produção |
| `npm test` | a suíte inteira (rode `npm run build` antes se a mudança altera HTML) |
| `npm run lint` | ESLint |
| `npm run typecheck` | checagem de tipos |
| `npm run verificar` | lint, tipos, build, testes e auditoria de dependência |
| `npm run setup` | prepara o banco do zero |
| `npm run db:seed` | só a seed |
| `npm run responsavel:criar` | cria o primeiro responsável de um banco novo (`RESPONSAVEL_NOME`, `RESPONSAVEL_EMAIL`, `RESPONSAVEL_SENHA`); use em produção no lugar da seed |
| `npm run log:limpar` | descarta os arquivos de log com mais de 90 dias |

## Operação: produção, backup, saúde e log

**Produção.** O app roda na Vercel e o banco é um Postgres no Neon. As migrations
rodam pela conexão **direta** (`DATABASE_URL_UNPOOLED`, sem `-pooler`); as requisições
usam a conexão do **pooler** (`DATABASE_URL`). Num banco novo, aplique as migrations
(`npx prisma migrate deploy` com a conexão direta) e crie o primeiro responsável com
`npm run responsavel:criar`. **Não rode a seed de demonstração em produção**: ela cria
contas de senha conhecida.

**Backup.** O sistema não grava arquivo de backup: no Neon, o histórico e a restauração
a um ponto no tempo são do próprio serviço (e `pg_dump` pela conexão direta serve para
uma cópia à mão). O banco leva os hashes de senha e todo o dinheiro da casa, então trate
qualquer cópia com o mesmo cuidado.

### Saúde

`GET /api/saude` é pública (um monitor precisa perguntar sem entrar) e não leva
dado pessoal, versão, caminho nem pilha:

| Resposta | Significa |
|---|---|
| `200 {"status":"ok","banco":"ok"}` | o sistema e o banco respondem |
| `503 {"status":"indisponivel","banco":"falha"}` | o sistema está de pé, mas o banco não responde (ou demorou mais de 3 s) |

### Log

Uma linha JSON por evento, com `nivel`, `instante`, `evento` e `contexto`, na
saída padrão e no arquivo `logs/app-AAAA-MM-DD.log` (dia UTC; pasta em
`LOG_DIR`, vazio desliga o arquivo; na Vercel o arquivo é desligado sozinho). Nunca vão para o log senha, hash, token,
e-mail nem valor em dinheiro: o que parece isso vira `[removido]`.

**Os arquivos de log com mais de 90 dias são descartados** quando o servidor sobe
e quando você roda `npm run log:limpar`. Quem redireciona a saída padrão para
outro lugar cuida da retenção desse lugar.

Um erro inesperado mostra ao usuário a frase "Não foi possível concluir" com um
**código** de 12 caracteres; a linha `erro.inesperado` do log tem o mesmo código
(`ref`), o nome e o código do erro, e nunca a mensagem nem a pilha. Peça o código
a quem viu o erro.

### Configuração que falha no start

O servidor confere `DATABASE_URL`, `JWT_SECRET` e `JWT_TTL_SEGUNDOS` ao subir. Se
algo estiver ausente ou inválido, imprime tudo o que está errado, sem repetir o
valor, e **encerra com código 1**.

### O que ficou de fora, de propósito

Backup agendado por conta própria, criptografia de backup e restauração pela interface:
no Neon, o histórico do banco cobre o essencial; o resto depende de decisão ou de recurso
que o sistema não tem (`docs/backup-e-saude/00-BLOQUEIOS.md`).

## O que esta fundação não traz, de propósito

**Poucas entidades de negócio.** O modelo tem `Usuario`, `Atividade` (a trilha,
FT-02), `Categoria` e `Lancamento` (FT-03), `Filho` (FT-05) e `MovimentoDeMesada`
(FT-06). As features do B4 são planejadas pelo
sprintx sob TDD; cada uma acrescenta a sua ação ao catálogo da trilha em
`src/lib/atividade.ts`.

**O painel vem vazio.** O corpo diz o que vai aparecer ali; o saldo e o resumo
do mês chegam na FT-04.

## As decisões que valem conhecer

**A troca de senha derruba as outras sessões.** O usuário tem
`sessoesValidasDesde`; a troca move esse instante para frente, e todo token
emitido antes deixa de valer. Quem trocou recebe um token novo e continua na
sessão. A renovação deslizante passa pela mesma verificação, então uma sessão
derrubada não ressuscita.

**Cinco senhas erradas bloqueiam o e-mail por 15 minutos.** O contador fica na
memória do processo (uma instalação, uma família). Um terceiro pode travar o
login de um e-mail por esse tempo; é o custo conhecido.

**O sistema nunca fica sem responsável.** Rebaixar ou desativar o último admin
ativo é recusado com 409. Admin desativado não conta como o outro.

**Desativar não apaga.** A exclusão de verdade é a feature de privacidade
(FT-07).

**O controle de acesso é no servidor.** `exigirUsuarioAdmin` roda antes dos
dados; esconder o item do menu é conveniência, não controle. Há teste que prova
isso pedindo a rota com sessão de adulto.

**Convenções e premissas.** O dialeto técnico do projeto, com a evidência de
cada regra, está em `docs/stack/CONVENCOES.md`; toda decisão tomada em nome da
família, com o que a invalidaria, em `docs/projeto/PREMISSAS.md`.
