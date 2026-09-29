/* CRUDO//2000 — v3.
 * Un solo canvas WebGL a baja resolución, estirado con image-rendering: pixelated.
 *   1. scene: raymarching de un objeto líquido cromado (metaballs), anillos y nebulosa.
 *   2. post: señal — ondas del cursor, desgarros, aberración cromática, fósforo
 *      (se mezcla con el fotograma anterior), dithering y entrelazado.
 *   3. blit: copia el resultado al canvas.
 * Sin dependencias. Si no hay WebGL, queda un fondo CSS. */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s) => document.querySelector(s);

  const state = {
    t: 0, last: performance.now(), frame: 0,
    mouse: [0, 0], mouseTarget: [0, 0], mousePx: [innerWidth / 2, innerHeight / 2],
    pulse: 0, glitch: 0, hover: 0, hoverTarget: 0, crude: 0, crudeUntil: 0,
    channel: 0, channelShown: 0,
    scroll: 0, scale: innerWidth < 760 ? 0.3 : 0.36,
    ripples: [], nextGlitch: 6 + Math.random() * 8,
    freq: 101.3, running: true,
  };

  /* ── Arranque ──────────────────────────────────────────────────────── */
  const bootLines = [
    'detectando señal ............ OK',
    'montando CD-ROM (D:) ........ OK',
    'cargando texturas baratas ... OK',
    'calibrando cromo ............ OK',
    'renderizando mundo ..........',
  ];
  const bootLog = $('#boot-log');
  let entered = false;
  function enter() {
    if (entered) return;
    entered = true;
    root.classList.remove('is-booting');
    state.pulse = 1.2;
    pushRipple(0.5, 0.5, 1.4);
  }
  if (reduced) {
    enter();
  } else {
    bootLines.forEach((l, i) => setTimeout(() => { bootLog.textContent += l + '\n'; }, 280 + i * 330));
    setTimeout(enter, 3400);
  }
  $('#boot-enter').addEventListener('click', enter);
  addEventListener('keydown', (e) => { if (!entered && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); enter(); } });

  /* ── WebGL ─────────────────────────────────────────────────────────── */
  const canvas = $('#world');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
  if (!gl) { root.classList.add('no-gl'); }

  const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p*.5+.5; gl_Position = vec4(p,0.,1.); }`;

  const COMMON = `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform float uTime;
float h11(float p){ p = fract(p*.1031); p *= p+33.33; p *= p+p; return fract(p); }
float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float h31(vec3 p){ p = fract(p*.1031); p += dot(p, p.zyx+31.32); return fract((p.x+p.y)*p.z); }
float n3(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float a=.5, s=0.; for(int i=0;i<4;i++){ s+=a*n3(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=.5; } return s; }
`;

  const SCENE = COMMON + `
uniform vec2 uMouse; uniform float uPulse, uScroll, uHover, uChannel, uCrude;
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
float smin(float a, float b, float k){ float h = clamp(.5+.5*(b-a)/k, 0., 1.); return mix(b,a,h) - k*h*(1.-h); }
float sdTorus(vec3 p, vec2 t){ vec2 q = vec2(length(p.xz)-t.x, p.y); return length(q)-t.y; }

void pal(float i, out vec3 a, out vec3 b, out vec3 c){
  if (i < .5)      { a=vec3(1.,.12,.82); b=vec3(.1,.94,1.); c=vec3(.05,.0,.13); }
  else if (i < 1.5){ a=vec3(.71,1.,.1);  b=vec3(.54,.24,1.); c=vec3(.01,.05,.07); }
  else if (i < 2.5){ a=vec3(1.,.16,.1);  b=vec3(.12,.55,1.); c=vec3(.07,.0,.04); }
  else             { a=vec3(.72,1.,.42); b=vec3(.25,.75,.42); c=vec3(.01,.045,.02); }
}
vec3 A, B, C;

float T;
vec3 blobP[4];
void setup(){
  T = uTime;
  float m = 1. + uPulse*1.5;
  blobP[0] = vec3(sin(T*.31)*.25, cos(T*.23)*.2, 0.);
  blobP[1] = vec3(sin(T*.53)*1.05*m, sin(T*.41+1.)*.55, cos(T*.53)*.7);
  blobP[2] = vec3(cos(T*.37+2.)*.9, cos(T*.29)*.95*m, sin(T*.47)*.6);
  blobP[3] = vec3(uMouse.x*1.9, uMouse.y*1.3, .8);
}

// d, id (0 cuerpo, 1 anillos)
vec2 map(vec3 p){
  vec3 q = p;
  q.xz *= rot(T*.11 + uMouse.x*.35);
  q.xy *= rot(sin(T*.07)*.4 + uMouse.y*.2);
  float d = length(q-blobP[0]) - (1.02 + .06*sin(T*.9));
  d = smin(d, length(q-blobP[1]) - .52, .62);
  d = smin(d, length(q-blobP[2]) - .44, .58);
  d = smin(d, length(p-blobP[3]) - (.18 + .22*uHover + .12*uPulse), .7);
  float w = sin(q.x*3.1+T*.8)*sin(q.y*3.7-T*.6)*sin(q.z*2.9+T*.5);
  d += w*(.07 + .16*uPulse + .05*uHover) + (fbm(q*1.6+T*.15)-.5)*.16;

  vec3 r1 = p; r1.yz *= rot(1.15 + .12*sin(T*.2)); r1.xy *= rot(.3 + uScroll*1.2);
  vec3 r2 = p; r2.xz *= rot(T*.05); r2.yz *= rot(-.55 + uScroll*.8);
  float rings = min(sdTorus(r1, vec2(2.15 + .15*sin(T*.3), .014)), sdTorus(r2, vec2(2.75, .01)));
  rings = min(rings, sdTorus(r1, vec2(2.45, .006)));
  return d < rings ? vec2(d*.72, 0.) : vec2(rings, 1.);
}

vec3 nrm(vec3 p){
  vec2 e = vec2(.012, 0.);
  vec3 n = normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x, map(p+e.yxy).x-map(p-e.yxy).x, map(p+e.yyx).x-map(p-e.yyx).x));
  float lv = mix(7., 3., uCrude);           // facetas: CGI barato
  return normalize(floor(n*lv+.5)/lv);
}

