---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: backup-e-saude
origem_buildx: financas-da-familia
feature_id: FT-08
titulo: Backup, restauração e saúde
tipo_trabalho: feature
fechado_em: 2026-10-28
modulo_afetado: [lib, aplicacao, apresentacao, scripts, testes, documentacao]
arquivos_alterados: ver ENTREGA.md
sprints: 3
tasks: 10
testes_novos: 120
suite_final: 1444
---

# Fechamento — backup-e-saude

## O que foi entregue

- Log estruturado (`src/lib/log.ts`): JSON por linha com nível, instante, evento e contexto; redige chave proibida (lista compartilhada com a trilha, agora em `src/lib/chaves-proibidas.ts`), hash, JWT, e-mail e mensagem ou pilha de erro; nunca derruba quem o chama. Arquivo por dia em `logs/` (`LOG_DIR`), descarte de 90 dias por nome de arquivo ao subir e por `npm run log:limpar`.
- Erro sem pilha: `mensagemSegura` e `registrarErroInesperado` dão ao usuário a frase genérica e um código de 12 caracteres; o log leva o mesmo código, o nome e o código do erro. Aplicado nas ações e nas duas rotas de API que imprimiam a pilha com `console.error`.
- Saúde: `GET /api/saude` pública, 200 ou 503, só `status` e `banco`.
- Configuração no start: `validarAmbiente` e `src/instrumentation.ts`, que encerra o processo com código 1.
- Backup e restauração: `npm run backup` (`VACUUM INTO`, nome datado, 0700/0600) e `npm run restaurar -- <arquivo>` (valida, preserva o banco atual, troca de forma atômica, recusa arquivo inválido). Teste de ponta a ponta com banco temporário e as migrations reais.
- README com o runbook; CONVENCOES.md com evidência; PR-11, PR-13 e PR-14 realizadas; PR-36, PR-37, PR-38 criadas (`f2_autonoma`, provisórias) e realizadas.

## Sprints

| Sprint | Tasks | Resultado |
|---|---|---|
| sprint-01 | T-01.01, T-01.02, T-01.03 | concluído |
| sprint-02 | T-02.01, T-02.02, T-02.03 | concluído |
| sprint-03 | T-03.01, T-03.02, T-03.03, T-03.04 | concluído |

## Testes

120 testes novos (1324 → 1444), em dez arquivos novos (`log`, `log-retencao`, `erro-sem-pilha`, `erro-rotas`, `saude`, `saude-rotas`, `ambiente-start`, `backup`, `restauracao`, `backup-ponta-a-ponta`) e ampliações de `rotas`, `convencoes` e `premissas`. `npm run verificar` terminou com código 0, `Test Files  74 passed (74)`, `Tests  1444 passed (1444)`.

## Pendências e observações

- `decisao_humana` (não bloqueante): agendamento automático do backup e retenção dos arquivos de backup antigos (PR-37).
- `decisao_humana` (não bloqueante): criptografia do backup (PR-37).
- `decisao_humana` (não bloqueante): restauração pela interface (PR-37).
- `recurso_externo`: backup remoto ou em nuvem; remoto git para abrir o PR.
- `trabalho_novo`: `editarFilho` não renomeia o usuário de login do filho (FT-05).
- Observação: o `dev.db` antigo da raiz só tem a tabela `usuarios` (nunca recebeu as migrations); a restauração o recusaria como backup, corretamente. `npm run setup` o recria.
