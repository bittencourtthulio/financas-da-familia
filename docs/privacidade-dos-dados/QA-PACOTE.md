# Pacote de QA — Privacidade dos dados: baixar tudo e apagar a conta de um filho

## 1. O que mudou

O responsável agora tem **Privacidade** no menu. Lá ele **baixa um arquivo** com todos os dados da família e consegue **apagar de verdade a conta de um filho**, digitando o nome dele. Depois de apagar, nada do filho (nome, e-mail, dinheiro) fica no sistema, ele não consegue mais entrar e quem já estava com o sistema aberto é mandado para o login. O adulto e o filho não veem nem usam nada disso.

## 2. Ambiente

- Banco com a seed aplicada (`npm run setup`) e o sistema no ar (`npm run dev`, endereço `http://localhost:3000`).
- Contas fictícias, todas com a senha `demo1234`: `responsavel@exemplo.local` (responsável), `adulto@exemplo.local` (adulto), `ana@exemplo.local` (filha) e `pedro@exemplo.local` (filho).
- Para o caso 5 use duas janelas (ou uma janela anônima): uma com a Ana logada, outra com o responsável.
- Para refazer a demonstração depois de apagar a Ana, rode `npm run db:seed`: ela é recriada.

## 3. Roteiro de teste

### Caso 1 — Entrada no menu e explicação

**O que fazer:** entre com `responsavel@exemplo.local`; clique em **Privacidade** no menu.

**O que deve acontecer:** a página explica, em português, o que o arquivo leva (usuários, categorias e lançamentos, filhos com saldo e mesada, atividade), que os valores vão em centavos e que o arquivo nunca leva senhas; e explica o que a exclusão apaga, que não pode ser desfeita e que se deve baixar antes. Aparece o botão "Baixar os dados da família" e, para cada filho, "Apagar a conta de Ana" e "Apagar a conta de Pedro".

### Caso 2 — Baixar o arquivo

**O que fazer:** clique em "Baixar os dados da família".

**O que deve acontecer:** aparece "Preparando o arquivo…" e depois "Arquivo baixado…"; o navegador salva `dados-da-familia-AAAA-MM-DD.json` (com a data de hoje). Abra o arquivo em um editor de texto: começa com `"sistema"`, tem `"versao_do_formato": 1`, as listas `usuarios`, `categorias`, `lancamentos`, `filhos`, `movimentos_de_mesada` e `atividade`, e os valores como números inteiros (ex.: `valor_centavos`).

**O que indicaria falha:** a palavra `senha_hash`, `senhaHash`, `token`, `jwt` ou um texto começando por `$2` em qualquer lugar do arquivo; valor com vírgula ou ponto decimal; arquivo vazio.

### Caso 3 — O download aparece na Atividade

**O que fazer:** abra **Atividade**.

**O que deve acontecer:** a linha mais recente é "Exportou os dados da família", com o seu nome e a hora, sem nenhum conteúdo do arquivo.

### Caso 4 — Apagar com o nome errado e cancelar

**O que fazer:** em Privacidade, clique em "Apagar a conta de Ana"; leia o aviso; digite `Pedro` e clique em "Apagar para sempre". Depois clique em "Cancelar" e abra de novo.

**O que deve acontecer:** o primeiro clique só mostra o aviso e o campo; com o nome errado, aparece "O nome digitado não confere com o do filho. Nada foi apagado." e a Ana continua em **Filhos**; "Cancelar" volta ao botão simples.

### Caso 5 — Apagar de verdade

**O que fazer:** numa janela anônima, entre como `ana@exemplo.local` e deixe em **Minha mesada**. Na janela do responsável, na página da Ana (Filhos > Ana, no fim da página) ou em Privacidade, apague a conta digitando `Ana` e confirmando.

**O que deve acontecer:** volta para Privacidade com "A conta e o histórico do filho foram apagados."; a Ana some de **Filhos** e da lista de Privacidade; o saldo e o extrato dela não existem mais. Na janela da Ana, ao recarregar ou clicar em qualquer página (Painel, Minha mesada, Meu perfil), ela é levada ao login. Tentar entrar com `ana@exemplo.local` / `demo1234` dá "E-mail ou senha incorretos."

**O que indicaria falha:** a Ana ainda abrir alguma página, ainda aparecer em Filhos, ou conseguir entrar.

### Caso 6 — Nada sobra, o irmão fica

**O que fazer:** como responsável, baixe o arquivo de novo e abra **Atividade**. Entre como `pedro@exemplo.local`.

**O que deve acontecer:** o arquivo não tem "Ana", `ana@exemplo.local`, nem os movimentos dela; o Pedro e os lançamentos da casa continuam lá. Em Atividade, as linhas antigas da Ana dizem "filho removido" (ex.: "Cadastrou o filho filho removido") e há "Excluiu a conta de um filho", sem nome. O Pedro entra normalmente e vê só a mesada dele.

### Caso 7 — Quem não é responsável é barrado

**O que fazer:** entre com `adulto@exemplo.local` e depois com `pedro@exemplo.local`; confira o menu e digite `/privacidade` no endereço.

**O que deve acontecer:** o menu não tem Privacidade; o endereço devolve ao painel, sem mostrar dado nenhum. Quem não entrou é levado ao login.

### Caso 8 — Aparência: tema e celular

**O que fazer:** alterne entre tema claro e escuro na página Privacidade; reduza a janela abaixo de 768px; faça o passo de apagar até aparecer o campo do nome.

**O que deve acontecer:** tudo legível nos dois temas, a seção de apagar se distingue pela borda e pelo texto, sem rolagem horizontal da página no celular, e botões e campos com tamanho de toque.

## 4. O que observar de colateral

- Lançamentos, Categorias, o resumo do painel, Filhos e a mesada (FT-03 a FT-06) continuam como antes.
- A seed rodada de novo não duplica nada e recria a Ana apagada.
- O arquivo baixado nunca deve mostrar nada que o login mostra de segredo (senha, token).

## 5. Critério objetivo de aprovação

Aprovado se os casos 1 a 7 acontecerem exatamente como descritos e o caso 8 não mostrar texto ilegível nem rolagem horizontal. Reprova: qualquer campo secreto no arquivo, o nome ou e-mail do filho em qualquer lugar depois de apagar (inclusive na Atividade), o filho apagado ainda conseguir abrir página ou entrar, o adulto ou o filho conseguirem baixar ou apagar, ou o irmão ser afetado.

## 6. Dados de teste fictícios

Contas da seed (`demo1234`). Nenhum dado real é necessário.
