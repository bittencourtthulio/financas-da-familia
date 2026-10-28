# Pacote de QA — backup-e-saude

Para quem opera o sistema e vai testar sem programar. Tudo com dados **fictícios** da seed de demonstração. Não use o banco real da família. Tempo estimado: 25 minutos.

## O que mudou, em linguagem de produto

1. Dá para gerar uma cópia de segurança do banco com um comando e restaurá-la com outro.
2. Existe um endereço, `/api/saude`, que diz se o sistema e o banco estão respondendo.
3. O sistema agora escreve um registro técnico do que acontece (log) sem nunca anotar senha, e-mail ou valores em dinheiro, e apaga os registros com mais de 90 dias.
4. Quando dá um erro inesperado, a pessoa vê uma frase simples e um **código**; o código ajuda a achar o registro técnico.
5. Se a configuração do sistema estiver errada, ele **não sobe** e diz o que falta.

## Ambiente

- Terminal aberto na pasta do projeto, com Node 22.
- Banco de demonstração novo: `export DATABASE_URL="file:./qa.db"` e `export JWT_SECRET="qualquer-texto-longo-de-teste"`, depois `npm run setup`.
- Subir o sistema: `npm run build` e `npm start` (porta 3000). Contas: `responsavel@exemplo.local` / `demo1234`.

## Roteiro

### A. Saúde

1. Com o sistema no ar, abra `http://localhost:3000/api/saude` no navegador **sem entrar** no sistema. **Esperado:** aparece só `{"status":"ok","banco":"ok"}`.
2. Confira que não há nome, e-mail, caminho de pasta nem número de versão na resposta.
3. Pare o sistema, apague (ou renomeie) o arquivo `qa.db`, suba de novo e abra o endereço. **Esperado:** código 503 e `{"status":"indisponivel","banco":"falha"}`, sem nenhum caminho. (Devolva o arquivo depois.)

### B. Backup e restauração

1. Entre como responsável, abra **Lançamentos**, anote quantos lançamentos existem e o saldo do mês no painel.
2. Em outro terminal: `npm run backup`. **Esperado:** mensagem "Backup gerado" com um caminho em `backups/` e o aviso de guardar o arquivo com cuidado. O arquivo tem nome com a data e hora.
3. Rode `npm run backup` de novo. **Esperado:** um segundo arquivo, o primeiro não some.
4. No sistema, apague um lançamento e crie outro (qualquer valor). O saldo muda.
5. **Pare o sistema.** Rode `npm run restaurar -- backups/<o primeiro arquivo>`. **Esperado:** "Banco restaurado" e a indicação de um arquivo `antes-da-restauracao-...` em `backups/`.
6. Suba o sistema e entre de novo. **Esperado:** os lançamentos e o saldo do passo 1; o lançamento criado no passo 4 não existe.
7. Teste o arquivo errado: `npm run restaurar -- README.md`. **Esperado:** mensagem em português dizendo que não é um banco SQLite, e nada mudou nos dados.
8. Teste sem arquivo: `npm run restaurar`. **Esperado:** mensagem explicando como usar.
9. Para voltar atrás, restaure o arquivo `antes-da-restauracao-...` (com o sistema parado). **Esperado:** volta o estado do passo 4.

### C. Cuidado com o arquivo de backup

1. Rode `git status`. **Esperado:** a pasta `backups/` não aparece (está fora do git).
2. `ls -la backups`. **Esperado:** pasta e arquivos só do dono (`drwx------` e `-rw-------`).

### D. Log

1. Depois de usar o sistema, abra `logs/app-<data de hoje>.log`. **Esperado:** uma linha por evento, cada uma um JSON com `nivel`, `instante`, `evento` e `contexto`.
2. Procure nele o e-mail `responsavel@exemplo.local`, a senha `demo1234` e valores em dinheiro. **Esperado:** nenhum aparece.
3. Crie um arquivo falso `logs/app-2020-01-01.log` e rode `npm run log:limpar`. **Esperado:** "1 arquivo(s) de log com mais de 90 dias descartado(s)" e o arquivo falso some; o de hoje fica.

### E. Configuração que falha no start

1. Pare o sistema. Rode `JWT_SECRET= npm start`. **Esperado:** o terminal mostra "Configuração inválida, o sistema não vai subir" falando de `JWT_SECRET`, sem mostrar nenhum valor, e o processo **termina** (o endereço não abre).

## O que observar de colateral

- Login, lançamentos, mesada e a tela Privacidade continuam funcionando como antes.
- A tela de erro e as mensagens de erro de formulário continuam em português.
- Nada de pasta `logs/` ou `backups/` na lista de arquivos do git.

## Critério objetivo de aprovação

Aprovado se: A1 mostra exatamente status e banco; A3 dá 503; B6 devolve os dados do passo 1; B7 recusa sem mexer nos dados; C1 e C2 conferem; D2 não encontra nada sensível; D3 descarta só o arquivo antigo; E1 não sobe. Qualquer falha reprova.

## Não exercitado

Nenhuma tela nova: não houve teste em navegador real além de abrir o endereço de saúde. Agendamento, nuvem, criptografia e restauração pela interface não existem nesta entrega.
