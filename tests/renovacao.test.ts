/**
 * Renovação deslizante da sessão (PR-05, PR-21): a renovação passa pela mesma
 * verificação de uma sessão normal, então sessão derrubada por troca de
 * senha ou conta desativada não ressuscita, e o papel vem do banco, não do
 * token velho.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { renderizar } from './renderizar'
import { entrar, renovarSessao } from '@/servicos/autenticacao'
import { assinarSessao, lerSessao } from '@/lib/sessao'
import { prisma } from '@/lib/prisma'
import { ErroDeAplicacao } from '@/lib/erros'
import { RenovadorDeSessao } from '@/componentes/RenovadorDeSessao'
import { intervaloDeRenovacao } from '@/lib/renovacao'
import { criarUsuario, criarAdmin, limparBanco } from './ajuda'

beforeEach(limparBanco)

const agora = () => Math.floor(Date.now() / 1000)

describe('renovarSessao', () => {
  it('devolve um token mais novo do mesmo usuário', async () => {
    const conta = await criarUsuario()
    // A conta existe há uma hora, então um token de dez minutos atrás é válido.
    await prisma.usuario.update({
      where: { id: conta.id },
      data: { sessoesValidasDesde: new Date(Date.now() - 3_600_000) },
    })
    const velho = await assinarSessao(conta.id, conta.papel, agora() - 600)

    const { token, usuario } = await renovarSessao(velho)

    expect(usuario.id).toBe(conta.id)
    const antes = await lerSessao(velho)
    const depois = await lerSessao(token)
    expect(depois.usuarioId).toBe(conta.id)
    expect(depois.emitidoEm).toBeGreaterThanOrEqual(antes.emitidoEm + 600)
  })

  it('o papel vem do banco: quem foi rebaixado não renova como admin', async () => {
    const admin = await criarAdmin()
    await criarAdmin() // sobra outro admin, então o rebaixamento é permitido
    const token = await assinarSessao(admin.id, 'admin')
    await prisma.usuario.update({ where: { id: admin.id }, data: { papel: 'usuario' } })

    const { token: novo } = await renovarSessao(token)

    expect((await lerSessao(novo)).papel).toBe('usuario')
  })

  it('recusa conta desativada depois da emissão', async () => {
    const conta = await criarUsuario()
    const token = await assinarSessao(conta.id, conta.papel)
    await prisma.usuario.update({ where: { id: conta.id }, data: { ativo: false } })

    const erro = await renovarSessao(token).catch((e: ErroDeAplicacao) => e)
    expect((erro as ErroDeAplicacao).status).toBe(401)
  })

  it('não ressuscita sessão anterior a uma troca de senha', async () => {
    const conta = await criarUsuario()
    const { token } = await entrar({ email: conta.email, senha: conta.senha })
    await prisma.usuario.update({
      where: { id: conta.id },
      data: { sessoesValidasDesde: new Date(Date.now() + 10_000) },
    })

    const erro = await renovarSessao(token).catch((e: ErroDeAplicacao) => e)
    expect((erro as ErroDeAplicacao).status).toBe(401)
  })

  it('recusa texto que não é token', async () => {
    const erro = await renovarSessao('lixo').catch((e: ErroDeAplicacao) => e)
    expect((erro as ErroDeAplicacao).status).toBe(401)
  })
})

describe('renovador no navegador', () => {
  it('renova na metade do tempo de vida do token, com piso de 30 segundos', () => {
    expect(intervaloDeRenovacao(900)).toBe(450_000)
    expect(intervaloDeRenovacao(10)).toBe(30_000)
  })

  it('não desenha nada na tela', () => {
    expect(renderizar(RenovadorDeSessao, { intervaloMs: 450_000 })).toBe('')
  })
})
