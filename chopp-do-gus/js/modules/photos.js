import { $$ } from "./utils.js";
import { PHOTOS } from "../data/photos.js";
const load = (src) => new Promise((ok, fail) => {
  const img = new Image();
  img.alt = "";
  img.decoding = "async";
  img.onload = () => ok(img);
  img.onerror = fail;
  img.src = src;
});
function initPhotos() {
  const mobile = matchMedia("(max-width: 767px)").matches;
  $$("[data-photo]").forEach(async (fig) => {
    const p = PHOTOS[fig.dataset.photo];
    if (!p) return;
    const m = mobile && p.aiM;
    const tries = [[m ? p.realM : p.real, false], [m ? p.aiM : p.ai, true]].filter((t) => t[0]);
    for (const [src, ai] of tries) {
      try {
        const img = await load(src);
        if (fig.dataset.priority) img.fetchPriority = "high";
        fig.prepend(img);
        fig.classList.add("has-photo");
        if (ai) {
          fig.classList.add("is-ai");
          const tag = document.createElement("span");
          tag.className = "ai-tag mono";
          tag.textContent = "Imagem ilustrativa";
          fig.appendChild(tag);
        }
        return;
      } catch {
      }
    }
  });
}
export {
  initPhotos
};
