---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: lancamentos-da-casa
origem_buildx: financas-da-familia
feature_id: FT-03
atualizado_em: 2026-10-28
sprint_id: sprint-02
sprint:
  titulo: Servico de lancamentos e categorias
  status: pendente
  criterio_saida: A suite inteira termina com 0 failed; categorias e lancamentos se criam, leem, editam, apagam e listam pelo servico, cada mudanca deixa o registro da trilha sem valor, e todo papel que nao e admin nem usuario e negado
  riscos: [A guarda por lista de permitidos precisa de teste para papel desconhecido, A listagem por mes depende do relogio no fuso de Sao Paulo]
  fora_de_escopo: [Tela, seed, componentes]
fases:
  - id: F-02.1
    titulo: Servico
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01, T-02.02, T-02.03, T-02.04]
tasks:
  - id: T-02.01
    titulo: Guarda de papel e servico de categorias
    fase: F-02.1
    status: pendente
    objetivo: Criar exigirAdultoOuResponsavel (lista de permitidos admin e usuario) em autenticacao.ts e src/servicos/lancamentos.ts com listarCategorias e criarCategoria validadas com zod, gravadas junto da trilha categoria.criada na mesma transacao
    arquivos:
      cria: [src/servicos/lancamentos.ts, tests/categorias.test.ts, tests/lancamentos-papeis.test.ts]
      altera: [src/servicos/autenticacao.ts]
    teste_integracao: Dentro de uma transacao, criarCategoria grava a categoria e o registro categoria.criada com alvoNome e tipo; se o registro falha, a categoria nao existe; o responsavel e o adulto criam e listam, ordenadas por nome
    teste_funcional: Nome vazio, so espacos, com mais de 40 caracteres, tipo invalido e nome repetido no mesmo tipo (inclusive com outra caixa e espacos nas pontas) sao recusados com 422 ou 409 sem gravar; o mesmo nome em outro tipo vale; papel filho, vazio e desconhecido recebem 403 em listarCategorias e criarCategoria
    criterio_aceite: tests/categorias.test.ts e tests/lancamentos-papeis.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-01.02]
    paralelizavel: false
  - id: T-02.02
    titulo: Criar e ler lancamento
    fase: F-02.1
    status: pendente
    objetivo: criarLancamento e obterLancamento no servico: valida tipo, valor lido do formato brasileiro, data civil, categoria existente do mesmo tipo e descricao; grava o lancamento e lancamento.criado na mesma transacao, so com tipo e categoriaId no detalhe
    arquivos:
      cria: [tests/lancamentos.test.ts]
      altera: [src/servicos/lancamentos.ts, tests/lancamentos-papeis.test.ts]
    teste_integracao: criarLancamento com valor "1.234,56" grava valorCentavos 123456, data 2026-10-27 e o registro lancamento.criado do ator, e o detalhe gravado nao contem o valor nem a palavra valor; se o registro falha o lancamento nao existe
    teste_funcional: Valor invalido, tipo invalido, data invalida, descricao com mais de 200 caracteres, categoria inexistente e categoria de tipo diferente sao recusados com 422 sem gravar nem registrar; descricao vazia vale; obterLancamento devolve com a categoria e 404 para id inexistente; papel que nao e admin nem usuario recebe 403
    criterio_aceite: tests/lancamentos.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-02.01]
    paralelizavel: false
  - id: T-02.03
    titulo: Editar e apagar lancamento
    fase: F-02.1
    status: pendente
    objetivo: editarLancamento (mesmas validacoes, 404 para id inexistente, registro lancamento.alterado so se algo mudou) e apagarLancamento (remove a linha e registra lancamento.apagado com tipo e categoria), cada um na mesma transacao do registro
    arquivos:
      cria: [tests/lancamentos-edicao.test.ts]
      altera: [src/servicos/lancamentos.ts, tests/lancamentos-papeis.test.ts]
    teste_integracao: Editar valor, data, categoria e descricao grava os novos valores e um registro lancamento.alterado do ator; apagar remove a linha e grava lancamento.apagado com o id do lancamento, tipo e categoriaId e sem valor; se o registro falha, a edicao e a exclusao nao acontecem
    teste_funcional: Reenviar os mesmos dados nao grava registro; trocar o tipo sem trocar a categoria e recusado com 422; id inexistente da 404 em editar e apagar; apagar duas vezes da 404 na segunda; o adulto edita e apaga lancamento criado pelo responsavel; papel desconhecido recebe 403
    criterio_aceite: tests/lancamentos-edicao.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-02.02]
    paralelizavel: false
  - id: T-02.04
    titulo: Listagem por mes e tipo, paginada
    fase: F-02.1
    status: pendente
    objetivo: listarLancamentos(autor, {mes, tipo, pagina}) com mes padrao o corrente em Sao Paulo, filtro por tipo, ordem de data decrescente, 50 por pagina, pagina fora do intervalo na ultima valida, sem total monetario
    arquivos:
      cria: [tests/lancamentos-listagem.test.ts]
      altera: [src/servicos/lancamentos.ts, tests/lancamentos-papeis.test.ts]
    teste_integracao: Com 120 lancamentos em outubro e 3 em setembro, o mes 2026-10 traz 50, 50 e 20 nas tres paginas, ordenados por data decrescente e, no mesmo dia, pelo mais recente; setembro traz 3; o ultimo dia do mes entra e o primeiro do seguinte nao; pagina 99 cai na ultima
    teste_funcional: O filtro de tipo traz so receitas ou so despesas; mes invalido ("2026-13", "abc") cai no mes corrente; sem mes usa o relogio injetado no fuso de Sao Paulo (virada de mes as 23h de 31/10); o resultado nao carrega somas; papel desconhecido recebe 403; a lista traz categoria e valorCentavos inteiro
    criterio_aceite: tests/lancamentos-listagem.test.ts termina com 0 failed e a suite inteira esta verde
    depende_de: [T-02.03]
    paralelizavel: false
---

# Plano — Sprint 02 — Servico de lancamentos e categorias

## Objetivo da sprint

Entregar o serviço completo, com autorização por papel e trilha, sem interface.

## Critério de saída da sprint

A suite inteira termina com 0 failed; categorias e lancamentos se criam, leem, editam, apagam e listam pelo servico, cada mudanca deixa o registro da trilha sem valor, e todo papel que nao e admin nem usuario e negado
