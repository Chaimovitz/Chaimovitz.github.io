// A carta da casa, transcrita do PDF oficial da unidade Santa Mônica (abril de 2026),
// berebirra.com.br/wp-content/uploads/2026/04/CARTA-BERE-BIRRA-STA-MONICA-.docx-2_compressed.pdf
// Sem preços. Nomes e ingredientes como estão na carta (inclusive a grafia "mussarela"); só a caixa foi ajustada.
// forno = o que vai ao forno; pos = o que a carta marca como "pós forno".
export const PIZZAS = {
  tradicionais: [
    { nome: 'Mussarela', forno: ['molho de tomate', 'mussarela', 'orégano'] },
    { nome: 'Calabresa Paulista', forno: ['molho de tomate', 'calabresa', 'cebola', 'azeitonas pretas', 'orégano'] },
    { nome: 'Rúcula', forno: ['molho de tomate', 'mussarela', 'tomate confit'], pos: ['rúcula', 'orégano'] },
    { nome: 'Alho e Óleo', forno: ['molho de tomate', 'mussarela', 'alho confit', 'orégano'] },
    { nome: 'Shimeji Vegana', forno: ['molho de tomate', 'shimeji', 'pupunha', 'cebola caramelizada', 'orégano'] },
    { nome: 'Caprese Vegana', forno: ['molho de tomate', 'mussarela vegana O.V.N.I.', 'tomate confit', 'manjericão', 'pesto de azeitonas', 'orégano'] },
    { nome: 'Portuga', forno: ['molho de tomate', 'mussarela', 'presunto', 'cebola', 'ovos', 'azeitonas pretas', 'orégano'] },
    { nome: 'Caprese', forno: ['molho de tomate', 'mussarela', 'tomate'], pos: ['mussarela de búfala', 'manjericão', 'pesto de azeitonas', 'orégano'] },
    { nome: 'Linguiça Blumenau', forno: ['molho de tomate', 'mussarela', 'linguiça Blumenau'], pos: ['mostarda escura', 'pesto de rúcula', 'orégano'] },
    { nome: 'Peito de Peru com Catupiry', forno: ['molho de tomate', 'peito de peru', 'catupiry', 'alho poró', 'orégano'] },
    { nome: 'Calabresa com Queijo', forno: ['molho de tomate', 'mussarela', 'calabresa', 'cebola', 'azeitonas pretas', 'orégano'] }
  ],
  autorais: [
    { nome: 'Marguerita Especial', chef: 'Chef Bruno Goularte', forno: ['molho de tomate', 'mussarela', 'mussarela de búfala', 'tomate em pétalas', 'pesto de manjericão', 'orégano'] },
    { nome: 'Spinaaaaci', forno: ['molho de tomate', 'mussarela', 'parmesão', 'alho', 'espinafre', 'ricota de búfala', 'orégano'] },
    { nome: 'Olívia', forno: ['molho de tomate', 'mussarela', 'catupiry'], pos: ['cubinhos de lombinho defumado da quinta', 'teriyaki', 'gergelim'] },
    { nome: 'Quase uma Boscaiola', forno: ['molho de tomate', 'mussarela', 'linguiça Blumenau', 'shimeji', 'cebola roxa', 'orégano'] },
    { nome: 'Bianca', forno: ['mussarela', 'gorgonzola'], pos: ['mel', 'noz pecan'] },
    { nome: 'Quatro Queijos', forno: ['molho de tomate', 'mussarela', 'catupiry', 'parmesão', 'gorgonzola', 'manjericão', 'orégano'] },
    { nome: 'Brie com Jamón', forno: ['molho de tomate', 'queijo brie'], pos: ['finas lâminas de jamón', 'pesto de rúcula', 'orégano'] },
    { nome: 'Carbonara', forno: ['molho de tomate', 'mussarela'], pos: ['guanciale', 'ovo perfeito', 'parmesão', 'orégano'] },
    { nome: 'Jamón Crispy', forno: ['molho de tomate', 'mussarela', 'tomate'], pos: ['cubos de jamón crispy', 'parmesão', 'orégano'] },
    { nome: 'Copa Crispy', forno: ['molho de tomate', 'mussarela', 'tomate'], pos: ['fonduta de brie', 'copa crispy da quinta', 'pimenta rosa'] },
    { nome: 'Nduja', chef: 'Chef Renato Carioni', forno: ['molho de tomate', 'mussarela', 'nduja'], pos: ['crème fraîche', 'ervas frescas', 'raspas de siciliano'] }
  ]
};

