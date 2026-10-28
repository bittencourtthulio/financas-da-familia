# Onde gastar atencao — login-do-filho-em-sincronia

Branch: `feat/ft-09-login-do-filho-em-sincronia` -> `feat/ft-08-backup-e-saude` (empilhada; nada mergeado)
Data: 2026-10-28

A classificacao e derivada de evidencia registrada, nunca de sensacao. (Feita pela mesma sessao que implementou, sem o agente `revisor-diff` neste harness; na duvida, sobe para a faixa mais rigorosa.)

## OLHO OBRIGATORIO — ler linha a linha

| Arquivo | Mudanca | Por que |
|---|---|---|
| `src/servicos/filhos.ts` (`editarFilho`) | M | grava no usuario de login dentro da transacao: confira que o `where` e o id do usuario ligado a ESTE filho (nao por nome), que so `nome` e escrito (nunca e-mail, papel, senha) e que o `tx` e o cliente usado |
| `tests/privacidade-banco.test.ts` e `tests/privacidade-exclusao.test.ts` | M | dois testes de privacidade foram **alterados** para o comportamento novo (o login agora tem o nome novo; `campos` passa a ter `login`); confira que a garantia de "nada sobra depois de apagar" nao foi enfraquecida (as varreduras finais continuam iguais) |

## LEITURA RAPIDA — conferir a intencao

| Arquivo | Por que |
|---|---|
| `src/lib/atividade.ts` | uma linha: rotulo "nome do login" |
| `docs/projeto/PREMISSAS.md` | PR-39 nova, provisoria |
| `docs/stack/CONVENCOES.md`, `tests/convencoes.test.ts` | citacoes deslocadas em 12 linhas e texto novo em "Dados do dominio" e "Auditoria" |
| `tests/premissas.test.ts` | testes de total (38/8 features) trocados por testes de 39/9 e por "ate a PR-38" |

## DISPENSAVEL — a maquina ja provou

Documentos do processo (`docs/login-do-filho-em-sincronia/`, `docs/projeto/MAPA.md`, `docs/projeto/PROJETO.md`) e os testes novos `tests/filhos-sincronia.test.ts` e `tests/filhos-sincronia-trilha.test.ts`.

## O que nenhum teste prova

- Que a familia aceita o login sempre igual ao cadastro (PR-39 e provisoria).
- Navegador real: nenhuma tela mudou; so o texto "nome do login" na Atividade.
- Uma edicao concorrente de dois responsaveis no mesmo filho: o ultimo vence, como antes.
