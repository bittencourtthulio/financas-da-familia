// Leitura dos formulários de lançamento e de categoria. Só copia os campos do
// FormData para o objeto que o serviço valida: o valor continua texto
// ("1.234,56") e a conversão para centavos é do serviço (PR-02). Fica fora de
// `acoes.ts` porque um arquivo 'use server' só exporta ações assíncronas.

const campo = (form: FormData, nome: string) => form.get(nome)

export function lerFormularioDeLancamento(form: FormData) {
  return {
    tipo: campo(form, 'tipo'),
    valor: campo(form, 'valor'),
    data: campo(form, 'data'),
    categoriaId: campo(form, 'categoriaId'),
    descricao: campo(form, 'descricao'),
  }
}

export function lerFormularioDeCategoria(form: FormData) {
  return {
    nome: campo(form, 'nome'),
    tipo: campo(form, 'tipo'),
  }
}
