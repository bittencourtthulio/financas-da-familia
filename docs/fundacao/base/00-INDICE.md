---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: fundacao
origem_buildx: financas-da-familia
feature_id: FT-01
atualizado_em: 2026-10-28
areas:
  - arquivo: 01-casca-e-navegacao.md
    titulo: Casca da aplicacao e navegacao
    lacunas: 3
  - arquivo: 02-autenticacao-e-sessao.md
    titulo: Autenticacao e sessao
    lacunas: 2
  - arquivo: 03-testes-seed-e-qualidade.md
    titulo: Testes, seed e qualidade
    lacunas: 3
---

# Índice da base — fundacao

Briefing do buildx (montado do `docs/projeto/MAPA.md`, `PROJETO.md` e `PREMISSAS.md`):

- **Problema:** o responsável entra com e-mail e senha, chega ao painel da família, cadastra outro usuário, edita o próprio perfil e troca a senha; interface em português, tema claro e escuro, usável no celular.
- **Escopo:** adaptar textos e nome do sistema ao domínio "Finanças da Família"; semear responsável e adulto de demonstração; verificar a suíte herdada; verificar P-6 e PR-16; converter `decidido_pelo_buildx` em evidência no `CONVENCOES.md`; confirmar e registrar PR-03, PR-04, PR-05, PR-07, PR-12, PR-15, PR-16, PR-17, PR-18, PR-19, PR-20.
- **Não-objetivos (nominais):** FT-02 trilha de atividade; FT-03 lançamentos; FT-04 saldo e resumo; FT-05 filhos e o papel `filho`; FT-06 mesada; FT-07 privacidade e exportação; FT-08 backup, `/api/saude`, log estruturado.
- **Critérios de aceite de negócio cobertos:** um responsável entra; um membro adulto não gerencia usuários.
- **Premissas aplicáveis:** PR-03, PR-04, PR-05, PR-07, PR-12, PR-15, PR-16, PR-17, PR-18, PR-19, PR-20.
- **Convenções:** `docs/stack/CONVENCOES.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `01-casca-e-navegacao.md` | Casca e navegação | Layout, painel, navegação, rótulos de papel, lacunas de gaveta e estados |
| `02-autenticacao-e-sessao.md` | Autenticação e sessão | Login, JWT, cookie, TTL sem renovação, sem limite de tentativas |
| `03-testes-seed-e-qualidade.md` | Testes, seed e qualidade | Harness vitest, seed acoplada ao módulo, sem CI nem typecheck isolado |
