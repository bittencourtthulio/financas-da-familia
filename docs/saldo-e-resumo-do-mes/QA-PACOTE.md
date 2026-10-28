# Pacote de QA — Saldo e resumo do mês: o painel mostra o que entrou e o que saiu

## 1. O que mudou

O painel inicial (a primeira tela depois do login) agora mostra o resumo do mês para o responsável e para o adulto: quanto entrou (Receitas), quanto saiu (Despesas), o que sobrou ou faltou (Saldo do mês) e quanto cada categoria de despesa pesou. Dá para olhar outros meses pelos links "Mês anterior" e "Próximo mês". O saldo é sempre só do mês que está na tela: ele não soma meses anteriores.

## 2. Ambiente

- Banco com a seed de demonstração aplicada (`npm run setup`) e o sistema no ar (`npm run dev`, endereço `http://localhost:3000`).
- Contas fictícias: `responsavel@exemplo.local` e `adulto@exemplo.local`, ambas com a senha `demo1234`.
- A seed cria lançamentos em três meses, contados a partir do dia em que ela rodou. Os valores abaixo valem para o mês em que a seed rodou ("mês atual"), o mês anterior e o retrasado.

| Mês | Receitas | Despesas | Saldo | Despesas por categoria |
|---|---|---|---|---|
| Atual | R$ 5.550,00 | R$ 3.024,75 | R$ 2.525,25 | Moradia R$ 1.800,00; Mercado R$ 954,85 (2 lançamentos); Lazer R$ 149,90 (2); Transporte R$ 120,00 |
| Anterior | R$ 5.200,00 | R$ 2.851,90 | R$ 2.348,10 | Moradia R$ 1.800,00; Mercado R$ 718,90; Saúde R$ 235,00; Transporte R$ 98,00 |
| Retrasado | R$ 200,00 | R$ 850,00 | -R$ 650,00 | Saúde R$ 850,00 |

## 3. Roteiro de teste

### Caso 1 — O adulto vê o resumo do mês

**O que fazer:**
1. Entre com `adulto@exemplo.local` e `demo1234`.
2. Você chega ao Painel da família.

**O que deve acontecer:**
Aparecem o título "Painel da família", a frase "Bem-vindo, Adulto de demonstração...", o mês atual por extenso com "Mês anterior" e "Próximo mês", três cartões e a lista "Despesas por categoria". Os valores são os da linha "Atual" da tabela do item 2. Em "Saldo do mês" aparece "Saldo positivo: sobrou dinheiro no mês." A lista começa por Moradia e cada categoria mostra a quantidade de lançamentos e uma barra fina embaixo.

**O que indicaria falha:**
Valor com ponto no lugar da vírgula, centavos trocados, "R$ NaN", categorias fora de ordem, total de categorias diferente do total de Despesas, texto em inglês.

### Caso 2 — Navegar para o mês anterior e para o retrasado

**O que fazer:**
1. No painel, clique em "Mês anterior".
2. Clique em "Mês anterior" de novo.
3. Clique em "Mês atual".

**O que deve acontecer:**
O mês anterior mostra os valores da linha "Anterior". O retrasado mostra Receitas R$ 200,00, Despesas R$ 850,00 e Saldo "-R$ 650,00" com a frase "Saldo negativo: as despesas passaram das receitas." e o cartão do saldo com destaque em tom de perigo. "Mês atual" volta ao mês atual (o link só aparece quando você não está nele). A barra de endereço mostra `?mes=AAAA-MM`.

**O que indicaria falha:**
Saldo negativo sem o sinal de menos ou sem a frase (só mudar de cor não basta), saldo de um mês incluindo o do anterior, ou o link "Mês atual" aparecendo no mês atual.

### Caso 3 — Mês sem lançamentos

**O que fazer:**
1. Clique em "Próximo mês" a partir do mês atual.

**O que deve acontecer:**
O seletor continua na tela. No lugar dos cartões aparece "Nenhum lançamento em <mês> de <ano>", com os links "Novo lançamento" e "Lançamentos". "Lançamentos" abre a lista já no mesmo mês.

**O que indicaria falha:**
Cartões com R$ 0,00 no lugar da mensagem, tela de erro, ou o atalho levando a outro mês.

### Caso 4 — Endereço com mês inválido

**O que fazer:**
1. Digite na barra de endereço `http://localhost:3000/?mes=lixo` e abra. Repita com `?mes=2026-13` e `?mes=1999-12`.

**O que deve acontecer:**
Em todos os casos o painel abre normalmente, no mês atual, sem erro.

**O que indicaria falha:**
Tela de erro, página em branco, ou mês errado.

### Caso 5 — O resumo reflete um lançamento novo (critério de aceite do negócio)

**O que fazer:**
1. Em "Lançamentos > Novo lançamento", registre uma despesa de `100,00`, categoria "Mercado", data de hoje, descrição "Teste de QA".
2. Volte ao Painel.
3. Apague o lançamento "Teste de QA" (Lançamentos, Editar, Apagar, Confirmar) e volte ao Painel.

**O que deve acontecer:**
Depois do passo 2, no mês atual: Despesas R$ 3.124,75, Saldo R$ 2.425,25 e Mercado R$ 1.054,85 (3 lançamentos). Depois do passo 3 os valores voltam aos da tabela do item 2.

**O que indicaria falha:**
Algum valor não mudar, mudar por quantia diferente de R$ 100,00, ou o lançamento apagado continuar contando.

### Caso 6 — O responsável vê o mesmo

**O que fazer:**
1. Saia e entre com `responsavel@exemplo.local` e `demo1234`.

**O que deve acontecer:**
O painel traz os mesmos valores do Caso 1, e o menu mostra também "Atividade".

### Caso 7 — Aparência: tema e celular

**O que fazer:**
1. Alterne entre tema claro e escuro (barra de baixo), no mês atual e no retrasado (saldo negativo).
2. Reduza a janela abaixo de 768px (ou use o celular) e abra o menu pelo botão "Menu".

**O que deve acontecer:**
Os dois temas são legíveis, inclusive o cartão do saldo negativo. No celular os três cartões ficam um embaixo do outro, os links do seletor têm tamanho de toque, a lista de categorias cabe na largura sem rolar para o lado e o menu abre como gaveta.

**O que indicaria falha:**
Texto ilegível, valor cortado, cores que somem num dos temas, ou rolagem horizontal da página.

## 4. O que observar de colateral

- Lançamentos (lista, novo, edição, categorias) e Atividade continuam funcionando como antes. A lista do mês atual agora tem oito linhas (a seed ganhou dois lançamentos no mês atual); o roteiro da FT-03 falava em seis.
- Nenhum valor do resumo aparece na tela Atividade (a trilha nunca guarda valor).
- Usuários, perfil e troca de senha não mudaram.
- O papel `filho` ainda não existe na interface (chega na FT-05); quando existir, o painel dele não deve mostrar nenhum valor.

## 5. Critério objetivo de aprovação

Aprovado se os casos 1 a 6 acontecerem exatamente como descritos, o caso 7 não mostrar texto ilegível nem rolagem horizontal, e nenhum valor divergir da tabela do item 2 em um centavo. Qualquer erro de centavo, saldo negativo sem sinal ou frase, ou tela de erro por mês inválido reprova.

## 6. Dados de teste fictícios

Despesa "Teste de QA", `100,00`, categoria Mercado. Nenhum dado real é necessário.
