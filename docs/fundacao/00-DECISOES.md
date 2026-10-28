---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: fundacao
origem_buildx: financas-da-familia
feature_id: FT-01
respondido_por: buildx
densidade: padrao
modo_construcao: autonomo
atualizado_em: 2026-10-28
decisoes:
  - id: D-00
    decisao: densidade padrao, construcao autonomo
    alternativa_descartada: null
    motivo: "respondido pelo buildx: modo autonomo do projeto (PROJETO.md, Origem) e porte de fundacao; fonte PR-01"
    status: fechada
    bloqueante: false
  - id: D-01
    decisao: Escopo - adaptar textos e nome ao dominio, semear responsavel e adulto, verificar suite e premissas, corrigir lacunas reais; nenhuma entidade de dominio
    alternativa_descartada: Semear filhos, lancamentos e mesada ja na FT-01
    motivo: "(HIPOTESE) MAPA.md FT-01 Entrega e PR-04; as entidades nascem nas FT-03, FT-05 e FT-06 (fonte: MAPA.md)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Papel admin aparece como Responsavel e papel usuario como Adulto na interface; os valores gravados continuam admin e usuario
    alternativa_descartada: Manter Administrador e Usuario
    motivo: "(HIPOTESE) PROJETO.md O que foi descoberto, L2: admin (responsavel), usuario (adulto); PR-06"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Titulo do painel Painel da familia; subtitulo com o nome do usuario e o foco nas financas da casa; estado vazio diz que lancamentos aparecem aqui quando forem registrados
    alternativa_descartada: Manter o texto generico do template
    motivo: "(HIPOTESE) MAPA.md FT-01 Entrega (chega ao painel da familia) e PROJETO.md O problema"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: Nome do sistema Financas da Familia na barra lateral, no login e nos metadados da pagina
    alternativa_descartada: Deixar o nome apenas no titulo da aba
    motivo: "(HIPOTESE) PROJETO.md titulo; src/app/layout.tsx:5 ja usa o titulo"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Seed de demonstracao com um responsavel e um adulto fictícios, sem filhos nem lancamentos; extraida para funcao testavel; nunca roda em producao
    alternativa_descartada: Seed com dados de dominio
    motivo: "(HIPOTESE) PR-04 e D-01; base/03-testes-seed-e-qualidade.md registra a seed acoplada ao modulo"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: Gaveta de navegacao no celular acionada por botao Menu na barra de status, fecha ao navegar
    alternativa_descartada: Menu sempre visivel em cima do conteudo
    motivo: "(HIPOTESE) PR-16 (abaixo de 768px a barra lateral vira gaveta); base/00-LACUNAS.md registra que nada aciona a classe gaveta-aberta"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: Estados carregando, erro e nao encontrado em pt-BR por loading.tsx, error.tsx e not-found.tsx; o erro nunca mostra mensagem tecnica nem pilha
    alternativa_descartada: Deixar as telas padrao do Next em ingles
    motivo: "(HIPOTESE) PR-16 e PR-14; CONVENCOES.md secao 6 (nenhum rastro de pilha chega ao usuario)"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: Biblioteca de formato brasileiro para valor em centavos e data no fuso America/Sao_Paulo, sem entidade de dominio
    alternativa_descartada: Deixar o formato para a FT-03
    motivo: "(HIPOTESE) PR-16 (datas e valores no formato brasileiro, fuso) e PR-02 (centavos); CONVENCOES.md secao 8"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: Renovacao deslizante da sessao revalidando conta e corte de senha
    alternativa_descartada: Renovar o token sem consultar o banco
    motivo: "(HIPOTESE) PR-05 promete refresh; numeros e salvaguarda na PR-21 (criada nesta F2, origem f2_autonoma)"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: Limite de cinco falhas por e-mail em 15 minutos com bloqueio de 15 minutos, contador em memoria
    alternativa_descartada: Limite por IP ou contador persistido no banco
    motivo: "(HIPOTESE) PR-12 exige o limite sem numeros; numeros na PR-22 (criada nesta F2, origem f2_autonoma); PR-18 uma familia por instalacao"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Pipeline como npm run verificar mais fluxo de exemplo do GitHub Actions; versoes fixadas em package.json
    alternativa_descartada: Escolher uma plataforma de CI sem remoto configurado
    motivo: "(HIPOTESE) PR-15, PR-12 e PR-20; plataforma na PR-23 (criada nesta F2, origem f2_autonoma)"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: Guardas executaveis como testes - camadas (PR-17), tokens e dois temas (PR-07), convencoes com evidencia real, premissas coerentes com o mapa
    alternativa_descartada: Apenas confirmar por leitura
    motivo: "(HIPOTESE) CONVENCOES.md secao 5 e 3 marcadas decidido_pelo_buildx; B4 exige converter em evidencia"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: Papel filho fora desta feature; nenhum campo de dominio no esquema do Prisma
    alternativa_descartada: Antecipar o papel filho
    motivo: "(HIPOTESE) MAPA.md FT-05 e PR-06; PR-18 (sem multi-tenant)"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: Branch feat/ft-01-fundacao na arvore principal, artefatos em docs/fundacao, sem worktree
    alternativa_descartada: git worktree por feature (regra 21 do sprintx)
    motivo: "(HIPOTESE) PR-24 (criada nesta F2, origem f2_autonoma); nenhuma feature do MAPA e paralelizavel"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: Ambiente e segredos - DATABASE_URL e JWT_SECRET vindos do ambiente do comando, nunca em arquivo versionado; sem variavel nova
    alternativa_descartada: Arquivo de ambiente versionado
    motivo: "(HIPOTESE) PR-12 e CONVENCOES.md secao 7"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: Definicao de pronto - responsavel entra, ve o painel da familia, cadastra um adulto, o adulto entra e nao ve Usuarios, edita perfil, troca senha; dois temas; celular com gaveta; suite, lint, build e auditoria verdes
    alternativa_descartada: null
    motivo: "(HIPOTESE) MAPA.md FT-01 Entrega e PROJETO.md Criterios de aceite (membro adulto nao gerencia usuarios)"
    status: fechada
    bloqueante: false
