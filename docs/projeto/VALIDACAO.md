---
expx_schema: 1
expx_tool: buildx
kind: validacao
projeto_id: financas-da-familia
data: 2026-10-28
veredito: aprovado_com_pendencia
itens_conferidos: 75
itens_atendidos: 57
itens_parciais: 11
itens_nao_atendidos: 0
itens_descartados: 7
sobe_em_maquina_limpa: true
premissas_de_seguranca_sem_codigo: 0
---

# Finanças da Família — Validação

Conferência do construído contra o `PROJETO.md`. **Confere, não conserta.** Nenhum arquivo de código, teste, schema ou `package.json` foi tocado nesta etapa. Branch validada: `feat/ft-09-login-do-filho-em-sincronia` (a pilha completa das nove features).

## Veredito

**APROVADO COM PENDÊNCIA**

O sistema sobe numa cópia limpa, o esqueleto do P-9 responde de ponta a ponta e as 1475 provas da suíte passam. Nenhuma das 16 premissas de segurança ficou sem código ou sem teste que tente violá-la.
Os 11 itens `parcial` têm uma única causa, já declarada: o PEND-17 (sem remoto git, não existe PR aberto e o fluxo de CI nunca rodou). Não há item `nao_atendido` e nenhum `parcial` fora do `RECURSAO.md`.

---

## O sistema de pé

Cópia limpa: `git clone --branch feat/ft-09-login-do-filho-em-sincronia` para um diretório novo em `/private/tmp`, com `DATABASE_URL` e `JWT_SECRET` de teste exportados na hora. A cópia e o servidor foram apagados ao final.

| Verificação | Resultado |
|---|---|
| dependências instalam | ok: `npm ci`, 552 pacotes, `exit 0` (2 avisos `moderate`, ver adiante) |
| migrations rodam do zero | ok: `prisma migrate deploy`, as 5 migrations aplicadas num banco vazio |
| seed de demonstração roda | ok: `npm run db:seed` cria 4 contas fictícias, lançamentos e mesada |
| o projeto sobe | ok: `npm run build` conclui (17 páginas) e `next start -p 4317` atende; `GET /api/saude` devolve `200 {"status":"ok","banco":"ok"}` |
| usuário de demonstração entra | ok: `responsavel@exemplo.local` cai no painel "Painel da família", com receitas R$ 5.550,00, despesas R$ 3.024,75 e saldo R$ 2.525,25 |
| as duas variantes de tema alternam e ficam completas | ok em navegador real (botão da barra de status trocou `data-theme` para `light`, fundo branco, ambos legíveis); `tokens.css` tem as variantes claro (linha 67) e sistema (linha 110) redefinindo todo token de cor do escuro (comparação dos nomes: só sobram tokens de tipografia e medida) |
| funciona em largura de celular | ok com ressalva: a janela do navegador não redimensionou, então o painel e a lista de Filhos foram carregados num quadro de 390 px de largura (as media queries do quadro valem para a largura dele): gaveta "☰ Menu", cartões em coluna única, sem rolagem horizontal. Ressalva cosmética: o rótulo da barra de status ("Responsável de demonstração", "Claro") quebra em duas linhas e fica cortado |
| `npm run verificar` | passou, `exit 0`: lint, tipos, build, `Test Files 76 passed (76)`, `Tests 1475 passed (1475)`, `Duration 233.98s`, e a auditoria no fim |
| `npm audit --audit-level=high` | `exit 0`. Literal: "2 moderate severity vulnerabilities" (`@vitest/mocker <=4.1.11` e `vitest`, injeção de código em registro manual de mock; só ferramenta de teste, declarado no PR-20). Zero `high` ou `critical` |

### Esqueleto de aplicação (P-9) exercitado no navegador, contra o servidor de produção

