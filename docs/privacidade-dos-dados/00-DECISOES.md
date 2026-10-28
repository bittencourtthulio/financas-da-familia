---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: privacidade-dos-dados
origem_buildx: financas-da-familia
feature_id: FT-07
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
    decisao: Escopo - exportacao JSON dos dados da familia e exclusao de verdade da conta de um filho, ambas so do admin; pagina Privacidade, botao de apagar tambem na pagina do filho; auditoria; estados; tokens; sem migration
    alternativa_descartada: Exclusao da familia inteira ou de adulto, prazo legal, termo de consentimento, anonimizar em vez de excluir, importacao, CSV ou PDF, backup (FT-08)
    motivo: "MAPA.md FT-07 Entrega; PROJETO.md fora de escopo; PR-09; PR-34 e PR-35 (novas)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Arquivo JSON UTF-8 com versao_do_formato 1, gerado_em ISO e listas usuarios, categorias, lancamentos, filhos, movimentos_de_mesada e atividade; valores em centavos inteiros com sufixo _centavos, datas civis AAAA-MM-DD e instantes ISO; sem texto formatado
    alternativa_descartada: CSV ou PDF; valor formatado em texto; formato sem versao
    motivo: "PR-02; PR-34 (nova); texto formatado duplicaria o dado"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Nunca exportar hash de senha, token, JWT, segredo, sessoesValidasDesde nem contador de tentativas; os campos de usuario sao listados um a um (select), nunca o registro inteiro; teste varre o arquivo procurando os nomes proibidos e os valores reais (hash, segredo do ambiente)
    alternativa_descartada: Exportar o registro inteiro e remover campos depois
    motivo: "PR-12; PR-34; lista de permitidos e mais segura que lista de proibidos"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: A trilha entra no arquivo como esta gravada (sem valor, senha, token nem e-mail por construcao)
    alternativa_descartada: Deixar a trilha de fora
    motivo: "Recomendacao da tarefa; PR-25; PR-34"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Rota POST /api/privacidade/exportar (GET responde 405), 401 sem sessao, 403 para usuario e filho, Content-Disposition attachment com nome dados-da-familia-AAAA-MM-DD.json, Cache-Control no-store; a rota le o cookie e chama o servico, que verifica o papel de novo
    alternativa_descartada: Rota GET; verificar o papel so na rota
    motivo: "PR-34; cookie sameSite lax segue link de outro site, e a rota grava na trilha"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: exportarDadosDaFamilia le as tabelas inteiras e serializa uma vez (JSON.stringify), sem fatiar; provado com milhares de lancamentos e de movimentos sem estourar prazo; o servico devolve o objeto e a rota serializa
    alternativa_descartada: Fila, fatiamento ou NDJSON
    motivo: "Tarefa (sem over-engineering); porte domestico (PR-18)"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: Exportar grava familia.exportada na trilha (ator, entidade exportacao, id opaco, versaoDoFormato) antes de entregar o arquivo; sem conteudo; se o rastro falha, nao ha arquivo
    alternativa_descartada: Nao registrar; registrar o conteudo
    motivo: "PR-10; PR-25; PR-34"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: Servico novo src/servicos/privacidade.ts (exportarDadosDaFamilia, excluirFilho) em vez de estender filhos.ts, para nao quebrar a varredura de filhos-papeis; as duas funcoes comecam por exigirAdmin
    alternativa_descartada: Acrescentar em filhos.ts
    motivo: "CONVENCOES secao 5; tests/filhos-papeis.test.ts; padrao da FT-06 (D-08)"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: Exclusao do filho - o servidor confere o nome digitado (igual ao nome do filho, sem diferenciar espacos nas pontas) antes de apagar; nome diferente devolve 422 e nao apaga; a tela repete a confirmacao em dois passos
    alternativa_descartada: Confirmar so na tela; apagar com um clique
    motivo: "PR-35 (nova); PR-28 como precedente"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: Uma transacao unica remove o filho, os movimentos (Cascade, provado por teste), o usuario de login filho ligado e anonimiza a trilha; falha no meio desfaz tudo; o estado de tentativas de login do e-mail e esquecido depois do commit
    alternativa_descartada: Duas transacoes; apagar o usuario sem apagar o filho
    motivo: "PR-09; PR-33; PR-35"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Trilha anonimizada, nao apagada - linhas de entidade filho com o id do filho, de mesada com filhoId no detalhe e do usuario de login (entidade ou ator) trocam alvoNome e atorNome por 'filho removido'; fica filho.excluido (ator, id opaco, sem nome); id opaco e tipo permanecem; teste inspeciona todas as tabelas procurando nome, e-mail, nascimento e descricoes do filho
    alternativa_descartada: Apagar as linhas da trilha; manter o nome
    motivo: "PR-10; PR-25 (previa a decisao da FT-07); PR-35"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: Sessao - nao ha tabela de sessao; o token emitido antes da exclusao falha em usuarioDaSessao porque o usuario nao existe, e nenhuma pagina abre; provado por teste de servico e no servidor real
    alternativa_descartada: Criar lista de revogacao
    motivo: "Base 01 (JWT sem estado); simples e suficiente"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: esquecerTentativasDeLogin(email) em autenticacao.ts expoe a limpeza do limitador em memoria, que a exclusao chama; provado criando de novo um usuario com o mesmo e-mail depois de bloqueado
    alternativa_descartada: Reiniciar o limitador inteiro
    motivo: "PR-22; o limitador e privado do modulo"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: Autorizacao - so admin exporta e exclui; usuario, filho, vazio e desconhecido recebem 403 em toda funcao do servico, na rota e na acao; quem nao entrou e levado ao login ou recebe 401; o filho nao exclui nem a si mesmo; testes executam funcoes, acao e rota como cada papel
    alternativa_descartada: Verificar so na interface
    motivo: "PR-06; CONVENCOES secao 7"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: A acao excluirContaDoFilho fica em src/app/acoes.ts, chama exigirUsuarioAdmin FORA do try, le id e confirmacao do formulario e redireciona para /privacidade com aviso; a tabela de acoes sensiveis de tests/filhos-acoes.test.ts e ampliada primeiro
    alternativa_descartada: Acao sem teste de papel
    motivo: "CONVENCOES secao 5 e 7; defeito da FT-05"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: Telas - pagina /privacidade (so admin) com explicacao curta do que e exportado e do que a exclusao apaga, botao Baixar os dados (formulario POST com download por fetch e estados preparando, erro e pronto), lista de filhos com o apagar e estado vazio; o apagar tambem na pagina do filho; item Privacidade no menu do responsavel; nada de nova area de Configuracoes; so tokens, dois temas, celular, skill frontend-design (PR-08)
    alternativa_descartada: Outra area de configuracoes; modal
    motivo: "Tarefa; PR-07, PR-08, PR-16; 08-design-system.md"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: Seed de demonstracao inalterada e idempotente; os testes criam o proprio dado para apagar
    alternativa_descartada: Novo filho de demonstracao
    motivo: "PR-04; tarefa"
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: Ambiente e segredos - nenhuma variavel nova, nenhuma dependencia nova, nenhuma migration; o arquivo exportado nunca contem o segredo do ambiente
    alternativa_descartada: null
    motivo: "PR-12; PR-20"
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: Definicao de pronto - o responsavel baixa o arquivo versionado sem nenhum campo secreto e apaga a conta de um filho digitando o nome; depois disso nome, e-mail e dinheiro do filho nao existem em tabela alguma, o login e o token falham, o outro filho e os lancamentos ficam intactos; usuario, filho e visitante sao negados; PR-09 realizada; dois temas, celular; quatro comandos verdes
    alternativa_descartada: null
    motivo: "MAPA.md FT-07 Entrega; PR-09"
    status: fechada
    bloqueante: false
