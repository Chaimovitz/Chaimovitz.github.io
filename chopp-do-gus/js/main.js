import { initReady } from "./modules/ready.js";
import { initNav } from "./modules/nav.js";
import { initPhotos } from "./modules/photos.js";
import { initScrollFx } from "./modules/scrollfx.js";
import { initReveal } from "./modules/reveal.js";
import { initTaps } from "./modules/taps.js";
import { initReserve } from "./modules/reserve.js";
import { initDock } from "./modules/dock.js";
import { initHeroVideo } from "./modules/herovideo.js";
import { initSequence } from "./modules/sequence.js";
const boot = (fn) => {
  try {
    fn();
  } catch (err) {
    console.error(`[${fn.name}]`, err);
  }
};
[initNav, initPhotos, initScrollFx, initReveal, initTaps, initReserve, initDock, initSequence, initHeroVideo, initReady].forEach(boot);
