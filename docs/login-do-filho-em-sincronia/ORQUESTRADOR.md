---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: login-do-filho-em-sincronia
origem_buildx: financas-da-familia
feature_id: FT-09
titulo: Login do filho acompanha o cadastro
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-28
atualizado_em: 2026-10-28
concluido_em: 2026-10-28
sprints: [sprint-01]
caminho_critico: [T-01.01, T-01.02, T-01.03]
modulo_afetado: [aplicacao, lib, testes, documentacao]
arquivos_alterados: []
palavras_chave: [filho, login, nome, sincronia, transacao, trilha, recursao]
worktree: null
---

# Orquestrador — login-do-filho-em-sincronia

> Porta de entrada da execução. Só caminhos relativos; nunca o valor de um segredo.

Branch do trabalho: feat/ft-09-login-do-filho-em-sincronia (base: feat/ft-08-backup-e-saude, empilhada sobre as FT-01 a FT-08; nada mergeado) — aberta em 2026-10-28

## 1. Objetivo

Corrigir o defeito PEND-18 (achado na FT-07): `editarFilho` altera o filho mas não o usuário de login ligado a ele, que continua mostrando o nome antigo (menu, perfil, trilha, exportação). Ao editar o nome do filho, o nome do usuário vinculado muda na mesma transação; sem login nada muda; o e-mail nunca muda; a trilha registra sem dado pessoal; só o `admin` edita. Cria a PR-39. Não faz troca de e-mail, nem o sentido contrário (Usuários → filho), nem tela nova.

## 2. Mapa e ordem de leitura

1. Este arquivo
2. `docs/login-do-filho-em-sincronia/00-DECISOES.md`
3. `docs/login-do-filho-em-sincronia/sprint-01/tasks.md`
4. `docs/login-do-filho-em-sincronia/00-BLOQUEIOS.md` e `00-AUDITORIA.md`
5. `docs/projeto/PREMISSAS.md` (PR-25, PR-31, PR-35, PR-39), `docs/projeto/MAPA.md`, `docs/stack/CONVENCOES.md`

## 3. Rota de execução

Sprint 01: T-01.01 (renomear o login na transação) → T-01.02 (atomicidade, trilha e cura de divergência) → T-01.03 (convenções, premissa, mapa e fechamento). Nada em paralelo: tocam `src/servicos/filhos.ts`, `docs/stack/CONVENCOES.md` e `tests/convencoes.test.ts` em sequência.

## 4. Ferramentas

Testes: `npm test` (a suíte define o próprio banco e o segredo); `npm run build` antes, porque `tests/rotas.test.ts` serve o build. Lint `npm run lint`, typecheck `npm run typecheck`. Sem migration. Nunca o valor de um segredo em arquivo.

## 5. Agentes

Agente único: Implementador, Revisor de testes e Auditor de aceite em sequência, como portões.

## 6. Regras de autonomia

1. Não pergunte nada; dúvida vira premissa (PR-39) ou pendência em `00-BLOQUEIOS.md`.
2. Teste antes do código; veja-o falhar.
3. Task só é `concluida` com a suíte INTEIRA verde.
4. O e-mail do login é credencial: nunca muda pela edição do filho.
5. A trilha nunca leva e-mail nem o nome antigo (PR-25).
6. Um commit por task, com `Co-Authored-By`, sem push e sem merge.

## 7. Definição de pronto global

- Editar o nome de um filho com login muda o nome do usuário na mesma transação; sem login, nada muda; e-mail intocado; irmão intocado; adulto negado; falha no rastro desfaz tudo.
- PR-39 criada e realizada; CONVENCOES.md e MAPA.md atualizados; `npm run verificar` com código 0.

## 8. Como retomar

Leia este arquivo, o `status` das tasks em `sprint-01/tasks.md` e `00-BLOQUEIOS.md`; continue da primeira task não `concluida`.
