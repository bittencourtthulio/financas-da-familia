---
expx_schema: 1
expx_tool: buildx
kind: relatorio
projeto_id: financas-da-familia
data: 2026-10-28
modo: autonomo
features_entregues: 9
features_bloqueadas: 0
prs_abertos: 0
pendencias_declaradas: 19
premissas_registradas: 39
ciclos_recursao: 2
veredito_validacao: aprovado_com_pendencia
---

# Finanças da Família: relatório final

Um sistema para uma família controlar as finanças da casa (receitas e despesas, saldo do mês) e a mesada de cada filho (créditos, gastos, extrato e saldo), com login para os pais e para os filhos, em português, com tema claro e escuro e usável no celular.

**9 features entregues · 0 PRs abertos (9 branches locais) · 19 pendências · 39 premissas**

**Veredito da validação: aprovado com pendência.** O sistema sobe numa cópia limpa, a suíte de 1475 testes passa e nenhuma premissa de segurança ficou sem código. Dois fatos mudam o que "pronto" significa aqui: **não existe pull request** (não há repositório remoto) e **o CI do GitHub nunca rodou**. Detalhes nas seções 4 e 5.

---

## 1. O que você precisa decidir

São **17 decisões abertas** (PEND-01 a PEND-15, PEND-19 e PEND-20). A PEND-18 foi resolvida pela FT-09. Em todas, o que está em uso hoje é a opção mais simples e segura, e nenhuma bloqueia o uso. Agrupadas por tema.

### Lançamentos da casa (PEND-01, PEND-02)

**A decisão:** a família quer categorias padrão e poder renomear, ocultar ou apagar categoria (PEND-01)? Um lançamento apagado deve poder ser recuperado (PEND-02)?
**As opções:** categorias: só criar (hoje), conjunto oficial já cadastrado, ou renomear/ocultar/apagar (obriga decidir o destino dos lançamentos antigos). Apagar: exclusão definitiva (hoje) ou lixeira com prazo.
**O que fiz enquanto isso:** só "criar categoria" (as de exemplo existem só na seed); apagar é definitivo, com confirmação em dois passos e um rastro sem valor.
**Se mudar:** (a) para (b) é barato; renomear ou apagar mexe em dado existente; lixeira pede coluna nova e migration, e o que já foi apagado não volta.

### Saldo do mês (PEND-03)

**A decisão:** o saldo de um mês carrega o do mês anterior?
**As opções:** só o saldo do mês (hoje) ou saldo acumulado desde o início.
**O que fiz enquanto isso:** receitas menos despesas do mês escolhido, sem acumulado, meta ou comparativo.
**Se mudar:** só cálculo e tela, sem migração.

### Filhos e mesada (PEND-04, 05, 06, 07, 08, 09, 19, 20)

**A decisão:** o desenho da mesada (as regras que a descrição não trouxe).
**As opções e o que está em uso hoje:**
- PEND-04, mesada obrigatória e só semanal ou mensal (hoje) ou opcional e com outras periodicidades. O valor combinado é só informativo: nada é creditado sozinho.
- PEND-05, só dá para desativar o login de um filho (hoje); o responsável não reativa nem redefine senha. Para devolver acesso é preciso apagar e recadastrar. Alternativas: reativar, redefinir senha.
- PEND-06, saldo negativo permitido e sinalizado em texto (hoje), todo crédito e gasto é manual. Fora: bloquear gasto acima do saldo, mesada automática, aprovação de gasto, metas, juros, tarefas que rendem mesada, transferência entre filhos.
- PEND-07, movimento com data futura conta no saldo de hoje (hoje). Alternativa: ficar "agendado" fora do saldo, ou saldo por período.
- PEND-08, **só o responsável vê e lança mesada; o adulto é negado no servidor** (hoje). Alternativas: adulto vê, ou vê e lança.
- PEND-09, movimento de mesada apagado é definitivo (hoje) ou vai para lixeira.
- PEND-19, o e-mail de login de um filho é fixo (hoje). Trocar exige decidir o que acontece com a sessão aberta.
- PEND-20, o nome do login de um filho é livre na tela Usuários, e a próxima edição do cadastro do filho o sobrescreve (hoje). Alternativa: bloquear a edição ali para logins de filho.
**Se mudar:** PEND-04, 05, 19: função nova ou migration simples. PEND-06 a 09: acrescentar regra é fácil, mudar o que já foi lançado exige decisão sobre o histórico; PEND-08 é mudança de autorização com teste. PEND-20 é regra de tela.

