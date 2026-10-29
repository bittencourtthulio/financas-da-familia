---
expx_schema: 1
expx_tool: buildx
kind: recursao
projeto_id: financas-da-familia
atualizado_em: 2026-10-28
ciclo_atual: 2
teto_ciclos: 3
pendencias_abertas: 19
pendencias_resolvidas: 1
---

# Finanças da Família — Recursão

Tudo que ficou pelo caminho, classificado. Fontes varridas: `MAPA.md`, os oito `00-BLOQUEIOS.md`, as premissas provisórias e os PRs que não puderam ser abertos. Nenhuma feature ficou `bloqueada`; nenhum achado alto de auditoria ficou sem correção.

## Ciclos

| Ciclo | Pendências entraram | Viraram feature | Replanejadas | Ficaram para o humano |
|---|---|---|---|---|
| 1 | 18 | 1 (FT-09) | 0 | 17 (15 decisão, 2 recurso externo) |
| 2 | 2 | 0 | 0 | 2 (decisão, achadas na FT-09) |

O ciclo 2 rodou só a FT-09 e a resolveu. Não sobrou `trabalho_novo` nem `replanejamento`: o laço fecha e segue para o B6.

---

## Aberto — o que exige decisão humana

Todas são regra de negócio que a descrição não traz. O buildx adotou a opção mais simples e segura, registrada na premissa citada.

### PEND-01 — Categorias de lançamento
**Classe:** `decisao_humana` · **Origem:** FT-03 (PR-27)
**A decisão:** a família quer um conjunto padrão de categorias, e pode renomear, ocultar ou apagar?
**As opções:** (a) manter só "criar categoria" (hoje); (b) conjunto oficial de categorias já cadastradas; (c) permitir renomear/ocultar/apagar, o que obriga decidir o destino dos lançamentos antigos.
**O que o buildx fez enquanto isso:** cria categoria apenas; categorias de exemplo só na seed.
**Reversibilidade:** baixa custo para (a)→(b); (c) mexe em dado existente.

### PEND-02 — Apagar lançamento: lixeira ou desfazer
**Classe:** `decisao_humana` · **Origem:** FT-03 (PR-28)
**A decisão:** um lançamento apagado deve poder ser recuperado?
**As opções:** exclusão definitiva (hoje) ou lixeira com prazo.
**O que o buildx fez enquanto isso:** exclusão definitiva, com confirmação em dois passos e rastro sem valor na trilha.
**Reversibilidade:** a lixeira exige coluna nova e migration; o que já foi apagado não volta.

### PEND-03 — Saldo acumulado
**Classe:** `decisao_humana` · **Origem:** FT-04 (PR-29)
**A decisão:** o saldo de um mês carrega o do mês anterior?
**As opções:** só o saldo do mês (hoje) ou saldo acumulado desde o início.
**O que o buildx fez enquanto isso:** receitas menos despesas do mês escolhido; nenhum acumulado, meta ou comparativo.
**Reversibilidade:** só cálculo e tela; sem migração de dados.

### PEND-04 — Mesada opcional e outras periodicidades
**Classe:** `decisao_humana` · **Origem:** FT-05 (PR-30)
**A decisão:** a mesada de um filho pode não existir, ou ser quinzenal, diária etc.?
**As opções:** valor e periodicidade obrigatórios, semanal ou mensal (hoje); mesada opcional; mais periodicidades.
**O que o buildx fez enquanto isso:** valor e periodicidade obrigatórios, semanal ou mensal, só informativos.
**Reversibilidade:** migration simples.

### PEND-05 — Reativar login ou redefinir senha de um filho
**Classe:** `decisao_humana` · **Origem:** FT-05 (PR-31)
**A decisão:** o responsável pode reativar o login desativado ou redefinir a senha esquecida de um filho?
**As opções:** não existe (hoje; só desativar); reativar; redefinir senha pelo responsável.
**O que o buildx fez enquanto isso:** só desativar o login. Hoje, para voltar a dar acesso, é preciso apagar e recadastrar.
**Reversibilidade:** função nova, sem migração.

