# Lacunas da base — fundacao

Uma linha por lacuna: o que se procurou, onde, e o que isso implica para a F2.

- Renovação (refresh) de sessão — procurado em `src/lib/sessao.ts`, `src/lib/sessao-servidor.ts`, `src/app/acoes.ts` e `src/` inteiro (busca por `refresh`, `renov`): NÃO ENCONTRADO. A PR-05 promete "expiração curta com refresh". Vira pergunta da F2.
- Limite de tentativas de login — procurado em `src/servicos/autenticacao.ts`, `src/app/acoes.ts` (busca por `limite`, `tentativa`, `rate`): NÃO ENCONTRADO. A PR-12 promete limite nas rotas de login. Vira pergunta da F2.
- Controle que abre a gaveta de navegação no celular — procurado em `src/` (busca por `gaveta`): só existe a regra CSS `.gaveta-aberta` em `src/estilos/global.css:182`; nenhum componente a aciona. Vira pergunta da F2.
- Estados de carregamento e erro de rota (`loading.tsx`, `error.tsx`, `not-found.tsx`) — procurados em `src/app/`: NÃO ENCONTRADOS. A PR-16 exige estados vazio, carregando e erro. Vira pergunta da F2.
- Formatação de data e valor em pt-BR e fuso `America/Sao_Paulo` — procurado em `src/` (busca por `Intl`, `toLocale`, `America/Sao_Paulo`): NÃO ENCONTRADO (nenhuma tela exibe data ou valor ainda). A PR-16 exige o formato brasileiro. Vira pergunta da F2.
- Pipeline de verificação automatizado (CI) — procurado em `.github/`, `package.json` (scripts): sem `.github/`, sem script de typecheck. A PR-15 promete pipeline. Vira pergunta da F2.
- Versões fixadas — `package.json` declara `^7.10.0` para `@prisma/adapter-better-sqlite3` e `^17.4.2` para `dotenv`; a PR-12 promete versões fixadas. Vira pergunta da F2.
- Pipeline de seed com filhos, lançamentos e mesada (PR-04) — NÃO DOCUMENTADO como realizável nesta feature: as entidades não existem. Vira pergunta da F2.
- Cabeçalho `.gitignore` do rastro (`docs/eventos/`, `.expx/estado.json`) — procurado em `.gitignore`: ausente (a F1 do sprintx manda garanti-lo).
