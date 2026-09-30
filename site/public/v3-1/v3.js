/* Iván Santander — v3.1 «La ruta».
 *
 * Una noche en moto por Medellín, en una sola escena continua:
 *   1. radio    — pantalla inicial: elegir canción (o entrar sin música). El gesto desbloquea el audio.
 *   2. cámara   — el scroll mueve una cámara horizontal por paradas: la loma, el letrero de cada barrio,
 *                 un mural por parada, la puerta del taller, tres estaciones y la llegada.
 *   3. audio    — la canción (Web Audio: AnalyserNode) hace latir faros, postes y bombillas; el motor es un
 *                 sonido generado (no un archivo) que responde al scroll y a mantener espacio/clic.
 *   4. mundo    — valle con luces, ciudad, muros, postes y cables se generan aquí; el HTML solo lleva contenido.
 *
 * Sin dependencias. Sin JS o en móvil / movimiento reducido queda el documento normal (todo el texto y los enlaces). */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const SVGNS = 'http://www.w3.org/2000/svg';
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const suave = (t) => t * t * (3 - 2 * t);
  const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const guarda = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento: no pasa nada */ } },
  };

  const GEO = JSON.parse($('#geo').textContent);
  const escena = $('#escena'), camara = $('#camara'), mundo = $('#mundo'), pista = $('#pista');
  const moto = $('#moto'), motoCuerpo = $('#moto-cuerpo');

  const S = {
    modo: false, t: 0, ultimo: performance.now(),
    cx: 0, cxObj: 0, vel: 0, velPrev: 0, acel: 0,
    rev: 0, pulsado: false,
    bajo: .35, prom: .2, golpe: 0, ultGolpe: 0,
    k: 0, cap: 'loma', enJuego: false, ayudaVista: false,
  };

  /* ═══════════ Audio ═══════════ */
  const A = { el: $('#cancion'), ctx: null, analyser: null, master: null, data: null, motor: null, idx: 0, mudo: false, sonando: false, estabaSonando: false, hueco: null };
  const CANCIONES = $$('input[name="cancion"]').map((i) => ({ src: i.dataset.src, titulo: i.dataset.titulo }));
  const ui = { play: $('#a-play'), sig: $('#a-sig'), mudo: $('#a-mudo'), titulo: $('#audio-titulo'), barra: $('#audio') };

  function iniciaAudio() {
    if (A.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      A.ctx = new AC();
      A.master = A.ctx.createGain();
      A.master.gain.value = A.mudo ? 0 : 1;
      A.master.connect(A.ctx.destination);
      A.analyser = A.ctx.createAnalyser();
      A.analyser.fftSize = 256;
      A.analyser.smoothingTimeConstant = .78;
      const fuente = A.ctx.createMediaElementSource(A.el);
      fuente.connect(A.analyser);
      A.analyser.connect(A.master);
      A.data = new Uint8Array(A.analyser.frequencyBinCount);
    } catch (e) { A.ctx = null; }
  }

  function iniciaMotor() {
    if (!A.ctx || A.motor) return;
    const c = A.ctx;
    const o1 = c.createOscillator(), o2 = c.createOscillator(), lfo = c.createOscillator();
    const lg = c.createGain(), am = c.createGain(), f = c.createBiquadFilter(), g = c.createGain();
    o1.type = 'sawtooth'; o2.type = 'square'; o2.detune.value = -18; lfo.type = 'square';
    lg.gain.value = .32; am.gain.value = .72; f.type = 'lowpass'; f.Q.value = 2; g.gain.value = 0;
    lfo.connect(lg); lg.connect(am.gain);
    o1.connect(f); o2.connect(f); f.connect(am); am.connect(g); g.connect(A.master);
    o1.start(); o2.start(); lfo.start();
    A.motor = { o1, o2, lfo, f, g, t: 0 };
  }
  function motorSet(rpm, vol, ahora) {
    const m = A.motor; if (!m || !A.ctx) return;
    if (ahora - m.t < 45) return; m.t = ahora;
    const t = A.ctx.currentTime;
    m.o1.frequency.setTargetAtTime(46 + rpm * 120, t, .07);
    m.o2.frequency.setTargetAtTime(23 + rpm * 60, t, .07);
    m.lfo.frequency.setTargetAtTime(9 + rpm * 26, t, .1);
    m.f.frequency.setTargetAtTime(240 + rpm * 1100, t, .09);
    m.g.gain.setTargetAtTime(vol, t, .06);
  }
  function ignicion() {
    if (!A.ctx) return;
    iniciaMotor();
    const c = A.ctx, t = c.currentTime;
    const n = c.sampleRate * .38, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const fuente = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
    fuente.buffer = b; bp.type = 'bandpass'; bp.frequency.value = 420; g.gain.value = .2;
    fuente.connect(bp); bp.connect(g); g.connect(A.master); fuente.start(t);
    A.motor.t = 0; motorSet(.8, .09, 1e9);
    setTimeout(() => { A.motor.t = 0; motorSet(.16, .014, 1e9); }, 720);
  }

  function pintaAudioUI() {
    if (!ui.play) return;
    ui.play.innerHTML = A.sonando ? ui.play.dataset.iPausa : ui.play.dataset.iPlay;
    ui.play.setAttribute('aria-label', A.sonando ? 'Pausar' : 'Reproducir');
    ui.mudo.innerHTML = A.mudo ? ui.mudo.dataset.iMudo : ui.mudo.dataset.iVoz;
    ui.mudo.setAttribute('aria-label', A.mudo ? 'Activar sonido' : 'Silenciar');
    ui.mudo.setAttribute('aria-pressed', A.mudo ? 'true' : 'false');
    ui.titulo.textContent = CANCIONES[A.idx] ? CANCIONES[A.idx].titulo : '';
  }
  function poneCancion(i) {
    A.idx = ((i % CANCIONES.length) + CANCIONES.length) % CANCIONES.length;
    A.el.src = CANCIONES[A.idx].src;
    guarda.set('ruta:cancion', String(A.idx));
    pintaAudioUI();
  }
  function reproduce() {
    if (!CANCIONES.length) return Promise.resolve();
    if (!A.el.src) poneCancion(A.idx);
    if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume();
    return A.el.play().then(() => { A.sonando = true; pintaAudioUI(); }).catch(() => { A.sonando = false; pintaAudioUI(); });
  }
  function pausa() { A.el.pause(); A.sonando = false; pintaAudioUI(); }
  function ponMudo(v) {
    A.mudo = v; guarda.set('ruta:mudo', v ? '1' : '0');
    if (A.master) A.master.gain.value = v ? 0 : 1;
    pintaAudioUI();
  }
  if (ui.play) {
    ui.play.addEventListener('click', () => { iniciaAudio(); (A.sonando ? Promise.resolve(pausa()) : reproduce()); });
    ui.sig.addEventListener('click', () => { iniciaAudio(); poneCancion(A.idx + 1); reproduce(); });
    ui.mudo.addEventListener('click', () => { iniciaAudio(); ponMudo(!A.mudo); });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { A.estabaSonando = A.sonando; if (A.sonando) pausa(); }
    else if (A.estabaSonando) { reproduce(); }
  });

  /* ═══════════ Radio (pantalla inicial) ═══════════ */
  const radio = $('#radio');
  const inertes = [$('#viaje'), $('.marco'), $('.pie')];
  const setInerte = (v) => inertes.forEach((el) => { if (el) el.inert = v; });
  const previa = guarda.get('ruta:cancion');
  if (previa !== null) { const inp = $$('input[name="cancion"]')[Number(previa)]; if (inp) inp.checked = true; }
  A.mudo = guarda.get('ruta:mudo') === '1';
  A.idx = Number((($('input[name="cancion"]:checked') || {}).value) || 0);
  setInerte(true);
  requestAnimationFrame(() => { const c = $('input[name="cancion"]:checked'); if (c) c.focus({ preventScroll: true }); });

  function cierraRadio(conMusica) {
    A.idx = Number(($('input[name="cancion"]:checked') || {}).value || 0);
    iniciaAudio();
    if (conMusica) { ponMudo(false); poneCancion(A.idx); }
    ignicion();
    if (conMusica) reproduce();
    S.enJuego = true;
    radio.classList.add('saliendo');
    setTimeout(() => { radio.classList.add('cerrada'); setInerte(false); ui.barra.hidden = false; pintaAudioUI(); const b = $('#empezar'); if (b) b.focus({ preventScroll: true }); }, 460);
  }
  $('#encender').addEventListener('click', () => cierraRadio(true));
  $('#sinmusica').addEventListener('click', () => cierraRadio(false));

  /* ═══════════ Nombre: chorreados de pintura ═══════════ */
  function chorreados() {
    const svg = $('#nombre-svg'); if (!svg) return;
    const neg = $('.gotas-negras', svg), oro = $('.gotas-oro', svg); if (!neg || !oro) return;
    const r = rng(23);
    const medidor = document.createElementNS(SVGNS, 'svg');
    medidor.setAttribute('style', 'position:absolute;visibility:hidden;width:0;height:0;overflow:hidden');
    document.body.appendChild(medidor);
    [['#nom-1', [0, 2, 3]], ['#nom-2', [1, 4, 6, 8]]].forEach(([sel, idx]) => {
      const original = $(sel, svg); if (!original) return;
      const t = original.cloneNode(true);
      t.removeAttribute('id'); t.setAttribute('font-family', "'Rubik Spray Paint', sans-serif");
      medidor.appendChild(t);
      const base = Number(original.getAttribute('y'));
      idx.forEach((i) => {
        if (i >= t.getNumberOfChars()) return;
        const e = t.getExtentOfChar(i); if (e.width < 24) return;
        const cx = e.x + e.width * (.28 + r() * .44), w = 15 + r() * 7, largo = 46 + r() * 96, y0 = base - 6, d = (.5 + r() * 1.8).toFixed(2) + 's';
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
    });
    medidor.remove();
  }
  if (document.fonts && document.fonts.load) document.fonts.load('250px "Rubik Spray Paint"', 'Iván Santander').then(chorreados).catch(() => {});

  /* ═══════════ Modo viaje ═══════════ */
  let paradas = [], seg = [], total = 0, pistaTop = 0, paradaScroll = [], holdSeg = [];
  let capas = [], puertaK = -1, murales = [], orden = null, reglas = null, tablero = null, decorado = null, hud = null;

  const puedeViaje = () => !reducido && innerWidth >= 900 && innerWidth / innerHeight >= 1.25 && innerHeight >= 520;

  function calculaSegmentos() {
    const vh = innerHeight / 100;
    let s = 0; seg = []; holdSeg = []; paradaScroll = [];
    paradas.forEach((p, k) => {
      const h = p.mantener * vh;
      const hs = { t: 'h', k, s0: s, s1: s + h, cx0: p.cx, cx1: p.cx };
      seg.push(hs); holdSeg[k] = hs; paradaScroll[k] = s + h * .3;
      s += h;
      if (k < paradas.length - 1) {
        const d = Math.abs(paradas[k + 1].cx - p.cx), m = (8 + d * .13) * vh;
        seg.push({ t: 'm', k, s0: s, s1: s + m, cx0: p.cx, cx1: paradas[k + 1].cx });
        s += m;
      }
    });
    total = s;
    pista.style.height = (total + innerHeight) + 'px';
    pistaTop = pista.getBoundingClientRect().top + scrollY;
  }

  function estado(sc) {
    sc = clamp(sc, 0, total);
    for (const g of seg) {
      if (sc <= g.s1 || g === seg[seg.length - 1]) {
        if (g.t === 'h') return { cx: g.cx0, k: g.k };
        const t = clamp((sc - g.s0) / (g.s1 - g.s0), 0, 1);
        return { cx: lerp(g.cx0, g.cx1, easeInOut(t)), k: t < .5 ? g.k : g.k + 1 };
      }
    }
    return { cx: 0, k: 0 };
  }

  function capDe(k) {
    const t = paradas[k].tipo;
    if (t === 'loma') return 'loma';
    if (t === 'letrero' || t === 'mural') return 'ruta';
    if (t === 'llegada') return 'llegada';
    return 'taller';
  }

  const actual = () => (S.destino != null ? S.destino : Math.max(0, S.k));
  function irAParada(k) {
    if (!S.modo) return;
    k = clamp(k, 0, paradas.length - 1);
    S.destino = k;
    scrollTo({ top: pistaTop + paradaScroll[k], behavior: 'smooth' });
  }

  /* — mundo generado — */
  function svgEl(w, h, cuerpo, extra = '') {
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none" shape-rendering="crispEdges" ${extra}>${cuerpo}</svg>`;
  }
  const LUCES = ['#ffb84a', '#ffd98a', '#ff9a3c', '#fff3c8', '#ff7a2a', '#ffe27a'];

  function capaMontes(w, h, vw, vh) {
    const r = rng(7);
    const capasM = [{ y: .38, a: .06, fill: '#0d1220', n: 2.2 }, { y: .47, a: .07, fill: '#101626', n: 4.2 }, { y: .57, a: .06, fill: '#151b2d', n: 6.0 }];
    let s = '';
    capasM.forEach((c, ci) => {
      const pts = []; let d = `M0 ${h}`;
      for (let x = 0; x <= w; x += w / 220) {
        const y = h * c.y + Math.sin(x / (w / 9) + ci * 2) * h * c.a + Math.sin(x / (w / 23) + ci) * h * c.a * .5 + Math.sin(x / (w / 61)) * h * .012;
        pts.push([x, y]); d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
      }
      s += `<path d="${d} L${w} ${h}Z" fill="${c.fill}"/>`;
      const n = Math.round((w / vw) * c.n);
      for (let i = 0; i < n; i++) {
        const x = (r() < .62 ? r() * 130 * vw : r() * w);
        const p = pts[Math.min(pts.length - 1, Math.round(x / (w / 220)))];
        const y = p[1] + h * .02 + r() * h * .3;
        const tam = 2 + r() * 2.4;
        s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${tam.toFixed(1)}" height="${(tam * .8).toFixed(1)}" fill="${LUCES[Math.floor(r() * LUCES.length)]}" opacity="${(.65 + r() * .35).toFixed(2)}"/>`;
      }
    });
    // metrocable: cable, pilonas y una cabina encendida
    const x0 = 50 * vw, y0 = h * .30, x1 = 106 * vw, y1 = h * .50;
    s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#1d2233" stroke-width="2"/>`;
    s += `<rect x="${x0 - 3}" y="${y0 - 2}" width="6" height="${h * .12}" fill="#0b0e17"/><rect x="${x1 - 3}" y="${y1 - 2}" width="6" height="${h * .12}" fill="#0b0e17"/>`;
    s += `<g class="cabina" style="--dx:${(x1 - x0 - 30).toFixed(0)}px;--dy:${(y1 - y0 - 12).toFixed(0)}px"><rect x="${x0}" y="${y0 + 3}" width="${(vw * 1.6).toFixed(0)}" height="${(vh * 2.2).toFixed(0)}" fill="#0b0e17"/><rect x="${x0 + 3}" y="${y0 + 6}" width="${(vw * 1.6 - 6).toFixed(0)}" height="${(vh * 1.2).toFixed(0)}" fill="#ffd98a"/></g>`;
    return svgEl(w, h, s);
  }

  function capaCiudad(w, h, vw, vh) {
    const r = rng(13);
    let s = '', x = -2 * vw; const base = h * .78, balizas = [];
    while (x < w) {
      const bajo = x < 125 * vw, bw = (3 + r() * 6) * vw, bh = (bajo ? 5 + r() * 13 : 20 + r() * 34) * vh, y = base - bh;
      const tono = ['#0b0d13', '#0e1119', '#0c0f16'][Math.floor(r() * 3)];
      s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${bw.toFixed(0)}" height="${(bh + h * .3).toFixed(0)}" fill="${tono}"/>`;
      const cols = Math.max(2, Math.floor(bw / (1.1 * vw))), fil = Math.floor(bh / (2.6 * vh));
      for (let i = 0; i < cols; i++) for (let j = 1; j < fil; j++) if (r() < (bajo ? .3 : .12)) {
        s += `<rect x="${(x + (i + .3) * (bw / cols)).toFixed(0)}" y="${(y + j * 2.6 * vh).toFixed(0)}" width="${(vw * .45).toFixed(0)}" height="${(vh * 1.1).toFixed(0)}" fill="${LUCES[Math.floor(r() * LUCES.length)]}" opacity="${(.55 + r() * .4).toFixed(2)}"/>`;
      }
      if (bh > 46 * vh && r() < .6) balizas.push([x + bw / 2, y]);
      x += bw + r() * 1.2 * vw;
    }
    balizas.forEach(([bx, by]) => { s += `<rect class="baliza" x="${(bx - 2).toFixed(0)}" y="${(by - 6).toFixed(0)}" width="4" height="4" fill="#ff3b30"/>`; });
    return svgEl(w, h, s);
  }

  function generaMundo() {
    mundo.innerHTML = '';
    capas = [];
    const vw = innerWidth / 100, vh = innerHeight / 100, W = GEO.mundoW;
    mundo.insertAdjacentHTML('beforeend', '<div class="cielo"></div><div class="estrellas"></div>');
    [[.05, capaMontes], [.2, capaCiudad]].forEach(([f, fn]) => {
      const w = Math.round((100 + f * W) * vw), h = Math.round(100 * vh);
      const d = document.createElement('div'); d.className = 'capa'; d.style.width = w + 'px';
      d.innerHTML = fn(w, h, vw, vh); mundo.appendChild(d); capas.push({ el: d, f });
    });
    // decorado del mundo principal
    const r = rng(29);
    if (decorado) decorado.remove();
    decorado = document.createElement('div'); decorado.className = 'decorado'; decorado.setAttribute('aria-hidden', 'true');
    let h = `<div class="suelo" style="width:${W}vw"></div><div class="muro-loma"></div>`;
    h += `<div class="baranda" style="left:62vw;width:42vw"></div><i class="poste" style="left:84vw"></i><i class="poste__luz" style="left:84vw"></i>`;
    // alcobas de la calle: en el centro entre dos murales, cada dos huecos, se abre un callejón
    const huecos = []; const alcobas = [];
    const mA = $$('.mural[data-barrio="clinica"]').map((m) => Number(m.style.getPropertyValue('--x')));
    const mB = $$('.mural[data-barrio="propios"]').map((m) => Number(m.style.getPropertyValue('--x')));
    [mA, mB].forEach((lista) => lista.slice(0, -1).forEach((x, i) => { const g = x + 44; huecos.push(g); if (i % 2 === 1) alcobas.push([g - 6, g + 6]); }));
    const finCalle = GEO.xTaller0 - 1;
    const tipos = ['ladrillo', 'bloque', 'cal'];
    const trozos = []; let ini = 100;
    alcobas.forEach(([a, b]) => { if (a > ini) trozos.push([ini, a]); ini = b; });
    if (finCalle > ini) trozos.push([ini, finCalle]);
    const post = GEO.xTaller1 + 1; if (GEO.mundoW + 8 > post) trozos.push([post, GEO.mundoW + 8]);
    let t = 0;
    trozos.forEach(([a, b]) => {
      let x = a;
      while (x < b - .1) {
        const ancho = Math.min(b - x, 60 + r() * 40);
        h += `<div class="pared pared--${tipos[t++ % 3]}" style="left:${x.toFixed(2)}vw;width:${ancho.toFixed(2)}vw"></div>`;
        x += ancho;
        if (x < b - 1) h += `<i class="pilastra" style="left:${(x - .8).toFixed(2)}vw"></i>`;
      }
    });
    alcobas.forEach(([a, b]) => { h += `<i class="pilastra" style="left:${(a - 1.6).toFixed(2)}vw"></i><i class="pilastra" style="left:${b.toFixed(2)}vw"></i>`; });
    const postes = [];
    huecos.forEach((g, i) => {
      const enAlcoba = alcobas.some(([a, b]) => g > a && g < b);
      const xp = g + (enAlcoba ? 0 : 13);
      postes.push(xp);
      h += `<i class="poste" style="left:${xp.toFixed(2)}vw"></i><i class="poste__luz" style="left:${xp.toFixed(2)}vw"></i>`;
      if (!enAlcoba) h += `<i class="puerta-met" style="left:${(g - 14).toFixed(2)}vw"></i><i class="ventana" style="left:${(g + 22).toFixed(2)}vw"></i>`;
    });
    postes.push(GEO.mundoW - 34); h += `<i class="poste" style="left:${GEO.mundoW - 34}vw"></i><i class="poste__luz" style="left:${GEO.mundoW - 34}vw"></i>`;
    // cables entre postes (con nudos)
    const px = (v) => (v * vw).toFixed(1), y0 = 100 * vh - (20 + 52 - 3) * vh;
    let cab = '';
    const ordenP = [84, ...postes.filter((p) => p > 90)].sort((a, b) => a - b);
    for (let i = 0; i < ordenP.length - 1; i++) {
      const a = ordenP[i] + 1.6, b = ordenP[i + 1] + 1.6;
      [0, 1.1, 2.3].forEach((dy, j) => {
        const sag = (2.4 + r() * 2.2) * vh;
        cab += `<path d="M${px(a)} ${(y0 + dy * vh).toFixed(1)} Q${px((a + b) / 2)} ${(y0 + dy * vh + sag).toFixed(1)} ${px(b)} ${(y0 + (dy + (r() - .5)) * vh).toFixed(1)}" fill="none" stroke="#050507" stroke-width="${(1.4 + r()).toFixed(1)}"/>`;
      });
      if (r() < .7) { const mx = (a + b) / 2 + (r() - .5) * 8, my = y0 + (3.4 + r() * 1.6) * vh; cab += `<path d="M${px(mx - 3)} ${my.toFixed(1)} c${(1.4 * vw).toFixed(0)} ${(-2.4 * vh).toFixed(0)} ${(3.4 * vw).toFixed(0)} ${(2.6 * vh).toFixed(0)} ${(6 * vw).toFixed(0)} 0 s${(-2.4 * vw).toFixed(0)} ${(-2.2 * vh).toFixed(0)} ${(-4.4 * vw).toFixed(0)} ${(1.2 * vh).toFixed(0)}" fill="none" stroke="#050507" stroke-width="1.6"/>`; }
    }
    h += `<svg class="cables" width="${Math.round(W * vw)}" height="${Math.round(100 * vh)}" viewBox="0 0 ${Math.round(W * vw)} ${Math.round(100 * vh)}">${cab}</svg>`;
    decorado.innerHTML = h;
    camara.insertBefore(decorado, camara.firstChild);
    // el interior del taller va antes que sus estaciones para quedar debajo
    camara.style.setProperty('--mundo-w', W);
  }

  /* — estado por parada — */
  function actualizaEstados(sc, k) {
    if (k === S.destino) S.destino = null;
    if (k !== S.k) {
      S.k = k;
      murales.forEach((m) => m.el.classList.toggle('is-foco', m.k === k));
      const cap = capDe(k);
      if (cap !== S.cap) {
        S.cap = cap; root.dataset.cap = cap;
        $$('.capitulos a').forEach((a) => a.setAttribute('aria-current', a.dataset.cap === cap ? 'true' : 'false'));
      }
      const p = paradas[k];
      if (hud) {
        if (p.tipo === 'mural') { hud.barrio.textContent = p.barrio === 'clinica' ? 'Plataforma clínica' : 'Proyectos propios'; hud.n.textContent = `${p.n} / ${p.de}`; }
        else if (p.tipo === 'letrero') { hud.barrio.textContent = p.barrio === 'clinica' ? 'Plataforma clínica' : 'Proyectos propios'; hud.n.textContent = ''; }
      }
    }
    // estaciones del taller: revelan con el scroll, un paso cada vez
    const sub = (kk) => { const g = holdSeg[kk]; return g ? clamp((sc - g.s0) / (g.s1 - g.s0), 0, 1) : 0; };
    if (orden) {
      const cur = Math.min(orden.items.length - 1, Math.floor(sub(orden.k) * orden.items.length));
      if (cur !== orden.cur) { orden.cur = cur; orden.items.forEach((li, i) => { li.classList.toggle('es-ahora', i === cur); li.classList.toggle('es-luego', i > cur); }); }
    }
    if (reglas) {
      const cur = Math.min(reglas.items.length - 1, Math.floor(sub(reglas.k) * reglas.items.length));
      if (cur !== reglas.cur) { reglas.cur = cur; reglas.items.forEach((li, i) => li.classList.toggle('activa', i === cur)); }
    }
    if (tablero) {
      const n = Math.min(tablero.items.length, Math.floor(sub(tablero.k) * (tablero.items.length + .5)) + 1);
      if (n !== tablero.n) { tablero.n = n; tablero.items.forEach((g, i) => g.classList.toggle('es-luego', i >= n)); }
    }
    if (puertaK >= 0) {
      const d = paradas[puertaK];
      const abierta = clamp((S.cx - (d.cx - 55)) / 40, 0, 1);
      const el = d.el;
      if (Math.abs((el._abierta || 0) - abierta) > .004) { el._abierta = abierta; el.style.setProperty('--persiana', abierta.toFixed(3)); }
    }
    if (hud && S.ayudaVista === false && sc > innerHeight * .25) { S.ayudaVista = true; hud.ayuda.classList.add('oculta'); }
  }

  function preparaModo() {
    paradas = $$('[data-parada]', camara).map((el) => ({
      el, tipo: el.dataset.tipo, cx: Number(el.dataset.cx), mantener: Number(el.dataset.mantener),
      barrio: el.dataset.barrio, n: el.dataset.n, de: el.dataset.de,
    }));
    murales = paradas.map((p, k) => ({ ...p, k })).filter((p) => p.tipo === 'mural');
    puertaK = paradas.findIndex((p) => p.tipo === 'puerta');
    const est = (tipo) => paradas.findIndex((p) => p.tipo === tipo);
    const io = est('orden'), ir = est('reglas'), is = est('stack');
    orden = io >= 0 ? { k: io, items: $$('.orden__it', paradas[io].el), cur: -1 } : null;
    reglas = ir >= 0 ? { k: ir, items: $$('.regla', paradas[ir].el), cur: -1 } : null;
    tablero = is >= 0 ? { k: is, items: $$('.tablero__grupo', paradas[is].el), n: -1 } : null;
    hud = { barrio: $('#rn-barrio'), n: $('#rn-n'), ayuda: $('#pista-ayuda') };
    S.k = -1;
  }

  function activaModo() {
    if (S.modo) return;
    S.modo = true; root.classList.add('modo-viaje');
    preparaModo(); generaMundo(); calculaSegmentos();
    S.cx = S.cxObj = 0; paso(performance.now(), true);
  }
  function desactivaModo() {
    if (!S.modo) return;
    S.modo = false; root.classList.remove('modo-viaje');
    delete root.dataset.cap;
    camara.style.transform = ''; camara.style.removeProperty('--mundo-w'); pista.style.height = '';
    mundo.innerHTML = ''; if (decorado) { decorado.remove(); decorado = null; }
    $$('.es-luego,.es-ahora,.activa,.is-foco').forEach((e) => e.classList.remove('es-luego', 'es-ahora', 'activa', 'is-foco'));
    $$('.taller__fachada').forEach((e) => e.style.removeProperty('--persiana'));
  }
  function evaluaModo() {
    if (puedeViaje()) {
      if (!S.modo) activaModo();
      else { calculaSegmentos(); generaMundo(); const k = Math.max(0, S.k); scrollTo(0, pistaTop + paradaScroll[k]); }
    } else desactivaModo();
  }
  let tRes = 0;
  addEventListener('resize', () => { clearTimeout(tRes); tRes = setTimeout(evaluaModo, 160); });

  /* — entrada — */
  const interactivo = (el) => el && el.closest && el.closest('a, button, input, select, textarea, label, [data-nohold]');
  function pulsa(v) { S.pulsado = v; }
  addEventListener('keydown', (e) => {
    if (radio && !radio.classList.contains('cerrada')) return;
    if (e.code === 'Space' && S.modo && !interactivo(e.target)) { e.preventDefault(); if (!e.repeat) pulsa(true); return; }
    if (!S.modo || interactivo(e.target) && e.target.matches('input, select, textarea')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); irAParada(actual() + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); irAParada(actual() - 1); }
  });
  addEventListener('keyup', (e) => { if (e.code === 'Space') pulsa(false); });
  escena.addEventListener('pointerdown', (e) => { if (S.modo && !interactivo(e.target) && e.button === 0) pulsa(true); });
  ['pointerup', 'pointercancel'].forEach((ev) => addEventListener(ev, () => pulsa(false)));
  addEventListener('blur', () => pulsa(false));
  const motoImg = $('.moto__img');
  if (motoImg) {
    motoImg.addEventListener('pointerdown', () => { if (!S.modo) pulsa(true); });
  }
  escena.addEventListener('scroll', () => { escena.scrollLeft = 0; escena.scrollTop = 0; });
  camara.addEventListener('focusin', (e) => {
    if (!S.modo) return;
    const p = e.target.closest('[data-parada]'); if (!p) return;
    const k = paradas.findIndex((x) => x.el === p);
    if (k >= 0 && k !== S.k) irAParada(k);
  });
  $$('.capitulos a, [data-irloma]').forEach((a) => a.addEventListener('click', (e) => {
    if (!S.modo) return;
    e.preventDefault();
    const cap = a.dataset.cap || 'loma';
    const k = { loma: 0, ruta: paradas.findIndex((p) => p.tipo === 'letrero'), taller: paradas.findIndex((p) => p.tipo === 'puerta'), llegada: paradas.length - 1 }[cap];
    irAParada(k);
  }));
  const empezar = $('#empezar');
  if (empezar) empezar.addEventListener('click', (e) => { if (!S.modo) return; e.preventDefault(); irAParada(1); });
  const rnAnt = $('#rn-ant'), rnSig = $('#rn-sig');
  if (rnAnt) rnAnt.addEventListener('click', () => irAParada(Math.max(1, actual() - 1)));
  if (rnSig) rnSig.addEventListener('click', () => irAParada(actual() + 1));
  ['wheel', 'touchstart'].forEach((ev) => addEventListener(ev, () => { S.destino = null; }, { passive: true }));

  /* ═══════════ Bucle ═══════════ */
  let ultimoBajo = 0, frameN = 0;
  function paso(now, forzar) {
    const dt = Math.min(.05, Math.max(.001, (now - S.ultimo) / 1000));
    S.ultimo = now; S.t += dt; frameN++;

    // cámara
    if (S.modo) {
      const sc = scrollY - pistaTop;
      const est = estado(sc);
      S.cxObj = est.cx;
      S.cx += (S.cxObj - S.cx) * (forzar ? 1 : 1 - Math.exp(-dt / .11));
      const v = Math.abs(S.cx - S.velPrev) / dt / 70; S.velPrev = S.cx;
      S.vel += (clamp(v, 0, 1) - S.vel) * (1 - Math.exp(-dt / .12));
      const a = clamp((S.vel - (S._v0 || 0)) / dt * .05, -1, 1); S._v0 = S.vel;
      S.acel += (a - S.acel) * (1 - Math.exp(-dt / .18));
      const golpe = reducido ? 0 : S.golpe * 1.4;
      camara.style.transform = `translate3d(${(-S.cx).toFixed(3)}vw, ${golpe.toFixed(2)}px, 0)`;
      for (const c of capas) c.el.style.transform = `translate3d(${(-S.cx * c.f).toFixed(3)}vw, 0, 0)`;
      actualizaEstados(sc, est.k);
      const fin = paradas[paradas.length - 1].cx;
      const park = clamp((S.cx - (fin - 34)) / 34, 0, 1);
      if (Math.abs((S._park || 0) - park) > .004) { S._park = park; moto.style.setProperty('--park', park.toFixed(3)); }
      if (Math.abs((S._velc || 0) - S.vel) > .03) { S._velc = S.vel; escena.style.setProperty('--vel', S.vel.toFixed(2)); }
    } else {
      S.vel += (0 - S.vel) * .1; S.acel *= .9;
    }

    // rugido del motor: solo con el gesto pulsado
    S.rev += ((S.pulsado ? 1 : 0) - S.rev) * (1 - Math.exp(-dt / .16));
    moto.classList.toggle('rugiendo', S.rev > .55);

    // audio reactivo
    let b = 0;
    if (A.sonando && A.analyser && !A.mudo) {
      A.analyser.getByteFrequencyData(A.data);
      b = (A.data[0] + A.data[1] + A.data[2] + A.data[3] + A.data[4]) / 5 / 255;
      S.prom += (b - S.prom) * .03;
      if (b > S.prom * 1.22 && b > .38 && now - S.ultGolpe > 190) { S.golpe = 1; S.ultGolpe = now; }
      S.bajo = clamp(.22 + b * .95, 0, 1);
      const objetivo = S.cap === 'llegada' ? .3 : 1;
      A.el.volume = clamp(A.el.volume + (objetivo - A.el.volume) * .04, 0, 1);
    } else {
      S.bajo = .34 + .12 * Math.sin(S.t * 2.2);
    }
    S.golpe *= .84;
    if (frameN % 2 === 0 || forzar) {
      if (Math.abs(S.bajo - ultimoBajo) > .015) { ultimoBajo = S.bajo; escena.style.setProperty('--bajo', S.bajo.toFixed(2)); }
    }

    // moto: vibración con el motor, inclinación al acelerar y frenar
    const px = innerHeight * .0022;
    const vib = (Math.sin(S.t * 41) * (.55 * S.rev + .3 * S.vel) + Math.sin(S.t * 6.4) * .45) * px * 2;
    const incl = reducido ? 0 : -(S.rev * 2.2 + Math.max(0, S.acel) * 2.4) + Math.max(0, -S.acel) * 1.8 - (S._park || 0) * 2.2;
    motoCuerpo.style.setProperty('--vib', vib.toFixed(2) + 'px');
    motoCuerpo.style.setProperty('--inclina', incl.toFixed(2) + 'deg');
    moto.style.setProperty('--rev', S.rev.toFixed(2));

    // motor generado
    if (A.motor && S.enJuego) {
      const rpm = clamp(.14 + S.vel * .55 + S.rev * .85, 0, 1);
      motorSet(rpm, Math.max(.014, S.vel * .05, S.rev * .11), now);
    }
  }
  function bucle(now) { paso(now, false); requestAnimationFrame(bucle); }
  let arrancado = false;
  function arranca() { if (arrancado) return; arrancado = true; requestAnimationFrame((t) => { S.ultimo = t; paso(t, true); requestAnimationFrame(bucle); }); }

  evaluaModo();
  arranca();
  if (!S.modo) { root.dataset.cap = 'loma'; }
  addEventListener('scroll', () => { /* la cámara se lee en cada fotograma */ }, { passive: true });
})();
