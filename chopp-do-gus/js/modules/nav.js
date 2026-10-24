import { $, $$ } from "./utils.js";
function initNav() {
  const nav = $("#nav"), btn = $("#menuBtn"), panel = $("#menuPanel");
  let last = scrollY, ticking = false;
  const update = () => {
    const y = scrollY, down = y > last + 4, up = y < last - 4;
    nav.classList.toggle("is-scrolled", y > 40);
    if (!panel.classList.contains("is-open")) {
      if (down && y > 220) nav.classList.add("is-hidden");
      else if (up || y < 220) nav.classList.remove("is-hidden");
    }
    last = y;
    ticking = false;
  };
  addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
  const toggle = (open) => {
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    btn.setAttribute("aria-expanded", String(open));
    btn.firstElementChild.textContent = open ? "Fechar" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
    if (open) nav.classList.remove("is-hidden");
  };
  btn.addEventListener("click", () => toggle(!panel.classList.contains("is-open")));
  $$("a", panel).forEach((a) => a.addEventListener("click", () => toggle(false)));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggle(false);
  });
}
export {
  initNav
};
