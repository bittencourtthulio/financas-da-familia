---
expx-schema: v1
skill: stackx
documento: convencoes
gerado-em: 2026-10-28
commit-referencia: e83574e
projeto-legado: nao
---

# Convenções técnicas — financas-da-familia

> **Revisão depois da primeira feature (FT-01).** O stackx-detectar varreu o
> código real e converteu em evidência `arquivo:linha` as regras que o B2 tinha
> apenas prescrito. Sobraram só as regras cuja primeira evidência nasce em
> outra feature; cada uma diz qual (`evidência na FT-NN`) e
> `tests/convencoes.test.ts` confere que nenhuma citação aponta para linha que
> não existe. Uma regra foi contradita pelo código e corrigida (ver seção 5).

## 1. Identidade técnica

| Item | Valor | Origem |
| ---- | ----- | ------ |
| Linguagem | TypeScript estrito (5.9.3) | `tsconfig.json:11`, `package.json:47` |
| Runtime | Node.js 22 (22.23.3 na máquina de build) | `.github/workflows/verificar.yml:17` |
| Gerenciador de pacotes | npm, lock versionado, versões exatas no manifesto | `package-lock.json`, `tests/qualidade.test.ts:37` |
| Framework | Next.js 16.4.3, App Router, React 19.2.8 | `package.json:33` |
| Banco | SQLite via Prisma 7.10.1 com adaptador better-sqlite3; `better-sqlite3` 12.11.1 declarado direto, para o backup | `prisma/schema.prisma:10`, `src/lib/prisma.ts:13`, `package.json:30` |

**Evidência:** `tsconfig.json:11`, `package.json:33`, `prisma/schema.prisma:10`, `src/lib/prisma.ts:13`

---

## 2. Comandos que funcionam de verdade

| Alvo | Comando | Origem |
| ---- | ------- | ------ |
| Suíte inteira | `npm test` | `package.json:13` |
| Um teste só | `npx vitest run tests/estados.test.ts` | `vitest.config.ts:7` |
| Com cobertura | — (LACUNA) | ver `docs/stack/LACUNAS.md`, L-02 |
| Lint | `npm run lint` | `package.json:10` |
| Formatador | — (LACUNA) | ver `docs/stack/LACUNAS.md`, L-03 |
| Type check | `npm run typecheck` | `package.json:11` |
| Build | `npm run build` | `package.json:8` |
| Subir ambiente local | `npm run dev` | `package.json:7` |
| Preparar banco | `npm run setup` | `package.json:18` |
| Gerar backup do banco | `npm run backup` | `package.json:19` |
| Restaurar um backup | `npm run restaurar -- <arquivo>` | `package.json:20` |
| Descartar logs com mais de 90 dias | `npm run log:limpar` | `package.json:21` |
| Verificação completa | `npm run verificar` | `package.json:12` |
| Auditoria de dependência | `npm audit --audit-level=high` | `package.json:12` |

Variáveis exigidas: `DATABASE_URL` e `JWT_SECRET` (modelo no arquivo de exemplo de ambiente versionado). O teste de rotas serve o build: rode `npm run build` antes de `npm test` quando a mudança altera HTML.

**Evidência:** `package.json:7`, `package.json:12`, `package.json:13`, `vitest.config.ts:7`

---

## 3. Testes

| Item | Convenção |
| ---- | --------- |
| Onde o arquivo mora | `tests/`, plano (sem subpastas) — `vitest.config.ts:7` |
| Nome do arquivo | `<assunto>.test.ts`, em português — `tests/usuarios.test.ts:1` |
| Nome do caso | frase em português no `it('...')` — `tests/usuarios.test.ts:10` |
| Runner e versão | Vitest 4.1.11, ambiente node — `package.json:48` |
| Biblioteca de asserção | `expect` do próprio Vitest |
| Montagem de dado | funções de ajuda — `tests/ajuda.ts:10` (`criarUsuario`, `criarAdmin`) |
| Marcação de teste lento | timeout global de 30 s e do gancho de 180 s — `vitest.config.ts:9` |
| Paralelismo do runner | desligado entre arquivos — `vitest.config.ts:14` |

**Teste exemplar:** `tests/usuarios.test.ts` — é a forma que o teste de serviço novo copia: `beforeEach(limparBanco)` (linha 7), um `describe` por assunto, casos que afirmam status e mensagem do `ErroDeAplicacao`.

**Estrutura típica.** Arranjo com `criarUsuario()`, ação chamando o serviço real, asserção sobre o resultado e sobre o banco. Testes de interface usam o harness `tests/renderizar.ts:8` (renderização para HTML sem navegador); testes de leitura de código usam `tests/ajuda-estatica.ts` (camadas, tokens, versões).

