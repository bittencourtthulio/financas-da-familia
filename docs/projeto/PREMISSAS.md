---
expx_schema: 1
expx_tool: buildx
kind: premissas
projeto_id: financas-da-familia
atualizado_em: 2026-10-28
total: 38
por_origem:
  catalogo_lacunas: 13
  briefing: 0
  decisao_de_stack: 2
  f2_autonoma: 18
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
**Realizada em:** FT-06

---

### PR-02 — Dinheiro em centavos

**Assunto:** representação de valor monetário
**Decisão:** todo valor guardado e calculado em centavos inteiros, moeda única BRL; nunca ponto flutuante.
**Por quê:** sistema de saldo e extrato: erro de arredondamento faz o saldo do filho divergir do que a família conferiu à mão.
**O que invalida:** se a família lançar em mais de uma moeda.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-03

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
**Realizada em:** FT-01

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
**Realizada em:** FT-05

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
**Realizada em:** FT-04

---

### PR-09 — Dado de menor e LGPD

**Assunto:** L10, L11
**Decisão:** campos pessoais do filho limitados a nome, data de nascimento opcional e e-mail de login opcional; base legal: consentimento de um responsável (LGPD art. 14); exclusão de conta apaga de fato; responsável exporta os dados da família.
**Por quê:** o sistema guarda nome e movimentação financeira de crianças.
**O que invalida:** se algum usuário da família não for residente no Brasil, ou se o sistema passar a guardar documento do filho (CPF, RG).
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-07

---

### PR-10 — Trilha de auditoria proporcional

**Assunto:** L12
**Decisão:** registrar quem criou, alterou ou apagou lançamento e movimento de mesada, e quem alterou papel de usuário; nada além disso.
**Por quê:** vários adultos editam o mesmo dinheiro e o saldo de uma criança pode ser questionado.
**O que invalida:** se só uma pessoa fizer lançamentos.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-02

---

### PR-11 — Retenção

**Assunto:** L13
**Decisão:** lançamentos e mesadas guardados enquanto a conta da família existir; log de aplicação por 90 dias; sem dado pessoal em log.
**Por quê:** o valor do produto é o histórico, e log não precisa ser eterno.
**O que invalida:** se a família pedir apagar lançamentos antigos automaticamente.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-08

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
**Realizada em:** FT-08

---

### PR-14 — Operação mínima

**Assunto:** L16 a L21
**Decisão:** log estruturado sem segredo, erro sem rastro de pilha ao usuário e com identificador de correlação, rota `/api/saude`, variável obrigatória ausente falha no start, `npm run dev` sobe tudo.
**Por quê:** porte doméstico: erro visível e log consultável bastam.
**O que invalida:** se o sistema for hospedado em plataforma sem disco persistente (SQLite não persistiria).
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-08

---

### PR-15 — Qualidade

**Assunto:** L22 a L24
**Decisão:** TDD do sprintx, lint, checagem de tipos e pipeline de verificação a cada mudança.
**Por quê:** não negociável, nem no modo autônomo.
**O que invalida:** nada.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-01

---

### PR-16 — Idioma, fuso e uso no celular

**Assunto:** L28 a L31
**Decisão:** interface em pt-BR, datas e valores no formato brasileiro, fuso `America/Sao_Paulo`; abaixo de 768px a barra lateral vira gaveta; estados vazio, carregando e erro em toda tela que busca dado.
**Por quê:** lançar um gasto costuma acontecer na rua, pelo celular.
**O que invalida:** se houver usuário fora do Brasil.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-01

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
**Realizada em:** FT-01

---

### PR-19 — Suíte Expx instalada no projeto

**Assunto:** P-8
**Decisão:** `expx add stackx mergex prodx buildx` completou a seleção (sprintx, runx, memox, designx já estavam); lock versionado em `.expx/expx-lock.json`; só o harness do Claude Code, sem OpenCode.
**Por quê:** o B4 invoca sprintx e mergex; o lock existente só listava o harness `claude`.
**O que invalida:** se a família ou o time usar OpenCode (aí roda `npx expxdev init` para o segundo harness).
**Origem:** decisao_de_stack
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-01

