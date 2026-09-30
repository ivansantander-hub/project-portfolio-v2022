/* Iván Santander — v3.1 (iteración de la v3).
 *
 * Un solo canvas WebGL a baja resolución, ampliado sin suavizar (píxeles cuadrados):
 *   1. estela — un buffer que se desplaza hacia la derecha y se disuelve; la moto y el
 *      cursor le inyectan bandas de oro y blanco (feedback).
 *   2. mundo  — noche con estrellas frías y brillo de sodio, asfalto con semitono, concreto
 *      y pared de ladrillo, más el haz del faro, la estela encima y el datamosh: bloques de
 *      6–30 px que se congelan, se desplazan o se vuelven negro/verde tóxico o negro/oro.
 *      Solo en cambios de mundo y al hacer clic.
 *   3. copia  — lleva el resultado a pantalla.
 * Sin dependencias ni peticiones externas. Sin WebGL queda el respaldo en CSS.
 *
 * Fotos propias (opcionales) en site/public/v3-1/img/, activadas con un atributo en <html>:
 *   dt.png  → recorte de la moto (transparente)      → data-moto-foto
 *   yo.jpg  → tu foto en la ficha de contacto          → data-foto-yo
 * Nuevo en la 3.1: rocío y brillo del nombre, ruta con moto, linterna sobre las paredes,
 * profundidad con el ratón, velocidad según el scroll y spray persistente (pulsar y arrastrar). */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVGNS = 'http://www.w3.org/2000/svg';
  if (reduced) $$('animateTransform, animate').forEach((a) => a.remove());
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  const state = {
    t: 0, last: performance.now(), frame: 0, running: true,
    px: innerWidth < 760 ? 5 : 6,
    mundo: 0,
    mouse: [-999, -999], mouseAt: -9, heroOn: true,
    shiftAcc: 0,
    moshT0: -99, moshSeed: 0, click: [0, 0, 0], clickAt: -99,
    dirty: true,
    vel: 0, drift: 0, lastY: scrollY, boost: 0, gd: '1.10', ft: 16,
    mx: 0, my: 0, mxT: 0, myT: 0,
    spray: { on: false, x: 0, y: 0, c: 0, n: 0 },
  };

  /* ── Datos vivos ───────────────────────────────────────────────────── */
  const anios = $('#dato-anios');
  if (anios) anios.textContent = String(new Date().getFullYear() - 2019);

  /* ── La moto ───────────────────────────────────────────────────────── */
  const moto = $('#moto');
  const mueve = $('.moto__mueve', moto);
  mueve.setAttribute('role', 'button');
  mueve.setAttribute('tabindex', '0');
  mueve.setAttribute('aria-label', 'Acelerar la moto');
  let brrmTimer = 0;
  function acelera() {
    moto.classList.remove('is-brrm');
    void moto.offsetWidth;
    moto.classList.add('is-brrm');
    clearTimeout(brrmTimer);
    brrmTimer = setTimeout(() => moto.classList.remove('is-brrm'), 1400);
  }
  mueve.addEventListener('click', acelera);
  mueve.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); acelera(); } });

  if (root.hasAttribute('data-moto-foto')) {
    const img = $('#moto-foto');
    img.addEventListener('load', () => { img.hidden = false; moto.classList.add('tiene-foto'); });
    img.addEventListener('error', () => img.remove());
    img.src = '/v3-1/img/dt.png';
  }

  if (root.hasAttribute('data-foto-yo')) {
    const yo = $('#ficha-yo');
    yo.addEventListener('load', () => { yo.hidden = false; const m = $('#ficha-moto'); if (m) m.style.display = 'none'; });
    yo.addEventListener('error', () => yo.remove());
    yo.src = '/v3-1/img/yo.jpg';
  }

  /* ── Chorreados del nombre: caen de las letras una vez cargada la fuente ─ */
  function chorreados() {
    const svg = $('#nombre-svg');
    if (!svg) return;
    const neg = $('.gotas-negras', svg), oro = $('.gotas-oro', svg);
    const r = rng(23);
    const medidor = document.createElementNS(SVGNS, 'svg');
    medidor.setAttribute('style', 'position:absolute;visibility:hidden;width:0;height:0;overflow:hidden');
    document.body.appendChild(medidor);
    [['#nom-1', [0, 2, 3]], ['#nom-2', [1, 4, 6, 8]]].forEach(([sel, idx]) => {
      const original = $(sel, svg);
      const t = original.cloneNode(true);
      t.removeAttribute('id');
      t.setAttribute('font-family', "'Rubik Spray Paint', sans-serif");
      medidor.appendChild(t);
      const base = Number(original.getAttribute('y'));
      idx.forEach((i) => {
        if (i >= t.getNumberOfChars()) return;
        const e = t.getExtentOfChar(i);
        if (e.width < 24) return;
        const cx = e.x + e.width * (0.28 + r() * 0.44);
        const w = 15 + r() * 7, largo = 46 + r() * 96, y0 = base - 6, d = (0.5 + r() * 1.8).toFixed(2) + 's';
        const negra = document.createElementNS(SVGNS, 'rect');
        negra.setAttribute('x', (cx - w / 2 - 8).toFixed(1)); negra.setAttribute('y', y0); negra.setAttribute('width', (w + 16).toFixed(1));
        negra.setAttribute('height', (largo + 16).toFixed(1)); negra.setAttribute('rx', ((w + 16) / 2).toFixed(1)); negra.setAttribute('fill', '#000');
        negra.style.setProperty('--d', d);
        const dorada = document.createElementNS(SVGNS, 'rect');
        dorada.setAttribute('x', (cx - w / 2).toFixed(1)); dorada.setAttribute('y', y0 - 8); dorada.setAttribute('width', w.toFixed(1));
        dorada.setAttribute('height', (largo + 8).toFixed(1)); dorada.setAttribute('rx', (w / 2).toFixed(1)); dorada.setAttribute('fill', '#e3b32a');
        dorada.style.setProperty('--d', d);
        neg.appendChild(negra); oro.appendChild(dorada);
      });
      // rocío: gotas sueltas de spray alrededor de las letras
      const roc = $('.rocio', svg);
      for (let i = 0; i < t.getNumberOfChars(); i++) {
        const e = t.getExtentOfChar(i);
        if (e.width < 12) continue;
        for (let k = 0; k < 8; k++) {
          const c = document.createElementNS(SVGNS, 'circle');
          const arriba = r() < 0.5;
          c.setAttribute('cx', (e.x + r() * e.width * 1.1 - e.width * 0.05).toFixed(1));
          c.setAttribute('cy', (arriba ? e.y + e.height * 0.1 - 10 - r() * 46 : e.y + e.height * 0.86 + 6 + r() * 60).toFixed(1));
          c.setAttribute('r', (1.4 + r() * 4.6).toFixed(1));
          c.setAttribute('opacity', (0.3 + r() * 0.6).toFixed(2));
          roc.appendChild(c);
        }
      }
    });
    medidor.remove();
  }
  if (document.fonts && document.fonts.load) {
    document.fonts.load('250px "Rubik Spray Paint"', 'Iván Santander').then(chorreados).catch(() => {});
  }

  /* ── Ecos de la moto: Sobre mí (grises, oro, verde nocturno) y la ficha ── */
  const dib = $('.moto__dibujo');
  function copia(tinte, x, y) {
    const pos = document.createElementNS(SVGNS, 'g');
    pos.setAttribute('transform', `translate(${x + 560} ${y}) scale(-1 1)`);
    const c = dib.cloneNode(true);
    c.removeAttribute('class');
    if (tinte) c.setAttribute('filter', `url(#${tinte})`);
    pos.appendChild(c);
    return pos;
  }
  (function ecos() {
    const svg = $('#eco');
    if (!svg || !dib) return;
    svg.setAttribute('viewBox', '-40 0 800 420');
    const capas = document.createElementNS(SVGNS, 'g');
    capas.setAttribute('filter', 'url(#eco-mov)');
    ['t-1', 't-2', 't-4', 't-3', 't-5'].forEach((t, i) => {
      const cap = document.createElementNS(SVGNS, 'g');
      cap.setAttribute('class', 'eco__capa');
      cap.style.setProperty('--i', String(i));
      cap.appendChild(copia(t, 30 + (5 - i) * 24, 46 + (i % 2 ? 7 : -5)));
      capas.appendChild(cap);
    });
    const frente = document.createElementNS(SVGNS, 'g');
    frente.setAttribute('filter', 'url(#recorte-moto)');
    frente.appendChild(copia(null, 30, 46));
    svg.append(capas, frente);
    const ficha = $('#ficha-moto');
    if (ficha) { const g = document.createElementNS(SVGNS, 'g'); g.appendChild(copia(null, 0, 0)); ficha.appendChild(g); }
  })();

  /* ── La calle de noche: horizonte, postes, cables enredados y un bus ─── */
  (function escena() {
    const el = $('#escena');
    if (!el) return;
    function capa(seed, alturaMin, alturaMax, colores, ventanas, densidad, extra = '') {
      const r = rng(seed); const W = 1800, H = 420;
      let x = -20, out = '';
      while (x < W + 20) {
        const w = 70 + r() * 90, h = alturaMin + r() * (alturaMax - alturaMin);
        out += `<rect x="${x.toFixed(0)}" y="${(H - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${colores[Math.floor(r() * colores.length)]}" stroke="#000" stroke-width="3"/>`;
        const cols = Math.max(2, Math.floor(w / 26)), filas = Math.floor(h / 34);
        for (let a = 0; a < cols; a++) for (let b = 1; b < filas; b++) if (r() < densidad) out += `<rect x="${(x + 10 + a * 24).toFixed(0)}" y="${(H - h + 10 + b * 32).toFixed(0)}" width="12" height="16" fill="${ventanas[Math.floor(r() * ventanas.length)]}"/>`;
        if (r() > 0.72) out += `<rect x="${(x + w / 2 - 2).toFixed(0)}" y="${(H - h - 34).toFixed(0)}" width="4" height="34" fill="#000"/>`;
        x += w + 4;
      }
      return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${out}${extra}</svg>`;
    }
    function mural() {
      const H = 420, x = 1180;
      return `<g><rect x="${x}" y="${H - 340}" width="240" height="340" fill="#1d1e23" stroke="#000" stroke-width="4"/>
        <ellipse cx="${x + 72}" cy="${H - 238}" rx="46" ry="30" fill="#e9e6da" stroke="#000" stroke-width="5"/>
        <ellipse cx="${x + 170}" cy="${H - 238}" rx="46" ry="30" fill="#e9e6da" stroke="#000" stroke-width="5"/>
        <circle cx="${x + 82}" cy="${H - 234}" r="17" fill="#000"/><circle cx="${x + 160}" cy="${H - 234}" r="17" fill="#000"/>
        <circle cx="${x + 87}" cy="${H - 241}" r="5" fill="#ffd35e"/><circle cx="${x + 165}" cy="${H - 241}" r="5" fill="#ffd35e"/>
        <path d="M${x + 20} ${H - 286} L${x + 110} ${H - 268} M${x + 132} ${H - 268} L${x + 222} ${H - 286}" stroke="#d4a017" stroke-width="11" stroke-linecap="round"/>
        <path d="M${x + 48} ${H - 152} L${x + 82} ${H - 132} L${x + 116} ${H - 152} L${x + 150} ${H - 132} L${x + 184} ${H - 152}" fill="none" stroke="#d4a017" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>
        <rect x="${x + 62}" y="${H - 140}" width="7" height="46" fill="#d4a017"/><rect x="${x + 154}" y="${H - 140}" width="6" height="28" fill="#d4a017"/></g>`;
    }
    function cables() {
      const r = rng(5); const H = 900;
      const postes = [[120, 120], [1500, 190]];
      let out = '';
      // luz de sodio: brillo por escalones, sin degradados
      out += `<circle cx="150" cy="170" r="230" fill="rgba(255,138,31,.06)"/><circle cx="150" cy="170" r="150" fill="rgba(255,138,31,.08)"/><circle cx="150" cy="170" r="80" fill="rgba(255,170,70,.12)"/>`;
      postes.forEach(([x, y]) => {
        out += `<rect x="${x - 9}" y="${y}" width="18" height="${H - y}" fill="#050506"/><rect x="${x - 64}" y="${y + 30}" width="128" height="10" fill="#050506"/><rect x="${x - 48}" y="${y + 66}" width="96" height="8" fill="#050506"/>`;
        [-58, -30, 30, 58].forEach((d) => { out += `<circle cx="${x + d}" cy="${y + 26}" r="5" fill="#2a2a2d"/>`; });
        [-40, 0, 40].forEach((d) => { out += `<circle cx="${x + d}" cy="${y + 62}" r="5" fill="#2a2a2d"/>`; });
      });
      out += `<rect x="128" y="112" width="34" height="14" fill="#ffd9a0"/><rect x="118" y="118" width="20" height="6" fill="#050506"/>`;
      for (let i = 0; i < 11; i++) {
        const x1 = 120 + (r() * 100 - 50), y1 = 150 + (i % 3) * 36, x2 = 1500 + (r() * 100 - 50), y2 = 220 + (i % 3) * 36;
        const cx = (x1 + x2) / 2 + (r() * 400 - 200), cy = Math.max(y1, y2) + 90 + r() * 200;
        out += `<path d="M${x1.toFixed(0)} ${y1} Q${cx.toFixed(0)} ${cy.toFixed(0)} ${x2.toFixed(0)} ${y2}" fill="none" stroke="#050506" stroke-width="${(1.6 + r() * 1.6).toFixed(1)}" vector-effect="non-scaling-stroke"/>`;
      }
      // nudos: cables que se enredan a mitad de camino
      for (let i = 0; i < 4; i++) {
        const x = 420 + r() * 700, y = 300 + r() * 140;
        out += `<path d="M${(x - 90).toFixed(0)} ${y.toFixed(0)} C${(x - 30).toFixed(0)} ${(y - 60).toFixed(0)} ${(x + 30).toFixed(0)} ${(y + 60).toFixed(0)} ${(x + 90).toFixed(0)} ${y.toFixed(0)} S${(x + 10).toFixed(0)} ${(y - 40).toFixed(0)} ${(x - 40).toFixed(0)} ${(y + 20).toFixed(0)}" fill="none" stroke="#050506" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
      }
      return `<svg class="e-cables" viewBox="0 0 1600 ${H}" preserveAspectRatio="none" aria-hidden="true">${out}</svg>`;
    }
    function bus() {
      let v = '';
      for (let i = 0; i < 7; i++) v += `<rect x="${112 + i * 72}" y="66" width="58" height="52" fill="#241a08" stroke="#000" stroke-width="4"/><rect x="${118 + i * 72}" y="72" width="46" height="40" fill="${i % 3 === 1 ? '#3a2a10' : '#ff9a2a'}" opacity="${i % 3 === 1 ? 1 : .62}"/>`;
      return `<svg class="e-bus" viewBox="0 0 640 230" aria-hidden="true">
        <ellipse cx="320" cy="222" rx="300" ry="8" fill="#000" opacity=".55"/>
        <path d="M-90 200 L320 200" stroke="none"/>
        <circle cx="14" cy="150" r="70" fill="rgba(255,246,200,.07)"/><circle cx="14" cy="150" r="42" fill="rgba(255,246,200,.12)"/>
        <rect x="14" y="36" width="612" height="152" fill="#ffc61a" stroke="#000" stroke-width="5"/>
        <rect x="14" y="36" width="612" height="16" fill="#e0a800" stroke="#000" stroke-width="5"/>
        <rect x="30" y="62" width="70" height="86" fill="#241a08" stroke="#000" stroke-width="4"/><rect x="36" y="68" width="58" height="74" fill="#ff9a2a" opacity=".5"/>
        <rect x="36" y="40" width="56" height="13" fill="#ff9a2a" stroke="#000" stroke-width="3"/>
        ${v}
        <rect x="14" y="150" width="612" height="18" fill="#000"/>
        <circle cx="130" cy="190" r="34" fill="#000"/><circle cx="130" cy="190" r="13" fill="#4a4a4d" stroke="#000" stroke-width="4"/>
        <circle cx="510" cy="190" r="34" fill="#000"/><circle cx="510" cy="190" r="13" fill="#4a4a4d" stroke="#000" stroke-width="4"/>
        <circle cx="20" cy="156" r="11" fill="#fff6c8" stroke="#000" stroke-width="3"/>
        <rect x="618" y="136" width="9" height="26" fill="#e01818" stroke="#000" stroke-width="2"/>
      </svg>`;
    }
    el.innerHTML = `<div class="e-lejos" data-parallax="0.10">${capa(7, 130, 320, ['#0f1013', '#121317', '#15161a'], ['#ffb347', '#ffd35e'], 0.07, mural())}</div>` +
      `<div class="e-medio" data-parallax="0.20">${capa(21, 120, 270, ['#17181c', '#1c1d22', '#202126'], ['#ffb347', '#ffd35e', '#ff9a2a'], 0.16)}</div>` +
      cables() + bus();
  })();

  /* ── Parallax de la calle ─────────────────────────────────────────── */
  const casos = $('#casos');
  const capasParallax = $$('[data-parallax]', casos).map((el) => ({ el, f: Number(el.dataset.parallax) }));
  const casas = $$('.casa', casos).map((li) => ({ li, a: $('.casa__a', li), v: Number(li.style.getPropertyValue('--vel')) || 0.05 }));
  function parallax() {
    if (reduced) return;
    const cr = casos.getBoundingClientRect();
    if (cr.bottom < -200 || cr.top > innerHeight + 200) return;
    const prog = Math.min(1, Math.max(0, -cr.top / Math.max(1, cr.height - innerHeight)));
    capasParallax.forEach(({ el, f }) => { el.style.translate = `${((prog - 0.5) * f * 1400).toFixed(1)}px 0`; });
    const amp = innerWidth < 640 ? 0.6 : 1;
    casas.forEach(({ li, a, v }) => {
      const r = li.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      a.style.setProperty('--py', `${((r.top + r.height / 2 - innerHeight / 2) * v * amp).toFixed(1)}px`);
    });
  }
  addEventListener('scroll', () => { state.dirty = true; parallax(); }, { passive: true });
  parallax();

  /* ── Mundos por sección ───────────────────────────────────────────── */
  const mundos = $$('[data-mundo]', $('main'));
  function cambiaMundo(n) {
    if (n === state.mundo) return;
    state.mundo = n;
    document.body.dataset.mundo = String(n);
    state.moshT0 = performance.now() / 1000; state.moshSeed++;
    state.dirty = true;
    if (typeof pins !== 'undefined') pins.forEach((a, i) => a.setAttribute('aria-current', i === n ? 'true' : 'false'));
  }
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) cambiaMundo(Number(e.target.dataset.mundo)); });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  mundos.forEach((s) => io.observe(s));
  new IntersectionObserver((es) => es.forEach((e) => { state.heroOn = e.isIntersecting; }), { threshold: 0.05 }).observe($('#inicio'));

  /* ── Ruta de la página, linterna sobre las paredes y profundidad ─────── */
  const ruta = $('.ruta');
  const pins = $$('a', ruta);
  const secciones = ['#inicio', '#casos', '#sobre-mi', '#contacto'].map((s) => $(s));
  function colocaRuta() {
    const total = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    pins.forEach((a, i) => a.style.setProperty('--f', Math.min(1, secciones[i].offsetTop / total).toFixed(4)));
    pins.forEach((a, i) => a.setAttribute('aria-current', i === state.mundo ? 'true' : 'false'));
  }
  function avanzaRuta() {
    const total = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    ruta.style.setProperty('--p', Math.min(1, Math.max(0, scrollY / total)).toFixed(4));
  }
  colocaRuta(); avanzaRuta();
  addEventListener('load', colocaRuta);
  addEventListener('resize', colocaRuta);
  addEventListener('scroll', avanzaRuta, { passive: true });

  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const muros = $$('.casa__muro', casos);
  let luzPendiente = false;
  function luz() {
    if (!finePointer || luzPendiente) return;
    luzPendiente = true;
    requestAnimationFrame(() => {
      luzPendiente = false;
      const [x, y] = state.mouse;
      muros.forEach((m) => {
        const r = m.getBoundingClientRect();
        if (r.bottom < -300 || r.top > innerHeight + 300) return;
        m.style.setProperty('--lx', `${(x - r.left).toFixed(0)}px`);
        m.style.setProperty('--ly', `${(y - r.top).toFixed(0)}px`);
      });
    });
  }
  addEventListener('scroll', luz, { passive: true });
  const inicio = $('#inicio');

  /* ── WebGL ─────────────────────────────────────────────────────────── */
  const canvas = $('#mundo');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  let ok = !!gl;

  const VERT = 'attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';

  const COMUN = `
precision highp float;
uniform vec2 uRes; uniform float uTime;
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 bandas(float k){
  if (k < 1.) return vec3(.93, .91, .85);
  if (k < 2.) return vec3(.83, .63, .09);
  if (k < 3.) return vec3(1., .89, .48);
  if (k < 4.) return vec3(.83, .63, .09);
  if (k < 5.) return vec3(.54, .42, .06);
  return vec3(.93, .91, .85);
}`;

  const FRAG_ESTELA = COMUN + `
uniform sampler2D uPrev; uniform float uShift;
uniform vec4 uMoto;    // x, y, mitad de alto, activo (px de baja resolución)
uniform vec4 uMouse;   // x, y, mitad de alto, activo
void emite(vec2 p, vec4 e, float wob, inout vec4 c){
  if (e.w < .5) return;
  if (abs(p.x - e.x) > 1.5) return;
  float dy = p.y - (e.y + wob);
  if (abs(dy) >= e.z) return;
  float k = (1. - (dy + e.z) / (2. * e.z)) * 6.;
  c = vec4(bandas(clamp(k, 0., 5.99)), 1.);
}
void main(){
  vec2 p = floor(gl_FragCoord.xy);
  vec4 prev = texture2D(uPrev, (p - vec2(uShift, 0.) + .5) / uRes);
  vec4 c = vec4(prev.rgb, max(prev.a - uShift * 2. / 255., 0.));
  emite(p, uMoto, sin(uTime * 5.) * 1.4 + sin(uTime * 2.3) * 1.1, c);
  emite(p, uMouse, sin(uTime * 9.) * .8, c);
  gl_FragColor = c;
}`;

  const FRAG_MUNDO = COMUN + `
uniform sampler2D uEstela, uPrevD, uGraf;
uniform float uDrift;
uniform float uMundo, uMosh, uSeed;
uniform vec3 uClick;   // x, y, cantidad
uniform vec3 uFaro;    // x, y, activo
vec3 sodio(vec2 p, vec3 col, float alto, float cant){
  float g = clamp(1. - p.y / (uRes.y * alto), 0., 1.);
  if (g * cant > hash(p * 1.3 + 7.)) col = mix(col, vec3(.95, .45, .05), .6);
  return col;
}
vec3 noche(vec2 p, float t){
  vec3 col = vec3(.024, .026, .034);
  for (int i = 0; i < 3; i++){
    float fi = float(i);
    vec2 q = vec2(p.x - floor(uDrift * (1.4 + fi * 2.8)), p.y);
    float h = hash(q + fi * 17.3);
    if (h < .010 - fi * .0026){
      float tw = .5 + .5 * sin(t * 3. + h * 400.);
      col = mix(col, vec3(.86, .92, 1.), mix(.4, 1., tw) * (.5 + fi * .25));
    }
  }
  vec2 q = vec2(p.x - floor(uDrift * 4.), p.y);
  vec2 cell = floor(q / 34.);
  vec2 f = q - cell * 34.;
  vec2 c = floor(vec2(hash(cell) * 26. + 4., hash(cell + 9.1) * 26. + 4.));
  vec2 d = abs(f - c);
  if (hash(cell + 3.3) < .3 && ((d.x < .5 && d.y < 3.5) || (d.y < .5 && d.x < 3.5))) col = vec3(.9, .95, 1.);
  return sodio(p, col, .17, .42);
}
vec3 asfalto(vec2 p, float t){
  vec3 col = vec3(.035, .035, .04);
  vec2 q = vec2(p.x - floor(uDrift * 1.5), p.y);
  vec2 c = (floor(q / 4.) + .5) * 4.;
  float r = mix(.5, 1.5, smoothstep(0., uRes.y, p.y)) + .2 * sin(t * .8 + c.x * .07);
  if (length(q - c) < r) col = vec3(.09, .09, .10);
  return sodio(p, col, .26, .5);
}
vec3 concreto(vec2 p, float t){
  vec3 col = vec3(.105, .105, .115);
  col *= .84 + .3 * hash(floor(p / 7.) + 3.1);
  float h = hash(p * 1.9 + 11.);
  if (h < .06) col *= 1.5; else if (h > .95) col *= .55;
  vec2 c = (floor(p / 5.) + .5) * 5.;
  if (length(p - c) < .9 + 1.2 * smoothstep(0., uRes.y, p.y)) col += .025;
  return col;
}
vec3 ladrillos(vec2 p, float t){
  float fila = floor(p.y / 5.);
  float off = mod(fila, 2.) * 5.;
  vec2 cel = vec2(floor((p.x + off) / 10.), fila);
  vec3 col = vec3(.19, .075, .055) * (.7 + .6 * hash(cel));
  if (mod(p.y, 5.) < 1. || mod(p.x + off, 10.) < 1.) col = vec3(.055, .045, .045);
  vec2 d = (p - vec2(uRes.x * .5, uRes.y * 1.08)) / vec2(uRes.x * .62, uRes.y * .95);
  float g = smoothstep(1., .05, length(d));
  if (g > hash(p * 1.3) * 1.15) col += vec3(.55, .26, .04) * g;
  return col;
}
vec3 mundo(float w, vec2 p){
  float t = uTime;
  if (w < .5) return noche(p, t);
  if (w < 1.5) return asfalto(p, t);
  if (w < 2.5) return concreto(p, t);
  return ladrillos(p, t);
}
void main(){
  vec2 p = floor(gl_FragCoord.xy);
  vec2 uv = (p + .5) / uRes;
  vec3 col = mundo(uMundo, p);

  // el faro de la moto: un haz tramado hacia la izquierda, sobre el nombre
  if (uMundo < .5 && uFaro.z > .5){
    float dx = uFaro.x - p.x;
    if (dx > 0.){
      float abre = 3. + dx * .34;
      float dy = p.y - (uFaro.y + dx * .06);
      float i = clamp(1. - abs(dy) / abre, 0., 1.) * clamp(1. - dx / 150., 0., 1.);
      if (i * 1.15 > hash(p * .9 + 3.)) col = mix(col, vec3(1., .94, .74), .42 + .4 * i);
    }
    if (abs(p.x - uFaro.x) < 2. && abs(p.y - uFaro.y) < 2.) col = vec3(1., .98, .86);
  }

  vec4 tr = texture2D(uEstela, uv);
  if (tr.a > .004 && tr.a > hash(p * 1.7 + 3.) * .9) col = tr.rgb;
  vec4 gr = texture2D(uGraf, uv);
  if (gr.a > .004 && gr.a > hash(p * 2.1 + 5.) * .9) col = gr.rgb;

  // datamosh: agresivo y corto
  float m = uMosh + uClick.z * smoothstep(38., 0., length(p - uClick.xy));
  if (m > .01){
    vec2 cc = floor(p / 5.);
    float hs = hash(cc + 11.7);
    float bs = hs < .25 ? 1. : (hs < .55 ? 2. : (hs < .8 ? 3. : 5.));   // bloques de 6 a 30 px en pantalla
    vec2 bid = floor(p / bs);
    float hb = hash(bid + uSeed * 3.1);
    if (hb < m * .85){
      float tipo = hash(bid + 8.8);
      if (tipo < .26) col = (hash(bid + 1.9) < .5) ? vec3(0.) : vec3(.22, 1., .08) * (.55 + .45 * hash(bid + 4.));
      else if (tipo < .46) col = (hash(bid + 2.7) < .55) ? vec3(0.) : vec3(.83, .63, .09);
      else {
        vec2 mv = (vec2(hash(bid + 2.2), hash(bid + 5.5)) - .5) * vec2(13., 4.) * bs;
        col = texture2D(uPrevD, (p + mv + .5) / uRes).rgb;
      }
    }
  }
  gl_FragColor = vec4(col, 1.);
}`;

  const FRAG_GRAF = COMUN + `
uniform sampler2D uPrev; uniform vec4 uSpray; uniform vec3 uColor; uniform float uDecay, uSeed;
void main(){
  vec2 p = floor(gl_FragCoord.xy);
  vec4 c = texture2D(uPrev, (p + .5) / uRes);
  c.a = max(c.a - uDecay / 255., 0.);
  if (uSpray.w > .5){
    float d = length(p - uSpray.xy);
    if (d < uSpray.z && pow(1. - d / uSpray.z, 1.6) > hash(p * 1.13 + uSeed)) c = vec4(uColor, 1.);
  }
  gl_FragColor = c;
}`;

  const FRAG_COPIA = 'precision mediump float;varying vec2 vUv;uniform sampler2D uTex;void main(){gl_FragColor=texture2D(uTex,vUv);}';

  let pEstela, pMundo, pCopia, pGraf, W = 0, H = 0, estela = [], visto = [], graf = [];

  function compila(tipo, src) {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function programa(fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compila(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compila(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'p');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    p.u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); p.u[info.name] = gl.getUniformLocation(p, info.name); }
    return p;
  }
  function objetivo(w, h) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fb };
  }
  function redimensiona() {
    state.px = (innerWidth < 760 ? 5 : 6) + state.boost;
    const w = Math.max(80, Math.ceil(innerWidth / state.px));
    const h = Math.max(60, Math.ceil(innerHeight / state.px));
    if (w === W && h === H) return;
    W = w; H = h; canvas.width = W; canvas.height = H;
    [...estela, ...visto, ...graf].forEach((o) => { gl.deleteTexture(o.tex); gl.deleteFramebuffer(o.fb); });
    estela = [objetivo(W, H), objetivo(W, H)];
    visto = [objetivo(W, H), objetivo(W, H)];
    graf = [objetivo(W, H), objetivo(W, H)];
    state.dirty = true;
  }

  if (ok) {
    try {
      pEstela = programa(FRAG_ESTELA); pMundo = programa(FRAG_MUNDO); pCopia = programa(FRAG_COPIA); pGraf = programa(FRAG_GRAF);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      redimensiona();
    } catch (err) {
      console.warn('[v3] sin WebGL, se usa el respaldo en CSS:', err.message);
      ok = false;
    }
  }
  if (!ok) root.classList.add('sin-gl');

  function dibuja(fb, prog, w, h) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.viewport(0, 0, w, h);
    gl.useProgram(prog);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function textura(unidad, tex, loc) {
    gl.activeTexture(gl.TEXTURE0 + unidad); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(loc, unidad);
  }

  /* ── Bucle ─────────────────────────────────────────────────────────── */
  const cola = $('#moto-cola'), faro = $('#moto-faro');
  function pintaFotograma(dt) {
    const px = state.px;
    let cola4 = [0, 0, 0, 0], faro3 = [0, 0, 0];
    if (state.heroOn && state.mundo === 0) {
      const r = cola.getBoundingClientRect();
      cola4 = [(r.left + r.width / 2) / px, (innerHeight - (r.top + r.height / 2)) / px, Math.max(3, r.height / 2 / px), 1];
      const f = faro.getBoundingClientRect();
      faro3 = [(f.left + f.width / 2) / px, (innerHeight - (f.top + f.height / 2)) / px, 1];
    }
    const raton = state.t - state.mouseAt < 0.9 && !reduced
      ? [state.mouse[0] / px, (innerHeight - state.mouse[1]) / px, 3, 1] : [0, 0, 0, 0];
    state.shiftAcc += (reduced ? 0 : 58 * (1 + 4 * state.vel)) * dt;
    const shift = Math.floor(state.shiftAcc); state.shiftAcc -= shift;

    const i = state.frame % 2, j = 1 - i;
    gl.useProgram(pEstela);
    let u = pEstela.u;
    textura(0, estela[i].tex, u.uPrev);
    gl.uniform2f(u.uRes, W, H); gl.uniform1f(u.uTime, state.t); gl.uniform1f(u.uShift, shift);
    gl.uniform4fv(u.uMoto, cola4); gl.uniform4fv(u.uMouse, raton);
    dibuja(estela[j].fb, pEstela, W, H);

    // spray persistente: se pinta al mantener pulsado y se desvanece despacio
    const sp = state.spray;
    const coloresSpray = [[.83, .63, .09], [.93, .91, .85], [.22, 1., .08]];
    gl.useProgram(pGraf);
    u = pGraf.u;
    textura(0, graf[i].tex, u.uPrev);
    gl.uniform2f(u.uRes, W, H); gl.uniform1f(u.uTime, state.t);
    gl.uniform4f(u.uSpray, sp.x / px, (innerHeight - sp.y) / px, 7, sp.on ? 1 : 0);
    gl.uniform3fv(u.uColor, coloresSpray[sp.c % 3]);
    gl.uniform1f(u.uDecay, state.frame % 6 === 0 ? 1 : 0);
    gl.uniform1f(u.uSeed, state.frame * 1.7);
    dibuja(graf[j].fb, pGraf, W, H);

    // datamosh: solo tras un cambio de mundo o cerca de un clic; más agresivo y más corto
    const ahora = performance.now() / 1000;
    const dtMosh = ahora - state.moshT0;
    let mosh = 0;
    if (!reduced && dtMosh < 0.55) mosh = dtMosh < 0.06 ? (dtMosh / 0.06) * 0.85 : 0.85 * Math.max(0, 1 - (dtMosh - 0.06) / 0.49);
    const dtClick = ahora - state.clickAt;
    const clic = !reduced && dtClick < 0.5 ? 1 - dtClick / 0.5 : 0;

    gl.useProgram(pMundo);
    u = pMundo.u;
    textura(0, estela[j].tex, u.uEstela);
    textura(1, visto[i].tex, u.uPrevD);
    textura(2, graf[j].tex, u.uGraf);
    gl.uniform1f(u.uDrift, state.drift);
    gl.uniform2f(u.uRes, W, H); gl.uniform1f(u.uTime, state.t);
    gl.uniform1f(u.uMundo, state.mundo);
    gl.uniform1f(u.uMosh, mosh);
    gl.uniform1f(u.uSeed, Math.floor(state.t * 12) + state.moshSeed * 5);
    gl.uniform3f(u.uClick, state.click[0], state.click[1], clic);
    gl.uniform3fv(u.uFaro, faro3);
    dibuja(visto[j].fb, pMundo, W, H);

    gl.useProgram(pCopia);
    textura(0, visto[j].tex, pCopia.u.uTex);
    dibuja(null, pCopia, W, H);
    state.frame++;
  }

  function bucle(now) {
    if (!state.running) return;
    const msReal = now - state.last;
    const dt = Math.min(0.05, msReal / 1000);
    state.last = now;
    if (!reduced) {
      const v = Math.min(1, Math.abs(scrollY - state.lastY) / Math.max(dt, 0.008) / 2200);
      state.lastY = scrollY;
      state.vel += (v - state.vel) * Math.min(1, dt * 7);
      state.drift += dt * (1 + 5 * state.vel);
      const gd = (1.1 / (1 + 3 * state.vel)).toFixed(2);
      if (Math.abs(gd - state.gd) > 0.08) { state.gd = gd; moto.style.setProperty('--gd', gd + 's'); }
      state.mx += (state.mxT - state.mx) * Math.min(1, dt * 4);
      state.my += (state.myT - state.my) * Math.min(1, dt * 4);
      if (state.heroOn) { inicio.style.setProperty('--mx', state.mx.toFixed(3)); inicio.style.setProperty('--my', state.my.toFixed(3)); }
    }
    if (ok) {
      if (reduced) {
        if (state.dirty) { state.dirty = false; pintaFotograma(0); pintaFotograma(0); }
      } else {
        state.t += dt;
        pintaFotograma(dt);
        // en equipos muy lentos, píxeles más grandes (nunca vuelve atrás)
        state.ft += (msReal - state.ft) * 0.05;
        if (state.frame % 150 === 0 && state.ft > 60 && state.boost < 3) { state.boost++; redimensiona(); }
      }
    }
    requestAnimationFrame(bucle);
  }
  requestAnimationFrame(bucle);

  document.addEventListener('visibilitychange', () => {
    state.running = !document.hidden;
    if (state.running) { state.last = performance.now(); requestAnimationFrame(bucle); }
  });
  addEventListener('resize', () => { if (ok) redimensiona(); parallax(); });

  /* ── Entrada ───────────────────────────────────────────────────────── */
  addEventListener('pointermove', (e) => {
    state.mouse = [e.clientX, e.clientY]; state.mouseAt = state.t;
    state.mxT = (e.clientX / innerWidth) * 2 - 1; state.myT = (e.clientY / innerHeight) * 2 - 1;
    state.spray.x = e.clientX; state.spray.y = e.clientY;
    luz();
  }, { passive: true });

  const temblor = [$('main'), canvas];
  temblor.forEach((el) => el.addEventListener('animationend', (e) => { if (e.animationName === 'golpe') el.classList.remove('golpe'); }));
  const sueltaSpray = () => { state.spray.on = false; };
  addEventListener('pointerup', sueltaSpray);
  addEventListener('pointercancel', sueltaSpray);
  addEventListener('blur', sueltaSpray);
  addEventListener('pointerdown', (e) => {
    if (!reduced && e.pointerType === 'mouse' && e.button === 0 && !e.target.closest('a, button, [role=button], .barra, .ruta')) {
      state.spray.on = true; state.spray.c = state.spray.n++; state.spray.x = e.clientX; state.spray.y = e.clientY;
    }
    state.click = [e.clientX / state.px, (innerHeight - e.clientY) / state.px, 0];
    state.clickAt = performance.now() / 1000;
    if (!reduced) temblor.forEach((el) => { el.classList.remove('golpe'); void el.offsetWidth; el.classList.add('golpe'); });
  });
})();
