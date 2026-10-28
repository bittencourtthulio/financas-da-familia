---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: trilha-de-atividade
origem_buildx: financas-da-familia
feature_id: FT-02
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
    decisao: Escopo - entidade Atividade com migration, servico registrarAtividade, leitura restrita a admin, tela Atividade, ligacao das tres acoes que ja existem (criar usuario, mudar papel, desativar usuario), extensao da seed
    alternativa_descartada: Auditar tambem perfil, troca de senha e login
    motivo: "(HIPOTESE) MAPA.md FT-02 Entrega e PR-10 (quem criou, alterou ou apagou lancamento e movimento e quem alterou papel; nada alem disso)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Registro guarda quem (atorId e atorNome como estava na hora), o que (acao de um catalogo fechado, entidade, entidadeId), quando (criadoEm) e um detalhe pequeno; sem chave estrangeira para usuarios
    alternativa_descartada: Chave estrangeira para o ator e leitura do nome no join
    motivo: "(HIPOTESE) PR-10 (quem, o que, quando); PR-09 e FT-07 (apagar usuario de verdade nao pode ser barrado nem desfigurar o historico); detalhe da escolha na PR-25"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Detalhe e um objeto plano de texto, numero, booleano ou nulo; chaves que lembram senha, hash, token, segredo, valor, centavos, saldo, e-mail ou CPF sao recusadas, assim como texto que parece hash de senha ou token; limite de tamanho
    alternativa_descartada: Aceitar qualquer JSON e confiar em quem chama
    motivo: "(HIPOTESE) PR-10 (nunca senha, hash, token nem dado financeiro), PR-09 (dado de menor limitado); a barreira executavel e a PR-25"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: O registro e gravado na mesma transacao da acao auditada; se o registro falha, a acao nao acontece
    alternativa_descartada: Registrar depois, fora da transacao, e engolir o erro
    motivo: "(HIPOTESE) PR-10 (vale como prova); uma acao sem rastro quebra o proposito da trilha. Risco do adaptador registrado em base/00-LACUNAS.md"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Catalogo de acoes em src/lib/atividade.ts com codigo (entidade.verbo) e rotulo em portugues; acao fora do catalogo e recusada na gravacao. FT-03 e FT-06 acrescentam as suas ao catalogo
    alternativa_descartada: Aceitar codigo livre
    motivo: "(HIPOTESE) PR-16 (tudo em portugues na tela); sem catalogo a tela mostraria codigo tecnico"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: So papel admin le o registro (servico exige admin) e so admin abre a tela e ve o item no menu; adulto recebe a mesma negacao das outras telas do responsavel
    alternativa_descartada: Adulto ve a propria atividade
    motivo: "(HIPOTESE) MAPA.md FT-02 Entrega (o responsavel abre a tela) e PR-06 (checagem no servidor)"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: O registro e somente de acrescimo - o servico nao oferece editar nem apagar, e o historico fica enquanto a conta da familia existir
    alternativa_descartada: Limpeza automatica por idade
    motivo: "(HIPOTESE) PR-11 (historico enquanto a conta existir; o limite de 90 dias e do log de aplicacao, FT-08)"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: Lista da mais recente para a mais antiga, 50 por pagina, parametro pagina na consulta, links Anterior e Proxima; fora do intervalo cai na ultima pagina valida
    alternativa_descartada: Rolagem infinita ou filtros
    motivo: "(HIPOTESE) PR-16 (usavel no celular, sem excesso); filtros e exportacao nao foram pedidos (PROJETO.md Fora de escopo)"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: Estados da tela - vazio por paragrafo proprio; carregando e erro herdados de loading.tsx e error.tsx do grupo (sistema), com teste que prova a heranca; tabela rolavel no celular
    alternativa_descartada: loading e error proprios da rota
    motivo: "(HIPOTESE) PR-16 e CONVENCOES.md secao 5 (estado de tela)"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: Item Atividade na barra lateral logo abaixo de Painel, so para admin
    alternativa_descartada: Dentro de Configuracoes
    motivo: "(HIPOTESE) MAPA.md FT-02 (item novo na barra lateral); Navegacao.tsx diz que as features acrescentam itens e nao recriam a area de Configuracoes"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Reativacao de usuario e edicao de nome ou e-mail nao entram na trilha; mudanca de papel so e registrada quando o papel realmente muda
    alternativa_descartada: Auditar toda chamada de editar
    motivo: "(HIPOTESE) PR-10 limita a criacao, desativacao e papel; nenhuma tela oferece reativar (base/01). Reversivel: acrescentar a acao ao catalogo e uma linha em editar"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: Seed ganha duas entradas de atividade fictícias (responsavel criou o adulto como responsavel, depois rebaixou a adulto), com id fixo e idempotentes, sem criar entidade de outra feature
    alternativa_descartada: Seed vazia, tela sempre no estado vazio
    motivo: "(HIPOTESE) PR-04 (entrega verificavel em trinta segundos); o estado final coincide com as contas semeadas"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: Premissa de teste da FT-01 que exigia que toda f2_autonoma fosse da FT-01 passa a exigir isso so das PR-21 a PR-24
    alternativa_descartada: Deixar o teste falhar
    motivo: "(HIPOTESE) PR-24 manda registrar premissas f2_autonoma por feature; a FT-02 cria a PR-25 com Realizada em FT-02"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: Ambiente e segredos - nenhuma variavel nova; DATABASE_URL e JWT_SECRET como na FT-01
    alternativa_descartada: null
    motivo: "(HIPOTESE) PR-12 e CONVENCOES.md secao 6"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: Definicao de pronto - o responsavel de demonstracao abre Atividade e ve as acoes semeadas; ao criar um usuario e desativar outro pela tela, as duas linhas aparecem; o adulto nao ve o item nem a tela; dois temas, celular, quatro comandos verdes
    alternativa_descartada: null
    motivo: "(HIPOTESE) MAPA.md FT-02 Entrega e PROJETO.md Criterios de aceite"
    status: fechada
    bloqueante: false
