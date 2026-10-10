#!/usr/bin/env node
/**
 * gen-medellin-hills.mjs — genera site/public/medellin-hills/index.html.
 * El portafolio como un mixtape vivo: la página late al compás de "El estren" (94 BPM) y sigue la
 * estructura de la canción. Lado A = plataforma clínica, Lado B = proyectos propios; los 18 casos.
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
const frase = (about.trim().split('\n')[0].split('. ')[0] || '').replace(/\.$/, '') + '.';
const seccion = (nombre) => (about.split(/^## /m).find((s) => s.startsWith(nombre)) || '').split('\n').slice(1).join('\n');
const reglas = [...seccion('Cómo trabajo').matchAll(/^- \*\*(.+?)\*\*\s*(.+)$/gm)].map((m) => ({ t: m[1].replace(/\.$/, ''), x: m[2] }));

const COLORES = ['teal', 'mostaza', 'rosa', 'terracota', 'crema'];
let n = 0;
function pista(c, lado, i) {
  const clase = COLORES[n++ % COLORES.length];
  const tags = (c.tags || []).join(' · ');
  return `<li class="pista pista--${clase}${i % 2 ? ' pista--inv' : ''}" id="pista-${esc(c.slug)}" data-slug="${esc(c.slug)}">
      <p class="pista__num" aria-hidden="true">${lado}${i + 1}</p>
      <div class="fig"><img class="figurita" src="/medellin-hills/img/${esc(c.slug)}.webp" alt="" width="560" height="560" loading="lazy" decoding="async"></div>
      <article class="pista__texto">
        <p class="pista__dom">${esc(c.domain)}</p>
        <h3 class="pista__titulo"><a href="/trabajo/${esc(c.slug)}/">${esc(c.project)}</a></h3>
        <p class="pista__sub">${esc(c.title)}</p>
        <p class="pista__rol">${esc(c.role || '')}</p>
        ${tags ? `<p class="pista__tags">${esc(tags)}</p>` : ''}
        <a class="boton" href="/trabajo/${esc(c.slug)}/">Dale play <span aria-hidden="true">▶</span><span class="sr"> al caso ${esc(c.project)}</span></a>
      </article>
    </li>`;
}

/* Las dos canciones: tempo medido, primer pulso, estructura y palabras que se prestan a una figurita. */
const CANCIONES = [
  {
    src: '/audio/el-estren.mp3', nombre: 'El estren', bpm: 94, pulso0: 0.013, dur: 164, tour: true,
    palabras: [
      { t: 10, img: 'pal-balon', txt: 'Cotejo' }, { t: 16, img: 'pal-ano-viejo', txt: 'Año viejo' },
      { t: 33, img: 'pal-arepa', txt: 'Arepa' }, { t: 34.5, img: 'pal-cafe', txt: 'Café' },
      { t: 38, img: 'pal-carriel', txt: 'Carriel' }, { t: 40, img: 'pal-sancocho', txt: 'Sancocho' },
      { t: 43, img: 'pal-vecina', txt: 'La vecina' }, { t: 71, img: 'pal-remedios', txt: 'Remedios' },
      { t: 76, img: 'pal-cancha', txt: 'Cancha' }, { t: 79, img: 'pal-cometa', txt: 'Cometas' },
    ],
    drops: [],
  },
  {
    src: '/audio/india-conocida.mp3', nombre: 'India conocida', bpm: 89.75, pulso0: 0.25, dur: 275, tour: false,
    palabras: [], drops: [109, 161, 202],
  },
];
const PALABRAS_IMG = [...new Set(CANCIONES.flatMap((c) => c.palabras.map((p) => p.img)))];

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Iván Santander · Medellín Hills</title>
<meta name="description" content="Iván Santander, Tech Lead y Technical Product Owner. Su trabajo como un mixtape vivo: la página late al compás de la canción. Lado A, plataforma clínica; lado B, proyectos propios.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#f4b13e">
<link rel="icon" href="/favicon.ico">
<link rel="preload" href="/fonts/archivo-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/medellin-hills/hills.css">
<script type="application/json" id="canciones">${JSON.stringify(CANCIONES)}</script>
</head>
<body>
<a class="saltar" href="#lado-a">Saltar al contenido</a>
<header class="barra">
  <a class="barra__atras" href="/">← Portafolio</a>
  <nav class="barra__nav" aria-label="Secciones">
    <a href="#lado-a">Lado A</a>
    <a href="#trabajo">Cómo trabajo</a>
    <a href="#lado-b">Lado B</a>
    <a href="#contacto">Contacto</a>
  </nav>
</header>

