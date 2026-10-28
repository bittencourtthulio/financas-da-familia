---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: filhos-da-familia
origem_buildx: financas-da-familia
feature_id: FT-05
titulo: Filhos da família
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-28
atualizado_em: 2026-10-28
concluido_em: 2026-10-28
sprints: [sprint-01, sprint-02, sprint-03]
caminho_critico: [T-01.01, T-01.02, T-02.01, T-02.02, T-02.03, T-03.01, T-03.02]
modulo_afetado: [aplicacao, apresentacao, lib, estilos, dados, testes, documentacao]
arquivos_alterados: []
palavras_chave: [filho, mesada, papel, login, isolamento, idor, menor, auditoria, centavos]
worktree: null
---

# Orquestrador — filhos-da-familia

> Porta de entrada da execução. Só caminhos relativos; nunca o valor de um segredo.

Branch do trabalho: feat/ft-05-filhos-da-familia (base: feat/ft-04-saldo-e-resumo-do-mes, empilhada sobre feat/ft-03-lancamentos-da-casa, feat/ft-02-trilha-de-atividade e feat/ft-01-fundacao; nada mergeado) — aberta em 2026-10-28 pela mergex

## 1. Objetivo

Entregar os filhos da família (FT-05): o responsável cadastra um filho (nome, valor de mesada combinado e periodicidade, só informativos, e nascimento opcional) e, se quiser, cria o login dele com o papel `filho`, que ao entrar vê só a própria página de mesada (nome, valor combinado, periodicidade e um estado vazio de movimentos). O papel `filho` é negado no servidor em todas as rotas e serviços existentes e um filho nunca lê o registro do irmão. Realiza a PR-06. Cria a PR-30 e a PR-31. Não faz movimentos, extrato, saldo nem crédito de mesada (FT-06), nem exportar ou apagar dados (FT-07), nem idade mínima, limite de filhos, mesada automática, aprovação de gasto ou tarefas.

## 2. Mapa e ordem de leitura

1. Este arquivo (`docs/filhos-da-familia/ORQUESTRADOR.md`)
2. `docs/filhos-da-familia/00-DECISOES.md` — decisões que governam o plano (respondidas pelo buildx)
3. `docs/filhos-da-familia/base/00-INDICE.md` — e os dois arquivos da base, mais `base/00-LACUNAS.md`
4. `docs/filhos-da-familia/sprint-01/tasks.md` até `sprint-03/tasks.md`
5. `docs/filhos-da-familia/00-BLOQUEIOS.md` e `00-AUDITORIA.md`
6. `docs/projeto/PREMISSAS.md` (PR-02, PR-06, PR-09, PR-10, PR-25, PR-30, PR-31), `docs/projeto/MAPA.md`, `docs/stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01: F-01.1 (T-01.01) → F-01.2 (T-01.02)
- Sprint 02: F-02.1 (T-02.01) → F-02.2 (T-02.02) → F-02.3 (T-02.03)
- Sprint 03: F-03.1 (T-03.01) → F-03.2 (T-03.02)

Nada roda em paralelo: as tasks tocam `src/servicos/filhos.ts`, `src/app/acoes.ts`, `src/componentes/Navegacao.tsx`, `src/estilos/global.css`, `tests/rotas.test.ts` e `docs/stack/CONVENCOES.md` em sequência, e o MAPA marca a feature como não paralelizável.

**Caminho crítico:** a cadeia inteira é sequencial.

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; a skill `frontend-design:frontend-design` orienta o acabamento das telas (PR-08), sempre dentro dos tokens.
- **Testes:** `npm test` (as variáveis `DATABASE_URL` e `JWT_SECRET` já vêm do ambiente local; se faltarem, `export` inline no comando). Antes, `npm run build` quando a task muda HTML, porque `tests/rotas.test.ts` serve o build. Há uma migration nova: `npx prisma generate` depois de mudar o esquema.
- **Lint:** `npm run lint`; **Typecheck:** `npm run typecheck`.
- **Segredos:** nunca escreva o valor em arquivo versionado; as senhas da seed são fictícias.

## 5. Agentes

Agente único: assume Implementador, Revisor de testes ("este teste falharia com uma implementação errada?") e Auditor de aceite em sequência, como portões, dentro de cada task.

## 6. Regras de autonomia

1. Não pergunte nada; dúvida vira premissa registrada ou bloqueio em `00-BLOQUEIOS.md`.
2. O teste vem antes do código, sempre; veja-o falhar.
3. Task só é `concluida` com teste de integração E funcional passando, `criterio_aceite` verificado e a suíte INTEIRA verde (`suite: verde`).
4. Regra de negócio não derivável: não inventar; pendência `decisao_humana` e seguir com a opção mais reversível (mesada opcional, periodicidades extras, reativar login: não).
5. Um commit por task, com a linha final `Co-Authored-By`, sem push e sem merge.
6. Valor monetário: inteiro em centavos; nunca `Float`, `Decimal`, `parseFloat` nem aritmética de ponto flutuante (PR-02).
7. Dado de menor: nada além de nome, nascimento opcional, valor, periodicidade e e-mail de login (PR-09); a trilha nunca leva valor, e-mail nem nascimento (PR-25).
8. A autorização é do servidor; esconder item de menu não conta.
9. Nenhuma cor literal, nenhum tema novo: só tokens.

## 7. Definição de pronto global

- O responsável de demonstração cadastra, edita e lista filhos, cria e desativa o login; o filho de demonstração entra e vê só a própria mesada vazia; o filho é negado em lançamentos, categorias, resumo, atividade, usuários, filhos e em toda ação sensível; um filho não lê o irmão.
- Auditoria de cadastro, edição, criação e desativação de login, sem valor, e-mail nem nascimento.
- PR-06 com "Realizada em: FT-05"; PR-30 e PR-31 criadas; CONVENCOES.md com evidência.
- `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` e `npm audit --audit-level=high` com código 0.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro. 2. Leia o `status` de cada task nos `tasks.md`. 3. Leia `00-BLOQUEIOS.md`. 4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências estão `concluida`.
