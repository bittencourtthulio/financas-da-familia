# Identidade visual "Família"

Guia curto do visual do sistema: leve, arredondado, colorido, com a família
desenhada (pai, mãe, menino, menina e o cachorro) e movimento curto nos botões,
avisos e confirmações. Tudo o que está aqui tem evidência no código.

## Onde mora

| O quê | Arquivo |
| ----- | ------- |
| Tokens de cor, tipografia, geometria e movimento, nos dois temas | `src/estilos/tokens.css` |
| Layout, componentes, animações, landing e login | `src/estilos/global.css` |
| A família desenhada (SVG por tokens) | `src/componentes/ilustracoes/Familia.tsx` |
| A caixa de toda confirmação sem volta | `src/componentes/CaixaDeConfirmacao.tsx` |
| A apresentação pública (landing) | `src/componentes/Apresentacao.tsx`, `src/app/inicio/page.tsx` |
| A raiz do site: apresentação sem cookie, painel com cookie | `src/proxy.ts` |
| A porta de entrada | `src/app/entrar/page.tsx` |
| A guarda do visual (testes) | `tests/visual-familia.test.ts`, `tests/tema.test.ts` |

## Regras que continuam valendo

- **Nenhuma cor literal fora de `tokens.css`** (PR-07). As ilustrações usam
  `var(--ilu-*)` e `var(--cor-*)`; o teste `tema.test.ts` varre todo `.tsx`.
- **Dois temas, mesmos nomes.** `:root` é o tema noite; `[data-theme='light']`
  e a preferência do sistema redefinem todo token de cor. O tema dia é o
  principal: creme, branco e detalhes em laranja, amarelo, céu, grama, rosa e lilás.
- **A cor nunca é o único sinal.** Saldo, situação de login e avisos continuam
  ditos em palavras; o desenho e a cor só reforçam.
- **O texto do link continua logo depois do `<a>`.** Os ícones do menu vêm do
  CSS pelo atributo `data-icone`, não de um elemento dentro do link.
- **Quem prefere menos movimento recebe menos movimento**
  (`prefers-reduced-motion`): animações e transições caem para um instante.

## A família

Cinco personagens em formas simples: cabeça redonda, olhos que piscam (classe
`olho`), bochechas, corpo arredondado. O cachorro abana o rabo (classe `rabo`)
e muda de humor: feliz (língua de fora), preocupado (nas confirmações e no
erro) e perdido (na página não encontrada). `Crianca` é o avatar neutro dos
cartões de filho: o cabelo varia pelo índice, sem supor gênero. `Cofrinho` mora
no cartão de saldo da mesada e `Logotipo` é a casinha com o coração.

Na `Familia` inteira, cada personagem fica em dois grupos: o de fora só
posiciona (`transform` como atributo) e o de dentro flutua (`transform` por
CSS). No mesmo elemento, o CSS substituiria o atributo e todos cairiam na
origem, empilhados.

## Movimento

| Quando | O quê |
| ------ | ----- |
| Entrar numa tela | os blocos do conteúdo aparecem de baixo para cima, em escada |
| Passar o mouse num botão | levanta 2px e ganha sombra |
| Clicar num botão | aperta (escala 0,96) |
| Salvar | o botão mostra "Salvando…" com três pontinhos pulando |
| Aviso de sucesso | surge com uma mola, com o ícone de certo |
| Aviso de erro | surge e treme |
| Apagar ou desativar | a caixa de confirmação surge com uma mola e o cachorro preocupado |
| Personagens | flutuam, piscam, o rabo abana |
| Barra de categoria | cresce da esquerda |
| Gaveta no celular | desliza da esquerda |

## A raiz do site

Sem cookie de sessão, `/` mostra a apresentação (reescrita interna para
`/inicio`; a URL continua `/`). Com cookie, a requisição segue para o painel,
que valida a sessão de verdade e manda para `/entrar` se o token não valer. O
proxy nunca decide autorização: só escolhe qual página responde.

## O nome: Bufi

"Bufi" vem de bufunfa, a grana. Quatro letras, fácil de falar, e com
`bufi.com.br` livre no Registro.br em 29/10/2026 (consulta RDAP; os
candidatos `tostin` e `vintim` também estavam livres). A marca é uma moedinha
sorridente num quadrado arredondado, com um coração: dinheiro, sim, mas em
família. O nome mora só em `src/lib/marca.ts`.

## A família real e os avatares (FT-10)

Fora do sistema (apresentação e login) a família é a padrão. Dentro, o painel
desenha a família de verdade: cada usuário adulto e cada filho vira um
personagem, montado a partir do avatar que a própria pessoa (ou o responsável)
escolheu em `src/lib/avatar.ts`: figura (pai, mãe, menino, menina), tom de
pele (4), cabelo (5), roupa (8 cores) e óculos. Quem ainda não escolheu
aparece como uma figura neutra, com cores que variam pelo índice.

| O quê | Onde |
| ----- | ---- |
| O modelo e a validação do avatar | `src/lib/avatar.ts` |
| A coluna `avatar` (JSON pequeno) em `usuarios` e `filhos` | `prisma/migrations/20261029120000_avatares/` |
| O serviço: família desenhada, meu avatar, avatar de filho e de adulto | `src/servicos/avatares.ts` |
| As ações de formulário do avatar | `src/app/acoes-avatar.ts` |
| O editor com prévia ao vivo | `src/componentes/EditorDeAvatar.tsx` |
| A área Família (todos, em desenho e em cartões) | `src/app/(sistema)/familia/` |
| O adulto: dados, acesso (papel) e avatar | `src/app/(sistema)/familia/adultos/[id]/` |
| Guardas | `tests/avatar.test.ts`, `tests/avatares.test.ts`, `tests/familia-tela.test.ts` |

Regras: o filho com login escolhe o próprio avatar em Meu perfil e ele é
gravado no registro do filho; o filho nunca vê o irmão, nem no desenho (no
painel ele vê só a si e o cachorro); o adulto não mexe no avatar dos outros;
nada do avatar entra na trilha de atividade (é cosmético), mas ele vai no
arquivo de exportação e some com a conta (PR-09). O tom de pele é uma escolha
da família sobre um desenho, não um dado coletado: por isso não há valor
padrão e ninguém é obrigado a escolher.
