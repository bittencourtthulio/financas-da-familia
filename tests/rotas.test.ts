/**
 * Prova de vida das rotas: o servidor de produção sobe, o acesso sem sessão
 * é barrado, e com sessão as quatro telas do P-9 respondem.
 *
 * O login usa o mesmo serviço que a tela usa, e o cookie é montado como o
 * `gravarCookieDeSessao` monta — o que este teste cobre é o roteamento e a
 * proteção das rotas, que os testes de serviço não alcançam.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { entrar } from '@/servicos/autenticacao'
import { COOKIE_SESSAO } from '@/lib/sessao'
import { hashDeSenha } from '@/lib/senha'
import { prisma } from '@/lib/prisma'
import { registrarAtividade } from '@/servicos/atividade'
import { criarCategoria, criarLancamento } from '@/servicos/lancamentos'
import { hojeEmSaoPaulo, mesAtualEmSaoPaulo, rotuloDoMes } from '@/lib/datas'

const PORTA = 3178
const BASE = `http://localhost:${PORTA}`

let servidor: ChildProcess

async function esperarDePe(tentativas = 60): Promise<void> {
  for (let i = 0; i < tentativas; i += 1) {
    try {
      await fetch(`${BASE}/entrar`)
      return
    } catch {
      await new Promise((r) => setTimeout(r, 500))
    }
  }
  throw new Error('O servidor não subiu a tempo.')
}

/** Segue a resposta sem redirecionar, para poder afirmar sobre o 307. */
const pedir = (caminho: string, cookie?: string) =>
  fetch(`${BASE}${caminho}`, {
    redirect: 'manual',
    headers: cookie ? { cookie } : {},
  })

beforeAll(async () => {
  await prisma.lancamento.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.atividade.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.usuario.createMany({
    data: [
      {
        nome: 'Admin de Rota',
        email: 'admin.rota@teste.local',
        senhaHash: await hashDeSenha('senha-de-rota-123'),
        papel: 'admin',
      },
      {
        nome: 'Comum de Rota',
        email: 'comum.rota@teste.local',
        senhaHash: await hashDeSenha('senha-de-rota-123'),
        papel: 'usuario',
      },
      {
        // Filho sem registro ligado: prova que o servidor real nega o papel;
        // o filho com registro e o isolamento ficam em filhos-mesada.test.ts.
        nome: 'Filho de Rota',
        email: 'filho.rota@teste.local',
        senhaHash: await hashDeSenha('senha-de-rota-123'),
        papel: 'filho',
      },
    ],
  })

  const admin = await prisma.usuario.findUniqueOrThrow({
    where: { email: 'admin.rota@teste.local' },
  })
  await registrarAtividade({
    ator: admin,
    acao: 'usuario.criado',
    entidade: 'usuario',
    entidadeId: 'alvo-de-rota',
    detalhe: { alvoNome: 'Alvo Marcador', papel: 'usuario' },
  })
  await registrarAtividade({
    ator: admin,
    acao: 'usuario.papel_alterado',
    entidade: 'usuario',
    entidadeId: 'alvo-de-rota',
    detalhe: { alvoNome: 'Alvo Marcador', de: 'usuario', para: 'admin' },
  })

  const mercado = await criarCategoria(admin, { nome: 'Mercado de Rota', tipo: 'despesa' })
  const salario = await criarCategoria(admin, { nome: 'Salário de Rota', tipo: 'receita' })
  await criarLancamento(admin, {
    tipo: 'despesa',
    valor: '12,34',
    data: hojeEmSaoPaulo(),
    categoriaId: mercado.id,
    descricao: 'Marcador de Despesa',
  })
  await criarLancamento(admin, {
    tipo: 'receita',
    valor: '1.234,56',
    data: hojeEmSaoPaulo(),
    categoriaId: salario.id,
    descricao: 'Marcador de Receita',
  })

  servidor = spawn('npx', ['next', 'start', '-p', String(PORTA)], {
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'ignore',
  })
  await esperarDePe()
}, 120_000)

afterAll(() => {
  servidor?.kill()
})

async function cookieDe(email: string): Promise<string> {
  const { token } = await entrar({ email, senha: 'senha-de-rota-123' })
  return `${COOKIE_SESSAO}=${token}`
}

