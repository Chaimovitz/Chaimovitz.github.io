import { reduceMotion } from './utils.js';
import Lenis from '../../assets/vendor/lenis-1.3.26.mjs';

// Rolagem suave da roda do mouse (o mesmo fluxo da Fervo, sites/drink/ui.js): o Lenis suaviza a PÁGINA, e as cenas leem
// o scroll direto, então cena e página andam juntas — sem a cena perseguir nada. Sem isso, cada "clique" da roda pulava
// 100 px de uma vez, ou seja, 2 a 3 quadros da pizza num único quadro de tela: era o degrau que se via ao rolar.
// Toque (celular) continua nativo: sem Lenis. Movimento reduzido: sem Lenis.
export function initSmooth() {
  // toque (celular/tablet): rolagem nativa, sem Lenis (ele só suaviza a roda do mouse; no toque seria um laço a mais por quadro)
  if (reduceMotion || matchMedia('(pointer: coarse)').matches) return;
  const lenis = new Lenis({ lerp: 0.2, smoothWheel: true, anchors: { offset: -72 } });
  window.__lenis = lenis;                       // usado pelos scripts de QA para saltar entre cenas
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
