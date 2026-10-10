/* world.js — la cámara del mundo.
   El scroll no mueve la página: mueve la cámara sobre un mundo SVG (viewBox) y avanza el faro
   por la ruta. Cada parada tiene su texto; solo el de la parada en foco es visible. */
(() => {
  'use strict';
  const doc = document, html = doc.documentElement;
  const geoEl = doc.getElementById('geo');
  if (!geoEl) return;

  const { paradas } = JSON.parse(geoEl.textContent);
  const pista = doc.getElementById('pista');
  const escena = doc.getElementById('escena');
  const mundo = doc.getElementById('mundo');
  const trazo = doc.getElementById('trazo');
  const faro = doc.getElementById('faro-ruta');
  const hud = doc.getElementById('hud');
  const hudTxt = doc.getElementById('hud-txt');
  const capas = [...escena.querySelectorAll('.capa')].map((el) => ({ el, f: +el.dataset.f, vb0: el.getAttribute('viewBox') }));
  const vbMundo0 = mundo.getAttribute('viewBox');
  const navLinks = [...doc.querySelectorAll('.barra__nav a')];
  const NOMBRES = { inicio: 'Inicio', clinica: 'Plataforma clínica', propios: 'Proyectos propios', taller: 'El taller', contacto: 'Contacto' };

  const stops = paradas.map((p) => ({ ...p, el: doc.getElementById(p.id), ed: p.edif ? doc.getElementById(p.edif) : null }));
  const primeraDeCap = {};
  stops.forEach((s, i) => { if (!(s.cap in primeraDeCap)) primeraDeCap[s.cap] = i; });

  const mqLarga = matchMedia('(min-width: 900px) and (min-aspect-ratio: 5/4)');
  const mqQuieta = matchMedia('(prefers-reduced-motion: reduce)');
  const S = { on: false, W: 1, H: 1, k: 1, segs: [], total: 0, top: 0, len: 1, cam: null, foco: -1, ultimo: 0, destino: null, raf: 0, ult: 0, ysc: -1 };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const desde = (s) => ({ x: s.wx, y: s.wy, s: s.z * S.k, ax: s.ax, ay: s.ay, r: s.ruta });

  function medir() {
    S.W = escena.clientWidth || innerWidth;
    S.H = escena.clientHeight || innerHeight;
    S.k = Math.min(S.W / 1440, S.H / 900);
    S.len = trazo.getTotalLength();
    let y = 0;
    S.segs = [];
    stops.forEach((st, i) => {
      const h = st.hold * S.H;
      S.segs.push({ t: 'hold', i, a: y, b: y + h });
      y += h;
      if (i < stops.length - 1) {
        const n = stops[i + 1];
        const d = Math.hypot(n.wx - st.wx, n.wy - st.wy);
        const m = (0.55 + Math.min(1.1, d / 2600)) * S.H;
        S.segs.push({ t: 'move', i, a: y, b: y + m });
        y += m;
      }
    });
    S.total = y;
    pista.style.height = `${Math.ceil(y + S.H)}px`;
    S.top = pista.getBoundingClientRect().top + scrollY;
  }

  function objetivo(py) {
    const y = clamp(py, 0, S.total);
    const seg = S.segs.find((s) => y <= s.b) || S.segs[S.segs.length - 1];
    const A = stops[seg.i];
    if (seg.t === 'hold') return { ...desde(A), idx: seg.i };
    const B = stops[seg.i + 1];
    const e = ease(clamp((y - seg.a) / (seg.b - seg.a), 0, 1));
    const d = Math.hypot(B.wx - A.wx, B.wy - A.wy);
    const sube = Math.min(0.55, d / 3800); // en los saltos largos la cámara sube y se aleja
    const a = desde(A), b = desde(B);
    return {
      x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e),
      s: lerp(a.s, b.s, e) * (1 - sube * Math.sin(Math.PI * e)),
      ax: lerp(a.ax, b.ax, e), ay: lerp(a.ay, b.ay, e), r: lerp(a.r, b.r, e),
      idx: e < 0.12 ? seg.i : e > 0.88 ? seg.i + 1 : -1, // en pleno vuelo no hay panel
    };
  }

  function pinta(c) {
    const { W, H } = S;
    mundo.setAttribute('viewBox', `${c.x - (c.ax * W) / c.s} ${c.y - (c.ay * H) / c.s} ${W / c.s} ${H / c.s}`);
    for (const l of capas) {
      const sl = 1 + (c.s - 1) * l.f;
      l.el.setAttribute('viewBox', `${c.x * l.f - (c.ax * W) / sl} ${c.y * l.f - (c.ay * H) / sl} ${W / sl} ${H / sl}`);
    }
    const p = trazo.getPointAtLength(clamp(c.r, 0, 1) * S.len);
    faro.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
  }

  function enFoco(i) {
    if (i === S.foco) return;
    const ant = stops[S.foco];
    if (ant) { ant.el && ant.el.classList.remove('is-foco'); ant.ed && ant.ed.classList.remove('is-foco'); }
    S.foco = i;
    if (i < 0) return;
    S.ultimo = i;
    const st = stops[i];
    st.el && st.el.classList.add('is-foco');
    st.ed && st.ed.classList.add('is-foco');
    const n = st.el && st.el.querySelector('.caso__n');
    hudTxt.textContent = `${NOMBRES[st.cap]}${n ? ` · ${n.textContent}` : ''}`;
    navLinks.forEach((a) => (a.dataset.cap === st.cap ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    if (S.destino === i) S.destino = null;
  }

  function bucle(t) {
    if (!S.on) return;
    S.raf = requestAnimationFrame(bucle);
    const dt = Math.min(0.05, (t - S.ult) / 1000 || 0.016);
    S.ult = t;
    const o = objetivo(scrollY - S.top);
    enFoco(o.idx);
    if (!S.cam) S.cam = o;
    const c = S.cam, a = 1 - Math.exp(-dt * 7);
    const quieto = Math.abs(o.x - c.x) + Math.abs(o.y - c.y) < 0.05 && Math.abs(o.s - c.s) < 0.0005 && Math.abs(o.r - c.r) < 0.00005;
    if (quieto && S.ysc === scrollY) return;
    S.ysc = scrollY;
    for (const k of ['x', 'y', 's', 'ax', 'ay', 'r']) c[k] = lerp(c[k], o[k], a);
    pinta(c);
  }

  /* ───────── navegación ───────── */
  const holdDe = (i) => S.segs.find((s) => s.t === 'hold' && s.i === i);
  function irA(i) {
    i = clamp(i, 0, stops.length - 1);
    S.destino = i;
    scrollTo({ top: S.top + holdDe(i).a + 2, behavior: 'smooth' });
  }
  const actual = () => (S.destino != null ? S.destino : S.ultimo);

  function teclas(e) {
    if (!S.on || e.altKey || e.ctrlKey || e.metaKey) return;
    const el = e.target;
    const interactivo = el && el.closest && el.closest('a, button, input, textarea, select');
    let d = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') d = 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') d = -1;
    else if (e.key === ' ' && !interactivo) d = e.shiftKey ? -1 : 1;
    else if (e.key === 'Home') { e.preventDefault(); irA(0); return; }
    else if (e.key === 'End') { e.preventDefault(); irA(stops.length - 1); return; }
    if (!d) return;
    e.preventDefault();
    irA(actual() + d);
  }

  const soltarDestino = () => { S.destino = null; };
  function clicNav(e) {
    if (!S.on) return;
    const cap = e.currentTarget.dataset.cap;
    if (cap in primeraDeCap) { e.preventDefault(); irA(primeraDeCap[cap]); }
  }
  function foco(e) {
    if (!S.on) return;
    const art = e.target.closest && e.target.closest('.parada');
    const i = stops.findIndex((s) => s.el === art);
    if (i >= 0 && i !== S.ultimo && S.destino == null) irA(i);
  }

  /* ───────── modo ───────── */
  function activar() {
    if (S.on) return;
    S.on = true;
    html.classList.add('modo-mundo');
    hud.hidden = false;
    medir();
    S.cam = null; S.ysc = -1; S.foco = -1; S.ultimo = 0;
    pinta(S.cam = objetivo(scrollY - S.top));
    enFoco(S.cam.idx < 0 ? S.ultimo : S.cam.idx);
    S.ult = performance.now();
    S.raf = requestAnimationFrame(bucle);
    addEventListener('keydown', teclas);
    addEventListener('wheel', soltarDestino, { passive: true });
    addEventListener('touchstart', soltarDestino, { passive: true });
    doc.addEventListener('focusin', foco);
    navLinks.forEach((a) => a.addEventListener('click', clicNav));
    if (location.hash) {
      const h = location.hash.slice(1);
      const i = stops.findIndex((s) => s.id === h || s.id === `p-${h}`);
      if (i >= 0) irA(i); else if (h in primeraDeCap) irA(primeraDeCap[h]);
    }
  }
  function desactivar() {
    if (!S.on) return;
    S.on = false;
    cancelAnimationFrame(S.raf);
    html.classList.remove('modo-mundo');
    hud.hidden = true;
    pista.style.height = '';
    mundo.setAttribute('viewBox', vbMundo0);
    capas.forEach((l) => l.el.setAttribute('viewBox', l.vb0));
    stops.forEach((s) => { s.el && s.el.classList.remove('is-foco'); s.ed && s.ed.classList.remove('is-foco'); });
    navLinks.forEach((a) => a.removeAttribute('aria-current'));
    S.foco = -1;
    removeEventListener('keydown', teclas);
    removeEventListener('wheel', soltarDestino);
    removeEventListener('touchstart', soltarDestino);
    doc.removeEventListener('focusin', foco);
    navLinks.forEach((a) => a.removeEventListener('click', clicNav));
  }
  function evaluar() {
    if (mqLarga.matches && !mqQuieta.matches) {
      if (S.on) { const f = S.ultimo; medir(); S.cam = null; S.ysc = -1; scrollTo({ top: S.top + holdDe(f).a + 2, behavior: 'instant' }); } else activar();
    } else desactivar();
  }

  hud.querySelector('#ant').addEventListener('click', () => irA(actual() - 1));
  hud.querySelector('#sig').addEventListener('click', () => irA(actual() + 1));
  let t = 0;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(evaluar, 160); });
  mqLarga.addEventListener('change', evaluar);
  mqQuieta.addEventListener('change', evaluar);
  if (doc.readyState === 'complete') evaluar(); else addEventListener('load', evaluar);
  doc.fonts && doc.fonts.ready.then(() => S.on && (medir(), (S.ysc = -1)));
})();
