import { $ } from './utils.js';
import { CONFIG } from '../config.js';

// Relógio de Floripa e status da noite (horário da bio do Instagram, a confirmar). A noite atravessa a meia-noite.
const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };

export function initStatus() {
  const text = $('#statusText'), dot = $('#statusDot'), clock = $('#clock'), visit = $('#visitStatus');
  const fmt = new Intl.DateTimeFormat('pt-BR', { timeZone: CONFIG.timezone, weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false });
  const open = toMin(CONFIG.opensAt), close = toMin(CONFIG.closesAt), days = CONFIG.openDays, names = CONFIG.weekdayNames;
  const render = () => {
    const p = Object.fromEntries(fmt.formatToParts(new Date()).map(x => [x.type, x.value]));
    const day = names.findIndex(n => p.weekday.toLowerCase().startsWith(n));
    const now = (parseInt(p.hour, 10) % 24) * 60 + parseInt(p.minute, 10);
    const isOpen = (days.includes(day) && now >= open) || (now < close && days.includes((day + 6) % 7));
    let msg;
    if (isOpen) msg = `Aberta agora · até ${CONFIG.closesAt}`;
    else if (days.includes(day) && now < open) msg = `Hoje abre às ${CONFIG.opensAt}`;
    else { let n = 1; while (!days.includes((day + n) % 7)) n++; msg = `Abre ${n === 1 ? 'amanhã' : names[(day + n) % 7]} às ${CONFIG.opensAt}`; }
    if (clock) clock.textContent = `${p.hour}:${p.minute} em Floripa`;
    if (text) text.textContent = msg;
    if (dot) dot.classList.toggle('on', isOpen);
    if (visit) visit.textContent = msg;
  };
  render(); setInterval(render, 30000);
}
