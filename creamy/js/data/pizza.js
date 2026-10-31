// Pizza: 94 quadros recortados (fundo removido) de dois planos gerados no Higgsfield (Seedance 2.0, 1080p; quadros-chave
// em 4K nativo). Só estados reais SEM mãos nem utensílios: massa (1-2), molho se espalhando do centro para a borda
// (3-14, revelado sobre a massa), molho (15), muçarela e manjericão por fusão (16-33), fusão para o forno (34-38) e forno
// (39-94). As mãos e a concha saíram porque apareciam cortadas pela borda superior. Ilustrativo.
// Caixa do quadro: 1080x1260 (hd) / 720x840 (sd). anchors: pontos da pizza (fração da caixa) para as linhas-guia.
export const PIZZA = {
  count: 94,
  dirs: { hd: 'assets/pizza/hd/', sd: 'assets/pizza/sd/', sdW: 720 },
  bands: [0.085, 0.58, 0.64, 0.9],          // fim do topo, fim da bancada, fim da fusão, pizza pronta (posição da rolagem)
  marks: [0.07, 0.11, 0.33, 0.6, 0.9],     // massa, molho, muçarela, forno, pronta
  anchors: { massa: [0.09, 0.66], molho: [0.44, 0.53], queijo: [0.63, 0.43], borda: [0.9, 0.62] }
};
