/**
 * O CONVENCOES.md só vale se a evidência que ele cita existe. Este teste
 * lê as citações `arquivo:linha`, confere o arquivo e a linha, e exige que
 * toda regra ainda prescrita (decidido_pelo_buildx) diga em que feature
 * a primeira evidência nasce. Também confere que os comandos citados existem.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const RAIZ = process.cwd()

export function citacoesDe(texto: string): Array<{ arquivo: string; linha: number; fim: number }> {
  const achados: Array<{ arquivo: string; linha: number; fim: number }> = []
  for (const m of texto.matchAll(/`([\w./()[\]-]+\.\w+):(\d+)(?:-(\d+))?`/g)) {
    const linha = Number(m[2])
    achados.push({ arquivo: m[1] as string, linha, fim: m[3] ? Number(m[3]) : linha })
  }
  return achados
}

export function citacoesQuebradas(
  texto: string,
  raiz: string,
): string[] {
  const quebradas: string[] = []
  for (const { arquivo, linha, fim } of citacoesDe(texto)) {
    const caminho = path.join(raiz, arquivo)
    if (!existsSync(caminho)) {
      quebradas.push(`${arquivo}:${linha} (arquivo não existe)`)
      continue
    }
    const total = readFileSync(caminho, 'utf8').split('\n').length
    if (linha < 1 || fim > total || fim < linha) {
      quebradas.push(`${arquivo}:${linha} (arquivo tem ${total} linhas)`)
    }
  }
  return quebradas
}

const convencoes = readFileSync(path.join(RAIZ, 'docs/stack/CONVENCOES.md'), 'utf8')

describe('evidência do CONVENCOES.md', () => {
  it('há citações suficientes para a leitura ser relevante', () => {
    expect(citacoesDe(convencoes).length).toBeGreaterThan(40)
  })

  it('toda citação arquivo:linha aponta para arquivo que existe, com a linha dentro do tamanho', () => {
    expect(citacoesQuebradas(convencoes, RAIZ)).toEqual([])
  })

  it('a conferência discrimina citação válida de quebrada', () => {
    const texto = 'ok `package.json:1`, arquivo falso `src/nao-existe.ts:3`, linha longe `package.json:99999`'
    expect(citacoesQuebradas(texto, RAIZ)).toEqual([
      'src/nao-existe.ts:3 (arquivo não existe)',
      expect.stringMatching(/^package\.json:99999 \(arquivo tem \d+ linhas\)$/),
    ])
    expect(citacoesQuebradas('só `package.json:1`', RAIZ)).toEqual([])
  })

  it('toda regra ainda prescrita diz em que feature a evidência nasce (depois da FT-05 não sobra nenhuma)', () => {
    const prescritas = convencoes
      .split('\n')
      .filter((l) => l.includes('decidido_pelo_buildx'))
    expect(prescritas).toEqual([])
    for (const linha of prescritas) {
      expect(linha, linha).toMatch(/evidência na FT-0[1-8]/)
    }
  })

  it('nenhum caminho absoluto nem valor de segredo no arquivo', () => {
    expect(convencoes).not.toMatch(/\/(Users|home|mnt)\//)
    expect(convencoes).not.toMatch(/(SECRET|PASSWORD|TOKEN)\s*=\s*\S/)
  })
})

describe('auditoria no CONVENCOES.md (FT-02)', () => {
  it('a seção 7 trata da trilha de atividade e cita o serviço de registro', () => {
    const secao7 = convencoes.slice(convencoes.indexOf('## 7.'), convencoes.indexOf('## Conflitos'))
    expect(secao7).toMatch(/### Auditoria/)
    expect(secao7).toContain('registrarAtividade')
    expect(secao7).toContain('src/servicos/atividade.ts:')
  })

  it('cada citação da auditoria aponta para a linha que contém o nome citado', () => {
    const esperado: Array<[string, number, RegExp]> = [
      ['src/servicos/atividade.ts', 75, /registrarAtividade/],
      ['src/lib/chaves-proibidas.ts', 8, /CHAVE_PROIBIDA/],
      ['src/servicos/atividade.ts', 134, /listarAtividade/],
      ['src/servicos/usuarios.ts', 86, /registrarAtividade/],
      ['src/servicos/usuarios.ts', 161, /registrarAtividade/],
      ['src/lib/atividade.ts', 9, /ACOES/],
      ['prisma/schema.prisma', 38, /model Atividade/],
      ['tests/atividade.test.ts', 122, /somente acréscimo/],
    ]
    for (const [arquivo, linha, padrao] of esperado) {
      expect(convencoes, `${arquivo}:${linha}`).toContain(`\`${arquivo}:${linha}\``)
      const conteudo = readFileSync(path.join(RAIZ, arquivo), 'utf8').split('\n')[linha - 1]
      expect(conteudo, `${arquivo}:${linha}`).toMatch(padrao)
    }
  })

  it('a primeira entidade de domínio deixou de ser prescrita: nasceu na FT-02', () => {
    expect(convencoes).not.toMatch(/Primeira entidade de domínio nova sob esta regra: `decidido_pelo_buildx`/)
  })
})

describe('dinheiro, autorização e dados no CONVENCOES.md (FT-03)', () => {
  const secao7 = convencoes.slice(convencoes.indexOf('## 7.'), convencoes.indexOf('## Conflitos'))
  const trecho = (titulo: string) => {
    const i = secao7.indexOf(`### ${titulo}`)
    const j = secao7.indexOf('\n### ', i + 5)
    return secao7.slice(i, j === -1 ? undefined : j)
  }

  it('a regra de dinheiro deixou de ser prescrita: tem evidência no esquema, no leitor e no teste', () => {
    const dinheiro = trecho('Dinheiro')
    expect(dinheiro).not.toContain('decidido_pelo_buildx')
    for (const citacao of ['prisma/schema.prisma:73', 'src/lib/dinheiro.ts:19', 'src/lib/formato.ts:14', 'src/lib/datas.ts:35']) {
      expect(dinheiro, citacao).toContain(`\`${citacao}\``)
    }
    expect(dinheiro).toMatch(/PR-02/)
    expect(dinheiro).toMatch(/Float/)
  })

  it('cada citação da seção 7 nova aponta para a linha que contém o nome citado', () => {
    const esperado: Array<[string, number, RegExp]> = [
      ['prisma/schema.prisma', 73, /valorCentavos\s+Int/],
      ['prisma/schema.prisma', 56, /model Categoria/],
      ['prisma/schema.prisma', 70, /model Lancamento/],
      ['prisma/migrations/20261028150000_lancamentos/migration.sql', 13, /"valorCentavos" INTEGER/],
      ['src/lib/dinheiro.ts', 7, /VALOR_MAXIMO_EM_CENTAVOS/],
      ['src/lib/dinheiro.ts', 19, /lerValorEmReais/],
      ['src/lib/dinheiro.ts', 39, /centavosParaCampo/],
      ['src/lib/formato.ts', 14, /formatarMoeda/],
      ['src/lib/datas.ts', 35, /dataCivilValida/],
      ['src/lib/datas.ts', 60, /hojeEmSaoPaulo/],
      ['src/servicos/lancamentos.ts', 178, /criarLancamento/],
      ['src/servicos/lancamentos.ts', 88, /registrarAtividade/],
      ['src/servicos/lancamentos.ts', 264, /registrarAtividade/],
      ['src/servicos/autenticacao.ts', 140, /exigirAdultoOuResponsavel/],
      ['src/app/sessao-servidor.ts', 32, /exigirUsuarioAdmin/],
      ['src/app/sessao-servidor.ts', 43, /exigirUsuarioDeLancamentos/],
      ['src/lib/atividade.ts', 13, /lancamento\.criado/],
      ['src/app/acoes.ts', 55, /mensagemDe/],
      ['src/app/acoes.ts', 57, /mensagemSegura|Erro de aplicação/],
      ['tests/ajuda.ts', 39, /limparBanco/],
      ['tests/rotas.test.ts', 108, /spawn/],
      ['tests/rotas.test.ts', 207, /cadastro de usuários é negado/],
      ['tests/lancamentos-papeis.test.ts', 68, /todas as funções do serviço negam/],
      ['tests/lancamentos-dados.test.ts', 114, /nenhum modelo usa Float/],
      ['tests/dinheiro.test.ts', 123, /PR-02 no código do leitor/],
    ]
    for (const [arquivo, linha, padrao] of esperado) {
      expect(convencoes, `${arquivo}:${linha}`).toContain(`\`${arquivo}:${linha}\``)
      const conteudo = readFileSync(path.join(RAIZ, arquivo), 'utf8').split('\n')[linha - 1]
      expect(conteudo, `${arquivo}:${linha}`).toMatch(padrao)
    }
  })

  it('a autorização dos lançamentos é por lista de permitidos e diz que o filho é negado', () => {
    const autorizacao = trecho('Autorização')
    expect(autorizacao).toContain('lista de permitidos')
    expect(autorizacao).toContain('`filho`')
  })

  it('a auditoria cita as quatro ações novas e diz que o valor nunca vai para a trilha', () => {
    const auditoria = trecho('Auditoria')
    for (const acao of ['lancamento.criado', 'lancamento.alterado', 'lancamento.apagado', 'categoria.criada']) {
      expect(auditoria, acao).toContain(acao)
    }
    expect(auditoria).toMatch(/nunca o valor/)
  })

  it('o histórico registra a revisão da FT-03', () => {
    expect(convencoes).toMatch(/\| FT-03 \|/)
  })
})

describe('saldo e resumo do mês no CONVENCOES.md (FT-04)', () => {
  const secao7 = convencoes.slice(convencoes.indexOf('## 7.'), convencoes.indexOf('## Conflitos'))
  const trecho = (titulo: string) => {
    const i = secao7.indexOf(`### ${titulo}`)
    const j = secao7.indexOf('\n### ', i + 5)
    return secao7.slice(i, j === -1 ? undefined : j)
  }

  it('cada citação nova do resumo aponta para a linha que contém o nome citado', () => {
    const esperado: Array<[string, number, RegExp]> = [
      ['src/servicos/resumo.ts', 37, /mesDaConsulta/],
      ['src/servicos/resumo.ts', 56, /resumoDoMes/],
      ['src/servicos/resumo.ts', 61, /exigirAdultoOuResponsavel/],
      ['src/servicos/resumo.ts', 66, /groupBy/],
      ['src/servicos/resumo.ts', 113, /saldoCentavos/],
      ['src/app/(sistema)/page.tsx', 34, /papelPodeLancar/],
      ['src/componentes/ResumoDoMes.tsx', 74, /data-saldo/],
      ['tests/resumo.test.ts', 45, /0,10 \+ 0,20/],
      ['tests/resumo.test.ts', 381, /não usa ponto flutuante/],
      ['tests/resumo-papeis.test.ts', 24, /todas as funções do serviço de resumo negam/],
      ['tests/resumo-tela.test.ts', 131, /saldo negativo sai com sinal/],
    ]
    for (const [arquivo, linha, padrao] of esperado) {
      expect(convencoes, `${arquivo}:${linha}`).toContain(`\`${arquivo}:${linha}\``)
      const conteudo = readFileSync(path.join(RAIZ, arquivo), 'utf8').split('\n')[linha - 1]
      expect(conteudo, `${arquivo}:${linha}`).toMatch(padrao)
    }
  })

  it('a regra de dinheiro diz onde o saldo é somado: no servidor, em inteiros, só do mês', () => {
    const dinheiro = trecho('Dinheiro')
    expect(dinheiro).toMatch(/saldo/)
    expect(dinheiro).toContain('groupBy')
    expect(dinheiro).toMatch(/nunca no cliente/)
    expect(dinheiro).toContain('PR-29')
  })

  it('a autorização diz que o resumo é por lista de permitidos e o painel não busca dado do filho', () => {
    const autorizacao = trecho('Autorização')
    expect(autorizacao).toContain('resumoDoMes')
    expect(autorizacao).toMatch(/painel/)
  })

  it('o histórico registra a revisão da FT-04', () => {
    expect(convencoes).toMatch(/\| FT-04 \|/)
  })
})

describe('o papel filho e os filhos no CONVENCOES.md (FT-05)', () => {
  const secao7 = convencoes.slice(convencoes.indexOf('## 7.'), convencoes.indexOf('## Conflitos'))
  const trecho = (titulo: string) => {
    const i = secao7.indexOf(`### ${titulo}`)
    const j = secao7.indexOf('\n### ', i + 5)
    return secao7.slice(i, j === -1 ? undefined : j)
  }

  it('cada citação nova dos filhos aponta para a linha que contém o nome citado', () => {
    const esperado: Array<[string, number, RegExp]> = [
      ['src/servicos/autenticacao.ts', 153, /exigirFilho/],
      ['src/app/sessao-servidor.ts', 54, /exigirUsuarioFilho/],
      ['src/servicos/filhos.ts', 47, /esquemaDoFilho/],
      ['src/servicos/filhos.ts', 120, /cadastrarFilho/],
      ['src/servicos/filhos.ts', 140, /registrarAtividade/],
      ['src/servicos/filhos.ts', 186, /registrarAtividade/],
      ['src/servicos/filhos.ts', 252, /registrarAtividade/],
      ['src/servicos/filhos.ts', 285, /registrarAtividade/],
      ['src/servicos/filhos.ts', 313, /minhaMesada/],
      ['src/servicos/usuarios.ts', 117, /alvo\.papel === 'filho'/],
      ['src/app/acoes.ts', 243, /registrarFilho/],
      ['prisma/schema.prisma', 93, /model Filho/],
      ['prisma/migrations/20261028170000_filhos/migration.sql', 2, /CREATE TABLE "filhos"/],
      ['src/lib/atividade.ts', 17, /filho\.cadastrado/],
      ['tests/papel-filho.test.ts', 52, /a tabela cobre/],
      ['tests/filhos-papeis.test.ts', 32, /todas as funções do serviço de filhos negam/],
      ['tests/filhos-login.test.ts', 220, /IDOR/],
      ['tests/filhos-mesada.test.ts', 204, /nada vaza a existência/],
      ['tests/filhos-acoes.test.ts', 122, /não grava nada por nenhuma ação sensível/],
      ['tests/filhos.test.ts', 259, /PR-02 no serviço de filhos/],
    ]
    for (const [arquivo, linha, padrao] of esperado) {
      expect(convencoes, `${arquivo}:${linha}`).toContain(`\`${arquivo}:${linha}\``)
      const conteudo = readFileSync(path.join(RAIZ, arquivo), 'utf8').split('\n')[linha - 1]
      expect(conteudo, `${arquivo}:${linha}`).toMatch(padrao)
    }
  })

  it('a autorização deixou de ser prescrita: o papel filho tem evidência, por lista de permitidos e sem id na página', () => {
    const autorizacao = trecho('Autorização')
    expect(autorizacao).not.toContain('decidido_pelo_buildx')
    for (const termo of ['`filho`', 'exigirFilho', 'minhaMesada', 'lista de permitidos', 'IDOR', 'PR-31']) {
      expect(autorizacao, termo).toContain(termo)
    }
    expect(autorizacao).toMatch(/não recebe id/)
  })

  it('os dados dizem que o filho tem tabela própria, valor em centavos e só os campos da PR-09', () => {
    const dados = trecho('Dados do domínio')
    expect(dados).toContain('Filho')
    expect(dados).toContain('PR-09')
    expect(dados).toMatch(/centavos/)
  })

  it('a auditoria cita as quatro ações dos filhos e diz o que nunca entra', () => {
    const auditoria = trecho('Auditoria')
    for (const acao of ['filho.cadastrado', 'filho.alterado', 'filho.login_criado', 'filho.login_desativado']) {
      expect(auditoria, acao).toContain(acao)
    }
    expect(auditoria).toMatch(/nunca o valor/)
    expect(auditoria).toMatch(/nascimento/)
  })

  it('o histórico registra a revisão da FT-05', () => {
    expect(convencoes).toMatch(/\| FT-05 \|/)
  })
})

describe('a mesada dos filhos no CONVENCOES.md (FT-06)', () => {
  const secao7 = convencoes.slice(convencoes.indexOf('## 7.'), convencoes.indexOf('## Conflitos'))
  const trecho = (titulo: string) => {
    const i = secao7.indexOf(`### ${titulo}`)
    const j = secao7.indexOf('\n### ', i + 5)
    return secao7.slice(i, j === -1 ? undefined : j)
  }

  it('cada citação nova da mesada aponta para a linha que contém o nome citado', () => {
    const esperado: Array<[string, number, RegExp]> = [
      ['prisma/schema.prisma', 117, /model MovimentoDeMesada/],
      ['prisma/schema.prisma', 121, /valorCentavos\s+Int/],
      ['prisma/schema.prisma', 127, /onDelete: Cascade/],
      ['prisma/migrations/20261028190000_mesada/migration.sql', 2, /CREATE TABLE "movimentos_de_mesada"/],
      ['prisma/migrations/20261028190000_mesada/migration.sql', 6, /"valorCentavos" INTEGER/],
      ['src/servicos/mesada.ts', 94, /totaisDoFilho/],
      ['src/servicos/mesada.ts', 95, /groupBy/],
      ['src/servicos/mesada.ts', 116, /registrarMovimento/],
      ['src/servicos/mesada.ts', 121, /exigirAdmin/],
      ['src/servicos/mesada.ts', 139, /registrarAtividade/],
      ['src/servicos/mesada.ts', 319, /meuExtrato/],
      ['src/servicos/mesada.ts', 323, /exigirFilho/],
      ['src/lib/atividade.ts', 21, /mesada\.registrada/],
      ['src/app/acoes.ts', 312, /registrarMovimentoDeMesada/],
      ['tests/mesada-dados.test.ts', 87, /Cascade/],
      ['tests/mesada-saldo.test.ts', 25, /0,10 \+ 0,20/],
      ['tests/mesada.test.ts', 353, /PR-02 no serviço de mesada/],
      ['tests/mesada-papeis.test.ts', 33, /todas as funções do serviço de mesada negam/],
      ['tests/mesada-isolamento.test.ts', 86, /IDOR/],
      ['tests/mesada-acoes.test.ts', 170, /não grava nada em nenhuma ação da mesada/],
      ['tests/mesada-rotas.test.ts', 161, /não vê nem alcança o irmão/],
    ]
    for (const [arquivo, linha, padrao] of esperado) {
      expect(convencoes, `${arquivo}:${linha}`).toContain(`\`${arquivo}:${linha}\``)
      const conteudo = readFileSync(path.join(RAIZ, arquivo), 'utf8').split('\n')[linha - 1]
      expect(conteudo, `${arquivo}:${linha}`).toMatch(padrao)
    }
  })

  it('a regra de dinheiro diz onde o saldo do filho é somado: no servidor, em inteiros, sem corte por data', () => {
    const dinheiro = trecho('Dinheiro')
    for (const termo of ['saldo do filho', 'groupBy', 'PR-32', 'negativo', 'nunca no cliente']) {
      expect(dinheiro, termo).toContain(termo)
    }
  })

  it('a autorização diz que só o responsável escreve, o adulto não vê e o filho lê sem id', () => {
    const autorizacao = trecho('Autorização')
    for (const termo of ['meuExtrato', 'exigirAdmin', 'PR-33', 'tests/mesada-papeis.test.ts']) {
      expect(autorizacao, termo).toContain(termo)
    }
    expect(autorizacao).toMatch(/adulto[^.]*não/)
  })

  it('os dados citam MovimentoDeMesada, o Cascade e a nota para a FT-07 exportar e apagar por filho', () => {
    const dados = trecho('Dados do domínio')
    for (const termo of ['MovimentoDeMesada', 'Cascade', 'FT-07', 'filhoId']) expect(dados, termo).toContain(termo)
  })

  it('a auditoria cita as três ações da mesada e diz que nunca entram valor, saldo nem descrição', () => {
    const auditoria = trecho('Auditoria')
    for (const acao of ['mesada.registrada', 'mesada.alterada', 'mesada.apagada']) {
      expect(auditoria, acao).toContain(acao)
    }
    expect(auditoria).toMatch(/nunca o valor, o saldo nem a descrição/)
  })

  it('o histórico registra a revisão da FT-06', () => {
    expect(convencoes).toMatch(/\| FT-06 \|/)
  })
})

describe('comandos do CONVENCOES.md', () => {
  const pacote = JSON.parse(readFileSync(path.join(RAIZ, 'package.json'), 'utf8')) as {
    scripts: Record<string, string>
  }

  it('todo npm run citado existe como script', () => {
    const citados = [...convencoes.matchAll(/`npm run ([\w:-]+)`/g)].map((m) => m[1] as string)
    expect(citados.length).toBeGreaterThan(4)
    const inexistentes = citados.filter((nome) => !(nome in pacote.scripts))
    expect(inexistentes).toEqual([])
  })

  it('as seis seções existem e o arquivo de lacunas acompanha', () => {
    for (let n = 1; n <= 6; n += 1) {
      expect(convencoes).toMatch(new RegExp(`^## ${n}\\. `, 'm'))
    }
    expect(existsSync(path.join(RAIZ, 'docs/stack/LACUNAS.md'))).toBe(true)
  })
})

describe('privacidade dos dados no CONVENCOES.md (FT-07)', () => {
  const secao7 = convencoes.slice(convencoes.indexOf('## 7.'), convencoes.indexOf('## Conflitos'))
  const trecho = (titulo: string) => {
    const i = secao7.indexOf(`### ${titulo}`)
    const j = secao7.indexOf('\n### ', i + 5)
    return secao7.slice(i, j === -1 ? undefined : j)
  }

  it('cada citação nova da privacidade aponta para a linha que contém o nome citado', () => {
    const esperado: Array<[string, number, RegExp]> = [
      ['src/servicos/privacidade.ts', 52, /exportarDadosDaFamilia/],
      ['src/servicos/privacidade.ts', 60, /usuario\.findMany/],
      ['src/servicos/privacidade.ts', 175, /anonimizarTrilha/],
      ['src/servicos/privacidade.ts', 228, /excluirFilho/],
      ['src/lib/privacidade.ts', 8, /VERSAO_DO_FORMATO/],
      ['src/lib/privacidade.ts', 26, /camposProibidosEm/],
      ['src/app/api/privacidade/exportar/route.ts', 11, /POST/],
      ['src/app/acoes.ts', 362, /excluirContaDoFilho/],
      ['src/servicos/autenticacao.ts', 161, /esquecerTentativasDeLogin/],
      ['src/lib/atividade.ts', 24, /familia\.exportada/],
      ['src/lib/atividade.ts', 25, /filho\.excluido/],
      ['src/componentes/ApagarFilho.tsx', 11, /ApagarFilho/],
      ['src/componentes/PainelDePrivacidade.tsx', 10, /PainelDePrivacidade/],
      ['tests/privacidade-exportacao.test.ts', 150, /campos proibidos/],
      ['tests/privacidade-banco.test.ts', 47, /varredura acha o filho/],
      ['tests/privacidade-exclusao.test.ts', 222, /token emitido antes/],
      ['tests/privacidade-papeis.test.ts', 27, /nega quem não é admin/],
      ['tests/privacidade-acoes.test.ts', 116, /não apaga nada/],
      ['tests/privacidade-rotas.test.ts', 183, /cookie emitido antes/],
      ['tests/mesada-dados.test.ts', 4, /Cascade/],
    ]
    for (const [arquivo, linha, padrao] of esperado) {
      expect(convencoes, `${arquivo}:${linha}`).toContain(`\`${arquivo}:${linha}\``)
      const conteudo = readFileSync(path.join(RAIZ, arquivo), 'utf8').split('\n')[linha - 1]
      expect(conteudo, `${arquivo}:${linha}`).toMatch(padrao)
    }
  })

  it('"Dados do domínio" fecha a nota para a FT-07: exporta e apaga por filho, anonimiza a trilha', () => {
    const dados = trecho('Dados do domínio')
    expect(dados).toMatch(/PR-09/)
    expect(dados).toMatch(/anonimiz/)
    expect(dados).toContain('versao_do_formato')
    expect(dados).not.toMatch(/a FT-07 decide se o apaga ou anonimiza/)
  })

  it('"Autorização" diz que só o responsável exporta e exclui, e que a rota é só POST', () => {
    const autorizacao = trecho('Autorização')
    expect(autorizacao).toContain('exportarDadosDaFamilia')
    expect(autorizacao).toContain('excluirFilho')
    expect(autorizacao).toMatch(/só POST/)
  })

  it('"Auditoria" cita as duas ações novas e diz que o rastro da exclusão não leva dado pessoal', () => {
    const auditoria = trecho('Auditoria')
    expect(auditoria).toContain('familia.exportada')
    expect(auditoria).toContain('filho.excluido')
    expect(auditoria).toMatch(/filho removido/)
  })

  it('o histórico registra a revisão da FT-07', () => {
    expect(convencoes).toMatch(/\| FT-07 \|/)
  })
})
