# Auditoria — lancamentos-da-casa

Data: 2026-10-28 — rodada 1. Auditora: a mesma sessão, sem o agente `auditor-plano` neste harness; a regra "só aponta, nunca corrige" depende de disciplina.

## Achados desta rodada

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-01/tasks.md | O nome da migration está como `NNNN_lancamentos`; o Prisma gera o prefixo de data. | Registrar o nome real na entrega |
| MÉDIA | sprint-03/tasks.md | A T-03.02 altera `src/app/acoes.ts` e a T-03.01 altera `Navegacao.tsx` e `sessao-servidor.ts`, o que desloca linhas citadas no `CONVENCOES.md`. | A T-03.03 reconfere e reescreve as citações; `tests/convencoes.test.ts` as valida |
| MÉDIA | sprint-02/tasks.md | A listagem por mês depende do relógio; sem relógio injetável o teste da virada de mês seria frágil. | A T-02.04 injeta o relógio por parâmetro (padrão do projeto, `src/lib/limite-de-tentativas.ts:19`) |
| BAIXA | sprint-03/tasks.md | A T-03.02 é a maior task (três páginas, quatro ações, dois componentes). | Aceitável: um só caminho de código e um teste por página; a ordem interna é ações, campos, páginas |
| BAIXA | sprint-03/tasks.md | `tests/rotas.test.ts` depende do build. | Registrado no ORQUESTRADOR (seção 4) |

Conferências feitas sem achado: todos os `depende_de` apontam para ids existentes e não há ciclo; nenhuma task depende de decisão humana (as duas pendências `decisao_humana` são não bloqueantes e têm opção reversível); toda task tem os dois testes não vazios e discriminantes (valor com ponto ou notação científica, Float no esquema, categoria de outro tipo, papel desconhecido, registro que falha desfaz a ação, valor fora da trilha, virada de mês); o escopo não invade FT-04 (nenhum total), FT-05 e FT-06 (nenhuma entidade de filho); PR-02 tem teste que proíbe `Float` no esquema e ponto flutuante no leitor; a tela cobre vazio, carregando (herdado) e erro (herdado); os `arquivos` das 9 tasks cobrem os pontos de contato (inclui `tests/ajuda.ts` para `limparBanco`).

Nenhum achado de severidade ALTA: nenhuma volta à F3 (0 de 2 usadas).

VEREDITO: SIM — o plano está pronto para execução autônoma.