describe('sem sessão', () => {
  it.each([
  '/',
  '/perfil',
  '/perfil/senha',
  '/configuracoes/usuarios',
  '/atividade',
  '/lancamentos',
  '/lancamentos/novo',
  '/lancamentos/categorias',
  '/lancamentos/qualquer-id',
])(
    'manda %s para o login',
    async (rota) => {
      const r = await pedir(rota)
      expect(r.status).toBe(307)
      expect(r.headers.get('location')).toContain('/entrar')
    },
  )

  it('a tela de login abre', async () => {
    const r = await pedir('/entrar')
    expect(r.status).toBe(200)
    expect(await r.text()).toContain('Entrar')
  })

  it('uma rota inexistente responde 404 com a página em português', async () => {
    const r = await pedir('/rota-que-nao-existe')
    const html = await r.text()
    expect(r.status).toBe(404)
    expect(html).toContain('Página não encontrada')
    expect(html).not.toContain('This page could not be found')
  })

  it('a tela de login diz o nome do sistema e descreve a página em português', async () => {
    const html = await (await pedir('/entrar')).text()
    expect(html).toContain('Finanças da Família')
    expect(html).toMatch(/<meta name="description" content="[^"]*família[^"]*"/)
    expect(html).not.toMatch(/buildx|Gerado/i)
  })
})

describe('com sessão de usuário comum', () => {
  it('o painel abre, com título e subtítulo do domínio', async () => {
    const r = await pedir('/', await cookieDe('comum.rota@teste.local'))
    const html = await r.text()
    expect(r.status).toBe(200)
    expect(html).toContain('Painel da família')
    expect(html).toMatch(/Bem-vindo, (<!-- -->)?Comum de Rota/)
    expect(html).toContain('as finanças da casa')
    expect(html).not.toContain('Esta é a tela inicial do sistema')
  })

  it('o painel mostra o resumo do mês, sem texto genérico do template nem o painel vazio de antes', async () => {
    const html = await (await pedir('/', await cookieDe('comum.rota@teste.local'))).text()
    expect(html).toContain('Saldo do mês')
    expect(html).not.toContain('Ainda não há movimentações para mostrar')
    expect(html).not.toContain('As telas do projeto aparecem')
  })

  it('o painel traz o botão Menu da gaveta, ligado à barra lateral', async () => {
    const html = await (await pedir('/', await cookieDe('comum.rota@teste.local'))).text()
    expect(html).toMatch(/<button[^>]*aria-controls="barra-lateral"[^>]*aria-expanded="false"/)
    expect(html).toContain('id="barra-lateral"')
  })

  it('a barra lateral traz o nome do sistema', async () => {
    const html = await (await pedir('/', await cookieDe('comum.rota@teste.local'))).text()
    expect(html).toMatch(/class="marca"[^>]*>Finanças da Família</)
  })

  it('o perfil abre', async () => {
    const r = await pedir('/perfil', await cookieDe('comum.rota@teste.local'))
    expect(r.status).toBe(200)
    expect(await r.text()).toContain('Meu perfil')
  })

  it('a troca de senha abre', async () => {
    const r = await pedir('/perfil/senha', await cookieDe('comum.rota@teste.local'))
    expect(r.status).toBe(200)
    expect(await r.text()).toContain('Trocar senha')
  })

  it('o cadastro de usuários é negado no servidor, não só escondido no menu', async () => {
    // Com o estado de carregamento da rota (loading.tsx), a resposta já começou
    // quando a checagem de papel roda: o redirecionamento viaja no corpo
    // (meta refresh) em vez de virar 307. O que importa continua valendo: a
    // checagem é do servidor e nenhum dado de administração é entregue.
    const r = await pedir(
      '/configuracoes/usuarios',
      await cookieDe('comum.rota@teste.local'),
    )
    const html = await r.text()
    const redirecionou =
      r.status === 307 ||
      /<meta[^>]*http-equiv="refresh"[^>]*content="[^"]*url=\/"/.test(html)
    expect(redirecionou).toBe(true)
    expect(html).not.toContain('admin.rota@teste.local')
    expect(html).not.toContain('Novo usuário')
    expect(html).not.toContain('tabela-rolavel')
  })

  it('o item Usuários não aparece na navegação', async () => {
    const r = await pedir('/', await cookieDe('comum.rota@teste.local'))
    expect(await r.text()).not.toContain('/configuracoes/usuarios')
  })
})

