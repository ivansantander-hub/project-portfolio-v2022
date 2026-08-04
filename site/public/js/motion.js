/**
 * motion.js — coreografía del sitio.
 *
 *   1. Entrada de página: cortina que sube + titular por líneas enmascaradas
 *   2. Revelados al scroll: máscara clip-path, no un fade genérico
 *   3. Cursor magnético en escritorio
 *
 * Sin GSAP o con prefers-reduced-motion el sitio queda estático y completo:
 * el contenido nunca depende del movimiento.
 */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  document.documentElement.classList.add('js');

  /* ── Partir el titular en palabras enmascaradas ─────────────────────────
     Una máscara por palabra, no por línea. Detectar líneas exige medir
     offsetTop justo después de escribir el DOM, y eso falla cuando la fuente
     todavía no asentó: salían ocho "líneas" de una palabra y sin espacios.
     Por palabra no hay nada que medir y el resultado es el mismo. */
  function splitWords(el) {
    /* Se recorre el DOM en vez de aplanar a texto. Emparejar por valor marcaba
       "por lo que les" en las DOS frases, porque esas palabras se repiten:
       lo que decide el color es de qué nodo viene la palabra, no cuál es. */
    const source = [...el.childNodes];
    const out = [];
    el.textContent = '';

    const pushWord = (word, accent) => {
      const mask = document.createElement('span');
      mask.className = 'ln';
      const inner = document.createElement('span');
      inner.className = 'ln-in';
      if (accent) inner.classList.add('is-em');
      inner.textContent = word;
      mask.appendChild(inner);
      el.appendChild(mask);
      // Espacio real entre máscaras: sin esto las palabras se pegan
      el.appendChild(document.createTextNode(' '));
      out.push(inner);
    };

    const walk = (node, accent) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.trim().split(/\s+/).filter(Boolean)
          .forEach(w => pushWord(w, accent));
        return;
      }
      if (node.nodeName === 'BR') { el.appendChild(document.createElement('br')); return; }
      const isEm = accent || node.nodeName === 'EM';
      [...node.childNodes].forEach(c => walk(c, isEm));
    };

    source.forEach(n => walk(n, false));
    return out;
  }

  const curtain = document.querySelector('.curtain');

  function dropCurtain() {
    if (curtain && curtain.isConnected) curtain.remove();
    document.body.classList.remove('is-loading');
  }

  function finishStatic() {
    document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-in'));
    dropCurtain();
  }

  /* Red de seguridad: la cortina tapa la página entera. Si las fuentes no
     resuelven, GSAP no carga, o la pestaña está en segundo plano y el rAF
     nunca corre, el sitio se quedaría en negro.
     No se cancela nunca — `dropCurtain` es idempotente, así que si la
     animación ya terminó esto no hace nada, y si no terminó, salva la página.
     Cancelarlo al resolver las fuentes fue justo el error: dejaba el destino
     en manos de una animación que podía no arrancar. */
  setTimeout(finishStatic, 3200);

  if (reduced || !hasGsap) {
    finishStatic();
    return;
  }

  document.fonts.ready.then(() => {
    const title = document.querySelector('[data-split]');
    const words = title ? splitWords(title) : [];

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    // 1. La cortina sube y descubre la página
    if (curtain) {
      tl.to(curtain, {
        yPercent: -100,
        duration: 1.0,
        ease: 'expo.inOut',
        onComplete: dropCurtain,
      }, 0.15);
      tl.to('.curtain__label', { autoAlpha: 0, duration: 0.35 }, 0.05);
    }
    document.body.classList.remove('is-loading');

    // 2. Las palabras suben desde debajo de su máscara, en cascada corta
    if (words.length) {
      tl.fromTo(words,
        { yPercent: 106 },
        {
          yPercent: 0, duration: 1.0,
          // Cascada acotada: con muchas palabras debe seguir leyéndose como
          // un solo gesto, no como una lista que aparece de a una.
          stagger: Math.min(0.05, 0.55 / words.length),
        },
        0.5);
    }

    // 3. El resto del hero entra detrás
    tl.fromTo('[data-hero-in]',
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 },
      0.95);

    /* ── Revelados al scroll ────────────────────────────────────────────
       Máscara vertical en vez de fade: el contenido se descubre, no aparece. */
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray('[data-reveal]').forEach(el => {
        gsap.fromTo(el,
          { clipPath: 'inset(0% 0% 100% 0%)', y: 34 },
          {
            clipPath: 'inset(0% 0% 0% 0%)', y: 0,
            duration: 1.05, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
      });

      // Las tarjetas llegan escalonadas, como un solo golpe
      gsap.utils.toArray('[data-stagger]').forEach(group => {
        gsap.fromTo(group.children,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1, y: 0, duration: 0.85, ease: 'expo.out',
            stagger: { each: 0.07, from: 'start' },
            scrollTrigger: { trigger: group, start: 'top 85%', once: true },
          });
      });

      ScrollTrigger.refresh();
    }
  });

  /* ── Cursor magnético (solo puntero fino) ─────────────────────────────── */
  if (!reduced && hasGsap && matchMedia('(pointer: fine)').matches) {
    const ring = document.querySelector('.cursor');
    if (ring) {
      const xTo = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
      const yTo = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

      addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });

      document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('pointerenter', () => ring.classList.add('is-active'));
        el.addEventListener('pointerleave', () => ring.classList.remove('is-active'));
      });
    }
  }
})();
