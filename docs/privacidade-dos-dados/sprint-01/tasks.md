---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: privacidade-dos-dados
origem_buildx: financas-da-familia
feature_id: FT-07
atualizado_em: 2026-10-28
sprint_id: sprint-01
sprint:
  titulo: Servico de exportacao e de exclusao
  status: concluido
  criterio_saida: A suite inteira termina com 0 failed; o responsavel exporta os dados da familia sem nenhum campo secreto e apaga a conta de um filho com o historico, a trilha anonimizada e o login encerrado; usuario e filho sao negados nas duas funcoes
  riscos: [migration nao ha, nome do filho espalhado na trilha em texto JSON, exportacao vazar hash ou segredo, citacoes de linha do CONVENCOES.md deslocadas por linhas novas em autenticacao.ts e atividade.ts]
  fora_de_escopo: [Rota, acao, telas, seed]
fases:
  - id: F-01.1
    titulo: Exportacao e catalogo da trilha
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01]
  - id: F-01.2
    titulo: Exclusao do filho
    status: concluido
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.02]
tasks:
  - id: T-01.01
    titulo: "Servico de exportacao dos dados da familia, trilha e ordem do arquivo"
    fase: F-01.1
    status: concluida
    objetivo: Criar src/servicos/privacidade.ts com exportarDadosDaFamilia (so admin) que monta o documento versionado (usuarios sem hash nem corte de sessao, categorias, lancamentos, filhos com saldo, movimentos de mesada e atividade), registra familia.exportada na trilha e devolve o objeto; criar src/lib/privacidade.ts (nome do arquivo com a data de Sao Paulo, versao do formato, campos proibidos) e acrescentar familia.exportada e filho.excluido ao catalogo
    arquivos:
      cria: ["src/servicos/privacidade.ts", "src/lib/privacidade.ts", "tests/privacidade-exportacao.test.ts", "tests/privacidade-papeis.test.ts"]
      altera: ["src/lib/atividade.ts", "tests/atividade-dados.test.ts"]
    teste_integracao: Com dados de todas as tabelas, a exportacao devolve versao_do_formato 1, gerado_em ISO e cada lista com os registros gravados (ids, centavos inteiros, datas civis, instantes ISO); o saldo do filho bate com creditos menos gastos; a exportacao grava familia.exportada com o ator e sem conteudo; falha ao gravar o rastro nao devolve arquivo; com 5000 lancamentos e 3000 movimentos termina dentro do prazo do teste
    teste_funcional: O texto do arquivo serializado nao contem senhaHash, senha_hash, sessoesValidasDesde, token, jwt, segredo nem os valores reais do hash bcrypt do usuario e do segredo do ambiente, e o teste falha de proposito quando um campo proibido e injetado; usuario, filho real, vazio e desconhecido recebem 403 e nada grava; a lista de campos proibidos e testada; o nome do arquivo usa o dia de Sao Paulo
    criterio_aceite: tests/privacidade-exportacao.test.ts, tests/privacidade-papeis.test.ts e tests/atividade-dados.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (1218 testes)

  - id: T-01.02
    titulo: "Servico de exclusao do filho: transacao, trilha anonimizada, login e tentativas"
    fase: F-01.2
    status: concluida
    objetivo: Acrescentar a src/servicos/privacidade.ts excluirFilho (so admin; confere o nome digitado; uma transacao remove filho, movimentos por Cascade e usuario de login, anonimiza a trilha e grava filho.excluido) e esquecerTentativasDeLogin em autenticacao.ts, chamada apos o commit
    arquivos:
      cria: ["tests/privacidade-exclusao.test.ts", "tests/privacidade-banco.test.ts"]
      altera: ["src/servicos/privacidade.ts", "src/servicos/autenticacao.ts", "tests/privacidade-papeis.test.ts"]
    teste_integracao: Apagar um filho com login e movimentos remove o filho, os movimentos e o usuario e deixa o outro filho, os lancamentos, as categorias e os adultos intactos; as linhas da trilha do filho (cadastro, edicao com nome antigo, login, mesada) trocam o nome por filho removido e fica filho.excluido sem nome; a inspecao de todas as tabelas do banco nao acha nome, e-mail, nascimento nem descricoes do filho; falha no meio desfaz tudo; o token emitido antes deixa de valer e o login falha; o e-mail bloqueado por tentativas volta a poder ser usado
    teste_funcional: Nome diferente, vazio ou so de outro filho devolve 422 e nao apaga; id inexistente devolve 404; usuario, filho real (inclusive o proprio), vazio e desconhecido recebem 403 e nada grava; filho sem login e apagado; apagar duas vezes devolve 404; o arquivo exportado antes da exclusao tem o filho e o exportado depois nao
    criterio_aceite: tests/privacidade-exclusao.test.ts, tests/privacidade-banco.test.ts e tests/privacidade-papeis.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde (1256 testes)

---

# Plano — Sprint 01 — Servico de exportacao e de exclusao

## Objetivo da sprint

Servico de exportacao e de exclusao.

## Critério de saída da sprint

A suite inteira termina com 0 failed; o responsavel exporta os dados da familia sem nenhum campo secreto e apaga a conta de um filho com o historico, a trilha anonimizada e o login encerrado; usuario e filho sao negados nas duas funcoes