| Passo | Resultado |
|---|---|
| entrar como responsável, ver o painel (E-1) | ok, título e subtítulo próprios |
| Configurações → Usuários, cadastrar o 2º usuário (E-2) | ok, "Usuário criado."; ele aparece na lista como Adulto |
| entrar com o 2º usuário | ok, cai no painel |
| editar o próprio nome e e-mail em Meu perfil (E-3) | ok, "Perfil atualizado." |
| trocar a própria senha exigindo a atual (E-4) | ok: com a senha atual errada, "A senha atual está incorreta."; com a certa, "Senha alterada. As outras sessões foram encerradas." Saiu e entrou de novo com o e-mail novo e a senha nova: ok |
| adulto: "Usuários" some da navegação | ok: o menu do adulto tem só Painel, Lançamentos, Categorias e Meu perfil |
| adulto: a rota nega no servidor | ok: o pedido a `/configuracoes/usuarios`, `/filhos`, `/privacidade`, `/atividade` e `/mesada` volta sem o conteúdo (a resposta streamada traz o redirecionamento para `/`; o corpo não contém "Novo usuário"); `POST /api/privacidade/exportar` devolve 403 |
| filho (Ana): só a própria mesada | ok: o menu tem Painel, Minha mesada e Meu perfil; `/mesada` traz "Ana" e não traz "Pedro"; `/filhos`, `/privacidade`, `/usuarios`, `/lancamentos` e `/atividade` não entregam conteúdo; exportação devolve 403 |
| exportação de privacidade só admin | ok: responsável `POST` 200, JSON com `versao_do_formato`, 12.917 bytes, sem nenhum `$2a$/$2b$` (hash); adulto e filho 403; `GET` 405 |
| `GET /api/saude` | ok, 200 com corpo fixo de duas chaves, `no-store`, sem sessão |
| backup e restaurar | ok com o sistema parado: `npm run backup` gerou `backups/backup-2026-10-28-212322.db` (pasta 0700, arquivo 0600); apaguei todos os movimentos de mesada (0 linhas), `npm run restaurar -- <arquivo>` devolveu as 10 linhas e guardou o banco anterior em `antes-da-restauracao-...db`; um arquivo que não é SQLite foi recusado com "não é um banco SQLite" |
| configuração inválida derruba o start | ok: sem `JWT_SECRET`, o servidor imprime "JWT_SECRET ausente" e encerra |

### O que não foi exercitado em navegador real

Nada foi inventado: o que segue só tem prova de teste automatizado, não de olho humano.

- Lançar uma despesa e uma receita pela tela e ver o saldo mudar (o painel foi visto com os dados da seed; a criação é coberta por `tests/lancamentos.test.ts` e `tests/resumo.test.ts`).
- Cadastrar filho, registrar crédito e gasto de mesada, editar e apagar movimento pela tela, extrato paginado do filho.
- Editar o nome de um filho e ver o nome do login mudar (FT-09), criar e desativar login de filho.
- Apagar a conta de um filho (FT-07), tela Atividade.
- Bloqueio de login após cinco senhas erradas pela tela (provado em `tests/autenticacao.test.ts:142`, não pelo navegador).
- Renovação deslizante da sessão com a aba aberta por mais de 7,5 minutos.
- Estados vazio, carregando e erro vistos na tela (provados por `tests/estados.test.ts` e pelos testes de tela).
- Leitura de leitor de tela, impressão e qualquer navegador além do Chrome.
- O fluxo do GitHub Actions: **nunca rodou** (sem remoto).

### Achados do sistema de pé

1. **Aviso de build.** `next build` termina bem, mas imprime "A Node.js API is used (process.exit)... not supported in the Edge Runtime" em `src/instrumentation.ts:18`. O gancho tem a guarda `NEXT_RUNTIME !== 'nodejs'` e o teste `tests/ambiente-start.test.ts:102` mais a execução manual acima provam que o start falha como deveria. Aviso sem efeito observado, mas um `npm run build` que parece barulhento.
2. **Cookie `secure` em produção.** `src/lib/sessao.ts:57` liga `secure` quando `NODE_ENV=production`. Em `localhost` o Chrome aceita; abrir o sistema por outro endereço de rede local em `http://` fará o login "não pegar" sem mensagem. É a invalidação já escrita no PR-12 ("exposto sem HTTPS"); o relatório avisa.
3. **README defasado em partes.** A abertura ainda diz "Esta é a fundação (FT-01)", e o "Como rodar" usa `npm run setup` (`db push`), não as migrations versionadas; as migrations rodam do zero (confirmado), mas o caminho documentado não é o que o PR-13 descreve.
4. **A suíte leva cerca de quatro minutos** (233,98 s); o `verificar` inteiro passa dos quatro. Os `ENTREGA.md` registram que a classificação e a auditoria de cada feature foram feitas pela mesma sessão que construiu (declarado por eles mesmos); esta validação é a primeira conferência independente.

