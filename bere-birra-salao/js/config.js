// Dados das duas casas. Fonte: site oficial berebirra.com.br (lido em 05/11/2026).
// Pendências (6812 x 7604, horários, se o mesmo WhatsApp atende as duas casas) ficam em NOTA-INTERNA.md.
export const CONFIG = {
  instagram: 'bere_birra_forneria',
  cartaCompleta: 'https://berebirra.com.br/cardapio/',
  casas: {
    rv: {
      nome: 'Rio Vermelho',
      // Mesmo número nas duas casas até a casa confirmar. Troque aqui se cada casa tiver o seu.
      whatsapp: '5548984061242',
      endereco: 'Rod. João Gualberto Soares, 6812',   // publicado no site oficial; alguns diretórios mostram 7604
      bairro: 'Rio Vermelho, Florianópolis',
      linha: 'A casa nasceu no Rio Vermelho em 2020, numa casinha açoriana. Hoje, num casarão histórico.',
      foto: 'assets/img/casa-rv.webp',
      alt: 'Fachada do casarão da Bere Birra no Rio Vermelho, à noite, com a varanda acesa'
    },
    sm: {
      nome: 'Santa Mônica',
      whatsapp: '5548984061242',
      endereco: 'R. Esaú Pereira da Silva, 160',
      bairro: 'Santa Mônica, Florianópolis',
      linha: 'A casa nova, com a mesma essência.',
      foto: 'assets/img/casa-sm.webp',
      alt: 'Fachada da Bere Birra em Santa Mônica, à noite, com o letreiro da casa aceso'
    }
  },
  // Pontos de medição. Desligado: nada sai do navegador. Ligado, cada evento vira um
  // CustomEvent "bb:evento" no window e, se existir, um push em window.dataLayer.
  // Eventos: prato_selecionado, prato_removido, casa_escolhida, whatsapp_clique.
  analytics: { ativo: false }
};
