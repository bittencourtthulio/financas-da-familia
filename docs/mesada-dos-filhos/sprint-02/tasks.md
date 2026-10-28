---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: mesada-dos-filhos
origem_buildx: financas-da-familia
feature_id: FT-06
atualizado_em: 2026-10-28
sprint_id: sprint-02
sprint:
  titulo: Acoes, telas do responsavel e pagina do filho
  status: pendente
  criterio_saida: A suite inteira termina com 0 failed; o responsavel registra, edita e apaga movimentos e ve o saldo de cada filho pelas telas; o filho ve saldo em destaque e extrato paginado so dele; as acoes de escrita sao barradas para filho, adulto e visitante; o servidor real prova as rotas
  riscos: [regra de CSS so com token, tabela de acoes sensiveis ampliada, citacoes de linha de acoes.ts, caixa de formulario que reinicia apos o envio]
  fora_de_escopo: [Seed, documentacao final]
fases:
  - id: F-02.1
    titulo: Apresentacao pura e acoes
    status: pendente
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
    titulo: Pagina do filho e prova no servidor
    status: pendente
    criterio_saida: Os testes novos passam e a suite inteira esta verde
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.03]
tasks:
  - id: T-02.01
    titulo: "Apresentacao do saldo, leitor de formulario e acoes de servidor"
    fase: F-02.1
    status: pendente
    objetivo: Criar src/lib/mesada.ts (situacao do saldo em texto, rotulo do movimento, enderecos do extrato), o leitor lerFormularioDeMovimento e as acoes registrarMovimentoDeMesada, salvarMovimentoDeMesada e excluirMovimentoDeMesada com a guarda do responsavel fora do try, avisando quando o gasto deixou o saldo negativo
    arquivos:
      cria: ["src/lib/mesada.ts", "tests/mesada-lib.test.ts", "tests/mesada-acoes.test.ts"]
      altera: ["src/app/acoes.ts", "src/app/formularios.ts", "tests/filhos-acoes.test.ts"]
    teste_integracao: Executadas com a sessao simulada do responsavel, as tres acoes registram, editam e apagam de verdade e devolvem a mensagem em portugues; o gasto que deixa o saldo negativo devolve o aviso; erro de servico vira mensagem sem rastro tecnico
    teste_funcional: Filho, adulto e visitante nao gravam nada por nenhuma das tres acoes e sao levados para o painel ou o login; a tabela de acoes sensiveis cobre toda acao exportada; situacaoDoSaldo diz positivo, zerado e negativo em texto, e formatarMoeda mostra o negativo com sinal; o leitor so copia campos
    criterio_aceite: tests/mesada-lib.test.ts, tests/mesada-acoes.test.ts e tests/filhos-acoes.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: null
    suite: null

  - id: T-02.02
    titulo: "Telas do responsavel: extrato, formulario rapido, edicao e saldo na lista"
    fase: F-02.2
    status: pendente
    objetivo: Criar as paginas /filhos/[id]/mesada e /filhos/[id]/mesada/[movimentoId], os componentes CamposDeMovimento, ExtratoDeMesada, SaldoDaMesada, ApagarMovimento e PaginacaoDoExtrato, o link na pagina do filho e o saldo no cartao da lista de filhos, com estilos so de tokens e a skill frontend-design
    arquivos:
      cria: ["src/app/(sistema)/filhos/[id]/mesada/page.tsx", "src/app/(sistema)/filhos/[id]/mesada/[movimentoId]/page.tsx", "src/componentes/CamposDeMovimento.tsx", "src/componentes/ExtratoDeMesada.tsx", "src/componentes/SaldoDaMesada.tsx", "src/componentes/ApagarMovimento.tsx", "src/componentes/PaginacaoDoExtrato.tsx", "tests/mesada-tela.test.ts"]
      altera: ["src/app/(sistema)/filhos/[id]/page.tsx", "src/app/(sistema)/filhos/page.tsx", "src/componentes/ListaDeFilhos.tsx", "src/estilos/global.css"]
    teste_integracao: Renderizados com dados reais, o extrato mostra data, tipo, descricao e valor com sinal na ordem recebida, o saldo em destaque com frase, o formulario rapido com tipo, valor, data e descricao, e a lista de filhos mostra o saldo de cada um
    teste_funcional: Extrato vazio diz o que fazer; saldo negativo traz sinal de menos e a frase; apagar so confirma no segundo passo; a paginacao aparece so com mais de uma pagina e mantem o filho; nenhuma cor literal no CSS novo; rotulos nos campos; botoes e links com 44px no celular
    criterio_aceite: tests/mesada-tela.test.ts e tests/filhos-tela.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: null
    suite: null

  - id: T-02.03
    titulo: "Pagina /mesada do filho preenchida e prova no servidor real"
    fase: F-02.3
    status: pendente
    objetivo: Preencher a pagina /mesada com o saldo em destaque e o extrato paginado por ?pagina=, mantendo o combinado como referencia e a pagina sem id, formulario nem botao; provar no servidor de producao real o isolamento entre irmaos, a negacao ao adulto e o responsavel registrando e vendo
    arquivos:
      cria: ["tests/mesada-rotas.test.ts"]
      altera: ["src/app/(sistema)/mesada/page.tsx", "src/componentes/MesadaDoFilho.tsx", "tests/filhos-mesada.test.ts"]
    teste_integracao: No servidor real, o filho A ve o proprio saldo e extrato, nunca o do filho B, mesmo com filho e id do irmao na consulta e no caminho; o responsavel ve extrato e saldo de cada filho; o adulto e o filho sao barrados nas telas do responsavel; id de movimento de outro filho cai em nao encontrado
    teste_funcional: O filho com saldo negativo ve a frase de saldo negativo; extrato longo pagina e a segunda pagina nao repete a primeira; a pagina do filho nao tem formulario nem botao; pagina invalida volta a ultima pagina; a resposta ao id do irmao e ao id inexistente e igual
    criterio_aceite: tests/mesada-rotas.test.ts e tests/filhos-mesada.test.ts terminam com 0 failed e a suite inteira esta verde
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: null
    suite: null

---

# Plano — Sprint 02 — Ações, telas do responsável e página do filho

## Objetivo da sprint

Ações, telas do responsável e página do filho.

## Critério de saída da sprint

A suite inteira termina com 0 failed; o responsavel registra, edita e apaga movimentos e ve o saldo de cada filho pelas telas; o filho ve saldo em destaque e extrato paginado so dele; as acoes de escrita sao barradas para filho, adulto e visitante; o servidor real prova as rotas