// Entradas e sobremesas, também transcritas da carta (sem preços).
export const ENTRADAS = {
  maos: [
    { nome: 'Corniccione Rosso', desc: 'Massa fininha, molho de tomate, alho, parmesão e orégano.' },
    { nome: 'Corniccione Bianco', desc: 'Massa fininha, alecrim e sal rosa.' },
    { nome: 'Corniccione Brie com Geleia de Pimenta', desc: 'Queijo brie e a geleia de pimenta da casa.' },
    { nome: 'Corniccione Gorgonzola e Mel', desc: 'Queijo gorgonzola e mel.' },
    { nome: 'Panini Brie com Jamón', desc: 'Massa aberta no rolo, queijo brie e presunto Parma. Na carta: “entradinha com 23 g de proteína”.' },
    { nome: 'Brusqueta Quase Tradicional', desc: 'Pão integral da casa, de longa fermentação, mussarela de búfala, tomate cereja, parmesão e pesto de manjericão.' }
  ],
  garfo: [
    { nome: 'Carpaccio Tradicional', desc: 'Finas lâminas de carne, molho de alcaparras com mostarda e mel, parmesão e rúcula.' },
    { nome: 'Burrata', nota: 'sob consulta', desc: 'Envolta numa fina massa de pizza, vai ao forno a lenha na panela de ferro, com molho da casa, tomate confit, alho confit e pesto de azeitonas.', pergunta: 'Oi, Bere Birra! Vi a burrata na carta do site. Tem hoje?' }
  ]
};
export const SOBREMESAS = [
  { nome: 'Bombinha de Nutella ou doce de leite' },
  { nome: 'Sobremesa da noite', desc: 'Consulte o primeiro que passar por você e reserve a sua.' }
];

// Partes da carta, na ordem usada na prévia E (a ordem da carta impressa).
// tipo define o objeto que vai à mesa: tabua (pizza), prato (entrada), pires (sobremesa).
export const PARTES = [
  { id: 'maos', nome: 'Com as mãos', tipo: 'prato', itens: ENTRADAS.maos,
    foto: 'assets/img/maos.webp', alt: 'Fatia de pizza da Bere Birra sendo puxada, com o queijo esticando', intro: 'Para começar dividindo.' },
  { id: 'garfo', nome: 'Garfo e faca', tipo: 'prato', itens: ENTRADAS.garfo,
    foto: 'assets/img/maos.webp', alt: '', intro: 'Ainda entradas, para comer com talher.' },
  { id: 'sobremesas', nome: 'Ué!? A sobremesa', tipo: 'pires', itens: SOBREMESAS,
    foto: 'assets/img/sobremesa.webp', alt: 'Uma sobremesa da casa, servida na Bere Birra', intro: 'Na carta, vem antes da pizza: “para vcs já irem planejando esse final feliz”.' },
  { id: 'tradicionais', nome: 'Tradicionais ou quase', tipo: 'tabua', itens: PIZZAS.tradicionais,
    foto: 'assets/img/pizza-tradicional.webp', alt: 'Pizza inteira da Bere Birra, vista de cima', intro: 'As clássicas, do jeito da casa.' },
  { id: 'autorais', nome: 'Só tem aqui', tipo: 'tabua', itens: PIZZAS.autorais,
    foto: 'assets/img/pizza-bufala.webp', alt: 'Pizza da Bere Birra com mussarela de búfala', intro: 'As autorais. Muitas recebem o toque final depois do forno.' }
];
