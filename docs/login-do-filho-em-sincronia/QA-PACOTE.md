# Pacote de QA — login-do-filho-em-sincronia

Para quem testa sem programar. Tudo com dados **ficticios** da seed de demonstracao; nao use o banco real da familia. Tempo estimado: 15 minutos.

## O que mudou, em linguagem de produto

1. Ao mudar o nome de um filho na tela Filhos, o nome com que ele aparece quando entra (menu, perfil) muda junto.
2. O e-mail com que o filho entra nao muda.
3. A tela Atividade mostra "nome do login" entre os campos alterados, sem mostrar nome antigo nem e-mail.

## Ambiente

- `export DATABASE_URL="file:./qa.db"` e `export JWT_SECRET="qualquer-texto-longo-de-teste"`, depois `npm run setup`, `npm run build` e `npm start` (porta 3000).
- Conta do responsavel: `responsavel@exemplo.local` / `demo1234`. Use a conta de filho da demonstracao (veja o README) ou crie um filho novo com login (e-mail `qa.filho@exemplo.local`, senha `senha-qa-12345`).

## Roteiro

1. Entre como responsavel, abra **Filhos**, crie "Ana QA" com mesada 50,00 semanal e crie o login `qa.filho@exemplo.local`.
2. Em outra janela anonima, entre como `qa.filho@exemplo.local` e confira que o menu/perfil mostra **Ana QA**. Saia.
3. Como responsavel, edite o filho e mude o nome para **Ana Clara QA** (mesmo valor e periodicidade). **Esperado:** salvo com sucesso.
4. Entre de novo como o filho. **Esperado:** o menu e o perfil mostram **Ana Clara QA**; o e-mail de entrada continua `qa.filho@exemplo.local` e a senha antiga continua valendo.
5. Como responsavel, abra **Usuarios**. **Esperado:** o usuario do filho aparece como Ana Clara QA, com o mesmo e-mail.
6. Abra **Atividade**. **Esperado:** "Alterou o cadastro do filho Ana Clara QA" com "Campos: nome, nome do login". Procure na linha o e-mail e "Ana QA": nenhum aparece.
7. Crie um segundo filho **sem login** ("Bia QA") e renomeie. **Esperado:** funciona; **Usuarios** nao ganha usuario novo.
8. Com a conta de filho (nao responsavel), tente abrir **Filhos**. **Esperado:** negado como antes.
9. Mude so a mesada da Ana Clara QA. **Esperado:** a Atividade mostra "Campos: mesada", sem "nome do login".

## O que observar de colateral

- O irmao e o login do irmao continuam com o nome que tinham.
- A exportacao de dados (Privacidade) mostra o nome novo no usuario.
- Apagar o filho (Privacidade) continua removendo o nome e o e-mail de tudo.

## Critério objetivo de aprovação

Aprovado se: o passo 4 mostra o nome novo com o e-mail e a senha antigos; o passo 6 nao mostra e-mail nem nome antigo; o passo 7 nao cria usuario; o passo 8 e negado. Qualquer falha reprova.

## Não exercitado

Nenhuma tela nova foi criada e nao houve teste em navegador real nesta entrega; a prova e por servico e por testes de rota. Trocar o e-mail do filho e renomear o filho pela tela Usuarios nao fazem parte desta entrega.
