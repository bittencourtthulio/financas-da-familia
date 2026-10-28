---
expx_schema: 1
expx_tool: buildx
kind: premissas
projeto_id: financas-da-familia
atualizado_em: 2026-10-28
total: 24
por_origem:
  catalogo_lacunas: 13
  briefing: 0
  decisao_de_stack: 2
  f2_autonoma: 4
  recursao: 0
  template: 5
---

# Finanças da Família — Premissas

Toda decisão tomada em nome do humano, com o que a invalidaria.

**Como revisar este arquivo em cinco minutos:** leia apenas o campo
**o que invalida** de cada premissa. Se aquilo é verdade no seu caso,
a premissa precisa da sua atenção. Se não é, siga em frente.

---

### PR-01 — Modo e leitura do pedido

**Assunto:** modo de condução e interpretação de "mesa"
**Decisão:** modo autônomo total; "controle de mesa dos filhos" lido como controle de mesada.
**Por quê:** o usuário não escolheu o modo; "mesa" ao lado de "dos filhos" só faz sentido como mesada.
**O que invalida:** se "mesa" não for mesada (por exemplo, controle de mesa de jantar ou de refeições dos filhos).
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** null

---

### PR-02 — Dinheiro em centavos

**Assunto:** representação de valor monetário
**Decisão:** todo valor guardado e calculado em centavos inteiros, moeda única BRL; nunca ponto flutuante.
**Por quê:** sistema de saldo e extrato: erro de arredondamento faz o saldo do filho divergir do que a família conferiu à mão.
**O que invalida:** se a família lançar em mais de uma moeda.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** null

---

### PR-03 — Esqueleto de aplicação (P-9)

**Assunto:** P-9, L32 a L34
**Decisão:** painel inicial, cadastro de usuários, perfil e troca de senha vêm do template e ficam na barra lateral.
**Por quê:** a família precisa cadastrar o segundo responsável e os filhos sem abrir o banco.
**O que invalida:** se a gestão de usuários for delegada a um provedor externo.
**Origem:** template
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-01

---

### PR-04 — Usuário de demonstração

**Assunto:** P-5, L25
**Decisão:** seed de demonstração com um responsável, um adulto, dois filhos fictícios, lançamentos e mesada de exemplo; nunca roda em produção.
**Por quê:** a entrega precisa ser verificável em trinta segundos, e o QA usa a seed como ambiente.
**O que invalida:** nada (padrão sem exceção).
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** null

---

### PR-05 — Autenticação própria

**Assunto:** P-4, L1
**Decisão:** e-mail e senha, sessão por JWT em cookie `httpOnly`, expiração curta com refresh.
**Por quê:** não depende de provedor nem de credencial que o buildx não tem.
**O que invalida:** se a família quiser login com Google ou outro provedor.
**Origem:** template
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-01

---

### PR-06 — Papéis, incluindo o filho

**Assunto:** L2
**Decisão:** papéis `admin` (responsável), `usuario` (adulto) e `filho`; o filho só lê o próprio extrato e saldo de mesada; checagem sempre no servidor.
**Por quê:** o sistema guarda dinheiro de crianças e dado de mais de um irmão; sem papel, uma conta alcançaria o dado de outra.
**O que invalida:** se os filhos não forem ter login (só os pais usam o sistema).
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** null

---

### PR-07 — Design system do VS Code

**Assunto:** P-6, L26, L27
**Decisão:** tokens do VS Code Dark+ e Light+, preferência do sistema respeitada.
**Por quê:** padrão da casa; o usuário não indicou outro.
**O que invalida:** se a família preferir aparência de aplicativo de consumo ou indicar outro design system.
**Origem:** template
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-01

---

### PR-08 — Skill de frontend design

**Assunto:** P-7
**Decisão:** o acabamento das telas de negócio usa a skill `frontend-design`, disponível na sessão, dentro dos tokens do PR-07.
**Por quê:** a competência de design mora na skill.
**O que invalida:** se o usuário pedir para não usar skill de design.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** null

---

### PR-09 — Dado de menor e LGPD