---

## Conferência — o que foi pedido

| Item | Conclusão | Evidência |
|---|---|---|
| Registrar as finanças da casa (receitas e despesas) | atendido | `src/servicos/lancamentos.ts:178` (`criarLancamento`), `:227` editar, `:282` apagar; `prisma/schema.prisma` (Lancamento, Categoria); testes `tests/lancamentos.test.ts:37`, `tests/lancamentos-edicao.test.ts:47`, `tests/categorias.test.ts:25` |
| Controlar a mesada dos filhos | atendido | `src/servicos/mesada.ts:116` (`registrarMovimento`), `:285` (`extratoDoFilho`), `:319` (`meuExtrato`); `src/servicos/filhos.ts:120` (`cadastrarFilho`); testes `tests/mesada-saldo.test.ts:25`, `tests/filhos.test.ts:28`, `tests/mesada-isolamento.test.ts:53` |
| Servir a uma família com mais de uma pessoa | atendido | papéis `admin`, `usuario`, `filho` (`src/servicos/autenticacao.ts:127-153`), `src/servicos/usuarios.ts:61` (`criar`); teste `tests/usuarios.test.ts:41` e a conferência de navegador acima |

## Conferência — o que foi descoberto

| Item | Premissa | Conclusão | Evidência |
|---|---|---|---|
| L1, L3, L4 login e sessão com expiração | PR-05, PR-12 | atendido | `src/lib/sessao.ts:16-33` (JWT HS256 com expiração), `:52-62` (cookie), `src/servicos/autenticacao.ts:49`; `tests/autenticacao.test.ts:19-117`, `tests/seguranca-base.test.ts:38` |
| L2 papéis verificados no servidor | PR-06 | atendido | `src/servicos/autenticacao.ts:127-160`, guarda em todo serviço (ex.: `mesada.ts:121`); `tests/papel-filho.test.ts:52`, `tests/mesada-papeis.test.ts:44`, `tests/filhos-papeis.test.ts:43`, `tests/rotas.test.ts:207` |
| L5 a L9 validação, segredo, cookie, limite, auditoria de dependência | PR-12 | atendido | zod em todo serviço (ex.: `lancamentos.ts:120`, `usuarios.ts:21`), `src/lib/ambiente.ts:33`, `src/lib/limite-de-tentativas.ts:19`; `tests/seguranca-base.test.ts:38-109`, `tests/limite-de-tentativas.test.ts:24`; `npm audit` sem high |
| L10, L11 dado de menor, exclusão e exportação | PR-09 | atendido | `src/servicos/privacidade.ts:52` e `:228`; `tests/privacidade-exportacao.test.ts`, `tests/privacidade-exclusao.test.ts:53`, `tests/privacidade-rota.test.ts:45` |
| L12 trilha de auditoria | PR-10 | atendido | `src/servicos/atividade.ts:75` chamado dentro de `$transaction` em lançamento, mesada, filho, usuário; `tests/atividade.test.ts:21`, `tests/lancamentos-edicao.test.ts:123` |
| L13 retenção declarada | PR-11 | atendido | `src/lib/log-arquivo.ts:8` (`RETENCAO_DIAS = 90`), `:49`; `tests/log-retencao.test.ts:56` ("guarda 90, apaga 91") |
| L14, L15 backup restaurável e migrations | PR-13 | atendido | `src/lib/backup.ts:85`, `src/lib/restauracao.ts:47/95`, `prisma/migrations` (5); `tests/backup-ponta-a-ponta.test.ts:38`, `tests/restauracao.test.ts`; exercitado na cópia limpa |
| L16 a L21 log, erro sem pilha, saúde, config que falha no start, comando para subir | PR-14 | atendido | `src/lib/log.ts:46`, `src/lib/erros.ts:45-51`, `src/app/api/saude/route.ts`, `src/instrumentation.ts:10`; `tests/log.test.ts:87`, `tests/erro-sem-pilha.test.ts:60`, `tests/saude-rotas.test.ts:35`, `tests/ambiente-start.test.ts:102` |
| L22 a L25 TDD, lint, pipeline, seed | PR-15, PR-04 | parcial | `npm run verificar` passa na cópia limpa e a seed roda e tem guarda de produção (`prisma/demonstracao.ts:57`, `tests/demonstracao.test.ts:291`), mas `.github/workflows/verificar.yml` nunca rodou em serviço: PEND-17 |
| L26 a L30 design VS Code, dois temas, celular, três estados | PR-07, PR-08, PR-16 | atendido | `src/estilos/tokens.css:6/67/110`, `src/app/(sistema)/loading.tsx`, `error.tsx`, `src/componentes/EstadoDeCarregando.tsx`, `EstadoDeErro.tsx`; `tests/tema.test.ts:34-83`, `tests/estados.test.ts:25-80`; olhado no navegador (escuro, claro, 390 px) |
| L32 a L34 esqueleto (painel, usuários, perfil, senha) | PR-03, PR-17 | atendido | `src/app/(sistema)/{page,configuracoes/usuarios/page,perfil/page,perfil/senha/page}.tsx`, `src/servicos/perfil.ts:36/72`; `tests/perfil.test.ts:10-181`, `tests/rotas.test.ts:167-233`; passo a passo exercitado no navegador |
| Dinheiro em centavos inteiros, BRL | PR-02 | atendido | `src/lib/dinheiro.ts:7/19`, `prisma/schema.prisma` (inteiros); `tests/dinheiro.test.ts:124` (sem ponto flutuante), `tests/mesada-saldo.test.ts:25` |

