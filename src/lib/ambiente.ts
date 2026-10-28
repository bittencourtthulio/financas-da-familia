// Configuração por ambiente (L20). Variável obrigatória ausente falha aqui,
// no start, e não em produção quando alguém tentar entrar.

function obrigatoria(nome: string): string {
  const valor = process.env[nome]
  if (!valor || valor.trim() === '') {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${nome}. ` +
        'Veja o .env.example.',
    )
  }
  return valor
}

function inteiroComPadrao(nome: string, padrao: number): number {
  const bruto = process.env[nome]
  if (!bruto) return padrao
  const valor = Number.parseInt(bruto, 10)
  if (Number.isNaN(valor) || valor <= 0) {
    throw new Error(`Variável ${nome} precisa ser um inteiro positivo.`)
  }
  return valor
}

type Variaveis = Record<string, string | undefined>

const vazio = (v: string | undefined) => v === undefined || v.trim() === ''

/**
 * Tudo o que está errado na configuração, uma frase por problema. Nunca repete
 * o valor informado: segredo e URL de banco não vão para mensagem nem para log.
 */
export function problemasDeAmbiente(variaveis: Variaveis = process.env): string[] {
  const problemas: string[] = []
  const banco = variaveis.DATABASE_URL
  const ttl = variaveis.JWT_TTL_SEGUNDOS
  if (vazio(banco)) {
    problemas.push('DATABASE_URL ausente: informe o caminho do arquivo SQLite, por exemplo file:./dev.db.')
  } else if (!(banco as string).startsWith('file:')) {
    problemas.push('DATABASE_URL inválida: o banco é um arquivo SQLite e a URL precisa começar com file:.')
  }
  if (vazio(variaveis.JWT_SECRET)) {
    problemas.push('JWT_SECRET ausente: informe o segredo de assinatura da sessão.')
  }
  if (!vazio(ttl) && !/^[1-9]\d*$/.test((ttl as string).trim())) {
    problemas.push('JWT_TTL_SEGUNDOS inválida: precisa ser um inteiro positivo, em segundos.')
  }
  return problemas
}

/** Falha de uma vez, no start, com todos os problemas da configuração (L20, PR-14). */
export function validarAmbiente(variaveis: Variaveis = process.env): void {
  const problemas = problemasDeAmbiente(variaveis)
  if (problemas.length === 0) return
  throw new Error(
    `Configuração inválida, o sistema não vai subir:\n- ${problemas.join('\n- ')}\n` +
      'Veja o modelo de ambiente versionado no projeto.',
  )
}

export const ambiente = {
  get jwtSecret(): string {
    return obrigatoria('JWT_SECRET')
  },
  get jwtTtlSegundos(): number {
    return inteiroComPadrao('JWT_TTL_SEGUNDOS', 900)
  },
  get ehProducao(): boolean {
    return process.env.NODE_ENV === 'production'
  },
}
