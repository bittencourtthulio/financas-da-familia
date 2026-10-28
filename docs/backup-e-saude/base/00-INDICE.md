---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: backup-e-saude
origem_buildx: financas-da-familia
feature_id: FT-08
atualizado_em: 2026-10-28
areas:
  - arquivo: 00-LACUNAS.md
    titulo: O que já existe de log, erro, configuração, banco e rota, e o que falta
    lacunas: 7
---

# Índice da base — backup-e-saude

Briefing do buildx (montado do `docs/projeto/MAPA.md`, `PROJETO.md` e `PREMISSAS.md`):

- **Problema:** o histórico financeiro da família é um arquivo SQLite só (PR-13); sem backup restaurável, um disco ruim apaga tudo. Sem rota de saúde, log estruturado e configuração que falha no start, quem opera o sistema descobre o problema tarde (PR-14).
- **Escopo:** comando `npm run backup`, comando `npm run restaurar -- <arquivo>`, `GET /api/saude` pública, log em JSON por linha sem dado sensível, descarte de log com mais de 90 dias (PR-11), erro de servidor sem pilha ao cliente, configuração inválida que derruba o start.
- **Não-objetivos (nominais):** agendamento automático do backup, backup remoto ou em nuvem, criptografia do backup, restauração pela interface, retenção/rotação dos arquivos de backup, métricas e rastreamento (L19 descartado no PROJETO.md).
- **Premissas aplicáveis:** PR-11, PR-13, PR-14 (realiza); PR-02 (nenhum valor monetário em log), PR-12 (segredo e hash), PR-25 (trilha sem dado pessoal), PR-24 (uma branch por feature, sem merge).
- **Convenções:** `docs/stack/CONVENCOES.md` (seção 6, Log e Configuração; seção 5, camadas).

| Arquivo | Área | Resumo |
|---|---|---|
| `00-LACUNAS.md` | Operação | só `console.error` na ação; `ambiente.ts` lê sob demanda e o Prisma só falha na primeira consulta; nenhuma rota de saúde; sem middleware; `better-sqlite3` só transitivo |
