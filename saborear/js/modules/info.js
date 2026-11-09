import { $ } from './utils.js';
import { CONFIG } from '../config.js';

// Horário, endereço, mapa e Instagram vêm do config. O que for null aparece como "a confirmar".
const TBC = '<span class="tbc">a confirmar</span>';

export function initInfo() {
  const rows = $('#hoursRows');
  if (rows) rows.innerHTML = CONFIG.hours.map(([d, h]) => `<div class="row"><span>${d}</span><span>${h ?? TBC}</span></div>`).join('');

  if (CONFIG.address) $('#address').textContent = CONFIG.address;
  if (CONFIG.mapQuery) {
    const q = encodeURIComponent(CONFIG.mapQuery);
    const link = $('#mapLink'); link.href = `https://www.google.com/maps/search/?api=1&query=${q}`; link.hidden = false;
    $('#map').innerHTML = `<div class="map"><iframe title="Mapa: ${CONFIG.brand}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${q}&output=embed"></iframe></div>`;
  }
  const ig = $('#insta');
  if (ig) {
    if (CONFIG.instagram) { ig.href = `https://instagram.com/${CONFIG.instagram}`; ig.textContent = `@${CONFIG.instagram}`; }
    else { ig.removeAttribute('href'); ig.removeAttribute('target'); }
  }
  if (CONFIG.lat != null && CONFIG.lng != null) {
    const t = sunset(new Date(), CONFIG.lat, CONFIG.lng);
    if (t) {
      const hh = new Intl.DateTimeFormat('pt-BR', { timeZone: CONFIG.timezone, hour: '2-digit', minute: '2-digit' }).format(t);
      const el = $('#sunset'); el.textContent = `Pôr do sol hoje${CONFIG.city ? ` em ${CONFIG.city}` : ''}: ${hh}`; el.hidden = false;
    }
  }
}

// Pôr do sol (algoritmo do almanaque náutico, precisão de ~1 min). Devolve um Date.
function sunset(date, lat, lng) {
  const rad = Math.PI / 180, y = date.getUTCFullYear();
  const N = Math.floor((date - Date.UTC(y, 0, 0)) / 864e5), t = N + (18 - lng / 15) / 24;
  const M = 0.9856 * t - 3.289;
  const L = ((M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634) % 360 + 360) % 360;
  let RA = ((Math.atan(0.91764 * Math.tan(L * rad)) / rad) % 360 + 360) % 360;
  RA = (RA + Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90) / 15;
  const sinD = 0.39782 * Math.sin(L * rad), cosD = Math.cos(Math.asin(sinD));
  const cosH = (Math.cos(90.833 * rad) - sinD * Math.sin(lat * rad)) / (cosD * Math.cos(lat * rad));
  if (cosH < -1 || cosH > 1) return null;
  const H = Math.acos(cosH) / rad / 15, T = H + RA - 0.06571 * t - 6.622;
  const UT = ((T - lng / 15) % 24 + 24) % 24;
  return new Date(Date.UTC(y, 0, N) + UT * 36e5);
}
