import { $ } from './utils.js';

// Botão fixo de pedido no celular: aparece depois do hero e some na seção "Onde fica" (que já tem CTA grande).
export function initDock() {
  const dock = $('#dock'), hero = $('#inicio'), where = $('#onde'); if (!dock) return;
  let pastHero = false, atWhere = false;
  const sync = () => dock.classList.toggle('is-on', pastHero && !atWhere);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; sync(); }, { rootMargin: '-45% 0px 0px 0px' }).observe(hero);
  new IntersectionObserver(([e]) => { atWhere = e.isIntersecting; sync(); }, { threshold: 0.2 }).observe(where);
}
