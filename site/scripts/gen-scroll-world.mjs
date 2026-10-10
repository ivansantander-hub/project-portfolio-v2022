#!/usr/bin/env node
/**
 * gen-scroll-world.mjs — genera site/public/scroll-world/index.html.
 *
 * Un mundo isométrico dibujado en SVG (sin vídeo ni IA): la cámara vuela por
 * scroll sobre cuatro islas nocturnas. Todo el texto sale de src/content/;
 * aquí solo hay geometría y marcado.
 *
 *   node scripts/gen-scroll-world.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'scroll-world');
mkdirSync(outDir, { recursive: true });

/* ───────────────────────── contenido ───────────────────────── */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const esClinico = (d) => /ensayos cl[ií]nicos/i.test(d.domain || '');

const work = readdirSync(join(root, 'src/content/work'))
  .filter((f) => f.endsWith('.es.md'))
  .map((f) => matter(readFileSync(join(root, 'src/content/work', f), 'utf8')).data)
  .sort((a, b) => a.order - b.order);
const clinicos = work.filter(esClinico);
const propios = work.filter((d) => !esClinico(d));

const aboutRaw = matter(readFileSync(join(root, 'src/content/pages/about.es.md'), 'utf8')).content;
const partes = aboutRaw.split(/^## (.+)$/m);
const intro = partes[0];
const secciones = {};
for (let i = 1; i < partes.length; i += 2) secciones[partes[i].trim()] = partes[i + 1];

const foco = (intro.match(/\*\*Foco actual:\*\*\s*(.+)/) || [])[1] || '';
const experiencia = ((intro.match(/\*\*Experiencia:\*\*\s*(.+)/) || [])[1] || '').replace('Salud digital, fintech y SaaS', 'Salud digital y fintech');

const trayectoria = [];
{
  const bloques = secciones['Trayectoria'].trim().split(/\n\s*\n/);
  for (let i = 0; i < bloques.length; i += 2) {
    const m = bloques[i].match(/^\*\*(.+?)\*\*\s*·\s*(.+)$/);
    if (m) trayectoria.push({ empresa: m[1], rol: m[2], texto: (bloques[i + 1] || '').trim() });
  }
}
const bullets = (nombre) =>
  [...secciones[nombre].matchAll(/^- \*\*(.+?)\*\*\s*(.+)$/gm)].map((m) => ({ t: m[1].replace(/\.$/, ''), x: m[2] }));
const reglas = bullets('Cómo trabajo');
const lidero = bullets('Cómo lidero');
const stack = [...secciones['Stack'].matchAll(/^\*\*(.+?)\*\*\s*·\s*(.+)$/gm)].map((m) => ({ g: m[1], items: m[2].split(' · ') }));

const CAMINO_LINKEDIN = 'https://www.linkedin.com/in/ivan-santander/';
const CAMINO_GITHUB = 'https://github.com/ivansantander-hub';
const anios = new Date().getFullYear() - 2019;


/* ───────────────────────── paradas ───────────────────────── */

const paradas = [
  { id: 'p-inicio', kind: 'inicio', cap: 'inicio', hold: 0.9 },
  { id: 'p-clinica', kind: 'isla', cap: 'clinica', hold: 0.7 },
  ...clinicos.map((c) => ({ id: `caso-${c.slug}`, kind: 'caso', cap: 'clinica', hold: 0.55 })),
  { id: 'p-propios', kind: 'isla', cap: 'propios', hold: 0.7 },
  ...propios.map((c) => ({ id: `caso-${c.slug}`, kind: 'caso', cap: 'propios', hold: 0.55 })),
  { id: 'p-taller', kind: 'isla', cap: 'taller', hold: 0.8 },
  { id: 'taller-trayectoria', kind: 'taller', cap: 'taller', hold: 1.0 },
  { id: 'taller-trabajo', kind: 'taller', cap: 'taller', hold: 0.9 },
  { id: 'taller-lidero', kind: 'taller', cap: 'taller', hold: 0.9 },
  { id: 'taller-stack', kind: 'taller', cap: 'taller', hold: 0.95 },
  { id: 'p-contacto', kind: 'llegada', cap: 'contacto', hold: 1.1 },
];

const num = (k, n) => `${String(k).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
const cap1 = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const primeraFrase = (intro.trim().split('\n')[0].split('. ')[0] || '').replace(/\.$/, '') + '.';

function articuloCaso(c, k, n, idCap) {
  const tags = (c.tags || []).join(' · ');
  return `<article class="parada caso" id="caso-${esc(c.slug)}" data-parada data-cap="${idCap}">
          <p class="caso__n">${num(k + 1, n)}</p>
          <p class="caso__dom">${esc(c.domain)}</p>
          <h3 class="caso__titulo">${esc(c.project)}</h3>
          <p class="caso__sub">${esc(c.title)}</p>
          <p class="caso__rol">${esc(c.role || '')}</p>
          ${tags ? `<p class="caso__tags">${esc(tags)}</p>` : ''}
          <a class="boton" href="/trabajo/${esc(c.slug)}/">Abrir caso <span aria-hidden="true">→</span></a>
        </article>`;
}

const importmap = {
  imports: {
    three: '/vendor/three/build/three.module.min.js',
    'three/addons/': '/vendor/three/examples/jsm/',
  },
};

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Iván Santander · El valle</title>
<meta name="description" content="Iván Santander, Tech Lead y Technical Product Owner. Un vuelo nocturno por el valle de Medellín a través de su trabajo en una plataforma de ensayos clínicos y de sus proyectos propios.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#04050a">
<link rel="icon" href="/favicon.ico">
<link rel="preload" href="/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/scroll-world/world.css">
<script type="application/json" id="geo">${JSON.stringify({ paradas })}</script>
<script type="importmap">${JSON.stringify(importmap)}</script>
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="barra">
  <a class="barra__atras" href="/">← Portafolio</a>
  <nav class="barra__nav" aria-label="Capítulos">
    <a href="#inicio" data-cap="inicio">Inicio</a>
    <a href="#clinica" data-cap="clinica">Plataforma clínica</a>
    <a href="#propios" data-cap="propios">Proyectos propios</a>
    <a href="#taller" data-cap="taller">El taller</a>
    <a href="#contacto" data-cap="contacto">Contacto</a>
  </nav>
</header>

<main id="contenido">
  <div id="pista">
    <div id="escena" aria-hidden="true">
      <img class="poster" src="/scroll-world/poster.webp" alt="" width="1440" height="560" decoding="async">
      <canvas id="lienzo"></canvas>
      <div class="viñeta"></div>
    </div>

    <section class="cap cap--inicio" id="inicio" aria-labelledby="t-inicio">
      <article class="parada panel--izq" id="p-inicio" data-parada data-cap="inicio">
        <p class="etiqueta">Medellín, Colombia · remoto</p>
        <h1 id="t-inicio">Iván Santander</h1>
        <p class="lead">${esc(primeraFrase)}</p>
        <p class="pista-ayuda"><span class="tecla">↓</span> desliza para volar · <span class="tecla">←</span> <span class="tecla">→</span> caso por caso</p>
      </article>
    </section>

    <section class="cap" id="clinica" aria-labelledby="t-clinica">
      <article class="parada" id="p-clinica" data-parada data-cap="clinica">
        <p class="etiqueta">El centro · ${clinicos.length} casos</p>
        <h2 id="t-clinica">Plataforma clínica</h2>
        <p class="lead">${esc(clinicos[0].domain)}.</p>
      </article>
      <ol class="casos">
        ${clinicos.map((c, k) => `<li>${articuloCaso(c, k, clinicos.length, 'clinica')}</li>`).join('\n        ')}
      </ol>
    </section>

    <section class="cap" id="propios" aria-labelledby="t-propios">
      <article class="parada" id="p-propios" data-parada data-cap="propios">
        <p class="etiqueta">La ladera · ${propios.length} casos</p>
        <h2 id="t-propios">Proyectos propios</h2>
        <p class="lead">${esc((secciones['Proyectos propios'].match(/sirven[^.]*\./) || ['Sirven para probar ideas antes de llevarlas a un equipo.'])[0].replace(/^./, (m) => m.toUpperCase()))}</p>
      </article>
      <ol class="casos">
        ${propios.map((c, k) => `<li>${articuloCaso(c, k, propios.length, 'propios')}</li>`).join('\n        ')}
      </ol>
    </section>

    <section class="cap" id="taller" aria-labelledby="t-taller">
      <article class="parada" id="p-taller" data-parada data-cap="taller">
        <p class="etiqueta">La cima</p>
        <h2 id="t-taller">El taller</h2>
        <p class="lead">${esc(cap1(foco))}</p>
        <p class="rol">${esc(experiencia)}</p>
      </article>

      <article class="parada panel--largo" id="taller-trayectoria" data-parada data-cap="taller">
        <h3>Historial de servicio</h3>
        <ol class="historial">
          ${trayectoria.map((t) => `<li><p class="historial__cab"><strong>${esc(t.empresa)}</strong> <span>${esc(t.rol)}</span></p><p class="historial__txt">${esc(t.texto)}</p></li>`).join('\n          ')}
        </ol>
      </article>

      <article class="parada" id="taller-trabajo" data-parada data-cap="taller">
        <h3>Cómo trabajo</h3>
        <ul class="reglas">
          ${reglas.map((r) => `<li><strong>${esc(r.t)}.</strong> ${esc(r.x)}</li>`).join('\n          ')}
        </ul>
      </article>

      <article class="parada" id="taller-lidero" data-parada data-cap="taller">
        <h3>Cómo lidero</h3>
        <ul class="reglas">
          ${lidero.map((r) => `<li><strong>${esc(r.t)}.</strong> ${esc(r.x)}</li>`).join('\n          ')}
        </ul>
      </article>

      <article class="parada" id="taller-stack" data-parada data-cap="taller">
        <h3>Herramientas</h3>
        <dl class="stack">
          ${stack.map((g) => `<div><dt>${esc(g.g)}</dt><dd>${g.items.map(esc).join(' · ')}</dd></div>`).join('\n          ')}
        </dl>
      </article>
    </section>

    <section class="cap" id="contacto" aria-labelledby="t-contacto">
      <article class="parada panel--cartel" id="p-contacto" data-parada data-cap="contacto">
        <p class="etiqueta">Llegada</p>
        <h2 id="t-contacto">¿Hablamos?</h2>
        <p class="lead">Para hablar de arquitectura, liderazgo técnico o de alguno de estos casos, escríbeme.</p>
        <dl class="datos">
          <div><dt>Años</dt><dd>${anios}</dd></div>
          <div><dt>Desde</dt><dd>2019</dd></div>
          <div><dt>Casos</dt><dd>${work.length}</dd></div>
        </dl>
        <p class="enlaces"><a class="boton" href="${CAMINO_LINKEDIN}" rel="noopener">Escríbeme en LinkedIn <span aria-hidden="true">→</span></a> <a class="boton boton--sec" href="${CAMINO_GITHUB}" rel="noopener">Ver GitHub</a> <a class="boton boton--sec" href="/">Portafolio</a></p>
        <p class="lugar">Medellín, Colombia · Trabajo en remoto</p>
      </article>
    </section>
  </div>
</main>

<div id="hud" hidden>
  <button type="button" id="ant" aria-label="Parada anterior">‹</button>
  <p id="hud-txt" aria-live="polite"></p>
  <button type="button" id="sig" aria-label="Parada siguiente">›</button>
</div>
<script src="/vendor/lenis.min.js" defer></script>
<script type="module" src="/scroll-world/world3d.js"></script>
</body>
</html>
`;

writeFileSync(join(outDir, 'index.html'), html);
console.log(`scroll-world: ${paradas.length} paradas, ${(html.length / 1024).toFixed(0)} KB, ${clinicos.length}+${propios.length} casos`);
