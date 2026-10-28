# Pacote de QA — Lançamentos da casa: registrar receitas e despesas

## 1. O que mudou

O sistema agora guarda as receitas e as despesas da casa. No menu há **Lançamentos** (com **Categorias** logo abaixo), disponível para o responsável e para o adulto. Dá para lançar, corrigir e apagar, e criar categorias novas. Cada ação aparece em **Atividade**, que só o responsável vê, sem mostrar o valor. Não há saldo nem total do mês ainda.

## 2. Ambiente

- Banco com a seed de demonstração aplicada (`npm run setup`) e o sistema no ar (`npm run dev`, endereço `http://localhost:3000`).
- Contas fictícias: `responsavel@exemplo.local` e `adulto@exemplo.local`, ambas com a senha `demo1234`.
- A seed cria sete categorias e seis lançamentos no mês atual (aluguel, compras da semana, combustível, cinema, salário e venda de móveis).
- Dados de teste a criar: categoria "Pet" (despesa); lançamento de despesa "45,90" com descrição "Ração"; lançamento de receita "1.234,56" com descrição "Freela".

## 3. Roteiro de teste

### Caso 1 — O adulto vê os lançamentos do mês

**O que fazer:**
1. Entre com `adulto@exemplo.local` e `demo1234`.
2. No menu, clique em "Lançamentos".

**O que deve acontecer:**
A tela mostra o mês atual por extenso, com "Mês anterior" e "Próximo mês", e as opções Todos, Receitas e Despesas. A tabela traz seis linhas, da data mais recente para a mais antiga. Despesas aparecem com sinal de menos e em vermelho (por exemplo "-R$ 1.800,00" no Aluguel); receitas em verde (por exemplo "R$ 5.200,00" no Salário). Não há nenhum total ou saldo. O menu não mostra "Atividade".

**O que indicaria falha:**
Valor com ponto no lugar da vírgula, centavos trocados, "R$ NaN", linhas fora de ordem, texto em inglês, ou o item "Atividade" visível para o adulto.

### Caso 2 — Filtrar por tipo e navegar pelos meses

**O que fazer:**
1. Em "Lançamentos", clique em "Receitas", depois em "Despesas", depois em "Todos".
2. Clique em "Mês anterior".

**O que deve acontecer:**
"Receitas" mostra só as duas receitas; "Despesas", só as quatro despesas. Em "Mês anterior" a tela mostra "Nenhum lançamento em <mês> de <ano>" e o convite para usar "Novo lançamento". Ao trocar o mês com o filtro ativo, o filtro continua.

**O que indicaria falha:**
Lançamento de outro tipo na lista filtrada, ou o filtro sumindo ao trocar de mês.

### Caso 3 — Criar uma categoria

**O que fazer:**
1. Em "Categorias", em "Nova categoria", digite "Pet", escolha "Despesa" e clique em "Criar categoria".
2. Repita com "pet" (minúsculo) e tipo Despesa.
3. Repita com "Pet" e tipo Receita.

**O que deve acontecer:**
O primeiro envio mostra "Categoria criada." e "Pet" aparece em Despesas. O segundo mostra o erro "Já existe uma categoria com este nome.". O terceiro cria "Pet" também em Receitas (o mesmo nome vale em outro tipo).

**O que indicaria falha:**
Duas categorias de despesa com o mesmo nome, ou erro técnico em inglês.

### Caso 4 — Lançar uma despesa

**O que fazer:**
1. Em "Lançamentos", clique em "Novo lançamento".
2. Deixe "Despesa", digite o valor `45,90`, deixe a data de hoje, escolha a categoria "Pet" e digite a descrição "Ração". Clique em "Salvar lançamento".

**O que deve acontecer:**
A tela volta para a lista do mês e a nova linha aparece como "-R$ 45,90", categoria "Pet", descrição "Ração".

**O que indicaria falha:**
Valor diferente de 45,90, data de outro dia, ou categoria de receita oferecida na lista de uma despesa.