**O que se mocka e o que fica real**

| Eixo | Tratamento | Evidência |
| ---- | ---------- | --------- |
| HTTP de saída | não existe no projeto | — |
| HTTP de entrada | real: o teste de rotas sobe `next start` e faz `fetch` | `tests/rotas.test.ts:108` |
| Relógio | injetado por parâmetro nos componentes que dependem dele | `src/lib/limite-de-tentativas.ts:19` |
| Sistema de arquivos | diretório temporário criado e apagado no próprio teste | `tests/camadas.test.ts:21` |
| Fila / mensageria | não existe no projeto | — |
| Serviço externo | não existe no projeto | — |

**Evidência:** `tests/usuarios.test.ts:7`, `tests/ajuda.ts:10`, `tests/rotas.test.ts:108`, `vitest.config.ts:14`

---

## 4. Banco de dados em teste

| Item | Valor |
| ---- | ----- |
| Engine e versão | SQLite (arquivo), `prisma/schema.prisma:10` |
| ORM / camada de acesso | Prisma 7.10.1, `src/lib/prisma.ts:13` |
| **Isolamento entre testes** | arquivo SQLite próprio (`prisma/test.db`), recriado por arquivo de teste, com as migrations reais — `tests/setup.ts:9`, `tests/setup.ts:25`; cada arquivo limpa as tabelas que usa — `tests/ajuda.ts:39` |
| Combinação isolamento × paralelismo | um arquivo de banco só, por isso `fileParallelism: false` — `vitest.config.ts:14` |
| Semeadura de dado de teste | funções de ajuda no próprio teste — `tests/ajuda.ts:10`; a seed de demonstração tem teste próprio — `tests/demonstracao.test.ts:15` |
| Onde vivem as migrações | `prisma/migrations/` — `prisma/migrations/20260830193658_esquema_inicial/migration.sql:2` |
| Comando de rodar migração | `npx prisma migrate deploy` (`npm run db:migrate`) — `package.json:15` |
| Comando de reverter migração | — (LACUNA) ver `docs/stack/LACUNAS.md`, L-04 |
| Migrações têm reversão declarada? | não |

**Evidência:** `tests/setup.ts:9`, `tests/setup.ts:25`, `tests/ajuda.ts:39`, `vitest.config.ts:14`

---

## 5. Estrutura e camadas

| Camada (nome no repositório) | Pasta | Pode importar de | Não importa de |
| ---------------------------- | ----- | ---------------- | -------------- |
| Apresentação | `src/app`, `src/componentes` | `src/servicos`, `src/lib` | o cliente do Prisma |
| Aplicação | `src/servicos` | `src/lib` | `src/app`, `src/componentes` |
| Dados e utilitários | `src/lib`, `prisma/` | nada acima | `src/servicos`, `src/app`, `src/componentes` |

**Força da evidência de dependência:** teste que falha (`tests/camadas.test.ts:14`, regras em `tests/ajuda-estatica.ts`), nenhuma regra de lint. A guarda achou, na primeira execução, uma violação existente: `src/lib/sessao-servidor.ts` importava `@/servicos/autenticacao`. O arquivo foi movido para a apresentação (`src/app/sessao-servidor.ts:32`), que é o seu lugar (usa `cookies()` e `redirect()` do Next).

**Onde entra código novo**

| Tipo | Pasta | Arquivo exemplar |
| ---- | ----- | ---------------- |
| Caso de uso | `src/servicos` | `src/servicos/usuarios.ts:54` |
| Utilitário puro / acesso a dados | `src/lib` | `src/lib/formato.ts:14` |
| Ação de formulário | `src/app/acoes.ts` | `src/app/acoes.ts:1` |
| Rota de API | `src/app/api/<assunto>/<ação>/route.ts` | `src/app/api/sessao/renovar/route.ts:11` |
| Comando de operação (npm run) | `scripts/`, finos, sobre função testada de `src/lib` | `scripts/backup.ts:1` |
| Componente de interface | `src/componentes` | `src/componentes/Formulario.tsx:20` |
| Estado de tela (carregando, erro, não encontrado) | `loading.tsx`, `error.tsx`, `not-found.tsx` | `src/componentes/EstadoDeErro.tsx:7`, `src/app/not-found.tsx:4` |

**Violações existentes:** nenhuma depois da correção acima (`tests/camadas.test.ts:14`).

**Evidência:** `tests/camadas.test.ts:14`, `src/app/sessao-servidor.ts:32`, `src/lib/prisma.ts:13`

---

## 6. Padrões de código com consequência

