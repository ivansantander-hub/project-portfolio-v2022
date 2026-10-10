#!/usr/bin/env node
/**
 * gen-medellin-hills.mjs — genera site/public/medellin-hills/index.html.
 * El portafolio como un mixtape: Lado A (plataforma clínica) y Lado B (proyectos propios), 18 casos.
 * Estructura y reglas visuales de la skill landing-page-design (una tipografía, escala de tamaños,
 * espaciados y radios de las tablas, fondos planos, revelado con IntersectionObserver).
 * Todo el texto sale de src/content/. La letra de la canción NO se usa: solo palabras sueltas del tema.
 *
 *   node scripts/gen-medellin-hills.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'medellin-hills');
mkdirSync(outDir, { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const workDir = join(root, 'src/content/work');
const todos = readdirSync(workDir).filter((f) => f.endsWith('.es.md')).map((f) => matter(readFileSync(join(workDir, f), 'utf8')).data).sort((a, b) => a.order - b.order);
const esClinico = (d) => /ensayos cl[ií]nicos/i.test(d.domain || '');
const LADO_A = todos.filter(esClinico);
const LADO_B = todos.filter((d) => !esClinico(d));
const anios = new Date().getFullYear() - 2019;

const about = matter(readFileSync(join(root, 'src/content/pages/about.es.md'), 'utf8')).content;
const parts = about.split(/^## /m);
const intro = parts[0];
const seccion = (n) => (parts.find((s) => s.startsWith(n)) || '').split('\n').slice(1).join('\n');
const bullets = (n) => [...seccion(n).matchAll(/^- \*\*(.+?)\*\*\s*(.+)$/gm)].map((m) => ({ t: m[1].replace(/\.$/, ''), x: m[2] }));
const lidero = bullets('Cómo lidero');
const stack = [...seccion('Stack').matchAll(/^\*\*(.+?)\*\*\s*·\s*(.+)$/gm)].map((m) => ({ g: m[1], items: m[2].split(' · ') }));
const foco = ((intro.match(/\*\*Foco actual:\*\*\s*(.+)/) || [])[1] || '').replace(/^./, (m) => m.toUpperCase());

/* Íconos de Phosphor (MIT), incrustados tal cual para no pedir nada afuera. */
const icon = (peso, nombre, clase = 'ico') => {
  const svg = readFileSync(join(root, 'node_modules/@phosphor-icons/core/assets', peso, `${nombre}${peso === 'regular' ? '' : '-' + peso}.svg`), 'utf8').trim();
  return svg.replace('<svg ', `<svg class="${clase}" aria-hidden="true" focusable="false" `);
};

/* Sol y rayos: formas planas, sin degradados. */
function rayos() {
  const cx = 800, cy = 430, n = 36, r = 2600;
  let d = '';
  for (let i = 0; i < n; i += 2) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    d += `M${cx},${cy}L${(cx + Math.cos(a0) * r).toFixed(1)},${(cy + Math.sin(a0) * r).toFixed(1)}L${(cx + Math.cos(a1) * r).toFixed(1)},${(cy + Math.sin(a1) * r).toFixed(1)}Z`;
  }
  return d;
}

const beneficios = [
  { ico: 'notebook', t: 'Decisiones que se pueden revisar', x: 'Las decisiones grandes llegan por escrito y con dos opciones y sus costos, para que decida quien tiene el contexto de negocio.' },
  { ico: 'git-branch', t: 'Migraciones sin apagar nada', x: 'El sistema nuevo absorbe piezas mientras el viejo sigue funcionando, con criterios de vuelta atrás definidos desde el inicio.' },
  { ico: 'chart-line-up', t: 'Datos antes que opiniones', x: 'Un inventario real de servicios, dependencias y uso convierte “el sistema se siente pesado” en datos que cualquiera puede evaluar.' },
  { ico: 'lifebuoy', t: 'Un equipo que no pierde la operación', x: 'Durante una migración, una persona se dedica a soporte y bugs del día a día, y las entregas ya comprometidas van primero.' },
];

