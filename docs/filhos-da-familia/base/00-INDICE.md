---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: filhos-da-familia
origem_buildx: financas-da-familia
feature_id: FT-05
atualizado_em: 2026-10-28
areas:
  - arquivo: 01-dados-e-servico.md
    titulo: Usuarios, papeis, guarda de papel, trilha de atividade, dinheiro e seed que os filhos reaproveitam
    lacunas: 4
  - arquivo: 02-interface.md
    titulo: Casca do sistema, navegacao, formularios, acoes, estilos e estados
    lacunas: 3
---

# Índice da base — filhos-da-familia

Briefing do buildx (montado do `docs/projeto/MAPA.md`, `PROJETO.md` e `PREMISSAS.md`):

- **Problema:** a família não tem registro de quais filhos recebem mesada, de quanto e com que periodicidade, nem como o filho entra no sistema sem enxergar o dinheiro da casa (PROJETO.md, "O problema").
- **Escopo:** o responsável (`admin`) cadastra um filho (nome, valor de mesada combinado, periodicidade semanal ou mensal, ambos só informativos; data de nascimento opcional) e, se quiser, cria o login dele com o papel `filho`; o filho, ao entrar, vê só a própria página de mesada (nome, valor combinado, periodicidade e um estado vazio "ainda não há movimentos de mesada"). O papel `filho` é verificado no servidor em todas as rotas e serviços existentes.
- **Não-objetivos (nominais):** FT-06 (movimentos, extrato e saldo de mesada, crédito automático); FT-07 (exportar e apagar de fato os dados do filho). Regra de negócio não declarada e não inventada: idade mínima ou máxima, limite de filhos, mais de um responsável por filho, aprovação de gasto, mesada automática, tarefas que rendem mesada.
- **Critério de aceite de negócio coberto:** "um responsável cadastra um filho" (a metade que antecede o crédito da FT-06) e "um filho entra com a própria conta e vê só o próprio extrato de mesada, sem ver o do irmão" (a metade do isolamento; o extrato vem na FT-06).
- **Premissas aplicáveis:** PR-06 (realiza), PR-09 (dado de menor), PR-10 e PR-25 (trilha sem valor), PR-02 (centavos), PR-16 (pt-BR, fuso, celular, estados), PR-07 e PR-08 (tokens e skill de design), PR-04 (seed), PR-12 (segurança); novas PR-30 e PR-31.
- **Convenções:** `docs/stack/CONVENCOES.md` (seções 5, 6 e 7).

| Arquivo | Área | Resumo |
|---|---|---|
| `01-dados-e-servico.md` | Dados e serviço | `Usuario.papel` é texto livre `admin`/`usuario`; `usuarios.criar/editar` validam `admin`/`usuario`; guardas por lista de permitidos; `registrarAtividade` com catálogo fechado e barreira de chave; nenhum modelo de filho |
| `02-interface.md` | Interface | `Navegacao` recebe `ehAdmin` e `podeLancar`; o painel já tem frase neutra; ações em `src/app/acoes.ts` com guardas de `sessao-servidor.ts`; `rotas.test.ts` já tem um usuário `filho` cru |
