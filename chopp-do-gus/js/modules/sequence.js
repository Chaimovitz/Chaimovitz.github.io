import { $, clamp, reduceMotion, readyHolds } from "./utils.js";
import { SEQUENCE } from "../data/sequence.js";
function initSequence() {
  const mobile = matchMedia("(max-width: 1023px)").matches;
  const cfg = mobile ? SEQUENCE.mobile : SEQUENCE.desktop;
  const track = $(".hero-track"), box = $(".hero-product"), img = box?.querySelector(".hp-img");
  if (!track || !box || !img) return;
  if (!cfg.count) return initScenes(track, box, mobile);
  const src = (i) => `${cfg.dir}${String(i + 1).padStart(3, "0")}.${cfg.ext}`;
  const probe = new Image();
  if (reduceMotion) {
    probe.onload = () => {
      img.removeAttribute("srcset");
      img.src = probe.src;
    };
    probe.src = src(cfg.count - 1);
    return;
  }
  probe.onload = () => startFrames(track, box, img, mobile, cfg, src);
  probe.onerror = () => console.warn("[sequência] quadros não encontrados em", cfg.dir, "— mantendo o hero atual");
  probe.src = src(0);
}
function startFrames(track, box, img, mobile, cfg, src) {
  document.documentElement.classList.add("seq-on", "seq-scroll");
  box.querySelector(".hp-video")?.remove();
  track.style.setProperty("--seq-len", SEQUENCE.length[mobile ? "mobile" : "desktop"]);
  const canvas = document.createElement("canvas");
  canvas.className = "hp-img hp-seq";
  canvas.setAttribute("aria-hidden", "true");
  img.after(canvas);
  const ctx = canvas.getContext("2d");
  const frames = new Array(cfg.count);
  const order = [0, cfg.count - 1];
  for (let step = 8; step >= 1; step /= 2) for (let i = 0; i < cfg.count; i += step) if (!order.includes(i)) order.push(i);
  let k = 0;
  const loadNext = () => {
    if (k >= order.length) return;
    const i = order[k++], im = new Image();
    im.decoding = "async";
    im.onload = () => {
      frames[i] = im;
      if (i === 0) {
        canvas.classList.add("is-ready");
        draw(true);
      }
      loadNext();
    };
    im.onerror = loadNext;
    im.src = src(i);
  };
  for (let n = 0; n < 4; n++) loadNext();
  let target = 0, shown = 0, drawn = -1, ticking = false;
  const nearest = (i) => {
    for (let d = 0; d < cfg.count; d++) {
      if (frames[i - d]) return i - d;
      if (frames[i + d]) return i + d;
    }
    return -1;
  };
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    drawn = -1;
    draw(true);
  }
  function draw(force) {
    const i = nearest(Math.round(shown * (cfg.count - 1)));
    if (i < 0 || i === drawn && !force) return;
    const f = frames[i], W = canvas.width, H = canvas.height, s = Math.max(W / f.naturalWidth, H / f.naturalHeight);
    const w = f.naturalWidth * s, h = f.naturalHeight * s;
    ctx.drawImage(f, (W - w) / 2, (H - h) / 2, w, h);
    drawn = i;
  }
  const progress = () => clamp((scrollY - track.offsetTop) / Math.max(track.offsetHeight - innerHeight, 1), 0, 1);
  function tick() {
    shown += (target - shown) * 0.2;
    if (Math.abs(target - shown) < 1e-3) shown = target;
    draw();
    ticking = shown !== target;
    if (ticking) requestAnimationFrame(tick);
  }
  addEventListener("scroll", () => {
    target = progress();
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }, { passive: true });
  addEventListener("resize", size);
  target = shown = progress();
  size();
}
function initScenes(track, box, mobile) {
  const scene = SEQUENCE.scenes?.servindo;
  if (!scene || reduceMotion) return;
  const root = document.documentElement;
  const el = new Image();
  el.className = "hp-scene";
  el.alt = "";
  el.decoding = "async";
  el.setAttribute("aria-hidden", "true");
  readyHolds.push(new Promise((ok) => {
    el.addEventListener("load", ok);
    el.addEventListener("error", ok);
  }));
  el.onload = () => {
    if (root.classList.contains("is-ready")) return;
    box.insertBefore(el, box.querySelector(".ai-tag"));
    track.style.setProperty("--seq-len", SEQUENCE.length[mobile ? "scenesMobile" : "scenesDesktop"]);
    root.classList.add("seq-scroll", "seq-scenes");
    const ease = (t) => t * t * (3 - 2 * t), seg = (p, a, b) => ease(clamp((p - a) / (b - a), 0, 1));
    let ticking = false;
    const update = () => {
      const p = clamp((scrollY - track.offsetTop) / Math.max(track.offsetHeight - innerHeight, 1), 0, 1);
      const F = box.querySelector(".hp-img").offsetWidth || box.clientWidth;
      box.style.setProperty("--frame-w", F + "px");
      const D = F, k = seg(p, 0.25, 0.8);
      box.style.setProperty("--scene-s", (1 + 0.05 * seg(p, 0, 0.25)).toFixed(4));
      box.style.setProperty("--scene-x", (-D * k).toFixed(1) + "px");
      box.style.setProperty("--scene-a", (1 - seg(p, 0.72, 0.8)).toFixed(3));
      box.style.setProperty("--glass-x", (D * (1 - k)).toFixed(1) + "px");
      box.style.setProperty("--glass-a", seg(p, 0.25, 0.33).toFixed(3));
      box.style.setProperty("--scene-b", (1 - 0.6 * seg(p, 0.3, 0.7)).toFixed(3));
      box.style.setProperty("--glass-b", (0.4 + 0.6 * seg(p, 0.35, 0.75)).toFixed(3));
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
    setTimeout(() => el.classList.add("is-live"), 900);
  };
  el.src = mobile ? scene.mobile : scene.desktop;
}
export {
  initSequence
};
