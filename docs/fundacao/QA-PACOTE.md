# Pacote de QA — Fundação do Finanças da Família: entrar, painel, usuários, perfil, senha, tema e celular

## 1. O que mudou

O sistema agora se apresenta como "Finanças da Família", em português, com um painel da família. Quem entra como responsável enxerga a área de usuários e pode cadastrar outro adulto; o adulto entra, mas não vê essa área. O menu ganhou um botão "Menu" no celular, as telas de carregando, erro e página inexistente falam português, o sistema bloqueia por 15 minutos quem erra a senha cinco vezes e mantém a sessão viva enquanto a janela está aberta.

## 2. Roteiro de teste

### Caso 1 — Entrar como responsável

**O que fazer:**
1. Abra o endereço do sistema no navegador.
2. Na tela de entrada, confira que aparece o nome "Finanças da Família" acima do título "Entrar".
3. Preencha o e-mail `responsavel@exemplo.local` e a senha `demo1234` (conta fictícia de demonstração) e clique em "Entrar".

**O que deve acontecer:**
Você chega ao painel. O título é "Painel da família", o subtítulo diz "Bem-vindo, Responsável de demonstração. Aqui você acompanha as finanças da casa." e abaixo aparece o aviso "Ainda não há movimentações para mostrar. Receitas, despesas e a mesada dos filhos aparecem aqui conforme forem registradas." Na barra azul de baixo aparecem seu nome e a palavra "Responsável".

**O que indicaria falha:**
Texto em inglês, a palavra "Administrador", a frase "Esta é a tela inicial do sistema", ou voltar para a tela de entrada.

### Caso 2 — Cadastrar um adulto

**O que fazer:**
1. Logado como responsável, clique em "Usuários" no menu da esquerda, abaixo de "Configurações".
2. Na lista, confira que o papel das duas contas aparece como "Responsável" e "Adulto".
3. Em "Novo usuário", preencha nome "Adulto de Teste", e-mail `adulto.teste@exemplo.local`, senha provisória `senha-provisoria-1` e escolha o papel "Adulto". Clique em "Criar usuário".

**O que deve acontecer:**
Aparece a mensagem "Usuário criado." e a nova pessoa surge na lista com a situação "Ativo". O campo "Papel" oferece apenas "Adulto" e "Responsável".

**O que indicaria falha:**
Mensagem de erro técnica, a palavra "Administrador", a pessoa não aparecer na lista, ou a tela sair do ar.

### Caso 3 — Entrar como o adulto e não ver a área de usuários

**O que fazer:**
1. Clique em "Sair" na barra azul de baixo.
2. Entre com `adulto.teste@exemplo.local` e a senha `senha-provisoria-1`.
3. Olhe o menu da esquerda.
4. Tente abrir diretamente o endereço da área de usuários, acrescentando `/configuracoes/usuarios` ao endereço do sistema.

**O que deve acontecer:**
O menu mostra só "Painel" e "Meu perfil" (não há "Usuários"). Na barra azul aparece "Adulto". Ao digitar o endereço da área de usuários, você volta ao painel depois de um instante, sem ver a lista de usuários nem o formulário "Novo usuário".

**O que indicaria falha:**
Ver o item "Usuários", ver a lista ou o formulário de novo usuário, mesmo que por um instante.

### Caso 4 — Editar o próprio perfil

**O que fazer:**
1. Logado como o adulto, clique em "Meu perfil".
2. Troque o nome para "Adulto de Teste Editado" e clique em "Salvar".
3. Volte ao painel.

**O que deve acontecer:**
Aparece "Perfil atualizado." e o novo nome aparece na barra azul e no cumprimento do painel.

**O que indicaria falha:**
Nome antigo permanecendo, ou o papel mudar.

### Caso 5 — Trocar a senha