### Privacidade e dado de menor (PEND-10, 11, 12)

**A decisão:** até onde vai a exclusão e a exportação de dados, e se um termo de consentimento é necessário.
**As opções:** exclusão: só a conta do filho (hoje) ou apagar a família inteira, um adulto, anonimizar em vez de excluir, prazo legal de resposta, termo de consentimento versionado (decisão jurídica da família). Exportação: um JSON versionado em centavos (hoje) ou CSV, PDF, importação, recorte por filho ou período. Desfazer a exclusão do filho: definitiva (hoje) ou prazo de arrependimento, que conflita com "apagar de verdade".
**O que fiz enquanto isso:** só a conta do filho é apagada, com o nome digitado; as linhas da trilha viram "filho removido"; um único JSON (`versao_do_formato: 1`) baixado só pelo responsável.
**Se mudar:** estender é feature nova; o que já foi apagado não volta.

### Backup e operação (PEND-13, 14, 15)

**A decisão:** com que frequência o backup roda sozinho e por quanto tempo fica; se é criptografado; se a restauração pode ser feita por tela.
**As opções:** hoje é só manual (`npm run backup`), em claro, sem rotação, e a restauração é só por comando. Alternativas: agendado pelo cron do sistema com rotação; criptografado com senha (a família precisa guardar a chave: perdê-la perde o backup); restauração por tela, só do responsável.
**O que fiz enquanto isso:** arquivo com permissão 0600, fora do git, que leva hashes de senha e todo o dinheiro da casa; o runbook no `README.md` sugere o cron.
**Se mudar:** sem migração; a restauração por tela é feature nova e sobrescreve o banco inteiro.

### Premissas provisórias que merecem atenção (além das decisões acima)

São as marcadas provisórias que não viraram PEND própria. Leia a coluna "o que invalida" na seção 3:

- **PR-01.** Eu li "controle de mesa dos filhos" como **mesada**. Se não for, o produto inteiro das FT-05 e FT-06 está errado.
- **PR-06 e PR-31.** Os filhos têm login e só veem a própria mesada. Se os filhos não vão usar o sistema, o papel `filho` é peso morto.
- **PR-22.** O limite de cinco tentativas de login fica na memória do processo: não vale para mais de um processo, nem se o sistema for exposto à internet aberta.
- **PR-12.** O cookie é `secure` em produção: o sistema precisa de HTTPS, ou de `localhost`. Em `http://` por um endereço de rede, o login não "pega".

---

## 2. O que você precisa providenciar

| O que falta | O que destrava | Estado atual |
|---|---|---|
| PEND-17: um repositório remoto git (por exemplo no GitHub) com acesso de escrita | `git push` das nove branches empilhadas, um PR por feature (descrições prontas em `docs/<slug>/PR.md`) e a primeira execução do CI (`.github/workflows/verificar.yml`) | construído e não conectado: nove branches locais, sem remote, todas verdes. **O CI do GitHub Actions nunca rodou.** |
| PEND-16: uma conta de armazenamento (nuvem ou outro disco) e a credencial | cópia do backup fora da máquina que guarda o banco | o backup existe só no disco local, em `backups/` |

---

## 3. O que foi decidido por você

Segurança primeiro, depois stack, depois o resto. As 39 premissas, na ordem do `PREMISSAS.md` reagrupada.