### Sinalização de erro
Serviço sinaliza erro lançando `ErroDeAplicacao` pelos construtores `naoAutenticado`, `naoAutorizado`, `naoEncontrado`, `entradaInvalida`, `limiteExcedido` e `conflito`; a ação converte em mensagem para a tela e nenhum rastro de pilha chega ao usuário: erro desconhecido passa por `mensagemSegura`, que devolve a frase genérica com um código de correlação de 12 caracteres e grava no log só nome, código do erro e o mesmo código (nunca a mensagem nem a pilha); as rotas de API fazem o mesmo com `registrarErroInesperado`; a tela de erro nunca lê `message` nem `stack`.
**Evidência:** `src/lib/erros.ts:4`, `src/lib/erros.ts:27`, `src/lib/erros.ts:45`, `src/lib/erros.ts:51`, `src/app/acoes.ts:55`, `src/app/acoes.ts:57`, `src/componentes/EstadoDeErro.tsx:7`, `tests/estados.test.ts:38`, `tests/erro-sem-pilha.test.ts:59`, `tests/erro-rotas.test.ts:43`

### Validação de entrada
Esquema `zod` no servidor, na camada de aplicação, antes de tocar o banco.
**Evidência:** `src/servicos/usuarios.ts:21`, `src/servicos/autenticacao.ts:22`

### Log
Uma linha JSON por evento, com `nivel` (`info`, `aviso`, `erro`), `instante` ISO UTC, `evento` (minúsculas separadas por ponto) e `contexto` plano, pela função `log` de `src/lib/log.ts`; sai na saída padrão e no arquivo do dia `logs/app-AAAA-MM-DD.log` (dia UTC, pasta em `LOG_DIR`, vazio desliga; nos testes fica desligado). O log nunca derruba quem o chamou.
**Nunca vai para o log:** as chaves da lista compartilhada com a trilha (`senha`, `hash`, `token`, `jwt`, `segredo`, `valor`, `centavo`, `saldo`, `e-mail`, `cpf`), texto com cara de hash bcrypt, JWT ou e-mail, e mensagem ou pilha de erro (o `Error` vira só o nome). O que bate vira `[removido]`.
**Retenção:** 90 dias (PR-11). `descartarLogsAntigos` apaga pelo dia do NOME do arquivo, com a data injetada, ao subir o servidor e por `npm run log:limpar`.
**Evidência:** `src/lib/chaves-proibidas.ts:8`, `src/lib/log.ts:51`, `src/lib/log.ts:88`, `src/lib/log-arquivo.ts:8`, `src/lib/log-arquivo.ts:49`, `tests/log.test.ts:54`, `tests/log-retencao.test.ts:55`

### Configuração e segredo
Variável obrigatória ausente falha na leitura, com mensagem em português; segredo só no arquivo local de ambiente, que o `.gitignore` exclui, e o modelo versionado traz o segredo vazio. Configuração inválida falha **no start**: `validarAmbiente` junta todos os problemas (`DATABASE_URL`, `JWT_SECRET`, `JWT_TTL_SEGUNDOS`) sem repetir o valor, e `src/instrumentation.ts` a chama quando o servidor Node sobe e **encerra o processo com código 1**, porque o Next anuncia "Ready" antes do gancho e, se ele só lançar, segue de pé sem atender (provado com `next start` de verdade).
**Evidência:** `src/lib/ambiente.ts:4`, `src/lib/ambiente.ts:33`, `src/lib/ambiente.ts:52`, `src/lib/ambiente.ts:62`, `src/instrumentation.ts:9`, `.gitignore:12`, `tests/seguranca-base.test.ts:58`, `tests/ambiente-start.test.ts:98`

### Nomeação

| Elemento | Forma | Observação |
| -------- | ----- | ---------- |
| Arquivo de serviço e de lib | minúsculo, sem acento; hífen quando composto — `limite-de-tentativas.ts` | `src/lib/limite-de-tentativas.ts:19` |
| Componente | PascalCase em português — `EstadoDeErro.tsx` | `src/componentes/EstadoDeErro.tsx:7` |
| Função / método | camelCase em português — `formatarMoeda`, `renovarSessao` | `src/lib/formato.ts:14`, `src/servicos/autenticacao.ts:118` |
| Variável de ambiente | MAIÚSCULAS com sublinhado — `JWT_SECRET` | `src/lib/ambiente.ts:62` |

---

## 7. Regras do projeto (dos premissas, com a evidência que existe hoje)