---

### PR-20 — Dependências do template atualizadas na criação

**Assunto:** L9
**Decisão:** Next.js 16.4.3, Prisma 7.10.1 e Zod 4.6.7 subidos no projeto, mais overrides de `vite`, `source-map-js`, `fast-uri` e `brace-expansion`, para zerar `npm audit --audit-level=high` (o lock do template trazia um achado crítico no Next.js). Resta um aviso `moderate` do vitest, só de ferramenta de teste.
**Por quê:** auditoria de dependência é portão (P-10); o template estava desatualizado.
**O que invalida:** se uma versão nova do template da skill já vier limpa (aí recopiar).
**Origem:** decisao_de_stack
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-01

---

### PR-21 — Renovação deslizante da sessão

**Assunto:** FT-01, refresh da PR-05
**Decisão:** enquanto a aba do sistema está aberta, a sessão é renovada na metade do tempo de vida do token (padrão 15 min, renovação a cada 7,5 min). A renovação passa sempre pela mesma verificação de uma sessão normal (conta ativa e corte de troca de senha), de modo que sessão derrubada por troca de senha ou conta desativada não ressuscita. Sem a aba aberta, a sessão expira no TTL.
**Por quê:** a PR-05 promete "expiração curta com refresh"; sem renovação, quem está preenchendo um lançamento é jogado para o login a cada 15 minutos.
**O que invalida:** se a família preferir sessão longa fixa (por exemplo 30 dias) ou exigir login a cada visita.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-01

---

### PR-22 — Limite de tentativas de login

**Assunto:** FT-01, limite da PR-12
**Decisão:** cinco falhas de login seguidas para o mesmo e-mail dentro de 15 minutos bloqueiam novas tentativas desse e-mail por 15 minutos (erro 429 com mensagem em português); login correto zera o contador. O contador fica em memória do processo.
**Por quê:** a PR-12 exige limite de tentativas, sem números; o contador em memória atende uma instalação de uma família (PR-18) e não exige serviço externo. O custo conhecido é que um terceiro pode travar o login de um e-mail por 15 minutos.
**O que invalida:** se a instalação rodar em mais de um processo ou for exposta à internet aberta (aí o limite precisa ser compartilhado e por origem).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-01

---

### PR-23 — Pipeline de verificação independente de plataforma

**Assunto:** FT-01, pipeline da PR-15
**Decisão:** a verificação completa é um comando do projeto (`npm run verificar`: lint, checagem de tipos, testes e auditoria de dependência), mais um fluxo de exemplo para GitHub Actions que apenas chama esse comando. Não há remoto configurado, então o fluxo não foi exercitado em serviço.
**Por quê:** a PR-15 exige pipeline a cada mudança; o comando é o que importa e funciona em qualquer plataforma, o fluxo é só o gatilho.
**O que invalida:** se o repositório for hospedado fora do GitHub (troca-se só o gatilho).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-01

---

### PR-24 — Processo de construção: branch por feature, sem worktree

**Assunto:** FT-01, regra 21 do sprintx
**Decisão:** cada feature do B4 é construída na branch `feat/ft-NN-<slug>` na árvore de trabalho principal, uma feature por vez, sem `git worktree`; os artefatos do sprintx e da mergex ficam em `docs/<slug>/`, não em `docs/sprintx/features/<slug>/`.
**Por quê:** o laço do B4 é sequencial (nenhuma feature é paralelizável no MAPA), então não há sessão concorrente para isolar; o orquestrador do buildx definiu esse layout.
**O que invalida:** se duas features passarem a ser construídas ao mesmo tempo.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-01

---

### PR-25 — Forma do registro de atividade

