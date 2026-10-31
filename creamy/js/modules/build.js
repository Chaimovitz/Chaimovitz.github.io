import { $, $$, clamp, reduceMotion } from './utils.js';
import { sequence } from './seqscroll.js';
import { PIZZA } from '../data/pizza.js';

// Topo + pizza: a pizza é o objeto da página desde o carregamento. A rolagem controla o estado (massa -> molho ->
// muçarela -> forno -> pronta), nos dois sentidos. Quadros recortados (fundo removido) num canvas transparente sobre o
// creme; o título sai (opacidade e deslocamento curto), entram notas com linhas-guia apontando para partes reais da pizza, a luz do forno
// esquenta o fundo e a narrativa termina no pedido. Motor dos quadros: seqscroll.js.
const { count: N, anchors: A, bands } = PIZZA;
// posição da rolagem -> quadro (bancada 0..32, fusão 32..37, forno 37..93) e marcos das notas
const map = p => {
  const [h0, c1, x1, o1] = bands;                 // fim do topo, fim da bancada, fim da fusão, pizza pronta
  const f = p < h0 ? 0 : p < c1 ? ((p - h0) / (c1 - h0)) * 32 : p < x1 ? 32 + ((p - c1) / (x1 - c1)) * 5 : p < o1 ? 37 + ((p - x1) / (o1 - x1)) * 56 : 93;
  return f / (N - 1);
};
const MARKS = PIZZA.marks;                         // início de cada nota (massa, molho, muçarela, forno, pronta)
const ease = t => t * t * (3 - 2 * t);

