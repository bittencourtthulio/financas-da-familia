# Autenticação e sessão

## Contrato de entrada

- `entrar({email, senha})` (`src/servicos/autenticacao.ts:33`): e-mail normalizado (trim, minúsculo) e validado com zod (`src/servicos/autenticacao.ts:10-19`).
- `assinarSessao(usuarioId, papel, emitidoEm?)` (`src/lib/sessao.ts:16`) emite JWT HS256 com expiração `emitidoEm + jwtTtlSegundos` (`src/lib/sessao.ts:27-32`).
- Variáveis de ambiente: `JWT_SECRET` (obrigatória, `src/lib/ambiente.ts:27`), `JWT_TTL_SEGUNDOS` (padrão 900, `src/lib/ambiente.ts:30`), `DATABASE_URL`.

## Contrato de saída

- `entrar` devolve `{token, usuario}` (`src/servicos/autenticacao.ts:50-58`); a mensagem de falha é a mesma para e-mail inexistente, senha errada e conta desativada (`src/servicos/autenticacao.ts:46`).
- Cookie `expx_sessao`: `httpOnly`, `secure` em produção, `sameSite: lax`, `path: /`, `maxAge` igual ao TTL (`src/lib/sessao.ts:51-62`).
- `usuarioDaSessao` confere conta ativa e o corte `sessoesValidasDesde` (`src/servicos/autenticacao.ts:66-85`).

## Limites e cotas

- TTL do token: 900 s por padrão (`src/lib/ambiente.ts:30`). NÃO HÁ renovação: passados 900 s o usuário é redirecionado ao login (`src/lib/sessao.ts:35-49`, sem caminho de renovação).
- Limite de tentativas de login: NÃO DOCUMENTADO e NÃO IMPLEMENTADO (`src/servicos/autenticacao.ts:33-59` não conta falhas).
- Custo do bcrypt: 10 (`src/lib/senha.ts:5`). Senha mínima: 8 caracteres (`src/servicos/usuarios.ts:8`, `src/servicos/perfil.ts:23`).

## Erros conhecidos e tratamento

- `ErroDeAplicacao` com status e código (`src/lib/erros.ts:4-13`); a ação converte erro desconhecido em frase genérica e não vaza pilha (`src/app/acoes.ts:26-30`).
- Troca de senha emite token novo com `iat` posterior ao corte para não derrubar quem trocou (`src/lib/sessao.ts:19-24`).

## Riscos para a nossa implementação

- Renovar um token sem reconsultar o banco ressuscitaria sessão invalidada por troca de senha: qualquer renovação precisa passar por `usuarioDaSessao` (`src/servicos/autenticacao.ts:66`).
- Contador de tentativas em memória some quando o processo reinicia e não é compartilhado entre instâncias; para uma instalação SQLite de uma família (PR-18) isso é aceitável, mas precisa ser dito.
- Bloqueio por e-mail permite a um terceiro travar a conta de outro por alguns minutos; é custo aceito e documentado na premissa.

## Fonte

Arquivos citados acima, lidos integralmente — acessado em 2026-10-28.
