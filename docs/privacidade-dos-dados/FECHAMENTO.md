---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: privacidade-dos-dados
origem_buildx: financas-da-familia
feature_id: FT-07
titulo: Privacidade dos dados da família
tipo_trabalho: feature
fechado_em: 2026-10-28
modulo_afetado: [aplicacao, apresentacao, lib, estilos, testes, documentacao]
arquivos_alterados: ver ENTREGA.md
sprints: 3
tasks: 7
testes_novos: 131
suite_final: 1324
---

# Fechamento — privacidade-dos-dados

## O que foi entregue

- Exportação: `exportarDadosDaFamilia` (`src/servicos/privacidade.ts`) e a rota `POST /api/privacidade/exportar`, só do responsável: JSON UTF-8 versionado (`versao_do_formato: 1`) com usuários, categorias, lançamentos, filhos (com saldo), movimentos de mesada e a trilha, em centavos inteiros e datas ISO; nunca hash, token, segredo nem dado de sessão (campos listados um a um e varredura por teste). Registra `familia.exportada` sem conteúdo.
- Exclusão: `excluirFilho` apaga numa transação o filho, os movimentos (por `Cascade`) e o login, anonimiza a trilha ("filho removido") e registra `filho.excluido` sem dado pessoal; o nome do filho precisa ser digitado e o servidor confere. O token antigo deixa de valer e o estado de tentativas de login é esquecido.
- Telas: página **Privacidade** (menu do responsável) com a explicação, o botão de baixar (estados preparando, erro e pronto) e o apagar por filho; o apagar também na página do filho. Estilos só com tokens.
- PR-09 realizada; PR-34 e PR-35 criadas (`f2_autonoma`, provisórias) e realizadas; CONVENCOES.md com evidência.

## Sprints

| Sprint | Tasks | Resultado |
|---|---|---|
| sprint-01 | T-01.01, T-01.02 | concluído |
| sprint-02 | T-02.01, T-02.02, T-02.03 | concluído |
| sprint-03 | T-03.01, T-03.02 | concluído |

## Testes

131 testes novos (1193 → 1324), em nove arquivos novos (`privacidade-exportacao`, `privacidade-papeis`, `privacidade-exclusao`, `privacidade-banco`, `privacidade-rota`, `privacidade-acoes`, `privacidade-tela`, `privacidade-rotas`, `privacidade-demonstracao`) e ampliações em atividade-dados, filhos-acoes, filhos-login, premissas e convenções.

## Pendências e observações

- `decisao_humana` (não bloqueante): exclusão da família inteira ou de adulto, prazo legal de resposta, termo de consentimento assinado e versionado, anonimizar em vez de excluir (PR-35).
- `decisao_humana` (não bloqueante): CSV ou PDF, texto formatado dos valores, importação do arquivo, exportação por filho ou período (PR-34).
- `decisao_humana` (não bloqueante): lixeira ou desfazer ao apagar a conta do filho (PR-35).
- `trabalho_novo`: `editarFilho` não renomeia o usuário de login do filho (FT-05).
- `recurso_externo`: não há remoto; o PR não foi aberto.
- Observação: o arquivo exportado leva nomes e e-mails de menores e todo o dinheiro da casa; a tela avisa para guardá-lo com cuidado. A sessão é JWT sem tabela: por isso a exclusão não precisa revogar nada.
- Não exercitado: as telas em navegador real (aparência em dois temas, no celular e o download pelo navegador); a prova é por renderização, por regra de CSS lida por teste e pelo servidor de produção com `fetch`.