## Conferência — critérios de aceite de negócio

| Critério | Conclusão | Evidência |
|---|---|---|
| Responsável entra, lança despesa e receita e vê o saldo do mês refletir | atendido | `tests/lancamentos.test.ts:37`, `tests/resumo.test.ts:28` (soma por inteiros), `tests/resumo-tela.test.ts`; painel visto no navegador com os dados da seed (a criação pela tela não foi exercitada) |
| Responsável cadastra filho, registra crédito e gasto, vê o saldo certo | atendido | `tests/filhos.test.ts:28`, `tests/mesada-saldo.test.ts:25/49`, `tests/mesada-acoes.test.ts`; saldo de Ana (positivo) e Pedro (negativo) visto na lista de Filhos |
| Filho vê só o próprio extrato, sem alterar nem ver o do irmão | atendido | `tests/mesada-isolamento.test.ts:53-131`, `tests/mesada-papeis.test.ts:44`; no navegador `/mesada` da Ana traz Ana e não Pedro, e as rotas do responsável não entregam conteúdo |
| Corrigir ou apagar lançamento deixa registro de quem e quando | atendido | `src/servicos/lancamentos.ts:264/293`; `tests/lancamentos-edicao.test.ts:47/123/157` (se a trilha falha, a edição não acontece) |
| Adulto vê e lança despesas, não gerencia usuários | atendido | `src/servicos/autenticacao.ts:140`, `src/servicos/usuarios.ts:54/65`; `tests/lancamentos-papeis.test.ts:49`, `tests/usuarios.test.ts:16-32`, `tests/rotas.test.ts:207/226`; exercitado no navegador |
| A família restaura os dados a partir de um backup | atendido | `tests/backup-ponta-a-ponta.test.ts:38`; exercitado na cópia limpa (apagar, restaurar, 10 linhas de volta) |

## Conferência — premissas