**Assunto:** FT-02, forma e limites do registro da PR-10
**Decisão:** o registro guarda o id e o nome do autor como estavam na hora, a ação (de um catálogo fechado, com rótulo em português), a entidade e o id da entidade, o instante e um detalhe pequeno e plano (texto, número, booleano ou nulo). O detalhe nunca recebe senha, hash, token, segredo, valor ou saldo, e-mail nem CPF: o serviço recusa chave com esses nomes e texto que pareça hash de senha ou token. O nome do usuário afetado entra no detalhe para a tela dizer "quem" sem consulta. Não há chave estrangeira para usuários, o registro é só de acréscimo e é gravado na mesma transação da ação. Só o responsável (`admin`) o lê. Mudança de papel, criação e desativação de usuário são as ações de hoje; reativação, edição de nome e e-mail não são auditadas.
**Por quê:** a PR-10 pede quem, o quê e quando e "nada além"; guardar o nome da hora mantém o histórico legível mesmo se a conta mudar de nome, e a ausência de chave estrangeira evita que a exclusão de uma conta (FT-07, PR-09) seja barrada ou apague o rastro por cascata. O nome do usuário afetado é dado pessoal mínimo, e a FT-07 decide se o apaga ou anonimiza.
**O que invalida:** se a família quiser ver o histórico também dos adultos sobre a própria conta, se quiser auditar reativação ou edição de perfil, ou se o registro precisar guardar o antes e o depois de dado financeiro (aí o detalhe passa a ter regra própria).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-02

---

### PR-26 — Forma do lançamento: valor, data e descrição

**Assunto:** FT-03, forma do lançamento e do que se digita
**Decisão:** o lançamento tem tipo (receita ou despesa), valor, data, categoria e descrição. O valor é um inteiro positivo de centavos (o sinal vem do tipo) e vai até R$ 1.000.000,00; a entrada é lida em formato brasileiro ("1.234,56", "12,5", "1234", com "R$" opcional), com o ponto só como separador de milhar, por leitor de texto que não passa por ponto flutuante. A data é um dia (sem hora) guardado como texto AAAA-MM-DD no fuso `America/Sao_Paulo`; qualquer dia de 2000 a 2100 vale, inclusive futuro. A descrição é opcional, até 200 caracteres.
**Por quê:** a PR-02 manda centavos inteiros e a PR-16 manda o fuso da família; um `DateTime` em UTC faria um lançamento das 23h de 27/10 cair em 28/10, e "1.234" lido como número seria ambíguo entre mil e um vírgula duzentos e trinta e quatro. Nenhum arquivo do projeto diz que a data futura é proibida nem que a descrição é obrigatória; a escolha menos restritiva é a mais reversível. O teto de R$ 1.000.000,00 existe para barrar erro de digitação e fica folgado dentro do inteiro do banco.
**O que invalida:** se a família lançar em outra moeda, lançar valor acima de R$ 1.000.000,00, quiser impedir data futura ou exigir descrição.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-03

---

### PR-27 — Categorias de lançamento

**Assunto:** FT-03, categoria
**Decisão:** toda categoria pertence a um tipo (receita ou despesa), tem nome de 1 a 40 caracteres, único dentro do tipo sem diferenciar maiúscula, e é criada pelo responsável ou pelo adulto. Um lançamento só aceita categoria que existe e que é do mesmo tipo dele. Nesta feature não se edita, oculta nem apaga categoria, e o sistema não traz conjunto oficial nem categoria obrigatória: as categorias de exemplo existem só na seed de demonstração (PR-04). Pendência `decisao_humana` não bloqueante: a família quer conjunto padrão, ou renomear e apagar categorias?
**Por quê:** o pedido diz "cria categorias novas" e nada mais; quais categorias existem é regra de negócio que o buildx não decide. Criar sem poder apagar é a opção mais reversível, porque acrescentar renomear e apagar depois não desfaz nada.
**O que invalida:** se a família quiser renomear, apagar ou ocultar categoria, ou um conjunto padrão de categorias.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-03

---

### PR-28 — Apagar lançamento é definitivo