### PEND-06 — Regras de gasto e de mesada
**Classe:** `decisao_humana` · **Origem:** FT-06 (PR-32)
**A decisão:** bloquear gasto acima do saldo; gerar a mesada automaticamente; aprovação ou pedido de gasto; metas; juros; tarefas que rendem mesada; transferência entre filhos.
**As opções:** nada disso (hoje) ou escolher quais entram. Cada uma é feature de regra de negócio própria.
**O que o buildx fez enquanto isso:** saldo negativo é permitido e sinalizado em texto; todo crédito e gasto é lançamento manual.
**Reversibilidade:** acrescentar regra é fácil; mudar o que já foi lançado exige decisão sobre o histórico.

### PEND-07 — Data futura e saldo por período
**Classe:** `decisao_humana` · **Origem:** FT-06 (PR-32)
**A decisão:** um movimento com data futura conta no saldo de hoje? O saldo do filho deve ser mostrado por período?
**As opções:** data futura vale e o saldo soma tudo (hoje); data futura fica "agendada" e fora do saldo; saldo por período.
**O que o buildx fez enquanto isso:** soma todos os movimentos, qualquer que seja a data.
**Reversibilidade:** só cálculo e tela.

### PEND-08 — O adulto ver ou lançar a mesada
**Classe:** `decisao_humana` · **Origem:** FT-06 (PR-33)
**A decisão:** o papel `usuario` (adulto) pode ver ou lançar a mesada dos filhos?
**As opções:** só o responsável (hoje); adulto vê; adulto vê e lança.
**O que o buildx fez enquanto isso:** só o `admin`; o adulto é negado no servidor.
**Reversibilidade:** mudança de regra de autorização, com teste.

### PEND-09 — Lixeira ao apagar movimento de mesada
**Classe:** `decisao_humana` · **Origem:** FT-06 (PR-33)
**A decisão:** um movimento de mesada apagado pode ser recuperado?
**As opções:** definitivo (hoje) ou lixeira.
**O que o buildx fez enquanto isso:** definitivo, com dois passos e rastro sem valor.
**Reversibilidade:** igual à PEND-02.

### PEND-10 — Alcance da exclusão de dados
**Classe:** `decisao_humana` · **Origem:** FT-07 (PR-35)
**A decisão:** apagar a família inteira ou um adulto? Prazo legal de resposta, termo de consentimento versionado, anonimizar em vez de excluir.
**As opções:** só a conta do filho, sem consentimento registrado (hoje); ou ampliar. Termo de consentimento de menor é decisão jurídica da família, não técnica.
**O que o buildx fez enquanto isso:** só a conta do filho é apagada de fato, com o nome digitado; as linhas da trilha viram "filho removido".
**Reversibilidade:** estender é feature nova; o que já foi apagado não volta.

### PEND-11 — Formatos da exportação
**Classe:** `decisao_humana` · **Origem:** FT-07 (PR-34)
**A decisão:** a exportação precisa de CSV ou PDF, valores formatados, importação do arquivo, recorte por filho ou período?
**As opções:** um JSON versionado em centavos (hoje) ou outros formatos.
**O que o buildx fez enquanto isso:** um único JSON com `versao_do_formato: 1`.
**Reversibilidade:** acrescentar formato não quebra o atual.

### PEND-12 — Lixeira ao apagar a conta do filho
**Classe:** `decisao_humana` · **Origem:** FT-07 (PR-35)
**A decisão:** a exclusão da conta do filho pode ser desfeita?
**As opções:** definitiva (hoje); período de arrependimento. Conflita com a promessa de "apagar de verdade".
**O que o buildx fez enquanto isso:** definitiva, com nome digitado e aviso para baixar a exportação antes.
**Reversibilidade:** a opção com prazo exige decidir quanto tempo o dado fica retido.