**Assunto:** L10, L11
**Decisão:** campos pessoais do filho limitados a nome, data de nascimento opcional e e-mail de login opcional; base legal: consentimento de um responsável (LGPD art. 14); exclusão de conta apaga de fato; responsável exporta os dados da família.
**Por quê:** o sistema guarda nome e movimentação financeira de crianças.
**O que invalida:** se algum usuário da família não for residente no Brasil, ou se o sistema passar a guardar documento do filho (CPF, RG).
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** null

---

### PR-10 — Trilha de auditoria proporcional

**Assunto:** L12
**Decisão:** registrar quem criou, alterou ou apagou lançamento e movimento de mesada, e quem alterou papel de usuário; nada além disso.
**Por quê:** vários adultos editam o mesmo dinheiro e o saldo de uma criança pode ser questionado.
**O que invalida:** se só uma pessoa fizer lançamentos.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** null

---

### PR-11 — Retenção

**Assunto:** L13
**Decisão:** lançamentos e mesadas guardados enquanto a conta da família existir; log de aplicação por 90 dias; sem dado pessoal em log.
**Por quê:** o valor do produto é o histórico, e log não precisa ser eterno.
**O que invalida:** se a família pedir apagar lançamentos antigos automaticamente.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** null

---

### PR-12 — Segurança de base

**Assunto:** L3, L4, L5, L6, L7, L8, L9
**Decisão:** hash forte de senha com mínimo de tamanho, entrada validada por esquema no servidor, consulta parametrizada, segredo em variável de ambiente com `.env.example`, cookie `secure` e `sameSite`, limite de tentativas nas rotas de login, versões fixadas e auditoria de dependências.
**Por quê:** sistema com login e dado financeiro.
**O que invalida:** se o sistema for exposto sem HTTPS.
**Origem:** template
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-01

---

### PR-13 — Backup e migrations

**Assunto:** L14, L15
**Decisão:** comando de backup do arquivo SQLite, comando de restauração e teste automatizado que restaura um backup; migrations versionadas.
**Por quê:** o histórico financeiro da família é o produto e SQLite é um arquivo só.
**O que invalida:** se o banco for trocado por serviço gerenciado com backup próprio.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** null

---

### PR-14 — Operação mínima

**Assunto:** L16 a L21
**Decisão:** log estruturado sem segredo, erro sem rastro de pilha ao usuário e com identificador de correlação, rota `/api/saude`, variável obrigatória ausente falha no start, `npm run dev` sobe tudo.
**Por quê:** porte doméstico: erro visível e log consultável bastam.
**O que invalida:** se o sistema for hospedado em plataforma sem disco persistente (SQLite não persistiria).
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** null

---

### PR-15 — Qualidade

**Assunto:** L22 a L24
**Decisão:** TDD do sprintx, lint, checagem de tipos e pipeline de verificação a cada mudança.
**Por quê:** não negociável, nem no modo autônomo.
**O que invalida:** nada.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** null

---

### PR-16 — Idioma, fuso e uso no celular

**Assunto:** L28 a L31
**Decisão:** interface em pt-BR, datas e valores no formato brasileiro, fuso `America/Sao_Paulo`; abaixo de 768px a barra lateral vira gaveta; estados vazio, carregando e erro em toda tela que busca dado.
**Por quê:** lançar um gasto costuma acontecer na rua, pelo celular.
**O que invalida:** se houver usuário fora do Brasil.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** null

---

### PR-17 — Template como esqueleto

**Assunto:** P-10, P-1, P-2, P-3
**Decisão:** esqueleto copiado do template: Next.js + TypeScript, três camadas, SQLite com migrations.
**Por quê:** determinismo e custo, e o template já passou na suíte e no CI.
**O que invalida:** se o usuário pedir outra stack ou banco.
**Origem:** template
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-01

---

### PR-18 — Uma família por instalação

**Assunto:** isolamento de dados
**Decisão:** sem multi-tenant: todos os dados de uma instalação pertencem a uma família.
**Por quê:** o pedido diz "uma família".
**O que invalida:** se a mesma instalação servir a mais de uma família.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** null

---

### PR-19 — Suíte Expx instalada no projeto

