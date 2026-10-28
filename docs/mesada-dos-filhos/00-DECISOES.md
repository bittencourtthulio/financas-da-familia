---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: mesada-dos-filhos
origem_buildx: financas-da-familia
feature_id: FT-06
respondido_por: buildx
densidade: padrao
modo_construcao: autonomo
atualizado_em: 2026-10-28
decisoes:
  - id: D-00
    decisao: densidade padrao, construcao autonomo
    alternativa_descartada: null
    motivo: "respondido pelo buildx: modo autonomo do projeto (PROJETO.md, Origem); fonte PR-01"
    status: fechada
    bloqueante: false
  - id: D-01
    decisao: Escopo - movimentos de mesada (credito e gasto) registrados, editados e apagados pelo responsavel; extrato e saldo por filho; filho le o proprio extrato e saldo na pagina /mesada; auditoria; seed; estados; tokens; uma migration
    alternativa_descartada: Mesada automatica ou recorrente, aprovacao de gasto, pedido de gasto pelo filho, metas, juros, tarefas, transferencia entre filhos; exportar e apagar dados do filho
    motivo: "MAPA.md FT-06 Entrega; PROJETO.md fora de escopo; FT-07 como nao-objetivo; PR-32 e PR-33 (novas)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Movimento com tipo credito ou gasto, valor inteiro positivo de centavos lido por lerValorEmReais (R$ 0,01 a R$ 1.000.000,00), data civil AAAA-MM-DD de 2000 a 2100 (futura vale), descricao opcional ate 200 caracteres; o sinal vem do tipo
    alternativa_descartada: Valor com sinal; data futura proibida; descricao obrigatoria
    motivo: "PR-02, PR-26 reaproveitada, PR-32 (nova)"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Saldo do filho = soma dos creditos menos soma dos gastos de todos os movimentos, sem corte por data, calculado no servidor por groupBy com _sum de inteiros (padrao de resumo.ts); nunca Float, Decimal, parseFloat nem soma no cliente
    alternativa_descartada: Somar na tela; saldo por mes; saldo gravado em coluna
    motivo: "PR-02; PR-29 como padrao de agregacao; PR-32; coluna de saldo divergiria do extrato"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: Saldo negativo e permitido e sinalizado - sinal de menos e frase 'Saldo negativo' (nao so cor), e a acao de registrar avisa o responsavel quando o gasto deixou o saldo negativo; nao bloqueia
    alternativa_descartada: Bloquear gasto acima do saldo
    motivo: "Tarefa (nao declarado: siga permitindo e sinalizando); PR-32; opcao mais simples e reversivel; pendencia decisao_humana nao bloqueante"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Tabela movimentos_de_mesada com chave estrangeira filhoId para filhos com onDelete Cascade, indice por filho e data, valorCentavos Int; migration versionada; movimento nao muda de filho
    alternativa_descartada: Restrict; SetNull; guardar o movimento dentro de Filho
    motivo: "PR-09 (exclusao apaga de fato), PR-33 (nova); nota para a FT-07 exportar e apagar por filho"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: Autorizacao - so admin registra, edita, apaga e le movimentos e saldo de qualquer filho; o adulto (usuario) e negado com 403 e nao ve a mesada; o filho le so o proprio extrato por meuExtrato, que nao recebe id; toda funcao do servico comeca pela guarda
    alternativa_descartada: Adulto tambem gerir ou ver a mesada
    motivo: "PR-06; PR-30 (so admin gerencia filho); PR-33 (nova); pendencia decisao_humana nao bloqueante"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: Isolamento entre irmaos por construcao - o filho nunca informa id de filho nem de movimento; as funcoes com id sao so do admin e respondem 403 ao filho igual para id de irmao e inexistente; a pagina /mesada le somente o parametro pagina
    alternativa_descartada: Aceitar filhoId em /mesada e comparar
    motivo: "PR-06; PROJETO.md criterio de aceite; IDOR provado por teste, em servico e no servidor real"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: Servico novo src/servicos/mesada.ts (registrarMovimento, editarMovimento, apagarMovimento, obterMovimento, extratoDoFilho, saldosDosFilhos, meuExtrato) em vez de estender filhos.ts, para nao quebrar a varredura de filhos-papeis e manter camadas
    alternativa_descartada: Acrescentar as funcoes em filhos.ts
    motivo: "CONVENCOES secao 5 (caso de uso em src/servicos); tests/filhos-papeis.test.ts"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: Auditoria - tres acoes no catalogo (mesada.registrada, mesada.alterada, mesada.apagada), entidade mesada, id do movimento, na mesma transacao; detalhe so com alvoNome (nome do filho), filhoId e tipo; nunca valor, saldo nem descricao; edicao sem mudanca real nao grava
    alternativa_descartada: Gravar o valor ou o antes e o depois
    motivo: "PR-10; PR-25; barreira de chaves em registrarAtividade"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: Apagar movimento e definitivo, com confirmacao em dois passos na tela e rastro sem valor (coerente com a exclusao de lancamento)
    alternativa_descartada: Lixeira ou remocao logica; apagar com um clique
    motivo: "PR-28 como precedente; PR-33 (nova); pendencia decisao_humana nao bloqueante"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Rotas do responsavel - /filhos/[id]/mesada (saldo, formulario rapido e extrato paginado) e /filhos/[id]/mesada/[movimentoId] (editar e apagar), com link na pagina do filho e saldo no cartao da lista; movimento de outro filho na URL cai em nao encontrado; /mesada do filho preenchida; nada de nova area de Configuracoes
    alternativa_descartada: Secao dentro de /filhos/[id]
    motivo: "MAPA.md e tarefa (secao ou subrota dedicada); D-10 da FT-05"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: As acoes (registrarMovimentoDeMesada, salvarMovimentoDeMesada, excluirMovimentoDeMesada) ficam em src/app/acoes.ts, chamam exigirUsuarioAdmin FORA do try e o servico verifica de novo; a tabela de acoes sensiveis de tests/filhos-acoes.test.ts e ampliada primeiro
    alternativa_descartada: Acoes sem teste de papel
    motivo: "CONVENCOES secao 5 e 7; defeito achado na FT-05; PR-06"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: Tela do filho - saldo em destaque com texto (Saldo disponivel, Saldo zerado ou Saldo negativo), extrato em ordem decrescente de data, 30 por pagina, paginacao por link, estado vazio, carregando e erro herdados do grupo, o valor combinado mantido como referencia rotulada; sem formulario nem botao; so tokens, dois temas, celular, skill frontend-design (PR-08)
    alternativa_descartada: Cores e fontes proprias; mostrar o saldo so por cor
    motivo: "Tarefa; PR-07, PR-08, PR-16; 08-design-system.md"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: Tela do responsavel - formulario de movimento rapido (tipo credito ou gasto, valor, data de hoje por padrao, descricao) reaproveitando Formulario, e extrato com link de edicao por linha; campos de formulario reiniciam apos o envio como os demais do projeto
    alternativa_descartada: Modal; edicao inline
    motivo: "Tarefa (formulario rapido); padrao CamposDeLancamento"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: Seed de demonstracao idempotente e nunca em producao - movimentos ficticios para Ana (saldo positivo) e Pedro (saldo negativo), ids fixos, upsert sem sobrescrever, datas relativas ao mes corrente
    alternativa_descartada: Sem movimentos; saldo positivo para os dois
    motivo: "PR-04; tarefa (um filho com saldo negativo ou zerado para provar o estado)"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: Ambiente e segredos - nenhuma variavel nova, nenhuma dependencia nova; uma migration
    alternativa_descartada: null
    motivo: "PR-12; PR-20 (versoes fixadas)"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: Definicao de pronto - o responsavel registra credito e gasto de um filho e ve o saldo correto; edita e apaga; o filho entra e ve so o proprio extrato e saldo, sem alterar nem ver o irmao; o adulto e o filho sao negados em todas as funcoes e acoes de escrita; auditoria sem valor; PR-01 realizada; dois temas, celular; quatro comandos verdes
    alternativa_descartada: null
    motivo: "MAPA.md FT-06 Entrega e PROJETO.md Criterios de aceite"
    status: fechada
    bloqueante: false
