import type { Metadata } from 'next'
import '../estilos/global.css'
import { NOME_DO_SISTEMA, DESCRICAO_DO_SISTEMA } from '@/lib/marca'

export const metadata: Metadata = {
  title: NOME_DO_SISTEMA,
  description: DESCRICAO_DO_SISTEMA,
}

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Aplica o tema salvo antes da primeira pintura, para não piscar. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('tema');if(t)document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
