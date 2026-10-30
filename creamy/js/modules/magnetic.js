import { $$, reduceMotion, finePointer } from './utils.js';

// Botões que "puxam" em direção ao cursor (e o rótulo anda um pouco mais que o botão).
export function initMagnetic() {
  if (reduceMotion || !finePointer) return;
  const els = $$('[data-magnetic]');
  addEventListener('pointermove', e => {
    for (const el of els) {
      const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) continue;
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < Math.max(r.width, r.height) * 0.85;
      el.style.setProperty('--tx', near ? (dx * 0.22).toFixed(1) + 'px' : '0px');
      el.style.setProperty('--ty', near ? (dy * 0.3).toFixed(1) + 'px' : '0px');
    }
  }, { passive: true });
}
