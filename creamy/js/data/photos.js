// Fotos do topo. Ordem de tentativa: foto REAL da Creamy -> imagem de IA (com aviso "imagem ilustrativa · gerada por IA").
// Para trocar: salve o arquivo em assets/img/ (prints/arquivos do @usecreamy, autorizados pela casa) e ponha o caminho em `real`,
// ex.: real: 'assets/img/pizza.jpg'. Vazio = ainda sem foto real (evita um 404 e atraso a cada visita).
export const PHOTOS = {
  pizza: { real: '', ai: 'assets/img/ia/montagem-3-pronta.jpg' },   // vertical
  chope: { real: '', ai: 'assets/img/ia/chope-2-cheio.jpg' }        // vertical
};
