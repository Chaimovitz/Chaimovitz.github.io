import { reduceMotion } from './utils.js';
import Lenis from '../../assets/vendor/lenis-1.3.26.mjs';

// Rolagem suave da roda do mouse (o mesmo fluxo da Fervo, sites/drink/ui.js): o Lenis suaviza a PÁGINA, e as cenas leem
// o scroll direto, então cena e página andam juntas — sem a cena perseguir nada. Sem isso, cada "clique" da roda pulava
// 100 px de uma vez, ou seja, 2 a 3 quadros da pizza num único quadro de tela: era o degrau que se via ao rolar.
// Toque (celular) continua nativo. Movimento reduzido: sem Lenis.
export function initSmooth() {
  if (reduceMotion) return;
  const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, anchors: { offset: -72 } });
  window.__lenis = lenis;                       // usado pelos scripts de QA para saltar entre cenas
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
