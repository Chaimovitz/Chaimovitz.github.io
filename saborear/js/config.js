// Tudo que muda de um cliente para outro fica aqui. null = a confirmar (o site mostra "a confirmar").
export const CONFIG = {
  brand: 'Saborear',
  timezone: 'America/Sao_Paulo',
  whatsapp: '5548984063478', // A CONFIRMAR: número da dona passado pelo Thomas em 09/11/2026 ("se não me engano")
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