**O que fazer:**
1. Em "Meu perfil", clique em "Trocar minha senha".
2. Informe a senha atual `senha-provisoria-1`, uma nova senha de ao menos 8 caracteres (por exemplo `nova-senha-2026`) e a confirmação igual. Salve.
3. Clique em "Sair" e tente entrar com a senha antiga. Depois entre com a nova.

**O que deve acontecer:**
A troca confirma "Senha alterada. As outras sessões foram encerradas." A senha antiga é recusada com "E-mail ou senha incorretos." e a nova entra normalmente. Se tentar uma nova senha com menos de 8 caracteres, a mensagem avisa que precisa de ao menos 8.

**O que indicaria falha:**
A senha antiga continuar funcionando, ou a nova não entrar.

### Caso 6 — Tema claro e escuro

**O que fazer:**
1. Em qualquer tela, clique no botão "Claro" (ou "Escuro") na barra azul de baixo.
2. Percorra o painel, "Meu perfil" e (como responsável) "Usuários" nos dois temas.
3. Recarregue a página.

**O que deve acontecer:**
O fundo e as cores trocam por completo entre o escuro (fundo cinza-grafite) e o claro (fundo branco), com texto legível em todas as telas; a barra de ícones à esquerda continua escura nos dois. Depois de recarregar, o tema escolhido permanece.

**O que indicaria falha:**
Texto ilegível, parte da tela que não troca de cor, ou o tema voltar ao anterior depois de recarregar.

### Caso 7 — Celular: menu em gaveta

**O que fazer:**
1. Estreite a janela do navegador até ficar menor que 768 pixels de largura (ou use o modo celular do navegador).
2. Confira que o menu da esquerda sumiu e que a barra azul de baixo tem um botão "Menu".
3. Toque em "Menu". Depois toque em "Meu perfil".
4. Toque em "Menu" de novo e, em seguida, em "Menu" mais uma vez.
5. Na área de usuários (como responsável), role a tabela para o lado.

**O que deve acontecer:**
O botão "Menu" só existe nessa largura. Ao tocar, a lista de opções aparece no lugar do conteúdo; ao escolher "Meu perfil", a gaveta fecha sozinha e o perfil aparece. Tocar duas vezes em "Menu" abre e fecha. A tabela de usuários rola para o lado sem a página inteira ficar torta, e os botões e links têm tamanho confortável para o dedo.

**O que indicaria falha:**
Botão "Menu" visível em tela larga, menu sem como abrir no celular, gaveta que continua aberta depois de navegar, ou página inteira rolando para o lado.

### Caso 8 — Página que não existe

**O que fazer:**
1. Acrescente ao endereço do sistema um caminho inventado, por exemplo `/pagina-que-nao-existe`.

**O que deve acontecer:**
Aparece "Página não encontrada", uma frase em português e o link "Voltar ao painel", que leva ao painel.

**O que indicaria falha:**
Mensagem em inglês ("This page could not be found").

### Caso 9 — Cinco senhas erradas

**O que fazer:**
1. Saia do sistema. Na tela de entrada, informe o e-mail `responsavel@exemplo.local` e uma senha errada, cinco vezes seguidas.
2. Na sexta tentativa, informe a senha correta `demo1234`.
3. Tente entrar com outro e-mail cadastrado, com a senha correta.

**O que deve acontecer:**
As cinco primeiras tentativas mostram "E-mail ou senha incorretos." A sexta, mesmo com a senha certa, mostra "Muitas tentativas. Aguarde alguns minutos e tente de novo." O outro e-mail entra normalmente. Depois de 15 minutos (ou de reiniciar o sistema), o primeiro e-mail volta a entrar.

**O que indicaria falha:**
A sexta tentativa com a senha correta entrar, ou o bloqueio atingir também o outro e-mail.

### Caso 10 — A sessão continua viva com a janela aberta

**O que fazer:**
1. Entre com qualquer conta e deixe a janela aberta, sem recarregar, por 20 minutos.
2. Depois desse tempo, clique em "Meu perfil".

**O que deve acontecer:**
O perfil abre normalmente; você não foi mandado para a tela de entrada.

