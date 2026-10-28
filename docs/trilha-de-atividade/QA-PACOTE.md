# Pacote de QA — Trilha de atividade: ver quem fez cada ação

## 1. O que mudou

Existe uma tela nova, **Atividade**, que só o responsável vê. Ela lista quem criou usuários, quem desativou usuários e quem mudou o papel de alguém, com a data e a hora de cada ação. O adulto não vê essa tela. A tela não mostra senha, e-mail nem valores.

## 2. Ambiente

- Banco com a seed de demonstração aplicada (`npm run setup`) e o sistema no ar (`npm run dev`, endereço `http://localhost:3000`).
- Contas fictícias: `responsavel@exemplo.local` e `adulto@exemplo.local`, ambas com a senha `demo1234`.
- Dados de teste a criar: usuário "Pessoa de Teste", e-mail `pessoa.teste@exemplo.local`, senha provisória `senha-provisoria-1`.

## 3. Roteiro de teste

### Caso 1 — O responsável vê a atividade de demonstração

**O que fazer:**
1. Entre com `responsavel@exemplo.local` e `demo1234`.
2. No menu da esquerda, logo abaixo de "Painel", clique em "Atividade".

**O que deve acontecer:**
O título é "Atividade". A tabela tem as colunas Quando, Quem, Ação e Detalhe, com duas linhas: "Criou o usuário Adulto de demonstração" (detalhe "Papel: Responsável") e "Alterou o papel de Adulto de demonstração" (detalhe "De Responsável para Adulto"), a mais recente primeiro, ambas feitas por "Responsável de demonstração", com data e hora no formato 00/00/0000 00:00.

**O que indicaria falha:**
Texto em inglês, códigos como `usuario.criado` ou `admin`, data sem hora, linhas fora de ordem, ou tela vazia.

### Caso 2 — Criar um usuário deixa rastro

**O que fazer:**
1. Em "Configurações > Usuários", crie "Pessoa de Teste" (e-mail e senha acima, papel "Adulto") e clique em "Criar usuário".
2. Volte para "Atividade".

**O que deve acontecer:**
Aparece no topo uma linha nova: "Criou o usuário Pessoa de Teste", detalhe "Papel: Adulto", feita por "Responsável de demonstração", com a data e a hora de agora (horário de Brasília).

**O que indicaria falha:**
Nenhuma linha nova, nome do ator errado, hora fora do fuso de São Paulo, ou a senha ou o e-mail aparecendo em qualquer coluna.

### Caso 3 — Desativar um usuário deixa rastro

**O que fazer:**
1. Em "Usuários", clique em "Desativar" na linha de "Pessoa de Teste".
2. Volte para "Atividade".

**O que deve acontecer:**
Uma linha nova no topo: "Desativou o usuário Pessoa de Teste", sem detalhe.

**O que indicaria falha:**
Nenhuma linha, ou duas linhas para uma só desativação.

### Caso 4 — O adulto não vê a atividade

**O que fazer:**
1. Clique em "Sair". Entre com `adulto@exemplo.local` e `demo1234`.
2. Olhe o menu da esquerda.
3. Digite na barra de endereço `http://localhost:3000/atividade` e tecle Enter.

**O que deve acontecer:**
O menu não tem o item "Atividade". Ao abrir o endereço, você volta ao painel; nenhuma linha da atividade chega a aparecer.

**O que indicaria falha:**
O item no menu, a tabela aparecendo, ou nomes de outras pessoas visíveis por um instante.

### Caso 5 — Sem entrar, a tela não abre

**O que fazer:**
Clique em "Sair" e abra `http://localhost:3000/atividade`.

**O que deve acontecer:**
Você é levado à tela de entrada.

**O que indicaria falha:**
Qualquer dado da atividade visível sem login.

### Caso 6 — Tema e celular

**O que fazer:**
1. Entre como responsável, abra "Atividade", alterne entre tema claro e escuro (botão na barra azul de baixo).
2. Estreite a janela do navegador abaixo de 768 pixels (ou use o modo celular das ferramentas do navegador).

**O que deve acontecer:**
Nos dois temas a tabela é legível, sem cor estranha ou texto ilegível. No celular o menu vira o botão "Menu" e a tabela rola para o lado em vez de estourar a tela.

**O que indicaria falha:**
Texto invisível em um dos temas, tabela que empurra a página para os lados, ou botão "Menu" ausente.

## 4. O que observar de colateral

- "Usuários": criar, desativar e a mensagem "Usuário criado." continuam como antes.
- Criar um usuário com e-mail repetido continua dando erro e **não** deve deixar linha nova em "Atividade".
- Rebaixar ou desativar o último responsável continua sendo recusado e não deixa linha.
- A seed rodada de novo não duplica as duas linhas de demonstração.

## 5. Critério objetivo de aprovação

Os casos 1 a 6 passam e nenhum item da seção 4 regrediu. Qualquer código técnico, senha, e-mail ou valor visível na tela de Atividade reprova a entrega.
