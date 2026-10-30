import { $, $$, clamp, reduceMotion } from './utils.js';
import { sequence } from './seqscroll.js';

// "Do forno pra mesa": a pizza se monta conforme a rolagem (96 quadros estabilizados de um vídeo gerado no Higgsfield).
// Motor em seqscroll.js (o mesmo do chope). Modos: "seq" (canvas), "keys" (2 imagens-chave em fusão, economia de dados/2G)
// e estático (movimento reduzido ou sem JS: só a pizza pronta e os passos em lista, pelo CSS).
const N = 96;
// tempo do vídeo × rolagem: os 32 primeiros quadros (camadas quase paradas) ocupam só o começo;
// os últimos (pizza pronta, parada) seguram o quadro final estável
const HOLD = 0.16;
const map = p => (p < HOLD ? (p / HOLD) * (31 / 95) : 31 / 95 + ((p - HOLD) / (1 - HOLD)) * (64 / 95));
const MARKS = [0, HOLD, 0.6, 0.82];          // camadas, assenta, forno, pronta
const ease = t => t * t * (3 - 2 * t);

export function initBuild() {
  const sec = $('#montagem'); if (!sec || reduceMotion) return;
  const cv = $('#buildCanvas'), steps = $$('.bstep', sec), keys = $$('.bkey', sec), bar = $('#buildBar'), heat = $('.build-heat', sec);
  const conn = navigator.connection;
  const lite = !!conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''));
  const mode = !lite && cv.getContext && 'createImageBitmap' in window ? 'seq' : 'keys';
  sec.classList.add('is-live', `mode-${mode}`);

  // só propriedades de compositor (transform/opacity) por quadro: nada de variáveis CSS que recalculam estilo
  let step = -1;
  const ui = p => {
    const s = MARKS.reduce((acc, m, i) => (p >= m ? i : acc), 0);
    if (s !== step) { step = s; steps.forEach((el, i) => el.classList.toggle('is-on', i === s)); }
    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    if (heat) heat.style.opacity = (clamp((p - 0.55) / 0.2, 0, 1) * (1 - clamp((p - 0.88) / 0.12, 0, 1) * 0.6)).toFixed(3);
    sec.classList.toggle('is-done', p > 0.97);
  };

  if (mode === 'seq') {
    const dir = matchMedia('(max-width: 1023px)').matches ? 'assets/seq/mobile/' : 'assets/seq/desktop/';
    sequence({ sec, canvas: cv, count: N, dir, map, onProgress: ui, fade: 0.6, focusY: 0.66 });
  } else {
    let top = 0, len = 1, queued = false;
    const measure = () => { top = sec.getBoundingClientRect().top + scrollY; len = Math.max(sec.offsetHeight - innerHeight, 1); };
    const frame = () => { queued = false; const p = clamp((scrollY - top) / len, 0, 1); ui(p); keys[1].style.opacity = ease(clamp((p - 0.5) / 0.3, 0, 1)).toFixed(3); };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener('resize', () => { measure(); frame(); });
    new ResizeObserver(() => { measure(); frame(); }).observe(document.body);
    measure(); frame();
  }
}