describe('com sessão de admin', () => {
  it('o cadastro de usuários abre e lista quem existe', async () => {
    const r = await pedir(
      '/configuracoes/usuarios',
      await cookieDe('admin.rota@teste.local'),
    )
    const html = await r.text()
    expect(r.status).toBe(200)
    expect(html).toContain('Usuários')
    expect(html).toContain('admin.rota@teste.local')
    expect(html).toContain('comum.rota@teste.local')
  })

  it('a tela de usuários mostra Responsável e Adulto, nunca Administrador', async () => {
    const html = await (
      await pedir('/configuracoes/usuarios', await cookieDe('admin.rota@teste.local'))
    ).text()
    expect(html).toContain('Responsável')
    expect(html).toContain('Adulto')
    expect(html).toMatch(/<option value="admin">Responsável<\/option>/)
    expect(html).toMatch(/<option value="usuario"[^>]*>Adulto<\/option>/)
    expect(html).not.toContain('Administrador')
  })

  it('a barra de status mostra o papel pelo rótulo do domínio', async () => {
    const admin = await (await pedir('/', await cookieDe('admin.rota@teste.local'))).text()
    const comum = await (await pedir('/', await cookieDe('comum.rota@teste.local'))).text()
    expect(admin).toMatch(/<span>Responsável<\/span>/)
    expect(comum).toMatch(/<span>Adulto<\/span>/)
  })

  it('a tabela de usuários fica num envoltório rolável para o celular', async () => {
    const html = await (
      await pedir('/configuracoes/usuarios', await cookieDe('admin.rota@teste.local'))
    ).text()
    expect(html).toMatch(/<div class="tabela-rolavel"><table>/)
  })

  it('o item Usuários aparece na navegação', async () => {
    const r = await pedir('/', await cookieDe('admin.rota@teste.local'))
    expect(await r.text()).toContain('/configuracoes/usuarios')
  })
})

describe('a tela Atividade (FT-02)', () => {
  it('o responsável abre e vê quem fez cada ação, com data e hora, em português', async () => {
    const r = await pedir('/atividade', await cookieDe('admin.rota@teste.local'))
    const html = await r.text()
    expect(r.status).toBe(200)
    expect(html).toContain('Atividade')
    expect(html).toContain('Admin de Rota')
    expect(html).toContain('Criou o usuário Alvo Marcador')
    expect(html).toContain('Alterou o papel de Alvo Marcador')
    expect(html).toContain('De Adulto para Responsável')
    expect(html).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)
    expect(html).toMatch(/<div class="tabela-rolavel"><table>/)
    expect(html).not.toMatch(/usuario\.criado|papel_alterado/)
  })

  it('o adulto é negado no servidor e nenhum registro chega ao corpo', async () => {
    const r = await pedir('/atividade', await cookieDe('comum.rota@teste.local'))
    const html = await r.text()
    const redirecionou =
      r.status === 307 ||
      /<meta[^>]*http-equiv="refresh"[^>]*content="[^"]*url=\/"/.test(html)
    expect(redirecionou).toBe(true)
    expect(html).not.toContain('Alvo Marcador')
    expect(html).not.toContain('Admin de Rota')
    expect(html).not.toContain('tabela-rolavel')
  })

  it('o item Atividade aparece no menu do responsável e não no do adulto', async () => {
    const admin = await (await pedir('/', await cookieDe('admin.rota@teste.local'))).text()
    const comum = await (await pedir('/', await cookieDe('comum.rota@teste.local'))).text()
    expect(admin).toMatch(/<a[^>]*href="\/atividade"[^>]*>Atividade<\/a>/)
    expect(comum).not.toContain('/atividade')
  })

  it('página que não existe na paginação cai na última válida, sem erro', async () => {
    const r = await pedir('/atividade?pagina=999', await cookieDe('admin.rota@teste.local'))
    expect(r.status).toBe(200)
    expect(await r.text()).toContain('Alvo Marcador')
  })
})

