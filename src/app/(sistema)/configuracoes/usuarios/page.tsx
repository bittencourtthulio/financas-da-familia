import { redirect } from 'next/navigation'
import { exigirUsuarioAdmin } from '@/app/sessao-servidor'

/** Os usuários agora vivem na área Família. O papel é conferido antes de redirecionar. */
export default async function Usuarios() {
  await exigirUsuarioAdmin()
  redirect('/familia/nova?tipo=adulto')
}
