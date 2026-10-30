import { readyHolds } from './utils.js';

// Marca a página como pronta (dispara a entrada da manchete e do hero) quando as fontes carregarem
// e quando o que outros módulos pediram para esperar (readyHolds) chegar, com teto de 1,5 s para nada travar.
export function initReady() {
  const go = () => document.documentElement.classList.add('is-ready');
  const cap = new Promise(ok => setTimeout(ok, 1500));
  const all = Promise.all([document.fonts?.ready ?? Promise.resolve(), ...readyHolds]);
  Promise.race([all, cap]).then(() => requestAnimationFrame(go));
}
