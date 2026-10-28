---
expx_schema: 1
expx_tool: sprintx
kind: bloqueios
trabalho_id: backup-e-saude
origem_buildx: financas-da-familia
feature_id: FT-08
atualizado_em: 2026-10-28
bloqueios: []
pendencias_nao_bloqueantes:
  - classe: decisao_humana
    assunto: Agendamento automatico do backup (frequencia, horario) e retencao dos arquivos de backup antigos
    seguiu_com: backup so manual, sem rotacao (PR-37); o runbook sugere agendar por cron do sistema
  - classe: decisao_humana
    assunto: Criptografia do arquivo de backup
    seguiu_com: arquivo em claro, permissao 0600, fora do git, runbook manda guardar com cuidado (leva hash de senha e todo o dinheiro da casa)
  - classe: recurso_externo
    assunto: Backup remoto ou em nuvem
    seguiu_com: nada; exige conta e credencial que o buildx nao tem
  - classe: decisao_humana
    assunto: Restauracao pela interface
    seguiu_com: so por comando; uma tela que sobrescreve o banco exige regra de papel, confirmacao e parada do sistema
  - classe: recurso_externo
    assunto: Remoto git para abrir o pull request
    seguiu_com: branch local; descricao pronta em PR.md
  - classe: trabalho_novo
    assunto: editarFilho nao renomeia o usuario de login do filho (achado da FT-07, pertence a FT-05)
    seguiu_com: nao tocado
---

# Bloqueios

Nenhum bloqueio registrado.

## Pendências não bloqueantes

| Classe | Assunto | Seguiu com |
|---|---|---|
| `decisao_humana` | Agendamento automático do backup e retenção dos arquivos de backup | Só manual, sem rotação (PR-37) |
| `decisao_humana` | Criptografia do backup | Arquivo em claro, 0600, fora do git, runbook de guarda |
| `recurso_externo` | Backup remoto ou em nuvem | Nada |
| `decisao_humana` | Restauração pela interface | Só por comando |
| `recurso_externo` | Remoto git para o pull request | Branch local, PR.md pronto |
| `trabalho_novo` | `editarFilho` não renomeia o login do filho (FT-05) | Não tocado |
