/* mixtape.js — las figuritas se pegan al entrar; "Dale play" pone el lofi y el ecualizador baila con el audio.
   Nada suena antes del primer clic; se puede pausar o silenciar; la preferencia de silencio se recuerda. */
(() => {
  'use strict';
  const html = document.documentElement;
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };
  const leer = (k) => { try { return localStorage.getItem(k); } catch { return null; } };

  /* figuritas */
  const pistas = [...document.querySelectorAll('.pista')];
  if (!quieto && 'IntersectionObserver' in window) {
    html.classList.add('js');
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('pegada'); io.unobserve(e.target); }
    }), { threshold: 0.28 });
    pistas.forEach((p) => io.observe(p));
  }

  /* música */
  const play = document.getElementById('play');
  const txt = play.querySelector('.play__txt');
  const ico = play.querySelector('.play__icono');
  const repro = document.getElementById('repro');
  const rPlay = document.getElementById('repro-play');
  const rMudo = document.getElementById('repro-mudo');
  const barras = [...document.querySelectorAll('#eq i')];

  const audio = new Audio();
  audio.src = '/audio/lofi-ambient.mp3';
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = 0.55;
  audio.muted = leer('mixtape:mudo') === '1';

  let ctx = null, analyser = null, datos = null, raf = 0, sonando = false, pausaOculta = false;

  function conectar() {
    if (ctx || quieto) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const fuente = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      fuente.connect(analyser);
      analyser.connect(ctx.destination);
      datos = new Uint8Array(analyser.frequencyBinCount);
      html.classList.add('real');
    } catch { ctx = null; analyser = null; }
  }
  function dibuja() {
    if (!analyser || !sonando) return;
    analyser.getByteFrequencyData(datos);
    const n = barras.length;
    for (let i = 0; i < n; i++) {
      const v = datos[Math.min(datos.length - 1, Math.floor((i / n) * datos.length * 0.75))] / 255;
      barras[i].style.transform = `scaleY(${(0.1 + v * 0.95).toFixed(3)})`;
    }
    raf = requestAnimationFrame(dibuja);
  }
  function pintaEstado() {
    html.classList.toggle('suena', sonando);
    play.setAttribute('aria-pressed', String(sonando));
    txt.textContent = sonando ? 'Pausa' : 'Dale play';
    ico.textContent = sonando ? '❚❚' : '▶';
    rPlay.setAttribute('aria-pressed', String(sonando));
    rPlay.setAttribute('aria-label', sonando ? 'Pausar la música' : 'Poner la música');
    rPlay.firstElementChild.textContent = sonando ? '❚❚' : '▶';
    rMudo.setAttribute('aria-pressed', String(audio.muted));
    rMudo.setAttribute('aria-label', audio.muted ? 'Quitar el silencio' : 'Silenciar la música');
    if (!sonando) barras.forEach((b) => { b.style.transform = ''; });
  }
  async function dale() {
    try {
      conectar();
      if (ctx && ctx.state === 'suspended') await ctx.resume();
      await audio.play();
      sonando = true;
      repro.hidden = false;
      pintaEstado();
      cancelAnimationFrame(raf);
      if (analyser) raf = requestAnimationFrame(dibuja);
    } catch {
      sonando = false; pintaEstado(); txt.textContent = 'No se pudo';
    }
  }
  function pausa() { audio.pause(); sonando = false; cancelAnimationFrame(raf); pintaEstado(); }
  const alterna = () => (sonando ? pausa() : dale());

  play.addEventListener('click', async () => {
    const eraPausa = !sonando;
    await alterna();
    if (eraPausa && sonando) document.getElementById('lado-a').scrollIntoView({ behavior: quieto ? 'auto' : 'smooth' });
  });
  rPlay.addEventListener('click', alterna);
  rMudo.addEventListener('click', () => { audio.muted = !audio.muted; guardar('mixtape:mudo', audio.muted ? '1' : '0'); pintaEstado(); });

  /* si la pestaña se oculta, se pausa; al volver, sigue */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && sonando) { pausaOculta = true; audio.pause(); cancelAnimationFrame(raf); }
    else if (!document.hidden && pausaOculta) { pausaOculta = false; audio.play().then(() => { if (analyser) raf = requestAnimationFrame(dibuja); }).catch(() => {}); }
  });
  pintaEstado();
})();