Segurança primeiro. Todas conferidas abrindo o código e o teste, sem confiar em "Realizada em".

| Premissa | Feature | Conclusão | Evidência |
|---|---|---|---|
| PR-05 autenticação própria, JWT em cookie httpOnly | FT-01 | atendido | `src/lib/sessao.ts:16-62`; `tests/seguranca-base.test.ts:38`, `tests/autenticacao.test.ts:87` (token de outro segredo é recusado), `:117` |
| PR-06 papéis, checagem no servidor | FT-05 | atendido | `src/servicos/autenticacao.ts:127-160`; `tests/papel-filho.test.ts:52-148`, `tests/privacidade-rota.test.ts:123` (token com papel admin forjado continua negado: o papel vem do banco) |
| PR-12 segurança de base | FT-01 | atendido | `src/lib/senha.ts:7` (bcrypt), zod nos serviços, `src/lib/ambiente.ts`; `tests/seguranca-base.test.ts:85` (hash, nunca em claro), `:97/103/109` (modelo de ambiente sem valor, segredo fora do git, sem SQL cru), `tests/usuarios.test.ts:104-111` |
| PR-21 renovação deslizante | FT-01 | atendido | `src/servicos/autenticacao.ts:118`, `src/app/api/sessao/renovar/route.ts`, `src/lib/renovacao.ts:5`; `tests/renovacao.test.ts:40/51/60` (rebaixado, desativado e pós-troca de senha não ressuscitam) |
| PR-22 limite de tentativas de login | FT-01 | atendido | `src/lib/limite-de-tentativas.ts:19`, `src/servicos/autenticacao.ts:30/59`; `tests/autenticacao.test.ts:142-182` (sexta tentativa 429 mesmo com a senha certa; caixa e espaços não escapam), `tests/limite-de-tentativas.test.ts:24` |
| PR-09 dado de menor e LGPD | FT-07 | atendido | `src/servicos/privacidade.ts:52/228`, `src/lib/privacidade.ts:26` (campos proibidos); `tests/privacidade-exportacao.test.ts`, `tests/privacidade-exclusao.test.ts:53/203/222` |
| PR-31 login do filho ligado ao registro | FT-05 | atendido | `src/servicos/filhos.ts:230/284`; `tests/filhos-login.test.ts:56/88/155`, `tests/papel-filho.test.ts:119-148` (a tela Usuários não cria nem muda para filho) |
| PR-33 quem mexe na mesada, vínculo com o filho | FT-06 | atendido | `src/servicos/mesada.ts:121-323`, `prisma/schema.prisma:127` (Cascade); `tests/mesada-papeis.test.ts:34-95`, `tests/mesada-isolamento.test.ts:87` (403 igual para id do irmão e id inexistente) |
| PR-34 forma da exportação | FT-07 | atendido | `src/app/api/privacidade/exportar/route.ts`, `src/lib/privacidade.ts:14/40`; `tests/privacidade-rota.test.ts:45-123` (401, 403 adulto e filho, GET 405); exercitado no navegador |
| PR-35 exclusão da conta do filho | FT-07 | atendido | `src/servicos/privacidade.ts:228-260`; `tests/privacidade-exclusao.test.ts:110/124/203/222/233` (nome digitado, transação, token antigo morre) |
| PR-36 forma do log e erro sem pilha | FT-08 | atendido | `src/lib/log.ts:46-103`, `src/lib/chaves-proibidas.ts:8-12`, `src/lib/erros.ts:37-51`; `tests/log.test.ts:87/125`, `tests/erro-sem-pilha.test.ts:60/85` |
| PR-37 backup e restauração | FT-08 | atendido | `src/lib/backup.ts:61-85`, `src/lib/restauracao.ts:47-95`; `tests/backup.test.ts:76` (0700/0600), `tests/restauracao.test.ts:95/118/150`, `tests/backup-ponta-a-ponta.test.ts:38`; exercitado |
| PR-38 saúde e configuração que falha no start | FT-08 | atendido | `src/servicos/saude.ts:34`, `src/app/api/saude/route.ts`, `src/instrumentation.ts:10`; `tests/saude.test.ts:22/48/71`, `tests/saude-rotas.test.ts:35/42`, `tests/ambiente-start.test.ts:102`; exercitado |
| PR-39 login do filho acompanha o nome | FT-09 | atendido | `src/servicos/filhos.ts:185-210` (mesma transação; compara com o nome atual do usuário); `tests/filhos-sincronia.test.ts:34-123`, `tests/filhos-sincronia-trilha.test.ts:35/47/93` (atomicidade e trilha sem e-mail). Não exercitado no navegador |
| PR-10 trilha de auditoria | FT-02 | atendido | `src/servicos/atividade.ts:75`; `tests/atividade.test.ts:21/66/95` |
| PR-25 forma do registro de atividade | FT-02 | atendido | `src/servicos/atividade.ts:75`, `src/lib/chaves-proibidas.ts:8`; `tests/atividade.test.ts:95/115`, `tests/atividade-dados.test.ts` |
| PR-01 modo e leitura de "mesa" como mesada | FT-06 | atendido | `src/servicos/mesada.ts` e a tela Minha mesada; testes `tests/mesada-*.test.ts` (provisória, PEND-06 a PEND-09 abertas) |
| PR-02 dinheiro em centavos | FT-03 | atendido | `src/lib/dinheiro.ts:7/19`; `tests/dinheiro.test.ts:124`, `tests/mesada-saldo.test.ts:25` |
| PR-03 esqueleto P-9 | FT-01 | atendido | páginas de painel, usuários, perfil, senha; `tests/rotas.test.ts:167-233`; exercitado |
| PR-04 usuário de demonstração | FT-01 | atendido | `prisma/demonstracao.ts:14-57`, `README.md:84-87`; `tests/demonstracao.test.ts:21/291`; exercitado |
| PR-07 design system do VS Code | FT-01 | atendido | `src/estilos/tokens.css`; `tests/tema.test.ts:30-61` (sem cor por extenso: grep confirma zero cor literal em `src/**/*.ts(x)` e em `global.css`) |
| PR-08 skill de frontend design | FT-04 | descartado | decisão de processo (qual skill o construtor usou); não é verificável no repositório. O resultado visual está sob os tokens do PR-07 (provado em PR-07) |
| PR-11 retenção | FT-08 | atendido | `src/lib/log-arquivo.ts:8/49`; `tests/log-retencao.test.ts:56` |
| PR-13 backup e migrations | FT-08 | atendido | `src/lib/backup.ts`, `src/lib/restauracao.ts`, `prisma/migrations/*`; `tests/backup-ponta-a-ponta.test.ts:38`; migrations rodaram do zero na cópia limpa |
| PR-14 operação mínima | FT-08 | atendido | ver L16 a L21 |
| PR-15 qualidade | FT-01 | atendido | `package.json` (script `verificar`), `tests/qualidade.test.ts:20-65`; `npm run verificar` verde na cópia limpa |
| PR-16 idioma, fuso, celular | FT-01 | atendido | `src/lib/datas.ts:60`, `src/estilos/global.css` (gaveta abaixo de 768 px); `tests/datas.test.ts`, `tests/tema.test.ts:77/83`, `tests/gaveta.test.ts`; visto em 390 px |
| PR-17 template como esqueleto, três camadas | FT-01 | atendido | `tests/camadas.test.ts:13-63` (checa a direção dos imports no código real e prova que sabe apontar violação) |
| PR-18 uma família por instalação | FT-01 | atendido | `prisma/schema.prisma` sem entidade de família ou tenant; `tests/convencoes.test.ts` |
| PR-19 suíte Expx instalada | FT-01 | atendido | `.expx/expx-lock.json`, `.claude/`; processo, sem teste de comportamento |
| PR-20 dependências atualizadas | FT-01 | atendido | `package.json` (versões fixas e `overrides`); `npm audit --audit-level=high` com `exit 0` na cópia limpa |
| PR-23 pipeline independente de plataforma | FT-01 | parcial | `npm run verificar` existe e passa; `.github/workflows/verificar.yml` só chama esse comando, mas nunca rodou em serviço (sem remoto): PEND-17 |
| PR-24 branch por feature, sem worktree | FT-01 | atendido | `git branch`: nove branches `feat/ft-NN-*`, histórico linear (91 commits na última), `main` com 2 |
| PR-26 forma do lançamento | FT-03 | atendido | `src/servicos/lancamentos.ts:120`, `src/lib/dinheiro.ts:19`; `tests/lancamentos.test.ts:37/117/166`, `tests/dinheiro.test.ts` |
| PR-27 categorias de lançamento | FT-03 | atendido | `src/servicos/lancamentos.ts:56-100`, schema (`onDelete: Restrict`); `tests/categorias.test.ts:25/63/97` (provisória, PEND-01) |
| PR-28 apagar lançamento é definitivo | FT-03 | atendido | `src/servicos/lancamentos.ts:282`; `tests/lancamentos-edicao.test.ts:157/189` (provisória, PEND-02) |
| PR-29 saldo do mês sem acumulado | FT-04 | atendido | `src/servicos/resumo.ts:56`, `src/lib/datas.ts:95`; `tests/resumo.test.ts:28/128/168/204` (provisória, PEND-03) |
| PR-30 forma do cadastro do filho | FT-05 | atendido | `src/servicos/filhos.ts:25-155`; `tests/filhos.test.ts:28/63/88/109` (provisória, PEND-04) |
| PR-32 forma do movimento e saldo | FT-06 | atendido | `src/servicos/mesada.ts:48-116/297`; `tests/mesada-saldo.test.ts:25/49/86`, `tests/mesada-dados.test.ts` (provisória, PEND-06 e PEND-07) |

