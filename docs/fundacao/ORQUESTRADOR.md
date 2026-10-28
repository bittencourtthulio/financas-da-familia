---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: fundacao
origem_buildx: financas-da-familia
feature_id: FT-01
titulo: Fundacao - acesso, papeis e esqueleto
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f4
status: em_andamento
criado_em: 2026-10-28
atualizado_em: 2026-10-28
concluido_em: null
sprints: [sprint-01, sprint-02, sprint-03, sprint-04]
caminho_critico: [T-01.01, T-01.02, T-01.03, T-02.01, T-02.02, T-02.03, T-03.01, T-03.02, T-03.03, T-04.01, T-04.02, T-04.03, T-04.04, T-04.05]
modulo_afetado: [apresentacao, aplicacao, dados, lib, estilos, testes, infra, documentacao]
arquivos_alterados: []
palavras_chave: [acesso, papeis, painel, sessao, tema, celular, seed, convencoes]
worktree: null
---

# Orquestrador — fundacao

> Porta de entrada da execução. Só caminhos relativos; nunca o valor de um segredo.

Branch do trabalho: feat/ft-01-fundacao (base: main) — aberta em 2026-10-28 pela mergex

## 1. Objetivo

Entregar a fundação do sistema Finanças da Família (FT-01): o responsável entra com e-mail e senha, chega ao painel da família, cadastra outro usuário, edita o perfil e troca a senha, em português, com tema claro e escuro e usável no celular. O código vem do template; esta feature adapta os textos ao domínio, semeia responsável e adulto de demonstração, corrige as lacunas reais (gaveta, estados, limite de tentativas, renovação de sessão, pipeline) e converte as convenções em evidência.

## 2. Mapa e ordem de leitura

1. Este arquivo (`docs/fundacao/ORQUESTRADOR.md`)
2. `docs/fundacao/00-DECISOES.md` — decisões que governam o plano (respondidas pelo buildx)
3. `docs/fundacao/base/00-INDICE.md` — e os três arquivos da base que ele lista, mais `base/00-LACUNAS.md`
4. `docs/fundacao/sprint-01/tasks.md` até `docs/fundacao/sprint-04/tasks.md` (cada sprint tem uma fase e um único arquivo condensado)
5. `docs/fundacao/00-BLOQUEIOS.md` — bloqueios registrados durante a execução
6. `docs/fundacao/00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos
7. `docs/projeto/PREMISSAS.md`, `docs/projeto/MAPA.md`, `docs/stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01: F-01.1 (T-01.01 → T-01.02 → T-01.03)
- Sprint 02: F-02.1 (T-02.01 → T-02.02 → T-02.03)
- Sprint 03: F-03.1 (T-03.01 → T-03.02 → T-03.03)
- Sprint 04: F-04.1 (T-04.01 → T-04.02 → T-04.03 → T-04.04 → T-04.05)

Nada roda em paralelo: as tasks tocam arquivos em comum (`src/app/(sistema)/layout.tsx`, `src/estilos/global.css`, `tests/rotas.test.ts`) e o MAPA marca a feature como não paralelizável.

**Caminho crítico:** T-01.01 → T-01.02 → T-01.03 → T-02.01 → T-02.02 → T-02.03 → T-03.01 → T-03.02 → T-03.03 → T-04.01 → T-04.02 → T-04.03 → T-04.04 → T-04.05 (a cadeia inteira é sequencial).

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão.
- **Testes:** `export DATABASE_URL="file:./dev.db" JWT_SECRET="<gerado na hora>" && npm test` (antes, `npm run build` quando a task muda HTML, porque `tests/rotas.test.ts` serve o build).
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit` (vira `npm run typecheck` na T-04.03)
- **Segredos:** `JWT_SECRET` e `DATABASE_URL` — vêm do ambiente do próprio comando e do ambiente de teste (`tests/setup.ts`). NUNCA escreva o valor em arquivo versionado.

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa até passarem.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem, tratando cada papel como um portão — não avança ao papel seguinte sem fechar o anterior. (Esta execução tem um agente só.)

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada.
2. O teste vem antes do código, sempre.
3. Task só é `concluida` com teste de integração E funcional passando e `criterio_aceite` verificado. Não existe "concluído com ressalva". Para caber no portão da mergex (V2 e E1), cada task roda a suíte INTEIRA e grava `suite: verde`, nunca `parcial`.
4. Dúvida nova ou pré-requisito faltando: registrar em `docs/fundacao/00-BLOQUEIOS.md` (`B-NN | task | bloqueio | o que destravaria`), marcar a task `bloqueada`, pular para a próxima paralelizável. Nunca parar e esperar.
5. Só rode em paralelo o que o plano declarou paralelizável (nada, nesta feature).
6. Atualize `status` em cada `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte.
7. Critério de saída de fase/sprint não atendido = não avança.
8. Um commit por task (mergex E1), com a linha final `Co-Authored-By`, sem push e sem merge.

## 7. Definição de pronto global

- O responsável de demonstração entra, vê o painel "Painel da família", cadastra um adulto, o adulto entra e não vê Usuários, edita o perfil e troca a senha.
- Dois temas completos, celular abaixo de 768px com gaveta, estados vazio, carregando, erro e não encontrado em português.
- PR-03, PR-04, PR-05, PR-07, PR-12, PR-15, PR-16, PR-17, PR-18, PR-19, PR-20 (mais PR-21 a PR-24) com "Realizada em: FT-01" e confirmadas contra o código.
- `docs/stack/CONVENCOES.md` sem regra `decidido_pelo_buildx` sem evidência.
- `npm test`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` com código 0.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `docs/fundacao/sprint-NN/tasks.md`.
3. Leia `docs/fundacao/00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
