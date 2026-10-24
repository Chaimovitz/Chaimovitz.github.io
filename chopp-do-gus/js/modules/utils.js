const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const readyHolds = [];
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const pointer = { x: 0.5, y: 0.5, active: false };
addEventListener("pointermove", (e) => {
  pointer.x = e.clientX / innerWidth;
  pointer.y = e.clientY / innerHeight;
  pointer.active = e.pointerType === "mouse";
}, { passive: true });
export {
  $,
  $$,
  clamp,
  finePointer,
  lerp,
  pointer,
  rand,
  readyHolds,
  reduceMotion
};
