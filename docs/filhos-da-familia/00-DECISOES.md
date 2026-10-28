---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: filhos-da-familia
origem_buildx: financas-da-familia
feature_id: FT-05
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
    decisao: Escopo - cadastro do filho pelo responsavel (nome, valor de mesada combinado, periodicidade, nascimento opcional), login opcional com papel filho ligado 1 para 1, pagina de mesada do proprio filho com estado vazio, papel filho negado em todo o resto, auditoria, seed, estados, tokens; uma migration
    alternativa_descartada: Movimentos, extrato, saldo e credito automatico de mesada; exportar e apagar dados do filho
    motivo: "MAPA.md FT-05 Entrega; PROJETO.md fora de escopo; FT-06 e FT-07 como nao-objetivos; PR-30 e PR-31 (novas)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Campos do filho - nome 1 a 80, nascimento opcional AAAA-MM-DD nao futuro, mesada em centavos inteiros ate R$ 1.000.000,00 pelo leitor lerValorEmReais, periodicidade semanal ou mensal; valor e periodicidade obrigatorios e so informativos; nenhum CPF, RG, telefone, endereco ou foto
    alternativa_descartada: Mesada opcional; mais periodicidades; idade minima ou maxima
    motivo: "PR-09 (dado de menor), PR-02, PR-26, PR-30 (nova, com pendencia decisao_humana nao bloqueante)"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Modelo Filho em tabela filhos com usuarioId opcional e unico (1 para 1) e chave estrangeira para usuarios com SetNull; mesadaCentavos Int; sem Float nem Decimal; migration versionada
    alternativa_descartada: Guardar o filho como Usuario com campos extras; vinculo na tabela de usuarios
    motivo: "PR-02; PR-31 (novo); CONVENCOES secao 7 (dados do dominio: toda entidade com migration)"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: Papel filho verificado no servidor por lista de permitidos ja existente nos lancamentos e no resumo, por exigirAdmin nos demais e por exigirFilho na pagina de mesada; um teste varre todas as funcoes exportadas dos servicos com um filho REAL e prova 403
    alternativa_descartada: Confiar so no menu; negar so nas telas
    motivo: "PR-06; D-08 da FT-03; D-07 da FT-04; L2 do PROJETO.md"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Apenas o responsavel (admin) cadastra, lista, le, edita e gerencia o login do filho; o adulto (usuario) e negado com 403
    alternativa_descartada: Adulto tambem gerir filhos
    motivo: "MAPA.md FT-05 Entrega (o responsavel cadastra); PROJETO.md L2; PR-30 (invalida se o adulto tambem gerir)"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: O papel filho so nasce em criarLoginDoFilho; usuarios.criar continua aceitando so admin e usuario, a tela Usuarios nao oferece Filho, e usuarios.editar recusa mudar o papel de quem ja e filho com 409
    alternativa_descartada: Permitir criar ou migrar filho pela tela Usuarios
    motivo: "PR-31 (nova); evita login orfao e escalada de papel por outro caminho"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: Login do filho - e-mail unico entre usuarios (409 se ja existe), senha provisoria de ao menos 8 caracteres, nome do usuario igual ao do filho, tudo na mesma transacao do rastro; desativar login poe ativo=false e mantem o vinculo; sem reativar nem redefinir senha
    alternativa_descartada: Criar login junto com o cadastro; reativar e redefinir
    motivo: "PR-31; PR-12 (senha minima); pendencia decisao_humana nao bloqueante (reativar e redefinir)"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: Isolamento entre irmaos por construcao - a pagina /mesada nao recebe id; minhaMesada busca o registro por usuarioId do autor; as paginas e acoes com id (/filhos/[id], editar, login) sao so do admin e respondem ao filho de modo identico para id de irmao e id inexistente (403 no servico, redirecionamento na pagina); parametros extras em /mesada sao ignorados
    alternativa_descartada: Aceitar o id do filho na URL de /mesada e comparar
    motivo: "PR-06 (checagem no servidor); PROJETO.md criterio de aceite (sem ver o do irmao); IDOR provado por teste"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: Auditoria - quatro acoes novas no catalogo (filho.cadastrado, filho.alterado, filho.login_criado, filho.login_desativado), na mesma transacao, entidade filho e id do filho; detalhe so com alvoNome (como PR-25 aceita para o usuario afetado) e, na edicao, campos com os nomes dos campos alterados; nunca valor, saldo, e-mail nem nascimento; edicao sem mudanca real nao grava
    alternativa_descartada: Gravar o antes e o depois; gravar o e-mail do login
    motivo: "PR-10; PR-25; barreira de chaves em registrarAtividade"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: Rotas - /filhos (lista), /filhos/novo, /filhos/[id] (editar e login) so admin; /mesada so filho (admin e adulto voltam ao painel); id inexistente em /filhos/[id] cai em nao encontrado; nada de nova area de Configuracoes
    alternativa_descartada: Pagina de filhos dentro de Configuracoes
    motivo: "MAPA.md e tarefa (rotas sugeridas); P-9 (nao recriar Configuracoes)"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Navegacao por papel - responsavel ganha Filhos; adulto nao; filho ve apenas Painel, Minha mesada e Meu perfil (Configuracoes > Meu perfil); o painel do filho continua com a frase neutra sem valor e ganha um link para Minha mesada
    alternativa_descartada: Menu unico com itens desabilitados
    motivo: "Tarefa (barra lateral do filho); D-07 da FT-04; P-9 E-3 e E-4 valem para o filho"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: A pagina do filho mostra nome, valor combinado (formatarMoeda), periodicidade por extenso e o estado vazio 'Ainda nao ha movimentos de mesada'; sem saldo, sem extrato, sem botao de acao; carregando e erro vem do loading.tsx e do error.tsx do grupo; o valor combinado e rotulado como combinado (informativo)
    alternativa_descartada: Mostrar saldo zerado
    motivo: "Tarefa; PR-16 (estados); FT-06 e a dona do saldo"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: As acoes de filho ficam em src/app/acoes.ts, chamam a guarda de pagina FORA do try e o servico verifica de novo; um teste simula next/headers para executar as acoes como filho, adulto e responsavel de verdade
    alternativa_descartada: Acoes sem teste de papel; arquivo de acoes separado
    motivo: "CONVENCOES secao 5 (acao de formulario em src/app/acoes.ts); L2"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: Interface sobre os tokens - lista de filhos em cartoes, formulario de filho reaproveitando Formulario e Campo, bloco de login na pagina do filho, selo de situacao do login em texto (nao so cor); skill frontend-design para o acabamento (PR-08), nenhuma cor literal, nenhum tema novo, celular abaixo de 768px
    alternativa_descartada: Cores e fontes proprias
    motivo: "PR-07 e PR-08; 08-design-system.md"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: Seed de demonstracao idempotente e nunca em producao - dois filhos ficticios, ambos com login de papel filho (para provar o isolamento entre irmaos) e credenciais ficticias documentadas no README e na saida da seed; ids fixos, upsert sem sobrescrever
    alternativa_descartada: Um filho sem login; nenhum filho
    motivo: "PR-04; tarefa (credenciais de demonstracao ficticias)"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: Ambiente e segredos - nenhuma variavel nova, nenhuma dependencia nova; uma migration; senhas so de demonstracao, ficticias
    alternativa_descartada: null
    motivo: "PR-12; PR-20 (versoes fixadas)"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: Definicao de pronto - o responsavel cadastra e edita um filho e cria o login; o filho entra e ve so a propria mesada vazia; o filho e negado em lancamentos, categorias, atividade, usuarios, filhos e acoes; um filho nao le o irmao; auditoria sem valor; PR-06 realizada; dois temas, celular; quatro comandos verdes
    alternativa_descartada: null
    motivo: "MAPA.md FT-05 Entrega e PROJETO.md Criterios de aceite"
    status: fechada
    bloqueante: false
