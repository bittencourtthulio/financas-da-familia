# Lacunas da base — trilha-de-atividade

Uma linha por lacuna: o que se procurou, onde, e o que isso implica para a F2.

- Uso de `prisma.$transaction` com o adaptador `better-sqlite3` — procurado em `src/` e `tests/` (busca por `$transaction`): NÃO ENCONTRADO. Implica: a F2 decide registrar na mesma gravação; a primeira task de serviço prova por teste que a transação interativa funciona e reverte.
- Catálogo de ações auditadas e vocabulário de exibição — procurado em `src/lib` e `src/servicos` (busca por `auditoria`, `atividade`, `acao`): NÃO ENCONTRADO. Implica: decisão da F2 sobre o formato do código da ação e onde mora o catálogo.
- Paginação em telas — procurado em `src/app` (busca por `searchParams`, `pagina`): NÃO ENCONTRADO. Implica: decisão da F2 sobre tamanho de página e parâmetro de consulta.
- Regra de o que pode entrar no `detalhe` do registro — procurado em `docs/projeto/PREMISSAS.md` (PR-10, PR-11, PR-09) e `docs/stack/CONVENCOES.md`: PR-10 diz "nada além"; a lista de campos proibidos não existe. Implica: decisão da F2 (premissa nova, pois protege dado de menor).
- Coluna de fuso/hora para data e hora do registro — resolvido: `formatarDataEHora` já existe (`src/lib/formato.ts`).
