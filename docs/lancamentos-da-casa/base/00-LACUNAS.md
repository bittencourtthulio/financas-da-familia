# Lacunas da base — lancamentos-da-casa

Uma linha por lacuna: o que se procurou, onde, e o que isso implica para a F2.

- Guarda de papel "admin ou usuario" — procurado em `src/servicos` e `src/app/sessao-servidor.ts` (busca por `exigirAdmin`, `papel`): NÃO ENCONTRADO além de `exigirAdmin`. Implica: F2 define a guarda nova por lista de permitidos, com teste para papel desconhecido.
- Leitor de valor em formato brasileiro — procurado em `src/lib` (busca por `parse`, `centavos`, `replace(`): NÃO ENCONTRADO. Implica: F2 define a gramática aceita e o limite; PR-02 proíbe ponto flutuante.
- Representação de data civil (dia sem hora) — procurado em `src/lib/formato.ts`, `prisma/schema.prisma`: NÃO ENCONTRADO. Implica: F2 decide a coluna e o fuso (PR-16).
- Regra de negócio do conjunto oficial de categorias, categorias obrigatórias, recorrência, contas e anexos — procurado em `docs/projeto/PROJETO.md`, `PREMISSAS.md`, `docs/produto/`: NÃO DOCUMENTADO. Implica: não inventar; categorias de exemplo só como dado de seed (PR-04); a F2 registra pendência `decisao_humana` se algo for inevitável.
- Seletor reutilizável, input de data e filtro de listagem na interface — procurado em `src/componentes`: NÃO ENCONTRADO. Implica: F3 prevê as tasks de componente e de estilo.
- Política de exclusão de dado de negócio — procurado em `docs/projeto` (PR-09, PR-10, PR-11): PR-10 pede registrar "quem apagou"; PR-11 diz guardar lançamentos enquanto a conta existir; nada diz se apagar é definitivo. Implica: decisão da F2 (premissa nova).
