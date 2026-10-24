import { $, $$, clamp, reduceMotion } from "./utils.js";
function initScrollFx() {
  if (reduceMotion) return;
  const hero = $(".hero"), items = $$("[data-parallax]");
  let ticking = false;
  const update = () => {
    const y = scrollY, vh = innerHeight;
    if (hero) hero.style.setProperty("--p", clamp(y / (hero.offsetHeight * 0.85), 0, 1).toFixed(3));
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const k = parseFloat(el.dataset.parallax) || 0.05;
      const center = r.top + r.height / 2 - vh / 2;
      el.style.setProperty("--py", (-center * k).toFixed(1) + "px");
    }
    ticking = false;
  };
  addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  addEventListener("resize", update);
  update();
}
export {
  initScrollFx
};
