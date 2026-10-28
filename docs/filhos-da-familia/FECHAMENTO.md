---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: filhos-da-familia
origem_buildx: financas-da-familia
feature_id: FT-05
titulo: Filhos da família
tipo_trabalho: feature
fechado_em: 2026-10-28
modulo_afetado: [aplicacao, apresentacao, lib, estilos, dados, testes, documentacao]
arquivos_alterados: ver ENTREGA.md
sprints: 3
tasks: 7
testes_novos: 264
suite_final: 960
---

# Fechamento — filhos-da-familia

## O que foi entregue

- Entidade `Filho` (tabela `filhos`, migration `20261028170000_filhos`): nome, nascimento opcional, mesada combinada em centavos inteiros e periodicidade semanal ou mensal, com vínculo único opcional ao usuário.
- Serviço `src/servicos/filhos.ts`: o responsável cadastra, lista, lê e edita o filho e cria e desativa o login (usuário de papel `filho`, 1 para 1); `minhaMesada` entrega ao filho só o próprio registro, sem receber id. Rastro de auditoria na mesma transação, com o nome do filho e os nomes dos campos, nunca valor, e-mail nem nascimento.
- Papel `filho`: rótulo "Filho", `exigirFilho`, tela Usuários que não cria nem muda para `filho`; negado por lista de permitidos em lançamentos, categorias, resumo, atividade, usuários e filhos, provado com um filho real, em serviço, em ação de servidor e no servidor de produção.
- Telas `/filhos`, `/filhos/novo`, `/filhos/[id]` (responsável) e `/mesada` (filho), menu por papel, painel neutro do filho com link, estilos só com tokens e acabamento com a skill `frontend-design` (PR-08).
- Seed com dois filhos com login (`ana@exemplo.local`, `pedro@exemplo.local`, senha `demo1234`).
- PR-06 realizada; PR-30 e PR-31 criadas (`f2_autonoma`, provisórias); CONVENCOES.md sem nenhuma regra só prescrita.

## Sprints

| Sprint | Tasks | Resultado |
|---|---|---|
| sprint-01 | T-01.01, T-01.02 | concluído |
| sprint-02 | T-02.01, T-02.02, T-02.03 | concluído |
| sprint-03 | T-03.01, T-03.02 | concluído |

## Testes

264 testes novos (696 → 960), em oito arquivos novos (`papel-filho`, `filhos`, `filhos-dados`, `filhos-login`, `filhos-papeis`, `filhos-acoes`, `filhos-tela`, `filhos-mesada`) e ampliações em atividade-dados, papéis, demonstração, premissas, convenções e rotas.

## Pendências e observações

- `decisao_humana` (não bloqueante): mesada opcional e outras periodicidades (PR-30).
- `decisao_humana` (não bloqueante): reativar o login ou redefinir a senha esquecida de um filho (PR-31).
- `recurso_externo`: não há remoto; o PR não foi aberto.
- Defeito achado e corrigido: a guarda de administrador das ações `criarUsuario`, `editarUsuario` e `desativarUsuario` estava dentro do `try` (ver ENTREGA.md).
- Observação para a FT-06: `minhaMesada` e a página `/mesada` são o ponto onde entram extrato e saldo; o filho deve continuar sem receber id.
- Observação para a FT-07: `filhos.usuarioId` usa `SET NULL` ao apagar o usuário e nenhum `CASCADE`; apagar a conta do filho com o histórico é decisão daquela feature. A trilha guarda o nome do filho no detalhe (PR-25), que a FT-07 decide se apaga.
- Não exercitado: as telas em navegador real (aparência em dois temas e no celular); a prova é por renderização, por regra de CSS lida por teste e pelo servidor de produção.
