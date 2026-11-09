import { $$, reduceMotion } from './utils.js';

// O sol nasce no nome: a vista vai da noite ao dia enquanto o "Saborear" sobe do horizonte. A seção é alta e o palco é sticky; o progresso da rolagem dirige a timeline.
export function initHero() {
  if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const phases = $$('.phase');
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom bottom', scrub: 0.8 }
  });

  // noite → nascer do sol → manhã → dia. Na Armação o sol nasce no mar: o nome começa meio mergulhado
  // no horizonte e sobe junto com o sol, enquanto o reflexo desce.
  tl.fromTo('.sky img', { scale: 1.08 }, { scale: 1, duration: 1 }, 0)
    .to('.k-nascer', { opacity: 1, duration: 0.28 }, 0.1)
    .to('.k-manha', { opacity: 1, duration: 0.24 }, 0.46)
    .to('.k-dia', { opacity: 1, duration: 0.22 }, 0.74)
    .fromTo('.sky-title .t', { yPercent: 34 }, { yPercent: 0, duration: 0.38, ease: 'power1.inOut' }, 0.12)
    .fromTo('.sea-title .t', { yPercent: -34 }, { yPercent: 0, duration: 0.38, ease: 'power1.inOut' }, 0.12)
    .to('.hero-top', { opacity: 0, duration: 0.1 }, 0.12);

  // legendas: uma por momento do dia
  const show = (el, at) => tl.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.08, immediateRender: false }, at);
  const hide = (el, at) => tl.to(el, { autoAlpha: 0, y: -16, duration: 0.07 }, at);
  hide(phases[0], 0.14); show(phases[1], 0.26); hide(phases[1], 0.5); show(phases[2], 0.62);

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
