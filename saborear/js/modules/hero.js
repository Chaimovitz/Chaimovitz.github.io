import { $$, reduceMotion } from './utils.js';

// O sol se põe no nome: a vista vai de dia a pôr do sol a anoitecer enquanto o "Saborear" afunda no horizonte
// e o reflexo sobe ao encontro dele. A seção é alta e o palco é sticky; o progresso da rolagem dirige a timeline.
export function initHero() {
  if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const phases = $$('.phase');
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom bottom', scrub: 0.8 }
  });

  // manhã → meio da tarde → pôr do sol; o nome começa a afundar quando a tarde vira pôr do sol
  // e termina meio mergulhado, com o sol encostando no horizonte.
  tl.fromTo('.sky img', { scale: 1.08 }, { scale: 1, duration: 1 }, 0)
    .to('.k-dia', { opacity: 1, duration: 0.3 }, 0.08)
    .to('.k-tarde', { opacity: 1, duration: 0.34 }, 0.5)
    .to('.sky-title .t', { yPercent: 34, duration: 0.42, ease: 'power1.inOut' }, 0.52)
    .to('.sea-title .t', { yPercent: -34, duration: 0.42, ease: 'power1.inOut' }, 0.52)
    .to('.hero-top', { opacity: 0, duration: 0.1 }, 0.12);

  // legendas: uma por momento do dia
  const show = (el, at) => tl.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.08, immediateRender: false }, at);
  const hide = (el, at) => tl.to(el, { autoAlpha: 0, y: -16, duration: 0.07 }, at);
  hide(phases[0], 0.16); show(phases[1], 0.28); hide(phases[1], 0.5); show(phases[2], 0.62);

  // só a legenda visível recebe foco e leitor de tela
  let last = '';
  tl.eventCallback('onUpdate', () => {
    const state = phases.map(p => getComputedStyle(p).visibility !== 'hidden' ? 1 : 0).join('');
    if (state === last) return; last = state;
    phases.forEach((p, i) => {
      const on = state[i] === '1';
      p.setAttribute('aria-hidden', String(!on));
      p.querySelectorAll('a').forEach(a => { a.tabIndex = on ? 0 : -1; });
    });
  });
}