## Conferência — features

"PR" é a coluna do método (PR aberto). Não existe PR: são nove branches locais, sem remoto. Por isso cada feature é `parcial`, e a causa é a mesma, declarada no PEND-17. Suíte e portão da mergex estão verdes.

| ID | PR | Suíte | mergex-check | Conclusão |
|---|---|---|---|---|
| FT-01 | — (`feat/ft-01-fundacao`) | verde (173 na época) | pronto (`docs/fundacao/ENTREGA.md`) | parcial |
| FT-02 | — (`feat/ft-02-trilha-de-atividade`) | verde (250) | pronto | parcial |
| FT-03 | — (`feat/ft-03-lancamentos-da-casa`) | verde (588) | pronto | parcial |
| FT-04 | — (`feat/ft-04-saldo-e-resumo-do-mes`) | verde (696) | pronto | parcial |
| FT-05 | — (`feat/ft-05-filhos-da-familia`) | verde (960) | pronto | parcial |
| FT-06 | — (`feat/ft-06-mesada-dos-filhos`) | verde (1193) | pronto | parcial |
| FT-07 | — (`feat/ft-07-privacidade-dos-dados`) | verde (1324) | pronto | parcial |
| FT-08 | — (`feat/ft-08-backup-e-saude`) | verde (1444) | pronto | parcial |
| FT-09 | — (`feat/ft-09-login-do-filho-em-sincronia`) | verde: 1475 de 1475, medido por mim na cópia limpa | pronto | parcial |

