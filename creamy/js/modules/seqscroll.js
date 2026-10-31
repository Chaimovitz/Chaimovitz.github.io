import { clamp } from './utils.js';

// Motor único das duas cenas (pizza e chope): sequência de quadros presa ao scroll, sem perseguição.
// Base: startFrames() de sites/chopp-do-gus-editorial/js/modules/sequence.js (trilho alto + canvas + quadro da posição).
//  - progresso = posição do scroll, direto (sem lerp/scrub): a cena anda junto com a página, nos dois sentidos.
//  - tudo é preparado ANTES de a cena aparecer (a 3 telas de distância):
//      1) baixa todos os quadros (comprimidos, poucos MB);
//      2) decodifica TODOS numa versão leve (metade do tamanho, fora da thread principal) -> rede de segurança: nunca há
//         buraco, degrau nem quadro em branco, mesmo num arremesso de rolagem;
//      3) decodifica em resolução total uma janela de quadros a partir da ponta por onde a cena vai entrar e, depois,
//         sempre à frente da posição, no sentido da rolagem. A janela cabe num orçamento de memória (some ao sair).
//  - cada quadro sai da decodificação já recortado e no tamanho do canvas: desenho 1:1, sem escala.
//  - mistura contínua entre quadros vizinhos (fade = 1): o movimento é interpolado, não "fatiado". Se um quadro ainda
//    não chegou, mistura os dois mais próximos disponíveis (antes e depois): a cena nunca salta nem congela.
//  - download do grosso para o fino (início, fim, meio, quartos...): logo após abrir, a sequência inteira já está
//    coberta por quadros espaçados, e os intermediários vão preenchendo.
//  - nenhuma leitura de layout por quadro (offsets medidos só quando a página muda de tamanho).
// coordenação entre as cenas: enquanto uma está na tela, a outra só prepara um quadro por vez (sem disputa de CPU,
// mas sem chegar despreparada)
let active = null;
const waiting = new Set();
const setActive = (sec, on) => {
  if (on && active !== sec) active = sec;
  else if (!on && active === sec) { active = null; waiting.forEach(f => f()); }
};

