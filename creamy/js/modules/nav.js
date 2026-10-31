import { $, $$ } from './utils.js';

// Pílula de vidro: esconde ao rolar para baixo, volta ao rolar para cima. Menu cheio no celular.
export function initNav() {
  const nav = $('#nav'), btn = $('#menuBtn'), panel = $('#menuPanel');
  let last = scrollY, ticking = false;
  // sobre as cenas de fundo tostado/oliva, a barra fica escura com texto creme (offsets medidos só quando o layout muda)
  const darks = $$('.show, .pour'); let spans = [];
  const measure = () => { spans = darks.map(el => { const r = el.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; }); };
  const update = () => {
    const y = scrollY, down = y > last + 4, up = y < last - 4;
    nav.classList.toggle('is-scrolled', y > 40);
    const mid = y + 34;
    nav.classList.toggle('on-dark', !!document.documentElement.dataset.tema && spans.some(([a, b]) => mid >= a && mid < b));
    if (!panel.classList.contains('is-open')) {
      if (down && y > 220) nav.classList.add('is-hidden');
      else if (up || y < 220) nav.classList.remove('is-hidden');
    }
    last = y; ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  new ResizeObserver(() => { measure(); update(); }).observe(document.body);
  measure(); update();

  const toggle = open => {
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    btn.setAttribute('aria-expanded', String(open));
    btn.firstElementChild.textContent = open ? 'Fechar' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) nav.classList.remove('is-hidden');
  };
  btn.addEventListener('click', () => toggle(!panel.classList.contains('is-open')));
  $$('a', panel).forEach(a => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
}
