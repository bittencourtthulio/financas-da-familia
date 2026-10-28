---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: filhos-da-familia
origem_buildx: financas-da-familia
feature_id: FT-05
atualizado_em: 2026-10-28
sprint_id: sprint-01
sprint:
  titulo: Papel filho e cadastro do filho
  status: pendente
  criterio_saida: A suite inteira termina com 0 failed; o papel filho tem rotulo, guarda e nao nasce pela tela Usuarios; um filho real e negado em todos os servicos existentes; o responsavel cadastra, edita e lista filhos em centavos inteiros, com a trilha sem valor
  riscos: [citacoes de linha do CONVENCOES.md deslocadas por linhas novas em usuarios.ts e atividade.ts, migration em banco SQLite]
  fora_de_escopo: [Login do filho, telas, seed]
fases:
  - id: F-01.1
    titulo: Papel filho e guardas
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01]
  - id: F-01.2
    titulo: Entidade e servico de cadastro
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.02]
tasks:
  - id: T-01.01
    titulo: "Papel filho: rotulo, guarda e negacao nos servicos existentes"
    fase: F-01.1
    status: pendente
    objetivo: Dar ao papel filho o rotulo Filho em src/lib/papeis.ts, a guarda exigirFilho em src/servicos/autenticacao.ts, e fazer usuarios.editar recusar com 409 a mudanca de papel de quem ja e filho; provar com um usuario filho real que todas as funcoes exportadas de lancamentos, resumo, atividade e usuarios o negam com 403
    arquivos:
      cria: ["tests/papel-filho.test.ts"]
      altera: ["src/lib/papeis.ts", "src/servicos/autenticacao.ts", "src/servicos/usuarios.ts", "tests/papeis.test.ts"]
    teste_integracao: Com um usuario de papel filho criado no banco, cada funcao exportada de src/servicos/lancamentos.ts, resumo.ts, atividade.ts (listarAtividade) e usuarios.ts recebe 403 sem tocar o banco; rotuloDoPapel('filho') devolve Filho; usuarios.editar sobre um usuario filho com papel usuario ou admin devolve 409 e o papel no banco nao muda; usuarios.criar com papel filho devolve 422
    teste_funcional: exigirFilho aceita so o papel filho e nega admin, usuario, vazio e desconhecido com 403; PAPEIS_DA_INTERFACE nao oferece Filho; editar o nome de um filho pela tela Usuarios continua funcionando; um admin ainda muda o papel de outro adulto; o rotulo vale na descricao da atividade de mudanca de papel
    criterio_aceite: tests/papel-filho.test.ts e tests/papeis.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: pendente

  - id: T-01.02
    titulo: Entidade Filho, migration, trilha e servico de cadastro
    fase: F-01.2
    status: pendente
    objetivo: Criar o modelo Filho (tabela filhos, mesadaCentavos Int, usuarioId unico opcional) com migration, incluir filhos em limparBanco, acrescentar as quatro acoes ao catalogo da trilha e a descricao delas, e criar src/servicos/filhos.ts com listarFilhos, obterFilho, cadastrarFilho e editarFilho, so para o responsavel, validados com zod e com o rastro na mesma transacao
    arquivos:
      cria: ["prisma/migrations/20261028170000_filhos/migration.sql", "src/servicos/filhos.ts", "tests/filhos-dados.test.ts", "tests/filhos.test.ts"]
      altera: ["prisma/schema.prisma", "tests/ajuda.ts", "src/lib/atividade.ts", "tests/atividade.test.ts"]
    teste_integracao: Com o banco migrado, cadastrarFilho do responsavel grava nome, nascimento, mesadaCentavos e periodicidade e devolve o filho; a trilha tem filho.cadastrado com alvoNome e sem valor, sem nascimento e sem e-mail; editarFilho muda os campos e grava filho.alterado com campos; listarFilhos devolve em ordem de cadastro; obterFilho de id inexistente devolve 404
    teste_funcional: Valor '50,00' vira 5000 e '1.234,56' vira 123456; zero, negativo, '12.5', 'abc', vazio e acima de R$ 1.000.000,00 devolvem 422; periodicidade diferente de semanal e mensal devolve 422; nome vazio ou com mais de 80 caracteres devolve 422; nascimento futuro, 2026-02-30 e formato errado devolvem 422 e vazio vira nulo; adulto, filho, vazio e papel desconhecido recebem 403; editar sem mudanca real nao grava rastro; o esquema nao tem Float nem Decimal; a coluna e INTEGER; filhos entra em limparBanco; o arquivo novo nao usa parseFloat, Number( nem toFixed
    criterio_aceite: tests/filhos-dados.test.ts e tests/filhos.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: null
    suite: pendente

---

# Plano — Sprint 01 — Papel filho e cadastro do filho

## Objetivo da sprint

Papel filho e cadastro do filho.

## Critério de saída da sprint

A suite inteira termina com 0 failed; o papel filho tem rotulo, guarda e nao nasce pela tela Usuarios; um filho real e negado em todos os servicos existentes; o responsavel cadastra, edita e lista filhos em centavos inteiros, com a trilha sem valor