### Caso 5 — Lançar uma receita e testar valores inválidos

**O que fazer:**
1. Em "Novo lançamento", escolha "Receita". A lista de categorias muda para as de receita.
2. Digite `1.234,56`, categoria "Salário", descrição "Freela", e salve.
3. Tente de novo com valor `abc`, depois `0`, depois `-5`, depois `1234.56`, depois `2.000.000,00`.

**O que deve acontecer:**
O primeiro lançamento aparece como "R$ 1.234,56" em verde. Cada valor inválido mostra o aviso "Valor inválido. Use o formato 1.234,56, de R$ 0,01 até R$ 1.000.000,00." e não cria nada.

**O que indicaria falha:**
Algum valor inválido ser aceito, ou o valor gravado diferente do digitado.

### Caso 6 — Editar um lançamento

**O que fazer:**
1. Na linha "Ração", clique em "Editar".
2. Confira que o formulário vem preenchido (valor `45,90`). Mude o valor para `50` e salve.

**O que deve acontecer:**
A lista mostra "-R$ 50,00".

**O que indicaria falha:**
Formulário vazio, valor `4590` em vez de `45,90`, ou o valor antigo na lista.

### Caso 7 — Apagar um lançamento (dois passos)

**O que fazer:**
1. Em "Editar" da linha "Ração", clique em "Apagar lançamento".
2. Leia o aviso e clique em "Cancelar". Clique de novo em "Apagar lançamento" e depois em "Confirmar exclusão".

**O que deve acontecer:**
O primeiro clique só mostra o aviso ("não pode ser desfeita"); "Cancelar" volta ao estado inicial. A confirmação leva à lista, sem a linha "Ração".

**O que indicaria falha:**
Apagar já no primeiro clique, ou a linha continuar na lista.

### Caso 8 — A trilha de atividade registra, sem valor

**O que fazer:**
1. Saia e entre com `responsavel@exemplo.local` / `demo1234`.
2. Abra "Atividade".

**O que deve acontecer:**
No topo, linhas feitas por "Adulto de demonstração": "Apagou o lançamento" (detalhe "Despesa"), "Alterou o lançamento", "Criou o lançamento" (Receita e Despesa) e "Criou a categoria Pet" (detalhes "Despesa" e "Receita"). Em nenhuma linha aparece valor, descrição, "Ração" ou "Freela".

**O que indicaria falha:**
Qualquer valor em reais na tela Atividade, ou código técnico como `lancamento.criado`.

### Caso 9 — O responsável também lança

**O que fazer:**
1. Ainda como responsável, abra "Lançamentos" e edite qualquer linha da seed, mudando só a descrição.

**O que deve acontecer:**
Funciona como para o adulto; em "Atividade" surge "Alterou o lançamento" feito por "Responsável de demonstração".

### Caso 10 — Aparência: tema e celular

**O que fazer:**
1. Alterne entre tema claro e escuro (barra de baixo) em "Lançamentos" e em "Novo lançamento".
2. Reduza a janela abaixo de 768px (ou use o celular) e abra o menu pelo botão "Menu".

**O que deve acontecer:**
Os dois temas são legíveis, inclusive o seletor de data. No celular a tabela rola para o lado, os botões e campos têm tamanho de toque e o menu abre como gaveta.

**O que indicaria falha:**
Texto ilegível, valor cortado sem rolagem, ou campo difícil de tocar.

## 4. O que observar de colateral

- Usuários (Configurações > Usuários) e Atividade de usuários continuam funcionando como antes.
- O painel `/` continua sem total (FT-04).
- Depois de uns 15 minutos com a aba aberta a sessão continua válida (renovação deslizante).

## 5. Critério objetivo de aprovação

Aprovado se os casos 1 a 9 acontecerem exatamente como descritos, o caso 10 não mostrar texto ilegível, e nenhum valor em reais aparecer na tela Atividade. Qualquer valor gravado diferente do digitado reprova a entrega.
