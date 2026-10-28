---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: lancamentos-da-casa
origem_buildx: financas-da-familia
feature_id: FT-03
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
    decisao: Escopo - entidades Categoria e Lancamento com migration, servico de categorias e lancamentos (criar, ler, editar, apagar, listar), tela Lancamentos com filtro por mes e tipo, formulario de novo e de edicao, rota de categorias dentro de Lancamentos, tres acoes de lancamento e uma de categoria na trilha, seed de demonstracao
    alternativa_descartada: Incluir total, saldo ou resumo na listagem
    motivo: "MAPA.md FT-03 Entrega; saldo e resumo sao da FT-04 (nao-objetivo nominal)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Valor guardado em coluna inteira de centavos (valorCentavos Int), sempre positivo; o sinal vem do tipo (receita ou despesa); nenhum Float nem Decimal no esquema, nenhum ponto flutuante no calculo
    alternativa_descartada: Valor com sinal na coluna
    motivo: "PR-02 (centavos inteiros, BRL); PR-26 (nova) registra o sinal pelo tipo e o limite"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Entrada do valor em formato brasileiro ("1.234,56", "12,5", "1234", com "R$" opcional) convertida por leitor proprio de texto, sem parseFloat; validada com zod no servico; positiva, ate R$ 1.000.000,00, sem NaN; ponto so como separador de milhar
    alternativa_descartada: Aceitar ponto decimal ("1234.56")
    motivo: "PR-02 e PR-16 (formato brasileiro); \"1.234\" seria ambiguo entre mil e um virgula duzentos e trinta e quatro; limite e a PR-26 (nova)"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: A data do lancamento e uma data civil (dia) guardada como texto AAAA-MM-DD no fuso America/Sao_Paulo; o filtro de mes compara texto; a data de hoje vem do relogio no fuso da familia; qualquer dia entre 2000-01-01 e 2100-12-31 vale, inclusive futuro
    alternativa_descartada: DateTime em UTC
    motivo: "PR-16 (fuso Sao_Paulo; DateTime UTC faria 23h de 27/10 virar 28/10); nao proibir data futura porque nenhum arquivo traz essa regra (PR-26)"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Descricao opcional, ate 200 caracteres, aparada; vazia mostra traco na lista
    alternativa_descartada: Descricao obrigatoria
    motivo: "(HIPOTESE) MAPA.md lista descricao como campo sem dizer obrigatoria; a opcao menos restritiva e a mais reversivel (PR-26)"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: Categoria pertence a um tipo (receita ou despesa); nome de 1 a 40 caracteres, unico por tipo sem diferenciar maiuscula; cria-se por responsavel ou adulto; nesta feature nao se edita, oculta nem apaga categoria; nao ha conjunto oficial nem categoria obrigatoria
    alternativa_descartada: Conjunto padrao criado pelo sistema; categoria editavel e apagavel
    motivo: "MAPA.md FT-03 (cria categorias novas) e lista de regra nao declarada; PR-27 (nova). Pendencia decisao_humana nao bloqueante: a familia quer renomear, apagar ou ter categorias padrao?"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: O lancamento so aceita categoria que existe e que e do mesmo tipo dele (422 caso contrario); trocar o tipo na edicao exige escolher categoria do tipo novo
    alternativa_descartada: Categoria livre de tipo
    motivo: "MAPA.md FT-03 e escopo da tarefa (categoria pertence a um tipo); PR-27"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: Autorizacao por lista de permitidos - admin e usuario lancam e leem; qualquer outro papel (inclusive o futuro filho, papel vazio ou desconhecido) recebe 403 em todas as funcoes do servico; a pagina e as acoes redirecionam ao painel; o item de menu so aparece para admin e usuario
    alternativa_descartada: Negar apenas filho
    motivo: "PR-06 (checagem no servidor; filho so le a propria mesada) e PROJETO.md criterio \"membro adulto vê e lança as despesas da casa\"; lista de negados deixaria um papel novo entrar por esquecimento"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: Apagar lancamento e definitivo, registrado na trilha (quem, quando, id, tipo e categoria, nunca o valor); a tela pede uma confirmacao em dois passos
    alternativa_descartada: Remocao logica com coluna apagadoEm
    motivo: "PR-10 (registrar quem apagou); remocao logica deixaria dado apagado alcancavel pelo saldo da FT-04 e pela exportacao da FT-07 e exigiria filtro em toda consulta; PR-28 (nova). Pendencia decisao_humana nao bloqueante: a familia quer lixeira ou desfazer?"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: Cada criar, editar e apagar grava a acao e o registro da trilha na mesma transacao; edicao sem mudanca real nao grava registro; o detalhe leva so tipo e categoriaId (categoria criada leva o nome e o tipo)
    alternativa_descartada: Guardar o valor antes e depois
    motivo: "PR-10, PR-25 (a barreira recusa chave de valor e saldo; \"nada alem\" de quem, o que, quando)"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Catalogo da trilha ganha lancamento.criado, lancamento.alterado, lancamento.apagado e categoria.criada, com rotulo em portugues; descreverAtividade ganha detalhe "Despesa" ou "Receita" e nome da categoria
    alternativa_descartada: Deixar a tela mostrar o codigo
    motivo: "D-05 da FT-02 e CONVENCOES secao 7 (Auditoria): feature nova acrescenta suas acoes ao catalogo"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: Listagem por mes (padrao o mes corrente em Sao Paulo; mes invalido cai no corrente) e por tipo (todos, receitas, despesas), data mais recente primeiro, 50 por pagina, parametros mes, tipo e pagina; sem totais; navegacao de mes por links Mes anterior e Proximo mes
    alternativa_descartada: Rolagem infinita; campo de mes do navegador
    motivo: "MAPA.md FT-03 e escopo (paginada e filtravel por mes e tipo); PR-16 (celular; type=month nao existe em todo navegador); D-08 da FT-02 (50 por pagina)"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: Rotas dentro do grupo (sistema) - /lancamentos (lista), /lancamentos/novo, /lancamentos/[id] (editar e apagar), /lancamentos/categorias; estados carregando e erro herdados do grupo, vazio proprio, id inexistente cai em not-found
    alternativa_descartada: Categorias dentro de Configuracoes
    motivo: "tarefa (rota de categorias dentro de Lancamentos, nao segunda area de configuracoes); Navegacao.tsx; PR-16"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: Item Lancamentos na barra lateral logo abaixo de Painel, com Categorias aninhado; Atividade fica abaixo
    alternativa_descartada: null
    motivo: "Navegacao.tsx (as features acrescentam itens); D-10 da FT-02"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: Interface sobre os tokens - formulario com tipo (Despesa ou Receita) que filtra as categorias, campo de valor de texto com dica 0,00, data nativa, descricao e categoria; valor de despesa em cor de perigo e de receita em cor de sucesso por token; colunas de valor alinhadas a direita com algarismos tabulares; skill frontend-design dentro dos tokens
    alternativa_descartada: Cores e fontes proprias
    motivo: "PR-07 e PR-08; CONVENCOES (nenhuma cor literal)"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: Seed de demonstracao ganha cinco categorias de despesa, duas de receita e seis lancamentos fictícios no mes corrente, com id fixo e upsert sem sobrescrever; nunca em producao
    alternativa_descartada: Seed sem lancamentos
    motivo: "PR-04 (lancamentos de exemplo; entrega verificavel em trinta segundos); as categorias sao dado de demonstracao, nao regra do sistema (PR-27)"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: Ambiente e segredos - nenhuma variavel nova; DATABASE_URL e JWT_SECRET como nas features anteriores
    alternativa_descartada: null
    motivo: "PR-12 e CONVENCOES.md secao 6"
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: Definicao de pronto - o adulto e o responsavel de demonstracao lancam uma despesa e uma receita, criam uma categoria, editam e apagam; cada acao aparece em Atividade para o responsavel; um papel que nao e admin nem usuario e negado em toda funcao; valor nunca aparece na trilha; dois temas, celular, quatro comandos verdes
    alternativa_descartada: null
    motivo: "MAPA.md FT-03 Entrega e PROJETO.md Criterios de aceite"
    status: fechada
    bloqueante: false
