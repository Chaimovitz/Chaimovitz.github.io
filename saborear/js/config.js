// Tudo que muda de um cliente para outro fica aqui. null = a confirmar (o site mostra "a confirmar").
export const CONFIG = {
  brand: 'Saborear',
  timezone: 'America/Sao_Paulo',
  whatsapp: null,        // A CONFIRMAR: só números com DDI, ex. '5548999999999'. null abre o WhatsApp sem destinatário.
  instagram: 'saboreararmacao', // confirmado pelo Thomas (09/11/2026)
  address: null,         // A CONFIRMAR: endereço completo
  mapQuery: null,        // A CONFIRMAR: o que buscar no Google Maps (ex. 'Saborear, Rua X, 123, Cidade')
  city: null,            // A CONFIRMAR: nome da cidade, para "pôr do sol hoje em ..."
  lat: null, lng: null,  // A CONFIRMAR: coordenadas; ligam o horário do pôr do sol de hoje
  // A CONFIRMAR: horário. Uma linha por grupo de dias; null aparece como "a confirmar".
  hours: [
    ['Segunda a sexta', null],
    ['Sábado', null],
    ['Domingo e feriados', null]
  ]
};
