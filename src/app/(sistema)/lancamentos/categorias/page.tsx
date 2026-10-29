import { redirect } from 'next/navigation'
import { exigirUsuarioDeLancamentos } from '@/app/sessao-servidor'

/** As categorias agora se escolhem, criam e apagam no campo do lançamento. */
export default async function Categorias() {
  await exigirUsuarioDeLancamentos()
  redirect('/lancamentos/novo')
}