### Dinheiro
Todo valor monetário é inteiro em centavos (BRL), sempre positivo no lançamento: o sinal vem do tipo (receita ou despesa), e a despesa só ganha o menos na exibição. No esquema a coluna é `valorCentavos Int` (`prisma/schema.prisma:73`) e a migration a declara `INTEGER` (`prisma/migrations/20261028150000_lancamentos/migration.sql:13`); nunca `Float` nem `Decimal`, e `tests/lancamentos-dados.test.ts:114` falha se um dos dois aparecer no esquema. A entrada digitada em formato brasileiro ("1.234,56") entra por um único leitor, `lerValorEmReais` (`src/lib/dinheiro.ts:19`), que trabalha só com texto e inteiros e devolve `null` para valor não positivo, acima de R$ 1.000.000,00 (`src/lib/dinheiro.ts:7`), com ponto decimal ou em notação científica; `tests/dinheiro.test.ts:123` proíbe `parseFloat`, `Number(` e aritmética de ponto flutuante nesse arquivo. O serviço converte e valida com `zod` antes de tocar o banco (`src/servicos/lancamentos.ts:178`) e o campo de edição volta do centavo ao texto por `centavosParaCampo` (`src/lib/dinheiro.ts:39`). A exibição usa `formatarMoeda`, que recusa não inteiro (`src/lib/formato.ts:14`, `tests/formato.test.ts:29`). A data do lançamento é um dia civil `AAAA-MM-DD` no fuso `America/Sao_Paulo` (`src/lib/datas.ts:35`, `src/lib/datas.ts:60`), não um instante. O saldo e o resumo do mês (FT-04) seguem a mesma regra: `resumoDoMes` (`src/servicos/resumo.ts:56`) soma no banco, por `groupBy` de inteiros (`src/servicos/resumo.ts:66`), e o saldo é a subtração de dois inteiros (`src/servicos/resumo.ts:113`); a soma fica no servidor e nunca no cliente, e o componente só formata. O mês vem do parâmetro `mes` da URL e é validado com `zod` no servidor (`src/servicos/resumo.ts:37`), de modo que valor inválido vira o mês corrente. O saldo é só do mês escolhido, sem acumulado (PR-29). O saldo do filho (FT-06) segue a mesma regra, mas é de todos os movimentos, sem corte por data: `totaisDoFilho` (`src/servicos/mesada.ts:94`) soma créditos e gastos por `groupBy` de inteiros (`src/servicos/mesada.ts:95`) e o saldo é a subtração de dois inteiros, nunca no cliente; a coluna é `valorCentavos Int` (`prisma/schema.prisma:121`), `INTEGER` na migration (`prisma/migrations/20261028190000_mesada/migration.sql:6`), com o valor lido pelo mesmo `lerValorEmReais` e o mesmo teto do lançamento. O saldo negativo é permitido e dito com sinal de menos e a frase "Saldo negativo", nunca só pela cor (PR-32); `tests/mesada-saldo.test.ts:25` prova `0,10 + 0,20 - 0,30 = 0` e um extrato de mil movimentos, e `tests/mesada.test.ts:353` proíbe `parseFloat`, `Number(`, `toFixed` e arredondamento no serviço. `tests/resumo.test.ts:45` prova `0,10 + 0,20 = 0,30` e `tests/resumo.test.ts:381` proíbe `parseFloat`, `Number(`, `toFixed` e arredondamento no serviço; o saldo negativo sai com sinal de menos e frase, não só pela cor (`src/componentes/ResumoDoMes.tsx:74`, `tests/resumo-tela.test.ts:131`). Premissas: PR-02, PR-26, PR-29.

