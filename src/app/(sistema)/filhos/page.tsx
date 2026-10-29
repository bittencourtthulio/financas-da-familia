import { redirect } from 'next/navigation'
import { exigirUsuarioAdmin } from '@/app/sessao-servidor'

/** Os filhos agora vivem na área Família. O papel é conferido antes de redirecionar. */
export default async function Filhos() {
  await exigirUsuarioAdmin()
  redirect('/familia')
}
