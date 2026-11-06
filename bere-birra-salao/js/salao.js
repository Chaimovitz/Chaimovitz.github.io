import { CONFIG } from './config.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;

function evento(nome, dados = {}) {   // medição desligada por padrão; nada sai do navegador
  if (!CONFIG.analytics?.ativo) return;
  dispatchEvent(new CustomEvent('bb:evento', { detail: { nome, ...dados } }));
  if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'bb_' + nome, ...dados });
}

// as duas casas: foto, legenda, endereço, rota, Waze e WhatsApp acompanham a escolha
const CASAS = {
  rv: { ...CONFIG.casas.rv, curto: 'Rio Vermelho', foto: 'assets/img/salao.webp', srcset: 'assets/img/salao.webp 1280w, assets/img/salao-2400.webp 2400w', cap: 'O salão do casarão, no Rio Vermelho', fotoAlt: 'O salão do casarão da Bere Birra no Rio Vermelho, à noite: mesas de madeira, pendentes acesos, o neon escrito à mão e um coração em neon rosa',
    rota: 'https://www.google.com/maps/search/?api=1&query=Bere+Birra+Rod.+Jo%C3%A3o+Gualberto+Soares+6812+Florian%C3%B3polis',
    waze: 'https://waze.com/ul?q=Rod.%20Jo%C3%A3o%20Gualberto%20Soares%206812%20Florian%C3%B3polis&navigate=yes' },
  sm: { ...CONFIG.casas.sm, curto: 'Santa Mônica', pos: '50% 38%', foto: 'assets/img/casa-sm.webp', srcset: 'assets/img/casa-sm.webp 1400w', cap: 'A casa de Santa Mônica, à noite', fotoAlt: 'Fachada da Bere Birra em Santa Mônica, à noite, com o letreiro da casa aceso',
    rota: 'https://www.google.com/maps/search/?api=1&query=Bere+Birra+R.+Esa%C3%BA+Pereira+da+Silva+160+Florian%C3%B3polis',
    waze: 'https://waze.com/ul?q=R.%20Esa%C3%BA%20Pereira%20da%20Silva%20160%20Florian%C3%B3polis&navigate=yes' }
};
const msg = c => `Oi, Bere Birra! Vim pelo site e queria conversar sobre uma reserva na casa ${c.nome}.`;
const wa = (c, t) => `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(t || msg(c))}`;

let casa = 'rv';
try { const s = localStorage.getItem('bb-casa'); if (CASAS[s]) casa = s; } catch { }
const fig = $('[data-foto]'), img = $('[data-foto-img]');
function escolher(id, animar = true) {
  casa = id; const c = CASAS[id];
  try { localStorage.setItem('bb-casa', id); } catch { }
  $$('[data-escolha] [data-casa]').forEach(b => { const on = b.dataset.casa === id; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
  $('[data-end]').textContent = `${c.endereco} · ${c.curto}`;
  $('[data-rota]').href = c.rota; $('[data-waze]').href = c.waze;
  $$('[data-reservar]').forEach(a => { a.href = wa(c); });
  $$('[data-reservar-txt], [data-reservar-txt2], [data-reservar-txt3], [data-reservar-txt4]').forEach(e => { e.textContent = `Reservar ${id === 'rv' ? 'no' : 'na'} ${c.curto}`; });
  $('[data-foto-cap]').textContent = c.cap;
  if (img.dataset.casa !== id) { img.dataset.casa = id;
    const trocar = () => { img.srcset = c.srcset; img.src = c.foto; img.alt = c.fotoAlt; img.style.objectPosition = c.pos || ''; };
    if (!animar || reduzir) trocar();
    else { fig.classList.add('troca'); setTimeout(() => { trocar(); const fim = () => fig.classList.remove('troca'); img.complete ? requestAnimationFrame(fim) : (img.onload = fim); }, 280); }
  }
  document.dispatchEvent(new CustomEvent('bb:casa', { detail: id }));
}
const grupo = $('[data-escolha]');
grupo.addEventListener('click', e => { const b = e.target.closest('[data-casa]'); if (b) { escolher(b.dataset.casa); evento('casa_escolhida', { casa: CASAS[b.dataset.casa].nome }); } });
grupo.addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return; e.preventDefault();
  const id = casa === 'rv' ? 'sm' : 'rv'; escolher(id); $(`[data-casa="${id}"]`, grupo).focus();
});
$$('[data-reservar]').forEach(a => a.addEventListener('click', () => evento('whatsapp_clique', { casa: CASAS[casa].nome })));
addEventListener('scroll', () => { $('.topo').classList.toggle('rolou', scrollY > 8); }, { passive: true });
// encerramento: a foto do letreiro abre para os lados e o alto (--a), a noite cai atrás do convite e só depois
// a foto desce por trás dele (--b); sem movimento, fica no estado final
const fim = $('[data-fim]'), topo = $('.topo');
if (fim) {
  const mov = !reduzir;
  if (mov) document.documentElement.classList.add('mov');
  let pedido = false;
  const medir = () => { pedido = false;
    const r = fim.getBoundingClientRect(), vh = innerHeight;
    let p = 1;
    if (mov) { const ini = vh * .35, curso = r.height - vh; p = Math.min(1, Math.max(0, (ini - r.top) / (ini + curso * .7))); fim.style.setProperty('--p', p.toFixed(3)); fim.style.setProperty('--a', Math.min(1, p / .5).toFixed(3)); fim.style.setProperty('--b', Math.max(0, (p - .5) / .5).toFixed(3)); }
    fim.classList.toggle('acesa', p > .38);
    document.dispatchEvent(new CustomEvent('bb:fim', { detail: p }));
    topo.classList.toggle('noite', r.top < topo.offsetHeight * .5 && p > .38);
  };
  addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(medir); } }, { passive: true });
  addEventListener('resize', medir); medir();
}
// barra do celular: aparece sempre que os botões principais (reservar e carta) não estão inteiros na tela
if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => $('[data-barra]').classList.toggle('on', e.intersectionRatio < .99), { threshold: [0, .99, 1] }).observe($('.acoes'));
else $('[data-barra]').classList.add('on');
// as duas casas no fim da página: links próprios
for (const id of ['rv', 'sm']) { const c = CASAS[id]; $(`[data-wa="${id}"]`).href = wa(c); $(`[data-rota-u="${id}"]`).href = c.rota; $(`[data-waze-u="${id}"]`).href = c.waze;
  $(`[data-wa="${id}"]`).addEventListener('click', () => evento('whatsapp_clique', { casa: c.nome })); }
// entradas discretas
if (!reduzir && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('[data-revela]').forEach(el => { el.classList.add('revela'); io.observe(el); });
}
escolher(casa, false);

export { CASAS, wa, msg, evento };
export const casaAtual = () => casa;
