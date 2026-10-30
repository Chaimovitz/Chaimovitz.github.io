// Tudo que muda de um cliente para outro fica aqui.
export const CONFIG = {
  brand: 'Creamy',
  timezone: 'America/Sao_Paulo',
  weekdayNames: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  // A CONFIRMAR com o Lucas: veio da bio do Instagram ("18:01 às 01:37", terça a domingo).
  // openDays = dia em que a noite COMEÇA (0 = domingo). A madrugada de segunda 00:00–01:37 pertence ao domingo.
  openDays: [0, 2, 3, 4, 5, 6],
  opensAt: '18:01',
  closesAt: '01:37',
  whatsapp: '5548988643364'
};
