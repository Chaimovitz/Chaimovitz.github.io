import { $$ } from './utils.js';
import { PHOTOS } from '../data/photos.js';

// Slots de fotografia: tenta a foto real, depois a imagem provisória (IA) local e por último a remota.
// Imagem provisória ganha o selo "Imagem ilustrativa" para nunca passar por foto da casa.
const load = src => new Promise((ok, fail) => {
  const img = new Image(); img.alt = ''; img.decoding = 'async';
  img.onload = () => ok(img); img.onerror = fail; img.src = src;
});

export function initPhotos() {
  const mobile = matchMedia('(max-width: 767px)').matches;
  $$('[data-photo]').forEach(async fig => {
    const p = PHOTOS[fig.dataset.photo]; if (!p) return;
    const m = mobile && p.aiM;
    const tries = [[m ? p.realM : p.real, false], [m ? p.aiM : p.ai, true], [m ? p.remoteM : p.remote, true]].filter(t => t[0]);
    for (const [src, ai] of tries) {
      try {
        const img = await load(src);
        if (fig.dataset.priority) img.fetchPriority = 'high';
        fig.prepend(img); fig.classList.add('has-photo');
        if (ai) {
          fig.classList.add('is-ai');
          const tag = document.createElement('span'); tag.className = 'ai-tag'; tag.textContent = 'imagem ilustrativa · gerada por IA';
          fig.appendChild(tag);
        }
        return;
      } catch { /* tenta a próxima */ }
    }
  });
}
