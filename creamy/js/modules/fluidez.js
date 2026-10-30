// Medidor de fluidez (só com ?fluidez na URL). Para validar no Chrome do Thomas, com GPU de verdade:
// abra a prévia com ?fluidez, role devagar e rápido pelas cenas, para baixo e para cima, e leia o painel.
// Mede o intervalo entre quadros de tela (rAF) SÓ enquanto a página rola, separado por cena e fora delas (controle).
// "Perdido" = intervalo maior que 1,5× o período da tela (detectado no início); "pausa" = intervalo > 100 ms.
export function initFluidez() {
  if (!/[?&]fluidez\b/.test(location.search) && !window.__FLUIDEZ) return;   // __FLUIDEZ: pacote de prévia (painel sempre ligado)
  const gl = document.createElement('canvas').getContext('webgl');
  const dbg = gl && gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'desconhecida';
  const soft = /swiftshader|llvmpipe|software/i.test(gpu);
  const box = document.createElement('pre');
  box.style.cssText = 'position:fixed;z-index:999;left:8px;bottom:8px;margin:0;padding:10px 12px;max-width:min(560px,95vw);font:11px/1.45 ui-monospace,Menlo,monospace;background:#2b1a12e6;color:#f7efe2;border-radius:6px;pointer-events:none;white-space:pre-wrap';
  const txt = document.createElement('span'); box.appendChild(txt);
  const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = 'Copiar resultado';
  btn.style.cssText = 'display:block;margin-top:8px;padding:6px 10px;font:600 12px system-ui,sans-serif;color:#2b1a12;background:#f6cf6a;border:0;border-radius:4px;cursor:pointer;pointer-events:auto';
  btn.addEventListener('click', async () => {
    const t = report();
    try { await navigator.clipboard.writeText(t); }
    catch { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); }
    btn.textContent = 'Copiado! Cole na conversa'; setTimeout(() => (btn.textContent = 'Copiar resultado'), 2500);
  });
  box.appendChild(btn); document.body.appendChild(box);

  const zones = { pizza: '#montagem', chope: '#chope' };
  const data = { pizza: [], chope: [], controle: [] };
  let period = 16.7, last = 0, lastY = scrollY, still = 0;
  // período da tela: mediana de 60 quadros parados
  const cal = []; const calib = t => { if (last) cal.push(t - last); last = t; if (cal.length < 90) requestAnimationFrame(calib); else { cal.sort((a, b) => a - b); period = cal[30]; last = 0; requestAnimationFrame(loop); } };   // percentil 33 de 90: imune a quadros lentos de carga
  // calibra só depois de a página carregar e assentar (durante a carga a tela parece mais lenta do que é)
  const go = () => setTimeout(() => requestAnimationFrame(calib), 1200);
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
  const zoneAt = () => {
    for (const [k, sel] of Object.entries(zones)) { const r = document.querySelector(sel)?.getBoundingClientRect(); if (r && r.top <= 0 && r.bottom >= innerHeight) return k; }
    return 'controle';
  };
  function loop(t) {
    const y = scrollY, moving = y !== lastY;
    if (moving) still = 0; else still++;
    if (last && (moving || still < 3)) data[zoneAt()].push(t - last);   // só enquanto rola (e 2 quadros depois)
    last = t; lastY = y; requestAnimationFrame(loop);
  }
  const stat = a => {
    if (a.length < 20) return 'role por aqui para medir';
    const s = [...a].sort((x, y) => x - y), q = f => s[Math.min(s.length - 1, Math.floor(s.length * f))];
    const lost = a.filter(x => x > period * 1.5).length, pauses = a.filter(x => x > 100).length;
    return `${(1000 / q(0.5)).toFixed(0)} fps · p95 ${q(0.95).toFixed(1)} ms · perdidos ${(100 * lost / a.length).toFixed(1)}% · pausas ${pauses} · n=${a.length}`;
  };
  const report = () => `Creamy · fluidez\n${navigator.userAgent.match(/(Chrome|Edg|Firefox)\/[\d.]+/)?.[0] || ''} · ${location.protocol === 'file:' ? 'aberto como arquivo' : location.host}\n` + txt.textContent.split('\n').slice(1).join('\n');
  setInterval(() => {
    txt.textContent = `fluidez (?fluidez)\nGPU: ${gpu}${soft ? '\n⚠ renderização por SOFTWARE: números não valem como prova' : ''}\ntela: ${(1000 / period).toFixed(0)} Hz · DPR ${devicePixelRatio} · ${innerWidth}×${innerHeight}\n` +
      `pizza    ${stat(data.pizza)}\nchope    ${stat(data.chope)}\ncontrole ${stat(data.controle)}`;
  }, 500);
  window.__fluidez = () => ({ gpu, period, pizza: stat(data.pizza), chope: stat(data.chope), controle: stat(data.controle) });
}
