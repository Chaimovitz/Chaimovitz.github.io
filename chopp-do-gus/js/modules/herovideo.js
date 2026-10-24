import { $, reduceMotion } from "./utils.js";
function initHeroVideo() {
  const box = $(".hero-product"), hero = $(".hero");
  if (!box || !hero || reduceMotion || document.documentElement.classList.contains("seq-on")) return;
  const net = navigator.connection;
  if (net && (net.saveData || /2g/.test(net.effectiveType || ""))) return;
  const start = () => {
    if (document.documentElement.classList.contains("seq-on")) return;
    const base = "assets/video/" + (matchMedia("(max-width: 1023px)").matches ? "produto-loop-m" : "produto-loop");
    const v = document.createElement("video");
    v.className = "hp-video";
    v.muted = v.defaultMuted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "auto";
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("aria-hidden", "true");
    v.disablePictureInPicture = true;
    [["webm", "video/webm; codecs=vp9"], ["mp4", "video/mp4"]].forEach(([ext, type]) => {
      const s = document.createElement("source");
      s.src = `${base}.${ext}`;
      s.type = type;
      v.appendChild(s);
    });
    v.lastElementChild.addEventListener("error", () => v.remove());
    v.addEventListener("playing", () => box.classList.add("is-playing"), { once: true });
    (box.querySelector(".hp-glass") || box).appendChild(v);
    new IntersectionObserver(([e]) => {
      e.isIntersecting ? v.play().catch(() => {
      }) : v.pause();
    }).observe(hero);
  };
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  document.readyState === "complete" ? idle(start) : addEventListener("load", () => idle(start), { once: true });
}
export {
  initHeroVideo
};
