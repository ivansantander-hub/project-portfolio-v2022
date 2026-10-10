/* mixtape.js — las figuritas se pegan al entrar y "Dale play" enciende el ecualizador. */
(() => {
  'use strict';
  const html = document.documentElement;
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pistas = [...document.querySelectorAll('.pista')];
  if (!quieto && 'IntersectionObserver' in window) {
    html.classList.add('js');
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('pegada'); io.unobserve(e.target); }
    }), { threshold: 0.28 });
    pistas.forEach((p) => io.observe(p));
  }

  const play = document.getElementById('play');
  const txt = play.querySelector('.play__txt');
  const ico = play.querySelector('.play__icono');
  play.addEventListener('click', () => {
    const on = html.classList.toggle('suena');
    play.setAttribute('aria-pressed', String(on));
    txt.textContent = on ? 'Pausa' : 'Dale play';
    ico.textContent = on ? '❚❚' : '▶';
    if (on) document.getElementById('lado-a').scrollIntoView({ behavior: quieto ? 'auto' : 'smooth' });
  });
})();