const faq = [
  { q: '¿En qué trabajas hoy?', a: 'Soy Tech Lead y Technical Product Owner en LearUp, una plataforma de gestión de ensayos clínicos. Defino y priorizo las iniciativas de la plataforma y coordino desarrollo, QA y operaciones.' },
  { q: '¿Con qué tecnologías trabajas?', a: stack.map((g) => `${g.g}: ${g.items.join(', ')}.`).join(' ') },
  { q: '¿Desde cuándo escribes software?', a: 'Desde 2019. Pasé por Be4tech, Newo, Cielum y Omnivida, CogenTech y LearUp, casi siempre en salud digital, con liderazgo técnico en los últimos años.' },
  { q: '¿Trabajas en remoto?', a: 'Sí. Vivo en Medellín, Colombia, y trabajo en remoto.' },
  { q: '¿Qué son los proyectos propios?', a: 'Un ERP para pymes colombianas, un generador de sitios estáticos y un blog con CMS propio, entre otros. Están en el Lado B, con el código abierto cuando se puede, y sirven para probar ideas antes de llevarlas a un equipo.' },
  { q: '¿Trabajas con inteligencia artificial?', a: 'Sí. Armé un asistente de código con IA adaptado a la forma de trabajar del equipo y una propuesta para integrar IA en una plataforma de un entorno regulado. Además tengo proyectos propios con modelos locales.' },
  { q: '¿Cómo te contacto?', a: 'Lo más directo es LinkedIn. También puedes ver mi código en GitHub.' },
];

function caso(c, lado, i) {
  const tags = (c.tags || []).join(', ');
  return `<li class="caso reveal" id="caso-${esc(c.slug)}" data-lado="${lado}">
        <a class="caso__img" href="/trabajo/${esc(c.slug)}/" tabindex="-1" aria-hidden="true"><img src="/medellin-hills/img/${esc(c.slug)}.webp" alt="" width="560" height="560" loading="lazy" decoding="async"></a>
        <div class="caso__cuerpo">
          <p class="caso__meta"><span class="mono">${lado}${String(i + 1).padStart(2, '0')}</span><span>${esc(c.domain)}</span></p>
          <h3 class="caso__titulo"><a href="/trabajo/${esc(c.slug)}/">${esc(c.project)}</a></h3>
          <p class="caso__sub">${esc(c.title)}</p>
          <p class="caso__rol mono">${esc(c.role || '')}</p>
          ${tags ? `<p class="caso__tags">${esc(tags)}</p>` : ''}
          <a class="enlace" href="/trabajo/${esc(c.slug)}/">Abrir el caso${icon('bold', 'arrow-up-right')}<span class="sr"> ${esc(c.project)}</span></a>
        </div>
      </li>`;
}

/* Las dos canciones: tempo medido, estructura y palabras que se prestan a una figurita. */
const CANCIONES = [
  {
    src: '/audio/el-estren.mp3', nombre: 'El estren', dur: 164, tour: true,
    palabras: [
      { t: 10, img: 'pal-balon', txt: 'Cotejo' }, { t: 16, img: 'pal-ano-viejo', txt: 'Año viejo' },
      { t: 33, img: 'pal-arepa', txt: 'Arepa' }, { t: 34.5, img: 'pal-cafe', txt: 'Café' },
      { t: 38, img: 'pal-carriel', txt: 'Carriel' }, { t: 40, img: 'pal-sancocho', txt: 'Sancocho' },
      { t: 43, img: 'pal-vecina', txt: 'La vecina' }, { t: 71, img: 'pal-remedios', txt: 'Remedios' },
      { t: 76, img: 'pal-cancha', txt: 'Cancha' }, { t: 79, img: 'pal-cometa', txt: 'Cometas' },
    ],
    drops: [],
  },
  { src: '/audio/india-conocida.mp3', nombre: 'India conocida', dur: 275, tour: false, palabras: [], drops: [109, 161, 202] },
];

const NAV = [['lado-a', 'Lado A'], ['como-lidero', 'Cómo lidero'], ['lado-b', 'Lado B'], ['preguntas', 'Preguntas'], ['contacto', 'Contacto']];
const DESC = 'Iván Santander, Tech Lead y Technical Product Owner en Medellín. Arquitectura y producto para plataformas de salud reguladas, contado como un mixtape: lado A, plataforma clínica; lado B, proyectos propios.';

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Iván Santander · Medellín Hills</title>
<meta name="description" content="${esc(DESC)}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#131209">
<meta property="og:type" content="website">
<meta property="og:title" content="Iván Santander · Medellín Hills">
<meta property="og:description" content="${esc(DESC)}">
<meta property="og:image" content="https://ivansantander.com/medellin-hills/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico">
<link rel="preload" href="/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/medellin-hills/hills.css">
<script type="application/json" id="canciones">${JSON.stringify(CANCIONES)}</script>
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>

