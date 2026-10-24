import { $$ } from "./utils.js";
function initReveal() {
  const items = $$("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  }), { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
  items.forEach((el) => io.observe(el));
}
export {
  initReveal
};
