import { $, $$, clamp, reduceMotion } from './utils.js';
import { sequence } from './seqscroll.js';
import { POUR } from '../data/pour.js';

// Copo de chope enchendo com a rolagem. Mesmo motor da pizza (seqscroll.js, que parte do startFrames() do Chopp do Gus).
// Movimento reduzido: copo cheio parado (CSS). Economia de dados: 2 imagens-chave em fusão.
export function initPour() {
  const sec = $('#chope'); if (!sec || reduceMotion) return;
  const canvas = $('#pourCanvas'), steps = $$('.pstep', sec), keys = $$('.pour-key', sec);
  const conn = navigator.connection;
  const lite = !!conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''));
  const mode = !lite && canvas.getContext && 'createImageBitmap' in window ? 'seq' : 'keys';
  sec.classList.add('is-live', `mode-${mode}`);

  let step = -1;
  const ui = p => {
    const s = POUR.marks.reduce((acc, m, i) => (p >= m ? i : acc), 0);
    if (s !== step) { step = s; steps.forEach((el, i) => el.classList.toggle('is-on', i === s)); }
  };
  if (mode === 'seq') {
    sequence({ sec, canvas, count: POUR.count, dirs: POUR.dirs, map: p => clamp((p - 0.03) / 0.9, 0, 1), onProgress: ui, fade: 1, focusY: 0.55 });
  } else {
    let top = 0, len = 1, queued = false;
    const measure = () => { top = sec.getBoundingClientRect().top + scrollY; len = Math.max(sec.offsetHeight - innerHeight, 1); };
    const frame = () => { queued = false; const p = clamp((scrollY - top) / len, 0, 1); ui(p); keys[1].style.opacity = clamp((p - 0.35) / 0.4, 0, 1).toFixed(3); };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener('resize', () => { measure(); frame(); });
    new ResizeObserver(() => { measure(); frame(); }).observe(document.body);
    measure(); frame();
  }
}
