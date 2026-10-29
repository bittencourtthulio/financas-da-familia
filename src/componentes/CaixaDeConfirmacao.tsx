import { Cachorro } from '@/componentes/ilustracoes/Familia'

/**
 * A moldura de toda confirmação que não tem volta: surge com uma mola, o
 * cachorro da família fica preocupado e o texto diz o que vai acontecer. A
 * lógica (o que apaga, o que confere) continua em quem usa a caixa; aqui é só
 * a apresentação, e o servidor confere tudo de novo.
 */
export function CaixaDeConfirmacao({
  children,
  tom = 'perigo',
}: {
  children: React.ReactNode
  tom?: 'perigo' | 'atencao'
}) {
  return (
    <div className={`caixa-de-confirmacao tom-${tom}`} role="group">
      <div className="caixa-de-confirmacao-ilustracao">
        <Cachorro humor="preocupado" />
      </div>
      <div className="caixa-de-confirmacao-corpo">{children}</div>
    </div>
  )
}
