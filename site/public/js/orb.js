/**
 * orb.js — esfera del hero.
 *
 * Ocupa el espacio libre a la derecha del titular. Gira despacio sola y el
 * cursor la inclina: la luz y el ruido de superficie se desplazan siguiendo al
 * puntero, con amortiguación para que nunca se mueva de golpe.
 *
 * Es acompañamiento, no protagonista. Por eso:
 *   - la respuesta al cursor es suave y de recorrido corto
 *   - se apaga cuando la pestaña no está visible
 *   - con prefers-reduced-motion se pinta un frame y se queda quieta
 *   - sin WebGL simplemente no aparece; el hero funciona igual
 */
(() => {
  const canvas = document.getElementById('hero-orb');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, powerPreference: 'low-power' });
  if (!gl) { canvas.remove(); return; }

  const VERT = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main(){ v_uv = a_pos; gl_Position = vec4(a_pos, 0.0, 1.0); }`;

  const FRAG = `
    precision mediump float;
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2  u_res;
    uniform vec2  u_pointer;   // -1..1, ya amortiguado
    uniform vec3  u_accent;
    uniform float u_light;

    float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }

    float noise(vec3 p){
      vec3 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float n000 = hash(i), n100 = hash(i + vec3(1,0,0));
      float n010 = hash(i + vec3(0,1,0)), n110 = hash(i + vec3(1,1,0));
      float n001 = hash(i + vec3(0,0,1)), n101 = hash(i + vec3(1,0,1));
      float n011 = hash(i + vec3(0,1,1)), n111 = hash(i + vec3(1,1,1));
      return mix(mix(mix(n000,n100,f.x), mix(n010,n110,f.x), f.y),
                 mix(mix(n001,n101,f.x), mix(n011,n111,f.x), f.y), f.z);
    }

    float fbm(vec3 p){
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
      return v;
    }

    void main(){
      vec2 uv = v_uv;
      uv.x *= u_res.x / u_res.y;

      // El puntero desplaza la esfera muy poco: es un guiño, no un arrastre
      vec2 c = uv - u_pointer * 0.09;
      float d = length(c);
      float r = 0.72;

      // Borde suave: sin antialiasing la silueta se ve escalonada
      float edge = smoothstep(r, r - 0.012, d);
      if (edge <= 0.001) discard;

      // Normal de la esfera a partir de la distancia al centro
      float z = sqrt(max(r * r - d * d, 0.0)) / r;
      vec3 n = normalize(vec3(c / r, z));

      // La luz sigue al cursor
      vec3 lightDir = normalize(vec3(u_pointer.x * 0.6 - 0.35, u_pointer.y * 0.6 + 0.45, 0.75));
      float diff = max(dot(n, lightDir), 0.0);

      // Ruido en la superficie, rotando despacio en su propio eje
      float t = u_time * 0.05;
      float grain = fbm(n * 2.6 + vec3(t, t * 0.7, -t * 0.4));

      // Fresnel: el borde se enciende, como vidrio
      float fres = pow(1.0 - z, 2.4);

      vec3 col = u_accent * (0.16 + 0.62 * diff);
      col = mix(col, u_accent * 1.25, grain * 0.42);
      col += u_accent * fres * 0.75;

      // En tema claro se aclara para no convertirse en una mancha oscura
      col = mix(col, mix(vec3(1.0), col, 0.55), u_light);

      float alpha = edge * (0.30 + 0.42 * diff + 0.30 * fres);
      gl_FragColor = vec4(col, alpha * 0.82);
    }`;

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('[orb]', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.remove(); return; }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uPointer = gl.getUniformLocation(prog, 'u_pointer');
  const uAccent = gl.getUniformLocation(prog, 'u_accent');
  const uLight = gl.getUniformLocation(prog, 'u_light');

  /* El acento sale del token CSS: si cambia la paleta, la esfera cambia con
     ella sin tocar este archivo. */
  function accentRGB() {
    const hex = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim().replace('#', '');
    if (hex.length !== 6) return [0.33, 0.44, 1.0];
    return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  }

  const isLight = () => {
    const t = document.documentElement.dataset.theme;
    if (t === 'light') return 1;
    if (t === 'dark') return 0;
    return matchMedia('(prefers-color-scheme: light)').matches ? 1 : 0;
  };

  let w = 0, h = 0;
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth || 400, ch = canvas.clientHeight || 400;
    const nw = Math.max(2, Math.round(cw * dpr)), nh = Math.max(2, Math.round(ch * dpr));
    if (nw === w && nh === h) return;
    w = canvas.width = nw; h = canvas.height = nh;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }

  // Objetivo y valor amortiguado: el seguimiento nunca es instantáneo
  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  let lastTime = 0;

  function draw(time) {
    lastTime = time;
    curX += (targetX - curX) * 0.055;
    curY += (targetY - curY) * 0.055;
    gl.uniform1f(uTime, time);
    gl.uniform2f(uPointer, curX, curY);
    gl.uniform3fv(uAccent, accentRGB());
    gl.uniform1f(uLight, isLight());
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  resize();
  draw(6.0);
  addEventListener('resize', () => { resize(); draw(lastTime); }, { passive: true });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    new MutationObserver(() => draw(lastTime))
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-palette'] });
    return;
  }

  // Solo punteros finos: en táctil no hay cursor que seguir
  if (matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', e => {
      targetX = (e.clientX / innerWidth) * 2 - 1;
      targetY = 1 - (e.clientY / innerHeight) * 2;
    }, { passive: true });
  }

  let start = null, running = true;
  const loop = ts => {
    if (!running) return;
    if (start === null) start = ts;
    draw((ts - start) / 1000);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false;
    else if (!running) { running = true; start = null; requestAnimationFrame(loop); }
  });
})();
