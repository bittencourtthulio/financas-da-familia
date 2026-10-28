---
expx_schema: 1
expx_tool: buildx
kind: projeto
projeto_id: financas-da-familia
titulo: Financas da Familia
modo: autonomo
criado_em: 2026-10-28
atualizado_em: 2026-10-28
etapa: b4
total_features: 8
features_entregues: 1
features_bloqueadas: 0
ciclos_recursao: 0
---

# Finanças da Família — Projeto

## Descrição original

> quero um sistema para controle financeiro pessoal das financas de casa para uma familia e com controle de mesa dos filhos

Modo não escolhido pelo usuário: assumido `autonomo` (PR-01).

## O problema

A família não enxerga para onde o dinheiro da casa vai e não tem registro confiável do que cada filho recebeu de mesada, gastou e tem de saldo. Quem cuida das finanças precisa de um lugar único para lançar, consultar e prestar contas, e os filhos precisam poder ver o próprio extrato sem alterar nada.

## O que foi pedido

- Registrar as finanças da casa de uma família (receitas e despesas).
- Controlar a mesada dos filhos.
- Servir a uma família, com mais de uma pessoa usando (família, filhos).

## O que foi descoberto

| Eixo | Requisito | Premissa |
|---|---|---|
| L1, L3, L4 | Login por e-mail e senha, sessão com expiração | PR-05, PR-12 |
| L2 | Papéis `admin` (responsável), `usuario` (adulto), `filho` somente leitura da própria mesada, verificados no servidor | PR-06 |
| L5, L6, L7, L8, L9 | Validação por esquema, segredos em ambiente, cookie seguro, limite de tentativas, auditoria de dependências | PR-12 |
| L10, L11 | Dado de menor mapeado; exclusão de conta apaga de fato; exportação dos dados | PR-09 |
| L12 | Trilha de auditoria em lançamentos e movimentos de mesada (quem, o quê, quando) | PR-10 |
| L13 | Retenção declarada: lançamentos enquanto a conta existir, log 90 dias | PR-11 |
| L14, L15 | Backup do banco com restauração testada; migrations versionadas | PR-13 |
| L16 a L21 | Log estruturado, erro sem rastro de pilha, rota de saúde, config que falha no start, um comando para subir | PR-14 |
| L22 a L25 | TDD, lint, pipeline de verificação, seed de demonstração | PR-15, PR-04 |
| L26 a L30 | Design system do VS Code, dois temas, uso confortável em celular, estados vazio/carregando/erro | PR-07, PR-08, PR-16 |
| L32 a L34 | Esqueleto de aplicação (painel, usuários, perfil, senha) | PR-03, PR-17 |
| Dinheiro | Valores em centavos inteiros, moeda BRL | PR-02 |

## Considerado e descartado

| Eixo | Por que não se aplica |
|---|---|
| L19 (métrica e rastreamento) | Sistema doméstico de poucos usuários; erro visível e log consultável bastam |
| L31 Internacionalização | Família no Brasil: um idioma (pt-BR), BRL, fuso `America/Sao_Paulo` (PR-16) |
| Multi-tenant | O pedido é "uma família"; uma instalação, uma família (PR-18) |
| SSO / OAuth / provedor externo de login | Não pedido e exigiria credencial que o buildx não tem (PR-05) |
| Integração bancária automática | Não pedida; exigiria credenciais e contratos externos |
| Alta disponibilidade e réplica | Desproporcional ao porte; o backup restaurável cobre o risco real |

## Escopo mínimo

Lançar receitas e despesas da casa com categoria, ver o saldo e o resumo do mês, cadastrar os filhos e controlar a mesada de cada um com extrato e saldo. No `MAPA.md` isso vem antes de qualquer outra coisa (relatórios, metas).

## Critérios de aceite do ponto de vista do negócio

- Um responsável entra, lança uma despesa e uma receita da casa e vê o saldo do mês refletir os dois lançamentos.
- Um responsável cadastra um filho, registra um crédito de mesada e um gasto, e vê o saldo do filho correto.
- Um filho entra com a própria conta e vê só o próprio extrato de mesada, sem conseguir alterá-lo nem ver o do irmão.
- Um responsável corrige ou apaga um lançamento e a alteração fica registrada com quem fez e quando.
- Um membro adulto vê e lança as despesas da casa, mas não gerencia usuários.
- A família consegue restaurar os dados a partir de um backup.

## Fora de escopo

Regra de negócio que a descrição não traz e que o buildx não decide (cada item vira pendência `decisao_humana` no B5 se a família quiser):

- Mesada automática recorrente (geração periódica sem lançamento manual).
- Tarefas que rendem mesada, metas de poupança, juros sobre saldo, aprovação de gasto pelo responsável.
- Orçamento por categoria, relatórios comparativos, exportação para planilha.
- Importação de extrato bancário e qualquer movimentação real de dinheiro.
- Várias famílias na mesma instalação.

## Origem

**Veredito:** docs/produto/pedidos/PD-2026-0001-financas-da-familia/VEREDITO.md
**Assinado por:** buildx (modo autonomo)
**Modo:** autonomo
