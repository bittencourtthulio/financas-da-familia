---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: privacidade-dos-dados
origem_buildx: financas-da-familia
feature_id: FT-07
titulo: Privacidade dos dados da família
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-28
atualizado_em: 2026-10-28
concluido_em: 2026-10-28
sprints: [sprint-01, sprint-02, sprint-03]
caminho_critico: [T-01.01, T-01.02, T-02.01, T-02.02, T-02.03, T-03.01, T-03.02]
modulo_afetado: [aplicacao, apresentacao, lib, estilos, testes, documentacao]
arquivos_alterados: []
palavras_chave: [privacidade, lgpd, exportacao, exclusao, menor, filho, trilha, anonimizacao, sessao, centavos]
worktree: null
---

# Orquestrador — privacidade-dos-dados

> Porta de entrada da execução. Só caminhos relativos; nunca o valor de um segredo.

Branch do trabalho: feat/ft-07-privacidade-dos-dados (base: feat/ft-06-mesada-dos-filhos, empilhada sobre feat/ft-05-filhos-da-familia, feat/ft-04-saldo-e-resumo-do-mes, feat/ft-03-lancamentos-da-casa, feat/ft-02-trilha-de-atividade e feat/ft-01-fundacao; nada mergeado) — aberta em 2026-10-28 pela mergex

## 1. Objetivo

Entregar a privacidade dos dados da família (FT-07): o responsável baixa um arquivo JSON versionado com todos os dados da família (usuários, categorias, lançamentos, filhos, movimentos de mesada e a trilha), sem nenhum campo secreto, e apaga de verdade a conta de um filho com o histórico dele, em uma transação, digitando o nome dele. A trilha é anonimizada (não apagada) e registra a exclusão sem dado pessoal; o login e o token do filho morrem. Realiza a PR-09. Cria a PR-34 e a PR-35. Não faz exclusão da família ou de adulto, prazo legal, termo de consentimento, anonimização em vez de exclusão, importação, CSV ou PDF (fora de escopo) nem backup (FT-08).

## 2. Mapa e ordem de leitura

1. Este arquivo (`docs/privacidade-dos-dados/ORQUESTRADOR.md`)
2. `docs/privacidade-dos-dados/00-DECISOES.md` — decisões que governam o plano (respondidas pelo buildx)
3. `docs/privacidade-dos-dados/base/00-INDICE.md` — e os dois arquivos da base, mais `base/00-LACUNAS.md`
4. `docs/privacidade-dos-dados/sprint-01/tasks.md` até `sprint-03/tasks.md`
5. `docs/privacidade-dos-dados/00-BLOQUEIOS.md` e `00-AUDITORIA.md`
6. `docs/projeto/PREMISSAS.md` (PR-02, PR-06, PR-09, PR-10, PR-11, PR-22, PR-25, PR-28, PR-30, PR-31, PR-33, PR-34, PR-35), `docs/projeto/MAPA.md`, `docs/stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01: F-01.1 (T-01.01) → F-01.2 (T-01.02)
- Sprint 02: F-02.1 (T-02.01) → F-02.2 (T-02.02) → F-02.3 (T-02.03)
- Sprint 03: F-03.1 (T-03.01) → F-03.2 (T-03.02)

Nada roda em paralelo: as tasks tocam `src/servicos/privacidade.ts`, `src/app/acoes.ts`, `src/estilos/global.css`, `tests/filhos-acoes.test.ts` e `docs/stack/CONVENCOES.md` em sequência, e o MAPA marca a feature como não paralelizável.

**Caminho crítico:** a cadeia inteira é sequencial.

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; a skill `frontend-design:frontend-design` orienta o acabamento das telas (PR-08), sempre dentro dos tokens.
- **Testes:** `npm test` (as variáveis `DATABASE_URL` e `JWT_SECRET` já vêm do ambiente local; se faltarem, `export` inline no comando). Antes, `npm run build` quando a task muda HTML, porque os testes de rotas servem o build. Nenhuma migration nova.
- **Lint:** `npm run lint`; **Typecheck:** `npm run typecheck`.
- **Segredos:** nunca escreva o valor em arquivo versionado; o arquivo exportado nunca leva hash, token nem segredo.

## 5. Agentes

Agente único: assume Implementador, Revisor de testes ("este teste falharia com uma implementação errada?") e Auditor de aceite em sequência, como portões, dentro de cada task.

## 6. Regras de autonomia

1. Não pergunte nada; dúvida vira premissa registrada ou bloqueio em `00-BLOQUEIOS.md`.
2. O teste vem antes do código, sempre, inclusive em rota, ação, componentes e páginas; veja-o falhar.
3. Task só é `concluida` com teste de integração E funcional passando, `criterio_aceite` verificado e a suíte INTEIRA verde (`suite: verde`).
4. Regra de negócio não derivável: não inventar; pendência `decisao_humana` e seguir com a opção mais simples e reversível.
5. Um commit por task, com a linha final `Co-Authored-By`, sem push e sem merge.
6. Valor monetário: inteiro em centavos; nunca `Float`, `Decimal`, `parseFloat` nem aritmética de ponto flutuante (PR-02).
7. Dado de menor: o arquivo exportado nunca leva hash, token, segredo nem contador de sessão; a trilha nunca leva nome, valor nem saldo do filho excluído (PR-25, PR-35).
8. A autorização é do servidor; esconder item de menu não conta. Só `admin` exporta e exclui; o filho não exclui nem a si mesmo.
9. Nenhuma cor literal, nenhum tema novo: só tokens.

## 7. Definição de pronto global

- O responsável de demonstração baixa o arquivo versionado e sem campo secreto e apaga a conta de um filho digitando o nome; depois, nome, e-mail e dinheiro do filho não existem em tabela alguma, o login falha, o token antigo não abre página, o outro filho e os lançamentos ficam intactos; usuário, filho e visitante são negados na função, na ação e na rota.
- Trilha com `familia.exportada` e `filho.excluido`, sem dado pessoal; linhas antigas do filho anonimizadas.
- PR-09, PR-34 e PR-35 com "Realizada em: FT-07"; CONVENCOES.md com evidência.
- `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` e `npm audit --audit-level=high` com código 0.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro. 2. Leia o `status` de cada task nos `tasks.md`. 3. Leia `00-BLOQUEIOS.md`. 4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências estão `concluida`.
