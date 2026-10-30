export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a, b) => a + Math.random() * (b - a);
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
// promessas que a entrada do hero deve esperar (ver ready.js)
export const readyHolds = [];
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
// posição do ponteiro compartilhada (0..1), atualizada uma vez só
export const pointer = { x: 0.5, y: 0.5, active: false };
addEventListener('pointermove', e => {
  pointer.x = e.clientX / innerWidth; pointer.y = e.clientY / innerHeight; pointer.active = e.pointerType === 'mouse';
}, { passive: true });