---

# Decisões — filhos-da-familia

> F2 respondida pelo buildx (`respondido_por: buildx`), nos quatro degraus: PROJETO, PREMISSAS, CONVENCOES, e só então premissa nova `f2_autonoma`. Nenhum humano foi consultado.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo (respondida pelo buildx, não pelo usuário)

## Decisões

```
D-00 | densidade padrao, construcao autonomo | - | respondido pelo buildx: modo autonomo do projeto (PROJETO.md, Origem); fonte PR-01
D-01 | Escopo | Movimentos, extrato, saldo e credito automatico de mesada; exportar e apagar dados do filho | MAPA.md FT-05 Entrega; PROJETO.md fora de escopo; FT-06 e FT-07 como nao-objetivos; PR-30 e PR-31 (novas)
D-02 | Campos do filho | Mesada opcional; mais periodicidades; idade minima ou maxima | PR-09 (dado de menor), PR-02, PR-26, PR-30 (nova, com pendencia decisao_humana nao bloqueante)
D-03 | Modelo Filho em tabela filhos com usuarioId opcional e unico (1 para 1) e chave estrangeira para usuarios com  | Guardar o filho como Usuario com campos extras; vinculo na tabela de usuarios | PR-02; PR-31 (novo); CONVENCOES secao 7 (dados do dominio: toda entidade com migration)
D-04 | Papel filho verificado no servidor por lista de permitidos ja existente nos lancamentos e no resumo, por exigi | Confiar so no menu; negar so nas telas | PR-06; D-08 da FT-03; D-07 da FT-04; L2 do PROJETO.md
D-05 | Apenas o responsavel (admin) cadastra, lista, le, edita e gerencia o login do filho; o adulto (usuario) e nega | Adulto tambem gerir filhos | MAPA.md FT-05 Entrega (o responsavel cadastra); PROJETO.md L2; PR-30 (invalida se o adulto tambem gerir)
D-06 | O papel filho so nasce em criarLoginDoFilho; usuarios.criar continua aceitando so admin e usuario, a tela Usua | Permitir criar ou migrar filho pela tela Usuarios | PR-31 (nova); evita login orfao e escalada de papel por outro caminho
D-07 | Login do filho | Criar login junto com o cadastro; reativar e redefinir | PR-31; PR-12 (senha minima); pendencia decisao_humana nao bloqueante (reativar e redefinir)
D-08 | Isolamento entre irmaos por construcao | Aceitar o id do filho na URL de /mesada e comparar | PR-06 (checagem no servidor); PROJETO.md criterio de aceite (sem ver o do irmao); IDOR provado por teste
D-09 | Auditoria | Gravar o antes e o depois; gravar o e-mail do login | PR-10; PR-25; barreira de chaves em registrarAtividade
D-10 | Rotas | Pagina de filhos dentro de Configuracoes | MAPA.md e tarefa (rotas sugeridas); P-9 (nao recriar Configuracoes)
D-11 | Navegacao por papel | Menu unico com itens desabilitados | Tarefa (barra lateral do filho); D-07 da FT-04; P-9 E-3 e E-4 valem para o filho
D-12 | A pagina do filho mostra nome, valor combinado (formatarMoeda), periodicidade por extenso e o estado vazio 'Ai | Mostrar saldo zerado | Tarefa; PR-16 (estados); FT-06 e a dona do saldo
D-13 | As acoes de filho ficam em src/app/acoes.ts, chamam a guarda de pagina FORA do try e o servico verifica de nov | Acoes sem teste de papel; arquivo de acoes separado | CONVENCOES secao 5 (acao de formulario em src/app/acoes.ts); L2
D-14 | Interface sobre os tokens | Cores e fontes proprias | PR-07 e PR-08; 08-design-system.md
D-15 | Seed de demonstracao idempotente e nunca em producao | Um filho sem login; nenhum filho | PR-04; tarefa (credenciais de demonstracao ficticias)
D-16 | Ambiente e segredos | - | PR-12; PR-20 (versoes fixadas)
D-17 | Definicao de pronto | - | MAPA.md FT-05 Entrega e PROJETO.md Criterios de aceite
```

