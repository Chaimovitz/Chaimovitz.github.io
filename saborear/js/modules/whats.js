import { $$ } from './utils.js';
import { CONFIG } from '../config.js';

// Todo [data-wa] vira link do WhatsApp com a mensagem pronta. Sem número confirmado, abre o WhatsApp para escolher o contato.
export function initWhats() {
  const base = CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}` : 'https://wa.me/';
  $$('[data-wa]').forEach(a => { a.href = `${base}?text=${encodeURIComponent(a.dataset.wa)}`; });
}
