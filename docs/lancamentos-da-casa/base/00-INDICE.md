---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: lancamentos-da-casa
origem_buildx: financas-da-familia
feature_id: FT-03
atualizado_em: 2026-10-28
areas:
  - arquivo: 01-autorizacao-e-trilha.md
    titulo: Papeis, autorizacao no servidor e o servico da trilha que esta feature estende
    lacunas: 2
  - arquivo: 02-dados-e-testes.md
    titulo: Esquema, migrations, ajuda de teste, seed e formato de valor e data
    lacunas: 3
  - arquivo: 03-interface.md
    titulo: Casca, navegacao, formularios, estados e estilos
    lacunas: 2
---

# Índice da base — lancamentos-da-casa

Briefing do buildx (montado do `docs/projeto/MAPA.md`, `PROJETO.md` e `PREMISSAS.md`):

- **Problema:** a família não enxerga para onde o dinheiro da casa vai e não tem um lugar único para lançar o que entra e o que sai (PROJETO.md, "O problema").
- **Escopo:** o responsável (`admin`) ou o adulto (`usuario`) registra receitas e despesas da casa com valor, data, categoria e descrição, cria categorias novas, edita e apaga lançamento; cada criação, edição e exclusão entra na trilha de atividade (FT-02). Item "Lançamentos" na barra lateral, com a rota de categorias dentro dele.
- **Não-objetivos (nominais):** FT-04 saldo e resumo do mês (nenhum total, nenhum saldo nesta feature); FT-05 filhos; FT-06 mesada; FT-07 exportação e privacidade; FT-08 backup. Fora de escopo do PROJETO.md: orçamento por categoria, importação de extrato, exportação para planilha. Regra de negócio não declarada e não inventada: conjunto oficial de categorias, categorias obrigatórias, recorrência e parcelamento, várias contas ou carteiras, anexos, transferência entre contas.
- **Critérios de aceite de negócio cobertos:** "um responsável lança uma despesa e uma receita da casa" (a metade do critério que cabe aqui; o saldo é da FT-04); "um responsável corrige ou apaga um lançamento e a alteração fica registrada com quem fez e quando"; "um membro adulto vê e lança as despesas da casa, mas não gerencia usuários".
- **Premissas aplicáveis:** PR-02 (realiza: centavos inteiros, BRL), PR-10 (trilha), PR-06 (papéis; o futuro `filho` não tem acesso), PR-04 (seed), PR-07 e PR-08 (design system e frontend-design), PR-16 (pt-BR, fuso, celular, estados), PR-17 e PR-24 (camadas, processo), PR-25 (o `detalhe` da trilha nunca guarda valor).
- **Convenções:** `docs/stack/CONVENCOES.md` (seções 5, 6 e 7: camadas, erro, validação, dinheiro, auditoria).

| Arquivo | Área | Resumo |
|---|---|---|
| `01-autorizacao-e-trilha.md` | Autorização e trilha | `exigirAdmin` é a única guarda de papel; `registrarAtividade` aceita `tx`; catálogo `ACOES` fechado |
| `02-dados-e-testes.md` | Dados e testes | Esquema sem dinheiro; `limparBanco` limpa só atividade e usuário; seed de usuários e atividade; `formato.ts` formata centavos e data, não lê entrada |
| `03-interface.md` | Interface | `Navegacao` só conhece `ehAdmin`; `Formulario`/`Campo` sem select nem data; sem input de data nem de valor nos estilos |