### Autorização
Papéis gravados `admin`, `usuario` e `filho` (interface: Responsável, Adulto e Filho); a checagem acontece no servidor, em serviço ou ação, nunca só na interface — `src/app/sessao-servidor.ts:32`, `src/servicos/autenticacao.ts:127`, `src/servicos/usuarios.ts:54`, `tests/rotas.test.ts:207`. Quem lança e lê os lançamentos é `admin` ou `usuario`, por lista de permitidos: `exigirAdultoOuResponsavel` (`src/servicos/autenticacao.ts:140`) é a primeira linha de toda função de `src/servicos/lancamentos.ts` (`src/servicos/lancamentos.ts:178`), a guarda de página é `exigirUsuarioDeLancamentos` (`src/app/sessao-servidor.ts:43`), e `tests/lancamentos-papeis.test.ts:68` varre todas as funções exportadas do serviço com papel `filho`, vazio e desconhecido, que recebem 403; o servidor real nega o mesmo papel nas quatro telas (`tests/rotas.test.ts`, bloco "as telas de Lançamentos"). O resumo do mês segue a mesma lista: `resumoDoMes` começa por `exigirAdultoOuResponsavel` (`src/servicos/resumo.ts:61`), `tests/resumo-papeis.test.ts:24` varre as funções exportadas do serviço com `filho`, vazio e desconhecido, que recebem 403, e o painel inicial, que é a página de todos os papéis, não busca o resumo para quem não lança (`src/app/(sistema)/page.tsx:34`), mostrando só título, subtítulo e uma frase neutra. O papel `filho` (FT-05, PR-06 e PR-31) segue a mesma lista de permitidos: nasce sem acesso a lançamentos, categorias, resumo, atividade, usuários e filhos, e `tests/papel-filho.test.ts:52` varre todas as funções exportadas desses serviços com um filho real, que recebe 403 e não grava nada. As funções de `src/servicos/filhos.ts` começam por `exigirAdmin` (só o responsável cadastra, lê, edita e gerencia o login do filho) e `tests/filhos-papeis.test.ts:32` as varre com adulto, filho, vazio e desconhecido. A única exceção é `minhaMesada` (`src/servicos/filhos.ts:325`), que começa por `exigirFilho` (`src/servicos/autenticacao.ts:153`) e não recebe id: o registro vem do usuário da sessão, então o filho A não alcança o filho B (IDOR). Nas funções que recebem id, o filho recebe o mesmo 403 para o id do irmão e para um id inexistente (`tests/filhos-login.test.ts:220`), e o servidor real responde igual nos dois casos e barra o filho em todas as outras rotas (`tests/filhos-mesada.test.ts:204`). A guarda de página é `exigirUsuarioFilho` (`src/app/sessao-servidor.ts:54`). As ações de servidor exigem o papel FORA do `try`, porque o redirecionamento do Next é uma exceção (`src/app/acoes.ts:243`); `tests/filhos-acoes.test.ts:122` executa as ações com a sessão simulada e prova que filho, adulto e quem não entrou não gravam nada. A tela Usuários não cria nem muda papel para `filho` (`src/servicos/usuarios.ts:117`). A mesada (FT-06, PR-33) segue a mesma lista de permitidos: `registrarMovimento` e toda função com id ou de leitura de qualquer filho começam por `exigirAdmin` (`src/servicos/mesada.ts:121`), então o adulto (`usuario`) não mexe em mesada nem a vê, e `tests/mesada-papeis.test.ts:33` varre todas as funções exportadas com adulto, filho, vazio e desconhecido (403, nada gravado). A única exceção é `meuExtrato` (`src/servicos/mesada.ts:319`), que começa por `exigirFilho` (`src/servicos/mesada.ts:323`) e não recebe id: o filho lê só o extrato e o saldo do registro ligado à sessão, e `tests/mesada-isolamento.test.ts:86` prova que o filho A recebe o mesmo 403 para o movimento do irmão e para um id inexistente. O servidor real mostra cada irmão só com o que é dele, ignora `filho`, `id` e `movimento` na consulta de `/mesada` e não oferece rota com id para o filho (`tests/mesada-rotas.test.ts:161`). As ações de mesada exigem o responsável fora do `try` (`src/app/acoes.ts:312`) e `tests/mesada-acoes.test.ts:170` as executa como filho, adulto e visitante sem gravar nada. A privacidade (FT-07, PR-34, PR-35) segue a mesma lista de permitidos: `exportarDadosDaFamilia` e `excluirFilho` começam por `exigirAdmin`, então adulto, filho (inclusive o próprio titular), vazio e desconhecido recebem 403 e nada grava (`tests/privacidade-papeis.test.ts:27` varre todas as funções exportadas). A rota de download (`src/app/api/privacidade/exportar/route.ts:11`) é só POST, porque grava na trilha e o cookie `sameSite: lax` seguiria um link de outro site; sem sessão responde 401 e, para outro papel, 403. A ação `excluirContaDoFilho` (`src/app/acoes.ts:362`) exige o responsável fora do `try` e o servidor confere o nome digitado (`tests/privacidade-acoes.test.ts:116` a executa como filho, adulto e visitante). Premissas: PR-06, PR-34, PR-35.

