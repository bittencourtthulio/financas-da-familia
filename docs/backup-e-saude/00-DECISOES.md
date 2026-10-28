---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: backup-e-saude
origem_buildx: financas-da-familia
feature_id: FT-08
respondido_por: buildx
densidade: padrao
modo_construcao: autonomo
atualizado_em: 2026-10-28
decisoes:
  - id: D-00
    decisao: densidade padrao, construcao autonomo
    alternativa_descartada: null
    motivo: "respondido pelo buildx: modo autonomo do projeto (PROJETO.md, Origem); fonte PR-01"
    status: fechada
    bloqueante: false
  - id: D-01
    decisao: Escopo - comandos de backup e restauracao, GET /api/saude, log estruturado com descarte de 90 dias, erro sem pilha, configuracao que falha no start; sem tela, sem migration
    alternativa_descartada: Agendamento, nuvem, criptografia, restauracao pela interface
    motivo: "MAPA.md FT-08; PR-11, PR-13, PR-14; o pedido nao traz esses itens e eles exigem decisao ou recurso externo"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Backup por VACUUM INTO do better-sqlite3 (copia consistente, sincrona, so o conteudo vivo), arquivo backups/backup-AAAA-MM-DD-HHMMSS.db em horario de Sao Paulo, pasta 0700 e arquivo 0600
    alternativa_descartada: Copiar o arquivo com cp (pode pegar o banco no meio de uma escrita); API db.backup assincrona (mais partes moveis, mesmo resultado)
    motivo: "PR-13; PR-37 (nova)"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Restauracao valida cabecalho SQLite, PRAGMA integrity_check, abre somente leitura e exige as seis tabelas de dado; preserva o banco atual em copia datada antes de trocar; troca por renomeacao atomica; recusa arquivo invalido sem tocar no banco atual
    alternativa_descartada: Sobrescrever direto; restaurar sem validar
    motivo: "PR-13; restaurar lixo por cima do historico da familia seria pior que nao ter comando"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: A restauracao exige o sistema parado (documentado no runbook); nao ha trava automatica
    alternativa_descartada: Detectar processo em execucao
    motivo: "SQLite nao oferece detecao portavel; o runbook manda parar o sistema; trava seria complexidade sem teste confiavel"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Log em JSON por linha com nivel (info, aviso, erro), instante ISO UTC, evento (minusculo com ponto) e contexto plano; sai no stdout e, fora do teste, no arquivo logs/app-AAAA-MM-DD.log (dia UTC), pasta configuravel por LOG_DIR
    alternativa_descartada: Biblioteca de log; log so no stdout
    motivo: "PR-14; PR-11 precisa de arquivo para ter o que descartar; sem dependencia nova"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: O log redige (troca por "[removido]") chave proibida da trilha, valor com cara de hash ou JWT e texto com e-mail; nunca derruba a chamada que logou
    alternativa_descartada: Lancar erro como a trilha faz
    motivo: "PR-14: log nao pode derrubar a requisicao; a lista de chaves e a mesma da trilha (PR-25), movida para src/lib"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: Erro inesperado grava so nome, codigo e identificador de correlacao (sem mensagem e sem pilha) e a tela mostra o identificador
    alternativa_descartada: Gravar a pilha no log
    motivo: "PR-14 e PR-11: a mensagem de erro do Prisma pode trazer e-mail ou valor; o identificador basta para achar a linha"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: Retencao por nome do arquivo (data UTC no nome), apaga o dia mais antigo que 90 dias antes de "agora"; roda no start (quando ha pasta de log) e por npm run log:limpar
    alternativa_descartada: Usar mtime do arquivo (muda ao copiar)
    motivo: "PR-11; data injetada torna o teste exato"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: GET /api/saude publica, sem sessao, responde 200 {status:'ok',banco:'ok'} ou 503 {status:'indisponivel',banco:'falha'}, Cache-Control no-store, sem versao, caminho nem pilha; o banco e testado com SELECT 1 e prazo de 3 s, com o Prisma importado sob demanda para que falha de abertura vire 503 e nao 500
    alternativa_descartada: Checar tabelas e contagens (dado do negocio); mostrar versao
    motivo: "PR-14; rota publica nao vaza nada"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: validarAmbiente() (DATABASE_URL e JWT_SECRET obrigatorios, JWT_TTL_SEGUNDOS inteiro positivo) chamada em src/instrumentation.ts quando o servidor Node sobe; junta todos os problemas numa mensagem so
    alternativa_descartada: Validar so no primeiro uso (estado atual)
    motivo: "PR-14, L20"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Scripts em scripts/ (backup, restaurar, limpar-logs), finos, sobre funcoes de src/lib testadas; DATABASE_URL lida do ambiente
    alternativa_descartada: Logica dentro do script
    motivo: "testabilidade; camadas"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: O teste de ponta a ponta usa banco temporario montado com as migrations reais (SQL em ordem) e cliente Prisma proprio, nao o banco da suite
    alternativa_descartada: Restaurar por cima do banco de teste compartilhado
    motivo: "o cliente da suite mantem o arquivo aberto; trocar o arquivo debaixo dele daria falha intermitente"
    status: fechada
    bloqueante: false
---

# Decisões — backup-e-saude

Respondidas pelo buildx em modo autônomo; ver o frontmatter. Dúvida de regra de negócio virou premissa (PR-36, PR-37, PR-38) ou pendência em `00-BLOQUEIOS.md`.
