import { redirect } from 'next/navigation'

/** Os usuários agora vivem na área Família. */
export default function Usuarios() {
  redirect('/familia/nova?tipo=adulto')
}
