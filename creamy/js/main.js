import { initReady } from './modules/ready.js';
import { initSmooth } from './modules/smooth.js';
import { initFluidez } from './modules/fluidez.js';
import { initNav } from './modules/nav.js';
import { initPhotos } from './modules/photos.js';
import { initReveal } from './modules/reveal.js';
import { initMagnetic } from './modules/magnetic.js';
import { initStatus } from './modules/status.js';
import { initDock } from './modules/dock.js';
import { initBuild } from './modules/build.js';
import { initPour } from './modules/pour.js';

// Cada módulo é independente: se um falhar, o resto do site continua.
const boot = fn => { try { fn(); } catch (err) { console.error(`[${fn.name}]`, err); } };
[initSmooth, initNav, initPhotos, initReveal, initMagnetic, initStatus, initBuild, initPour, initDock, initFluidez, initReady].forEach(boot);
