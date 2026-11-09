import { $ } from './utils.js';

// Barra de WhatsApp no celular: aparece quando o pôr do sol do hero termina (lá já há botões) e some no rodapé.
export function initDock() {
  const dock = $('#dock'), hero = $('#inicio'); if (!dock) return;
  let foot = false;
  const sync = () => dock.classList.toggle('is-on', scrollY > hero.offsetHeight - innerHeight * 0.9 && !foot);
  new IntersectionObserver(([e]) => { foot = e.isIntersecting; sync(); }, { threshold: 0.35 }).observe($('footer'));
  addEventListener('scroll', sync, { passive: true }); sync();
}
