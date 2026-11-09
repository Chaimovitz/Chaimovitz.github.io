// Tudo que muda de um cliente para outro fica aqui. null = a confirmar (o site mostra "a confirmar").
export const CONFIG = {
  brand: 'Saborear',
  timezone: 'America/Sao_Paulo',
  whatsapp: null,        // A CONFIRMAR: só números com DDI, ex. '5548999999999'. null abre o WhatsApp sem destinatário.
  instagram: 'saboreararmacao', // confirmado pelo Thomas (09/11/2026)
  address: null,         // A CONFIRMAR: endereço completo
  mapQuery: 'Saborear Praia da Armação Florianópolis', // busca no Google Maps (o botão abre a busca, não um endereço confirmado)
  mapEmbed: false,       // true troca a foto da fachada pelo mapa embutido (ligar quando o endereço for confirmado)
  // A CONFIRMAR: horário. Uma linha por grupo de dias; null aparece como "a confirmar".
  hours: [
    ['Segunda a sexta', null],
    ['Sábado', null],
    ['Domingo e feriados', null]
  ]
};
