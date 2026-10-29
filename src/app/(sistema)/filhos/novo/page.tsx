import { redirect } from 'next/navigation'
import { exigirUsuarioAdmin } from '@/app/sessao-servidor'

/** O cadastro de filho agora é da área Família. O papel é conferido antes de redirecionar. */
export default async function NovoFilho() {
  await exigirUsuarioAdmin()
  redirect('/familia/nova?tipo=filho')
}
