import { clamp } from './utils.js';

// Motor único das duas cenas (pizza e chope): sequência de quadros presa ao scroll, sem perseguição.
// Base: startFrames() de sites/chopp-do-gus-editorial/js/modules/sequence.js (trilho alto + canvas + quadro mais próximo).
// O que mudou para acabar com a travada (medido; ver README):
//  - progresso = posição do scroll, direto. Sem lerp nem scrub: a cena nunca "corre atrás" nem continua andando sozinha.
//    A suavidade da roda vem do Lenis (main.js), que suaviza a PÁGINA; cena e página andam juntas.
//  - quadros decodificados fora da thread principal (fetch -> createImageBitmap), nunca no quadro em que aparecem.
//  - carga em 3 ondas: chave (1 a cada 8) antes de a seção entrar; janela de 10 quadros à frente da posição, no sentido
//    da rolagem; o resto aos poucos (2 por vez). Nada de baixar tudo de uma vez nem esperar o quadro estar na tela.
//  - quadros recortados e reduzidos ao tamanho do canvas na decodificação: desenho 1:1, sem escala por quadro.
//  - mistura curta entre quadros vizinhos (só no meio da passagem) para não haver degrau.
//  - offsets medidos só quando a página muda de tamanho (ResizeObserver): nenhuma leitura de layout por quadro.
export function sequence({ sec, canvas, count, dir, map = p => p, onProgress, fade = 0.4, focusY = 0.5 }) {
  // desynchronized: o canvas é apresentado sem esperar o resto da página (menos latência entre scroll e quadro)
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  const src = i => `${dir}${String(i + 1).padStart(3, '0')}.webp`;
  const blobs = new Array(count), frames = new Array(count), state = new Array(count);   // state: undefined | 'loading' | 'ok'
  let geo = null, top = 0, len = 1, vh = innerHeight, p = 0, lastP = -1, lastKey = '', dirSign = 1, queued = false, near = false, gen = 0;

  // Geometria: recorte "cover" do quadro (em px do arquivo) e tamanho final = pixels que a tela mostra, nunca mais que o
  // arquivo. Cada quadro já sai da decodificação recortado e reduzido a esse tamanho (createImageBitmap, fora da thread
  // principal), então o desenho por quadro é uma cópia 1:1, sem escala. Antes: 720×1280 escalado a cada quadro.
  let nat = null;
  const geometry = () => {
    if (!nat) return null;
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const ca = r.width / Math.max(r.height, 1), fa = nat.w / nat.h;
    const sw = ca > fa ? nat.w : Math.round(nat.h * ca), sh = ca > fa ? Math.round(nat.w / ca) : nat.h;
    const k = Math.min(1, (r.width * dpr) / sw);
    return { sx: Math.round((nat.w - sw) / 2), sy: Math.round((nat.h - sh) * focusY), sw, sh, w: Math.round(sw * k), h: Math.round(sh * k) };
  };
  const measure = () => {
    vh = innerHeight;
    top = sec.getBoundingClientRect().top + scrollY; len = Math.max(sec.offsetHeight - vh, 1);
    const g = geometry();
    if (g && (!geo || g.w !== geo.w || g.h !== geo.h || g.sw !== geo.sw)) {     // tamanho mudou: refaz os quadros já baixados
      geo = g; gen++; canvas.width = g.w; canvas.height = g.h; lastKey = '';
      for (let i = 0; i < count; i++) if (blobs[i]) bake(i);       // (forEach pularia as posições vazias)
    }
  };
  const bake = i => {
    if (blobs[i] instanceof HTMLImageElement) {                   // modo arquivo: a <img> já decodificada é o quadro
      frames[i] = blobs[i]; state[i] = 'ok'; lastKey = ''; schedule(); return Promise.resolve();
    }
    const g = geo, mine = gen;
    return createImageBitmap(blobs[i], g.sx, g.sy, g.sw, g.sh, { resizeWidth: g.w, resizeHeight: g.h, resizeQuality: 'high' })
      .then(bm => { if (mine !== gen) { bm.close(); return; } frames[i]?.close?.(); frames[i] = bm; state[i] = 'ok'; lastKey = ''; schedule(); });
  };

  let inflight = 0;
  const load = (i, hi) => {
    if (i < 0 || i >= count || state[i]) return;
    state[i] = 'loading'; inflight++;
    // aberto como arquivo (pacote de prévia, file://) o fetch é bloqueado: lê pela tag <img>, que o createImageBitmap aceita igual
    const get = location.protocol === 'file:'
      ? (() => { const im = new Image(); im.src = src(i); return im.decode().then(() => im); })()   // decode() é assíncrono: fora da thread principal
      : fetch(src(i), { priority: hi ? 'high' : 'low' }).then(r => r.blob());
    get.then(async b => {
      blobs[i] = b;
      if (!nat) { const t = b instanceof HTMLImageElement ? null : await createImageBitmap(b); nat = t ? { w: t.width, h: t.height } : { w: b.naturalWidth, h: b.naturalHeight }; t?.close(); measure(); }
      else return bake(i);
    }).catch(() => { state[i] = undefined; }).finally(() => { inflight--; pump(); });
  };
  const keys = Array.from({ length: count }, (_, i) => i).filter(i => i % 8 === 0).concat(count - 1);
  let fill = 0;
  const pump = () => {
    if (!near) return;
    const cur = Math.round(map(p) * (count - 1));
    for (let k = 0; k <= 10 && inflight < 4; k++) load(cur + k * dirSign, true);   // janela à frente
    for (let k = 1; k <= 3 && inflight < 4; k++) load(cur - k * dirSign, true);    // e um pouco atrás
    while (inflight < 2 && fill < count) load(fill++, false);                      // resto, devagar
  };

  const nearest = i => { for (let d = 0; d < count; d++) { if (frames[i - d]) return i - d; if (frames[i + d]) return i + d; } return -1; };
  const blit = bm => bm instanceof HTMLImageElement
    ? ctx.drawImage(bm, geo.sx, geo.sy, geo.sw, geo.sh, 0, 0, geo.w, geo.h)   // modo arquivo: recorta e escala no desenho
    : ctx.drawImage(bm, 0, 0);                                    // 1:1: o quadro já tem o tamanho do canvas
  const draw = () => {
    const f = map(p) * (count - 1), a = Math.floor(f), b = Math.min(a + 1, count - 1), t = f - a;
    const m = fade ? clamp((t - (0.5 - fade / 2)) / fade, 0, 1) : (t >= 0.5 ? 1 : 0);
    const key = `${a}|${b}|${m.toFixed(2)}|${canvas.width}`;
    if (key === lastKey) return;
    if (frames[a] && frames[b]) {
      ctx.globalAlpha = 1; blit(frames[a]);
      if (m > 0.01 && b !== a) { ctx.globalAlpha = m; blit(frames[b]); }
    } else {
      const k = nearest(Math.round(f)); if (k < 0) return;
      sec.__miss = (sec.__miss || 0) + 1;                         // QA: quadro pedido ainda não estava pronto
      ctx.globalAlpha = 1; blit(frames[k]);
    }
    ctx.globalAlpha = 1; lastKey = key; sec.__f = f; sec.classList.add('is-drawn');
  };
  const frame = () => {
    queued = false;
    const np = clamp((scrollY - top) / len, 0, 1);
    if (np !== lastP) { dirSign = np >= lastP ? 1 : -1; p = np; lastP = np; sec.__p = p; onProgress?.(p); pump(); }
    draw();
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };

  // começa a preparar 2 telas antes: quadros-chave primeiro (alta prioridade), depois a janela
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting || near) return; near = true;
    keys.forEach(i => load(i, true)); pump(); schedule();
  }, { rootMargin: '200% 0px' }).observe(sec);
  addEventListener('scroll', schedule, { passive: true });
  // remede quando a página muda de altura (fontes, imagens): sem isso o início da cena ficava no lugar errado
  new ResizeObserver(() => { measure(); lastP = -1; schedule(); }).observe(document.body);
  addEventListener('resize', () => { measure(); schedule(); });
  measure(); frame();
  return { measure };
}
