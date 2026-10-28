---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: mesada-dos-filhos
origem_buildx: financas-da-familia
feature_id: FT-06
atualizado_em: 2026-10-28
areas:
  - arquivo: 01-dados-e-servico.md
    titulo: Filho, papel filho, guardas, trilha de atividade, dinheiro e datas que a mesada reaproveita
    lacunas: 4
  - arquivo: 02-interface.md
    titulo: Página /mesada, páginas do filho, formulários, ações, estilos e estados
    lacunas: 2
---

# Índice da base — mesada-dos-filhos

Briefing do buildx (montado do `docs/projeto/MAPA.md`, `PROJETO.md` e `PREMISSAS.md`):

- **Problema:** a família não tem registro confiável do que cada filho recebeu de mesada, gastou e tem de saldo (PROJETO.md, "O problema").
- **Escopo:** o responsável (`admin`) registra, edita e apaga créditos de mesada e gastos de cada filho e vê o extrato e o saldo de cada um; o filho, na página `/mesada`, lê o próprio extrato (do mais recente ao mais antigo, paginado) e o saldo em destaque, somente leitura. O saldo é créditos menos gastos, em centavos inteiros, calculado no servidor.
- **Não-objetivos (nominais):** FT-07 (exportar e apagar os dados do filho); mesada automática ou recorrente (o valor combinado continua informativo); FT-08 (backup). Regra de negócio não declarada e não inventada: bloquear gasto acima do saldo, aprovação de gasto, pedido de gasto pelo filho, metas, juros, tarefas que rendem mesada, transferência entre filhos, o adulto ver a mesada.
- **Critérios de aceite de negócio cobertos:** "um responsável cadastra um filho, registra um crédito de mesada e um gasto, e vê o saldo do filho correto" e "um filho entra com a própria conta e vê só o próprio extrato de mesada, sem conseguir alterá-lo nem ver o do irmão".
- **Premissas aplicáveis:** PR-01 (realiza), PR-02 (centavos), PR-06 (papéis), PR-09 (dado de menor), PR-10 e PR-25 (trilha sem valor), PR-16 (pt-BR, fuso, celular, estados), PR-26 (forma de valor e data), PR-28 (exclusão definitiva), PR-30 e PR-31 (filho), PR-07 e PR-08 (tokens e skill de design), PR-04 (seed); novas PR-32 e PR-33.
- **Convenções:** `docs/stack/CONVENCOES.md` (seções 5, 6 e 7).

| Arquivo | Área | Resumo |
|---|---|---|
| `01-dados-e-servico.md` | Dados e serviço | `Filho` e `minhaMesada` (FT-05); `exigirAdmin` e `exigirFilho`; `registrarAtividade` com barreira de chave; `lerValorEmReais`, `dataCivilValida`; padrão `groupBy` de `resumo.ts`; nenhum modelo de movimento |
| `02-interface.md` | Interface | `/mesada` hoje mostra o combinado e o vazio; `/filhos/[id]` sem mesada; `acoes.ts` com a guarda fora do `try`; tabela de ações varrida por teste; classes de valor e paginação já existem |
