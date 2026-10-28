# Auditoria — filhos-da-familia

Data: 2026-10-28 — rodada 1. Auditora: a mesma sessão, sem o agente `auditor-plano` neste harness; a regra "só aponta, nunca corrige" depende de disciplina.

## Achados desta rodada

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-01/tasks.md | O varredor de serviços precisa de um usuário `filho` real; `criarUsuario` de `tests/ajuda.ts` aceita qualquer papel, mas um filho real tem registro ligado. | A T-01.01 usa `criarUsuario({ papel: 'filho' })` para os serviços existentes; a T-02.01 usa o filho criado por `criarLoginDoFilho` para o isolamento |
| MÉDIA | sprint-02/tasks.md | A ação de servidor depende de `cookies()` e `redirect()` do Next; nenhum teste do projeto as executa. | A T-02.02 simula `next/headers` e trata o redirecionamento como exceção capturada no teste |
| MÉDIA | sprint-02/tasks.md | `tests/rotas.test.ts` e `tests/resumo-tela.test.ts` afirmam o painel do papel sem resumo; o link novo muda o texto. | A T-02.03 ajusta as duas afirmações no mesmo commit (já em `altera`) |
| MÉDIA | sprint-03/tasks.md | A T-01.02, T-02.02 e T-02.03 deslocam linhas citadas no `CONVENCOES.md` (`usuarios.ts`, `acoes.ts`, `page.tsx`, `rotas.test.ts`, `tests/ajuda.ts`). | A T-03.02 reconfere todas as citações; `tests/convencoes.test.ts` as valida |
| BAIXA | sprint-01/tasks.md | A T-01.02 junta migration, trilha e serviço de cadastro. | Aceitável: um só caminho de código e um teste de dados; ordem interna é esquema, migration, catálogo, serviço |
| BAIXA | sprint-02/tasks.md | O responsável não consegue reativar o login nem redefinir a senha. | Registrado como `decisao_humana` não bloqueante (PR-31); não se inventa regra |

Conferências feitas sem achado: todos os `depende_de` apontam para ids existentes e não há ciclo; nenhuma task depende de decisão humana; toda task tem os dois testes não vazios e discriminantes (filho real negado em cada serviço, 403 idêntico para id de irmão e id inexistente, e-mail duplicado, segundo login, valor em formato brasileiro e inválido, nascimento futuro, rastro sem valor nem e-mail, ação executada como filho, adulto e sem sessão, servidor real em todas as rotas); o escopo não invade a FT-06 (nenhum movimento, extrato ou saldo) nem a FT-07 (nenhum apagar ou exportar) nem o fora de escopo do PROJETO.md; PR-02 tem teste que proíbe ponto flutuante no serviço novo e no esquema; PR-09 tem teste de campos permitidos; PR-10 e PR-25 têm teste de rastro; a tela cobre vazio, carregando (herdado) e erro (herdado); os `arquivos` das 7 tasks cobrem os pontos de contato (inclui `tests/ajuda.ts`, `tests/rotas.test.ts`, `README.md`); nenhuma dependência nova.

Nenhum achado de severidade ALTA: nenhuma volta à F3 (0 de 2 usadas).

VEREDITO: SIM — o plano está pronto para execução autônoma.
