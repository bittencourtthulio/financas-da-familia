---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: backup-e-saude
origem_buildx: financas-da-familia
feature_id: FT-08
titulo: Backup, restauração e saúde
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: em_andamento
criado_em: 2026-10-28
atualizado_em: 2026-10-28
concluido_em: null
sprints: [sprint-01, sprint-02, sprint-03]
caminho_critico: [T-01.01, T-01.02, T-02.02, T-02.03, T-03.03, T-03.04]
modulo_afetado: [lib, aplicacao, apresentacao, scripts, testes, documentacao]
arquivos_alterados: []
palavras_chave: [backup, restauracao, saude, log, retencao, sqlite, configuracao, correlacao]
worktree: null
---

# Orquestrador — backup-e-saude

> Porta de entrada da execução. Só caminhos relativos; nunca o valor de um segredo.

Branch do trabalho: feat/ft-08-backup-e-saude (base: feat/ft-07-privacidade-dos-dados, empilhada sobre as branches das FT-01 a FT-06; nada mergeado) — aberta em 2026-10-28

## 1. Objetivo

Entregar a FT-08: quem opera o sistema gera um backup do banco SQLite (`npm run backup`) e o restaura com um comando (`npm run restaurar -- <arquivo>`), que valida o arquivo e preserva o banco atual; consulta `GET /api/saude` para saber se o sistema e o banco respondem; o log é JSON por linha, sem segredo, hash, e-mail nem valor, e os arquivos com mais de 90 dias são descartados; erro de servidor não vaza pilha; configuração inválida derruba o start. Realiza PR-11, PR-13 e PR-14. Cria PR-36 a PR-38. Não faz agendamento, backup remoto, criptografia nem restauração pela interface.

## 2. Mapa e ordem de leitura

1. Este arquivo
2. `docs/backup-e-saude/00-DECISOES.md`
3. `docs/backup-e-saude/base/00-INDICE.md` e `base/00-LACUNAS.md`
4. `docs/backup-e-saude/sprint-01/tasks.md` até `sprint-03/tasks.md`
5. `docs/backup-e-saude/00-BLOQUEIOS.md` e `00-AUDITORIA.md`
6. `docs/projeto/PREMISSAS.md` (PR-02, PR-11, PR-12, PR-13, PR-14, PR-25), `docs/projeto/MAPA.md`, `docs/stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01: T-01.01 → T-01.02 → T-01.03
- Sprint 02: T-02.01 → T-02.02 → T-02.03
- Sprint 03: T-03.01 → T-03.02 → T-03.03 → T-03.04

Nada roda em paralelo (MAPA: não paralelizável; as tasks compartilham `src/lib/log.ts`, `package.json`, `.gitignore`, `README.md` e `CONVENCOES.md`).

## 4. Ferramentas

- **Testes:** `npm test` (`DATABASE_URL` e `JWT_SECRET` por `export` inline se faltarem). `npm run build` antes de testes que sobem o servidor.
- **Lint:** `npm run lint`; **Typecheck:** `npm run typecheck`.
- **Segredos:** nunca em arquivo versionado; o log os redige; o backup leva hashes de senha e fica fora do git.

## 5. Agentes

Agente único: Implementador, Revisor de testes e Auditor de aceite em sequência, como portões.

## 6. Regras de autonomia

1. Não pergunte nada; dúvida vira premissa ou pendência em `00-BLOQUEIOS.md`.
2. O teste vem antes do código; veja-o falhar.
3. Task só é `concluida` com os dois testes passando e a suíte INTEIRA verde.
4. Regra de negócio não derivável: não inventar.
5. Um commit por task, com `Co-Authored-By`, sem push e sem merge.
6. Valor monetário nunca vai para o log (PR-02).
7. Restauração nunca toca o banco atual antes de validar o arquivo e de preservar a cópia.

## 7. Definição de pronto global

- Backup gerado, banco alterado, restauração devolve os dados originais; arquivo inválido recusado sem alterar o banco.
- `/api/saude` 200 com banco e 503 sem banco, sem dado pessoal; público.
- Log JSON sem dado sensível; descarte de 90 dias testado com datas injetadas; servidor não sobe com configuração inválida.
- PR-11, PR-13, PR-14, PR-36, PR-37, PR-38 com "Realizada em: FT-08"; CONVENCOES.md com evidência.
- `npm run verificar` com código 0.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo. 2. Leia o `status` de cada task. 3. Leia `00-BLOQUEIOS.md`. 4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências estão `concluida`.
