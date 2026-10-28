---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: filhos-da-familia
origem_buildx: financas-da-familia
feature_id: FT-05
atualizado_em: 2026-10-28
sprint_id: sprint-02
sprint:
  titulo: Login do filho, telas do responsavel e pagina do filho
  status: pendente
  criterio_saida: A suite inteira termina com 0 failed; o responsavel cria e desativa o login do filho; o filho entra e ve so a propria mesada; um filho nao le o irmao; o servidor real nega o filho em todas as outras rotas; a navegacao muda por papel
  riscos: [acao de servidor depende de cookies do Next, id de irmao vazando existencia, tela quebrando em celular ou no tema claro]
  fora_de_escopo: [Movimentos, extrato e saldo de mesada, reativar login, redefinir senha, apagar filho, seed]
fases:
  - id: F-02.1
    titulo: Login e isolamento no servico
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01]
  - id: F-02.2
    titulo: Telas do responsavel
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.02]
  - id: F-02.3
    titulo: Pagina do filho e prova no servidor real
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.03]
tasks:
  - id: T-02.01
    titulo: Login do filho, minhaMesada e isolamento entre irmaos
    fase: F-02.1
    status: concluida
    objetivo: Acrescentar a src/servicos/filhos.ts criarLoginDoFilho, desativarLoginDoFilho e minhaMesada; o login e um Usuario de papel filho ligado 1 para 1; provar isolamento entre irmaos (IDOR) e que o filho entra com o servico real de autenticacao
    arquivos:
      cria: ["tests/filhos-login.test.ts", "tests/filhos-papeis.test.ts"]
      altera: ["src/servicos/filhos.ts"]
    teste_integracao: criarLoginDoFilho cria o usuario filho com o nome do filho, liga ao registro e grava filho.login_criado na mesma transacao; entrar() com o e-mail e a senha devolve sessao de papel filho; minhaMesada do filho A devolve so o registro de A (nome, valor, periodicidade) e a do filho B so o de B; desativarLoginDoFilho poe ativo=false, grava filho.login_desativado e o login deixa de entrar
    teste_funcional: E-mail ja usado devolve 409 e nao cria usuario nem rastro; segundo login para o mesmo filho devolve 409; senha com menos de 8 caracteres e e-mail invalido devolvem 422; filho inexistente devolve 404; desativar duas vezes nao duplica o rastro; desativar filho sem login devolve 404; o filho A recebe 403 identico para obterFilho, editarFilho, criarLoginDoFilho e desativarLoginDoFilho com o id do irmao B e com id inexistente; minhaMesada de admin, adulto, vazio e desconhecido recebe 403; minhaMesada de filho sem registro devolve 404; o rastro nao tem e-mail nem valor; a varredura das funcoes exportadas de filhos.ts nega adulto, filho, vazio e desconhecido (exceto minhaMesada, que so o filho usa)
    criterio_aceite: tests/filhos-login.test.ts e tests/filhos-papeis.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (885 testes)

  - id: T-02.02
    titulo: Acoes, telas /filhos e navegacao por papel
    fase: F-02.2
    status: pendente
    objetivo: Criar as acoes de servidor de filho, as guardas de pagina exigirUsuarioFilho, as paginas /filhos, /filhos/novo e /filhos/[id] (editar e login), os componentes de formulario e lista, o item Filhos na navegacao do responsavel, e os estilos sobre os tokens, com o acabamento da skill frontend-design
    arquivos:
      cria: ["src/app/(sistema)/filhos/page.tsx", "src/app/(sistema)/filhos/novo/page.tsx", "src/app/(sistema)/filhos/[id]/page.tsx", "src/componentes/CamposDoFilho.tsx", "src/componentes/ListaDeFilhos.tsx", "src/componentes/LoginDoFilho.tsx", "tests/filhos-acoes.test.ts", "tests/filhos-tela.test.ts"]
      altera: ["src/app/acoes.ts", "src/app/formularios.ts", "src/app/sessao-servidor.ts", "src/componentes/Navegacao.tsx", "src/app/(sistema)/layout.tsx", "src/estilos/global.css"]
    teste_integracao: Com next/headers simulado e a sessao do responsavel, cadastrarFilho (acao) grava e redireciona, editar grava, criar login cria o usuario filho e desativar desativa; a lista renderiza nome, valor combinado em reais, periodicidade e situacao do login em texto; a navegacao do responsavel mostra Filhos e a do adulto nao
    teste_funcional: As mesmas acoes com sessao de filho, de adulto e sem sessao nao gravam nada (negadas ou redirecionadas); lista vazia mostra a mensagem e o atalho para cadastrar; formulario mostra erro de valor invalido sem perder o campo; o valor volta ao campo de edicao no formato brasileiro; nenhuma cor literal nos componentes novos; os estilos novos usam so var(--token); acima de 768px e abaixo (celular) a lista e o formulario nao dependem de largura fixa; a pagina do filho inexistente cai em nao encontrado
    criterio_aceite: tests/filhos-acoes.test.ts e tests/filhos-tela.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: null
    suite: pendente

  - id: T-02.03
    titulo: Pagina Minha mesada, painel neutro do filho e prova no servidor real
    fase: F-02.3
    status: pendente
    objetivo: Criar a pagina /mesada (so o papel filho) com nome, valor combinado, periodicidade e o estado vazio de movimentos, a navegacao do filho (Painel, Minha mesada, Meu perfil), o link no painel neutro e a prova no servidor de producao real de que o filho e negado em todas as outras rotas e nao le o irmao
    arquivos:
      cria: ["src/app/(sistema)/mesada/page.tsx", "src/componentes/MesadaDoFilho.tsx", "tests/filhos-mesada.test.ts"]
      altera: ["src/componentes/Navegacao.tsx", "src/app/(sistema)/layout.tsx", "src/app/(sistema)/page.tsx", "src/estilos/global.css", "tests/rotas.test.ts", "tests/resumo-tela.test.ts"]
    teste_integracao: No servidor real, o filho A abre / (200, frase neutra e link Minha mesada), /mesada (200, so o nome, o valor e a periodicidade de A e 'Ainda nao ha movimentos de mesada'), /perfil e /perfil/senha (200); a barra lateral do filho tem so Painel, Minha mesada e Meu perfil
    teste_funcional: O filho A em /lancamentos, /lancamentos/novo, /lancamentos/categorias, /lancamentos/[id], /atividade, /configuracoes/usuarios, /filhos, /filhos/novo e /filhos/[id do irmao B] nao recebe nenhum dado (redirecionamento) e a resposta para o id do irmao e para um id inexistente e igual; /mesada?filho=<id de B> mostra so A; o nome de B nunca aparece nas paginas de A; o responsavel e o adulto em /mesada voltam ao painel; sem sessao, /mesada vai para o login; a pagina nao mostra saldo nem extrato; nenhuma cor literal; a mesada mostra o valor combinado como informativo
    criterio_aceite: tests/filhos-mesada.test.ts e tests/rotas.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: null
    suite: pendente

---

# Plano — Sprint 02 — Login do filho, telas do responsavel e pagina do filho

## Objetivo da sprint

Login do filho, telas do responsavel e pagina do filho.

## Critério de saída da sprint

A suite inteira termina com 0 failed; o responsavel cria e desativa o login do filho; o filho entra e ve so a propria mesada; um filho nao le o irmao; o servidor real nega o filho em todas as outras rotas; a navegacao muda por papel