**Como revisar isto em cinco minutos:** leia só a coluna *o que invalida*. Se aquilo é verdade no seu caso, a premissa merece sua atenção. Se não é, siga em frente.

| # | Decisão | O que invalida |
|---|---|---|
| PR-05 | **Autenticação própria.** e-mail e senha, sessão por JWT em cookie `httpOnly`, expiração curta com refresh. | se a família quiser login com Google ou outro provedor. |
| PR-06 (provisória) | **Papéis, incluindo o filho.** papéis `admin` (responsável), `usuario` (adulto) e `filho`; o filho só lê o próprio extrato e saldo de mesada; checagem sempre no servidor. | se os filhos não forem ter login (só os pais usam o sistema). |
| PR-12 | **Segurança de base.** hash forte de senha com mínimo de tamanho, entrada validada por esquema no servidor, consulta parametrizada, segredo em variável de ambiente com `.env.example`, cookie `secure` e `sameSite` (...) | se o sistema for exposto sem HTTPS. |
| PR-21 | **Renovação deslizante da sessão.** enquanto a aba do sistema está aberta, a sessão é renovada na metade do tempo de vida do token (padrão 15 min, renovação a cada 7,5 min) (...) | se a família preferir sessão longa fixa (por exemplo 30 dias) ou exigir login a cada visita. |
| PR-22 | **Limite de tentativas de login.** cinco falhas de login seguidas para o mesmo e-mail dentro de 15 minutos bloqueiam novas tentativas desse e-mail por 15 minutos (erro 429 com mensagem em português); login correto zera o contador (...) | se a instalação rodar em mais de um processo ou for exposta à internet aberta (aí o limite precisa ser compartilhado e por origem). |
| PR-09 | **Dado de menor e LGPD.** campos pessoais do filho limitados a nome, data de nascimento opcional e e-mail de login opcional; base legal: consentimento de um responsável (LGPD art. 14); exclusão de conta apaga de fato (...) | se algum usuário da família não for residente no Brasil, ou se o sistema passar a guardar documento do filho (CPF, RG). |
| PR-31 (provisória) | **Login do filho ligado ao registro.** o login do filho é um usuário de papel `filho` ligado ao registro do filho, um para um, criado só pelo responsável na página do filho (e-mail de login e senha provisória de ao menos 8 caracteres); o nome do usuário é o do filho (...) | se os filhos não forem ter login (PR-06), se o adulto também gerir filhos, se um filho puder ter mais de um login ou se a família quiser reativar e redefinir senha. |
| PR-33 (provisória) | **Quem mexe na mesada, apagar movimento e o vínculo com o filho.** só o responsável (`admin`) registra, edita, apaga e lê os movimentos e o saldo de qualquer filho; o adulto (`usuario`) não mexe em mesada nem a vê (padrão mais restritivo, igual ao cadastro do filho da PR-30) (...) | se o adulto também gerir a mesada, se a família quiser lixeira ou desfazer, se o histórico de mesada precisar sobreviver à exclusão do filho, ou se um movimento puder mudar de filho. |
| PR-34 (provisória) | **Forma da exportação dos dados da família.** o responsável (`admin`) baixa um arquivo JSON em UTF-8, nome `dados-da-familia-AAAA-MM-DD.json` (data de São Paulo), por uma rota que só aceita POST, verificada no servidor (...) | se a família quiser outro formato (planilha, PDF), importação do arquivo, exportação por filho ou por período, ou se o arquivo for guardado fora da máquina do responsável sem cuidado (ele leva nome e e-mail de menores e todo o dinheiro da casa). |
| PR-35 (provisória) | **Exclusão da conta do filho: o que apaga e o que anonimiza.** só o responsável (`admin`) apaga a conta de um filho, e só depois de digitar o nome do filho (confirmação em dois passos; o servidor confere o nome, a tela não basta). Numa única transação o sistema remove o registro do filho (...) | se a família quiser guardar o histórico financeiro sem o nome (anonimizar em vez de apagar), poder desfazer, apagar a família inteira ou um adulto, ou se um prazo legal exigir etapa que o sistema não tem. |
| PR-36 (provisória) | **Forma do log, o que ele redige e o erro inesperado.** o log é uma linha JSON por evento com `nivel` (`info`, `aviso`, `erro`), `instante` ISO UTC, `evento` (minúsculas separadas por ponto) e `contexto` plano (...) | se a família ou quem opera quiser a pilha completa no log (por exemplo, para depurar em produção), outro prazo de retenção, log centralizado em serviço externo, ou se a saída padrão for redirecionada para um lugar com retenção própria. |
| PR-37 (provisória) | **Forma do backup e da restauração.** `npm run backup` gera `backups/backup-AAAA-MM-DD-HHMMSS.db` (horário de São Paulo; pasta em `BACKUP_DIR`) por `VACUUM INTO`, com pasta 0700 e arquivo 0600, sem nunca sobrescrever (...) | se a família quiser backup automático, retenção de backups, criptografia, cópia remota ou restauração pela interface, ou se o banco for trocado por serviço gerenciado com backup próprio. |
| PR-38 (provisória) | **Rota de saúde e configuração que falha no start.** `GET /api/saude` é pública (sem sessão) e responde `200 {"status":"ok","banco":"ok"}` quando um `SELECT 1` no banco responde em até 3 segundos, ou `503 {"status":"indisponivel","banco":"falha"}` quando não; nunca leva versão (...) | se a saúde precisar de autenticação (monitor interno atrás de proxy), se quiser checar mais que o banco (disco, fila), ou se a hospedagem tratar código de saída diferente de zero de outro modo. |
| PR-39 (provisória) | **O login do filho acompanha o nome do cadastro.** ao editar o filho, o `nome` do usuário de login ligado passa a ser o nome do cadastro, na mesma transação da edição e do rastro: se qualquer parte falha, nada muda. A comparação é com o nome atual do usuário (...) | se a família quiser que o login tenha nome próprio, diferente do cadastro, se quiser que o e-mail acompanhe algo, ou se a tela Usuários passar a poder renomear o filho (e o sentido contrário precisar de regra). |
| PR-10 | **Trilha de auditoria proporcional.** registrar quem criou, alterou ou apagou lançamento e movimento de mesada, e quem alterou papel de usuário; nada além disso. | se só uma pessoa fizer lançamentos. |
| PR-25 | **Forma do registro de atividade.** o registro guarda o id e o nome do autor como estavam na hora, a ação (de um catálogo fechado, com rótulo em português), a entidade e o id da entidade, o instante e um detalhe pequeno e plano (texto, número, booleano ou nulo) (...) | se a família quiser ver o histórico também dos adultos sobre a própria conta, se quiser auditar reativação ou edição de perfil, ou se o registro precisar guardar o antes e o depois de dado financeiro (aí o detalhe passa a ter regra própria). |
| PR-11 | **Retenção.** lançamentos e mesadas guardados enquanto a conta da família existir; log de aplicação por 90 dias; sem dado pessoal em log. | se a família pedir apagar lançamentos antigos automaticamente. |
| PR-17 | **Template como esqueleto.** esqueleto copiado do template: Next.js + TypeScript, três camadas, SQLite com migrations. | se o usuário pedir outra stack ou banco. |
| PR-20 | **Dependências do template atualizadas na criação.** Next.js 16.4.3, Prisma 7.10.1 e Zod 4.6.7 subidos no projeto, mais overrides de `vite`, `source-map-js`, `fast-uri` e `brace-expansion` (...) | se uma versão nova do template da skill já vier limpa (aí recopiar). |
| PR-23 | **Pipeline de verificação independente de plataforma.** a verificação completa é um comando do projeto (`npm run verificar`: lint, checagem de tipos, testes e auditoria de dependência), mais um fluxo de exemplo para GitHub Actions que apenas chama esse comando (...) | se o repositório for hospedado fora do GitHub (troca-se só o gatilho). |
| PR-13 | **Backup e migrations.** comando de backup do arquivo SQLite, comando de restauração e teste automatizado que restaura um backup; migrations versionadas. | se o banco for trocado por serviço gerenciado com backup próprio. |
| PR-14 | **Operação mínima.** log estruturado sem segredo, erro sem rastro de pilha ao usuário e com identificador de correlação, rota `/api/saude`, variável obrigatória ausente falha no start, `npm run dev` sobe tudo. | se o sistema for hospedado em plataforma sem disco persistente (SQLite não persistiria). |
| PR-15 | **Qualidade.** TDD do sprintx, lint, checagem de tipos e pipeline de verificação a cada mudança. | nada. |
| PR-19 | **Suíte Expx instalada no projeto.** `expx add stackx mergex prodx buildx` completou a seleção (sprintx, runx, memox, designx já estavam); lock versionado em `.expx/expx-lock.json`; só o harness do Claude Code, sem OpenCode. | se a família ou o time usar OpenCode (aí roda `npx expxdev init` para o segundo harness). |
| PR-24 | **Processo de construção: branch por feature, sem worktree.** cada feature do B4 é construída na branch `feat/ft-NN-<slug>` na árvore de trabalho principal, uma feature por vez, sem `git worktree`; os artefatos do sprintx e da mergex ficam em `docs/<slug>/` (...) | se duas features passarem a ser construídas ao mesmo tempo. |
| PR-07 | **Design system do VS Code.** tokens do VS Code Dark+ e Light+, preferência do sistema respeitada. | se a família preferir aparência de aplicativo de consumo ou indicar outro design system. |
| PR-08 | **Skill de frontend design.** o acabamento das telas de negócio usa a skill `frontend-design`, disponível na sessão, dentro dos tokens do PR-07. | se o usuário pedir para não usar skill de design. |
| PR-16 | **Idioma, fuso e uso no celular.** interface em pt-BR, datas e valores no formato brasileiro, fuso `America/Sao_Paulo`; abaixo de 768px a barra lateral vira gaveta; estados vazio, carregando e erro em toda tela que busca dado. | se houver usuário fora do Brasil. |
| PR-04 | **Usuário de demonstração.** seed de demonstração com um responsável, um adulto, dois filhos fictícios, lançamentos e mesada de exemplo; nunca roda em produção. | nada (padrão sem exceção). |
| PR-03 | **Esqueleto de aplicação (P-9).** painel inicial, cadastro de usuários, perfil e troca de senha vêm do template e ficam na barra lateral. | se a gestão de usuários for delegada a um provedor externo. |
| PR-01 (provisória) | **Modo e leitura do pedido.** modo autônomo total; "controle de mesa dos filhos" lido como controle de mesada. | se "mesa" não for mesada (por exemplo, controle de mesa de jantar ou de refeições dos filhos). |
| PR-02 | **Dinheiro em centavos.** todo valor guardado e calculado em centavos inteiros, moeda única BRL; nunca ponto flutuante. | se a família lançar em mais de uma moeda. |
| PR-18 | **Uma família por instalação.** sem multi-tenant: todos os dados de uma instalação pertencem a uma família. | se a mesma instalação servir a mais de uma família. |
| PR-26 | **Forma do lançamento: valor, data e descrição.** o lançamento tem tipo (receita ou despesa), valor, data, categoria e descrição. O valor é um inteiro positivo de centavos (o sinal vem do tipo) e vai até R$ 1.000.000,00; a entrada é lida em formato brasileiro ("1.234,56" (...) | se a família lançar em outra moeda, lançar valor acima de R$ 1.000.000,00, quiser impedir data futura ou exigir descrição. |
| PR-27 (provisória) | **Categorias de lançamento.** toda categoria pertence a um tipo (receita ou despesa), tem nome de 1 a 40 caracteres, único dentro do tipo sem diferenciar maiúscula, e é criada pelo responsável ou pelo adulto (...) | se a família quiser renomear, apagar ou ocultar categoria, ou um conjunto padrão de categorias. |
| PR-28 (provisória) | **Apagar lançamento é definitivo.** apagar um lançamento remove a linha do banco. A trilha de atividade registra quem apagou, quando, o id, o tipo e a categoria, e nunca o valor (PR-25); a tela pede confirmação em dois passos (...) | se a família quiser desfazer uma exclusão, uma lixeira, ou se passar a exigir guardar o conteúdo de lançamento apagado. |
| PR-29 (provisória) | **Saldo é do mês escolhido, sem acumulado.** o saldo do mês é a soma das receitas do mês menos a soma das despesas do mês, em centavos inteiros, e pode ser negativo. Conta só o que tem data dentro do mês escolhido (do dia 1 ao último dia (...) | se a família quiser saldo acumulado, saldo inicial, receita aberta por categoria, ou ver o resumo de mais de um mês lado a lado. |
| PR-30 (provisória) | **Forma do cadastro do filho.** o registro do filho tem nome (1 a 80 caracteres, obrigatório), data de nascimento (opcional, dia civil AAAA-MM-DD, não pode ser futura), valor de mesada combinado (obrigatório, inteiro positivo de centavos até R$ 1.000.000,00 (...) | se a família quiser filho sem mesada combinada, outras periodicidades (quinzenal, por tarefa), mais de um responsável por filho, ou o adulto cadastrando filhos. |
| PR-32 (provisória) | **Forma do movimento de mesada e o saldo do filho.** o movimento de mesada pertence a um filho e tem tipo (`credito` ou `gasto`), valor, data e descrição. O valor é um inteiro positivo de centavos (o sinal vem do tipo) (...) | se a família quiser bloquear gasto acima do saldo, mesada gerada sozinha pelo valor combinado, saldo por período, valor acima de R$ 1.000.000,00, data futura proibida, ou mais de uma moeda. |

---

## 4. O que ficou pronto

**Não há pull request aberto.** O repositório não tem remoto, então o que existe são **9 branches locais empilhadas**, uma por feature, cada uma criada em cima da anterior (`feat/ft-01-fundacao` até `feat/ft-09-login-do-filho-em-sincronia`; a `main` tem só o esqueleto inicial). **A ordem de merge é a da tabela**, de cima para baixo. A descrição de PR de cada uma já está pronta em `docs/<slug>/PR.md`, e o pacote de teste manual em `docs/<slug>/QA-PACOTE.md`. Cada feature passou o portão de prontidão da mergex (registrado em `docs/<slug>/ENTREGA.md`, pela mesma sessão que construiu). A suíte inteira (1475 testes, 76 arquivos) eu rodei de novo numa cópia limpa e passou.

| Feature | O que você consegue fazer | Branch (no lugar do PR) | Testes novos |
|---|---|---|---|
| FT-01 Fundação | entrar com e-mail e senha, ver o painel, cadastrar outro usuário, editar o perfil, trocar a senha; português, tema claro e escuro, celular | `feat/ft-01-fundacao` | 112 |
| FT-02 Trilha de atividade | o responsável vê quem fez cada ação auditada, com data e hora (tela Atividade) | `feat/ft-02-trilha-de-atividade` | 77 |
| FT-03 Lançamentos da casa | registrar receitas e despesas com valor, data, categoria e descrição; criar categorias; editar e apagar; cada mudança entra na trilha | `feat/ft-03-lancamentos-da-casa` | 338 |
| FT-04 Saldo e resumo do mês | no painel: receitas, despesas, saldo do mês escolhido e despesas por categoria | `feat/ft-04-saldo-e-resumo-do-mes` | 108 |
| FT-05 Filhos da família | cadastrar filho (nome, mesada combinada, periodicidade) e criar o login dele, que só vê a própria mesada | `feat/ft-05-filhos-da-familia` | 264 |
| FT-06 Mesada dos filhos | registrar créditos e gastos, ver extrato e saldo; o filho consulta o próprio, sem ver o do irmão | `feat/ft-06-mesada-dos-filhos` | 233 |
| FT-07 Privacidade dos dados | baixar todos os dados da família em um arquivo e apagar de verdade a conta de um filho | `feat/ft-07-privacidade-dos-dados` | 131 |
| FT-08 Backup e saúde | gerar e restaurar backup por comando, consultar `/api/saude`, log estruturado descartado após 90 dias | `feat/ft-08-backup-e-saude` | 120 |
| FT-09 Login do filho em sincronia | ao editar o nome do filho, o nome do login muda junto, na mesma transação | `feat/ft-09-login-do-filho-em-sincronia` | 31 |

Os 1475 testes da suíte incluem os 61 que vieram do esqueleto inicial.

**O que a validação exercitou num navegador real, contra o servidor de produção da cópia limpa:** entrar, ver o painel, cadastrar um segundo usuário e entrar com ele, editar o próprio perfil, trocar a senha exigindo a atual, adulto sem o item Usuários e negado no servidor, filho vendo só a própria mesada, exportação só do responsável, `/api/saude`, backup e restauração, tema claro e escuro, e a interface em 390 px de largura.

**O que NÃO foi exercitado num navegador real** (só provado por teste automatizado): lançar despesa e receita pela tela; cadastrar filho e lançar mesada pela tela; editar o nome do filho e ver o login mudar (FT-09); criar e desativar login de filho; apagar a conta de um filho; a tela Atividade; o bloqueio após cinco senhas erradas pela tela; a renovação deslizante da sessão; os estados vazio, carregando e erro vistos na tela; leitor de tela e outros navegadores além do Chrome. E **o CI do GitHub nunca rodou.**

---

## 5. O que não ficou

Nenhuma feature ficou bloqueada. O que não ficou é o que está nas seções 1 e 2, mais:

| O quê | Por quê | O que existe |
|---|---|---|
| Pull requests | sem repositório remoto (PEND-17) | 9 branches locais empilhadas e descrições prontas |
| CI rodando de fato | idem | `.github/workflows/verificar.yml` chama só `npm run verificar`, que passa localmente |
| Backup fora da máquina | sem conta de armazenamento (PEND-16) | backup local, manual |
| README atualizado | a validação achou o README defasado em partes: a abertura ainda fala só da FT-01 e o "Como rodar" usa `npm run setup` (que faz `db push`) em vez das migrations | `README.md` funcional, com o runbook de backup |
| Aviso no build | `npm run build` imprime um aviso de Edge Runtime sobre `process.exit` em `src/instrumentation.ts` (o start com configuração inválida funciona) | sem efeito observado |
| Barra de status em celular | em 390 px os rótulos da barra inferior quebram e ficam cortados | cosmético |

Duas vulnerabilidades `moderate` em ferramenta de teste (`vitest`) permanecem no `npm audit`; nenhuma `high` ou `critical`. As recomendações acima são features novas possíveis; a validação não corrigiu nada.

**Candidatas a módulo:** nenhuma. Nenhuma feature integra terceiro (sem WhatsApp, pagamento, e-mail ou storage externo).

---

## 6. Como rodar

```bash
npm install
export DATABASE_URL="file:./dev.db"
export JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
npm run setup           # prisma generate + db push + seed de demonstração
npm run dev
```

Para rodar como em produção (o caminho que a validação exerceu): `npm ci`, `npx prisma generate`, `npx prisma migrate deploy`, `npm run db:seed`, `npm run build` e `npm run start`. As duas variáveis (`DATABASE_URL`, `JWT_SECRET`) têm de estar definidas, senão o servidor imprime o que falta e encerra com código 1. O modelo de ambiente versionado na raiz do projeto mostra as variáveis; o arquivo real fica fora do git.

**Entre com o usuário de demonstração:**

```
e-mail: responsavel@exemplo.local     senha: demo1234    responsável (admin)
e-mail: adulto@exemplo.local          senha: demo1234    adulto (usuario)
e-mail: ana@exemplo.local             senha: demo1234    filha (filho), mesada semanal
e-mail: pedro@exemplo.local           senha: demo1234    filho (filho), mesada mensal
```

Credenciais fictícias, criadas pela seed, para uso local (documentadas em `README.md`). A seed de demonstração não roda em produção (`NODE_ENV=production` a recusa, com teste). Cada filho entra e vê só a própria mesada; Ana termina com saldo positivo e Pedro com negativo, para mostrar os dois estados.

O sistema abre em `http://localhost:3000` (em desenvolvimento). O tema acompanha a preferência do seu sistema e pode ser alternado na barra inferior. Para abrir por outro endereço que não `localhost`, use HTTPS: o cookie de sessão é `secure` em produção.

**O que já está lá, sem você ter pedido** (padrão P-9):

| Onde | O que dá para fazer |
|---|---|
| Painel | a tela inicial, onde o login desemboca, com o resumo do mês |
| Configurações → Usuários | cadastrar, editar, desativar e dar papel a quem entra: só `admin` vê, e o servidor nega para os outros |
| Meu perfil | trocar o próprio nome e e-mail |
| Meu perfil → Senha | trocar a própria senha, exigindo a atual (as outras sessões caem) |

É por aí que você cria a sua conta de verdade e para de usar a de demonstração.

**Comandos úteis:** `npm run verificar` (lint, tipos, build, testes e auditoria; a suíte leva cerca de quatro minutos), `npm run backup`, `npm run restaurar -- <arquivo>` (com o sistema parado), `npm run log:limpar`, `GET /api/saude`.

---

## 7. O que fazer agora

1. **Revise as decisões da seção 1.** São o que pode ter sido decidido diferente do que você faria. Comece pela PR-01 (mesa = mesada).
2. **Confira as premissas da seção 3** pela coluna *o que invalida*.
3. **Providencie o remoto git (PEND-17), se quiser PRs de verdade:** com ele, as nove branches sobem, o CI roda pela primeira vez, e cada PR leva a descrição já pronta. Sem ele, as branches continuam locais.
4. **Revise as branches, na ordem da seção 4, e decida o merge.** Elas estão verdes e descritas, mas **integrar código é decisão sua**, e é a última rede antes de produção. O buildx não fez merge de nada e não vai fazer. (Os documentos desta etapa final, `RECURSAO.md`, `VALIDACAO.md` e `RELATORIO.md`, estão no diretório de trabalho, ainda sem commit.)
5. Antes de usar de verdade, troque a senha do responsável de demonstração ou crie a sua conta em Configurações → Usuários, e guarde os backups com cuidado.

---

## Onde está tudo

| Arquivo | Conteúdo |
|---|---|
| `docs/projeto/PROJETO.md` | o escopo completo, com sua descrição original |
| `docs/projeto/PREMISSAS.md` | toda decisão tomada em seu nome |
| `docs/projeto/MAPA.md` | as features e o estado de cada uma |
| `docs/projeto/RECURSAO.md` | as pendências, classificadas (PEND-01 a PEND-20) |
| `docs/projeto/VALIDACAO.md` | a conferência item a item, com arquivo e teste |
| `docs/stack/CONVENCOES.md` | as convenções técnicas do projeto |
| `docs/<slug>/` | o plano, as decisões, o QA e a descrição de PR de cada feature |

O método Expx está instalado neste projeto. Daqui em diante: `/sprintx` para feature nova, `/runx` para defeito, `/mergex` para entregar.
