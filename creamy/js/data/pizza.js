// Pizza: 117 quadros recortados (fundo removido) de dois planos gerados no Higgsfield (Seedance 2.0, 1080p; quadros-chave
// em 4K nativo): bancada (1-56: massa, molho, muçarela, manjericão), fusão (57-61), forno (62-117), alinhados para a pizza
// ficar no mesmo lugar. A etapa do azeite (a garrafa entrava sem a mão) foi retirada. Ilustrativo.
// Caixa do quadro: 1080x1260 (hd) / 720x840 (sd). anchors: pontos da pizza (fração da caixa) para as linhas-guia.
export const PIZZA = {
  count: 117,
  dirs: { hd: 'assets/pizza/hd/', sd: 'assets/pizza/sd/', sdW: 720 },
  bands: [0.1, 0.58, 0.64, 0.9],          // fim do topo, fim da bancada, fim da fusão, pizza pronta (posição da rolagem)
  marks: [0.1, 0.18, 0.36, 0.6, 0.9],     // massa, molho, muçarela, forno, pronta
  anchors: { massa: [0.09, 0.66], molho: [0.44, 0.53], queijo: [0.63, 0.43], borda: [0.9, 0.62] }
};
