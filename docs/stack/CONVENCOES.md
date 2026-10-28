---
expx-schema: v1
skill: stackx
documento: convencoes
gerado-em: 2026-10-28
commit-referencia: inicial
projeto-legado: nao
---

# Convenções técnicas — financas-da-familia

> **Origem das regras (B2 do buildx).** Projeto novo: as regras abaixo
> marcadas `decidido_pelo_buildx` são prescrição, não detecção. Só os
> comandos e o que cita `arquivo:linha` têm evidência real. A primeira
> feature entregue dispara a revisão: o `stackx-detectar` converte cada regra
> confirmada em evidência.

## 1. Identidade técnica

| Item | Valor | Origem |
| ---- | ----- | ------ |
| Linguagem | TypeScript estrito | `tsconfig.json` |
| Runtime | Node.js 22 | executado no B2 |
| Gerenciador de pacotes | npm, lock versionado | `package-lock.json` |
| Framework | Next.js 16.4.3, App Router, React 19 | `package.json` |
| Banco | SQLite via Prisma 7.10.1 | `prisma/` |

## 2. Comandos que funcionam de verdade

| Alvo | Comando | Origem |
| ---- | ------- | ------ |
| Suíte inteira | `npm test` | `package.json` (61 testes verdes no B2) |
| Lint | `npm run lint` | `package.json` (passa no B2) |
| Build | `npm run build` | `package.json` (passa no B2) |
| Preparar banco | `npm run setup` | `package.json` (generate, db push, seed) |
| Subir | `npm run dev` | `package.json` |
| Auditoria de dependência | `npm audit --audit-level=high` | exit 0 no B2 |

Variáveis exigidas: `DATABASE_URL` e `JWT_SECRET` (modelo no arquivo de exemplo de ambiente versionado).

## 3. Onde moram os testes

Arquivos `tests/**/*.test.ts`, nome `<assunto>.test.ts`. — `vitest.config.ts:7`
Teste novo de serviço segue o formato de `tests/usuarios.test.ts`. — `decidido_pelo_buildx`

## 4. Isolamento do banco entre testes

Os testes usam um arquivo SQLite próprio (`prisma/test.db`), criado pelo `tests/setup.ts`, nunca o banco de desenvolvimento. — `tests/setup.ts:9`
Cada arquivo de teste limpa as tabelas que usa antes de rodar. — `tests/ajuda.ts:40`

## 5. Camadas e direção das dependências

| Camada | Pasta | Pode chamar |
| ------ | ----- | ----------- |
| Apresentação | `src/app`, `src/componentes` | `src/servicos`, `src/lib` |
| Aplicação | `src/servicos` | `src/lib` (inclui o acesso a dados) |
| Dados | `src/lib/prisma.ts` e `prisma/` | nada acima |

A apresentação nunca importa o cliente do Prisma; o serviço nunca importa nada de `src/app`. — `decidido_pelo_buildx` (P-1)

## 6. Erro

Serviço sinaliza erro lançando `ErroDeAplicacao` pelos construtores `naoAutenticado`, `naoAutorizado`, `naoEncontrado`, `entradaInvalida`, `conflito`. — `src/lib/erros.ts:4`
Nenhum rastro de pilha chega ao usuário. — `decidido_pelo_buildx` (L17)

## 7. Configuração

Variável obrigatória ausente falha na leitura, não em produção. — `src/lib/ambiente.ts:7`
Segredo só no arquivo local de ambiente (fora do versionador). — `.gitignore`

## 8. Dinheiro

Todo valor monetário é inteiro em centavos (BRL); nunca `Float` no esquema, nunca ponto flutuante no cálculo. — `decidido_pelo_buildx` (PR-02)

## 9. Autorização

Papéis `admin`, `usuario` e `filho`; a checagem acontece no servidor, em serviço ou ação, nunca só na interface. Evidência atual só para `admin`/`usuario`. — `src/lib/sessao-servidor.ts:33`

## 10. Dados do domínio

Toda entidade nasce numa feature do B4, sob TDD, com migration; entrada validada com `zod` no servidor. — `decidido_pelo_buildx` (L5)
