// O que nunca pode ser gravado em lugar que sobrevive à requisição: a trilha
// de atividade (PR-10, PR-25) e o log (PR-14) usam esta mesma lista, para
// existir uma só definição de "dado que não se registra".

// Substrings (sem diferenciar maiúscula) que não podem aparecer no nome de
// uma chave. Conservador de propósito: é melhor recusar uma chave inocente do
// que gravar um segredo.
export const CHAVE_PROIBIDA =
  /senha|password|hash|token|jwt|segredo|secret|valor|centavo|saldo|e-?mail|cpf/i

// Texto que tem cara de hash bcrypt ou de JWT.
export const VALOR_PROIBIDO = /^\$2[abxy]?\$|^eyJ[\w-]+\.[\w-]+\./
