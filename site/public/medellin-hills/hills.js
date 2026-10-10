/* hills.js — Medellín Hills: la página late con la canción.
   · Reloj de pulso: el tempo medido de cada canción (94 BPM en "El estren") mueve a mano solo unos pocos elementos (nada de variables globales: eso recalculaba todo el estilo).
   · Escuchar: el scroll sigue la estructura de la canción. Mover el scroll pasa a Explorar.
   · Palabras: figuritas que aparecen cuando suena la palabra (solo palabras sueltas, nunca la letra).
   · Vinilo: arrastrarlo "ralla" la canción. Nada suena antes del primer clic. */
(() => {
  'use strict';
  const doc = document, html = doc.documentElement;
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };
  const leer = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const $ = (id) => doc.getElementById(id);

  const CANCIONES = JSON.parse($('canciones').textContent);
  const play = $('play'), repro = $('repro'), rPlay = $('repro-play'), rMudo = $('repro-mudo'), rSig = $('repro-sig'), rModo = $('repro-modo'), rNombre = $('repro-nombre');
  const aviso = $('aviso'), palabras = $('palabras'), vinilo = $('vinilo'), giro = vinilo.querySelector('.vinilo__giro');
  const barras = [...doc.querySelectorAll('#eq i')];
  const capa = { sol: doc.querySelector('.sol'), loma: doc.querySelector('.loma'), casete: doc.querySelector('.casete'), ruta: doc.querySelector('.ruta') };
  const deco = [...doc.querySelectorAll('.deco img')];
  let decoVisible = false, figAct = null, claveAnt = '';
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { decoVisible = e.isIntersecting; }).observe(doc.querySelector('.deco'));
  /* el latido y el parallax: solo transform, solo lo que se ve, y solo si cambió */
  function aplica(pulso, sy) {
    const clave = `${Math.round(pulso * 40)}|${Math.round(sy / 3)}|${decoVisible}`;
    if (clave === claveAnt) return;
    claveAnt = clave;
    if (sy < innerHeight * 1.3) {
      capa.sol.style.transform = `scale(${(1 + pulso * 0.05).toFixed(3)})`;
      capa.loma.style.transform = `translateY(${(sy * 0.12).toFixed(1)}px) scale(${(1 + pulso * 0.012).toFixed(4)})`;
      capa.casete.style.transform = `translateY(${(sy * 0.25 - pulso * 12).toFixed(1)}px) rotate(${(-pulso * 0.8).toFixed(2)}deg) scale(${(1 + pulso * 0.018).toFixed(4)})`;
    }
    if (figAct) figAct.style.transform = `scale(${(1 + pulso * 0.07).toFixed(3)})`;
    if (decoVisible) deco.forEach((d, i) => { d.style.transform = `scale(${(1 + pulso * (i === 2 ? 0 : 0.06)).toFixed(3)})`; });
  }
  const txt = play.querySelector('.play__txt'), ico = play.querySelector('.play__icono');
  const anuncia = (m) => { aviso.textContent = ''; setTimeout(() => { aviso.textContent = m; }, 40); };

  /* ───────── figuritas que se pegan al entrar ───────── */
  const pistas = [...doc.querySelectorAll('.pista')];
  if (!quieto && 'IntersectionObserver' in window) {
    html.classList.add('js');
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('pegada'); io.unobserve(e.target); } }), { threshold: 0.28 });
    pistas.forEach((p) => io.observe(p));
  }

  /* ───────── audio ───────── */
  let cual = Number(leer('hills:cancion')) === 1 ? 1 : 0;
  const audio = new Audio();
  audio.src = CANCIONES[cual].src;
  audio.loop = true; audio.preload = 'none'; audio.volume = 0.6;
  audio.muted = leer('hills:mudo') === '1';
  let ctx = null, analyser = null, datos = null, sonando = false, pausaOculta = false;
  let modo = 'escuchar', idxTour = -1, activa = null, tPrev = 0, ultDrop = -1;

  function conectar() {
    if (ctx || quieto) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const f = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser(); analyser.fftSize = 128; analyser.smoothingTimeConstant = 0.78;
      f.connect(analyser); analyser.connect(ctx.destination);
      datos = new Uint8Array(analyser.frequencyBinCount);
      html.classList.add('real');
    } catch { ctx = null; analyser = null; }
  }

  /* ───────── el recorrido: la estructura de "El estren" (intro, coros y versos, puente, coro final, outro) ───────── */
  const A = pistas.filter((p) => p.closest('#lado-a')), B = pistas.filter((p) => p.closest('#lado-b'));
  const TOUR = [{ t: 0, el: $('inicio') }];
  A.forEach((p, i) => TOUR.push({ t: 10 + i * 8.1, el: p }));
  TOUR.push({ t: 91, el: $('trabajo') });
  B.forEach((p, i) => TOUR.push({ t: 112 + i * 5.5, el: p }));
  TOUR.push({ t: 156, el: $('contacto') });

  function marcaActiva(el) {
    if (el === activa) return;
    activa?.classList.remove('activa');
    if (figAct) figAct.style.transform = '';
    activa = el; el?.classList.add('activa');
    figAct = el ? el.querySelector('.fig') : null;
  }
  function tour(t) {
    let i = 0;
    for (let k = 0; k < TOUR.length; k++) if (t >= TOUR[k].t) i = k;
    if (i === idxTour) return;
    idxTour = i;
    const el = TOUR[i].el;
    marcaActiva(el);
    if (modo === 'escuchar' && !quieto) el.scrollIntoView({ behavior: 'smooth', block: i === 0 || el.id === 'contacto' ? 'start' : 'center' });
  }

  /* en Explorar, la activa es la que está en el centro de la pantalla */
  if ('IntersectionObserver' in window) {
    const centro = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && modo === 'explorar') marcaActiva(e.target); }), { rootMargin: '-45% 0px -45% 0px' });
    [...pistas, $('trabajo')].forEach((p) => centro.observe(p));
  }

  /* ───────── palabras de la canción ───────── */
  const SPOTS = [[4, 62], [78, 58], [3, 30], [80, 26], [6, 78], [76, 74], [10, 46], [72, 44]];
  let spot = 0;
  function pop(p) {
    const base = palabras.querySelector(`[data-pal="${p.img}"]`);
    if (!base || quieto) return;
    const f = doc.createElement('figure');
    f.className = 'pop';
    const s = SPOTS[spot++ % SPOTS.length];
    f.style.cssText = `left:${s[0]}%;top:${s[1]}%;--r0:${spot % 2 ? -28 : 28}deg;--r1:${spot % 2 ? 7 : -7}deg`;
    const im = base.cloneNode(); im.hidden = false; im.removeAttribute('data-pal');
    const c = doc.createElement('span'); c.textContent = p.txt;
    f.append(im, c); palabras.append(f);
    setTimeout(() => f.remove(), 3400);
  }

  /* ───────── reloj de pulso + ecualizador + cabina ───────── */
  let raf = 0, idle = 0;
  function bucle(now) {
    raf = requestAnimationFrame(bucle);
    if (doc.hidden) return;
    const c = CANCIONES[cual];
    const t = audio.currentTime;
    // pulso: 1 en el golpe, decae rápido
    let pulso = 0;
    if (sonando && !quieto) {
      const latencia = ctx ? (ctx.outputLatency || ctx.baseLatency || 0) : 0;
      const beats = (t - latencia - c.pulso0) * c.bpm / 60;
      const fase = beats - Math.floor(beats);
      pulso = Math.pow(1 - fase, 3);
    }
    aplica(pulso, scrollY);
    // cabina del Metrocable: avanza con la canción, o muy despacio si está en pausa
    const p = sonando ? (t / c.dur) % 1 : (idle += 0.00006, idle % 1);
    if (scrollY < innerHeight * 1.3) { capa.ruta.style.setProperty('--cx', (100 - p * 86).toFixed(2)); capa.ruta.style.setProperty('--cy', (2 + p * 28).toFixed(2)); }
    if (sonando) {
      if (analyser) {
        analyser.getByteFrequencyData(datos);
        const n = barras.length;
        for (let i = 0; i < n; i++) barras[i].style.transform = `scaleY(${(0.1 + datos[Math.min(datos.length - 1, Math.floor((i / n) * datos.length * 0.75))] / 255 * 0.95).toFixed(3)})`;
      }
      if (c.tour && t < tPrev - 1) { idxTour = -1; }
      if (c.tour) tour(t);
      for (const w of c.palabras) if (tPrev < w.t && t >= w.t && t - tPrev < 1.2) pop(w);
      for (const d of c.drops) if (tPrev < d && t >= d && t - tPrev < 1.2 && d !== ultDrop) { ultDrop = d; doc.body.classList.add('drop'); setTimeout(() => doc.body.classList.remove('drop'), 650); }
      vinilo.setAttribute('aria-valuenow', String(Math.round(t)));
    }
    tPrev = t;
  }

  /* ───────── controles ───────── */
  function pintaEstado() {
    html.classList.toggle('suena', sonando);
    html.classList.toggle('rap', cual === 1);
    play.setAttribute('aria-pressed', String(sonando));
    txt.textContent = sonando ? 'Pausa' : 'Dale play';
    ico.textContent = sonando ? '❚❚' : '▶';
    rPlay.setAttribute('aria-pressed', String(sonando));
    rPlay.setAttribute('aria-label', sonando ? 'Pausar la música' : 'Poner la música');
    rPlay.firstElementChild.textContent = sonando ? '❚❚' : '▶';
    rNombre.textContent = CANCIONES[cual].nombre;
    rMudo.setAttribute('aria-pressed', String(audio.muted));
    rMudo.setAttribute('aria-label', audio.muted ? 'Quitar el silencio' : 'Silenciar la música');
    const tourOk = CANCIONES[cual].tour;
    rModo.disabled = !tourOk;
    rModo.setAttribute('aria-pressed', String(modo === 'escuchar' && tourOk));
    rModo.firstElementChild.textContent = modo === 'escuchar' && tourOk ? 'Escuchar' : 'Explorar';
    vinilo.setAttribute('aria-valuemax', String(CANCIONES[cual].dur));
    if (!sonando) barras.forEach((b) => { b.style.transform = ''; });
  }
  async function dale() {
    try {
      conectar();
      if (ctx && ctx.state === 'suspended') await ctx.resume();
      await audio.play();
      sonando = true; repro.hidden = false; tPrev = audio.currentTime; idxTour = -1;
      pintaEstado();
      if (!raf) raf = requestAnimationFrame(bucle);
      if (CANCIONES[cual].tour && modo === 'escuchar') anuncia('Modo escuchar: la página sigue la canción. Mueve el scroll para explorar tú.');
    } catch { sonando = false; pintaEstado(); txt.textContent = 'No se pudo'; }
  }
  function pausa() { audio.pause(); sonando = false; pintaEstado(); }
  const alterna = () => (sonando ? pausa() : dale());

  play.addEventListener('click', alterna);
  rPlay.addEventListener('click', alterna);
  rMudo.addEventListener('click', () => { audio.muted = !audio.muted; guardar('hills:mudo', audio.muted ? '1' : '0'); pintaEstado(); });
  rSig.addEventListener('click', () => {
    cual = (cual + 1) % CANCIONES.length; guardar('hills:cancion', String(cual));
    audio.src = CANCIONES[cual].src; tPrev = 0; idxTour = -1; ultDrop = -1;
    if (cual === 1) modo = 'explorar';
    if (sonando) audio.play().catch(() => {});
    pintaEstado(); anuncia(`Suena ${CANCIONES[cual].nombre}`);
  });
  rModo.addEventListener('click', () => {
    modo = modo === 'escuchar' ? 'explorar' : 'escuchar'; idxTour = -1; pintaEstado();
    anuncia(modo === 'escuchar' ? 'Modo escuchar: la página sigue la canción.' : 'Modo explorar: tú mandas el scroll.');
  });

  /* mover el scroll por cuenta propia = Explorar */
  const exploras = () => { if (modo === 'escuchar' && sonando && CANCIONES[cual].tour) { modo = 'explorar'; pintaEstado(); anuncia('Modo explorar: tú mandas el scroll.'); } };
  addEventListener('wheel', exploras, { passive: true });
  addEventListener('touchmove', exploras, { passive: true });
  addEventListener('keydown', (e) => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key) && !e.target.closest('button, a, [role="slider"]')) exploras(); });

  /* ───────── vinilo: arrastrar para rayar ───────── */
  let arrastra = false, aPrev = 0, acum = 0;
  const angulo = (e) => { const r = vinilo.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
  vinilo.addEventListener('pointerdown', (e) => { arrastra = true; aPrev = angulo(e); vinilo.setPointerCapture(e.pointerId); vinilo.style.animationPlayState = 'paused'; if (!sonando) dale(); });
  vinilo.addEventListener('pointermove', (e) => {
    if (!arrastra) return;
    let d = angulo(e) - aPrev; if (d > 180) d -= 360; if (d < -180) d += 360;
    aPrev = angulo(e); acum += d; giro.style.setProperty('--giro', acum.toFixed(1));
    if (audio.duration) audio.currentTime = clamp(audio.currentTime + d / 360 * 2.2, 0, audio.duration - 0.2);
  });
  const suelta = () => { arrastra = false; vinilo.style.animationPlayState = ''; };
  vinilo.addEventListener('pointerup', suelta); vinilo.addEventListener('pointercancel', suelta);
  vinilo.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 5 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -5 : 0;
    if (!d) return; e.preventDefault();
    if (!sonando) dale();
    audio.currentTime = clamp(audio.currentTime + d, 0, (audio.duration || CANCIONES[cual].dur) - 0.2);
    acum += d * 12; giro.style.setProperty('--giro', acum);
  });

  /* pestaña oculta = pausa; al volver sigue */
  doc.addEventListener('visibilitychange', () => {
    if (doc.hidden && sonando) { pausaOculta = true; audio.pause(); }
    else if (!doc.hidden && pausaOculta) { pausaOculta = false; audio.play().catch(() => {}); }
  });

  pintaEstado();
  raf = requestAnimationFrame(bucle);
})();