<main>
  <section class="portada" id="inicio" aria-labelledby="t-nombre">
    <div class="cielo" aria-hidden="true"></div>
    <div class="sol" aria-hidden="true"></div>
    <img class="loma" src="/medellin-hills/img/loma.webp" alt="" width="2000" height="1333" fetchpriority="high">
    <div class="ruta" aria-hidden="true">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none"><line x1="100" y1="1" x2="14" y2="30"/></svg>
      <img class="cabina" src="/medellin-hills/img/cabina.webp" alt="" width="320" height="400">
    </div>
    <img class="casete" src="/medellin-hills/img/casete.webp" alt="Un casete grande frente a la loma de casitas de colores de Medellín." width="1100" height="712" fetchpriority="high">
    <div class="portada__texto">
      <p class="etiqueta">Medellín, Colombia · remoto</p>
      <h1 id="t-nombre">Iván<br>Santander</h1>
      <p class="portada__rol">Tech Lead y Technical Product Owner</p>
    </div>
    <button class="play" type="button" id="play" aria-pressed="false">
      <span class="play__icono" aria-hidden="true">▶</span>
      <span class="play__txt">Dale play</span>
    </button>
    <p class="portada__frase">${esc(frase)}</p>
  </section>

  <div class="eq" aria-hidden="true" id="eq">${Array.from({ length: 48 }, (_, i) => `<i style="--i:${i};--h:${28 + ((i * 37) % 62)}"></i>`).join('')}</div>

  <section class="lado" id="lado-a" aria-labelledby="t-a">
    <header class="lado__cab">
      <p class="etiqueta">Lado A</p>
      <h2 id="t-a">Plataforma clínica</h2>
      <p class="lado__sub">${esc(LADO_A[0].domain)} · ${LADO_A.length} pistas</p>
    </header>
    <ol class="pistas">
    ${LADO_A.map((c, i) => pista(c, 'A', i)).join('\n    ')}
    </ol>
  </section>

  <section class="puente" id="trabajo" aria-labelledby="t-w">
    <header class="lado__cab">
      <p class="etiqueta">El puente</p>
      <h2 id="t-w">Cómo trabajo</h2>
    </header>
    <ol class="reglas">
      ${reglas.map((r, i) => `<li class="regla"><p class="regla__n" aria-hidden="true">${i + 1}</p><div><h3>${esc(r.t)}</h3><p>${esc(r.x)}</p></div></li>`).join('\n      ')}
    </ol>
  </section>

  <div class="voltea" aria-hidden="true"><span><i class="voltea__ico">⟲</i> dale la vuelta</span></div>

  <section class="lado lado--b" id="lado-b" aria-labelledby="t-b">
    <header class="lado__cab">
      <p class="etiqueta">Lado B</p>
      <h2 id="t-b">Proyectos propios</h2>
      <p class="lado__sub">Para probar ideas antes de llevarlas a un equipo · ${LADO_B.length} pistas</p>
      <div class="deco" aria-hidden="true">
        <img class="deco__a" src="/medellin-hills/img/b-microfono.webp" alt="" width="406" height="460" loading="lazy">
        <img class="deco__b" src="/medellin-hills/img/b-bandeja.webp" alt="" width="460" height="400" loading="lazy">
        <img class="deco__c" src="/medellin-hills/img/b-aerosol.webp" alt="" width="460" height="416" loading="lazy">
        <img class="deco__d" src="/medellin-hills/img/b-boombox.webp" alt="" width="460" height="332" loading="lazy">
      </div>
    </header>
    <ol class="pistas">
    ${LADO_B.map((c, i) => pista(c, 'B', i)).join('\n    ')}
    </ol>
  </section>

  <section class="cierre" id="contacto" aria-labelledby="t-c">
    <div class="vinilo" id="vinilo" role="slider" tabindex="0" aria-label="Rayar el disco: mueve la canción adelante y atrás" aria-valuemin="0" aria-valuemax="164" aria-valuenow="0">
      <div class="vinilo__giro"><img src="/medellin-hills/img/vinilo.webp" alt="" width="800" height="800" loading="lazy" draggable="false"></div>
    </div>
    <div class="cierre__texto">
      <p class="etiqueta">Pista final</p>
      <h2 id="t-c">¿Hablamos?</h2>
      <p class="cierre__lead">Para hablar de arquitectura, liderazgo técnico o de alguno de estos casos, escríbeme.</p>
      <dl class="datos">
        <div><dt>Años</dt><dd>${anios}</dd></div>
        <div><dt>Desde</dt><dd>2019</dd></div>
        <div><dt>Casos</dt><dd>${todos.length}</dd></div>
      </dl>
      <p class="enlaces">
        <a class="boton boton--oro" href="https://www.linkedin.com/in/ivan-santander/" rel="noopener">Escríbeme en LinkedIn <span aria-hidden="true">→</span></a>
        <a class="boton boton--sec" href="https://github.com/ivansantander-hub" rel="noopener">Ver GitHub</a>
        <a class="boton boton--sec" href="/trabajo/">Ver todos los casos</a>
      </p>
      <p class="lugar">Medellín, Colombia · Trabajo en remoto</p>
    </div>
  </section>
</main>

<div class="palabras" id="palabras" aria-hidden="true">${PALABRAS_IMG.map((p) => `<img src="/medellin-hills/img/${p}.webp" alt="" width="460" height="460" decoding="async" hidden data-pal="${p}">`).join('')}</div>

<div class="reproductor" id="repro" hidden>
  <button type="button" id="repro-play" aria-pressed="true" aria-label="Pausar la música"><span aria-hidden="true">❚❚</span></button>
  <p class="repro__txt" id="repro-nombre">El estren</p>
  <button type="button" class="repro__modo" id="repro-modo" aria-pressed="true" title="La página sigue la canción. Mueve el scroll para explorar tú."><span>Escuchar</span></button>
  <button type="button" id="repro-sig" aria-label="Cambiar de canción"><span aria-hidden="true">⏭</span></button>
  <button type="button" id="repro-mudo" aria-pressed="false" aria-label="Silenciar la música"><span aria-hidden="true">♪</span></button>
</div>
<p class="sr" id="aviso" role="status" aria-live="polite"></p>
<script src="/medellin-hills/hills.js" defer></script>
</body>
</html>
`;

writeFileSync(join(outDir, 'index.html'), html);
console.log(`medellin-hills: ${LADO_A.length}+${LADO_B.length} pistas, ${PALABRAS_IMG.length} palabras, ${(html.length / 1024).toFixed(0)} KB`);
