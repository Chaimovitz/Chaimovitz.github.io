// A carta em abas, na ordem da casa. Itens reais do PDF (Santa Mônica, abril/2026), sem preços.
// Foto só onde a correspondência é segura: a categoria (uma sobremesa, uma pizza), nunca um prato específico.
import { PIZZAS, ENTRADAS, SOBREMESAS } from './dados.js';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

const PARTES = [
  { id: 'entradas', nome: 'Entradas', intro: 'Para comer “com as mãos”, ou de hashi ou garfo, com as torradinhas da casa.',
    grupos: [['Com as mãos', ENTRADAS.maos], ['De hashi ou garfo', ENTRADAS.garfo]] },
  { id: 'sobremesas', nome: 'Ué!? A sobremesa', intro: 'Ué!? Isso mesmo: na carta, ela está antes da pizza, “para vcs já irem planejando esse final feliz”.',
    grupos: [[null, SOBREMESAS]], foto: ['assets/img/sobremesa.webp', 'Uma sobremesa servida na Bere Birra', 'Uma sobremesa da casa'] },
  { id: 'tradicionais', nome: 'Tradicionais ou quase', intro: 'As massas levam farinha orgânica e descansam no mínimo 24 horas.',
    grupos: [[null, PIZZAS.tradicionais]], foto: ['assets/img/pizza-forma.webp', 'Uma pizza da Bere Birra numa forma, de perto', 'Uma pizza da casa'] },
  { id: 'autorais', nome: 'Só tem aqui', intro: 'As autorais e releituras. Em várias, uma parte entra depois do forno.',
    grupos: [[null, PIZZAS.autorais]], foto: ['assets/img/pizza-bufala.webp', 'Uma pizza da Bere Birra com muçarela de búfala, sobre fundo escuro', 'Uma pizza da casa'] }
];

const abas = $('[data-abas]');
PARTES.forEach((p, i) => {
  const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'aba-' + p.id; b.dataset.parte = p.id;
  b.setAttribute('aria-controls', 'painel'); b.textContent = p.nome; b.addEventListener('click', () => mostrar(p.id)); abas.appendChild(b);
});
abas.addEventListener('keydown', e => {
  const bs = $$('[role=tab]', abas), i = bs.indexOf(document.activeElement); if (i < 0) return;
  const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: bs.length - 1 }[e.key]; if (n === undefined) return;
  e.preventDefault(); const b = bs[(n + bs.length) % bs.length]; b.focus(); b.click();
});
const DESC = { 'Panini Brie com Jamón': 'Massa aberta no rolo, queijo brie e presunto Parma, entradinha com 23 g de proteína' };
function item(p) {
  if (DESC[p.nome]) p = { ...p, desc: DESC[p.nome] };
  const li = document.createElement('li'); li.className = 'item';
  const desc = p.forno ? p.forno.join(', ') : (p.desc || '').replace(/\.$/, '');
  li.innerHTML = `<h3>${p.nome}${p.nota ? ` <span class="nota">${p.nota}</span>` : ''}</h3>`
    + (p.chef ? `<p class="chef">por ${p.chef}</p>` : '')
    + (desc ? `<p class="desc">${desc}.</p>` : '')
    + (p.pos ? `<p class="pos"><span>depois do forno</span> ${p.pos.join(', ')}.</p>` : '');
  return li;
}
const painel = $('[data-painel]'), fig = $('[data-pfoto]'), fimg = $('[data-pfoto-img]');
function mostrar(id) {
  const p = PARTES.find(x => x.id === id);
  $$('[role=tab]', abas).forEach(b => { const on = b.dataset.parte === id; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
  painel.setAttribute('aria-labelledby', 'aba-' + id); painel.dataset.parte = id;
  $('[data-intro]').textContent = p.intro;
  const ul = $('[data-itens]'); ul.replaceChildren();
  for (const [titulo, lista] of p.grupos) {
    if (titulo) { const h = document.createElement('li'); h.className = 'grupo'; h.textContent = titulo; ul.appendChild(h); }
    lista.forEach(x => ul.appendChild(item(x)));
  }
  const ativa = $(`#aba-${id}`); if (ativa && abas.scrollWidth > abas.clientWidth) abas.scrollTo({ left: ativa.offsetLeft - 16, behavior: 'smooth' });
  fig.hidden = !p.foto; painel.classList.toggle('sem-foto', !p.foto);
  if (p.foto) { fimg.src = p.foto[0]; fimg.alt = p.foto[1]; $('[data-pfoto-cap]').textContent = p.foto[2]; }
}
mostrar('entradas');
