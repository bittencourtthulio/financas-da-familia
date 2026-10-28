---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: mesada-dos-filhos
origem_buildx: financas-da-familia
feature_id: FT-06
titulo: Mesada dos filhos
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: em_andamento
criado_em: 2026-10-28
atualizado_em: 2026-10-28
concluido_em: null
sprints: [sprint-01, sprint-02, sprint-03]
caminho_critico: [T-01.01, T-01.02, T-02.01, T-02.02, T-02.03, T-03.01, T-03.02]
modulo_afetado: [aplicacao, apresentacao, lib, estilos, dados, testes, documentacao]
arquivos_alterados: []
palavras_chave: [mesada, movimento, credito, gasto, saldo, extrato, idor, menor, auditoria, centavos]
worktree: null
---

# Orquestrador — mesada-dos-filhos

> Porta de entrada da execução. Só caminhos relativos; nunca o valor de um segredo.

Branch do trabalho: feat/ft-06-mesada-dos-filhos (base: feat/ft-05-filhos-da-familia, empilhada sobre feat/ft-04-saldo-e-resumo-do-mes, feat/ft-03-lancamentos-da-casa, feat/ft-02-trilha-de-atividade e feat/ft-01-fundacao; nada mergeado) — aberta em 2026-10-28 pela mergex

## 1. Objetivo

Entregar a mesada dos filhos (FT-06): o responsável registra, edita e apaga créditos de mesada e gastos de cada filho e vê o extrato e o saldo de cada um; o filho consulta o próprio extrato e saldo na página `/mesada`, somente leitura, sem ver nem alterar os do irmão. O saldo é créditos menos gastos em centavos inteiros, somado no servidor; saldo negativo é permitido e sinalizado. Realiza a PR-01. Cria a PR-32 e a PR-33. Não faz mesada automática, aprovação de gasto, metas, juros, tarefas nem transferência (fora de escopo), exportar ou apagar dados do filho (FT-07) nem backup (FT-08).

## 2. Mapa e ordem de leitura

1. Este arquivo (`docs/mesada-dos-filhos/ORQUESTRADOR.md`)
2. `docs/mesada-dos-filhos/00-DECISOES.md` — decisões que governam o plano (respondidas pelo buildx)
3. `docs/mesada-dos-filhos/base/00-INDICE.md` — e os dois arquivos da base, mais `base/00-LACUNAS.md`
4. `docs/mesada-dos-filhos/sprint-01/tasks.md` até `sprint-03/tasks.md`
5. `docs/mesada-dos-filhos/00-BLOQUEIOS.md` e `00-AUDITORIA.md`
6. `docs/projeto/PREMISSAS.md` (PR-01, PR-02, PR-06, PR-09, PR-10, PR-25, PR-26, PR-30, PR-31, PR-32, PR-33), `docs/projeto/MAPA.md`, `docs/stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01: F-01.1 (T-01.01) → F-01.2 (T-01.02)
- Sprint 02: F-02.1 (T-02.01) → F-02.2 (T-02.02) → F-02.3 (T-02.03)
- Sprint 03: F-03.1 (T-03.01) → F-03.2 (T-03.02)

Nada roda em paralelo: as tasks tocam `src/servicos/mesada.ts`, `src/app/acoes.ts`, `src/estilos/global.css`, `tests/filhos-acoes.test.ts`, `tests/filhos-mesada.test.ts` e `docs/stack/CONVENCOES.md` em sequência, e o MAPA marca a feature como não paralelizável.

**Caminho crítico:** a cadeia inteira é sequencial.

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; a skill `frontend-design:frontend-design` orienta o acabamento das telas (PR-08), sempre dentro dos tokens.
- **Testes:** `npm test` (as variáveis `DATABASE_URL` e `JWT_SECRET` já vêm do ambiente local; se faltarem, `export` inline no comando). Antes, `npm run build` quando a task muda HTML, porque os testes de rotas servem o build. Há uma migration nova: `npx prisma generate` depois de mudar o esquema.
- **Lint:** `npm run lint`; **Typecheck:** `npm run typecheck`.
- **Segredos:** nunca escreva o valor em arquivo versionado; as senhas da seed são fictícias.

## 5. Agentes

Agente único: assume Implementador, Revisor de testes ("este teste falharia com uma implementação errada?") e Auditor de aceite em sequência, como portões, dentro de cada task.

## 6. Regras de autonomia

1. Não pergunte nada; dúvida vira premissa registrada ou bloqueio em `00-BLOQUEIOS.md`.
2. O teste vem antes do código, sempre, inclusive em ações, componentes e páginas; veja-o falhar. (A FT-05 teve um desvio disso; não repita.)
3. Task só é `concluida` com teste de integração E funcional passando, `criterio_aceite` verificado e a suíte INTEIRA verde (`suite: verde`).
4. Regra de negócio não derivável: não inventar; pendência `decisao_humana` e seguir com a opção mais simples e reversível (saldo negativo permitido e sinalizado; adulto sem acesso; apagar definitivo).
5. Um commit por task, com a linha final `Co-Authored-By`, sem push e sem merge.
6. Valor monetário: inteiro em centavos; nunca `Float`, `Decimal`, `parseFloat` nem aritmética de ponto flutuante (PR-02).
7. Dado de menor: a trilha nunca leva valor, saldo nem descrição (PR-25).
8. A autorização é do servidor; esconder item de menu não conta. O filho nunca informa id de filho nem de movimento.
9. Nenhuma cor literal, nenhum tema novo: só tokens.

## 7. Definição de pronto global

- O responsável de demonstração registra um crédito e um gasto de um filho e vê o saldo correto; edita e apaga; o filho de demonstração entra e vê só o próprio extrato e saldo; o adulto e o filho não alteram nem leem a mesada pelas funções do responsável; um filho não lê o irmão.
- Auditoria de registro, alteração e exclusão, sem valor, saldo nem descrição.
- PR-01 com "Realizada em: FT-06"; PR-32 e PR-33 criadas e realizadas; CONVENCOES.md com evidência.
- `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` e `npm audit --audit-level=high` com código 0.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro. 2. Leia o `status` de cada task nos `tasks.md`. 3. Leia `00-BLOQUEIOS.md`. 4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências estão `concluida`.