## Eixos cobertos

1. **Escopo de negócio:** D-01, D-02, D-05. 2. **Arquitetura:** D-03, D-10, D-13 (camadas inalteradas, PR-17). 3. **Contrato de dados:** D-02, D-03, D-07. 4. **Estado e observabilidade:** D-09, D-12 (vazio, carregando e erro). 5. **Resiliência e política de erro:** D-04, D-06, D-08. 6. **Ambiente e segredos:** D-16. 7. **Definição de pronto:** D-17.

## Premissas criadas nesta F2

PR-30 (forma do cadastro do filho) e PR-31 (login do filho ligado ao registro) — `origem: f2_autonoma`, em `docs/projeto/PREMISSAS.md`. A PR-06 (papéis, incluindo o filho) é realizada por esta feature.

## Pendências

Nenhuma bloqueante. Duas pendências `decisao_humana`, não bloqueantes, resolvidas com a opção mais simples e reversível (registradas também em `00-BLOQUEIOS.md`):

1. Mesada opcional e outras periodicidades: a família quer filho sem valor combinado, ou periodicidade além de semanal e mensal? Hoje: valor e periodicidade obrigatórios, semanal ou mensal (PR-30).
2. Reativar o login ou redefinir a senha esquecida de um filho pelo responsável? Hoje: não existe; só desativar (PR-31).