<header class="isla" id="isla">
  <a class="isla__marca" href="#inicio">Iván Santander</a>
  <nav class="isla__nav" aria-label="Secciones">
    ${NAV.map(([id, t]) => `<a href="#${id}" data-sec="${id}">${t}</a>`).join('\n    ')}
  </nav>
  <button class="isla__musica" type="button" id="musica" aria-pressed="false" aria-label="Poner la música">${icon('fill', 'play')}</button>
  <button class="isla__menu" type="button" id="abre-menu" aria-expanded="false" aria-controls="menu" aria-label="Abrir el menú"><span class="l1"></span><span class="l2"></span></button>
</header>
<div class="menu" id="menu" aria-hidden="true">
  <nav aria-label="Menú">
    ${NAV.map(([id, t], i) => `<a href="#${id}" style="--d:${100 + i * 50}ms" tabindex="-1">${t}</a>`).join('\n    ')}
    <a href="/" style="--d:${100 + NAV.length * 50}ms" tabindex="-1">Portafolio principal</a>
  </nav>
</div>

<main id="contenido">
  <section class="hero" id="inicio" aria-labelledby="t-hero">
    <div class="hero__texto reveal">
      <p class="etiqueta">Medellín, Colombia · remoto</p>
      <h1 id="t-hero" class="degradado">Arquitectura y producto para plataformas de salud reguladas</h1>
      <p class="hero__sub">Soy Iván Santander, Tech Lead y Technical Product Owner. Escribo software desde 2019, con liderazgo técnico en los últimos años.</p>
      <p class="hero__cta">
        <a class="boton boton--prim" href="https://www.linkedin.com/in/ivan-santander/" rel="noopener">Escríbeme en LinkedIn${icon('bold', 'arrow-up-right')}</a>
        <a class="enlace" href="#lado-a">Ver los ${todos.length} casos</a>
      </p>
      <dl class="prueba">
        <div><dt>Años</dt><dd class="mono">${anios}</dd></div>
        <div><dt>Casos</dt><dd class="mono">${todos.length}</dd></div>
        <div><dt>En plataforma clínica</dt><dd class="mono">${LADO_A.length}</dd></div>
      </dl>
    </div>

    <div class="visual reveal" role="img" aria-label="Un casete grande frente a una loma de casitas de colores de Medellín, con el sol detrás y una cabina del Metrocable cruzando el cielo.">
      <svg class="visual__cielo" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <rect width="1600" height="1000" fill="#F4B13E"/>
        <g class="rayos"><path d="${rayos()}" fill="#E9743C"/></g>
        <circle cx="800" cy="430" r="190" fill="#FBE9BD"/>
      </svg>
      <img class="visual__loma" src="/medellin-hills/img/loma.webp" alt="" width="2000" height="1333" fetchpriority="high">
      <svg class="visual__cable" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <line x1="1640" y1="40" x2="280" y2="330" stroke="#131209" stroke-width="3"/>
        <g class="cabina"><image href="/medellin-hills/img/cabina.webp" x="-48" y="2" width="96" height="120"/><animateMotion dur="48s" repeatCount="indefinite" path="M1640,40 L280,330" /></g>
      </svg>
      <img class="visual__casete" src="/medellin-hills/img/casete.webp" alt="" width="1100" height="712" fetchpriority="high">
      <button class="visual__play" type="button" id="casete-play" aria-label="Dale play: poner la música">${icon('fill', 'play')}<span>Dale play</span></button>
    </div>
  </section>

  <section class="tagline" aria-label="Lo que hago">
    <p class="tagline__txt" id="tagline">${esc(foco)}</p>
  </section>

  <section class="seccion" id="beneficios" aria-labelledby="t-ben">
    <div class="seccion__cab reveal"><p class="etiqueta">Cómo trabajo</p><h2 id="t-ben">Qué cambia cuando se trabaja así</h2></div>
    <ul class="beneficios">
      ${beneficios.map((b) => `<li class="beneficio reveal">${icon('regular', b.ico, 'ico ico--lg')}<h3>${esc(b.t)}</h3><p>${esc(b.x)}</p></li>`).join('\n      ')}
    </ul>
  </section>

  <section class="seccion seccion--alt" id="como-lidero" aria-labelledby="t-lid">
    <div class="seccion__cab reveal"><p class="etiqueta">Cómo lidero</p><h2 id="t-lid">Cuatro pasos para cambiar un sistema con el equipo adentro</h2></div>
    <ol class="pasos">
      ${lidero.map((p, i) => `<li class="paso reveal"><span class="paso__n mono" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${esc(p.t)}</h3><p>${esc(p.x)}</p></li>`).join('\n      ')}
    </ol>
  </section>

  <section class="seccion" id="lado-a" aria-labelledby="t-a">
    <div class="seccion__cab reveal"><p class="etiqueta">Lado A</p><h2 id="t-a">Plataforma clínica</h2><p class="seccion__sub">${esc(LADO_A[0].domain)}. ${LADO_A.length} casos.</p></div>
    <ol class="casos">
      ${LADO_A.map((c, i) => caso(c, 'A', i)).join('\n      ')}
    </ol>
  </section>

  <section class="seccion seccion--alt" id="lado-b" aria-labelledby="t-b">
    <div class="seccion__cab reveal"><p class="etiqueta">Lado B</p><h2 id="t-b">Proyectos propios</h2><p class="seccion__sub">Sirven para probar ideas antes de llevarlas a un equipo. ${LADO_B.length} casos.</p></div>
    <ol class="casos">
      ${LADO_B.map((c, i) => caso(c, 'B', i)).join('\n      ')}
    </ol>
  </section>

  <section class="seccion" id="preguntas" aria-labelledby="t-faq">
    <div class="seccion__cab reveal"><p class="etiqueta">Preguntas frecuentes</p><h2 id="t-faq">Lo que suelen preguntar</h2></div>
    <div class="faq reveal">
      ${faq.map((f) => `<details><summary>${esc(f.q)}${icon('bold', 'caret-down', 'ico ico--caret')}</summary><p>${esc(f.a)}</p></details>`).join('\n      ')}
    </div>
  </section>

  <section class="final" id="contacto" aria-labelledby="t-fin">
    <div class="final__texto reveal">
      <p class="etiqueta">Pista final</p>
      <h2 id="t-fin">¿Hablamos?</h2>
      <p class="final__lead">Para hablar de arquitectura, liderazgo técnico o de alguno de estos casos, escríbeme.</p>
      <p class="hero__cta">
        <a class="boton boton--prim" href="https://www.linkedin.com/in/ivan-santander/" rel="noopener">Escríbeme en LinkedIn${icon('bold', 'arrow-up-right')}</a>
        <a class="enlace" href="https://github.com/ivansantander-hub" rel="noopener">Ver GitHub</a>
      </p>
      <p class="final__lugar mono">Medellín, Colombia · Trabajo en remoto</p>
    </div>
    <div class="vinilo reveal" id="vinilo" role="slider" tabindex="0" aria-label="Rayar el disco: mueve la canción adelante y atrás" aria-valuemin="0" aria-valuemax="164" aria-valuenow="0">
      <div class="vinilo__giro"><img src="/medellin-hills/img/vinilo.webp" alt="" width="800" height="800" loading="lazy" draggable="false"></div>
    </div>
  </section>