describe('as telas de Lançamentos (FT-03)', () => {
  const abrir = async (caminho: string, email: string) =>
    pedir(caminho, await cookieDe(email))

  it('o adulto abre a lista do mês corrente com valor em reais, despesa negativa e receita positiva', async () => {
    const r = await abrir('/lancamentos', 'comum.rota@teste.local')
    const html = await r.text()
    expect(r.status).toBe(200)
    expect(html).toContain('Lançamentos')
    expect(html).toContain('Marcador de Despesa')
    expect(html).toContain('Marcador de Receita')
    expect(html).toContain('Mercado de Rota')
    expect(html).toMatch(/valor-despesa[^>]*>-R\$\s12,34</)
    expect(html).toMatch(/valor-receita[^>]*>R\$\s1\.234,56</)
    expect(html).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    expect(html).toMatch(/<div class="tabela-rolavel"><table>/)
    expect(html).toContain('Novo lançamento')
    expect(html).toContain('Mês anterior')
  })

  it('o responsável também abre; o menu traz Lançamentos e Categorias', async () => {
    const html = await (await abrir('/', 'admin.rota@teste.local')).text()
    expect(html).toMatch(/<a[^>]*href="\/lancamentos"[^>]*>Lançamentos<\/a>/)
    expect(html).toMatch(/<a[^>]*href="\/lancamentos\/categorias"[^>]*>Categorias<\/a>/)
    expect(html).not.toContain('configuracoes/categorias')
  })

  it('o filtro de tipo e o de mês valem no servidor', async () => {
    const receitas = await (await abrir('/lancamentos?tipo=receita', 'comum.rota@teste.local')).text()
    expect(receitas).toContain('Marcador de Receita')
    expect(receitas).not.toContain('Marcador de Despesa')
    // O React separa nós de texto vizinhos com comentários no HTML do servidor.
    const antigo = (await (await abrir('/lancamentos?mes=2020-01', 'comum.rota@teste.local')).text()).replaceAll('<!-- -->', '')
    expect(antigo).toContain('Nenhum lançamento em janeiro de 2020')
    expect(antigo).not.toContain('Marcador de')
    const invalido = await abrir('/lancamentos?mes=lixo&tipo=lixo&pagina=-4', 'comum.rota@teste.local')
    expect(invalido.status).toBe(200)
    expect(await invalido.text()).toContain('Marcador de Despesa')
  })

  it('o formulário de novo lançamento abre com os campos e a data de hoje', async () => {
    const html = await (await abrir('/lancamentos/novo', 'comum.rota@teste.local')).text()
    for (const nome of ['tipo', 'valor', 'data', 'categoriaId', 'descricao']) {
      expect(html).toContain(`name="${nome}"`)
    }
    expect(html).toContain(`value="${hojeEmSaoPaulo()}"`)
    expect(html).toMatch(/<option[^>]*>Mercado de Rota<\/option>/)
    // Receita é outro tipo: a categoria dela não é oferecida como opção.
    expect(html).not.toMatch(/<option[^>]*>Salário de Rota<\/option>/)
  })

  it('a edição abre preenchida com o valor no formato do campo; id inexistente é 404', async () => {
    const l = await prisma.lancamento.findFirstOrThrow({ where: { descricao: 'Marcador de Receita' } })
    const html = await (await abrir(`/lancamentos/${l.id}`, 'comum.rota@teste.local')).text()
    expect(html).toContain('value="1234,56"')
    expect(html).toContain('value="Marcador de Receita"')
    expect(html).toContain('Apagar lançamento')
    expect(html).not.toContain('Confirmar exclusão')

    // A tela já começou a ser enviada (carregando) quando o serviço responde
    // 404, então o Next mantém o status 200 e troca o corpo pela página de
    // "não encontrado": o que importa é que o formulário não aparece.
    const inexistente = await (await abrir('/lancamentos/nao-existe', 'comum.rota@teste.local')).text()
    expect(inexistente).toContain('Página não encontrada')
    expect(inexistente).not.toContain('name="valor"')
  })

  it('a tela de categorias lista por tipo e traz o formulário', async () => {
    const html = await (await abrir('/lancamentos/categorias', 'comum.rota@teste.local')).text()
    expect(html).toContain('Mercado de Rota')
    expect(html).toContain('Salário de Rota')
    expect(html).toContain('Nova categoria')
    expect(html).toContain('name="nome"')
  })

  it.each([
    '/lancamentos',
    '/lancamentos/novo',
    '/lancamentos/categorias',
    '/lancamentos/qualquer-id',
  ])('quem não é responsável nem adulto (o filho de amanhã) é negado em %s, sem dado no corpo', async (caminho) => {
    const r = await abrir(caminho, 'filho.rota@teste.local')
    const html = await r.text()
    const redirecionou =
      r.status === 307 ||
      /<meta[^>]*http-equiv="refresh"[^>]*content="[^"]*url=\/"/.test(html)
    expect(redirecionou).toBe(true)
    for (const proibido of ['Marcador de', 'Mercado de Rota', 'Salário de Rota', 'tabela-rolavel']) {
      expect(html).not.toContain(proibido)
    }
  })

  it('o item Lançamentos não aparece no menu de quem não lança', async () => {
    const html = await (await abrir('/', 'filho.rota@teste.local')).text()
    expect(html).not.toContain('/lancamentos')
  })

  it('a Atividade do responsável mostra os lançamentos e as categorias, sem nenhum valor', async () => {
    const html = await (await abrir('/atividade', 'admin.rota@teste.local')).text()
    expect(html).toContain('Criou o lançamento')
    expect(html).toContain('Criou a categoria Mercado de Rota')
    for (const proibido of ['1.234,56', '1234,56', '123456', '12,34', 'Marcador de']) {
      expect(html).not.toContain(proibido)
    }
  })
})

