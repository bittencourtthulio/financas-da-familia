---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: trilha-de-atividade
origem_buildx: financas-da-familia
feature_id: FT-02
atualizado_em: 2026-10-28
areas:
  - arquivo: 01-usuarios-e-autorizacao.md
    titulo: Usuarios, papeis e as acoes que serao auditadas
    lacunas: 2
  - arquivo: 02-dados-e-testes.md
    titulo: Esquema, migrations, ajuda de teste e seed
    lacunas: 2
  - arquivo: 03-interface.md
    titulo: Casca, navegacao, estados e estilos
    lacunas: 1
---

# Índice da base — trilha-de-atividade

Briefing do buildx (montado do `docs/projeto/MAPA.md`, `PROJETO.md` e `PREMISSAS.md`):

- **Problema:** vários adultos mexem em usuários e, depois, no mesmo dinheiro; ninguém consegue dizer quem fez o quê e quando (PROJETO.md, L12).
- **Escopo:** o responsável abre a tela Atividade e vê quem fez cada ação auditada, com data e hora; por ora, mudança de papel e criação/desativação de usuário; serviço de registro reutilizável (`registrarAtividade`) com entidade no Prisma e migration, para FT-03 e FT-06 chamarem.
- **Não-objetivos (nominais):** FT-03 lançamentos; FT-05 filhos; FT-06 mesada; FT-07 exportação e apagamento; FT-08 log de aplicação de 90 dias e backup. Não há valor monetário nesta feature.
- **Critério de aceite de negócio coberto:** "uma alteração fica registrada com quem fez e quando" (PROJETO.md), para as ações que já existem.
- **Premissas aplicáveis:** PR-10 (realiza), PR-11 (retenção), PR-06 (papéis; só `admin` lê), PR-04 (seed), PR-07 (design system), PR-16 (pt-BR, celular, estados), PR-17 e PR-24 (camadas, processo), PR-09 (o registro não pode virar depósito de dado de menor).
- **Convenções:** `docs/stack/CONVENCOES.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `01-usuarios-e-autorizacao.md` | Usuários e autorização | `criar`, `editar`, `desativar`, `exigirAdmin`, `exigirUsuarioAdmin`; sem nenhum registro de quem fez |
| `02-dados-e-testes.md` | Dados e testes | Esquema só com `Usuario`; `limparBanco` limpa só usuários; seed só cria usuários |
| `03-interface.md` | Interface | Navegação sem item de atividade; estados `loading`/`error` herdados do grupo `(sistema)`; tabela e `.vazio` prontos nos estilos |
