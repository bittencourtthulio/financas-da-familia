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
        {/* Aplica o tema antes da primeira pintura, para não piscar: claro, a menos que a pessoa tenha escolhido o escuro. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('tema');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