### Dados do domínio
Toda entidade de domínio nasce numa feature do B4, sob TDD, com migration, e entrada validada com `zod` no servidor — validação: `src/servicos/usuarios.ts:21`; migration: `prisma/migrations/20260830193658_esquema_inicial/migration.sql:2`. Primeira entidade nova sob esta regra: `Atividade` (FT-02) — esquema `prisma/schema.prisma:38`, migration `prisma/migrations/20261028143052_atividade/migration.sql:2`, validação `src/servicos/atividade.ts:75`. Toda tabela nova entra também em `limparBanco` (`tests/ajuda.ts:39`), senão um teste enxerga o que o outro criou. Primeiras entidades com dado do negócio, FT-03: `Categoria` e `Lancamento` — esquema `prisma/schema.prisma:56`, `prisma/schema.prisma:70`, migration `prisma/migrations/20261028150000_lancamentos/migration.sql:2`, validação `src/servicos/lancamentos.ts:178`; ambas entram em `limparBanco` (`tests/ajuda.ts:39`). Primeira entidade com dado de menor, FT-05: `Filho` — esquema `prisma/schema.prisma:93`, migration `prisma/migrations/20261028170000_filhos/migration.sql:2`, validação `src/servicos/filhos.ts:47`, cadastro `src/servicos/filhos.ts:120`; guarda só nome, nascimento opcional, mesada em centavos inteiros (`Int`, nunca `Float`) e periodicidade (PR-09, PR-30), com o login como `Usuario` de papel `filho` ligado por chave única (PR-31); entra em `limparBanco` (`tests/ajuda.ts:39`) e `tests/filhos.test.ts:259` proíbe ponto flutuante no serviço. Primeira entidade de movimento de dinheiro de menor, FT-06: `MovimentoDeMesada` — esquema `prisma/schema.prisma:117`, migration `prisma/migrations/20261028190000_mesada/migration.sql:2`, validação e serviço `src/servicos/mesada.ts:116`; pertence a um filho por `filhoId` com `onDelete: Cascade` (`prisma/schema.prisma:127`), de modo que apagar o filho leva o histórico dele (PR-09, PR-33), e entra em `limparBanco` (`tests/ajuda.ts:39`); `tests/mesada-dados.test.ts:87` prova o Cascade sem tocar o irmão. Privacidade (FT-07, PR-09, PR-34, PR-35): a exportação (`exportarDadosDaFamilia`, `src/servicos/privacidade.ts:52`) é um documento JSON com `versao_do_formato` (`src/lib/privacidade.ts:8`), valores em centavos inteiros e datas ISO; a consulta de usuários lista os campos um a um (`src/servicos/privacidade.ts:60`), de modo que hash de senha e corte de sessão nunca são lidos, e `camposProibidosEm` (`src/lib/privacidade.ts:26`) é a varredura que o teste aplica ao arquivo (`tests/privacidade-exportacao.test.ts:150`). A exclusão do filho (`excluirFilho`, `src/servicos/privacidade.ts:228`) é uma transação só: apaga o filho (os movimentos saem pelo `Cascade`, provado em `tests/mesada-dados.test.ts:4` e sem apagar linha a linha no serviço), apaga o usuário de login e anonimiza a trilha por id (`anonimizarTrilha`, `src/servicos/privacidade.ts:175`), trocando `alvoNome` por "filho removido" também nas linhas do nome antigo; `tests/privacidade-banco.test.ts:47` lê o SQLite inteiro, tabela por tabela, e não acha nome, e-mail, nascimento nem descrição do filho. Não há tabela de sessão: o token emitido antes deixa de valer porque o usuário deixa de existir (`tests/privacidade-exclusao.test.ts:222`, e no servidor real `tests/privacidade-rotas.test.ts:183`), e o estado de tentativas de login do e-mail é esquecido por `esquecerTentativasDeLogin` (`src/servicos/autenticacao.ts:161`). A tela é `PainelDePrivacidade` (`src/componentes/PainelDePrivacidade.tsx:10`, página `/privacidade`) e o apagar em dois passos, com o nome digitado, é `ApagarFilho` (`src/componentes/ApagarFilho.tsx:11`), também na página do filho. Nenhuma tabela nem migration nova. Dois cadastros que se espelham andam juntos (FT-09, PR-39): o usuário de login do filho leva o mesmo nome do registro, então `editarFilho` reescreve o nome do usuário ligado na mesma transação da edição (`src/servicos/filhos.ts:185`, `src/servicos/filhos.ts:190`), também quando o login já divergia do cadastro; o e-mail do login é credencial e nunca é tocado, o irmão e o usuário de outro filho ficam como estavam, e `tests/filhos-sincronia.test.ts:33` e `tests/filhos-sincronia-trilha.test.ts` provam o efeito, a atomicidade e a ausência de e-mail e de nome antigo na trilha. O adaptador SQLite do Prisma usa uma conexão só, então `prisma.usuario` dentro da transação se comportaria como `tx.usuario`; por isso um teste de código exige o cliente `tx`. A tela Usuários ainda deixa renomear o usuário de um filho, e a próxima edição do filho reescreve esse nome (pendência `decisao_humana`).

