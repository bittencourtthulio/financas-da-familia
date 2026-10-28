# Onde gastar atencao — privacidade-dos-dados

Branch: `feat/ft-07-privacidade-dos-dados` -> `feat/ft-06-mesada-dos-filhos` (empilhada sobre `feat/ft-05-filhos-da-familia`, `feat/ft-04-saldo-e-resumo-do-mes`, `feat/ft-03-lancamentos-da-casa`, `feat/ft-02-trilha-de-atividade` e `feat/ft-01-fundacao`; nada foi mergeado em `main`)
Data: 2026-10-28

**48 arquivos — 5 olho obrigatorio, 11 leitura rapida, 32 dispensavel**

A classificacao e derivada de evidencia registrada, nunca de sensacao. Tamanho de diff nao e criterio. (Classificacao feita pela mesma sessao que implementou, sem o agente `revisor-diff` neste harness; a regra "sobe para a mais rigorosa na duvida" foi aplicada.)

## OLHO OBRIGATORIO — ler linha a linha

| Arquivo | Mudanca | Tamanho | Por que |
|---|---|---|---|
| `src/app/(sistema)/privacidade/page.tsx` | M/A | +20/-0 | autorizacao: pagina de privacidade, guarda de pagina do responsavel |
| `src/app/acoes.ts` | M/A | +20/-0 | autorizacao: acao de exclusao com a guarda do responsavel fora do try |
| `src/app/api/privacidade/exportar/route.ts` | M/A | +38/-0 | autorizacao: rota que entrega todos os dados da familia; so POST, 401/403 |
| `src/servicos/autenticacao.ts` | M/A | +8/-0 | autenticacao: funcao nova que mexe no estado do limite de tentativas de login |
| `src/servicos/privacidade.ts` | M/A | +269/-0 | dado de menor: exclusao em transacao, anonimizacao da trilha e exportacao sem segredo |

## LEITURA RAPIDA — conferir a intencao

| Arquivo | Mudanca | Tamanho | Por que |
|---|---|---|---|
| `README.md` | M/A | +12/-1 | convencao ou premissa nova; texto que governa as proximas features |
| `docs/projeto/PREMISSAS.md` | M/A | +29/-3 | convencao ou premissa nova; texto que governa as proximas features |
| `docs/stack/CONVENCOES.md` | M/A | +7/-5 | convencao ou premissa nova; texto que governa as proximas features |
| `src/app/(sistema)/filhos/[id]/page.tsx` | M/A | +3/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/componentes/ApagarFilho.tsx` | M/A | +59/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/componentes/BaixarDados.tsx` | M/A | +60/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/componentes/Navegacao.tsx` | M/A | +5/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/componentes/PainelDePrivacidade.tsx` | M/A | +67/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/estilos/global.css` | M/A | +17/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/lib/atividade.ts` | M/A | +2/-0 | tela, componente ou logica pura nova; coberta por teste |
| `src/lib/privacidade.ts` | M/A | +40/-0 | tela, componente ou logica pura nova; coberta por teste |

## DISPENSAVEL — a maquina ja provou

Documentos do processo (`docs/privacidade-dos-dados/`, `docs/projeto/MAPA.md`, `docs/projeto/PROJETO.md`) e testes (`tests/privacidade-*.test.ts`, e ampliacoes em `tests/atividade-dados.test.ts`, `tests/convencoes.test.ts`, `tests/premissas.test.ts`, `tests/filhos-login.test.ts`, `tests/filhos-acoes.test.ts`).

| Arquivo | Tamanho |
|---|---|
| `docs/privacidade-dos-dados/00-AUDITORIA.md` | +20/-0 |
| `docs/privacidade-dos-dados/00-BLOQUEIOS.md` | +34/-0 |
| `docs/privacidade-dos-dados/00-DECISOES.md` | +167/-0 |
| `docs/privacidade-dos-dados/ATENCAO.md` | +0/-0 |
| `docs/privacidade-dos-dados/ENTREGA.md` | +0/-0 |
| `docs/privacidade-dos-dados/FECHAMENTO.md` | +0/-0 |
| `docs/privacidade-dos-dados/ORQUESTRADOR.md` | +85/-0 |
| `docs/privacidade-dos-dados/PR.md` | +0/-0 |
| `docs/privacidade-dos-dados/QA-PACOTE.md` | +0/-0 |
| `docs/privacidade-dos-dados/base/00-INDICE.md` | +32/-0 |
| `docs/privacidade-dos-dados/base/00-LACUNAS.md` | +10/-0 |
| `docs/privacidade-dos-dados/base/01-dados-e-servico.md` | +25/-0 |
| `docs/privacidade-dos-dados/base/02-interface.md` | +24/-0 |
| `docs/privacidade-dos-dados/sprint-01/tasks.md` | +74/-0 |
| `docs/privacidade-dos-dados/sprint-02/tasks.md` | +97/-0 |
| `docs/privacidade-dos-dados/sprint-03/tasks.md` | +74/-0 |
| `docs/projeto/MAPA.md` | +7/-4 |
| `docs/projeto/PROJETO.md` | +1/-1 |
| `tests/atividade-dados.test.ts` | +3/-1 |
| `tests/convencoes.test.ts` | +69/-4 |
| `tests/filhos-acoes.test.ts` | +2/-1 |
| `tests/filhos-login.test.ts` | +1/-1 |
| `tests/premissas.test.ts` | +47/-2 |
| `tests/privacidade-acoes.test.ts` | +152/-0 |
| `tests/privacidade-banco.test.ts` | +89/-0 |
| `tests/privacidade-demonstracao.test.ts` | +81/-0 |
| `tests/privacidade-exclusao.test.ts` | +283/-0 |
| `tests/privacidade-exportacao.test.ts` | +277/-0 |
| `tests/privacidade-papeis.test.ts` | +81/-0 |
| `tests/privacidade-rota.test.ts` | +128/-0 |
| `tests/privacidade-rotas.test.ts` | +221/-0 |
| `tests/privacidade-tela.test.ts` | +175/-0 |
