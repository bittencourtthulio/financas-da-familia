Login do filho acompanha o cadastro (FT-09 do projeto `financas-da-familia`, recursao, realiza a PEND-18): ao editar o nome de um filho, o nome do usuario de login ligado a ele muda na mesma transacao. Antes, o menu, o perfil, a trilha e a exportacao continuavam mostrando o nome antigo.

**Base:** `feat/ft-08-backup-e-saude` (empilhada sobre as branches das FT-01 a FT-08; nada foi mergeado em `main`).

## O que muda para a familia

- Renomear o filho (tela Filhos) renomeia tambem o login dele. Se o filho nao tem login, nada mais muda.
- O **e-mail do login nunca muda** pela edicao do filho (e a credencial com que ele entra). Papel, situacao (ativo ou desativado) e senha tambem ficam.
- Login que ja estava com o nome torto (criado antes desta correcao) e acertado na proxima vez que o cadastro do filho for salvo, mesmo sem mudar o nome.
- Na tela Atividade, a edicao passa a dizer "Campos: nome, nome do login" quando o login foi reescrito. A trilha nunca leva o e-mail nem o nome antigo.
- Quem pode editar continua sendo so o responsavel.

## O que muda no codigo

- `src/servicos/filhos.ts` (`editarFilho`): le o usuario ligado, e dentro da transacao existente atualiza `usuario.nome` antes do filho e do rastro; se algo falha, tudo volta.
- `src/lib/atividade.ts`: rotulo "nome do login" para o campo `login`.
- Testes: `tests/filhos-sincronia.test.ts` e `tests/filhos-sincronia-trilha.test.ts` (novos); `tests/privacidade-banco.test.ts` e `tests/privacidade-exclusao.test.ts` ajustados (fixavam o login com o nome velho e `campos: nome`); citacoes de linha em `tests/convencoes.test.ts` e `docs/stack/CONVENCOES.md`.
- `docs/projeto/PREMISSAS.md` (PR-39 nova), `MAPA.md`, `PROJETO.md`. Nenhuma migration, nenhuma dependencia nova, nenhuma tela nova.

## Onde pedir olho

`src/servicos/filhos.ts` (a renomeacao e a transacao) e os dois testes de privacidade alterados. Lista completa em [ATENCAO.md](ATENCAO.md).

## Como foi testado

TDD em 3 tasks, 1 sprint. Suite: 1475 testes (31 novos). Cobre renomear com e sem login, falha no meio da transacao (nada fica pela metade), irmao e outro usuario intocados, e-mail intocado, adulto/filho/visitante negados, trilha sem nome antigo nem e-mail e exclusao do filho depois sem rastro de nome.

## Decisoes em nome da familia

PR-39 (provisoria): o login acompanha o nome do cadastro; o e-mail e fixo; o campo `login` entra na trilha sem dado pessoal.

## Pendencias

- `decisao_humana`: trocar o e-mail de login de um filho.
- `decisao_humana`: renomear o usuario do filho pela tela Usuarios (sentido contrario); hoje continua livre e a proxima edicao do filho reescreve o nome.
- `recurso_externo`: sem remoto git, o PR nao foi aberto; esta descricao esta pronta para colar.
