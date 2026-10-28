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
    ],
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
  it.each(['/', '/perfil', '/perfil/senha', '/configuracoes/usuarios'])(
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

  it('o painel vazio explica o que vai aparecer ali, sem texto genérico do template', async () => {
    const html = await (await pedir('/', await cookieDe('comum.rota@teste.local'))).text()
    expect(html).toContain('Ainda não há movimentações para mostrar')
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

describe('cookie de sessão', () => {
  it('token adulterado não abre o painel', async () => {
    const bom = await cookieDe('admin.rota@teste.local')
    const adulterado = bom.slice(0, -4) + 'xxxx'
    const r = await pedir('/', adulterado)
    expect(r.status).toBe(307)
  })
})