Nota: o `mergex-check` é o que os `ENTREGA.md` registram (rodado pela sessão construtora); eu não o rodei de novo. A suíte final de 1475 eu rodei.

## Considerado e descartado pelo B1

| Item | Conclusão | Evidência |
|---|---|---|
| L19 métrica e rastreamento | descartado | `PROJETO.md`, "Considerado e descartado": sistema doméstico |
| L31 internacionalização | descartado | idem: um idioma, BRL, fuso de São Paulo (PR-16) |
| Multi-tenant | descartado | idem (PR-18); schema sem tenant |
| SSO, OAuth, login externo | descartado | idem (PR-05); nenhuma dependência de provedor em `package.json` |
| Integração bancária automática | descartado | idem; nenhuma integração de terceiro no código |
| Alta disponibilidade e réplica | descartado | idem; o backup restaurável cobre o risco real |

---

## Itens não atendidos

Nenhum item `nao_atendido`. Os onze `parcial` têm a mesma origem:

| Item | Por quê | Destino |
|---|---|---|
| FT-01 a FT-09 (sem PR aberto), PR-23, "L22 a L25" (CI nunca rodou) | não há repositório remoto; o usuário disse que os PRs podem ficar locais por enquanto | pendência declarada: PEND-17 (`recurso_externo`) |

