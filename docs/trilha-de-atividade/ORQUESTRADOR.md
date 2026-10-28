---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: trilha-de-atividade
origem_buildx: financas-da-familia
feature_id: FT-02
titulo: Trilha de atividade
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-28
atualizado_em: 2026-10-28
concluido_em: 2026-10-28
sprints: [sprint-01, sprint-02, sprint-03]
caminho_critico: [T-01.01, T-01.02, T-01.03, T-02.01, T-02.02, T-03.01, T-03.02, T-03.03]
modulo_afetado: [dados, aplicacao, apresentacao, lib, estilos, testes, documentacao]
arquivos_alterados: []
palavras_chave: [atividade, auditoria, trilha, registro, admin]
worktree: null
---

# Orquestrador — trilha-de-atividade

> Porta de entrada da execução. Só caminhos relativos; nunca o valor de um segredo.

Branch do trabalho: feat/ft-02-trilha-de-atividade (base: feat/ft-01-fundacao, que ainda não foi mergeada em main) — aberta em 2026-10-28 pela mergex

## 1. Objetivo

Entregar a trilha de atividade (FT-02): o responsável abre a tela Atividade e vê quem fez cada ação auditada (criação e desativação de usuário, mudança de papel), com data e hora, e o serviço `registrarAtividade` fica pronto, com entidade e migration, para FT-03 e FT-06. Realiza a PR-10; respeita a PR-11. O registro nunca guarda senha, hash, token nem dado financeiro (PR-25).

## 2. Mapa e ordem de leitura

1. Este arquivo (`docs/trilha-de-atividade/ORQUESTRADOR.md`)
2. `docs/trilha-de-atividade/00-DECISOES.md` — decisões que governam o plano (respondidas pelo buildx)
3. `docs/trilha-de-atividade/base/00-INDICE.md` — e os três arquivos da base, mais `base/00-LACUNAS.md`
4. `docs/trilha-de-atividade/sprint-01/tasks.md` até `sprint-03/tasks.md`
5. `docs/trilha-de-atividade/00-BLOQUEIOS.md` e `00-AUDITORIA.md`
6. `docs/projeto/PREMISSAS.md` (PR-10, PR-11, PR-25), `docs/projeto/MAPA.md`, `docs/stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01: F-01.1 (T-01.01 → T-01.02 → T-01.03)
- Sprint 02: F-02.1 (T-02.01 → T-02.02)
- Sprint 03: F-03.1 (T-03.01 → T-03.02 → T-03.03)

Nada roda em paralelo: as tasks tocam `src/servicos/atividade.ts`, `src/servicos/usuarios.ts` e `tests/rotas.test.ts` em sequência, e o MAPA marca a feature como não paralelizável.

**Caminho crítico:** a cadeia inteira é sequencial.

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão.
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

## 7. Definição de pronto global

- O responsável de demonstração abre Atividade e vê as ações semeadas; cria um usuário e desativa outro pela tela e as duas linhas aparecem; o adulto não vê o item nem a tela.
- PR-10 com "Realizada em: FT-02" e PR-25 criada; PR-11 respeitada (nenhuma remoção).
- `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` e `npm audit --audit-level=high` com código 0.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro. 2. Leia o `status` de cada task nos `tasks.md`. 3. Leia `00-BLOQUEIOS.md`. 4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências estão `concluida`.