---

# Decisões — mesada-dos-filhos

> F2 respondida pelo buildx (`respondido_por: buildx`), nos quatro degraus: PROJETO, PREMISSAS, CONVENCOES, e só então premissa nova `f2_autonoma`. Nenhum humano foi consultado.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo (respondida pelo buildx, não pelo usuário)

## Decisões

```
D-00 | densidade padrao, construcao autonomo | - | respondido pelo buildx: modo autonomo do projeto (PROJETO.md, Origem); fonte PR-01
D-01 | Escopo | Mesada automatica, aprovacao, pedido de gasto, metas, juros, tarefas, transferencia; exportar e apagar dados | MAPA.md FT-06 Entrega; PROJETO.md fora de escopo; PR-32 e PR-33 (novas)
D-02 | Movimento: tipo, valor, data, descricao | Valor com sinal; data futura proibida; descricao obrigatoria | PR-02, PR-26, PR-32
D-03 | Saldo = creditos menos gastos, sem corte por data, groupBy de inteiros no servidor | Somar na tela; saldo por mes; coluna de saldo | PR-02; PR-29; PR-32
D-04 | Saldo negativo permitido e sinalizado, sem bloquear | Bloquear gasto acima do saldo | Tarefa; PR-32; opcao mais simples e reversivel
D-05 | Chave estrangeira filhoId com Cascade, indice por filho | Restrict; SetNull | PR-09; PR-33; nota para a FT-07
D-06 | Autorizacao: so admin escreve e le tudo; adulto negado; filho le so o proprio | Adulto ve ou gere | PR-06; PR-30; PR-33
D-07 | Isolamento entre irmaos por construcao, sem id do filho na entrada | Aceitar filhoId em /mesada | PR-06; criterio de aceite; IDOR provado
D-08 | Servico novo src/servicos/mesada.ts | Estender filhos.ts | CONVENCOES secao 5; filhos-papeis
D-09 | Tres acoes na trilha, detalhe sem valor, saldo nem descricao | Gravar o valor | PR-10; PR-25
D-10 | Apagar definitivo com dois passos | Lixeira; um clique | PR-28; PR-33
D-11 | Rotas /filhos/[id]/mesada e /filhos/[id]/mesada/[movimentoId]; /mesada preenchida | Secao em /filhos/[id] | MAPA.md; D-10 da FT-05
D-12 | Acoes com a guarda fora do try e tabela de acoes ampliada primeiro | Acoes sem teste de papel | CONVENCOES 5 e 7
D-13 | Tela do filho: saldo em destaque com texto, extrato paginado, estados, tokens | Saldo so por cor | PR-07, PR-08, PR-16
D-14 | Tela do responsavel: formulario rapido e extrato com edicao por linha | Modal; edicao inline | padrao CamposDeLancamento
D-15 | Seed: Ana com saldo positivo, Pedro com saldo negativo | Sem movimentos | PR-04
D-16 | Nenhuma variavel nem dependencia nova; uma migration | - | PR-12; PR-20
D-17 | Definicao de pronto | - | MAPA.md FT-06 e PROJETO.md
```