**Assunto:** FT-03, exclusão de lançamento
**Decisão:** apagar um lançamento remove a linha do banco. A trilha de atividade registra quem apagou, quando, o id, o tipo e a categoria, e nunca o valor (PR-25); a tela pede confirmação em dois passos. Pendência `decisao_humana` não bloqueante: a família quer lixeira ou desfazer?
**Por quê:** a PR-10 pede registrar quem apagou, não guardar o que foi apagado. A remoção lógica deixaria dado "apagado" ao alcance do saldo (FT-04) e da exportação (FT-07), exigindo filtro em toda consulta futura, e um filtro esquecido mostraria dinheiro que a família mandou apagar. A PR-11 trata de retenção do histórico, não de impedir que o usuário apague.
**O que invalida:** se a família quiser desfazer uma exclusão, uma lixeira, ou se passar a exigir guardar o conteúdo de lançamento apagado.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-03

---

### PR-29 — Saldo é do mês escolhido, sem acumulado

**Assunto:** FT-04, definição de saldo e de resumo
**Decisão:** o saldo do mês é a soma das receitas do mês menos a soma das despesas do mês, em centavos inteiros, e pode ser negativo. Conta só o que tem data dentro do mês escolhido (do dia 1 ao último dia, no calendário de São Paulo): o saldo de um mês nunca carrega o do anterior, e não há saldo acumulado, saldo inicial, meta, orçamento nem comparação entre meses. O resumo mostra o total de receitas, o total de despesas, o saldo e as despesas somadas por categoria (só as categorias que têm despesa no mês, da maior para a menor); receita não é aberta por categoria. O painel inicial mostra o resumo ao responsável e ao adulto, o mês vem do parâmetro `mes` da URL (`AAAA-MM`, validado no servidor; inválido ou ausente vale o mês corrente), e qualquer outro papel não recebe o resumo. Pendência `decisao_humana` não bloqueante: a família quer que o saldo carregue o do mês anterior (saldo acumulado)?
**Por quê:** o critério de aceite diz "vê o saldo do mês refletir os dois lançamentos" e o MAPA diz "saldo do mês escolhido"; nenhum arquivo traz saldo acumulado, e "orçamento por categoria" e "relatórios comparativos" estão em fora de escopo. Somar só o mês é a opção mais simples e reversível: acrescentar um acumulado depois não desfaz nada, enquanto começar com acumulado e depois tirar mudaria números que a família já conferiu.
**O que invalida:** se a família quiser saldo acumulado, saldo inicial, receita aberta por categoria, ou ver o resumo de mais de um mês lado a lado.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-04

---

### PR-30 — Forma do cadastro do filho

**Assunto:** FT-05, o que se guarda do filho e o que a mesada combinada significa
**Decisão:** o registro do filho tem nome (1 a 80 caracteres, obrigatório), data de nascimento (opcional, dia civil AAAA-MM-DD, não pode ser futura), valor de mesada combinado (obrigatório, inteiro positivo de centavos até R$ 1.000.000,00, lido pelo mesmo leitor em formato brasileiro do lançamento) e periodicidade (obrigatória, `semanal` ou `mensal`). O valor e a periodicidade são só informativos: não geram crédito, não disparam cálculo e não alimentam saldo (isso é a FT-06). Nada além disso é guardado do filho: nenhum CPF, RG, telefone, endereço nem foto (PR-09). Só o responsável (`admin`) cadastra, lê a lista e edita; o adulto (`usuario`) não. Não há idade mínima ou máxima, limite de filhos nem mais de um responsável por filho. Apagar de fato o filho é da FT-07. Pendência `decisao_humana` não bloqueante: a família quer mesada opcional (filho sem valor combinado) ou periodicidade além de semanal e mensal?
**Por quê:** o MAPA lista nome, valor e periodicidade como o cadastro, e a PR-09 limita o dado de menor a nome, nascimento opcional e e-mail de login opcional; a descrição só pede nascimento como opcional, então os outros dois são obrigatórios. Exigir menos seria inventar um filho sem mesada, e exigir mais (idade, limite) seria inventar regra de negócio. A data futura é recusada por ser dado impossível, não por regra de idade.
**O que invalida:** se a família quiser filho sem mesada combinada, outras periodicidades (quinzenal, por tarefa), mais de um responsável por filho, ou o adulto cadastrando filhos.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-05

---

### PR-31 — Login do filho ligado ao registro

