---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: saldo-e-resumo-do-mes
origem_buildx: financas-da-familia
feature_id: FT-04
titulo: Saldo e resumo do mês
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-28
atualizado_em: 2026-10-28
concluido_em: 2026-10-28
sprints: [sprint-01, sprint-02, sprint-03]
caminho_critico: [T-01.01, T-01.02, T-02.01, T-02.02, T-03.01]
modulo_afetado: [aplicacao, apresentacao, lib, estilos, dados, testes, documentacao]
arquivos_alterados: []
palavras_chave: [saldo, resumo, mes, receita, despesa, categoria, centavos, painel]
worktree: null
---

# Orquestrador — saldo-e-resumo-do-mes

> Porta de entrada da execução. Só caminhos relativos; nunca o valor de um segredo.

Branch do trabalho: feat/ft-04-saldo-e-resumo-do-mes (base: feat/ft-03-lancamentos-da-casa, empilhada sobre feat/ft-02-trilha-de-atividade e feat/ft-01-fundacao; nada mergeado) — aberta em 2026-10-28 pela mergex

## 1. Objetivo

Entregar o saldo e o resumo do mês (FT-04): ao entrar, o responsável ou o adulto vê no painel inicial o total de receitas, o total de despesas, o saldo do mês escolhido e as despesas somadas por categoria, com seletor de mês por parâmetro de URL validado no servidor. Realiza a PR-08 (acabamento com a skill de frontend design). Cria a PR-29. Não cria nem edita lançamento (FT-03), não faz filhos nem mesada (FT-05/06), exportação (FT-07), saldo acumulado, orçamento, meta, comparativo nem gráfico de evolução.

## 2. Mapa e ordem de leitura

1. Este arquivo (`docs/saldo-e-resumo-do-mes/ORQUESTRADOR.md`)
2. `docs/saldo-e-resumo-do-mes/00-DECISOES.md` — decisões que governam o plano (respondidas pelo buildx)
3. `docs/saldo-e-resumo-do-mes/base/00-INDICE.md` — e os dois arquivos da base, mais `base/00-LACUNAS.md`
4. `docs/saldo-e-resumo-do-mes/sprint-01/tasks.md` até `sprint-03/tasks.md`
5. `docs/saldo-e-resumo-do-mes/00-BLOQUEIOS.md` e `00-AUDITORIA.md`
6. `docs/projeto/PREMISSAS.md` (PR-02, PR-06, PR-08, PR-26, PR-28, PR-29), `docs/projeto/MAPA.md`, `docs/stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01: F-01.1 (T-01.01 → T-01.02)
- Sprint 02: F-02.1 (T-02.01 → T-02.02)
- Sprint 03: F-03.1 (T-03.01)

Nada roda em paralelo: as tasks tocam `src/servicos/resumo.ts`, `src/estilos/global.css`, `tests/rotas.test.ts` e `docs/stack/CONVENCOES.md` em sequência, e o MAPA marca a feature como não paralelizável.

**Caminho crítico:** a cadeia inteira é sequencial.

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; a skill `frontend-design:frontend-design` orienta o acabamento do painel (PR-08), sempre dentro dos tokens; a skill `dataviz` era opcional e não foi necessária (a barra é um trilho sob cada categoria, sem gráfico).
- **Testes:** `npm test` (as variáveis `DATABASE_URL` e `JWT_SECRET` já vêm do ambiente local; se faltarem, `export` inline no comando). Antes, `npm run build` quando a task muda HTML, porque `tests/rotas.test.ts` serve o build.
- **Lint:** `npm run lint`; **Typecheck:** `npm run typecheck`. Não há mudança de esquema, então não há `prisma generate` nem migration.
- **Segredos:** nunca escreva o valor em arquivo versionado.

## 5. Agentes

Agente único: assume Implementador, Revisor de testes ("este teste falharia com uma implementação errada?") e Auditor de aceite em sequência, como portões, dentro de cada task.

## 6. Regras de autonomia

1. Não pergunte nada; dúvida vira premissa registrada ou bloqueio em `00-BLOQUEIOS.md`.
2. O teste vem antes do código, sempre; veja-o falhar.
3. Task só é `concluida` com teste de integração E funcional passando, `criterio_aceite` verificado e a suíte INTEIRA verde (`suite: verde`).
4. Regra de negócio não derivável: não inventar; pendência `decisao_humana` e seguir com a opção mais reversível (saldo acumulado: não).
5. Um commit por task, com a linha final `Co-Authored-By`, sem push e sem merge.
6. Valor monetário: inteiro em centavos; nunca `Float`, `Decimal`, `parseFloat` nem aritmética de ponto flutuante sobre valor (PR-02); a soma nunca acontece no cliente.
7. Nenhuma cor literal, nenhum tema novo: só tokens.

## 7. Definição de pronto global

- O adulto e o responsável de demonstração veem no painel receitas, despesas, saldo e despesas por categoria do mês e navegam para o mês anterior; saldo negativo é legível sem depender de cor; papel que não é admin nem usuário é negado no serviço e não recebe dado financeiro no painel.
- 0,10 + 0,20 = 0,30 provado; primeiro e último dia do mês, virada de ano e fuso provados.
- PR-08 com "Realizada em: FT-04"; PR-29 criada; CONVENCOES.md com evidência.
- `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` e `npm audit --audit-level=high` com código 0.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro. 2. Leia o `status` de cada task nos `tasks.md`. 3. Leia `00-BLOQUEIOS.md`. 4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências estão `concluida`.