---

# Decisões — lancamentos-da-casa

> F2 respondida pelo buildx (`respondido_por: buildx`), nos quatro degraus: PROJETO, PREMISSAS, CONVENCOES, e só então premissa nova `f2_autonoma`. Nenhum humano foi consultado.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo (respondida pelo buildx, não pelo usuário)

## Decisões

```
D-00 | densidade padrao, construcao autonomo | - | respondido pelo buildx; fonte PR-01
D-01 | Escopo: Categoria, Lancamento, servico, tela com filtro, trilha, seed | Total/saldo na listagem | MAPA.md FT-03; FT-04 e nao-objetivo
D-02 | valorCentavos Int positivo; sinal pelo tipo; sem Float | Valor com sinal | PR-02; PR-26 (nova)
D-03 | Leitor de "1.234,56" sem parseFloat; ate R$ 1.000.000,00; ponto so milhar | Aceitar ponto decimal | PR-02, PR-16; PR-26 (nova)
D-04 | Data civil texto AAAA-MM-DD no fuso de Sao Paulo; 2000 a 2100; futuro vale | DateTime UTC | PR-16; PR-26 (nova)
D-05 | Descricao opcional ate 200 | Obrigatoria | (HIPOTESE) MAPA.md; PR-26
D-06 | Categoria por tipo, nome unico por tipo, sem editar nem apagar, sem conjunto oficial | Conjunto padrao; editavel | MAPA.md; PR-27 (nova); pendencia decisao_humana
D-07 | Lancamento exige categoria existente do mesmo tipo | Categoria livre | MAPA.md; PR-27
D-08 | Lista de permitidos admin e usuario; filho e desconhecido negados | Negar so filho | PR-06; PROJETO.md
D-09 | Apagar e definitivo, na trilha sem valor, confirmacao em dois passos | Remocao logica | PR-10; PR-28 (nova); pendencia decisao_humana
D-10 | Acao + rastro na mesma transacao; sem mudanca real, sem rastro; detalhe so tipo e categoriaId | Guardar valor antes e depois | PR-10, PR-25
D-11 | Catalogo ganha 4 acoes com rotulo; tela descreve tipo e categoria | Mostrar codigo | D-05 da FT-02; CONVENCOES 7
D-12 | Mes e tipo, 50 por pagina, sem totais, links de mes | Rolagem infinita; type=month | MAPA.md; PR-16
D-13 | Rotas /lancamentos, /novo, /[id], /categorias; estados herdados | Categorias em Configuracoes | tarefa; Navegacao.tsx
D-14 | Menu: Lancamentos (com Categorias aninhado) abaixo de Painel | - | Navegacao.tsx; D-10 da FT-02
D-15 | Tokens, tipo filtra categoria, cor de valor por token, frontend-design | Cores proprias | PR-07, PR-08
D-16 | Seed: 7 categorias e 6 lancamentos do mes, id fixo | Seed vazia | PR-04; PR-27
D-17 | Sem variavel de ambiente nova | - | PR-12
D-18 | Definicao de pronto: fluxo completo, papel desconhecido negado, valor fora da trilha, temas, celular, 4 comandos verdes | - | MAPA.md; PROJETO.md
```