**Assunto:** FT-05, como o papel `filho` nasce e o que ele alcança
**Decisão:** o login do filho é um usuário de papel `filho` ligado ao registro do filho, um para um, criado só pelo responsável na página do filho (e-mail de login e senha provisória de ao menos 8 caracteres); o nome do usuário é o do filho. O papel `filho` nasce somente aí: a tela Usuários não cria, não oferece e não muda papel para `filho`, e recusa mudar o papel de quem já é `filho`. O responsável pode desativar o login (a conta e o vínculo ficam; reativar e redefinir senha esquecida não existem nesta feature). O filho acessa apenas o painel neutro, a própria página de mesada, o perfil e a troca de senha; o servidor nega todo o resto, e um filho nunca recebe a página, o dado nem a confirmação de existência de outro filho. Cadastro, edição, criação e desativação de login entram na trilha (PR-10) só com ids, nomes e os nomes dos campos alterados, nunca valor, saldo, e-mail nem data de nascimento (PR-25). Pendência `decisao_humana` não bloqueante: a família quer reativar o login ou redefinir a senha esquecida de um filho pelo responsável?
**Por quê:** a PR-06 manda o filho ler só o que é dele, checado no servidor; ligar o login ao registro por chave única impede dois logins por filho e torna impossível ler outro irmão sem um id que a página não aceita. Impedir que a tela Usuários crie ou mude `filho` evita login órfão (sem registro) e escalada de papel por outro caminho. Reativação e redefinição são regra de operação que a descrição não traz: o mais simples e reversível é não oferecê-las agora.
**O que invalida:** se os filhos não forem ter login (PR-06), se o adulto também gerir filhos, se um filho puder ter mais de um login ou se a família quiser reativar e redefinir senha.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-05

---

### PR-32 — Forma do movimento de mesada e o saldo do filho

**Assunto:** FT-06, o que é um movimento de mesada e como o saldo sai
**Decisão:** o movimento de mesada pertence a um filho e tem tipo (`credito` ou `gasto`), valor, data e descrição. O valor é um inteiro positivo de centavos (o sinal vem do tipo), lido pelo mesmo leitor em formato brasileiro e com o mesmo teto da PR-26 (R$ 0,01 a R$ 1.000.000,00); a data é um dia civil `AAAA-MM-DD` no fuso `America/Sao_Paulo`, de 2000 a 2100, inclusive futura; a descrição é opcional, até 200 caracteres. O saldo do filho é a soma de todos os créditos menos a soma de todos os gastos dele, sem corte por data nem por mês, calculado no servidor por soma de inteiros no banco (`groupBy`), nunca em ponto flutuante nem no cliente. O saldo pode ser negativo: o sistema não bloqueia o gasto, mostra o saldo negativo com sinal de menos e uma frase que o diz (não só pela cor) e avisa o responsável ao registrar o gasto que o deixou negativo. O extrato lista do movimento de dia mais recente para o mais antigo, 30 por página. O valor combinado da FT-05 continua só informativo: não gera crédito (nada de mesada automática ou recorrente). Pendência `decisao_humana` não bloqueante: a família quer impedir gasto acima do saldo, mesada automática, aprovação de gasto, pedido de gasto pelo filho, metas ou poupança, juros, tarefas que rendem mesada ou transferência entre filhos?
**Por quê:** a PR-02 manda centavos inteiros e a PR-26 já fixou a forma de valor, data e descrição do lançamento, então o movimento a repete para não ter dois jeitos de digitar dinheiro. Nenhum arquivo do projeto diz que o gasto é limitado pelo saldo, que a data futura é proibida ou que o saldo se divide em períodos; o PROJETO.md põe mesada automática, aprovação, metas, juros e tarefas em fora de escopo. Permitir e sinalizar é a opção mais simples e reversível: acrescentar um bloqueio depois não desfaz nada, enquanto bloquear agora esconderia um gasto que a criança de fato fez e faria o saldo divergir do que a família conferiu à mão.
**O que invalida:** se a família quiser bloquear gasto acima do saldo, mesada gerada sozinha pelo valor combinado, saldo por período, valor acima de R$ 1.000.000,00, data futura proibida, ou mais de uma moeda.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-06

