// Chope: 96 quadros recortados (fundo removido) de um vídeo gerado no Higgsfield (Seedance 2.0, 1080p; quadros-chave
// em 4K nativo): ilustrativo. A torneira é a mesma em todos os quadros. Caixa: 495x1713 (hd) / 330x1142 (sd).
// level: altura do topo do líquido/espuma em cada quadro, medida nos próprios quadros (px da caixa hd).
export const POUR = {
  count: 96,
  dirs: { hd: 'assets/chope/hd/', sd: 'assets/chope/sd/' },
  box: [495, 1713],
  rim: 510, bottom: 1666,
  level: [1495, 1480, 1466, 1451, 1437, 1422, 1408, 1393, 1379, 1364, 1350, 1335, 1321, 1306, 1292, 1278, 1269, 1252, 1242, 1233, 1223, 1202, 1193, 1182, 1171, 1149, 1138, 1126, 1114, 1093, 1081, 1070, 1059, 1036, 1025, 1013, 991, 980, 970, 959, 933, 921, 908, 897, 872, 861, 848, 835, 813, 799, 785, 772, 748, 735, 723, 712, 686, 675, 663, 651, 630, 619, 608, 585, 575, 564, 555, 536, 512, 512, 507, 492, 485, 481, 478, 476, 475, 475, 474, 474, 474, 474, 474, 474, 474, 474, 474, 474, 474, 474, 474, 474, 474, 474, 474, 474],
  marks: [0, 0.3, 0.72]
};
