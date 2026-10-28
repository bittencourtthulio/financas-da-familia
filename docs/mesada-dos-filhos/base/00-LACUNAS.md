# Lacunas da base — mesada-dos-filhos

Uma linha por lacuna: o que se procurou, onde, e o que isso implica para a F2.

- Entidade de movimento de mesada, saldo do filho — procurado em `prisma/schema.prisma`, `src/servicos`: NÃO ENCONTRADO (só `Filho` com o combinado informativo). Implica: F3 prevê migration e modelo novos com chave estrangeira para o filho e serviço novo (`src/servicos/mesada.ts`, para não alterar a varredura de `filhos.ts`).
- Regra de saldo negativo, bloqueio de gasto, mesada automática, aprovação, metas, juros, tarefas, transferência entre filhos, acesso do adulto — procurado em `docs/projeto/PROJETO.md`, `PREMISSAS.md`, `docs/produto/`: NÃO DOCUMENTADO (PROJETO.md lista mesada automática, aprovação, metas, juros e tarefas como fora de escopo). Implica: não inventar; PR-32 e PR-33 com pendência `decisao_humana` não bloqueante e a opção mais simples e reversível.
- Política de exclusão do filho com histórico — procurado em `prisma/schema.prisma`, PR-09, `docs/filhos-da-familia/FECHAMENTO.md`: DECIDIDO PARA A FT-07 apenas em parte (`filhos.usuarioId` é `SET NULL`). Implica: a tabela de movimentos usa `Cascade` para o filho (PR-33) e a FT-07 exporta e apaga por filho.
- Ação de servidor que registre movimento com a guarda fora do `try` — procurado em `src/app/acoes.ts`: PADRÃO ENCONTRADO (lançamentos e filhos). Implica: reaproveitar e estender a tabela de ações sensíveis de `tests/filhos-acoes.test.ts`.
- Paginação do extrato do filho — procurado em `src/componentes`: PADRÃO ENCONTRADO (`PaginacaoDeLancamentos`, `?pagina=`), mas atrelado a mês e tipo. Implica: componente de paginação próprio do extrato.
- Estado de carregamento próprio da página do filho — procurado em `src/app/(sistema)/loading.tsx`: ENCONTRADO no grupo. Implica: nenhum arquivo novo.