---

# Decisões — privacidade-dos-dados

> F2 respondida pelo buildx (`respondido_por: buildx`), nos quatro degraus: PROJETO, PREMISSAS, CONVENCOES, e só então premissa nova `f2_autonoma` (PR-34 e PR-35). Nenhum humano foi consultado.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo (respondida pelo buildx, não pelo usuário)

## Decisões

```
D-00 | densidade padrao, construcao autonomo | null | respondido pelo buildx: modo autonomo do projeto (PROJETO.md, Origem); fonte PR-01
D-01 | Escopo | Exclusao da familia inteira ou de adulto, prazo legal, termo de consentimento, anonimizar em vez de excluir, importacao, CSV ou PDF, backup (FT-08) | MAPA.md FT-07 Entrega; PROJETO.md fora de escopo; PR-09; PR-34 e PR-35 (novas)
D-02 | Arquivo JSON UTF-8 com versao_do_formato 1, gerado_em ISO e listas usu | CSV ou PDF; valor formatado em texto; formato sem versao | PR-02; PR-34 (nova); texto formatado duplicaria o dado
D-03 | Nunca exportar hash de senha, token, JWT, segredo, sessoesValidasDesde | Exportar o registro inteiro e remover campos depois | PR-12; PR-34; lista de permitidos e mais segura que lista de proibidos
D-04 | A trilha entra no arquivo como esta gravada (sem valor, senha, token n | Deixar a trilha de fora | Recomendacao da tarefa; PR-25; PR-34
D-05 | Rota POST /api/privacidade/exportar (GET responde 405), 401 sem sessao | Rota GET; verificar o papel so na rota | PR-34; cookie sameSite lax segue link de outro site, e a rota grava na trilha
D-06 | exportarDadosDaFamilia le as tabelas inteiras e serializa uma vez (JSO | Fila, fatiamento ou NDJSON | Tarefa (sem over-engineering); porte domestico (PR-18)
D-07 | Exportar grava familia.exportada na trilha (ator, entidade exportacao, | Nao registrar; registrar o conteudo | PR-10; PR-25; PR-34
D-08 | Servico novo src/servicos/privacidade.ts (exportarDadosDaFamilia, excl | Acrescentar em filhos.ts | CONVENCOES secao 5; tests/filhos-papeis.test.ts; padrao da FT-06 (D-08)
D-09 | Exclusao do filho | Confirmar so na tela; apagar com um clique | PR-35 (nova); PR-28 como precedente
D-10 | Uma transacao unica remove o filho, os movimentos (Cascade, provado po | Duas transacoes; apagar o usuario sem apagar o filho | PR-09; PR-33; PR-35
D-11 | Trilha anonimizada, nao apagada | Apagar as linhas da trilha; manter o nome | PR-10; PR-25 (previa a decisao da FT-07); PR-35
D-12 | Sessao | Criar lista de revogacao | Base 01 (JWT sem estado); simples e suficiente
D-13 | esquecerTentativasDeLogin(email) em autenticacao.ts expoe a limpeza do | Reiniciar o limitador inteiro | PR-22; o limitador e privado do modulo
D-14 | Autorizacao | Verificar so na interface | PR-06; CONVENCOES secao 7
D-15 | A acao excluirContaDoFilho fica em src/app/acoes.ts, chama exigirUsuar | Acao sem teste de papel | CONVENCOES secao 5 e 7; defeito da FT-05
D-16 | Telas | Outra area de configuracoes; modal | Tarefa; PR-07, PR-08, PR-16; 08-design-system.md
D-17 | Seed de demonstracao inalterada e idempotente; os testes criam o propr | Novo filho de demonstracao | PR-04; tarefa
D-18 | Ambiente e segredos | null | PR-12; PR-20
D-19 | Definicao de pronto | null | MAPA.md FT-07 Entrega; PR-09
```
