import { $, $$, clamp, reduceMotion } from './utils.js';
import { sequence } from './seqscroll.js';

// "Do forno pra mesa": a pizza sendo montada na bancada e assando no forno, presa à rolagem.
// 129 quadros de dois planos gerados no Higgsfield (Seedance 2.0, 1080p, quadros-chave em 4K nativo), unidos por uma
// fusão curta: bancada (molho, muçarela, manjericão) -> forno (borda cresce, queijo derrete). Motor em seqscroll.js.
// Modos: "seq" (canvas), "keys" (2 imagens em fusão: economia de dados/2G) e estático (movimento reduzido ou sem JS).
const N = 129;
// segura um instante no primeiro e no último quadro (a pizza pronta assenta antes de a seção soltar)
const map = p => clamp((p - 0.03) / 0.9, 0, 1);
const MARKS = [0, 0.27, 0.5, 0.9];            // molho, queijo, forno, pronta (posição da rolagem)

export function initBuild() {
  const sec = $('#montagem'); if (!sec || reduceMotion) return;
  const cv = $('#buildCanvas'), steps = $$('.bstep', sec), keys = $$('.bkey', sec), bar = $('#buildBar');
  const conn = navigator.connection;
  const lite = !!conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''));
  const mode = !lite && cv.getContext && 'createImageBitmap' in window ? 'seq' : 'keys';
  sec.classList.add('is-live', `mode-${mode}`);

  // só propriedades de compositor (transform/opacity) por quadro
  let step = -1;
  const ui = p => {
    const s = MARKS.reduce((acc, m, i) => (p >= m ? i : acc), 0);
    if (s !== step) { step = s; steps.forEach((el, i) => el.classList.toggle('is-on', i === s)); }
    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    sec.classList.toggle('is-done', p > 0.95);
  };

  if (mode === 'seq') {
    sequence({ sec, canvas: cv, count: N, dirs: { hd: 'assets/seq/hd/', sd: 'assets/seq/sd/' }, map, onProgress: ui, fade: 1, focusY: 0.62 });
  } else {
    let top = 0, len = 1, queued = false;
    const measure = () => { top = sec.getBoundingClientRect().top + scrollY; len = Math.max(sec.offsetHeight - innerHeight, 1); };
    const frame = () => { queued = false; const p = clamp((scrollY - top) / len, 0, 1); ui(p); keys[1].style.opacity = clamp((p - 0.45) / 0.35, 0, 1).toFixed(3); };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener('resize', () => { measure(); frame(); });
    new ResizeObserver(() => { measure(); frame(); }).observe(document.body);
    measure(); frame();
  }
}