### PEND-13 — Agendamento e retenção do backup
**Classe:** `decisao_humana` · **Origem:** FT-08 (PR-37)
**A decisão:** com que frequência o backup roda sozinho e por quanto tempo os arquivos antigos ficam?
**As opções:** só manual (hoje); agendado pelo cron do sistema; rotação automática.
**O que o buildx fez enquanto isso:** `npm run backup` manual, sem rotação; o runbook sugere agendar por cron.
**Reversibilidade:** nenhuma migração.

### PEND-14 — Criptografia do backup
**Classe:** `decisao_humana` · **Origem:** FT-08 (PR-37)
**A decisão:** o arquivo de backup precisa ser criptografado? Quem guarda a chave?
**As opções:** em claro (hoje); criptografado com senha, que a família precisa guardar sem perder.
**O que o buildx fez enquanto isso:** arquivo em claro, permissão 0600, fora do git. Ele leva hashes de senha e todo o dinheiro da casa.
**Reversibilidade:** perder a chave perde o backup.

### PEND-15 — Restauração pela interface
**Classe:** `decisao_humana` · **Origem:** FT-08 (PR-37)
**A decisão:** a restauração pode ser feita por tela, e por quem?
**As opções:** só por comando (hoje); tela só do `admin` com confirmação. Sobrescreve o banco inteiro e exige parar o sistema.
**O que o buildx fez enquanto isso:** só por `npm run restaurar`, com cópia do banco atual guardada antes.
**Reversibilidade:** feature nova.

---

## Aberto — o que exige recurso externo

### PEND-16 — Backup remoto ou em nuvem
**Classe:** `recurso_externo` · **Origem:** FT-08
**O que falta:** uma conta de armazenamento (nuvem ou outro disco) e a credencial de acesso.
**O que destrava:** cópia do backup fora da máquina que guarda o banco.
**Estado atual:** o backup existe só no disco local, em `backups/`.

### PEND-17 — Remoto git para abrir os pull requests
**Classe:** `recurso_externo` · **Origem:** FT-01 a FT-09
**O que falta:** um repositório remoto (por exemplo no GitHub) e acesso de escrita. O usuário disse que os PRs podem ficar locais por enquanto.
**O que destrava:** `git push` das branches empilhadas e abertura de um PR por feature, com a descrição já pronta em `docs/<slug>/PR.md`.
**Estado atual:** nove branches empilhadas, sem remote, todas com a suíte verde. O CI do GitHub Actions nunca rodou.

---

### PEND-19 — Trocar o e-mail de login de um filho
**Classe:** `decisao_humana` · **Origem:** FT-09 (PR-39)
**A decisão:** a família quer poder trocar o e-mail de login de um filho?
**As opções:** não (hoje; o e-mail é credencial e a edição nunca o muda); trocar pelo responsável, o que exige decidir o que acontece com a sessão aberta.
**O que o buildx fez enquanto isso:** o e-mail do login é fixo.
**Reversibilidade:** função nova, sem migração.

### PEND-20 — Renomear o usuário de um filho pela tela Usuários
**Classe:** `decisao_humana` · **Origem:** FT-09 (PR-39)
**A decisão:** o nome do login de um filho pode ser diferente do nome do cadastro?
**As opções:** livre (hoje; a próxima edição do cadastro do filho sobrescreve o nome do login); bloquear a edição na tela Usuários para logins de filho.
**O que o buildx fez enquanto isso:** nada além da sincronização na edição do filho.
**Reversibilidade:** regra de tela, sem migração.

---

## Resolvido nos ciclos

| ID | Assunto | Classe | Ciclo | Como resolveu |
|---|---|---|---|---|
| PEND-18 | `editarFilho` não renomeia o usuário de login do filho | `trabalho_novo` | 2 | FT-09 entregue (PR-39, 31 testes novos) |
