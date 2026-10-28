---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: saldo-e-resumo-do-mes
origem_buildx: financas-da-familia
feature_id: FT-04
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
    decisao: Escopo - servico de resumo do mes (receitas, despesas, saldo, despesas por categoria), painel inicial com o resumo e seletor de mes por parametro de URL, estados vazio, carregando e erro, estilos sobre os tokens, seed estendida com mes anterior; sem migration
    alternativa_descartada: Incluir saldo acumulado, orcamento por categoria, metas, comparativos ou grafico de evolucao
    motivo: "MAPA.md FT-04 Entrega; PROJETO.md fora de escopo (orcamento por categoria, relatorios comparativos); PR-29 (nova)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Saldo do mes = receitas do mes menos despesas do mes, so do mes escolhido, em centavos inteiros, podendo ser negativo; nao ha saldo acumulado nem transportado
    alternativa_descartada: Saldo acumulado desde o primeiro lancamento
    motivo: "PROJETO.md criterio de aceite (saldo do mes) e MAPA.md (saldo do mes escolhido); regra de negocio nao derivavel: PR-29 (nova) com pendencia decisao_humana nao bloqueante, opcao mais simples e reversivel"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: A soma e feita no servidor pelo banco (groupBy de Prisma com soma de inteiro por tipo e categoria) e o saldo por subtracao de inteiros; nada de Float, Decimal, parseFloat nem soma no cliente
    alternativa_descartada: Buscar todos os lancamentos e somar em JavaScript; somar no componente
    motivo: "PR-02 (centavos inteiros, nunca ponto flutuante); CONVENCOES secao 7 (Dinheiro); a agregacao no banco nao traz linhas desnecessarias"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: O mes e o parametro mes da URL no formato AAAA-MM, validado no servidor com zod e mesValido (2000 a 2100); ausente, repetido, malformado ou fora do intervalo cai no mes corrente de Sao Paulo, sem erro; o relogio e injetavel
    alternativa_descartada: Rejeitar mes invalido com erro; mes pela data do navegador
    motivo: "tarefa (mes invalido cai no corrente sem erro); D-12 da FT-03 (mesmo parametro e mesma regra); PR-16 (fuso America/Sao_Paulo); CONVENCOES secao 6 (validacao com zod no servidor)"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: O intervalo do mes e do dia 1 (incluido) ao dia 1 do mes seguinte (excluido), por comparacao de texto da data civil, reaproveitando intervaloDoMes; ultimo dia do mes e virada de ano entram no mes certo
    alternativa_descartada: Converter para Date e filtrar por instante
    motivo: "PR-26 (data civil AAAA-MM-DD, nao instante); src/lib/datas.ts"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: Despesas por categoria listam so as categorias com despesa no mes, da maior soma para a menor (empate por nome), cada uma com nome, soma e quantidade de lancamentos; receita nao e aberta por categoria
    alternativa_descartada: Listar todas as categorias com zero; abrir tambem a receita
    motivo: "MAPA.md FT-04 Entrega (despesas somadas por categoria); PR-29 (nova)"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: Autorizacao por lista de permitidos - o servico de resumo comeca por exigirAdultoOuResponsavel; admin e usuario veem, qualquer outro papel (futuro filho, vazio, desconhecido) recebe 403 no servico; a pagina do painel nao busca o resumo para esse papel e mostra so titulo, subtitulo e uma frase neutra, sem dado financeiro
    alternativa_descartada: Redirecionar o filho para outra pagina; negar so o filho
    motivo: "PR-06 (checagem no servidor; filho so le a propria mesada); D-08 da FT-03; o painel e a pagina inicial de todos os papeis (P-9, E-1), entao nao pode redirecionar"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: O servico mora em src/servicos/resumo.ts (camada de aplicacao, acessa o banco), exporta resumoDoMes; as regras puras de apresentacao (parte da despesa em barra, rotulo do saldo, enderecos do seletor) moram em src/lib; os componentes novos moram em src/componentes
    alternativa_descartada: Acrescentar ao servico de lancamentos
    motivo: "CONVENCOES secao 5 (onde entra codigo novo); tests/lancamentos-papeis.test.ts varre todas as funcoes de lancamentos.ts e o resumo nao e lancamento"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: Saldo negativo aparece com sinal de menos no valor e com a frase "Saldo negativo: as despesas passaram das receitas", positivo com "Saldo positivo: sobrou dinheiro no mes" e zerado com "Saldo zerado", nunca so por cor; cada total tem rotulo textual (Receitas, Despesas, Saldo do mes)
    alternativa_descartada: Diferenciar so pela cor
    motivo: "tarefa (texto e tokens, nao so cor); acessibilidade (contraste, valores com rotulo textual)"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: Mes sem nenhum lancamento mostra o seletor e uma mensagem com atalho para Lancamentos; mes com receita e sem despesa mostra os totais e, no bloco de categorias, que nao ha despesa no mes; carregando e erro vem do loading.tsx e do error.tsx do grupo
    alternativa_descartada: Mostrar cartoes zerados em mes vazio
    motivo: "PR-16 (estados vazio, carregando e erro em toda tela que busca dado); D-13 da FT-03"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Seletor de mes por link (sem JavaScript) com mes anterior, mes por extenso, proximo mes e, fora do mes corrente, o atalho Mes atual; os links somem nos limites 2000-01 e 2100-12; o endereco do painel e / com ?mes=
    alternativa_descartada: Campo type=month; reaproveitar FiltrosDeLancamentos
    motivo: "D-12 da FT-03 (type=month nao existe em todo navegador); o componente existente esta acoplado a /lancamentos"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: Interface sobre os tokens - tres cartoes (Receitas, Despesas, Saldo do mes), lista de despesas por categoria com barra proporcional a parte da categoria no total de despesas, calculada em inteiros; skill frontend-design para o acabamento (PR-08) e dataviz para a barra, so com tokens; nenhuma cor literal, nenhum tema novo; celular abaixo de 768px com cartoes empilhados
    alternativa_descartada: Cores e fontes proprias; grafico de pizza ou de evolucao
    motivo: "PR-07 e PR-08; 08-design-system.md; grafico de evolucao e fora de escopo"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: Seed estendida (idempotente, nunca em producao) com lancamentos fictícios do mes anterior e um segundo lancamento em Mercado e em Lazer no mes corrente, para o resumo ter mais de uma categoria com mais de um item e um mes anterior
    alternativa_descartada: Seed sem alteracao
    motivo: "PR-04 (entrega verificavel em trinta segundos); tarefa (mais de uma categoria e mes anterior)"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: Ambiente e segredos - nenhuma variavel nova, nenhuma dependencia nova, nenhuma migration
    alternativa_descartada: null
    motivo: "PR-12 e CONVENCOES.md secao 6; PR-20 (versoes fixadas)"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: Definicao de pronto - o adulto e o responsavel de demonstracao veem no painel receitas, despesas, saldo e despesas por categoria do mes e navegam para o mes anterior; saldo negativo e legivel; papel que nao e admin nem usuario e negado no servico; soma prova 0,10 + 0,20 = 0,30; mes limite e fuso provados; dois temas, celular, quatro comandos verdes
    alternativa_descartada: null
    motivo: "MAPA.md FT-04 Entrega e PROJETO.md Criterios de aceite"
    status: fechada
    bloqueante: false
