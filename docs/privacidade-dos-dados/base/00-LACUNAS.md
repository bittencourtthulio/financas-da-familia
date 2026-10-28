# Lacunas da base — privacidade-dos-dados

Uma linha por lacuna: o que se procurou, onde, e o que isso implica para a F2.

- Exportação, rota de download, formato do arquivo, `versao_do_formato` — procurado em `src/`, `docs/`: NÃO ENCONTRADO. Implica: PR-34 define o formato; serviço novo `src/servicos/privacidade.ts` e rota `src/app/api/privacidade/exportar/route.ts`.
- Exclusão do filho — procurado em `src/servicos/filhos.ts`, `prisma/schema.prisma`: NÃO ENCONTRADO (só `Cascade` em `movimentos_de_mesada` e `SET NULL` em `filhos.usuarioId`). Implica: PR-35 define o que apaga e o que anonimiza; a transação apaga o filho e depois o usuário de login.
- Estado de tentativas de login do filho excluído — procurado em `src/lib/limite-de-tentativas.ts`, `src/servicos/autenticacao.ts`: ENCONTRADO como memória do processo, sem função pública que esqueça uma chave. Implica: função nova `esquecerTentativasDeLogin` em `autenticacao.ts`.
- Sessão e token do filho excluído — procurado em `src/lib/sessao.ts`, `src/servicos/autenticacao.ts`: NÃO HÁ tabela de sessão; o JWT só vale se o usuário existe e está ativo (`usuarioDaSessao`). Implica: apagar o usuário já derruba o token; a prova é por teste.
- Consentimento do responsável, prazo legal de resposta, exclusão da família ou de adulto, CSV, PDF, importação — procurado em `docs/projeto/`: NÃO DOCUMENTADO (PROJETO.md lista exportação para planilha em fora de escopo). Implica: não inventar; pendência `decisao_humana` com a opção mais simples e reversível.
- Estado de carregamento próprio da página — procurado em `src/app/(sistema)/loading.tsx`: ENCONTRADO no grupo. Implica: nenhum arquivo novo; o botão de baixar tem o próprio estado de "preparando".
