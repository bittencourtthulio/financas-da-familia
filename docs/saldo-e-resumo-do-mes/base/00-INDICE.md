---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: saldo-e-resumo-do-mes
origem_buildx: financas-da-familia
feature_id: FT-04
atualizado_em: 2026-10-28
areas:
  - arquivo: 01-dados-e-servico.md
    titulo: Lancamentos, categorias, datas civis, centavos, guarda de papel e seed que o resumo reaproveita
    lacunas: 3
  - arquivo: 02-interface.md
    titulo: Painel inicial, navegacao por mes, estilos, estados e design system
    lacunas: 3
---

# Índice da base — saldo-e-resumo-do-mes

Briefing do buildx (montado do `docs/projeto/MAPA.md`, `PROJETO.md` e `PREMISSAS.md`):

- **Problema:** a família não enxerga para onde o dinheiro da casa vai (PROJETO.md, "O problema"). Os lançamentos já existem (FT-03), mas ninguém vê o que eles somam.
- **Escopo:** ao entrar, o responsável (`admin`) ou o adulto (`usuario`) vê no painel inicial o total de receitas, o total de despesas, o saldo do mês escolhido e as despesas somadas por categoria. Seletor de mês com padrão no mês corrente de São Paulo, navegável por parâmetro de URL validado no servidor.
- **Não-objetivos (nominais):** FT-03 criar/editar lançamento (já entregue); FT-05 filhos e FT-06 mesada (nenhum saldo de filho); FT-07 exportação. Fora de escopo do PROJETO.md: orçamento por categoria, relatórios comparativos, exportação para planilha. Não inventados: saldo acumulado ou transportado entre meses, metas, projeções, gráficos de evolução.
- **Critério de aceite de negócio coberto:** "um responsável entra, lança uma despesa e uma receita da casa e vê o saldo do mês refletir os dois lançamentos" (a metade do saldo, que a FT-03 deixou para esta).
- **Premissas aplicáveis:** PR-08 (realiza: skill de frontend design), PR-02 (centavos inteiros), PR-06 (papéis; o futuro `filho` não vê o resumo), PR-07 (tokens), PR-16 (pt-BR, fuso, celular, estados), PR-04 (seed), PR-26 (data civil), PR-28 (apagar é definitivo, então o saldo nunca soma linha apagada).
- **Convenções:** `docs/stack/CONVENCOES.md` (seções 5, 6 e 7).

| Arquivo | Área | Resumo |
|---|---|---|
| `01-dados-e-servico.md` | Dados e serviço | `Lancamento.valorCentavos Int`, `data` texto; `listarLancamentos` não soma de propósito; `exigirAdultoOuResponsavel` é a guarda; seed tem só o mês corrente |
| `02-interface.md` | Interface | Painel `/` tem título, subtítulo e um parágrafo vazio; `FiltrosDeLancamentos` é o modelo do seletor de mês; classes `valor-despesa` e `valor-receita` existem |