// alpha: quadros recortados (fundo transparente) desenhados sobre a própria página; o canvas tem a proporção do quadro
// (sem recorte) e é limpo a cada desenho.
export function sequence({ sec, canvas, count, dirs, map = p => p, onProgress, fade = 1, focusY = 0.5, alpha = false }) {
  const ctx = canvas.getContext('2d', alpha ? { alpha: true } : { alpha: false, desynchronized: true });
  const fileMode = location.protocol === 'file:';
  const mobile = matchMedia('(max-width: 1023px)').matches;
  let dir = dirs.sd;
  const src = i => `${dir}${String(i + 1).padStart(3, '0')}.webp`;

  const blobs = new Array(count), low = new Array(count), hi = new Array(count), want = new Array(count);
  let geo = null, nat = null, top = 0, len = 1, p = 0, lastP = -1, lastKey = '', dirSign = 1, queued = false, near = false, gen = 0;
  let ring = 24;

  // recorte "cover" (px do arquivo) e tamanho final = pixels que a tela mostra (DPR até 2, nunca mais que o arquivo)
  const geometry = () => {
    if (!nat) return null;
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const ca = alpha ? nat.w / nat.h : r.width / Math.max(r.height, 1), fa = nat.w / nat.h;
    const sw = ca > fa ? nat.w : Math.round(nat.h * ca), sh = ca > fa ? Math.round(nat.w / ca) : nat.h;
    const k = Math.min(1, (r.width * dpr) / sw);
    return { sx: Math.round((nat.w - sw) / 2), sy: Math.round((nat.h - sh) * focusY), sw, sh, w: Math.round(sw * k), h: Math.round(sh * k) };
  };
  // qual conjunto de arquivos: HD (1080×1920) só quando a tela realmente mostra mais que o SD (720×1280)
  const pickDir = () => {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    // aberto como arquivo (pacote, sem servidor) cada quadro vira uma <img> inteira na memória: fica no SD
    dir = !fileMode && (dirs.sdW ? r.width * dpr > dirs.sdW : r.height * dpr > 1350) ? dirs.hd : dirs.sd;   // nunca amplia o SD
  };
  const measure = () => {
    top = sec.getBoundingClientRect().top + scrollY; len = Math.max(sec.offsetHeight - innerHeight, 1);
    const g = geometry();
    if (g && (!geo || g.w !== geo.w || g.h !== geo.h || g.sw !== geo.sw || g.sy !== geo.sy)) {
      geo = g; gen++; canvas.width = g.w; canvas.height = g.h; lastKey = '';
      // orçamento da janela em resolução total: 200 MB no desktop (320 MB com 8 GB ou mais), 110 MB no celular
      const mem = navigator.deviceMemory || 4, budget = mobile ? (mem >= 6 ? 160e6 : 110e6) : (mem >= 8 ? 320e6 : 200e6);
      ring = clamp(Math.floor(budget / (g.w * g.h * 4)), 12, count);
      for (let i = 0; i < count; i++) { low[i]?.close?.(); hi[i]?.close?.(); low[i] = hi[i] = undefined; want[i] = 0; }
      for (let i = 0; i < count; i++) if (blobs[i]) decodeLow(i);
      plan();
    }
  };

  // ---------- decodificação (fila com prioridade, 4 em paralelo no desktop e 3 no celular, fora da thread principal) ----------
  const crop = (b, w, h) => createImageBitmap(b, geo.sx, geo.sy, geo.sw, geo.sh, { resizeWidth: w, resizeHeight: h, resizeQuality: w < geo.w ? 'medium' : 'high' });
  const decodeLow = i => {
    if (fileMode) { low[i] = blobs[i]; return; }
    const mine = gen;
    crop(blobs[i], Math.max(1, Math.round(geo.w / 2)), Math.max(1, Math.round(geo.h / 2)))
      .then(bm => { if (mine !== gen) return bm.close(); low[i] = bm; if (i === shown()) { lastKey = ''; schedule(); } });
  };
  let busy = 0;
  const shown = () => Math.round(map(p) * (count - 1));
  const plan = () => {                 // marca a janela desejada a partir da posição e do sentido
    if (!near || !geo) return;
    // cabe tudo no orçamento: decodifica todos uma vez e não descarta nada (inverter o sentido não custa nada)
    const all = ring >= count, c = shown(), ahead = Math.ceil(ring * 0.6), behind = ring - ahead;
    for (let i = 0; i < count; i++) {
      const d = (i - c) * dirSign;
      if (all || (d >= -behind && d <= ahead)) { if (!want[i]) want[i] = 1; continue; }   // 2 = decodificando: mantém
      want[i] = 0;
      if (hi[i] && hi[i] !== blobs[i]) { hi[i].close(); hi[i] = undefined; }
    }
    pump();
  };
  const pump = () => {
    if (fileMode) return;
    const other = active && active !== sec;
    if (other) waiting.add(pump); else waiting.delete(pump);
    while (busy < (other ? 1 : mobile ? 3 : 4)) {
      const c = shown(); let best = -1, bd = 1e9;
      for (let i = 0; i < count; i++) {
        if (!want[i] || hi[i] || !blobs[i] || want[i] === 2) continue;
        const d = Math.abs(i - c) + ((i - c) * dirSign < 0 ? 4 : 0);   // à frente primeiro
        if (d < bd) { bd = d; best = i; }
      }
      if (best < 0) return;
      want[best] = 2; busy++;
      const i = best, mine = gen;
      crop(blobs[i], geo.w, geo.h).then(bm => {
        if (mine !== gen || !want[i]) { bm.close(); if (mine === gen) want[i] = 0; return; }
        hi[i] = bm; want[i] = 1;
        if (Math.abs(i - map(p) * (count - 1)) < 1.5) { lastKey = ''; schedule(); }
      }).catch(() => { want[i] = 1; }).finally(() => { busy--; pump(); });
    }
  };

  // ---------- download: tudo, a partir da ponta por onde a cena vai entrar ----------
  let fetching = 0, order = [], started = false;
  const fetchNext = () => {
    while (fetching < 6 && order.length) {
      const i = order.shift(); if (blobs[i]) continue;
      fetching++;
      const get = fileMode
        ? (() => { const im = new Image(); im.src = src(i); return im.decode().then(() => im); })()
        : fetch(src(i), { priority: Math.abs(i - shown()) < ring ? 'high' : 'low' }).then(r => { if (!r.ok) throw 0; return r.blob(); });
      get.then(async b => {
        blobs[i] = b;
        if (!nat) {
          if (fileMode) nat = { w: b.naturalWidth, h: b.naturalHeight };
          else { const t = await createImageBitmap(b); nat = { w: t.width, h: t.height }; t.close(); }
          measure();
        } else if (geo) { decodeLow(i); if (fileMode) hi[i] = b; else if (want[i] === 1 && !hi[i]) pump(); }
        if (fileMode && geo) hi[i] = b;
      }).catch(() => {}).finally(() => { fetching--; fetchNext(); });
    }
  };
  const start = () => {
    pickDir();
    const fromEnd = sec.getBoundingClientRect().top < 0;          // vindo de baixo: a cena entra pelo último quadro
    // grosso -> fino: as pontas, depois o meio de cada intervalo, recursivamente (a ponta de entrada primeiro)
    const seen = new Uint8Array(count), out = [];
    const add = i => { if (i >= 0 && i < count && !seen[i]) { seen[i] = 1; out.push(i); } };
    add(fromEnd ? count - 1 : 0); add(fromEnd ? 0 : count - 1);
    for (let step = count - 1; step >= 1; step = Math.floor(step / 2)) {
      for (let i = 0; i < count; i += step) add(fromEnd ? count - 1 - i : i);
      if (step === 1) break;
    }
    // os 6 primeiros quadros a partir da entrada vêm logo depois das pontas (a primeira rolagem é a mais comum)
    for (let k = 1; k <= 6; k++) { const i = fromEnd ? count - 1 - k : k; const j = out.indexOf(i); if (j > 2) { out.splice(j, 1); out.splice(2, 0, i); } }
    order = out;
    if (fromEnd) { p = 1; lastP = 1; dirSign = -1; }
    fetchNext();
  };

  // ---------- desenho ----------
  const blit = (bm, isLow) => {
    if (alpha && ctx.globalAlpha === 1) ctx.clearRect(0, 0, geo.w, geo.h);
    if (bm instanceof HTMLImageElement) ctx.drawImage(bm, geo.sx, geo.sy, geo.sw, geo.sh, 0, 0, geo.w, geo.h);
    else if (isLow) ctx.drawImage(bm, 0, 0, geo.w, geo.h);
    else ctx.drawImage(bm, 0, 0);
  };
  const pick = i => (hi[i] ? [hi[i], false] : low[i] ? [low[i], true] : null);
  const below = i => { for (let k = i; k >= 0; k--) if (pick(k)) return k; return -1; };
  const above = i => { for (let k = i; k < count; k++) if (pick(k)) return k; return -1; };
  const draw = () => {
    if (!geo) return;
    const f = map(p) * (count - 1), a = Math.floor(f), b = Math.min(a + 1, count - 1), t = f - a;
    // quadros que vão ser misturados: os vizinhos de f ou, se algum ainda não chegou, os mais próximos disponíveis
    let ia = pick(a) ? a : below(a), ib = pick(b) ? b : above(b);
    if (ia < 0 && ib < 0) return;
    if (ia < 0) ia = ib; if (ib < 0) ib = ia;
    if (ia !== a || ib !== b) sec.__miss = (sec.__miss || 0) + 1;              // QA: faltava quadro (misturou os vizinhos)
    const m = ib === ia ? 0 : clamp((f - ia) / (ib - ia), 0, 1);
    const mm = fade >= 1 || ia !== a || ib !== b ? m : clamp((t - (0.5 - fade / 2)) / Math.max(fade, 1e-3), 0, 1);
    const A = pick(ia), B = pick(ib);
    const key = `${ia}|${ib}|${mm.toFixed(3)}|${A[1]}|${B[1]}|${canvas.width}`;
    if (key === lastKey) return;
    ctx.globalAlpha = 1; blit(A[0], A[1]);
    if (mm > 0.004 && ib !== ia) { ctx.globalAlpha = mm; blit(B[0], B[1]); }
    if (A[1] || (B[1] && mm > 0.004)) sec.__soft = (sec.__soft || 0) + 1;      // QA: usou a versão leve
    ctx.globalAlpha = 1; lastKey = key; sec.__f = f; sec.classList.add('is-drawn');
  };
  const frame = () => {
    queued = false;
    const np = clamp((scrollY - top) / len, 0, 1);
    if (np !== lastP) {
      const ns = np > lastP ? 1 : -1, moved = Math.abs(Math.round(map(np) * (count - 1)) - shown());
      p = np; lastP = np; sec.__p = p; onProgress?.(p);
      setActive(sec, np > 0 && np < 1);
      if (ns !== dirSign || moved) { dirSign = ns; plan(); }
    }
    draw();
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  const onScroll = schedule;

  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !near) { near = true; if (!started) { started = true; start(); } plan(); schedule(); }
    else if (!e.isIntersecting && near) {                 // longe: devolve a memória da resolução total (a leve fica)
      near = false;
      for (let i = 0; i < count; i++) { if (hi[i] && hi[i] !== blobs[i]) hi[i].close(); if (!fileMode) hi[i] = undefined; want[i] = 0; }
    }
  }, { rootMargin: '300% 0px' }).observe(sec);
  addEventListener('scroll', onScroll, { passive: true });
  new ResizeObserver(() => { measure(); lastP = -1; schedule(); }).observe(document.body);
  addEventListener('resize', () => { measure(); schedule(); });
  measure(); frame();
  return { measure };
}