**O que indicaria falha:**
Ser mandado para a tela de entrada com a janela aberta e em uso. (Fechar a janela e voltar depois de mais de 15 minutos pede uma nova entrada, e isso é esperado.)

### Caso 11 — Sair

**O que fazer:**
1. Clique em "Sair" na barra azul.
2. Use o botão "Voltar" do navegador.

**O que deve acontecer:**
Você vai para a tela de entrada, e voltar não mostra o painel sem pedir a senha.

**O que indicaria falha:**
Ver o painel depois de sair.

### Caso 12 — O que ainda não existe

**O que fazer:**
1. Procure no menu qualquer item de lançamentos, filhos ou mesada.

**O que deve acontecer:**
Eles não existem ainda e isso está certo; chegam nas próximas entregas. O painel diz isso no aviso de "Ainda não há movimentações".

**O que indicaria falha:**
Qualquer um desses itens aparecer quebrado.

## 3. O que observar de colateral

- Depois de usar o "Menu" no celular, volte à largura normal e confira que o menu da esquerda reaparece e a barra azul não ficou com o botão "Menu".
- Depois dos cinco erros de senha, confira que a tela de entrada continua mostrando as mensagens em português, e que um adulto já logado em outra janela segue usando o sistema.
- Em "Meu perfil", depois de trocar a senha, confira que outra janela aberta com a mesma conta é mandada para a entrada na próxima ação.
- Nas duas listas de papéis (lista de usuários e campo "Papel"), confira que só aparecem "Responsável" e "Adulto"; o papel "filho" ainda não existe.
- A lista de colaterais é derivada dos arquivos alterados e pode estar incompleta.

## 4. Dado de teste sugerido

Tudo fictício. Contas de demonstração criadas na preparação do ambiente:

- Um responsável: e-mail `responsavel@exemplo.local`, senha `demo1234`.
- Um adulto: e-mail `adulto@exemplo.local`, senha `demo1234`.
- Um adulto novo, criado por você no caso 2, com e-mail `adulto.teste@exemplo.local` e uma senha provisória de pelo menos 8 caracteres.
- Para o caso de senha curta: uma senha com 5 caracteres, por exemplo `abc12`.

## 5. Ambiente e estado inicial

**Onde testar:** no computador de quem preparou o sistema, no endereço local (normalmente `http://localhost:3000`). Quem prepara o ambiente roda os passos "Como rodar" do arquivo de apresentação do projeto, que criam o banco com as duas contas de demonstração e sobem o sistema. Nenhuma chave de segurança fica neste documento: ela é gerada por quem prepara o ambiente.

**O que precisa existir antes:** o banco preparado com as duas contas de demonstração; nenhum outro cadastro.

**O que precisa estar ligado:** apenas o próprio sistema. Não há serviço externo, integração nem tarefa agendada.

## 6. Critério de aprovação

**APROVADO quando:** os casos 1 a 11 passam como descritos, nenhum texto aparece em inglês, nenhuma tela mostra a palavra "Administrador", o adulto nunca vê a área de usuários, e o caso 12 confirma que lançamentos, filhos e mesada ainda não existem.

**REPROVADO quando:** qualquer caso de 1 a 11 falha, alguma mensagem técnica ou em inglês aparece, o adulto vê dados de administração, ou alguma tela vizinha da lista de colaterais mudou de comportamento.

## 7. O que NÃO faz parte desta entrega

- Lançamentos de receitas e despesas, saldo e resumo do mês, cadastro de filhos, mesada e o login do filho: chegam nas próximas entregas.
- Trilha de atividade (quem fez o quê), exportação e exclusão de dados, backup e rota de saúde do sistema.
- Recuperação de senha esquecida por e-mail: o sistema não envia e-mail.
- Mais de uma família na mesma instalação.
- O pull request ainda não foi aberto porque o projeto não tem repositório remoto, e a descrição para abri-lo está pronta.
