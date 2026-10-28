---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: saldo-e-resumo-do-mes
origem_buildx: financas-da-familia
feature_id: FT-04
atualizado_em: 2026-10-28
sprint_id: sprint-02
sprint:
  titulo: Painel com o resumo do mês
  status: concluido
  criterio_saida: A suite inteira termina com 0 failed; o painel mostra para o responsavel e o adulto receitas, despesas, saldo e despesas por categoria do mes escolhido, com seletor de mes, estados e estilos sobre os tokens; o servidor real prova a tela e a negacao
  riscos: [tests/rotas.test.ts depende do build, saldo negativo legivel sem depender de cor, barra sem cor literal]
  fora_de_escopo: [Saldo acumulado, grafico de evolucao, orcamento, exportacao]
fases:
  - id: F-02.1
    titulo: Componentes e pagina do painel
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01, T-02.02]
tasks:
  - id: T-02.01
    titulo: Componentes do resumo, seletor de mes e estilos
    fase: F-02.1
    status: concluida
    objetivo: Criar src/lib/resumo-links.ts (endereco do painel por mes e vizinhos validos), src/componentes/SeletorDeMes.tsx, src/componentes/ResumoDoMes.tsx (tres cartoes, saldo com frase, despesas por categoria com barra em inteiros, estado vazio com atalho para Lancamentos) e os estilos em src/estilos/global.css, usando a skill frontend-design e a dataviz so com tokens
    arquivos:
      cria: [src/lib/resumo-links.ts, src/componentes/SeletorDeMes.tsx, src/componentes/ResumoDoMes.tsx, tests/resumo-tela.test.ts]
      altera: [src/estilos/global.css]
    teste_integracao: Renderizado com um resumo de outubro (receitas 555.000, despesas 265.225, saldo 289.775, tres categorias), o HTML traz "Receitas", "Despesas", "Saldo do mes" com "R$ 5.550,00", "R$ 2.652,25" e "R$ 2.897,75", a frase "Saldo positivo", cada categoria com nome e soma em reais e a ordem do resumo; o seletor traz Mes anterior, "Outubro de 2026" e Proximo mes apontando para /?mes=2026-09 e /?mes=2026-11
    teste_funcional: Saldo negativo sai com sinal de menos e a frase "Saldo negativo" e nao so pela classe de cor; saldo zero sai com "Saldo zerado"; mes sem lancamento mostra a mensagem e o link para /lancamentos e nenhum cartao; mes so de receita diz que nao ha despesa; o seletor omite Mes anterior em 2000-01 e Proximo mes em 2100-12 e so mostra Mes atual fora do mes corrente; a barra tem largura inteira de 0 a 100 e nenhum arquivo novo escreve cor por extenso; barras marcadas aria-hidden e valores com rotulo textual
    criterio_aceite: tests/resumo-tela.test.ts termina com 0 failed, tests/ajuda-estatica nao acha cor literal nos arquivos novos e a suite inteira esta verde
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (675 testes)

  - id: T-02.02
    titulo: Painel inicial com o resumo e prova no servidor real
    fase: F-02.1
    status: concluida
    objetivo: Fazer src/app/(sistema)/page.tsx ler o parametro mes, buscar resumoDoMes para quem pode lancar e renderizar SeletorDeMes e ResumoDoMes sob o titulo e o subtitulo existentes; papel que nao lanca recebe so titulo, subtitulo e frase neutra sem consulta ao servico; atualizar tests/rotas.test.ts
    arquivos:
      cria: []
      altera: [src/app/(sistema)/page.tsx, tests/rotas.test.ts]
    teste_integracao: No servidor de producao, o adulto abre / e ve Receitas, Despesas, Saldo do mes e a categoria "Mercado de Rota" com os valores semeados pelo teste; /?mes=2020-01 mostra o mes sem lancamento com atalho; /?mes=lixo e /?mes=2026-13 respondem 200 com o mes corrente
    teste_funcional: O responsavel tambem ve o resumo; o papel filho abre / com 200, titulo e subtitulo e nenhum valor, nenhuma categoria e nenhum total no corpo; sem sessao / continua indo para o login; o botao Menu da gaveta e o titulo do painel continuam presentes; o painel nao traz mais o texto do estado vazio antigo para quem lanca
    criterio_aceite: tests/rotas.test.ts termina com 0 failed depois de npm run build e a suite inteira esta verde
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (688 testes)

---

# Plano — Sprint 02 — Painel com o resumo do mês

## Objetivo da sprint

Entregar a tela: o resumo no painel inicial, com seletor de mês e estados, sobre os tokens.

## Critério de saída da sprint

A suite inteira termina com 0 failed; o painel mostra para o responsavel e o adulto receitas, despesas, saldo e despesas por categoria do mes escolhido, com seletor de mes, estados e estilos sobre os tokens; o servidor real prova a tela e a negacao
