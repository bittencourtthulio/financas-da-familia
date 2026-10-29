import { redirect } from 'next/navigation'

/** O cadastro de filho agora é da área Família. */
export default function NovoFilho() {
  redirect('/familia/nova?tipo=filho')
}