describe('o resumo do mês no painel (FT-04)', () => {
  const abrir = async (caminho: string, email: string) =>
    pedir(caminho, await cookieDe(email))
  // O React separa texto e valor com um comentário no HTML.
  const texto = async (r: Response) => (await r.text()).replace(/<!-- -->/g, '')
  const hoje = rotuloDoMes(mesAtualEmSaoPaulo())

  it('o adulto vê receitas, despesas, saldo e a categoria do mês, em reais', async () => {
    const r = await abrir('/', 'comum.rota@teste.local')
    const html = await texto(r)
    expect(r.status).toBe(200)
    expect(html).toContain('Painel da família')
    expect(html).toMatch(/Bem-vindo, Comum de Rota/)
    expect(html).toContain('Receitas')
    expect(html).toContain('Despesas')
    expect(html).toContain('Saldo do mês')
    expect(html).toMatch(/valor-do-cartao valor-receita[^>]*>R\$\s1\.234,56</)
    expect(html).toMatch(/valor-do-cartao valor-despesa[^>]*>R\$\s12,34</)
    expect(html).toMatch(/valor-do-cartao valor-receita[^>]*>R\$\s1\.222,22</)
    expect(html).toContain('Saldo positivo')
    expect(html).toContain('Despesas por categoria')
    expect(html).toContain('Mercado de Rota')
    expect(html).toContain('Mês anterior')
    expect(html).toContain('Próximo mês')
  })

  it('o responsável vê o mesmo resumo', async () => {
    const html = await texto(await abrir('/', 'admin.rota@teste.local'))
    expect(html).toContain('Saldo do mês')
    expect(html).toContain('Mercado de Rota')
  })

  it('mês sem lançamento mostra a mensagem com atalho para Lançamentos e o caminho de volta', async () => {
    const r = await abrir('/?mes=2020-01', 'comum.rota@teste.local')
    const html = await texto(r)
    expect(r.status).toBe(200)
    expect(html).toContain('Nenhum lançamento em janeiro de 2020')
    expect(html).toMatch(/<a[^>]*href="\/lancamentos\?mes=2020-01"[^>]*>Lançamentos<\/a>/)
    expect(html).toMatch(/<a[^>]*href="\/"[^>]*>Mês atual<\/a>/)
    expect(html).not.toContain('Saldo do mês')
  })

  it.each(['lixo', '2026-13', '2026-1', '1999-12', '2026-10-05', ''])(
    'mês inválido "%s" responde 200 com o mês corrente',
    async (mes) => {
      const r = await abrir(`/?mes=${mes}`, 'comum.rota@teste.local')
      const html = await texto(r)
      expect(r.status).toBe(200)
      expect(html).toContain('Saldo do mês')
      expect(html.toLowerCase()).toContain(hoje)
    },
  )

  it('mês repetido na URL também cai no mês corrente', async () => {
    const r = await abrir('/?mes=2020-01&mes=2020-02', 'comum.rota@teste.local')
    const html = await texto(r)
    expect(r.status).toBe(200)
    expect(html).toContain('Saldo do mês')
  })

  it('o papel filho abre o painel com título e subtítulo e nenhum dado financeiro', async () => {
    const r = await abrir('/', 'filho.rota@teste.local')
    const html = await texto(r)
    expect(r.status).toBe(200)
    expect(html).toContain('Painel da família')
    expect(html).toMatch(/Bem-vindo, Filho de Rota/)
    expect(html).not.toContain('Saldo do mês')
    expect(html).not.toContain('Despesas por categoria')
    expect(html).not.toContain('Mercado de Rota')
    expect(html).not.toMatch(/R\$\s\d/)
  })

  it('o filho também não recebe dado com ?mes= qualquer', async () => {
    const html = await texto(await abrir('/?mes=2026-10', 'filho.rota@teste.local'))
    expect(html).not.toContain('Saldo do mês')
    expect(html).not.toMatch(/R\$\s\d/)
  })

  it('o painel mantém o botão Menu da gaveta', async () => {
    const html = await texto(await abrir('/', 'comum.rota@teste.local'))
    expect(html).toMatch(/<button[^>]*aria-controls="barra-lateral"/)
  })
})

