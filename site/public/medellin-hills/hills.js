/* hills.js — Medellín Hills.
   · Revelado al hacer scroll y frase palabra por palabra: IntersectionObserver (ningún listener de scroll).
   · Isla de navegación: el menú se abre como un cristal; la sección actual queda marcada.
   · Música: nada suena antes del primer clic. "Seguir la canción" lleva la página por la estructura de la
     canción; mover el scroll lo apaga. Las imágenes NO laten al compás. */
(() => {
  'use strict';
  const doc = document, html = doc.documentElement;
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => doc.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };
  const leer = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const anuncia = (m) => { const a = $('aviso'); a.textContent = ''; setTimeout(() => { a.textContent = m; }, 40); };

  /* ───────── revelado ───────── */
  if (!quieto && 'IntersectionObserver' in window) {
    html.classList.add('js');
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    doc.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  }

  /* frase grande: cada palabra pasa de 30 % a 100 % al cruzar la línea, en orden de lectura */
  const tag = $('tagline');
  if (tag && !quieto && 'IntersectionObserver' in window) {
    const palabras = tag.textContent.trim().split(/\s+/);
    tag.setAttribute('aria-label', tag.textContent.trim());
    tag.textContent = '';
    const spans = palabras.map((p, i) => { const s = doc.createElement('span'); s.className = 'w'; s.setAttribute('aria-hidden', 'true'); s.textContent = p + (i < palabras.length - 1 ? ' ' : ''); tag.append(s); return s; });
    let lote = 0, tLote = 0;
    const iw = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const ahora = performance.now();
      if (ahora - tLote > 400) lote = 0;
      tLote = ahora;
      e.target.style.transitionDelay = `${lote++ * 70}ms`;
      e.target.classList.add('on'); iw.unobserve(e.target);
    }), { rootMargin: '0px 0px -38% 0px' });
    spans.forEach((s) => iw.observe(s));
  }

  /* ───────── isla y menú ───────── */
  const abre = $('abre-menu'), menu = $('menu'), main = $('contenido'), pie = doc.querySelector('.pie');
  function setMenu(abierto) {
    abre.setAttribute('aria-expanded', String(abierto));
    abre.setAttribute('aria-label', abierto ? 'Cerrar el menú' : 'Abrir el menú');
    menu.classList.toggle('abierto', abierto);
    menu.setAttribute('aria-hidden', String(!abierto));
    menu.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', abierto ? '0' : '-1'));
    [main, pie].forEach((el) => { if (abierto) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
    if (abierto) menu.querySelector('a').focus(); else abre.focus({ preventScroll: true });
  }
  abre.addEventListener('click', () => setMenu(abre.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  doc.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('abierto')) setMenu(false); });

  /* sección actual */
  if ('IntersectionObserver' in window) {
    const enlaces = [...doc.querySelectorAll('.isla__nav a')];
    const spy = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      enlaces.forEach((a) => (a.dataset.sec === e.target.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    }), { rootMargin: '-40% 0px -55% 0px' });
    enlaces.forEach((a) => { const s = $(a.dataset.sec); if (s) spy.observe(s); });
  }

  /* la cabina del Metrocable quieta si se pidió menos movimiento */
  if (quieto) { const c = doc.querySelector('.visual__cable'); if (c && c.pauseAnimations) c.pauseAnimations(); }

  /* ───────── música ───────── */
  const CANCIONES = JSON.parse($('canciones').textContent);
  const repro = $('repro'), rPlay = $('repro-play'), rMudo = $('repro-mudo'), rSig = $('repro-sig'), rModo = $('repro-modo'), rNombre = $('repro-nombre');
  const barras = [...doc.querySelectorAll('.repro__bars i')];
  const botonesPlay = [$('musica'), $('casete-play')];
  const palabras = $('palabras'), vinilo = $('vinilo'), giro = vinilo.querySelector('.vinilo__giro');
  const iconoPlay = $('musica').innerHTML, iconoPausa = rPlay.innerHTML;

  let cual = Number(leer('hills:cancion')) === 1 ? 1 : 0;
  const audio = new Audio();
  audio.src = CANCIONES[cual].src; audio.loop = true; audio.preload = 'none'; audio.volume = 0.6;
  audio.muted = leer('hills:mudo') === '1';
  let ctx = null, analyser = null, datos = null, sonando = false, pausaOculta = false, raf = 0;
  let sigue = true, idxTour = -1, activa = null, tPrev = 0;

  function conectar() {
    if (ctx || quieto) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const f = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser(); analyser.fftSize = 64; analyser.smoothingTimeConstant = 0.8;
      f.connect(analyser); analyser.connect(ctx.destination);
      datos = new Uint8Array(analyser.frequencyBinCount);
    } catch { ctx = null; analyser = null; }
  }

  /* el recorrido sigue la estructura de "El estren": intro, coros y versos, puente, coro final, outro */
  const A = [...doc.querySelectorAll('.caso[data-lado="A"]')], B = [...doc.querySelectorAll('.caso[data-lado="B"]')];
  const TOUR = [{ t: 0, el: $('inicio') }];
  A.forEach((p, i) => TOUR.push({ t: 10 + i * 8.1, el: p }));
  TOUR.push({ t: 91, el: $('como-lidero') });
  B.forEach((p, i) => TOUR.push({ t: 112 + i * 5.5, el: p }));
  TOUR.push({ t: 156, el: $('contacto') });

  function marca(el) {
    if (el === activa) return;
    activa?.classList.remove('activa'); activa = el;
    if (el && el.classList.contains('caso')) el.classList.add('activa'); else activa = el;
  }
  function tour(t) {
    let i = 0;
    for (let k = 0; k < TOUR.length; k++) if (t >= TOUR[k].t) i = k;
    if (i === idxTour) return;
    idxTour = i;
    const el = TOUR[i].el;
    marca(el);
    if (sigue && !quieto) el.scrollIntoView({ behavior: 'smooth', block: el.classList.contains('caso') ? 'center' : 'start' });
  }
  if ('IntersectionObserver' in window) {
    const centro = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !sigue) marca(e.target); }), { rootMargin: '-45% 0px -45% 0px' });
    [...A, ...B].forEach((c) => centro.observe(c));
  }

  /* palabras sueltas de la canción: una ficha quieta en la esquina, sin letra */
  function pop(p) {
    if (quieto) return;
    const f = doc.createElement('div'); f.className = 'pop';
    const im = doc.createElement('img'); im.src = `/medellin-hills/img/${p.img}.webp`; im.alt = ''; im.width = 48; im.height = 48;
    const s = doc.createElement('span'); s.textContent = p.txt;
    f.append(im, s);
    while (palabras.children.length >= 2) palabras.firstChild.remove();
    palabras.append(f); setTimeout(() => f.remove(), 3600);
  }

  function bucle() {
    raf = requestAnimationFrame(bucle);
    if (doc.hidden || !sonando) return;
    const c = CANCIONES[cual], t = audio.currentTime;
    if (analyser) {
      analyser.getByteFrequencyData(datos);
      for (let i = 0; i < barras.length; i++) barras[i].style.transform = `scaleY(${(0.15 + (datos[i * 2] || 0) / 255 * 0.85).toFixed(2)})`;
    }
    if (c.tour) {
      if (t < tPrev - 1) idxTour = -1;
      tour(t);
      for (const w of c.palabras) if (tPrev < w.t && t >= w.t && t - tPrev < 1.2) pop(w);
    }
    vinilo.setAttribute('aria-valuenow', String(Math.round(t)));
    tPrev = t;
  }

  function pinta() {
    html.classList.toggle('suena', sonando);
    html.classList.toggle('rap', cual === 1);
    botonesPlay.forEach((b) => { if (b.id === 'musica') { b.setAttribute('aria-pressed', String(sonando)); b.setAttribute('aria-label', sonando ? 'Pausar la música' : 'Poner la música'); b.innerHTML = sonando ? iconoPausa : iconoPlay; } });
    rPlay.setAttribute('aria-pressed', String(sonando));
    rPlay.setAttribute('aria-label', sonando ? 'Pausar la música' : 'Poner la música');
    rPlay.innerHTML = sonando ? iconoPausa : iconoPlay;
    rNombre.textContent = CANCIONES[cual].nombre;
    rMudo.setAttribute('aria-pressed', String(audio.muted));
    rMudo.setAttribute('aria-label', audio.muted ? 'Quitar el silencio' : 'Silenciar la música');
    const tourOk = CANCIONES[cual].tour;
    rModo.disabled = !tourOk;
    rModo.setAttribute('aria-pressed', String(sigue && tourOk));
    vinilo.setAttribute('aria-valuemax', String(CANCIONES[cual].dur));
    if (!sonando) barras.forEach((b) => { b.style.transform = ''; });
  }
  async function dale() {
    try {
      conectar();
      if (ctx && ctx.state === 'suspended') await ctx.resume();
      await audio.play();
      sonando = true; repro.hidden = false; tPrev = audio.currentTime; idxTour = -1;
      pinta();
      if (!raf) raf = requestAnimationFrame(bucle);
      if (CANCIONES[cual].tour && sigue) anuncia('La página sigue la canción. Mueve el scroll para explorar tú.');
    } catch { sonando = false; pinta(); anuncia('No se pudo reproducir el audio.'); }
  }
  function pausa() { audio.pause(); sonando = false; pinta(); }
  const alterna = () => (sonando ? pausa() : dale());

  botonesPlay.forEach((b) => b.addEventListener('click', alterna));
  rPlay.addEventListener('click', alterna);
  rMudo.addEventListener('click', () => { audio.muted = !audio.muted; guardar('hills:mudo', audio.muted ? '1' : '0'); pinta(); });
  rSig.addEventListener('click', () => {
    cual = (cual + 1) % CANCIONES.length; guardar('hills:cancion', String(cual));
    audio.src = CANCIONES[cual].src; tPrev = 0; idxTour = -1;
    if (!CANCIONES[cual].tour) sigue = false; else sigue = true;
    if (sonando) audio.play().catch(() => {});
    pinta(); anuncia(`Suena ${CANCIONES[cual].nombre}`);
  });
  rModo.addEventListener('click', () => { sigue = !sigue; idxTour = -1; pinta(); anuncia(sigue ? 'La página sigue la canción.' : 'Tú mandas el scroll.'); });

  /* mover el scroll por cuenta propia apaga "Seguir la canción" */
  const exploras = () => { if (sigue && sonando && CANCIONES[cual].tour) { sigue = false; pinta(); anuncia('Tú mandas el scroll.'); } };
  addEventListener('wheel', exploras, { passive: true });
  addEventListener('touchmove', exploras, { passive: true });
  addEventListener('keydown', (e) => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key) && !e.target.closest('button, a, [role="slider"], summary')) exploras(); });

  /* vinilo: arrastrar para rayar la canción */
  let arrastra = false, aPrev = 0, acum = 0;
  const angulo = (e) => { const r = vinilo.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
  vinilo.addEventListener('pointerdown', (e) => { arrastra = true; aPrev = angulo(e); vinilo.setPointerCapture(e.pointerId); if (!sonando) dale(); });
  vinilo.addEventListener('pointermove', (e) => {
    if (!arrastra) return;
    let d = angulo(e) - aPrev; if (d > 180) d -= 360; if (d < -180) d += 360;
    aPrev = angulo(e); acum += d; giro.style.setProperty('--giro', acum.toFixed(1));
    if (audio.duration) audio.currentTime = clamp(audio.currentTime + d / 360 * 2.2, 0, audio.duration - 0.2);
  });
  const suelta = () => { arrastra = false; };
  vinilo.addEventListener('pointerup', suelta); vinilo.addEventListener('pointercancel', suelta);
  vinilo.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 5 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -5 : 0;
    if (!d) return; e.preventDefault();
    if (!sonando) dale();
    audio.currentTime = clamp(audio.currentTime + d, 0, (audio.duration || CANCIONES[cual].dur) - 0.2);
    acum += d * 12; giro.style.setProperty('--giro', acum);
  });

  doc.addEventListener('visibilitychange', () => {
    if (doc.hidden && sonando) { pausaOculta = true; audio.pause(); }
    else if (!doc.hidden && pausaOculta) { pausaOculta = false; audio.play().catch(() => {}); }
  });

  pinta();
  raf = requestAnimationFrame(bucle);
})();
