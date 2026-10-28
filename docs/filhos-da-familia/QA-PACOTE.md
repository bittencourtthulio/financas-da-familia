# Pacote de QA — Filhos da família: cadastro, login do filho e a página da mesada

## 1. O que mudou

O responsável agora tem o item **Filhos** no menu: cadastra um filho com nome, valor de mesada combinado e periodicidade (semanal ou mensal), e, se quiser, cria o login dele. O filho entra com a própria conta e vê só a página **Minha mesada** (nome, valor combinado, periodicidade e a frase "Ainda não há movimentos de mesada"), além do perfil e da troca de senha. O valor e a periodicidade são só um combinado: nada é creditado nem calculado. O filho não vê lançamentos, resumo, atividade, usuários nem os dados do irmão.

## 2. Ambiente

- Banco com a seed aplicada (`npm run setup`) e o sistema no ar (`npm run dev`, endereço `http://localhost:3000`).
- Contas fictícias, todas com a senha `demo1234`: `responsavel@exemplo.local` (responsável), `adulto@exemplo.local` (adulto), `ana@exemplo.local` (filha, R$ 50,00 por semana) e `pedro@exemplo.local` (filho, R$ 120,00 por mês).

## 3. Roteiro de teste

### Caso 1 — O responsável vê os filhos

**O que fazer:** entre com `responsavel@exemplo.local`; abra **Filhos** no menu.

**O que deve acontecer:** aparecem dois cartões: Ana, "R$ 50,00 por semana", "Login ativo"; e Pedro, "R$ 120,00 por mês", "Login ativo". Há o botão "Cadastrar filho".

**O que indicaria falha:** valor sem vírgula ou com centavos trocados, situação do login só por cor (sem o texto), menu sem o item Filhos.

### Caso 2 — Cadastrar um filho

**O que fazer:**
1. Em Filhos, clique em "Cadastrar filho".
2. Preencha nome `Teste de QA`, valor `1.234,56`, periodicidade Mensal, nascimento vazio. Envie.
3. Volte à lista.

**O que deve acontecer:** o sistema abre a página do filho, com o valor `1234,56` no campo, e a lista mostra "R$ 1.234,56 por mês" e "Sem login". Em **Atividade** (responsável) aparece "Cadastrou o filho Teste de QA" sem nenhum valor.

**O que indicaria falha:** valor diferente, nascimento obrigatório, valor ou data na tela Atividade.

### Caso 3 — Validação

**O que fazer:** tente cadastrar com valor `abc`, valor `0`, valor `12.5`, nome em branco, e nascimento no futuro.

**O que deve acontecer:** cada tentativa mostra uma mensagem em português e nada é cadastrado.

### Caso 4 — Editar o filho

**O que fazer:** abra `Teste de QA`, mude o valor para `99,90` e salve.

**O que deve acontecer:** "Filho atualizado."; a lista mostra "R$ 99,90 por mês"; a Atividade mostra "Alterou o cadastro do filho Teste de QA" com "Campos: mesada" e sem o valor. Salvar de novo sem mudar nada não cria outro registro.

### Caso 5 — Criar o login e desativá-lo

**O que fazer:**
1. Na página de `Teste de QA`, em "Login do filho", informe `qa@exemplo.local` e senha `senha-do-qa-1` e clique em "Criar login".
2. Tente criar outro login para o mesmo filho com outro e-mail; e outro filho com `qa@exemplo.local`.
3. Clique em "Desativar login" e depois em "Confirmar desativação".

**O que deve acontecer:** passo 1 mostra "Login criado." e depois "Login ativo". O passo 2 não oferece segundo login; e-mail repetido é recusado. Passo 3: "Login desativado."; a conta não entra mais, e não existe botão para reativar.

### Caso 6 — O filho vê só a própria mesada

**O que fazer:** saia; entre com `ana@exemplo.local`.

**O que deve acontecer:** o painel mostra "Painel da família" e "Não há resumo da casa para o seu perfil." com o link "Ver minha mesada", sem nenhum valor. O menu tem só **Painel**, **Minha mesada** e **Meu perfil**. Em Minha mesada: "Ana", "R$ 50,00 por semana", a frase de que é um combinado, não um saldo, e "Ainda não há movimentos de mesada". Nada de Pedro. Entre com `pedro@exemplo.local` e confira que só aparecem os dados dele.

**O que indicaria falha:** qualquer valor da casa, qualquer dado do irmão, itens de menu a mais, botões de ação na mesada.

### Caso 7 — O filho é barrado no resto

**O que fazer:** como Ana, digite na barra de endereço `/lancamentos`, `/lancamentos/novo`, `/lancamentos/categorias`, `/atividade`, `/configuracoes/usuarios`, `/filhos` e `/filhos/novo`. Tente também `/mesada?filho=qualquer`.

**O que deve acontecer:** cada endereço devolve ao painel, sem mostrar dado. `/mesada?filho=qualquer` continua mostrando só a mesada da Ana.

### Caso 8 — Perfil e senha do filho

**O que fazer:** como Ana, abra Meu perfil e troque a senha em "Trocar senha" (de `demo1234` para outra de 8 ou mais caracteres); depois volte para `demo1234` se precisar repetir o roteiro.

**O que deve acontecer:** as duas telas funcionam como para os outros papéis.

### Caso 9 — O adulto não gerencia filhos

**O que fazer:** entre com `adulto@exemplo.local`; confira o menu e tente `/filhos` e `/mesada`.

**O que deve acontecer:** o menu não tem Filhos nem Minha mesada; os dois endereços devolvem ao painel.

### Caso 10 — A tela Usuários não cria filho

**O que fazer:** como responsável, abra Configurações, Usuários.

**O que deve acontecer:** o campo Papel oferece só Adulto e Responsável; os logins dos filhos aparecem na lista com o papel "Filho".

### Caso 11 — Aparência: tema e celular

**O que fazer:** alterne entre tema claro e escuro nas telas Filhos, página do filho e Minha mesada; reduza a janela abaixo de 768px.

**O que deve acontecer:** tudo legível nos dois temas; no celular os cartões ficam um embaixo do outro, os campos e botões têm tamanho de toque, sem rolagem horizontal, e o menu abre como gaveta.

## 4. O que observar de colateral

- Lançamentos, Categorias, o resumo do painel e Atividade continuam como antes para o responsável e o adulto.
- A seed rodada de novo não duplica filhos nem desfaz o que foi editado.
- Nenhuma tela mostra e-mail do filho para quem não é o responsável; a Atividade nunca mostra valor, e-mail nem data de nascimento.

## 5. Critério objetivo de aprovação

Aprovado se os casos 1 a 10 acontecerem exatamente como descritos, o caso 11 não mostrar texto ilegível nem rolagem horizontal, e nenhum dado de um filho aparecer para o outro. Qualquer valor de casa visível ao filho, qualquer dado do irmão, ou um endereço proibido que abra para o filho reprova.

## 6. Dados de teste fictícios

Filho `Teste de QA`, valor `1.234,56`, e-mail `qa@exemplo.local`, senha `senha-do-qa-1`. Nenhum dado real é necessário.