## Eixos cobertos

1. **Escopo de negócio:** D-01, D-05, D-06, D-07, D-09. 2. **Arquitetura:** D-08, D-13, D-14 (camadas inalteradas, PR-17; leitor de valor e datas em `src/lib`, serviço em `src/servicos`). 3. **Contrato de dados:** D-02, D-03, D-04, D-16. 4. **Estado e observabilidade:** D-12, D-13 (vazio, carregando e erro), D-11. 5. **Resiliência e política de erro:** D-10 (falha de registro desfaz a ação), D-07. 6. **Ambiente e segredos:** D-17. 7. **Definição de pronto:** D-18.

## Premissas criadas nesta F2

PR-26 (forma do lançamento: valor, data e descrição), PR-27 (categorias) e PR-28 (apagar é definitivo) — `origem: f2_autonoma`, em `docs/projeto/PREMISSAS.md`.

## Pendências

Nenhuma bloqueante. Duas pendências `decisao_humana`, ambas não bloqueantes e resolvidas com a opção mais reversível (registradas também em `00-BLOQUEIOS.md`):

1. Categorias: a família quer um conjunto padrão, ou renomear, ocultar e apagar categorias? Hoje: criar apenas, sem conjunto oficial (PR-27).
2. Apagar lançamento: a família quer lixeira ou desfazer? Hoje: exclusão definitiva com rastro sem valor (PR-28).