### Auditoria
Toda ação auditada (PR-10) passa por `registrarAtividade` (`src/servicos/atividade.ts:75`), chamada dentro da mesma transação da ação — `src/servicos/usuarios.ts:86`, `src/servicos/usuarios.ts:161`. O código da ação é `entidade.verbo` e precisa estar no catálogo `src/lib/atividade.ts:9`, com rótulo em português. O `detalhe` é plano e pequeno e nunca recebe senha, hash, token, segredo, valor, saldo, e-mail nem CPF (a barreira é `src/lib/chaves-proibidas.ts:8`, testada em `tests/atividade.test.ts:88`); o módulo não oferece editar nem apagar (`tests/atividade.test.ts:122`). Só o responsável lê (`src/servicos/atividade.ts:134`, `tests/atividade-leitura.test.ts:28`). Feature nova que altera dado de negócio acrescenta a sua ação ao catálogo e chama o serviço. Lançamento e categoria fazem isso (`lancamento.criado`, `lancamento.alterado`, `lancamento.apagado`, `categoria.criada` em `src/lib/atividade.ts:13`): o rastro é gravado na mesma transação (`src/servicos/lancamentos.ts:88`, `src/servicos/lancamentos.ts:264`) e leva só o tipo e o id da categoria, nunca o valor — `tests/lancamentos.test.ts` e `tests/lancamentos-edicao.test.ts` afirmam que valor e descrição não aparecem em nenhuma coluna do registro. Os filhos fazem o mesmo (`filho.cadastrado`, `filho.alterado`, `filho.login_criado`, `filho.login_desativado`, a partir de `src/lib/atividade.ts:17`): o rastro é gravado na mesma transação (`src/servicos/filhos.ts:140`, `src/servicos/filhos.ts:198`, `src/servicos/filhos.ts:264`, `src/servicos/filhos.ts:297`) e leva só o nome do filho e, na edição, os nomes dos campos alterados, nunca o valor da mesada, o e-mail do login nem a data de nascimento. A mesada faz o mesmo (`mesada.registrada`, `mesada.alterada`, `mesada.apagada`, a partir de `src/lib/atividade.ts:21`): o rastro é gravado na mesma transação (`src/servicos/mesada.ts:139`) e leva só o id do movimento, o tipo, o id e o nome do filho, nunca o valor, o saldo nem a descrição; edição sem mudança real não grava. A privacidade acrescenta duas ações (`familia.exportada` em `src/lib/atividade.ts:24` e `filho.excluido` em `src/lib/atividade.ts:25`): a exportação grava ator, um id opaco e a versão do formato, sem conteúdo, antes de entregar o arquivo (se o rastro falha, não há arquivo); a exclusão grava ator, o id opaco do filho e contagens, sem nome, e-mail, valor nem saldo, e as linhas antigas que citavam o filho passam a dizer "filho removido" (PR-35). Quem só aparece como autor de uma linha não tem o `alvoNome` trocado, porque esse nome é de outra pessoa. Quando a edição do filho também reescreve o nome do login, os `campos` ganham `login` (rótulo "nome do login" em `src/lib/atividade.ts:69`): o detalhe continua só com `alvoNome` e nomes de campos, nunca o e-mail nem o nome antigo, que a exclusão da FT-07 não teria como anonimizar.

### Operação: backup, restauração e saúde
O backup é `VACUUM INTO` do `better-sqlite3` (`gerarBackup`, `src/lib/backup.ts:85`) para `backups/backup-AAAA-MM-DD-HHMMSS.db` em horário de São Paulo, sem sobrescrever, com pasta 0700 e arquivo 0600; a pasta `backups/` e a `logs/` ficam no `.gitignore`. O backup leva os hashes de senha. A restauração (`restaurarBackup`, `src/lib/restauracao.ts:95`) só aceita SQLite íntegro com as tabelas de `TABELAS_ESPERADAS` (`src/lib/restauracao.ts:21`, conferida contra o banco migrado por teste), preserva o banco atual em `backups/antes-da-restauracao-*.db` e troca por renomeação; arquivo inválido deixa o banco intacto, byte a byte. O sistema precisa estar parado ao restaurar. Os testes de backup usam banco temporário com as migrations reais (`tests/banco-temporario.ts:1`), nunca o banco compartilhado da suíte. A saúde é `GET /api/saude` (`src/app/api/saude/route.ts:10`), pública, que responde `{status, banco}` 200 ou 503 por `verificarSaude` (`src/servicos/saude.ts:34`), com o Prisma importado sob demanda para falha de abertura virar 503.
**Evidência:** `src/lib/backup.ts:85`, `src/lib/restauracao.ts:95`, `src/servicos/saude.ts:34`, `src/app/api/saude/route.ts:10`, `tests/backup-ponta-a-ponta.test.ts:37`, `tests/restauracao.test.ts:128`, `tests/saude-rotas.test.ts:34`, `tests/rotas.test.ts:558`

### Versionamento
Uma branch por feature, `feat/ft-NN-<slug>`, na árvore principal, um commit por task, sem push forçado nem merge no fluxo automático — `docs/projeto/PREMISSAS.md:326` (PR-24). Mensagens de commit seguem Conventional Commits em português (`git log`).

**Evidência:** `src/lib/formato.ts:14`, `src/app/sessao-servidor.ts:32`, `src/servicos/atividade.ts:75`, `docs/projeto/PREMISSAS.md:326`

