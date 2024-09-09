export const enum ErrorMessages {
  insufficient_balance = 'Sem dinheiro suficiente',
  already_cancelled_booking = 'A marcação já foi cancelada',
  unable_to_delete_booking = 'Sem permissão para deletar o serviço',
  must_be_a_service_provider = 'Apenas prestadores de serviço podem criar serviçoso',
  service_already_exists = 'Serviço já existente',
  must_be_a_client = 'Apenas clientes podem criar marcar um serviço',
  cannot_book_past_date = 'Impossivel marcar um serviço com uma data já passada',
  must_be_the_booking_owner = 'Impossivel pegar serviço alheio',
  only_owner_can_cancel = 'Sem permissão para cancelar a marcação',
  resource_not_found = 'recurso não encontrado',
  user_already_exists = 'Usuário já existente',
  must_be_balance_owner = 'Apenas o proprietario da conta pode alterar o balanco',
}