</main>

<footer class="pie">
  <p>© ${new Date().getFullYear()} Iván Santander · Medellín, Colombia</p>
  <nav aria-label="Pie">
    <a href="/">Portafolio principal</a>
    <a href="/trabajo/">Todos los casos</a>
    <a href="https://github.com/ivansantander-hub" rel="noopener">GitHub</a>
  </nav>
</footer>

<div class="palabras" id="palabras" aria-hidden="true"></div>

<div class="reproductor" id="repro" hidden>
  <button type="button" id="repro-play" aria-pressed="true" aria-label="Pausar la música">${icon('fill', 'pause')}</button>
  <div class="repro__info"><p class="repro__txt" id="repro-nombre">El estren</p><div class="repro__bars" aria-hidden="true">${'<i></i>'.repeat(8)}</div></div>
  <button type="button" class="repro__modo" id="repro-modo" aria-pressed="true" title="La página sigue la canción. Mueve el scroll para explorar tú.">Seguir la canción</button>
  <button type="button" id="repro-sig" aria-label="Cambiar de canción">${icon('fill', 'skip-forward')}</button>
  <button type="button" id="repro-mudo" aria-pressed="false" aria-label="Silenciar la música">${icon('fill', 'speaker-high')}${icon('fill', 'speaker-slash', 'ico ico--off')}</button>
</div>
<p class="sr" id="aviso" role="status" aria-live="polite"></p>
<script src="/medellin-hills/hills.js" defer></script>
</body>
</html>
`;

writeFileSync(join(outDir, 'index.html'), html);
console.log(`medellin-hills v2: ${LADO_A.length}+${LADO_B.length} casos, ${(html.length / 1024).toFixed(0)} KB`);