---

### PR-33 — Quem mexe na mesada, apagar movimento e o vínculo com o filho

**Assunto:** FT-06, autorização, exclusão e chave estrangeira do movimento
**Decisão:** só o responsável (`admin`) registra, edita, apaga e lê os movimentos e o saldo de qualquer filho; o adulto (`usuario`) não mexe em mesada nem a vê (padrão mais restritivo, igual ao cadastro do filho da PR-30); o `filho` só lê o extrato e o saldo do próprio registro, por uma função que não recebe id (o registro vem do usuário da sessão), e nunca cria, edita nem apaga movimento. Toda função do serviço começa pela guarda de papel, por lista de permitidos. O movimento não muda de filho depois de criado (sem transferência). Apagar um movimento remove a linha do banco, com confirmação em dois passos na tela, como o lançamento (PR-28); a trilha registra quem apagou, quando, o id, o tipo e o filho, nunca o valor (PR-25). Criar, editar e apagar entram na trilha na mesma transação. O movimento tem chave estrangeira para o filho com `onDelete: Cascade`: apagar o registro do filho leva o histórico dele, que é o que a PR-09 pede (exclusão de verdade); a tabela `movimentos_de_mesada` é única e indexada por filho, de modo que a FT-07 exporta e apaga por filho com uma consulta. Esta feature não apaga filho. Pendência `decisao_humana` não bloqueante: o adulto deve ver ou lançar a mesada dos filhos? A família quer lixeira ou desfazer ao apagar movimento?
**Por quê:** a PR-06 manda o filho ler só o que é dele, checado no servidor, e a descrição diz que o responsável registra. Dar acesso ao adulto seria ampliar acesso a dado de menor sem pedido; começar fechado e abrir depois não desfaz nada. A exclusão definitiva repete a lógica da PR-28 (remoção lógica deixaria dinheiro apagado ao alcance do saldo e da exportação). O `Cascade` é a política que evita registro órfão de menor depois que a FT-07 apagar o filho; sem ele, o apagar da FT-07 teria de lembrar de limpar a tabela na ordem certa.
**O que invalida:** se o adulto também gerir a mesada, se a família quiser lixeira ou desfazer, se o histórico de mesada precisar sobreviver à exclusão do filho, ou se um movimento puder mudar de filho.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-06

---

### PR-34 — Forma da exportação dos dados da família

**Assunto:** FT-07, o que o arquivo exportado contém, como é versionado e quem o baixa
**Decisão:** o responsável (`admin`) baixa um arquivo JSON em UTF-8, nome `dados-da-familia-AAAA-MM-DD.json` (data de São Paulo), por uma rota que só aceita POST, verificada no servidor, com `Content-Disposition: attachment` e `Cache-Control: no-store`. O documento tem `versao_do_formato` (hoje `1`), `gerado_em` (ISO) e as listas `usuarios` (id, nome, e-mail, papel, ativo, criado_em), `categorias`, `lancamentos`, `filhos` (nome, nascimento, mesada combinada, periodicidade, id do usuário de login, saldo), `movimentos_de_mesada` e `atividade` (a trilha, como está gravada). Todo valor é inteiro em centavos (`*_centavos`, PR-02), sem texto formatado; toda data civil é `AAAA-MM-DD` e todo instante é ISO 8601 em UTC. O arquivo nunca leva hash de senha, token, JWT, segredo, o corte de sessão (`sessoesValidasDesde`) nem contador de tentativas de login; um teste varre o arquivo procurando esses campos e os valores reais. A exportação grava `familia.exportada` na trilha (ator, id opaco, versão do formato), sem conteúdo, antes de entregar o arquivo; se o rastro falha, não há arquivo. A trilha entra no arquivo porque é dado da família e já nasce sem valor, senha, token nem e-mail (PR-25). Sem CSV, PDF, importação nem exportação parcial. Pendência `decisao_humana` não bloqueante: a família quer o arquivo também em planilha (CSV), o texto formatado dos valores, ou importar o arquivo de volta?
**Por quê:** a PR-09 manda o responsável exportar os dados da família; a PR-02 manda centavos inteiros, e o texto formatado duplicaria o dado e convidaria a ler o texto em vez do inteiro. Só POST porque a rota grava na trilha e o cookie `sameSite: lax` seguiria um link de outro site. Um arquivo versionado deixa a importação, se vier, saber o que lê. Incluir a trilha segue a recomendação de fechar o ciclo do dado da família sem nada sensível a mais.
**O que invalida:** se a família quiser outro formato (planilha, PDF), importação do arquivo, exportação por filho ou por período, ou se o arquivo for guardado fora da máquina do responsável sem cuidado (ele leva nome e e-mail de menores e todo o dinheiro da casa).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-07

