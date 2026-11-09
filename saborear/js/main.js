import { initReady } from './modules/ready.js';
import { initNav } from './modules/nav.js';
import { initWhats } from './modules/whats.js';
import { initInfo } from './modules/info.js';
import { initHero } from './modules/hero.js';
import { initReveal } from './modules/reveal.js';
import { initMagnetic } from './modules/magnetic.js';
import { initDock } from './modules/dock.js';

// Cada módulo é independente: se um falhar, o resto do site continua.
const boot = fn => { try { fn(); } catch (err) { console.error(`[${fn.name}]`, err); } };
[initWhats, initInfo, initNav, initHero, initReveal, initMagnetic, initDock, initReady].forEach(boot);