// Entorno de estudio que refleja el cromo: cielo de color, horizonte que quema, suelo negro.
vec3 studio(vec3 r){
  float y = r.y;
  vec3 sky = mix(B*1.1, A*1.3, smoothstep(.0, .9, y));
  vec3 col = y > 0. ? sky : mix(vec3(.02, .0, .05), C*2., smoothstep(-.9, .0, y));
  col += vec3(1.6) * exp(-abs(y - .04)*22.);                                    // horizonte
  col += smoothstep(.93, 1., sin(atan(r.x, r.z)*5. + T*.4)) * step(.15, y) * 1.4; // softboxes
  col += A * smoothstep(.97, 1., sin(y*24. - T*.9)) * .8;                         // bandas de color
  return col;
}

vec3 space(vec3 rd, vec2 uv){
  float neb = fbm(rd*2.2 + vec3(0., T*.018, T*.01));
  float neb2 = fbm(rd*4.7 - vec3(T*.02, 0., 0.) + neb*1.6);
  vec3 col = C;
  col = mix(col, B*.42, smoothstep(.45, .85, neb2)*.8);
  col = mix(col, A*.38, smoothstep(.55, .95, neb)*.75);
  col += vec3(.18,.02,.3)*pow(max(0., 1.-length(uv)*.7), 2.);
  // estrellas
  vec3 sp = rd*180.; vec3 cell = floor(sp);
  float s = h31(cell);
  float star = step(.9965, s) * smoothstep(.55, .0, length(fract(sp)-.5));
  col += star * (.6+.4*sin(T*3.+s*90.)) * mix(vec3(1.), B, .4);
  // anillos radiales psicodélicos
  float r = length(uv);
  col += A * .05 * smoothstep(.2, 1., sin(r*34. - T*1.3 + neb*6.)) * smoothstep(1.4, .3, r);
  return col;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - .5*uRes) / uRes.y;
  float ci = floor(uChannel); float cf = fract(uChannel);
  vec3 a0,b0,c0,a1,b1,c1; pal(ci,a0,b0,c0); pal(mod(ci+1.,4.),a1,b1,c1);
  A = mix(a0,a1,cf); B = mix(b0,b1,cf); C = mix(c0,c1,cf);
  setup();

  vec3 ro = vec3(uMouse.x*.35, uMouse.y*.25 - uScroll*.6, 4.4 + uScroll*.9);
  vec3 ta = vec3(0., -uScroll*.3, 0.);
  vec3 f = normalize(ta-ro), rr = normalize(cross(vec3(0,1,0), f)), up = cross(f, rr);
  vec3 rd = normalize(f*1.55 + uv.x*rr + uv.y*up);
  rd.xy *= rot(sin(T*.05)*.08);

  float t = 0., minD = 1e3, ringGlow = 0.; vec2 h = vec2(1e3, -1.);
  for (int i = 0; i < 70; i++){
    vec3 p = ro + rd*t;
    h = map(p);
    if (h.y < .5) minD = min(minD, h.x); else ringGlow += .006/(.002 + h.x*h.x*40.);
    if (h.x < .002 || t > 12.) break;
    t += h.x;
  }

  vec3 col = space(rd, uv);
  float miss = 1.;
  if (t < 12.){
    miss = 0.;
    vec3 p = ro + rd*t;
    if (h.y < .5){
      vec3 n = nrm(p);
      vec3 v = -rd, rf = reflect(rd, n);
      float fres = pow(1. - max(dot(n, v), 0.), 3.);
      vec3 env = mix(studio(rf), space(rf, rf.xy)*3., .25);
      vec3 irid = .6 + .4*cos(6.2831*(vec3(0., .33, .67) + dot(n, v)*1.4 + T*.06 + p.y*.2));
      col = env * mix(vec3(1.), irid, .45);
      col += fres * mix(A, B, .5+.5*sin(T*.6 + p.y*2.5)) * 1.6;
      col += pow(max(dot(rf, normalize(vec3(.4, .8, .5))), 0.), 40.) * 4.;
      col *= .55 + .9*smoothstep(-.6, .6, rf.y);                 // oscuros profundos: contraste de cromo
      col *= .9 + .25*uPulse;
    } else {
      col = mix(A, B, .5 + .5*sin(atan(p.x, p.z)*3. + T)) * 1.6;
    }
  }
  col += (A * exp(-minD*3.2) * .55 + B * exp(-minD*9.) * .35) * miss;   // halo, solo fuera del objeto
  col += mix(B, A, .4) * min(ringGlow, 1.5) * .35;
  col = 1. - exp(-col*1.25);
  col = pow(col, vec3(1.18));
  gl_FragColor = vec4(col, 1.);
}`;

  const POST = COMMON + `
