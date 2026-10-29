import { redirect } from 'next/navigation'

/** As categorias agora se escolhem, criam e apagam no campo do lançamento. */
export default function Categorias() {
  redirect('/lancamentos/novo')
}