---

# Decisões — fundacao

> F2 respondida pelo buildx (`respondido_por: buildx`), nos quatro degraus: PROJETO, PREMISSAS, CONVENCOES, e só então premissa nova `f2_autonoma`. Nenhum humano foi consultado.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo (respondida pelo buildx, não pelo usuário)

## Decisões

```
D-00 | densidade padrao, construcao autonomo | - | respondido pelo buildx; fonte PR-01
D-01 | Escopo: adaptar, semear responsavel/adulto, verificar, corrigir lacunas; sem entidade de dominio | Semear filhos/lancamentos | (HIPOTESE) MAPA.md FT-01; PR-04
D-02 | admin = Responsavel, usuario = Adulto na interface | Administrador/Usuario | (HIPOTESE) PROJETO.md L2; PR-06
D-03 | Painel da familia, subtitulo e estado vazio do dominio | Texto generico | (HIPOTESE) MAPA.md FT-01 Entrega
D-04 | Nome Financas da Familia na lateral, login e metadados | So no titulo da aba | (HIPOTESE) PROJETO.md
D-05 | Seed: responsavel e adulto ficticios, funcao testavel, nunca em producao | Seed com dominio | (HIPOTESE) PR-04, D-01
D-06 | Gaveta por botao Menu na barra de status, fecha ao navegar | Menu sempre visivel | (HIPOTESE) PR-16; base/00-LACUNAS.md
D-07 | loading, error e not-found em pt-BR, sem pilha | Telas padrao em ingles | (HIPOTESE) PR-16, PR-14, CONVENCOES secao 6
D-08 | Biblioteca de formato BR (centavos, data, fuso) sem entidade | Deixar para a FT-03 | (HIPOTESE) PR-16, PR-02
D-09 | Renovacao deslizante revalidando conta e corte | Renovar sem consultar o banco | (HIPOTESE) PR-05, PR-21 (nova)
D-10 | 5 falhas/e-mail/15 min, bloqueio 15 min, memoria | Por IP ou no banco | (HIPOTESE) PR-12, PR-22 (nova), PR-18
D-11 | npm run verificar + fluxo de exemplo; versoes fixadas | Escolher plataforma de CI | (HIPOTESE) PR-15, PR-12, PR-20, PR-23 (nova)
D-12 | Guardas executaveis (camadas, tokens, convencoes, premissas) | So confirmar por leitura | (HIPOTESE) CONVENCOES secoes 3 e 5
D-13 | Papel filho e campos de dominio fora desta feature | Antecipar o filho | (HIPOTESE) MAPA.md FT-05; PR-06; PR-18
D-14 | Branch na arvore principal, docs/fundacao, sem worktree | Worktree por feature | (HIPOTESE) PR-24 (nova)
D-15 | Segredos so do ambiente do comando; sem variavel nova | Arquivo de ambiente versionado | (HIPOTESE) PR-12, CONVENCOES secao 7
D-16 | Definicao de pronto: fluxo do responsavel e do adulto, dois temas, celular, quatro comandos verdes | - | (HIPOTESE) MAPA.md FT-01; PROJETO.md criterios
```

## Eixos cobertos

1. **Escopo de negócio:** D-01, D-02, D-03, D-13. 2. **Arquitetura:** D-06, D-07, D-08, D-12 (camadas inalteradas, PR-17). 3. **Contrato de dados:** D-05, D-13 (esquema do Prisma inalterado). 4. **Estado e observabilidade:** D-07 (erro sem pilha); log estruturado fica na FT-08. 5. **Resiliência e política de erro:** D-09, D-10. 6. **Ambiente e segredos:** D-15. 7. **Definição de pronto:** D-16.

## Premissas criadas nesta F2

PR-21 (renovação), PR-22 (limite de tentativas), PR-23 (pipeline), PR-24 (processo) — todas `origem: f2_autonoma`, em `docs/projeto/PREMISSAS.md`.

## Pendências

Nenhuma pendência. Nenhuma regra de negócio ficou sem resposta: tudo o que a FT-01 decide é de proteção, aparência ou processo, e vem do PROJETO, das PREMISSAS ou das CONVENCOES.