export function initBuild() {
  const sec = $('#montagem'); if (!sec || reduceMotion) return;
  const pin = $('.show-pin', sec), cv = $('#buildCanvas'), obj = $('.show-obj', sec), hero = $('.show-hero', sec);
  const notes = $$('.note', sec), keys = $$('.bkey', sec), bar = $('#buildBar'), glow = $('.show-glow', sec);
  const svg = $('.show-lines', sec), path = $('.ln-path', svg), dot = $('.ln-dot', svg), ring = $('.ln-ring', svg);
  const conn = navigator.connection;
  const lite = !!conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''));
  const mode = !lite && cv.getContext && 'createImageBitmap' in window ? 'seq' : 'keys';
  sec.classList.add('is-live', `mode-${mode}`);

  // geometria (medida só quando o layout muda): caixa da pizza e ponto de saída de cada nota, relativos ao pin
  let box = null, outs = [], mobile = false;
  const measure = () => {
    mobile = matchMedia('(max-width: 1023px)').matches;
    // celular: a pizza ocupa o espaço livre entre os botões do topo e o botão fixo do WhatsApp (o terço de cima da caixa
    // é transparente, então ela pode subir até ali sem cobrir o texto). Nunca maior que a largura da tela.
    if (mobile) {
      const cta = hero.querySelector('.hero-cta').getBoundingClientRect(), pr0 = pin.getBoundingClientRect();
      const free = pr0.height - (cta.bottom - pr0.top) - 54 - 14;                  // 54 px do botão fixo + folga
      const h = Math.max(220, Math.min(pin.clientWidth * 0.92 * (1260 / 1080), free / 0.74));
      obj.style.height = `${Math.round(h)}px`; obj.style.width = `${Math.round(h * 1080 / 1260)}px`;
      obj.style.left = `${Math.round((pin.clientWidth - h * 1080 / 1260) / 2)}px`;
    } else { obj.style.height = obj.style.width = obj.style.left = ''; }
    const pr = pin.getBoundingClientRect(), r = obj.getBoundingClientRect();
    box = { x: r.left - pr.left, y: r.top - pr.top, w: r.width, h: r.height };
    outs = notes.map(n => {
      const h = n.querySelector('h2'); if (!h) return null;
      // desktop: sai da direita do título da nota; celular: sai de baixo do texto, à esquerda
      const nr = n.getBoundingClientRect(), hr = h.getBoundingClientRect();
      const tY = n.classList.contains('is-on') ? 0 : 22;           // a nota apagada está 22 px abaixo (translate)
      return mobile ? { x: nr.left - pr.left + 6, y: nr.bottom - pr.top - tY + 10 } : { x: hr.right - pr.left + 18, y: hr.top - pr.top - tY + hr.height * 0.55 };
    });
    glow.style.setProperty('--gx', `${((box.x + box.w * 0.5) / pr.width) * 100}%`);
    glow.style.setProperty('--gy', `${((box.y + box.h * 0.66) / pr.height) * 100}%`);
    lastStep = -2; ui(lastP);
  };

  let step = -1, lastStep = -2, lastP = 0;
  const drawLine = s => {
    const key = notes[s]?.dataset.anchor, a = key && A[key], o = outs[s];
    if (!a || !o || !box) { svg.classList.remove('is-on'); return; }
    const x2 = box.x + a[0] * box.w, y2 = box.y + a[1] * box.h;
    // linha em cotovelo: sai da nota na horizontal (desktop) ou na vertical (celular) e desce/segue até o ponto
    const d = mobile ? `M${o.x},${o.y} L${o.x},${(o.y + y2) / 2} L${x2},${y2}` : `M${o.x},${o.y} L${(o.x + x2) / 2},${o.y} L${x2},${y2}`;
    path.setAttribute('d', d);
    const len = Math.ceil(path.getTotalLength()); path.style.setProperty('--len', len);
    dot.setAttribute('cx', x2); dot.setAttribute('cy', y2); ring.setAttribute('cx', x2); ring.setAttribute('cy', y2);
    svg.classList.remove('is-on'); void svg.getBoundingClientRect(); svg.classList.add('is-on');
  };

  // só transform/opacity/filter por quadro (nada que recalcule layout)
  const ui = p => {
    lastP = p;
    const h = ease(clamp((p - 0.015) / 0.05, 0, 1));              // o título sai: opacidade e deslocamento curto
    hero.style.opacity = (1 - h).toFixed(3);
    hero.style.transform = `translate3d(0, ${(-h * 24).toFixed(1)}px, 0)`;
    hero.style.visibility = h >= 0.999 ? 'hidden' : '';
    const s = p < MARKS[0] ? -1 : MARKS.reduce((acc, m, i) => (p >= m ? i : acc), 0);
    if (s !== step) { step = s; notes.forEach((el, i) => el.classList.toggle('is-on', i === s)); }
    if (s !== lastStep) { lastStep = s; drawLine(s); }
    const oven = clamp((p - bands[1]) / (bands[3] - bands[1]), 0, 1);   // a luz do forno esquenta o fundo
    glow.style.opacity = (0.45 + 0.55 * Math.sin(Math.PI * Math.min(oven, 1) * 0.5 + (oven >= 1 ? 0 : 0))).toFixed(3);
    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    sec.classList.toggle('is-done', p > bands[3]);
    if (mode === 'keys') keys[1].style.opacity = clamp((p - bands[1]) / (bands[3] - bands[1]), 0, 1).toFixed(3);
  };

  if (mode === 'seq') {
    sequence({ sec, canvas: cv, count: N, dirs: PIZZA.dirs, map, onProgress: ui, fade: 1, focusY: 0.5, alpha: true });
  } else {
    let top = 0, len = 1, queued = false;
    const m2 = () => { top = sec.getBoundingClientRect().top + scrollY; len = Math.max(sec.offsetHeight - innerHeight, 1); };
    const frame = () => { queued = false; ui(clamp((scrollY - top) / len, 0, 1)); };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener('resize', () => { m2(); frame(); });
    new ResizeObserver(() => { m2(); frame(); }).observe(document.body);
    m2(); frame();
  }
  addEventListener('resize', measure);
  new ResizeObserver(measure).observe(pin);
  document.fonts?.ready.then(measure);
  measure();
}