---

# Decisões — trilha-de-atividade

> F2 respondida pelo buildx (`respondido_por: buildx`), nos quatro degraus: PROJETO, PREMISSAS, CONVENCOES, e só então premissa nova `f2_autonoma`. Nenhum humano foi consultado.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo (respondida pelo buildx, não pelo usuário)

## Decisões

```
D-00 | densidade padrao, construcao autonomo | - | respondido pelo buildx; fonte PR-01
D-01 | Escopo: Atividade, servico, leitura admin, tela, 3 acoes ligadas, seed | Auditar perfil, senha, login | (HIPOTESE) MAPA.md FT-02; PR-10
D-02 | Registro: ator (id e nome da hora), acao, entidade, entidadeId, quando, detalhe; sem FK | FK para usuarios | (HIPOTESE) PR-10, PR-09, PR-25 (nova)
D-03 | Detalhe plano; chaves e valores proibidos recusados | Confiar em quem chama | (HIPOTESE) PR-10, PR-09, PR-25 (nova)
D-04 | Registro na mesma transacao da acao | Registrar depois e engolir erro | (HIPOTESE) PR-10
D-05 | Catalogo fechado de acoes com rotulo em portugues | Codigo livre | (HIPOTESE) PR-16
D-06 | So admin le e abre a tela | Adulto ve a propria atividade | (HIPOTESE) MAPA.md FT-02; PR-06
D-07 | Somente acrescimo; historico enquanto a conta existir | Limpeza por idade | (HIPOTESE) PR-11
D-08 | Mais recente primeiro, 50 por pagina, parametro pagina | Rolagem infinita, filtros | (HIPOTESE) PR-16; PROJETO.md Fora de escopo
D-09 | Vazio proprio; carregando e erro herdados do grupo | loading/error proprios | (HIPOTESE) PR-16; CONVENCOES secao 5
D-10 | Item Atividade abaixo de Painel, so admin | Dentro de Configuracoes | (HIPOTESE) MAPA.md FT-02; Navegacao.tsx
D-11 | Reativar e editar nome/e-mail fora da trilha; papel so quando muda | Auditar toda edicao | (HIPOTESE) PR-10; base/01
D-12 | Seed com duas entradas fictícias idempotentes | Seed vazia | (HIPOTESE) PR-04
D-13 | Teste de premissas: f2_autonoma da FT-01 = PR-21 a PR-24 | Deixar falhar | (HIPOTESE) PR-24
D-14 | Sem variavel de ambiente nova | - | (HIPOTESE) PR-12
D-15 | Definicao de pronto: fluxo do responsavel, adulto barrado, temas, celular, 4 comandos verdes | - | (HIPOTESE) MAPA.md FT-02
```

## Eixos cobertos

1. **Escopo de negócio:** D-01, D-06, D-07, D-11. 2. **Arquitetura:** D-04, D-05, D-10 (camadas inalteradas, PR-17; catálogo em `src/lib`, serviço em `src/servicos`). 3. **Contrato de dados:** D-02, D-03, D-12. 4. **Estado e observabilidade:** D-09 (carregando, vazio, erro). 5. **Resiliência e política de erro:** D-04 (falha de registro desfaz a ação). 6. **Ambiente e segredos:** D-14. 7. **Definição de pronto:** D-15.

## Premissas criadas nesta F2

PR-25 (forma do registro de atividade e o que ele nunca guarda) — `origem: f2_autonoma`, em `docs/projeto/PREMISSAS.md`.

## Pendências

Nenhuma bloqueante. Uma observação para a FT-07 (sem classe de pendência aberta): o registro guarda o nome do usuário afetado em `detalhe`; ao apagar de verdade a conta de um filho, a FT-07 decide se apaga ou anonimiza as linhas que o citam (PR-09, PR-25).
