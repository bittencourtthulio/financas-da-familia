---
kind: produto
schema: expx-schema-v1
produto: Financas da Familia
criado_em: 2026-10-28
atualizado_em: 2026-10-28
modelo_negocio: instalacao_por_cliente
signatario: buildx (modo autonomo)
signatario_provisorio: true
tem_perfil_legadox: false
lacunas_abertas: 5
---

# Produto — Finanças da Família

## 1. O que o produto é

Sistema web de controle financeiro doméstico para uma única família. Os
responsáveis registram receitas e despesas da casa, acompanham o saldo e o
resumo do mês, e controlam a mesada de cada filho: quanto ele recebe, quando,
o que gastou e quanto sobrou. Existe para que a família saiba para onde o
dinheiro vai e para que a mesada deixe de ser controlada de cabeça.

## 2. O que o produto deliberadamente NÃO é

- Não é um sistema para várias famílias numa mesma instalação (sem multi-tenant).
- Não se conecta a bancos nem importa extrato automaticamente (sem open banking).
- Não movimenta dinheiro de verdade: não paga conta, não faz Pix, não faz transferência.
- Não é ferramenta de investimento, imposto de renda ou contabilidade empresarial.

## 3. Cliente que paga e usuário que usa

| | Quem | Observação |
|---|---|---|
| Paga | a própria família (os responsáveis) | |
| Usa | responsáveis no dia a dia; filhos, só para consultar a própria mesada | quem lança é adulto; criança não altera dinheiro |

## 4. Perfis de usuário

| Perfil | O que faz no sistema |
|--------|---------------------|
| Responsável (`admin`) | gerencia usuários, lança receitas/despesas, define e paga mesadas |
| Membro adulto (`usuario`) | lança e consulta receitas/despesas da casa |
| Filho (`filho`) | consulta o próprio saldo e extrato de mesada, somente leitura |

## 5. Modelo de negócio

`instalacao_por_cliente`: uma instalação, uma família. Decisão sobre o que o
sistema faz é da família; o buildx só decide como ele se protege.

## 6. Objetivos de negócio vigentes

| Objetivo | Horizonte |
|----------|-----------|
| Saber receita, despesa e saldo do mês da casa | primeira entrega |
| Controlar a mesada de cada filho com extrato claro | primeira entrega |

## 7. Restrições que não se negociam

| Restrição | Natureza | Origem |
|-----------|----------|--------|
| Dados de crianças exigem consentimento específico de um dos pais | regulatoria | LGPD, art. 14 |
| Valores monetários sem erro de arredondamento | tecnica | integridade financeira |

## 8. Quem decide

**Signatário:** buildx (modo autonomo)
**Provisório:** sim

Falta confirmar com a família quem assina os vereditos de produto daqui em diante.

## 9. Zonas de risco

sem PERFIL.md do legadox

| Zona | Por que é risco |
|------|-----------------|
| Dinheiro e saldo | erro de cálculo desfaz a confiança da família no sistema |
| Dado de menor | obrigação legal específica |

## 10. Mapa de funcionalidades existentes

Projeto novo: nenhuma funcionalidade existente.
