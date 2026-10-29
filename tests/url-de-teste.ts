// O banco dos testes é um Postgres só dos testes: os testes apagam tabelas, e
// por isso o nome do banco precisa dizer "test". Sem DATABASE_URL_TESTE, vale o
// Postgres local (`createdb financas_teste`). A DATABASE_URL do aplicativo nunca
// é usada aqui, para um teste jamais tocar o banco de desenvolvimento ou o de
// produção.

export function urlDeTeste(): string {
  const url =
    process.env.DATABASE_URL_TESTE ??
    `postgresql://${process.env.USER ?? 'postgres'}@localhost:5432/financas_teste`
  const banco = decodeURIComponent(new URL(url).pathname.replace(/^\//, ''))
  if (!/test/i.test(banco)) {
    throw new Error(
      `O banco dos testes precisa ter "test" no nome (recebi "${banco}"). ` +
        'Os testes apagam as tabelas; use um banco só para eles.',
    )
  }
  return url
}
