# Finanças da Família

Sistema de controle financeiro da casa de uma família e da mesada dos filhos.
Esta é a fundação (FT-01): o responsável entra com e-mail e senha, chega ao
painel da família, cadastra outro usuário, edita o próprio perfil e troca a
senha, em português, com tema claro e escuro e usável no celular.

Os lançamentos da casa (FT-03): o responsável ou o adulto registra receitas e
despesas com valor, data, categoria e descrição, cria categorias, edita e apaga,
filtrando por mês e tipo; cada alteração entra na trilha de atividade, sem o
valor. O saldo e o resumo do mês chegam na FT-04.

A trilha de atividade (FT-02) mostra ao responsável quem criou ou desativou um
usuário e quem mudou o papel de alguém, com data e hora. Lançamentos, saldo,
filhos e mesada chegam nas features seguintes (ver `docs/projeto/MAPA.md`).

## O que já vem pronto

| Camada | Conteúdo |
|---|---|
| Configuração | `package.json` com versões fixadas, TypeScript estrito, ESLint, Vitest, modelo de variáveis de ambiente |
| Banco | SQLite via Prisma, migrations versionadas (`usuarios`, `atividades`, `categorias`, `lancamentos`), seed de demonstração |
| Autenticação | e-mail e senha, hash bcrypt, sessão JWT em cookie `httpOnly`, renovação deslizante, limite de tentativas de login |
| Papéis | `admin` (responsável) e `usuario` (adulto); o papel `filho` chega na FT-05 |
| Interface | tokens do VS Code (Dark+ e Light+), alternador de tema, menu em gaveta abaixo de 768px, estados carregando, erro e não encontrado |
| Telas | painel `/`, `/lancamentos` (lista, `/novo`, `/<id>`, `/categorias`; responsável e adulto), `/atividade` (só o responsável), `/configuracoes/usuarios`, `/perfil`, `/perfil/senha` |
| Trilha | `registrarAtividade` (`src/servicos/atividade.ts`): quem, o quê e quando, na mesma transação da ação; nunca guarda senha, hash, token nem dado financeiro |
| Formato brasileiro | valor em centavos inteiros (`src/lib/dinheiro.ts` lê "1.234,56", `src/lib/formato.ts` exibe) e data no fuso `America/Sao_Paulo` (`src/lib/datas.ts`) |
| Qualidade | `npm run verificar` e fluxo de exemplo em `.github/workflows/verificar.yml` |

## Como rodar

Defina as duas variáveis de ambiente (veja o modelo de ambiente versionado na
raiz do projeto; o arquivo real fica fora do versionador):

```bash
npm install
export DATABASE_URL="file:./dev.db"
export JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
npm run setup           # generate + db push + seed de demonstração
npm run dev
```

Contas de demonstração — fictícias, criadas pela seed, que **não roda em
produção**:

```
responsavel@exemplo.local   demo1234    responsável (admin)
adulto@exemplo.local        demo1234    adulto (usuario)
```

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

## O que esta fundação não traz, de propósito

**Poucas entidades de negócio.** O modelo tem `Usuario`, `Atividade` (a trilha,
FT-02), `Categoria` e `Lancamento` (FT-03). Filhos e mesada nascem nas features do B4, planejadas pelo
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