---

### PR-35 — Exclusão da conta do filho: o que apaga e o que anonimiza

**Assunto:** FT-07, exclusão de verdade do filho com o histórico dele (LGPD art. 14, PR-09)
**Decisão:** só o responsável (`admin`) apaga a conta de um filho, e só depois de digitar o nome do filho (confirmação em dois passos; o servidor confere o nome, a tela não basta). Numa única transação o sistema remove o registro do filho, os movimentos de mesada dele (a chave estrangeira `Cascade` da PR-33 faz isso) e o usuário de login `filho` ligado a ele; o estado de tentativas de login desse e-mail é esquecido. Não há tabela de sessão: o token emitido antes deixa de abrir qualquer página porque o usuário deixa de existir. A trilha de atividade não é apagada: as linhas que citam o filho (as de entidade `filho` com o id dele, as de mesada com o id dele no `detalhe` e as que tenham o usuário de login como entidade ou ator) são anonimizadas, com o nome substituído por "filho removido", e fica registrado `filho.excluido` (ator, quando, id opaco do filho, sem nome, e-mail, valor nem saldo). O id opaco do filho e os tipos (crédito ou gasto) ficam na trilha; nenhum nome, e-mail, nascimento, valor ou descrição do filho sobra em tabela alguma, e um teste inspeciona o banco inteiro. Apagar é definitivo: sem lixeira, sem desfazer, sem exigir consentimento registrado; a tela avisa para baixar a exportação antes. Pendências `decisao_humana` não bloqueantes: exclusão da família inteira ou de usuário adulto, prazo legal de resposta, termo de consentimento assinado e versionado, anonimizar em vez de excluir, lixeira ou desfazer.
**Por quê:** a PR-09 diz que a exclusão apaga de fato; "apagar" mantendo o nome do filho em registro da trilha não cumpriria o pedido, e apagar a trilha inteira apagaria a prova de que a exclusão ocorreu e de quem a fez. Anonimizar a linha preserva o fato (PR-10) sem dado pessoal (PR-25 já previa que a FT-07 decidiria). Digitar o nome é a barreira contra o clique errado em algo irreversível, como o dois passos da PR-28.
**O que invalida:** se a família quiser guardar o histórico financeiro sem o nome (anonimizar em vez de apagar), poder desfazer, apagar a família inteira ou um adulto, ou se um prazo legal exigir etapa que o sistema não tem.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-07

---

### PR-36 — Forma do log, o que ele redige e o erro inesperado