---

## Conflitos em aberto

Nenhum.

## Decisões registradas

| Data | Quem decidiu | Ponto | Decisão | Dialeto abandonado |
| ---- | ------------ | ----- | ------- | ------------------ |
| 2026-10-28 | buildx (FT-01, D-12) | Direção das camadas | `src/lib` não importa serviço nem apresentação; `sessao-servidor` mora em `src/app` | `src/lib/sessao-servidor.ts` importando `@/servicos` |

## Histórico de atualização

| Data | Commit | O que mudou |
| ---- | ------ | ----------- |
| 2026-10-28 | inicial | B2 do buildx: regras prescritas, só comandos com evidência |
| 2026-10-28 | e83574e | FT-01: stackx-detectar converteu as regras em evidência `arquivo:linha`, adicionou comandos `typecheck` e `verificar`, e corrigiu a camada de `sessao-servidor` |
| 2026-10-28 | FT-02 | Seção 7 ganhou "Auditoria" (`registrarAtividade`, catálogo de ações, barreira do detalhe); a entidade `Atividade` é a primeira entidade nova sob a regra de dados; citações de `src/servicos/usuarios.ts` deslocadas por causa do import novo |
| 2026-10-28 | FT-03 | Seção 7: "Dinheiro" passou de prescrita a com evidência (centavos inteiros, leitor de valor, data civil, `Int` no esquema); "Autorização" ganhou a lista de permitidos `admin`/`usuario` com teste que varre o serviço; "Dados do domínio" e "Auditoria" citam `Categoria`, `Lancamento` e as quatro ações novas; citações deslocadas por imports novos conferidas (`formato.ts`, `acoes.ts`, `sessao-servidor.ts`, `ajuda.ts`, `rotas.test.ts`) |
| 2026-10-28 | FT-04 | Seção 7: "Dinheiro" e "Autorização" citam o serviço de resumo (`groupBy` de inteiros, mês validado com `zod`, lista de permitidos) e os testes que o provam; nenhuma entidade nova; citação de `tests/rotas.test.ts` deslocada e reconferida |
| 2026-10-28 | FT-05 | Seção 7: "Autorização" deixou de ser prescrita para o papel `filho` (lista de permitidos varrida com um filho real, `minhaMesada` sem id, IDOR, ações com a guarda fora do `try`); "Dados do domínio" ganhou `Filho`; "Auditoria" cita as quatro ações de filho sem valor, e-mail nem nascimento; citações deslocadas conferidas (`schema.prisma`, `usuarios.ts`, `acoes.ts`, `page.tsx`) |

| 2026-10-28 | FT-06 | Seção 7: "Dinheiro" cita o saldo do filho por `groupBy` de inteiros e o saldo negativo permitido e dito em texto; "Autorização" cita a mesada só do responsável, `meuExtrato` sem id e o isolamento entre irmãos; "Dados do domínio" ganhou `MovimentoDeMesada` com `Cascade` e a nota para a FT-07; "Auditoria" cita as três ações da mesada sem valor; citações de `acoes.ts` e `tests/filhos-acoes.test.ts` deslocadas e reconferidas |

| 2026-10-28 | FT-07 | Seção 7: "Dados do domínio" fecha a nota para a FT-07 (exportação versionada, exclusão em uma transação, trilha anonimizada, sem sessão para revogar); "Autorização" cita `exportarDadosDaFamilia`, `excluirFilho`, a rota só POST e a ação com a guarda fora do `try`; "Auditoria" cita `familia.exportada` e `filho.excluido`; citações de `acoes.ts` deslocadas em uma linha pelo import novo e reconferidas |
| 2026-10-28 | FT-08 | Seção 6: "Log" passou de PROPOSTA a regra com evidência (JSON por linha, lista de chaves proibidas compartilhada com a trilha, retenção de 90 dias); "Sinalização de erro" cita `mensagemSegura` e o código de correlação; "Configuração" cita `validarAmbiente` e o gancho que encerra o processo; comandos `backup`, `restaurar` e `log:limpar`; `better-sqlite3` declarado. Seção 7: "Operação" nova. Citações deslocadas conferidas (`package.json`, `atividade.ts`, `ambiente.ts`) |
| 2026-10-28 | FT-09 | Seção 7: "Dados do domínio" cita o login do filho que acompanha o cadastro na mesma transação, com o e-mail intocado (PR-39); "Auditoria" cita o campo `login` sem e-mail nem nome antigo; citações de `src/servicos/filhos.ts` depois de `editarFilho` deslocadas em 12 linhas e reconferidas (`198`, `264`, `297`, `325`) |

---

<!-- Lacunas: docs/stack/LACUNAS.md -->
