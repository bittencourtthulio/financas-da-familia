---
expx_schema: 1
expx_tool: buildx
kind: mapa
projeto_id: financas-da-familia
atualizado_em: 2026-10-28
total_features: 8
pendentes: 2
em_andamento: 1
entregues: 5
bloqueadas: 0
---

# Finanças da Família — Mapa de features

Ordem de dependência. Nenhuma feature precede aquilo de que depende. O escopo mínimo (FT-01 a FT-06) vem antes do que o complementa (FT-07, FT-08).

## Painel

| ID | Feature | Status | PR |
|---|---|---|---|
| FT-01 | Fundação: acesso, papéis e esqueleto | entregue | — (branch feat/ft-01-fundacao, sem remoto) |
| FT-02 | Trilha de atividade | entregue | — (branch feat/ft-02-trilha-de-atividade, sem remote) |
| FT-03 | Lançamentos da casa | entregue | — (branch feat/ft-03-lancamentos-da-casa, sem remote) |
| FT-04 | Saldo e resumo do mês | entregue | — (branch feat/ft-04-saldo-e-resumo-do-mes, sem remote) |
| FT-05 | Filhos da família | entregue | — (branch feat/ft-05-filhos-da-familia, sem remote) |
| FT-06 | Mesada dos filhos | em_andamento | — |
| FT-07 | Privacidade dos dados da família | pendente | — |
| FT-08 | Backup, restauração e saúde | pendente | — |

---

### FT-01 — Fundação: acesso, papéis e esqueleto

**Slug:** `fundacao` → `docs/fundacao/`
**Entrega:** o responsável entra com e-mail e senha, chega ao painel da família, cadastra outro usuário, edita o próprio perfil e troca a senha; a interface está em português, com tema claro e escuro e usável no celular.
**Depende de:** []
**Paralelizável:** false
**Origem:** template
**Premissas que realiza:** [PR-03, PR-04, PR-05, PR-07, PR-12, PR-15, PR-16, PR-17, PR-18, PR-19, PR-20, PR-21, PR-22, PR-23, PR-24]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**PR:** — (branch `feat/ft-01-fundacao`, sem remoto; descrição pronta em `docs/fundacao/PR.md`)
**Sprints:** 4
**Testes:** 112 novos (173 na suíte)

---

### FT-02 — Trilha de atividade

**Slug:** `trilha-de-atividade` → `docs/trilha-de-atividade/`
**Entrega:** o responsável abre a tela Atividade e vê quem fez cada ação auditada (por ora, mudança de papel e criação/desativação de usuário), com data e hora; o serviço de registro fica pronto para as features seguintes.
**Depende de:** [FT-01]
**Paralelizável:** false
**Origem:** premissa
**Premissas que realiza:** [PR-10]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**PR:** — (branch `feat/ft-02-trilha-de-atividade`, sem remote; empilhada sobre `feat/ft-01-fundacao`; descrição pronta em `docs/trilha-de-atividade/PR.md`)
**Sprints:** 3
**Testes:** 77 novos (250 na suíte)

---

### FT-03 — Lançamentos da casa

**Slug:** `lancamentos-da-casa` → `docs/lancamentos-da-casa/`
**Entrega:** o responsável ou adulto registra receitas e despesas da casa com valor, data, categoria e descrição, cria categorias novas, edita e apaga lançamento; cada alteração entra na trilha de atividade.
**Depende de:** [FT-01, FT-02]
**Paralelizável:** false
**Origem:** descricao
**Premissas que realiza:** [PR-02]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**PR:** — (branch `feat/ft-03-lancamentos-da-casa`, sem remote; empilhada sobre `feat/ft-02-trilha-de-atividade`; descrição pronta em `docs/lancamentos-da-casa/PR.md`)
**Sprints:** 3
**Testes:** 338 novos (588 na suíte)

---

### FT-04 — Saldo e resumo do mês

**Slug:** `saldo-e-resumo-do-mes` → `docs/saldo-e-resumo-do-mes/`
**Entrega:** ao entrar, o responsável ou adulto vê no painel o total de receitas, o total de despesas, o saldo do mês escolhido e as despesas somadas por categoria.
**Depende de:** [FT-03]
**Paralelizável:** false
**Origem:** descricao
**Premissas que realiza:** [PR-08]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**PR:** — (branch `feat/ft-04-saldo-e-resumo-do-mes`, sem remote; empilhada sobre `feat/ft-03-lancamentos-da-casa`; descrição pronta em `docs/saldo-e-resumo-do-mes/PR.md`)
**Sprints:** 3
**Testes:** 108 novos (696 na suíte)

---

### FT-05 — Filhos da família

**Slug:** `filhos-da-familia` → `docs/filhos-da-familia/`
**Entrega:** o responsável cadastra um filho (nome, valor e periodicidade de mesada combinados, informativos) e, se quiser, cria o login dele com o papel `filho`, que ao entrar vê só a própria página de mesada.
**Depende de:** [FT-01, FT-02]
**Paralelizável:** false
**Origem:** descricao
**Premissas que realiza:** [PR-06]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**PR:** — (branch `feat/ft-05-filhos-da-familia`, sem remote; empilhada sobre `feat/ft-04-saldo-e-resumo-do-mes`; descrição pronta em `docs/filhos-da-familia/PR.md`)
**Sprints:** 3
**Testes:** 264 novos (960 na suíte)

---

### FT-06 — Mesada dos filhos

**Slug:** `mesada-dos-filhos` → `docs/mesada-dos-filhos/`
**Entrega:** o responsável registra créditos de mesada e gastos de cada filho, e o filho consulta o próprio extrato e saldo, sem ver nem alterar os do irmão.
**Depende de:** [FT-05]
**Paralelizável:** false
**Origem:** descricao
**Premissas que realiza:** [PR-01]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** em_andamento

---

### FT-07 — Privacidade dos dados da família

**Slug:** `privacidade-dos-dados` → `docs/privacidade-dos-dados/`
**Entrega:** o responsável baixa um arquivo com todos os dados da família (usuários, lançamentos, filhos e mesadas) e consegue apagar de fato a conta de um filho com o histórico dele.
**Depende de:** [FT-03, FT-06]
**Paralelizável:** false
**Origem:** premissa
**Premissas que realiza:** [PR-09]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** pendente

---

### FT-08 — Backup, restauração e saúde

**Slug:** `backup-e-saude` → `docs/backup-e-saude/`
**Entrega:** quem opera o sistema gera um backup do banco e o restaura com um comando, e consulta `/api/saude` para saber se o sistema e o banco respondem; o log é estruturado e descartado após 90 dias.
**Depende de:** [FT-01]
**Paralelizável:** false
**Origem:** premissa
**Premissas que realiza:** [PR-11, PR-13, PR-14]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** pendente

---

<!--
PR-01 (modo e leitura de "mesa" como mesada) é decisão de interpretação, não
proteção: é associada à FT-06, que é onde a leitura se materializa.
A ordem FT-07 e FT-08 depois do escopo mínimo é deliberada. FT-08 não depende
de domínio e poderia ser paralela à FT-07, mas fica sequencial por
conservadorismo (nada de conflito de merge no modo autônomo).
-->