**Assunto:** FT-08, formato do log de aplicação, o que nunca vai para ele e como o erro inesperado aparece
**Decisão:** o log é uma linha JSON por evento com `nivel` (`info`, `aviso`, `erro`), `instante` ISO UTC, `evento` (minúsculas separadas por ponto) e `contexto` plano. Sai na saída padrão e no arquivo do dia `logs/app-AAAA-MM-DD.log` (dia UTC; pasta em `LOG_DIR`, vazio desliga; desligado nos testes). Nunca registra as chaves proibidas da trilha (senha, hash, token, JWT, segredo, valor, centavos, saldo, e-mail, CPF), texto com cara de hash, JWT ou e-mail, nem mensagem ou pilha de erro: o que bate vira `[removido]` e um `Error` vira só o nome. O arquivo com mais de 90 dias (pelo dia do nome) é descartado ao subir o servidor e por `npm run log:limpar`. O erro inesperado grava só `erro.inesperado` com nome, código do erro e um identificador de 12 caracteres, e a tela ou a resposta da API mostra o mesmo identificador ("Código: ...") junto da frase genérica.
**Por quê:** a PR-11 manda log por 90 dias sem dado pessoal e a PR-14 manda erro sem pilha com identificador de correlação; a mensagem de um erro de banco pode trazer e-mail ou valor, então gravar a mensagem anularia a regra, e o identificador basta para achar a linha. Arquivo por dia, com a data no nome, torna o descarte exato e testável sem depender de data de modificação. Reaproveitar a lista da trilha evita duas definições de "dado que não se registra".
**O que invalida:** se a família ou quem opera quiser a pilha completa no log (por exemplo, para depurar em produção), outro prazo de retenção, log centralizado em serviço externo, ou se a saída padrão for redirecionada para um lugar com retenção própria.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-08

---

### PR-37 — Forma do backup e da restauração

**Assunto:** FT-08, como o backup é gerado, guardado e restaurado
**Decisão:** `npm run backup` gera `backups/backup-AAAA-MM-DD-HHMMSS.db` (horário de São Paulo; pasta em `BACKUP_DIR`) por `VACUUM INTO`, com pasta 0700 e arquivo 0600, sem nunca sobrescrever. `npm run restaurar -- <arquivo>` só aceita um SQLite íntegro com as seis tabelas do sistema, guarda o banco atual em `backups/antes-da-restauracao-AAAA-MM-DD-HHMMSS.db` e troca por renomeação; arquivo inválido é recusado sem tocar no banco atual. O sistema precisa estar parado na restauração (documentado no runbook, sem trava automática). O arquivo leva hashes de senha e todo o dinheiro da casa: a pasta fica fora do git, não é criptografada e quem opera a guarda com cuidado. Não há rotação dos backups antigos nem agendamento: ambos ficam com quem opera (cron do sistema).
**Por quê:** a PR-13 pede comando de backup, comando de restauração e teste que restaura; `VACUUM INTO` dá uma cópia consistente com o sistema no ar, o que um `cp` não garante. Restaurar lixo por cima do histórico da família seria pior que não ter o comando, por isso a validação e a cópia prévia. Agendar, criptografar, mandar para nuvem ou restaurar pela interface exigem decisão de frequência, de chave e de papel, ou credencial externa que o buildx não tem.
**O que invalida:** se a família quiser backup automático, retenção de backups, criptografia, cópia remota ou restauração pela interface, ou se o banco for trocado por serviço gerenciado com backup próprio.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-08

---

### PR-38 — Rota de saúde e configuração que falha no start

**Assunto:** FT-08, o que `/api/saude` responde e o que acontece com configuração inválida
**Decisão:** `GET /api/saude` é pública (sem sessão) e responde `200 {"status":"ok","banco":"ok"}` quando um `SELECT 1` no banco responde em até 3 segundos, ou `503 {"status":"indisponivel","banco":"falha"}` quando não; nunca leva versão, caminho, usuário nem pilha, e o corpo tem só essas duas chaves. Ao subir, o servidor confere `DATABASE_URL` (precisa ser `file:`), `JWT_SECRET` e `JWT_TTL_SEGUNDOS` (inteiro positivo, opcional); se algo estiver errado, imprime todos os problemas sem repetir valor e encerra com código 1, porque o Next anuncia "Ready" antes do gancho de start e só registraria o erro, seguindo de pé sem atender.
**Por quê:** a PR-14 pede rota de saúde e variável obrigatória ausente que falha no start. A rota é pública porque um monitor precisa perguntar sem entrar, e por isso não pode entregar nada que ajude um atacante ou revele dado da família. Encerrar o processo é o único jeito observado de a falha de configuração realmente impedir o start.
**O que invalida:** se a saúde precisar de autenticação (monitor interno atrás de proxy), se quiser checar mais que o banco (disco, fila), ou se a hospedagem tratar código de saída diferente de zero de outro modo.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-08