Pendências abertas que **não** são item do projeto e não rebaixam o veredito: PEND-01 a PEND-15, PEND-19 e PEND-20 (`decisao_humana`, regra de negócio que a descrição não traz, com a opção mais simples e segura em uso) e PEND-16 e PEND-17 (`recurso_externo`). Nenhuma é premissa de segurança sem código.

Itens resolvíveis, não atendidos e **fora** do `RECURSAO.md`: nenhum encontrado. Recomendações de feature nova (o B6 não corrige), todas opcionais e pequenas:

1. Atualizar o README: a abertura ainda descreve só a FT-01 e o "Como rodar" não cita as migrations nem a FT-08/FT-09 no resumo.
2. Mover a falha de configuração do start para um ponto que não gere o aviso de Edge Runtime no build.
3. Texto de ajuda sobre HTTPS na tela de entrada, ou aviso no README, para o caso do cookie `secure` em endereço `http://` fora de `localhost`.
4. Revisar a barra de status em 390 px (rótulos quebram e ficam cortados).

## Estados de tela, cor literal, camadas e segredos

- **Estados:** carregando (`src/app/(sistema)/loading.tsx` e `EstadoDeCarregando.tsx`, `tests/estados.test.ts:25`), erro (`error.tsx` na raiz e no grupo, sem mensagem nem pilha, com código de correlação, `tests/estados.test.ts:37-67`), não encontrado (`:80`) e vazio (por tela: `tests/filhos-tela.test.ts:62`, `tests/mesada-tela.test.ts:90`, `tests/atividade-tela.test.ts:113`).
- **Cor literal:** `grep` por `#hex`, `rgb(`, `hsl(` em `src/**/*.ts(x)` e `src/estilos/global.css`: zero ocorrência; `tests/tema.test.ts:57-68` faz a mesma varredura e prova que ela discrimina.
- **Camadas:** `tests/camadas.test.ts` existe e cobre: roda sobre o código real (`:13`) e prova que aponta componente que importa o cliente do Prisma, serviço que importa apresentação e lib que importa serviço (`:30/47`), sem falso positivo (`:63`).
- **Segredos no diff:** nenhum arquivo de segredo, banco, backup ou log versionado (`git ls-files`); modelo de ambiente com `JWT_SECRET=""`; os testes e o CI geram o segredo na hora; os únicos valores com cara de chave nos arquivos versionados são fixtures da própria ferramenta Expx em `.expx/marketplace/` (exemplos de teste de hook, não do projeto). As credenciais da seed (`*@exemplo.local` / `demo1234`) são fictícias e estão documentadas em `README.md:84-87`.

## Passo 4.a — Candidatas a módulo

Nenhuma feature integra terceiro (sem WhatsApp, pagamento, e-mail ou storage externo; todas com `modulo_disponivel: -`), então não há candidata a extração com `/modulex-extrair`.

---

<!--
O QUE CONTA COMO EVIDÊNCIA

  funcionalidade  → o arquivo que implementa E o teste que verifica.
                    Código sem teste é PARCIAL, nunca atendido.
  premissa de     → o código que a realiza, e o teste que prova que a
  segurança         proteção funciona. Verificação de permissão sem teste
                    que tente violá-la não é evidência.
  feature         → PR aberto, suíte verde, mergex-check PRONTO.
  interface       → as duas variantes completas, os tres estados de tela
                    tratados, responsivo, e nenhuma cor literal em componente.
                    Aqui vale abrir a aplicacao e olhar.
-->
