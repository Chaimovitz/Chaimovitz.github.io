// O neon acende no fim: a foto real do letreiro vira uma cena 2.5D (parede ao fundo, letreiro um pouco à frente,
// salão mais perto). A câmera assenta conforme a pessoa chega ao fim e o neon acende quando a noite cai.
// Nada é inventado: cor e forma vêm da foto; os mapas (tubos, halo, profundidade) foram tirados dela.
// Sem WebGL ou com movimento reduzido, fica a foto parada (o <img> do HTML).
const fim = document.querySelector('[data-fim]');
const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (fim && !reduzir) {
  const fig = fim.querySelector('.fim-foto');
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); iniciar(); } }, { rootMargin: '150% 0px' });
  io.observe(fim);

  function iniciar() {
    const cv = document.createElement('canvas'); cv.className = 'fim-gl'; cv.setAttribute('aria-hidden', 'true');
    const gl = cv.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!gl) return;
    const VS = 'attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}';
    const FS = `precision mediump float;varying vec2 v;
uniform sampler2D uB,uM;uniform vec2 uR,uI,uPos,uCam;uniform float uZ,uOn,uP;
void main(){
  float A=uR.x/uR.y,I=uI.x/uI.y;vec2 f=vec2(1.),o=vec2(0.);
  if(A>I){f.y=I/A;o.y=(1.-f.y)*uPos.y;}else{f.x=A/I;o.x=(1.-f.x)*uPos.x;}
  vec2 uv=o+v*f;
  vec2 foco=vec2(.48,.19);uv=foco+(uv-foco)/uZ;           // aproxima em direção ao letreiro
  float d=texture2D(uM,uv).b;uv+=uCam*(d-.3);              // paralaxe pela profundidade
  vec3 c=texture2D(uB,uv).rgb;vec3 m=texture2D(uM,uv).rgb;
  float lum=dot(c,vec3(.3,.59,.11));
  vec3 tuboOff=vec3(lum)*vec3(.5,.46,.47)*.55+vec3(.075,.065,.07);  // vidro apagado, frio e opaco
  vec3 off=mix(c*(1.-m.g*.85),tuboOff,m.r);                // neon apagado: tubos foscos, parede sem o reflexo
  vec3 col=mix(off,c,uOn);
  col+=uOn*m.g*m.g*vec3(1.,.42,.36)*.16;                    // brilho que transborda do letreiro
  col*=mix(.7,1.,smoothstep(0.,.65,uP));                     // o salão vai ganhando luz
  vec2 q=v-.5;col*=1.-dot(q,q)*.35;
  gl_FragColor=vec4(col,1.);}`;
    const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null; };
    const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS); if (!vs || !fs) return;
    const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const la = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n), L = {}; for (const n of ['uR', 'uPos', 'uCam', 'uZ', 'uP', 'uOn']) L[n] = U(n);
    const tex = (img, unit) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); };
    const carregar = src => new Promise((ok, erro) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = erro; i.src = src; });

    Promise.all([carregar('assets/img/neon-salao-2200.webp'), carregar('assets/img/neon-mapas.png')]).then(([b, m]) => {
      tex(b, 0); tex(m, 1); gl.uniform1i(U('uB'), 0); gl.uniform1i(U('uM'), 1); gl.uniform2f(U('uI'), b.naturalWidth, b.naturalHeight);
      fig.prepend(cv); fim.classList.add('gl');
      let p = 0, on = 0, alvo = 0, t0 = 0, anim = 0, pedido = 0;
      const suave = x => x * x * (3 - 2 * x);
      // acender: um tremor curto (como reator de neon) e depois firme; apagar: rápido
      const acender = t => { const k = [[0, 0], [.08, .55], [.13, .08], [.24, .8], [.3, .3], [.42, 1], [.62, 1]];
        for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const a = k[i - 1], z = k[i]; return a[1] + (z[1] - a[1]) * (t - a[0]) / (z[0] - a[0]); } return 1; };
      const medida = () => { const r = fig.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, innerWidth < 900 ? 1.5 : 1.75);
        const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); } };
      const desenhar = () => { pedido = 0; const r0 = fim.getBoundingClientRect(); if (r0.bottom < 0 || r0.top > innerHeight) return; medida();
        const e = suave(Math.min(1, p / .85)), r = 1 - e;
        gl.uniform2f(L.uR, cv.width, cv.height); const cel = innerWidth < 900; gl.uniform2f(L.uPos, cel ? .47 : .5, cel ? .04 : .06);
        gl.uniform2f(L.uCam, -.014 * r, .05 * r); gl.uniform1f(L.uZ, 1 + .07 * r); gl.uniform1f(L.uP, p); gl.uniform1f(L.uOn, on);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
      const pedir = () => { if (!pedido) pedido = requestAnimationFrame(desenhar); };
      const passo = now => { const t = (now - t0) / 1000;
        if (alvo) { on = acender(t); if (t < .62) anim = requestAnimationFrame(passo); else { on = 1; anim = 0; } }
        else { on = Math.max(0, on - .08); if (on > 0) anim = requestAnimationFrame(passo); else anim = 0; }
        desenhar(); };
            const atualizar = np => { p = np; const quer = p > .38 ? 1 : (p < .33 ? 0 : alvo);
        if (quer !== alvo) { alvo = quer; t0 = performance.now(); cancelAnimationFrame(anim); anim = requestAnimationFrame(passo); }
        pedir(); };
      document.addEventListener('bb:fim', e => atualizar(e.detail));
      addEventListener('resize', pedir);
      cv.addEventListener('webglcontextlost', ev => { ev.preventDefault(); fim.classList.remove('gl'); cv.remove(); });
      atualizar(parseFloat(getComputedStyle(fim).getPropertyValue('--p')) || 0);
      if (p > .38) { alvo = 1; on = 1; }
      desenhar();
    }).catch(() => {});
  }
}
