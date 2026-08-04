/**
 * hero-visual.js — la pieza visual del hero. Cuatro variantes intercambiables.
 *
 *   texto   el nombre renderizado a textura y distorsionado: la tipografía ES la pieza
 *   topo    curvas de nivel a pantalla completa; el puntero levanta una cresta
 *   ascii   el campo cuantizado a glifos: alto contraste, inconfundiblemente técnico
 *   malla   plano en perspectiva que se aleja, ondulando despacio
 *
 * Las cuatro son A SANGRE sobre todo el hero, no un objeto en una caja a la
 * derecha. Ese era el defecto de la tanda anterior: cambiaba la técnica pero
 * la forma seguía siendo un círculo dentro de un recuadro, y contra un fondo
 * de ruido a pantalla completa cualquier cosa sutil resultaba imperceptible.
 *
 * Por eso aquí la pieza ocupa el hero entero y el fondo se atenúa: no pueden
 * ser las dos protagonistas.
 *
 * Se elige con `data-visual` en <html>, que pone site.config.mjs.
 */
(() => {
  const canvas = document.getElementById('hero-visual');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false });
  if (!gl) { canvas.remove(); return; }

  const RUIDO = `
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      mat2 R = mat2(0.8, 0.6, -0.6, 0.8);
      for (int i = 0; i < 5; i++) { v += a * noise(p); p = R * p * 2.02; a *= 0.5; }
      return v;
    }`;

  const CABECERA = `
    precision highp float;
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2  u_res;
    uniform vec2  u_pointer;
    uniform vec3  u_accent;
    uniform float u_light;
    uniform sampler2D u_tex;
    ${RUIDO}`;

  const VERT = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`;

  /* ══ TEXTO LÍQUIDO ══════════════════════════════════════════════════════
     El nombre se pinta en un canvas 2D, se sube como textura y se desplaza en
     el shader. Cada canal se muestrea con un desfase distinto: de ahí la
     separación cromática en los bordes. La tipografía deja de ser algo que el
     efecto acompaña y pasa a ser el efecto. */
  const FRAG_TEXTO = `${CABECERA}
    void main(){
      vec2 uv = v_uv;
      vec2 ar = vec2(u_res.x / u_res.y, 1.0);

      // Cercanía al puntero: la distorsión es local, no global
      float d = length((uv - (u_pointer * 0.5 + 0.5)) * ar);
      float cerca = smoothstep(0.55, 0.0, d);

      float t = u_time * 0.16;
      float n = fbm(uv * 3.2 + vec2(t, -t * 0.6));
      vec2 emp = vec2(n - 0.5, fbm(uv * 3.2 + 4.7 - vec2(t, 0.0)) - 0.5);

      float amp = 0.008 + 0.022 * cerca;
      vec2 off = emp * amp;

      float r = texture2D(u_tex, uv + off * 1.25).a;
      float g = texture2D(u_tex, uv + off).a;
      float b = texture2D(u_tex, uv + off * 0.75).a;

      float a = max(r, max(g, b));
      if (a <= 0.004) discard;

      vec3 base = mix(vec3(0.96), u_accent, 0.30);
      vec3 col = base * vec3(g) + u_accent * vec3(r - b) * 1.9;
      col = mix(col, mix(vec3(0.08), col, 0.85), u_light);
      gl_FragColor = vec4(col, a * 0.95);
    }`;

  /* ══ TOPOGRAFÍA ═════════════════════════════════════════════════════════
     Curvas de nivel sobre un campo de altura. Líneas finas y duras: por eso
     se ven contra un fondo difuso, donde una mancha suave se perdía. */
  const FRAG_TOPO = `${CABECERA}
    void main(){
      vec2 uv = v_uv;
      vec2 p = (uv - 0.5) * vec2(u_res.x / u_res.y, 1.0);

      // El puntero levanta una cresta: el terreno reacciona donde estás
      float d = length(p - u_pointer * 0.5);
      float cresta = 0.10 * exp(-d * d * 2.6);

      // Más lento que antes: a 0.045 el terreno mudaba de forma en pocos
      // segundos y se sentía inquieto, no ambiental.
      float t = u_time * 0.022;
      float h = fbm(p * 2.3 + vec2(t, t * 0.4)) + cresta;

      // Ancho de línea constante en pantalla, pese a la pendiente
      float lineas = 11.0;
      float f = fract(h * lineas);
      // fwidth puede no estar disponible; el mínimo garantiza línea visible
      float grosor = max(fwidth(h * lineas) * 1.6, 0.055);
      float linea = 1.0 - smoothstep(0.0, grosor, min(f, 1.0 - f));

      float alturaVal = smoothstep(0.30, 0.85, h);
      vec3 col = mix(u_accent * 0.55, mix(u_accent, vec3(1.0), 0.35), alturaVal);
      // En claro las líneas casi no se oscurecían (solo 20%): contra un fondo
      // pálido, el mismo acento saturado que se ve bien sobre negro se lee
      // como trazo muy marcado. Ahora se oscurece bastante más...
      col = mix(col, mix(vec3(0.05), col, 0.45), u_light);

      float a = linea * (0.42 + 0.55 * alturaVal + 0.22 * cresta);
      // ...y encima pesa menos: mismo motivo, doble ajuste porque color y
      // alfa se notaban igual de fuertes por separado.
      a *= mix(1.0, 0.6, u_light);
      if (a <= 0.008) discard;
      gl_FragColor = vec4(col, a);
    }`;

  /* ══ ASCII ══════════════════════════════════════════════════════════════
     Se muestrea un campo y su luminancia elige un glifo del atlas. El
     resultado es una rejilla de caracteres: máximo contraste y lectura
     inequívoca de "código". */
  const FRAG_ASCII = `${CABECERA}
    uniform float u_glifos;
    void main(){
      vec2 uv = v_uv;
      float celda = 13.0;
      vec2 rej = u_res / celda;
      vec2 celdaUV = floor(uv * rej) / rej;

      vec2 p = (celdaUV - 0.5) * vec2(u_res.x / u_res.y, 1.0);
      float d = length(p - u_pointer * 0.5);
      float halo = 0.15 * exp(-d * d * 2.4);

      float t = u_time * 0.05;
      float v = fbm(p * 2.6 + vec2(t, -t * 0.5)) + halo;
      v = smoothstep(0.22, 0.86, v);

      // Índice de glifo por luminancia, del vacío al más denso
      float idx = floor(v * (u_glifos - 0.001));
      vec2 dentro = fract(uv * rej);
      vec2 atlas = vec2((idx + dentro.x) / u_glifos, dentro.y);
      float g = texture2D(u_tex, atlas).a;
      if (g <= 0.02) discard;

      vec3 col = mix(u_accent * 0.75, vec3(1.0), v * 0.5);
      col = mix(col, mix(vec3(0.06), col, 0.8), u_light);
      gl_FragColor = vec4(col, g * (0.22 + 0.68 * v));
    }`;

  /* ══ MALLA ══════════════════════════════════════════════════════════════
     Un plano en perspectiva que se aleja, ondulando muy despacio. Misma
     familia estructurada que topo y ascii —líneas finas, nada difuso— pero
     con profundidad, que es lo que a las otras dos les falta.

     Sustituye a la variante de fluido: la tinta arrastrada por el cursor era
     lo contrario de delicado. */
  const FRAG_MALLA = `${CABECERA}
    void main(){
      vec2 uv = v_uv;
      vec2 p = (uv - 0.5) * vec2(u_res.x / u_res.y, 1.0);

      // Horizonte: por encima no hay plano que dibujar
      float horizonte = -0.10 + u_pointer.y * 0.015;
      if (p.y > -horizonte) discard;

      // Proyección al plano: el suelo se aleja hacia el horizonte
      float prof = 1.0 / (-p.y - horizonte + 0.02);
      vec2 mundo = vec2(p.x * prof, prof);

      float t = u_time * 0.055;
      mundo.y -= t * 1.6;

      // Ondulación lenta del terreno, con la influencia del puntero contenida
      float onda = fbm(vec2(mundo.x * 0.34, mundo.y * 0.22)) - 0.5;
      mundo.x += onda * 0.55 + u_pointer.x * 0.10;

      // Rejilla: líneas de ancho constante en pantalla
      vec2 celda = fract(mundo * 0.9);
      vec2 grosor = max(fwidth(mundo * 0.9) * 1.2, vec2(0.022));
      vec2 lin = 1.0 - smoothstep(vec2(0.0), grosor, min(celda, 1.0 - celda));
      float rejilla = max(lin.x, lin.y);
      if (rejilla <= 0.01) discard;

      // Desvanecido con la distancia: sin esto el horizonte se satura de moiré
      float lejania = smoothstep(34.0, 1.0, prof);
      float cerca = smoothstep(0.0, 0.22, -p.y - horizonte);

      vec3 col = mix(u_accent * 0.55, mix(u_accent, vec3(1.0), 0.28), lejania);
      col = mix(col, mix(vec3(0.05), col, 0.8), u_light);

      float a = rejilla * lejania * cerca * 0.95;
      if (a <= 0.008) discard;

      gl_FragColor = vec4(col, a);
    }`;

  /* ── Texturas generadas en canvas 2D ──────────────────────────────────── */
  function texturaDesdeCanvas(c) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    /* Un canvas 2D tiene el origen arriba-izquierda; WebGL lo espera
       abajo-izquierda. Sin este volteo el nombre salía del revés y espejado. */
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  /** El nombre, pintado grande y centrado, para la variante `texto`. */
  function texturaTexto() {
    const W = 2048, H = 1024;
    const c = Object.assign(document.createElement('canvas'), { width: W, height: H });
    const x = c.getContext('2d');
    const nombre = (document.querySelector('.hero__name')?.textContent || 'Iván Santander').trim();
    x.clearRect(0, 0, W, H);
    x.fillStyle = '#fff';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    let tam = 300;
    x.font = `700 ${tam}px Geist, system-ui, sans-serif`;
    // Encajar en el ancho disponible sin recortar
    while (x.measureText(nombre).width > W * 0.88 && tam > 40) {
      tam -= 10;
      x.font = `700 ${tam}px Geist, system-ui, sans-serif`;
    }
    x.fillText(nombre, W / 2, H / 2);
    return texturaDesdeCanvas(c);
  }

  /** Atlas de glifos de menos a más denso, para la variante `ascii`. */
  const GLIFOS = ' .:-=+*#%@';
  function texturaGlifos() {
    const cel = 64, n = GLIFOS.length;
    const c = Object.assign(document.createElement('canvas'), { width: cel * n, height: cel });
    const x = c.getContext('2d');
    x.clearRect(0, 0, c.width, c.height);
    x.fillStyle = '#fff';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.font = `600 ${cel * 0.78}px "Geist Mono", ui-monospace, monospace`;
    for (let i = 0; i < n; i++) x.fillText(GLIFOS[i], i * cel + cel / 2, cel / 2 + 2);
    return texturaDesdeCanvas(c);
  }

  /* ── Programas ────────────────────────────────────────────────────────── */
  function compilar(tipo, src) {
    const sh = gl.createShader(tipo);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('[hero-visual]', gl.getShaderInfoLog(sh)); return null;
    }
    return sh;
  }

  // fwidth() vive en una extensión en WebGL1; sin ella, topo pierde el
  // antialiasing de las líneas pero sigue dibujando.
  gl.getExtension('OES_standard_derivatives');

  const FRAGS = { texto: FRAG_TEXTO, topo: FRAG_TOPO, ascii: FRAG_ASCII, malla: FRAG_MALLA };
  const PREFIJO = '#extension GL_OES_standard_derivatives : enable\n';
  const cache = {};

  function obtener(nombre) {
    if (cache[nombre] !== undefined) return cache[nombre];
    const src = FRAGS[nombre] || FRAG_TOPO;
    const v = compilar(gl.VERTEX_SHADER, VERT);
    const f = compilar(gl.FRAGMENT_SHADER, PREFIJO + src);
    if (!v || !f) return (cache[nombre] = null);
    const p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn('[hero-visual]', gl.getProgramInfoLog(p));
      return (cache[nombre] = null);
    }
    const u = {};
    for (const k of ['u_time','u_res','u_pointer','u_accent','u_light','u_tex','u_glifos']) {
      u[k] = gl.getUniformLocation(p, k);
    }
    return (cache[nombre] = { prog: p, u, a: gl.getAttribLocation(p, 'a_pos') });
  }

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let texTexto = null, texGlifos = null;

  const accentRGB = () => {
    const hex = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim().replace('#', '');
    return hex.length === 6 ? [0,2,4].map(i => parseInt(hex.slice(i,i+2),16)/255) : [0.33,0.44,1];
  };
  const esClaro = () => {
    const t = document.documentElement.dataset.theme;
    if (t === 'light') return 1;
    if (t === 'dark') return 0;
    return matchMedia('(prefers-color-scheme: light)').matches ? 1 : 0;
  };
  const variante = () => document.documentElement.dataset.visual || 'topo';

  let w = 0, h = 0;
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2) * (variante() === 'texto' ? 1 : 0.7);
    const nw = Math.max(2, Math.round((canvas.clientWidth || 800) * dpr));
    const nh = Math.max(2, Math.round((canvas.clientHeight || 500) * dpr));
    if (nw === w && nh === h) return;
    w = canvas.width = nw; h = canvas.height = nh;
    gl.viewport(0, 0, w, h);
  }

  let tx = 0, ty = 0, cx = 0, cy = 0, ultimo = 0;

  function draw(time) {
    ultimo = time;
    /* Amortiguación lenta a propósito: el puntero insinúa, no arrastra.
       Con 0.075 el efecto se sentía nervioso y perseguía al ratón. */
    cx += (tx - cx) * 0.022; cy += (ty - cy) * 0.022;

    const v = obtener(variante());
    if (!v) return;

    gl.useProgram(v.prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(v.a);
    gl.vertexAttribPointer(v.a, 2, gl.FLOAT, false, 0, 0);

    const modo = variante();
    if (modo === 'texto') {
      if (!texTexto) texTexto = texturaTexto();
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texTexto);
      gl.uniform1i(v.u.u_tex, 0);
    } else if (modo === 'ascii') {
      if (!texGlifos) texGlifos = texturaGlifos();
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texGlifos);
      gl.uniform1i(v.u.u_tex, 0);
      gl.uniform1f(v.u.u_glifos, GLIFOS.length);
    }

    gl.uniform1f(v.u.u_time, time);
    gl.uniform2f(v.u.u_res, w, h);
    gl.uniform2f(v.u.u_pointer, cx, cy);
    gl.uniform3fv(v.u.u_accent, accentRGB());
    gl.uniform1f(v.u.u_light, esClaro());

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  resize();
  document.fonts.ready.then(() => { texTexto = null; resize(); draw(ultimo || 4); });
  draw(4.0);

  addEventListener('resize', () => { texTexto = null; resize(); draw(ultimo); }, { passive: true });
  new MutationObserver(() => { resize(); draw(ultimo); })
    .observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme', 'data-palette', 'data-visual'],
    });

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', e => {
      tx = (e.clientX / innerWidth) * 2 - 1;
      ty = 1 - (e.clientY / innerHeight) * 2;
    }, { passive: true });
  }

  let inicio = null, corriendo = true;
  const bucle = ts => {
    if (!corriendo) return;
    if (inicio === null) inicio = ts;
    draw((ts - inicio) / 1000);
    requestAnimationFrame(bucle);
  };
  requestAnimationFrame(bucle);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) corriendo = false;
    else if (!corriendo) { corriendo = true; inicio = null; requestAnimationFrame(bucle); }
  });
})();