**Assunto:** P-8
**Decisão:** `expx add stackx mergex prodx buildx` completou a seleção (sprintx, runx, memox, designx já estavam); lock versionado em `.expx/expx-lock.json`; só o harness do Claude Code, sem OpenCode.
**Por quê:** o B4 invoca sprintx e mergex; o lock existente só listava o harness `claude`.
**O que invalida:** se a família ou o time usar OpenCode (aí roda `npx expxdev init` para o segundo harness).
**Origem:** decisao_de_stack
**Etapa:** b2
**Provisória:** false
**Realizada em:** null

---

### PR-20 — Dependências do template atualizadas na criação

**Assunto:** L9
**Decisão:** Next.js 16.4.3, Prisma 7.10.1 e Zod 4.6.7 subidos no projeto, mais overrides de `vite`, `source-map-js`, `fast-uri` e `brace-expansion`, para zerar `npm audit --audit-level=high` (o lock do template trazia um achado crítico no Next.js). Resta um aviso `moderate` do vitest, só de ferramenta de teste.
**Por quê:** auditoria de dependência é portão (P-10); o template estava desatualizado.
**O que invalida:** se uma versão nova do template da skill já vier limpa (aí recopiar).
**Origem:** decisao_de_stack
**Etapa:** b2
**Provisória:** false
**Realizada em:** null

---

### PR-21 — Renovação deslizante da sessão

**Assunto:** FT-01, refresh da PR-05
**Decisão:** enquanto a aba do sistema está aberta, a sessão é renovada na metade do tempo de vida do token (padrão 15 min, renovação a cada 7,5 min). A renovação passa sempre pela mesma verificação de uma sessão normal (conta ativa e corte de troca de senha), de modo que sessão derrubada por troca de senha ou conta desativada não ressuscita. Sem a aba aberta, a sessão expira no TTL.
**Por quê:** a PR-05 promete "expiração curta com refresh"; sem renovação, quem está preenchendo um lançamento é jogado para o login a cada 15 minutos.
**O que invalida:** se a família preferir sessão longa fixa (por exemplo 30 dias) ou exigir login a cada visita.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** null

---

### PR-22 — Limite de tentativas de login

**Assunto:** FT-01, limite da PR-12
**Decisão:** cinco falhas de login seguidas para o mesmo e-mail dentro de 15 minutos bloqueiam novas tentativas desse e-mail por 15 minutos (erro 429 com mensagem em português); login correto zera o contador. O contador fica em memória do processo.
**Por quê:** a PR-12 exige limite de tentativas, sem números; o contador em memória atende uma instalação de uma família (PR-18) e não exige serviço externo. O custo conhecido é que um terceiro pode travar o login de um e-mail por 15 minutos.
**O que invalida:** se a instalação rodar em mais de um processo ou for exposta à internet aberta (aí o limite precisa ser compartilhado e por origem).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** null

---

### PR-23 — Pipeline de verificação independente de plataforma

**Assunto:** FT-01, pipeline da PR-15
**Decisão:** a verificação completa é um comando do projeto (`npm run verificar`: lint, checagem de tipos, testes e auditoria de dependência), mais um fluxo de exemplo para GitHub Actions que apenas chama esse comando. Não há remoto configurado, então o fluxo não foi exercitado em serviço.
**Por quê:** a PR-15 exige pipeline a cada mudança; o comando é o que importa e funciona em qualquer plataforma, o fluxo é só o gatilho.
**O que invalida:** se o repositório for hospedado fora do GitHub (troca-se só o gatilho).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** null

---

### PR-24 — Processo de construção: branch por feature, sem worktree

**Assunto:** FT-01, regra 21 do sprintx
**Decisão:** cada feature do B4 é construída na branch `feat/ft-NN-<slug>` na árvore de trabalho principal, uma feature por vez, sem `git worktree`; os artefatos do sprintx e da mergex ficam em `docs/<slug>/`, não em `docs/sprintx/features/<slug>/`.
**Por quê:** o laço do B4 é sequencial (nenhuma feature é paralelizável no MAPA), então não há sessão concorrente para isolar; o orquestrador do buildx definiu esse layout.
**O que invalida:** se duas features passarem a ser construídas ao mesmo tempo.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** null