---

# Decisões — saldo-e-resumo-do-mes

> F2 respondida pelo buildx (`respondido_por: buildx`), nos quatro degraus: PROJETO, PREMISSAS, CONVENCOES, e só então premissa nova `f2_autonoma`. Nenhum humano foi consultado.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo (respondida pelo buildx, não pelo usuário)

## Decisões

```
D-00 | densidade padrao, construcao autonomo | - | respondido pelo buildx; fonte PR-01
D-01 | Escopo: servico de resumo, painel com seletor de mes, estados, seed; sem migration | Acumulado, orcamento, metas, grafico de evolucao | MAPA.md FT-04; PROJETO.md fora de escopo; PR-29
D-02 | Saldo = receitas - despesas so do mes, inteiro, pode ser negativo | Saldo acumulado | PROJETO.md; PR-29 (nova); pendencia decisao_humana
D-03 | Soma no servidor pelo banco (groupBy), inteiros | Somar em JS ou no cliente | PR-02; CONVENCOES 7
D-04 | mes=AAAA-MM validado com zod; invalido cai no corrente; relogio injetavel | Rejeitar com erro | tarefa; D-12 da FT-03; PR-16
D-05 | Intervalo [dia 1, dia 1 do mes seguinte) por texto | Filtrar por instante | PR-26; datas.ts
D-06 | So categorias com despesa, da maior para a menor; receita nao aberta | Todas com zero; abrir receita | MAPA.md; PR-29
D-07 | Lista de permitidos admin e usuario; outros 403 no servico; painel sem dado para eles | Redirecionar; negar so filho | PR-06; D-08 da FT-03
D-08 | src/servicos/resumo.ts; regras puras em src/lib; componentes novos | Dentro de lancamentos.ts | CONVENCOES 5
D-09 | Saldo negativo com sinal e frase, nao so cor; rotulos textuais | So cor | tarefa; acessibilidade
D-10 | Mes vazio: mensagem e atalho; estados herdados | Cartoes zerados | PR-16; D-13 da FT-03
D-11 | Seletor por link; atalho Mes atual; limites 2000-01 e 2100-12 | type=month; FiltrosDeLancamentos | D-12 da FT-03
D-12 | Tres cartoes, barra por categoria em inteiros, frontend-design e dataviz so com tokens | Cores proprias; pizza; evolucao | PR-07, PR-08
D-13 | Seed: mes anterior e segundo lancamento por categoria | Seed igual | PR-04
D-14 | Sem variavel, dependencia nem migration | - | PR-12; PR-20
D-15 | Definicao de pronto: fluxo, negativo legivel, papel negado, 0,10+0,20, limites, temas, celular, 4 comandos | - | MAPA.md; PROJETO.md
```

## Eixos cobertos

1. **Escopo de negócio:** D-01, D-02, D-06. 2. **Arquitetura:** D-07, D-08 (camadas inalteradas, PR-17). 3. **Contrato de dados:** D-03, D-04, D-05, D-13. 4. **Estado e observabilidade:** D-10, D-11 (vazio, carregando e erro). 5. **Resiliência e política de erro:** D-04 (entrada inválida não é erro), D-07. 6. **Ambiente e segredos:** D-14. 7. **Definição de pronto:** D-09, D-15.

## Premissas criadas nesta F2

PR-29 (saldo é do mês escolhido, sem acumulado) — `origem: f2_autonoma`, em `docs/projeto/PREMISSAS.md`. A PR-08 (skill de frontend design) é realizada por esta feature.

## Pendências

Nenhuma bloqueante. Uma pendência `decisao_humana`, não bloqueante, resolvida com a opção mais simples e reversível (registrada também em `00-BLOQUEIOS.md`):

1. Saldo acumulado: a família quer que o saldo de um mês carregue o do anterior? Hoje: só o mês escolhido (PR-29).