uniform sampler2D uScene, uPrev;
uniform float uPulse, uGlitch, uCrude, uFrame;
uniform vec3 uRip[6];
// Dither ordenado 4x4: un patrón fijo por celda, como la compresión de un CD-ROM.
float dith(vec2 p){ vec2 q = mod(floor(p), 4.); return fract(sin(mod(q.x + q.y*4., 16.)*12.9898)*43758.5453); }
void main(){
  vec2 uv = vUv;
  float asp = uRes.x/uRes.y;
  for (int i = 0; i < 6; i++){
    vec3 r = uRip[i];
    float age = uTime - r.z;
    if (age > 0. && age < 3.){
      vec2 d = (uv - r.xy) * vec2(asp, 1.);
      float l = length(d);
      float w = sin(l*55. - age*10.) * exp(-l*5.) * exp(-age*1.4) * .014;
      uv += normalize(d + 1e-5) * w / vec2(asp, 1.);
    }
  }
  float row = floor(uv.y * 48.);
  float g = h21(vec2(row, floor(uTime*14.)));
  if (g < uGlitch*.35) uv.x += (h11(row + floor(uTime*20.)) - .5) * .12 * uGlitch;
  uv.x += sin(uv.y*140. + uTime*3.) * .0009;                                 // señal inestable

  vec2 off = (uv - .5) * (.007 + uPulse*.02 + uGlitch*.03) + vec2(.0018, 0.);
  vec3 col = vec3(texture2D(uScene, uv + off).r, texture2D(uScene, uv).g, texture2D(uScene, uv - off).b);
  vec3 prev = texture2D(uPrev, vUv + vec2(.002, .0)).rgb;
  col = max(col, prev * (.8 - uCrude*.08));                                    // fósforo / ghosting

  float lv = mix(22., 5., uCrude);
  col = floor(col*lv + dith(gl_FragCoord.xy + uFrame)*.9) / lv;              // compresión / dithering
  col += (h21(gl_FragCoord.xy + fract(uTime*7.)*97.) - .5) * .07;              // ruido
  if (mod(gl_FragCoord.y + uFrame, 2.) < 1.) col *= .88;                       // entrelazado
  vec2 v = vUv - .5; col *= 1. - dot(v, v)*1.1;                                 // viñeta
  gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
}`;

  const BLIT = `precision mediump float; varying vec2 vUv; uniform sampler2D uTex; void main(){ gl_FragColor = texture2D(uTex, vUv); }`;

  let progScene, progPost, progBlit, buf, fbos = [], sceneFbo, W = 0, H = 0;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'p');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    p.u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      p.u[info.name.replace('[0]', '')] = gl.getUniformLocation(p, info.name);
    }
    return p;
  }
  function target(w, h, filter) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fb };
  }
  function resize() {
    const w = Math.max(160, Math.round(innerWidth * state.scale));
    const h = Math.max(100, Math.round(innerHeight * state.scale));
    if (w === W && h === H) return;
    W = w; H = h;
    canvas.width = W; canvas.height = H;
    [sceneFbo, ...fbos].forEach((t) => { if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); } });
    sceneFbo = target(W, H, gl.LINEAR);
    fbos = [target(W, H, gl.LINEAR), target(W, H, gl.LINEAR)];
  }

  let ok = !!gl;
  if (ok) {
    try {
      progScene = program(SCENE); progPost = program(POST); progBlit = program(BLIT);
      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      resize();
    } catch (err) {
      console.warn('[CRUDO//2000] sin mundo:', err);
      ok = false; root.classList.add('no-gl');
    }
  }

  function draw(fb, prog, w, h) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.viewport(0, 0, w, h);
    gl.useProgram(prog);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /* ── Bucle ─────────────────────────────────────────────────────────── */
  const tc = $('#hud-tc'), freqBtn = $('#hud-freq');
  const startedAt = performance.now();
  let dtAvg = 16, hudTick = 0;

  function loop(now) {
    if (!state.running) return;
    const dt = Math.min(0.05, (now - state.last) / 1000);
    state.last = now;
    state.t += dt * (reduced ? 0.25 : 1);
    state.frame++;

    const k = 1 - Math.pow(0.02, dt);
    state.mouse[0] += (state.mouseTarget[0] - state.mouse[0]) * k * 0.6;
    state.mouse[1] += (state.mouseTarget[1] - state.mouse[1]) * k * 0.6;
    state.hover += (state.hoverTarget - state.hover) * k;
    state.pulse *= Math.pow(0.18, dt);
    state.glitch *= Math.pow(0.02, dt);
    state.channelShown += (state.channel - state.channelShown) * k * 0.8;
    if (state.channelShown > 3.999) state.channelShown = 3.999;
    state.crude += ((performance.now() < state.crudeUntil ? 1 : 0) - state.crude) * k;

    if (!reduced && state.t > state.nextGlitch) {
      state.glitch = 0.6 + Math.random() * 0.5;
      state.nextGlitch = state.t + 7 + Math.random() * 12;
      root.classList.add('is-glitch');
      setTimeout(() => root.classList.remove('is-glitch'), 340);
    }

    const max = document.documentElement.scrollHeight - innerHeight;
    state.scroll += ((max > 0 ? scrollY / max : 0) - state.scroll) * k;

    if (ok) {
      // escena
      gl.useProgram(progScene);
      const u = progScene.u;
      gl.uniform2f(u.uRes, W, H);
      gl.uniform1f(u.uTime, state.t);
      gl.uniform2f(u.uMouse, state.mouse[0], state.mouse[1]);
      gl.uniform1f(u.uPulse, state.pulse);
      gl.uniform1f(u.uScroll, state.scroll);
      gl.uniform1f(u.uHover, state.hover);
      gl.uniform1f(u.uChannel, state.channelShown);
      gl.uniform1f(u.uCrude, state.crude);
      draw(sceneFbo.fb, progScene, W, H);

      // señal
      const src = fbos[state.frame % 2], dst = fbos[(state.frame + 1) % 2];
      gl.useProgram(progPost);
      const q = progPost.u;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sceneFbo.tex); gl.uniform1i(q.uScene, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, src.tex); gl.uniform1i(q.uPrev, 1);
      gl.uniform2f(q.uRes, W, H);
      gl.uniform1f(q.uTime, state.t);
      gl.uniform1f(q.uPulse, state.pulse);
      gl.uniform1f(q.uGlitch, state.glitch);
      gl.uniform1f(q.uCrude, state.crude);
      gl.uniform1f(q.uFrame, state.frame % 2);
      const rip = new Float32Array(18);
      state.ripples.forEach((r, i) => { rip[i * 3] = r[0]; rip[i * 3 + 1] = r[1]; rip[i * 3 + 2] = r[2]; });
      for (let i = state.ripples.length; i < 6; i++) rip[i * 3 + 2] = -99;
      gl.uniform3fv(q.uRip, rip);
      draw(dst.fb, progPost, W, H);

      // pantalla
      gl.useProgram(progBlit);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, dst.tex); gl.uniform1i(progBlit.u.uTex, 0);
      draw(null, progBlit, W, H);

      // resolución adaptativa: el objetivo es que se pueda dejar abierta
      dtAvg = dtAvg * 0.95 + dt * 1000 * 0.05;
      if (state.frame % 90 === 0) {
        if (dtAvg > 24 && state.scale > 0.2) { state.scale *= 0.86; resize(); }
        else if (dtAvg < 13 && state.scale < 0.42) { state.scale *= 1.06; resize(); }
      }
    }

    if (++hudTick % 3 === 0) {
      const s = (now - startedAt) / 1000;
      const p2 = (n) => String(Math.floor(n)).padStart(2, '0');
      tc.textContent = `${p2(s / 3600)}:${p2((s / 60) % 60)}:${p2(s % 60)}:${p2((s * 30) % 30)}`;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  document.addEventListener('visibilitychange', () => {
    state.running = !document.hidden;
    if (state.running) { state.last = performance.now(); requestAnimationFrame(loop); }
  });
  addEventListener('resize', () => { if (ok) resize(); });

  /* ── Interacción ───────────────────────────────────────────────────── */
  function pushRipple(x, y, strength = 1) {
    state.ripples.push([x, y, state.t - (1 - strength) * 0.4]);
    if (state.ripples.length > 6) state.ripples.shift();
  }
  let lastRip = 0;
  addEventListener('pointermove', (e) => {
    state.mouseTarget = [(e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)];
    const dx = e.clientX - state.mousePx[0], dy = e.clientY - state.mousePx[1];
    if (state.t - lastRip > 0.35 && dx * dx + dy * dy > 2500) {
      pushRipple(e.clientX / innerWidth, 1 - e.clientY / innerHeight, 0.35);
      lastRip = state.t;
      state.mousePx = [e.clientX, e.clientY];
    }
    state.freq = 88 + (e.clientX / innerWidth) * 20;
  }, { passive: true });

  addEventListener('pointerdown', (e) => {
    if (!entered) return;
    state.pulse = 1;
    state.glitch = Math.max(state.glitch, 0.5);
    pushRipple(e.clientX / innerWidth, 1 - e.clientY / innerHeight, 1);
  });

  document.querySelectorAll('.chrome').forEach((a) => {
    a.addEventListener('pointerenter', () => { state.hoverTarget = 1; state.glitch = Math.max(state.glitch, 0.25); });
    a.addEventListener('pointerleave', () => { state.hoverTarget = 0; });
    a.addEventListener('focus', () => { state.hoverTarget = 1; });
    a.addEventListener('blur', () => { state.hoverTarget = 0; });
  });

  function setChannel(n) {
    state.channel = n;
    root.dataset.channel = String(n);
    state.glitch = 1; state.pulse = Math.max(state.pulse, 0.6);
    freqBtn.textContent = `CANAL ${n + 1} · ${state.freq.toFixed(1)} MHz`;
  }
  freqBtn.addEventListener('click', (e) => { e.stopPropagation(); setChannel((state.channel + 1) % 4); });
  setInterval(() => { freqBtn.textContent = `CANAL ${state.channel + 1} · ${state.freq.toFixed(1)} MHz`; }, 250);

  /* ── Huevos ────────────────────────────────────────────────────────── */
  const egg = $('#egg');
  function say(text) {
    egg.textContent = text;
    egg.classList.remove('is-on'); void egg.offsetWidth; egg.classList.add('is-on');
    setTimeout(() => egg.classList.remove('is-on'), 2400);
  }
  let typed = '';
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (/^[1-4]$/.test(e.key)) { setChannel(Number(e.key) - 1); return; }
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-12);
    if (typed.endsWith('raw') || typed.endsWith('crudo')) {
      state.crudeUntil = performance.now() + 7000; state.pulse = 1.4; state.glitch = 1;
      say('MODO CRUDO');
    } else if (typed.endsWith('2000')) {
      say('Y2K: OK. EL MUNDO NO SE ACABÓ.');
      state.glitch = 1;
    } else if (typed.endsWith('mtv')) {
      setChannel((state.channel + 1) % 4);
      say('AHORA EN ROTACIÓN');
    }
  });

  /* ── Escenas que aparecen ──────────────────────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        if (!reduced) { state.glitch = Math.max(state.glitch, 0.35); }
      }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('.scene').forEach((s) => io.observe(s));

  console.log('%cCRUDO//2000', 'font:900 40px sans-serif;color:#ff1fd1;text-shadow:3px 0 #19f0ff');
  console.log('señal recibida. prueba a escribir: raw · 2000 · mtv');
})();