## Eixos cobertos

1. **Escopo de negócio:** D-01, D-04, D-06, D-10. 2. **Arquitetura:** D-05, D-08, D-11, D-12 (camadas inalteradas, PR-17). 3. **Contrato de dados:** D-02, D-03, D-05. 4. **Estado e observabilidade:** D-09, D-13 (vazio, carregando e erro). 5. **Resiliência e política de erro:** D-06, D-07, D-12. 6. **Ambiente e segredos:** D-16. 7. **Definição de pronto:** D-17.

## Premissas criadas nesta F2

PR-32 (forma do movimento de mesada e o saldo) e PR-33 (quem mexe na mesada, apagar movimento e o vínculo com o filho) — `origem: f2_autonoma`, em `docs/projeto/PREMISSAS.md`. A PR-01 (leitura de "mesa" como mesada) é realizada por esta feature.

## Pendências

Nenhuma bloqueante. Quatro pendências `decisao_humana`, não bloqueantes, resolvidas com a opção mais simples e reversível (registradas também em `00-BLOQUEIOS.md`):

1. Bloquear gasto acima do saldo, mesada automática, aprovação de gasto, pedido de gasto pelo filho, metas, juros, tarefas e transferência entre filhos? Hoje: nada disso existe; saldo negativo é permitido e sinalizado (PR-32).
2. O adulto deve ver ou lançar a mesada? Hoje: só o responsável (PR-33).
3. Lixeira ou desfazer ao apagar movimento? Hoje: apagar é definitivo, com dois passos (PR-33).
4. Data futura e saldo por período: hoje a data futura vale e o saldo soma tudo (PR-32).
