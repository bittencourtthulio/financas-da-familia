---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: privacidade-dos-dados
origem_buildx: financas-da-familia
feature_id: FT-07
atualizado_em: 2026-10-28
sprint_id: sprint-02
sprint:
  titulo: Rota, acao, telas e prova no servidor
  status: concluido
  criterio_saida: A suite inteira termina com 0 failed; o responsavel baixa o arquivo e apaga a conta de um filho pelas telas; usuario, filho e visitante sao barrados na rota, na acao e na pagina; o servidor real prova o download e o token do filho excluido
  riscos: [cookie sameSite lax e rota que grava, regra de CSS so com token, tabela de acoes sensiveis ampliada, citacoes de linha de acoes.ts]
  fora_de_escopo: [Documentacao final, premissas]
fases:
  - id: F-02.1
    titulo: Rota e acao
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01]
  - id: F-02.2
    titulo: Telas
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.02]
  - id: F-02.3
    titulo: Prova no servidor
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.03]
tasks:
  - id: T-02.01
    titulo: "Rota de download POST e acao de servidor para excluir a conta do filho"
    fase: F-02.1
    status: concluida
    objetivo: Criar a rota POST /api/privacidade/exportar (401 sem sessao, 403 para outro papel, 405 para GET, attachment com nome datado, no-store) e a acao excluirContaDoFilho com a guarda do responsavel fora do try; ampliar antes a tabela de acoes sensiveis
    arquivos:
      cria: ["src/app/api/privacidade/exportar/route.ts", "tests/privacidade-rota.test.ts", "tests/privacidade-acoes.test.ts"]
      altera: ["src/app/acoes.ts", "tests/filhos-acoes.test.ts"]
    teste_integracao: Executada com a sessao simulada do responsavel, a rota devolve 200 com o JSON do servico e os cabecalhos de download e a acao apaga o filho e leva para /privacidade; erro de servico vira mensagem em portugues sem rastro tecnico; a exportacao pela rota deixa familia.exportada na trilha
    teste_funcional: Sem sessao a rota devolve 401 e nada grava; usuario e filho recebem 403 e nada grava; GET devolve 405; filho, adulto e visitante nao apagam nada pela acao e sao levados ao painel ou ao login; a tabela de acoes sensiveis cobre toda acao exportada; nome errado devolve a mensagem e nao apaga
    criterio_aceite: tests/privacidade-rota.test.ts, tests/privacidade-acoes.test.ts e tests/filhos-acoes.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (1273 testes)

  - id: T-02.02
    titulo: "Pagina Privacidade, botoes de baixar e de apagar, menu e estilos"
    fase: F-02.2
    status: concluida
    objetivo: Criar a pagina /privacidade e os componentes BaixarDados e ApagarFilho, o item Privacidade no menu do responsavel, o apagar na pagina do filho e os estilos so de tokens, com a skill frontend-design
    arquivos:
      cria: ["src/app/(sistema)/privacidade/page.tsx", "src/componentes/BaixarDados.tsx", "src/componentes/ApagarFilho.tsx", "tests/privacidade-tela.test.ts"]
      altera: ["src/componentes/Navegacao.tsx", "src/app/(sistema)/filhos/[id]/page.tsx", "src/estilos/global.css", "src/lib/privacidade.ts"]
    teste_integracao: Renderizada com filhos reais, a pagina explica em portugues o que e exportado e o que a exclusao apaga, tem o botao de baixar dentro de um formulario POST e a lista de filhos com o apagar; a pagina do filho tem o apagar; o menu do responsavel tem Privacidade e o do adulto e do filho nao
    teste_funcional: Sem filhos a pagina diz o que fazer; o apagar so confirma no segundo passo e pede o nome; o botao de baixar tem estados preparando e erro em texto; rotulos nos campos; botoes e links com 44px no celular; nenhuma cor literal no CSS novo; o aviso de exclusao concluida aparece
    criterio_aceite: tests/privacidade-tela.test.ts, tests/atividade-tela.test.ts e tests/filhos-tela.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (1294 testes)

  - id: T-02.03
    titulo: "Prova no servidor real: download, papeis e token do filho excluido"
    fase: F-02.3
    status: concluida
    objetivo: Provar no servidor de producao real que o responsavel baixa o arquivo versionado e sem campo secreto, que usuario, filho e visitante sao negados na rota e na pagina, e que o cookie de um filho emitido antes da exclusao deixa de abrir qualquer pagina
    arquivos:
      cria: ["tests/privacidade-rotas.test.ts"]
      altera: ["tests/rotas.test.ts"]
    teste_integracao: No servidor real, o POST do responsavel devolve 200, application/json, attachment com o nome datado, o documento versionado com os dados dos dois filhos e nenhum campo secreto; /privacidade abre para o responsavel; depois de excluir o filho, o cookie antigo dele leva ao login em /, /mesada e /perfil e o login dele falha
    teste_funcional: GET devolve 405; sem cookie 401; adulto e filho recebem 403 na rota e voltam ao painel em /privacidade; o outro filho continua entrando e vendo so a propria mesada; a pagina do filho excluido cai em nao encontrado
    criterio_aceite: tests/privacidade-rotas.test.ts e tests/rotas.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (1310 testes)

---

# Plano — Sprint 02 — Rota, acao, telas e prova no servidor

## Objetivo da sprint

Rota, acao, telas e prova no servidor.

## Critério de saída da sprint

A suite inteira termina com 0 failed; o responsavel baixa o arquivo e apaga a conta de um filho pelas telas; usuario, filho e visitante sao barrados na rota, na acao e na pagina; o servidor real prova o download e o token do filho excluido
