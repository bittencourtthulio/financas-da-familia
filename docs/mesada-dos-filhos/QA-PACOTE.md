# Pacote de QA — Mesada dos filhos: movimentos, extrato e saldo

## 1. O que mudou

O responsável agora registra **créditos de mesada** e **gastos** de cada filho em **Filhos > Ver mesada**, vê o saldo e o extrato, e pode corrigir ou apagar um movimento. O **filho** vê em **Minha mesada** o saldo em destaque (dito em palavras) e o extrato, só para ler, sem nunca ver o irmão. O gasto acima do saldo é aceito: o saldo fica negativo e é sinalizado. O valor combinado continua só informativo. O adulto não vê a mesada.

## 2. Ambiente

- Banco com a seed aplicada (`npm run setup`) e o sistema no ar (`npm run dev`, endereço `http://localhost:3000`).
- Contas fictícias, todas com a senha `demo1234`: `responsavel@exemplo.local` (responsável), `adulto@exemplo.local` (adulto), `ana@exemplo.local` (filha, saldo positivo de R$ 78,60 depois da seed) e `pedro@exemplo.local` (filho, saldo negativo de R$ 29,90 depois da seed).

## 3. Roteiro de teste

### Caso 1 — O responsável vê os saldos

**O que fazer:** entre com `responsavel@exemplo.local`; abra **Filhos**.

**O que deve acontecer:** o cartão da Ana mostra "Saldo disponível: R$ 78,60"; o do Pedro mostra "Saldo negativo: -R$ 29,90". Cada cartão tem o link "Ver mesada".

**O que indicaria falha:** saldo só por cor, sem o texto; sinal de menos ausente no Pedro; valor diferente.

### Caso 2 — Extrato e saldo de um filho

**O que fazer:** clique em "Ver mesada" da Ana.

**O que deve acontecer:** o saldo em destaque ("Saldo disponível", R$ 78,60), "Recebido R$ 150,00" e "Gasto R$ 71,40"; o formulário "Novo movimento"; o extrato do mais recente ao mais antigo, com gastos em "-R$" e créditos sem sinal; "Mesada combinada: R$ 50,00 por semana" só como referência.

### Caso 3 — Registrar um crédito e um gasto

**O que fazer:**
1. Na mesada da Ana, escolha **Crédito**, valor `1.234,56`, descrição `Teste de QA`, e clique em "Registrar movimento".
2. Registre um **Gasto** de `0,10`.

**O que deve acontecer:** "Movimento registrado." nos dois; o saldo passa a R$ 1.313,16 depois do primeiro e R$ 1.313,06 depois do segundo; os dois entram no topo do extrato.

### Caso 4 — Validação

**O que fazer:** tente valor `abc`, `0`, `12.5`, `1.000.000,01`, data em branco e descrição com mais de 200 caracteres.

**O que deve acontecer:** cada tentativa mostra uma mensagem em português e nada é registrado.

### Caso 5 — Saldo negativo avisa, não bloqueia

**O que fazer:** na mesada do Pedro, registre um **Gasto** de `10,00`.

**O que deve acontecer:** o gasto é gravado e a mensagem diz "Movimento registrado. Atenção: o saldo ficou negativo." O saldo continua com sinal de menos e a frase "Os gastos passaram do que foi recebido."

### Caso 6 — Editar e apagar

**O que fazer:** abra "Editar" do gasto de `0,10` da Ana, mude o valor para `0,20` e salve; depois abra de novo e use "Apagar movimento", "Confirmar exclusão".

**O que deve acontecer:** voltar ao extrato com o valor novo e o saldo recalculado; depois da exclusão, o movimento some e o saldo é recalculado. O primeiro clique em apagar só pede confirmação; "Cancelar" desiste. Em **Atividade** aparecem "Registrou movimento de mesada de Ana", "Alterou…" e "Apagou…" com "Crédito" ou "Gasto", e nunca valor, saldo nem descrição.

### Caso 7 — O filho vê só o que é dele

**O que fazer:** saia; entre com `ana@exemplo.local`; abra **Minha mesada**. Depois entre com `pedro@exemplo.local`.

**O que deve acontecer:** Ana vê o próprio saldo e extrato; Pedro vê "Saldo negativo" e o dele; nenhum vê o outro. A página não tem botões nem formulário. Digite `/mesada?filho=qualquer` e `/mesada?pagina=2`: continua a mesma página do próprio filho.

**O que indicaria falha:** qualquer dado do irmão; botão de registrar, editar ou apagar; id na tela.

### Caso 8 — O filho é barrado no resto

**O que fazer:** como Ana, digite `/filhos` e, com o id de um filho copiado pelo responsável, `/filhos/<id>/mesada`.

**O que deve acontecer:** voltam ao painel, sem mostrar dado.

### Caso 9 — O adulto não vê a mesada

**O que fazer:** entre com `adulto@exemplo.local`; confira o menu e tente `/filhos` e `/filhos/<id>/mesada`.

**O que deve acontecer:** o menu não tem Filhos nem Minha mesada; os endereços devolvem ao painel.

### Caso 10 — Extrato longo e página

**O que fazer:** registre mais de 30 movimentos (ou use vários créditos de `0,01`) na mesada da Ana; navegue por "Próxima" e "Anterior"; tente `?pagina=999` e `?pagina=abc`.

**O que deve acontecer:** 30 movimentos por página, sem repetir; "Página 1 de 2"; a página 999 mostra a última, e `abc` mostra a primeira. O saldo continua o mesmo em todas as páginas.

### Caso 11 — Aparência: tema e celular

**O que fazer:** alterne entre tema claro e escuro na mesada do responsável e do filho; reduza a janela abaixo de 768px.

**O que deve acontecer:** tudo legível nos dois temas, o saldo negativo se distingue pelo texto e não só pela cor; no celular o extrato rola dentro da própria caixa, sem rolagem horizontal da página, e links e botões têm tamanho de toque.

## 4. O que observar de colateral

- Lançamentos, Categorias, o resumo do painel, Atividade e o cadastro de filhos (FT-05) continuam como antes.
- A seed rodada de novo não duplica movimentos nem desfaz o que foi editado.
- Nenhuma tela mostra a mesada de um filho para quem não é o responsável nem o próprio filho.

## 5. Critério objetivo de aprovação

Aprovado se os casos 1 a 10 acontecerem exatamente como descritos, o caso 11 não mostrar texto ilegível nem rolagem horizontal, e nenhum dado de um filho aparecer para o outro. Qualquer valor de mesada visível ao adulto, qualquer dado do irmão visível ao filho, qualquer botão de escrita na tela do filho, ou um saldo que não bata com a soma do extrato reprova.

## 6. Dados de teste fictícios

Valores `1.234,56` e `0,10`, descrição `Teste de QA`. Nenhum dado real é necessário.