describe('cookie de sessão', () => {
  it('token adulterado não abre o painel', async () => {
    const bom = await cookieDe('admin.rota@teste.local')
    const adulterado = bom.slice(0, -4) + 'xxxx'
    const r = await pedir('/', adulterado)
    expect(r.status).toBe(307)
  })
})

describe('renovação da sessão', () => {
  const renovar = (cookie?: string) =>
    fetch(`${BASE}/api/sessao/renovar`, {
      method: 'POST',
      headers: cookie ? { cookie } : {},
    })

  it('sem cookie responde 401 e não entrega cookie', async () => {
    const r = await renovar()
    expect(r.status).toBe(401)
    expect(r.headers.get('set-cookie')).toBeNull()
  })

  it('com sessão válida responde 200 e renova o cookie, httpOnly e sameSite lax', async () => {
    const r = await renovar(await cookieDe('comum.rota@teste.local'))
    expect(r.status).toBe(200)
    const cookie = r.headers.get('set-cookie') ?? ''
    expect(cookie).toContain(`${COOKIE_SESSAO}=`)
    expect(cookie).toMatch(/httponly/i)
    expect(cookie).toMatch(/samesite=lax/i)
  })

  it('com sessão anterior a uma troca de senha responde 401 e não renova', async () => {
    const cookie = await cookieDe('comum.rota@teste.local')
    await prisma.usuario.update({
      where: { email: 'comum.rota@teste.local' },
      data: { sessoesValidasDesde: new Date(Date.now() + 10_000) },
    })
    try {
      const r = await renovar(cookie)
      expect(r.status).toBe(401)
      expect(r.headers.get('set-cookie')).toBeNull()
    } finally {
      await prisma.usuario.update({
        where: { email: 'comum.rota@teste.local' },
        data: { sessoesValidasDesde: new Date(0) },
      })
    }
  })
})

describe('rota pública de saúde (FT-08)', () => {
  it('GET /api/saude responde 200 sem sessão e sem redirecionar para o login', async () => {
    const r = await pedir('/api/saude')
    expect(r.status).toBe(200)
    expect(r.headers.get('location')).toBeNull()
    expect(r.headers.get('set-cookie')).toBeNull()
    expect(r.headers.get('cache-control')).toBe('no-store')
    expect(await r.json()).toEqual({ status: 'ok', banco: 'ok' })
  })

  it('a resposta não leva dado pessoal, versão, caminho nem pilha', async () => {
    const texto = await (await pedir('/api/saude')).text()
    expect(texto).not.toMatch(/@|\/|\d+\.\d+\.\d+|stack|Rota|Marcador/)
  })

  it('só as rotas esperadas são públicas: a de saúde e a tela de entrada, não as de dados', async () => {
    expect((await pedir('/api/saude')).status).toBe(200)
    expect((await pedir('/entrar')).status).toBe(200)
    expect((await pedir('/lancamentos')).status).toBe(307)
    expect((await fetch(`${BASE}/api/privacidade/exportar`, { method: 'POST' })).status).toBe(401)
    expect((await fetch(`${BASE}/api/sessao/renovar`, { method: 'POST' })).status).toBe(401)
  })

  it('outro método na rota de saúde não é aceito', async () => {
    const r = await fetch(`${BASE}/api/saude`, { method: 'POST' })
    expect(r.status).toBe(405)
  })
})
