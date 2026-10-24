import { $ } from "./utils.js";
function initDock() {
  const dock = $("#dock"), hero = $(".hero"), form = $("#reservar");
  if (!dock || !hero || !form) return;
  let pastHero = false, atForm = false;
  const sync = () => dock.classList.toggle("is-on", pastHero && !atForm);
  new IntersectionObserver(([e]) => {
    pastHero = !e.isIntersecting;
    sync();
  }, { rootMargin: "0px 0px -40% 0px" }).observe(hero);
  new IntersectionObserver(([e]) => {
    atForm = e.isIntersecting;
    sync();
  }).observe(form);
}
export {
  initDock
};
