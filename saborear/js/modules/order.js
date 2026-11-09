import { $, $$ } from './utils.js';
import { CONFIG } from '../config.js';

// Pedido pelo WhatsApp: o cliente toca no "+" dos itens do cardápio, revisa e envia.
// A mensagem chega pronta no WhatsApp da casa (CONFIG.whatsapp). Sem servidor, sem pagamento.
export function initOrder() {
  const cart = new Map();          // nome -> quantidade
  const bar = $('#cart'), count = $('#cartCount'), sheet = $('#orderSheet'), list = $('#orderList'), send = $('#orderSend');
  if (!bar || !sheet) return;

  const total = () => [...cart.values()].reduce((a, b) => a + b, 0);
  const message = () => {
    const name = $('#orderName').value.trim(), note = $('#orderNote').value.trim();
    const way = $('input[name="orderWay"]:checked')?.value;
    const lines = ['Oi, Saborear! Quero fazer um pedido pelo site:', ...[...cart].map(([n, q]) => `• ${q}x ${n}`)];
    if (way) lines.push(`Para: ${way}`);
    if (name) lines.push(`Nome: ${name}`);
    if (note) lines.push(`Obs.: ${note}`);
    return lines.join('\n');
  };
  const syncLink = () => {
    const base = CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}` : 'https://wa.me/';
    send.href = `${base}?text=${encodeURIComponent(message())}`;
  };
  const render = () => {
    const n = total();
    bar.hidden = n === 0;
    document.body.classList.toggle('has-cart', n > 0);
    count.textContent = `${n} ${n === 1 ? 'item' : 'itens'}`;
    $$('[data-add]').forEach(b => {
      const q = cart.get(b.dataset.add) || 0;
      b.textContent = q ? String(q) : '+';
      b.classList.toggle('on', q > 0);
    });
    list.innerHTML = [...cart].map(([n, q]) => `<li><span>${n}</span><span class="qty">
      <button type="button" data-dec="${n}" aria-label="Tirar um ${n}">−</button><b>${q}</b>
      <button type="button" data-inc="${n}" aria-label="Mais um ${n}">+</button></span></li>`).join('');
    syncLink();
  };
  const change = (name, d) => {
    const q = (cart.get(name) || 0) + d;
    q > 0 ? cart.set(name, q) : cart.delete(name);
    render();
    if (!total() && sheet.open) sheet.close();
  };

  $$('[data-add]').forEach(b => b.addEventListener('click', () => {
    change(b.dataset.add, 1);
    bar.classList.remove('bump'); void bar.offsetWidth; bar.classList.add('bump');
  }));
  list.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.inc) change(t.dataset.inc, 1);
    if (t.dataset.dec) change(t.dataset.dec, -1);
  });
  $('#cartOpen').addEventListener('click', () => sheet.showModal());
  sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });   // clique fora fecha
  sheet.addEventListener('input', syncLink);
  render();
}
