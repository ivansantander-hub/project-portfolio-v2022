/**
 * shader.js — fondo generativo con WebGL.
 *
 * Ruido FBM con domain warping y paleta de cosenos. Es la pieza que da vida al
 * fondo: la UI encima es monocroma justamente para no competir con él.
 *
 * Degrada en tres escalones:
 *   1. WebGL disponible          → shader animado
 *   2. Sin WebGL                 → gradiente CSS estático (se deja el que ya
 *                                  trae el elemento, no se toca nada)
 *   3. prefers-reduced-motion    → un solo frame, sin bucle de animación
 */
(() => {
  const canvas = document.getElementById('shader-bg');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, powerPreference: 'low-power' });
  if (!gl) {
    canvas.dataset.fallback = 'css';
    return;
  }

  const VERT = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      v_uv = a_pos * 0.5 + 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }`;

  const FRAG = `
    precision mediump float;
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2  u_res;
    uniform float u_light;

    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }

    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      mat2 R = mat2(0.8, 0.6, -0.6, 0.8);
      for (int i = 0; i < 5; i++) { v += a * noise(p); p = R * p * 2.02; a *= 0.5; }
      return v;
    }

    /* Paleta de cosenos parametrizada: a + b·cos(2π(c·t + d)).
       Los cuatro vectores llegan por uniform, así que cambiar la paleta del
       sitio cambia el fondo sin recompilar el shader. */
    uniform vec3 u_pa;
    uniform vec3 u_pb;
    uniform vec3 u_pc;
    uniform vec3 u_pd;

    vec3 palette(float t){
      return u_pa + u_pb * cos(6.28318 * (u_pc * t + u_pd));
    }

    void main(){
      vec2 uv = v_uv;
      uv.x *= u_res.x / u_res.y;

      float t = u_time * 0.06;

      vec2 q = vec2(fbm(uv * 2.1 + t * 0.30),
                    fbm(uv * 2.1 + vec2(5.2, 1.3) + t * 0.20));
      vec2 r = vec2(fbm(uv * 2.1 + q * 3.4 + vec2(1.7, 9.2) + t * 0.15),
                    fbm(uv * 2.1 + q * 3.4 + vec2(8.3, 2.8) + t * 0.10));
      float n = fbm(uv * 2.1 + r * 1.8);

      vec3 col = palette(n * 1.6 + t * 0.18);
      col = mix(col, palette(length(q) * 2.2 + t * 0.08), 0.45);

      float shade = smoothstep(0.18, 0.92, n);

      /* Tema oscuro: las zonas bajas caen a negro para que el texto claro
         siempre tenga dónde apoyarse. */
      float vig = max(1.0 - 0.72 * length(v_uv - 0.5), 0.0);
      vec3 dark = col * (0.25 + 0.95 * shade) * vig;

      /* Tema claro: NO es el oscuro invertido — eso lo dejaba lavado y la
         página quedaba en blanco plano. Es un lavado pastel propio: se
         conserva el tono y se empuja hacia el blanco, con las zonas densas
         un poco más saturadas para que se vea la forma del ruido. */
      vec3 light = mix(vec3(1.0), col, 0.26 + 0.34 * shade);

      vec3 outCol = mix(dark, light, u_light);
      float alpha = mix(0.30 + 0.70 * shade, 0.62 + 0.30 * shade, u_light);

      gl_FragColor = vec4(outCol, alpha);
    }`;

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('[shader]', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.dataset.fallback = 'css'; return; }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.dataset.fallback = 'css'; return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uLight = gl.getUniformLocation(prog, 'u_light');
  const uPa = gl.getUniformLocation(prog, 'u_pa');
  const uPb = gl.getUniformLocation(prog, 'u_pb');
  const uPc = gl.getUniformLocation(prog, 'u_pc');
  const uPd = gl.getUniformLocation(prog, 'u_pd');

  /* Coeficientes de la paleta de cosenos por tema del sitio.
     a = punto medio, b = amplitud, c = frecuencia, d = fase por canal. */
  /* Las fases (d) van muy juntas a propósito: si se separan, el coseno recorre
     todo el círculo de tono y el resultado promedia a barro. Se comprobó —
     bermellón salía verdoso y cobre casi gris. Manteniendo las fases juntas,
     los tres canales suben y bajan a la vez y el tono se conserva; la
     jerarquía entre canales (a y b) es la que define el color. */
  const PALETTES = {
    // musgo → oliva → lima. Verde AMARILLO: el ácido típico (#22C55E) es azulado
    chartreuse:  { a: [0.26, 0.34, 0.12], b: [0.24, 0.30, 0.10], c: [1.0, 1.0, 0.9], d: [0.12, 0.20, 0.02] },
    // humo cálido con vetas rojas: el rojo domina y el resto se queda gris
    vermilion:   { a: [0.46, 0.19, 0.16], b: [0.34, 0.09, 0.07], c: [1.0, 1.0, 1.0], d: [0.00, 0.03, 0.05] },
    // ultramar → cobalto. El azul pesa poco en luminancia, así que va más alto
    ultramarine: { a: [0.16, 0.27, 0.60], b: [0.12, 0.23, 0.40], c: [1.0, 1.0, 1.0], d: [0.08, 0.11, 0.15] },
    // óxido → cardenillo → humo
    copper:      { a: [0.48, 0.24, 0.12], b: [0.34, 0.16, 0.07], c: [1.0, 1.1, 0.9], d: [0.02, 0.09, 0.26] },
  };

  function applyPalette() {
    const name = document.documentElement.dataset.palette || 'chartreuse';
    const p = PALETTES[name] || PALETTES.chartreuse;
    gl.uniform3fv(uPa, p.a);
    gl.uniform3fv(uPb, p.b);
    gl.uniform3fv(uPc, p.c);
    gl.uniform3fv(uPd, p.d);
  }

  /* Se renderiza a media resolución: es ruido difuso, nadie nota la diferencia
     y el coste en GPU baja a la cuarta parte. */
  const SCALE = 0.5;
  let w = 0, h = 0;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    /* Medir el propio canvas y no innerWidth: en una pestaña en segundo plano
       innerWidth puede reportar 0 y el buffer se quedaba en 1×1. */
    const cw = canvas.clientWidth || innerWidth || 1280;
    const ch = canvas.clientHeight || innerHeight || 800;
    const nw = Math.max(2, Math.floor(cw * dpr * SCALE));
    const nh = Math.max(2, Math.floor(ch * dpr * SCALE));
    if (nw === w && nh === h) return;
    w = canvas.width = nw;
    h = canvas.height = nh;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }

  const isLight = () => {
    const t = document.documentElement.dataset.theme;
    if (t === 'light') return 1;
    if (t === 'dark') return 0;
    return matchMedia('(prefers-color-scheme: light)').matches ? 1 : 0;
  };

  let lastTime = 4.0;

  function draw(time) {
    lastTime = time;
    gl.uniform1f(uTime, time);
    gl.uniform1f(uLight, isLight());
    applyPalette();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  resize();
  // Primer frame inmediato: si el rAF nunca corre (pestaña en segundo plano),
  // el fondo igual queda pintado en vez de transparente.
  draw(4.0);
  addEventListener('resize', () => { resize(); if (paused) draw(frozenAt); }, { passive: true });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  const frozenAt = 8.0;   // un frame con buena composición, no el t=0 plano

  if (paused) {
    draw(frozenAt);
  } else {
    let start = null;
    let running = true;

    const loop = ts => {
      if (!running) return;
      if (start === null) start = ts;
      draw((ts - start) / 1000);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // No quemar GPU en una pestaña que nadie está mirando
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { running = false; }
      else if (!running) { running = true; start = null; requestAnimationFrame(loop); }
    });
  }

  /* Repintar SIEMPRE al cambiar de tema, no solo cuando está congelado: si el
     rAF está detenido (pestaña en segundo plano, o el navegador no compone),
     el fondo se quedaba con los colores del tema anterior. */
  new MutationObserver(() => draw(lastTime))
    .observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme', 'data-palette'],
    });
})();
