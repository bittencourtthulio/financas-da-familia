---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: lancamentos-da-casa
origem_buildx: financas-da-familia
feature_id: FT-03
titulo: Lançamentos da casa
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: em_andamento
criado_em: 2026-10-28
atualizado_em: 2026-10-28
concluido_em: null
sprints: [sprint-01, sprint-02, sprint-03]
caminho_critico: [T-01.01, T-01.02, T-02.01, T-02.02, T-02.03, T-02.04, T-03.01, T-03.02, T-03.03]
modulo_afetado: [dados, aplicacao, apresentacao, lib, estilos, testes, documentacao]
arquivos_alterados: []
palavras_chave: [lancamento, categoria, receita, despesa, centavos, valor, trilha]
worktree: null
---

# Orquestrador — lancamentos-da-casa

> Porta de entrada da execução. Só caminhos relativos; nunca o valor de um segredo.

Branch do trabalho: feat/ft-03-lancamentos-da-casa (base: feat/ft-02-trilha-de-atividade, que está empilhada sobre feat/ft-01-fundacao; nada mergeado) — aberta em 2026-10-28 pela mergex

## 1. Objetivo

Entregar os lançamentos da casa (FT-03): o responsável ou o adulto registra receitas e despesas com valor, data, categoria e descrição, cria categorias novas, edita e apaga lançamento; cada criação, edição e exclusão entra na trilha de atividade (FT-02), sem nunca gravar o valor. Realiza a PR-02 (centavos inteiros, BRL). Cria a PR-26, PR-27 e PR-28. Não faz saldo nem resumo (FT-04), filhos (FT-05), mesada (FT-06) nem exportação (FT-07).

## 2. Mapa e ordem de leitura

1. Este arquivo (`docs/lancamentos-da-casa/ORQUESTRADOR.md`)
2. `docs/lancamentos-da-casa/00-DECISOES.md` — decisões que governam o plano (respondidas pelo buildx)
3. `docs/lancamentos-da-casa/base/00-INDICE.md` — e os três arquivos da base, mais `base/00-LACUNAS.md`
4. `docs/lancamentos-da-casa/sprint-01/tasks.md` até `sprint-03/tasks.md`
5. `docs/lancamentos-da-casa/00-BLOQUEIOS.md` e `00-AUDITORIA.md`
6. `docs/projeto/PREMISSAS.md` (PR-02, PR-06, PR-10, PR-25, PR-26 a PR-28), `docs/projeto/MAPA.md`, `docs/stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01: F-01.1 (T-01.01 → T-01.02)
- Sprint 02: F-02.1 (T-02.01 → T-02.02 → T-02.03 → T-02.04)
- Sprint 03: F-03.1 (T-03.01 → T-03.02 → T-03.03)

Nada roda em paralelo: as tasks tocam `src/servicos/lancamentos.ts`, `tests/lancamentos-papeis.test.ts`, `src/estilos/global.css` e `tests/rotas.test.ts` em sequência, e o MAPA marca a feature como não paralelizável.

**Caminho crítico:** a cadeia inteira é sequencial.

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; a skill `frontend-design:frontend-design` orienta o acabamento das telas dentro dos tokens (PR-08).
- **Testes:** `npm test` (as variáveis `DATABASE_URL` e `JWT_SECRET` já vêm do ambiente local; se faltarem, `export` inline no comando). Antes, `npm run build` quando a task muda HTML, porque `tests/rotas.test.ts` serve o build.
- **Lint:** `npm run lint`; **Typecheck:** `npm run typecheck`; **Esquema:** `npx prisma generate` depois de mudar `prisma/schema.prisma`.
- **Segredos:** nunca escreva o valor em arquivo versionado.

## 5. Agentes

Agente único: assume Implementador, Revisor de testes ("este teste falharia com uma implementação errada?") e Auditor de aceite em sequência, como portões, dentro de cada task.

## 6. Regras de autonomia

1. Não pergunte nada; dúvida vira premissa registrada ou bloqueio em `00-BLOQUEIOS.md`.
2. O teste vem antes do código, sempre; veja-o falhar.
3. Task só é `concluida` com teste de integração E funcional passando, `criterio_aceite` verificado e a suíte INTEIRA verde (`suite: verde`).
4. Regra de negócio não derivável: não inventar; pendência `decisao_humana` e seguir com a opção mais reversível.
5. Um commit por task, com a linha final `Co-Authored-By`, sem push e sem merge.
6. Valor monetário: inteiro em centavos; nunca `Float`, `Decimal`, `parseFloat` nem aritmética de ponto flutuante sobre valor (PR-02).

## 7. Definição de pronto global

- O adulto e o responsável de demonstração lançam uma despesa e uma receita, criam uma categoria, editam e apagam; cada ação aparece em Atividade para o responsável, sem o valor; papel que não é admin nem usuário é negado em toda função do serviço.
- PR-02 com "Realizada em: FT-03"; PR-26, PR-27 e PR-28 criadas; seção de dinheiro do CONVENCOES.md com evidência.
- `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` e `npm audit --audit-level=high` com código 0.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro. 2. Leia o `status` de cada task nos `tasks.md`. 3. Leia `00-BLOQUEIOS.md`. 4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências estão `concluida`.
