#!/usr/bin/env node
/**
 * gen-mixtape.mjs — genera site/public/mixtape/index.html.
 * Maqueta del portafolio como un mixtape: Lado A (plataforma clínica) y Lado B (proyectos propios),
 * cada caso es una pista con su figurita. Todo el texto sale de src/content/.
 *
 *   node scripts/gen-mixtape.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'mixtape');
mkdirSync(outDir, { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const workDir = join(root, 'src/content/work');
const caso = (slug) => matter(readFileSync(join(workDir, `${slug}.es.md`), 'utf8')).data;
const TOTAL = readdirSync(workDir).filter((f) => f.endsWith('.es.md')).length;

const LADO_A = ['architecture-simplification', 'ai-coding-assistant', 'workflow-engine'].map(caso);
const LADO_B = ['sgc', 'english', 'eco-loop'].map(caso);
const anios = new Date().getFullYear() - 2019;

const about = matter(readFileSync(join(root, 'src/content/pages/about.es.md'), 'utf8')).content;
const frase = (about.trim().split('\n')[0].split('. ')[0] || '').replace(/\.$/, '') + '.';

const COLORES = ['teal', 'mostaza', 'rosa', 'terracota', 'crema', 'teal'];
let n = 0;
function pista(c, lado, i) {
  const clase = COLORES[n++ % COLORES.length];
  const tags = (c.tags || []).join(' · ');
  return `<li class="pista pista--${clase}${i % 2 ? ' pista--inv' : ''}" id="pista-${esc(c.slug)}">
      <p class="pista__num" aria-hidden="true">${lado}${i + 1}</p>
      <img class="figurita" src="/mixtape/img/${esc(c.slug)}.webp" alt="" width="640" height="560" loading="lazy" decoding="async">
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

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Iván Santander · Mixtape</title>
<meta name="description" content="Iván Santander, Tech Lead y Technical Product Owner. Su trabajo como un mixtape: lado A, plataforma clínica; lado B, proyectos propios.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#f4b13e">
<link rel="icon" href="/favicon.ico">
<link rel="preload" href="/fonts/archivo-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="/mixtape/img/hero.webp">
<link rel="stylesheet" href="/mixtape/mixtape.css">
</head>
<body>
<a class="saltar" href="#lado-a">Saltar al contenido</a>
<header class="barra">
  <a class="barra__atras" href="/">← Portafolio</a>
  <nav class="barra__nav" aria-label="Secciones">
    <a href="#lado-a">Lado A</a>
    <a href="#lado-b">Lado B</a>
    <a href="#contacto">Contacto</a>
  </nav>
</header>

<main>
  <section class="portada" aria-labelledby="t-nombre">
    <img class="portada__fondo" src="/mixtape/img/hero.webp" alt="Un casete grande frente a una loma de casitas de colores en Medellín, con el sol detrás y una cabina del Metrocable cruzando el cielo." width="1800" height="1200" fetchpriority="high">
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
      <p class="lado__sub">${esc(LADO_A[0].domain)} · ${LADO_A.length} de 10 pistas en esta maqueta</p>
    </header>
    <ol class="pistas">
    ${LADO_A.map((c, i) => pista(c, 'A', i)).join('\n    ')}
    </ol>
  </section>

  <div class="voltea" aria-hidden="true"><span><i class="voltea__ico">⟲</i> dale la vuelta</span></div>

  <section class="lado lado--b" id="lado-b" aria-labelledby="t-b">
    <header class="lado__cab">
      <p class="etiqueta">Lado B</p>
      <h2 id="t-b">Proyectos propios</h2>
      <p class="lado__sub">Para probar ideas antes de llevarlas a un equipo · ${LADO_B.length} de 8 pistas en esta maqueta</p>
    </header>
    <ol class="pistas">
    ${LADO_B.map((c, i) => pista(c, 'B', i)).join('\n    ')}
    </ol>
  </section>

  <section class="cierre" id="contacto" aria-labelledby="t-c">
    <div class="vinilo" aria-hidden="true"><img src="/mixtape/img/vinilo.webp" alt="" width="800" height="800" loading="lazy"></div>
    <div class="cierre__texto">
      <p class="etiqueta">Pista final</p>
      <h2 id="t-c">¿Hablamos?</h2>
      <p class="cierre__lead">Para hablar de arquitectura, liderazgo técnico o de alguno de estos casos, escríbeme.</p>
      <dl class="datos">
        <div><dt>Años</dt><dd>${anios}</dd></div>
        <div><dt>Desde</dt><dd>2019</dd></div>
        <div><dt>Casos</dt><dd>${TOTAL}</dd></div>
      </dl>
      <p class="enlaces">
        <a class="boton boton--oro" href="https://www.linkedin.com/in/ivan-santander/" rel="noopener">Escríbeme en LinkedIn <span aria-hidden="true">→</span></a>
        <a class="boton boton--sec" href="https://github.com/ivansantander-hub" rel="noopener">Ver GitHub</a>
        <a class="boton boton--sec" href="/trabajo/">Ver los ${TOTAL} casos</a>
      </p>
      <p class="lugar">Medellín, Colombia · Trabajo en remoto</p>
    </div>
  </section>
</main>
<div class="reproductor" id="repro" hidden>
  <button type="button" id="repro-play" aria-pressed="true" aria-label="Pausar la música"><span aria-hidden="true">❚❚</span></button>
  <p class="repro__txt" id="repro-nombre">El estren</p>
  <button type="button" id="repro-sig" aria-label="Cambiar de canción"><span aria-hidden="true">⏭</span></button>
  <button type="button" id="repro-mudo" aria-pressed="false" aria-label="Silenciar la música"><span aria-hidden="true">♪</span></button>
</div>
<script src="/mixtape/mixtape.js" defer></script>
</body>
</html>
`;

writeFileSync(join(outDir, 'index.html'), html);
console.log(`mixtape: ${LADO_A.length}+${LADO_B.length} pistas de ${TOTAL} casos, ${(html.length / 1024).toFixed(0)} KB`);
