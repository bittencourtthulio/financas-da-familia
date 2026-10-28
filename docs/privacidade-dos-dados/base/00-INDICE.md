---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: privacidade-dos-dados
origem_buildx: financas-da-familia
feature_id: FT-07
atualizado_em: 2026-10-28
areas:
  - arquivo: 01-dados-e-servico.md
    titulo: Dados da família, trilha, sessão, limite de tentativas e Cascade que a exportação e a exclusão reaproveitam
    lacunas: 4
  - arquivo: 02-interface.md
    titulo: Rota de download, página Privacidade, páginas do filho, ações, menu, estilos e estados
    lacunas: 2
---

# Índice da base — privacidade-dos-dados

Briefing do buildx (montado do `docs/projeto/MAPA.md`, `PROJETO.md` e `PREMISSAS.md`):

- **Problema:** o sistema guarda nome e movimentação financeira de crianças; a família precisa levar os dados embora e apagar de verdade a conta de um filho (PR-09, LGPD art. 14; PROJETO.md, eixos L10 e L11).
- **Escopo:** o responsável (`admin`) baixa um arquivo JSON versionado com todos os dados da família (usuários, categorias, lançamentos, filhos, movimentos de mesada e a trilha de atividade) e apaga de fato a conta de um filho com o histórico dele, em uma transação, com confirmação digitando o nome.
- **Não-objetivos (nominais):** exclusão da família inteira, exclusão de usuário adulto, prazo legal de resposta, termo de consentimento assinado ou versionado, anonimização em vez de exclusão, importação do arquivo, exportação em CSV ou PDF (PROJETO.md, fora de escopo); backup e saúde (FT-08).
- **Critérios de aceite de negócio cobertos:** os do PROJETO.md não citam a exportação; a entrega vem do MAPA.md (FT-07, Entrega) e da PR-09.
- **Premissas aplicáveis:** PR-09 (realiza), PR-02 (centavos), PR-06 e PR-31 (papéis, login do filho), PR-10 e PR-25 (trilha sem dado pessoal), PR-11 (retenção), PR-12 (segredo, hash, limite de tentativas), PR-22 (limite em memória), PR-28 e PR-33 (apagar definitivo, Cascade), PR-30 (dado do filho), PR-16, PR-07 e PR-08 (pt-BR, celular, tokens, skill de design), PR-04 (seed); novas PR-34 e PR-35.
- **Convenções:** `docs/stack/CONVENCOES.md` (seções 5, 6 e 7, inclusive a nota "Nota para a FT-07").

| Arquivo | Área | Resumo |
|---|---|---|
| `01-dados-e-servico.md` | Dados e serviço | seis tabelas de dado; `Cascade` só em `movimentos_de_mesada`; `filhos.usuarioId` é `SET NULL`; trilha sem chave estrangeira com `alvoNome` e `filhoId` no `detalhe`; sessão é JWT sem tabela; limitador de login em memória e privado |
| `02-interface.md` | Interface | nenhuma rota de download nem página de privacidade; menu com `Atividade` e `Filhos`; ação de servidor com a guarda fora do `try`; tabela de ações sensíveis varrida por teste |
