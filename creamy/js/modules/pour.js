import { $, $$, clamp, reduceMotion } from './utils.js';
import { sequence } from './seqscroll.js';
import { POUR } from '../data/pour.js';

// Chope: o copo é um objeto da página. A torneira desce da borda superior da tela, o copo pousa no creme e a rolagem
// enche (e esvazia, ao subir). Uma régua ao lado acompanha o nível REAL do líquido em cada quadro (POUR.level, medido
// nos quadros), e os textos sobem com ele até o colarinho. Motor dos quadros: seqscroll.js.
const map = p => clamp((p - 0.04) / 0.86, 0, 1);

export function initPour() {
  const sec = $('#chope'); if (!sec || reduceMotion) return;
  const canvas = $('#pourCanvas'), obj = $('.pour-obj', sec), copy = $('.pour-copy', sec), steps = $$('.pstep', sec), keys = $$('.pour-key', sec);
  const list = $('.pour-steps', sec), fill = $('.pg-fill', sec), mark = $('.pg-mark', sec), glow = $('.pour-glow', sec);
  const conn = navigator.connection;
  const lite = !!conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''));
  const mode = !lite && canvas.getContext && 'createImageBitmap' in window ? 'seq' : 'keys';
  sec.classList.add('is-live', `mode-${mode}`);

  const [BW, BH] = POUR.box, L = POUR.level, low = L[0], high = Math.min(...L), N = POUR.count;
  let H = 0;                                        // altura do objeto (px): a escala do copo
  const layout = () => {
    const mobile = matchMedia('(max-width: 1023px)').matches, vh = innerHeight;
    H = Math.round(vh * (mobile ? 0.8 : 0.93));   // fundo do copo a ~78% / 90% da tela; a torneira nasce no topo
    const px = mobile ? 27 : 40, glassW = H * (BW / BH) * 0.9;
    sec.style.setProperty('--oh', `${H}px`);
    sec.style.setProperty('--px', `${px}%`);
    sec.style.setProperty('--gx', `${Math.round(glassW / 2 + (mobile ? 14 : 70))}px`);
    sec.style.setProperty('--g-top', `${Math.round((high / BH) * H)}px`);
    sec.style.setProperty('--g-h', `${Math.round(((low - high) / BH) * H)}px`);
    sec.style.setProperty('--sb', `${(((BH - POUR.bottom) / BH) * 100 - 3).toFixed(2)}%`);
  };

  let step = -1;
  const ui = p => {
    const f = map(p) * (N - 1), a = Math.floor(f), t = f - a;
    const y = L[a] + ((L[Math.min(a + 1, N - 1)] - L[a]) * t);           // nível real do quadro mostrado
    const k = clamp((low - y) / (low - high), 0, 1), sy = (y / BH) * H;
    fill.style.transform = `scaleY(${k.toFixed(4)})`;
    mark.style.transform = `translateY(${(sy - (high / BH) * H).toFixed(1)}px)`;
    list.style.transform = `translateY(${sy.toFixed(1)}px)`;           // o texto sobe junto com o chope
    const s = POUR.marks.reduce((acc, m, i) => (k >= m ? i : acc), 0);
    if (s !== step) { step = s; steps.forEach((el, i) => el.classList.toggle('is-on', i === s)); }
    glow.style.opacity = (0.3 + 0.45 * k).toFixed(3);                    // o dourado do chope aquece o fundo
    sec.classList.toggle('is-done', k > 0.98);
    if (mode === 'keys') keys[1].style.opacity = clamp((p - 0.35) / 0.4, 0, 1).toFixed(3);
  };

  addEventListener('resize', layout);
  layout();
  if (mode === 'seq') {
    sequence({ sec, canvas, count: N, dirs: POUR.dirs, map, onProgress: ui, fade: 1, alpha: true });
  } else {
    let top = 0, len = 1, queued = false;
    const measure = () => { top = sec.getBoundingClientRect().top + scrollY; len = Math.max(sec.offsetHeight - innerHeight, 1); };
    const frame = () => { queued = false; ui(clamp((scrollY - top) / len, 0, 1)); };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener('resize', () => { measure(); frame(); });
    new ResizeObserver(() => { measure(); frame(); }).observe(document.body);
    measure(); frame();
  }
}
