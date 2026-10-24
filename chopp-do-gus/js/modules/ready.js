import { readyHolds } from "./utils.js";
function initReady() {
  const go = () => document.documentElement.classList.add("is-ready");
  const cap = new Promise((ok) => setTimeout(ok, 1500));
  const all = Promise.all([document.fonts?.ready ?? Promise.resolve(), ...readyHolds]);
  Promise.race([all, cap]).then(() => requestAnimationFrame(go));
}
export {
  initReady
};
