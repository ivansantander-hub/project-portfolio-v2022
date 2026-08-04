/**
 * build-content.mjs — colecciones de contenido e i18n para mini-astro.
 *
 * Lee src/content/**\/*.{es,en}.md y genera las páginas .html que mini-astro
 * compone después. Se ejecuta antes de `mini-astro build`.
 *
 * Por qué un paso previo y no un fork de mini-astro: es reversible, no obliga a
 * mantener un ciclo de publicación de la herramienta, y si se estabiliza se
 * sube a mini-astro más adelante.
 *
 * Rutas generadas:
 *   /                      ES  home
 *   /trabajo/              ES  índice de casos
 *   /trabajo/<slug>/       ES  caso
 *   /sobre-mi/             ES  about
 *   /en/                   EN  home
 *   /en/work/              EN  índice
 *   /en/work/<slug>/       EN  caso
 *   /en/about/             EN  about
 *
 * Nota sobre mini-astro: `pages/x/index.html` saldría como `/x/index/`, así que
 * la home en inglés se emite como `pages/en.html` → `/en/`. Las subrutas
 * (`pages/en/work/sgc.html` → `/en/work/sgc/`) sí funcionan de forma normal.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';
import { PALETTE, PALETTE_PICKER, PALETTES, LINK_V1 } from '../site.config.mjs';

if (!PALETTES.includes(PALETTE)) {
  throw new Error(
    `PALETTE="${PALETTE}" no es válida. Opciones: ${PALETTES.join(', ')}. ` +
    `Se define en site.config.mjs o por variable de entorno.`,
  );
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const contentDir = join(srcDir, 'content');
const pagesDir = join(srcDir, 'pages');

/**
 * `.build/` es lo que mini-astro compila: componentes y plantillas copiados de
 * `src/`, más las páginas generadas desde `src/content/`. Se borra y se rehace
 * en cada compilación y está en .gitignore.
 *
 * El motivo es separar lo escrito a mano de lo generado. Antes las 16 páginas
 * de idioma se escribían dentro de `src/pages/` y acababan versionadas en git
 * — artefactos de build en control de versiones. Con esta separación `src/`
 * solo contiene fuentes y no hace falta ningún manifiesto para saber qué
 * borrar: `.build/` se tira entero.
 */
const buildDir = join(root, '.build');
const buildPagesDir = join(buildDir, 'pages');

const SITE = 'https://ivansantander.com';

/** ES vive en la raíz; EN bajo /en/. x-default apunta a EN: un visitante cuyo
 *  idioma no coincide con ninguno es, casi siempre, internacional. */
const LANGS = {
  es: { prefix: '', work: 'trabajo', about: 'sobre-mi', locale: 'es_CO', htmlLang: 'es' },
  en: { prefix: '/en', work: 'work', about: 'about', locale: 'en_US', htmlLang: 'en' },
};

const UI = {
  es: {
    workTitle: 'Casos', workDesc: 'Casos de arquitectura, liderazgo técnico y producto.',
    backToWork: 'Volver a casos', role: 'Rol', period: 'Periodo', context: 'Contexto',
    stack: 'Stack', confidential: 'Detalles bajo acuerdo de confidencialidad',
  },
  en: {
    workTitle: 'Work', workDesc: 'Case studies in architecture, technical leadership and product.',
    backToWork: 'Back to work', role: 'Role', period: 'Period', context: 'Context',
    stack: 'Stack', confidential: 'Details under non-disclosure agreement',
  },
};

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

marked.setOptions({ mangle: false, headerIds: false });

/* ── Lectura del contenido ────────────────────────────────────────────────── */

function readCollection(sub) {
  const dir = join(contentDir, sub);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const m = file.match(/^(.+)\.(es|en)\.md$/);
      if (!m) throw new Error(`Nombre sin idioma: ${sub}/${file} (esperado <slug>.<es|en>.md)`);
      /* Normalizar CRLF: en Windows cualquier editor (o script) puede guardar
         con \r\n, y un \r al final de línea rompía el regex de campos —
         `**title:** ...\r` dejaba de coincidir y el titular salía vacío.
         El contenido no puede depender del final de línea del archivo. */
      const raw = readFileSync(join(dir, file), 'utf8').replace(/\r\n?/g, '\n');
      const { data, content } = matter(raw);
      return { slug: m[1], lang: m[2], data, content };
    });
}

/**
 * Las páginas de copy (home, about) usan secciones `## nombre` con campos
 * `**clave:** valor`. El valor puede continuar en las líneas siguientes hasta
 * el próximo `**clave:**` o el final de la sección — así se pueden escribir
 * párrafos sin meterlos todos en un renglón.
 *
 * Devuelve { seccion: { clave: valor, ..., _rest } } donde _rest es el texto
 * de la sección que no pertenece a ningún campo.
 */
function parseSections(md) {
  const out = {};
  const blocks = md.split(/^##\s+/m).slice(1);

  for (const block of blocks) {
    const nl = block.indexOf('\n');
    const name = block.slice(0, nl).trim();
    const lines = block.slice(nl + 1).split('\n');

    const fields = {};
    const rest = [];
    let key = null, buf = [];

    const flush = () => {
      if (key) fields[key] = buf.join('\n').trim();
      key = null; buf = [];
    };

    for (const line of lines) {
      /* `---` separa secciones en el archivo. Sin esto se colaba dentro del
         último campo de cada sección — la última cifra salía como
         "3 industrias\n\n---". */
      if (line.trim() === '---') { flush(); continue; }

      const m = line.match(/^\*\*(.+?):\*\*\s*(.*)$/);
      if (m) {
        flush();
        key = m[1].trim();
        buf = m[2] ? [m[2]] : [];
      } else if (key !== null) {
        /* Un campo sigue abierto hasta el próximo `**clave:**` o el fin de la
           sección. Las líneas en blanco se conservan para poder escribir
           varios párrafos dentro de un mismo campo. */
        buf.push(line);
      } else if (line.trim() !== '') {
        rest.push(line);
      }
    }
    flush();

    fields._rest = rest.join('\n').trim();
    out[name] = fields;
  }
  return out;
}

/* ── Emisión de páginas ───────────────────────────────────────────────────── */

function pageFile(lang, ...segments) {
  const L = LANGS[lang];
  // La home de cada idioma: ES → index.html, EN → en.html (evita /en/index/)
  if (segments.length === 0) return lang === 'es' ? 'index.html' : 'en.html';
  return join(...(L.prefix ? ['en', ...segments] : segments)) + '.html';
}

function urlFor(lang, ...segments) {
  const L = LANGS[lang];
  return `${L.prefix}/${segments.join('/')}${segments.length ? '/' : ''}` || '/';
}

/**
 * Todas las páginas cargan los mismos scripts desde la plantilla, así que no
 * hay nada específico de la home. Se conserva el parámetro por si vuelve a
 * hacer falta cargar algo solo en una ruta.
 */
const HOME_SCRIPTS = '';

/* ── Datos estructurados ──────────────────────────────────────────────────
   Van EMBEBIDOS en cada página. Un .jsonld suelto en public/ no lo lee nadie:
   Google solo interpreta JSON-LD dentro de un <script type="application/ld+json">
   del documento. Ese fue el error de la versión anterior. */

const PERSONA = {
  '@type': 'Person',
  '@id': `${SITE}/#persona`,
  name: 'Iván Santander',
  jobTitle: 'Technical Product Owner',
  url: SITE,
  address: { '@type': 'PostalAddress', addressLocality: 'Medellín', addressCountry: 'CO' },
  sameAs: [
    'https://www.linkedin.com/in/ivan-santander/',
    'https://github.com/ivansantander-hub',
  ],
  knowsAbout: [
    'Arquitectura de software', 'Liderazgo técnico', 'TypeScript', 'Python',
    'Sistemas distribuidos', 'Gestión de producto',
  ],
};

/** Migas para que el buscador entienda la jerarquía del sitio. */
function migas(lang, items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.url}`,
    })),
  };
}

function jsonLd(grafo) {
  return `<script type="application/ld+json">${
    JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo })
      .replace(/</g, '\\u003c')
  }</script>`;
}

function emit(relFile, { lang, title, description, canonical, altUrl, body, scripts = '', schema = [] }) {
  const L = LANGS[lang];
  const other = lang === 'es' ? 'en' : 'es';

  /* Los descriptivos se recortan aquí y no a mano en el contenido: un título
     de más de ~60 caracteres o una descripción de más de ~160 se cortan en los
     resultados de búsqueda, y el corte lo decide el buscador, no nosotros. */
  const recorta = (s, max) => {
    const t = String(s).replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t;
    const corte = t.slice(0, max - 1);
    return corte.slice(0, corte.lastIndexOf(' ')).replace(/[,;:.]$/, '') + '…';
  };

  const frontmatter = [
    '---',
    'layout: Doc',
    `schema: ${schema.length ? jsonLd(schema) : ''}`,
    `palette: ${PALETTE}`,
    `palettePicker: ${PALETTE_PICKER ? '<script src="/js/palette-picker.js" defer></script>' : ''}`,
    `pageScripts: ${scripts.replace(/\n/g, ' ')}`,
    `lang: ${L.htmlLang}`,
    `title: ${recorta(title, 60)}`,
    `description: ${recorta(description, 158)}`,
    `canonical: ${SITE}${canonical}`,
    `altUrl: ${SITE}${altUrl}`,
    `altLang: ${LANGS[other].htmlLang}`,
    `ogLocale: ${L.locale}`,
    `langToggleHref: ${altUrl}`,
    `langToggleLabel: ${other.toUpperCase()}`,
    `linkV1: ${LINK_V1 ? `<a class="site-footer__v1" href="/v1/" title="${lang === 'es' ? 'Portafolio de 2022, con 3D' : '2022 portfolio, with 3D'}">v1</a>` : ''}`,
    '---',
    '',
  ].join('\n');

  const outPath = join(buildPagesDir, relFile);
  /* Una página generada nunca puede pisar una escrita a mano. Como `.build/`
     se arma copiando primero `src/pages/`, si el nombre ya existe aquí es
     porque colisiona con una página manual. */
  if (existsSync(outPath)) {
    throw new Error(
      `La página generada "${relFile}" colisiona con una escrita a mano en src/pages/.\n` +
      `  Renombra una de las dos.`,
    );
  }
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, frontmatter + body, 'utf8');
  return relFile;
}

/* ── Plantillas de cuerpo ─────────────────────────────────────────────────── */

function renderWorkCard(item, lang, nivel = 3) {
  const L = LANGS[lang];
  const d = item.data;
  const confidential = !!d.confidential;
  const stateLabel = confidential
    ? (lang === 'es' ? 'bajo NDA' : 'under NDA')
    : (lang === 'es' ? 'abierto' : 'open');

  const metrics = Array.isArray(d.metrics) ? d.metrics : [];
  const stack = Array.isArray(d.stack) ? d.stack.slice(0, 5) : [];

  /* Con cifras, mandan las cifras. Sin ellas (NDA), manda el rol: un hueco
     vacío se lee como página sin terminar. */
  const extra = metrics.length
    ? metrics.slice(0, 3).map(m =>
        `            <div><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join('\n')
    : `            <div><b>&mdash;</b><span>${esc(d.role)}</span></div>`;

  return `
      <li class="work-card">
        <a class="work-card__link" href="${urlFor(lang, L.work, item.slug)}">
          <p class="work-card__meta-top">
            <span class="work-card__project">${esc(d.project || d.domain)}</span>
            <span class="work-card__state">${stateLabel}</span>
            <span>${esc(d.period)}</span>
          </p>
          <div class="work-card__body">
            <h${nivel} class="work-card__title">${esc(d.title)}</h${nivel}>
            <p class="work-card__headline">${esc(d.headline)}</p>
            <ul class="work-card__stack" aria-label="Stack">
${stack.map(x => `              <li>${esc(x)}</li>`).join('\n')}
            </ul>
          </div>
          <div class="work-card__extra">
            <div class="work-card__figures">
${extra}
            </div>
            <p class="work-card__arrow" aria-hidden="true">Ver caso &rarr;</p>
          </div>
        </a>
      </li>`;
}

function renderCase(item, lang, all) {
  const L = LANGS[lang], t = UI[lang], d = item.data;
  const metrics = Array.isArray(d.metrics) ? d.metrics : [];

  const metricsHtml = metrics.length ? `
      <dl class="case__metrics">
${metrics.map(m => `        <div class="metric"><dd class="metric__value">${esc(m.value)}</dd><dt class="metric__label">${esc(m.label)}</dt></div>`).join('\n')}
      </dl>` : '';

  const stackHtml = Array.isArray(d.stack) ? `
      <ul class="case__stack">
${d.stack.map(s => `        <li>${esc(s)}</li>`).join('\n')}
      </ul>` : '';

  const nda = d.confidential ? `
      <p class="case__nda">${t.confidential}</p>` : '';

  /* Enlaces de prueba: repo, demo desplegada, lo que se pueda verificar.
     Un caso que afirma cifras y no da forma de comprobarlas se lee como humo. */
  const links = Array.isArray(d.links) && d.links.length ? `
      <ul class="case__links">
${d.links.map(l => `        <li><a href="${esc(l.href)}" rel="noopener noreferrer" target="_blank">${esc(l.label)} <span aria-hidden="true">&#8599;</span></a></li>`).join('\n')}
      </ul>` : '';

  /* Resumen escaneable. Nadie lee 900 palabras de un desconocido: esto es lo
     que se lleva quien solo pasa los ojos. */
  const summary = Array.isArray(d.summary) && d.summary.length ? `
  <dl class="case__summary">
${d.summary.map(s => `    <div><dt>${esc(s.k)}</dt><dd>${esc(s.v)}</dd></div>`).join('\n')}
  </dl>` : '';

  return `
<article class="case" data-zone="clear">
  <header class="case__head">
    <p class="eyebrow">${esc(d.project || d.domain)}</p>
    <h1 class="case__title" data-reveal>${esc(d.title)}</h1>
    <p class="case__headline">${esc(d.headline)}</p>

    <dl class="case__facts">
      <div><dt>${t.context}</dt><dd>${esc(d.domain)}</dd></div>
      <div><dt>${t.role}</dt><dd>${esc(d.role)}</dd></div>
      <div><dt>${t.period}</dt><dd>${esc(d.period)}</dd></div>
    </dl>
${stackHtml}${links}${metricsHtml}${nda}
  </header>
${summary}
  <div class="case__body prose">
${marked.parse(item.content)}
  </div>

  <footer class="case__foot">
    <a class="link-back" href="${urlFor(lang, L.work)}">${t.backToWork}</a>
  </footer>
</article>
`;
}

function renderWorkIndex(items, lang) {
  const t = UI[lang];
  /* Aquí el h1 es "Casos", así que las tarjetas son h2. En la home van bajo
     un h2, así que allí son h3. Saltar de h1 a h3 rompe la jerarquía. */
  return `
<section class="work-index" data-zone="clear">
  <h1 class="work-index__title">${t.workTitle}</h1>
  <p class="work-index__lead">${t.workDesc}</p>
  <ul class="work-index__list" data-stagger>
${items.map(i => renderWorkCard(i, lang, 2)).join('\n')}
  </ul>
</section>
`;
}

function renderHome(sections, work, lang) {
  const L = LANGS[lang];
  const hero = sections.hero || {};
  const thesis = sections.thesis || {};
  const workIntro = sections.work_intro || {};
  const secondary = sections.secondary || {};
  const contact = sections.contact || {};

  const md = s => (s ? marked.parse(s) : '');

  /* Las cifras viven en el contenido, no aquí: cambiarlas no debería exigir
     tocar el generador. Formato: "7+ / años · 20+ / proyectos · 3 / industrias" */
  const stats = String(hero.stats || '').split('·')
    .map(p => p.split('/').map(x => x.trim()))
    .filter(p => p.length === 2 && p[0]);

  return `
<section class="hero" id="hero">
  <!-- Decorativa: no aporta información, así que queda fuera del árbol de
       accesibilidad. Si WebGL falla, orb.js la retira sola. -->
  <canvas class="hero__orb" id="hero-orb" aria-hidden="true"></canvas>

  <!-- Toda la copia va en un solo hijo del grid. Suelta, la esfera abarcaba
       todas las filas y estiraba el primer elemento a su altura. -->
  <div class="hero__copy">
    <!-- Nombre, frase y disciplinas van en el MISMO h1: el nombre gana las
         búsquedas de marca y las otras dos líneas aportan el resto del texto
         indexable sin añadir otro titular a la página. -->
    <h1 class="hero__title">
      <span class="hero__name" data-split>${esc(hero.name)}</span>
      <span class="hero__statement" data-hero-in>${esc(hero.statement)}</span>
      <span class="hero__role" data-hero-in>${esc(hero.role)}</span>
    </h1>
    <div class="hero__lead" data-hero-in>
${String(hero.lead || '').split(/\n\s*\n/).filter(p => p.trim())
  .map(p => `      <p>${esc(p.replace(/\s+/g, ' ').trim())}</p>`).join('\n')}
    </div>
    <p class="hero__actions" data-hero-in>
      <a class="btn btn--primary" href="${urlFor(lang, L.work)}">${esc(hero.cta_primary)}</a>
      <a class="btn" href="#contact">${esc(hero.cta_secondary)}</a>
    </p>
    <dl class="hero__readout" data-hero-in>
${stats.map(([v, l]) => `      <div><dd>${esc(v)}</dd><dt>${esc(l)}</dt></div>`).join('\n')}
    </dl>
  </div>
</section>

<section class="thesis">
  <h2 class="thesis__title" data-reveal>${esc(thesis.title)}</h2>
  <div class="thesis__body" data-reveal>${md(thesis.body)}</div>
  ${thesis.note ? `<p class="thesis__note">${esc(thesis.note)}</p>` : ''}
</section>

<section class="work-preview">
  <div class="section-head" data-reveal>
    <h2 class="section-title">${esc(workIntro.title)}</h2>
    <div class="prose">${md(workIntro.body)}</div>
  </div>
  <ul class="work-index__list" data-stagger>
${work.map(i => renderWorkCard(i, lang)).join('\n')}
  </ul>
</section>

<section class="secondary">
  <div class="section-head" data-reveal>
    <h2 class="section-title">${esc(secondary.title)}</h2>
    <div class="prose">${md(secondary.body)}</div>
  </div>
</section>

<section class="contact" id="contact">
  <h2 class="section-title" data-reveal>${esc(contact.title)}</h2>
  <div class="prose">${md(contact.body)}</div>
  <p class="contact__location">${esc(contact.location)}</p>
</section>
`;
}

function renderAbout(md, titulo) {
  /* El h1 lo pone el generador: el markdown empieza en prosa y la página se
     quedaba sin encabezado principal. */
  return `
<article class="about prose">
  <h1 class="about__title" data-reveal>${esc(titulo)}</h1>
${marked.parse(md)}
</article>
`;
}

/* ── Ejecución ────────────────────────────────────────────────────────────── */

/**
 * Se rehace `.build/` desde cero: se tira entero y se copia lo escrito a mano.
 * Al no quedar nada generado dentro de `src/`, ya no hace falta llevar un
 * manifiesto de qué borrar — el estado anterior simplemente no existe.
 */
rmSync(buildDir, { recursive: true, force: true });
mkdirSync(buildPagesDir, { recursive: true });

for (const sub of ['templates', 'atoms', 'molecules', 'organisms', 'data']) {
  const from = join(srcDir, sub);
  if (existsSync(from)) cpSync(from, join(buildDir, sub), { recursive: true });
}

// Páginas escritas a mano (v1.html y las que se añadan). `src/content/` no
// cuenta: de ahí salen las generadas.
if (existsSync(pagesDir)) {
  cpSync(pagesDir, buildPagesDir, { recursive: true });
}

const work = readCollection('work');
const pages = readCollection('pages');
const written = [];

for (const lang of Object.keys(LANGS)) {
  const L = LANGS[lang], other = lang === 'es' ? 'en' : 'es';
  const O = LANGS[other];

  const items = work
    .filter(i => i.lang === lang)
    .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));

  // Home
  const homeDoc = pages.find(p => p.slug === 'home' && p.lang === lang);
  if (homeDoc) {
    written.push(emit(pageFile(lang), {
      lang,
      title: homeDoc.data.title,
      description: homeDoc.data.description,
      canonical: lang === 'es' ? '/' : '/en/',
      altUrl: other === 'es' ? '/' : '/en/',
      body: renderHome(parseSections(homeDoc.content), items, lang),
      scripts: HOME_SCRIPTS,
      schema: [
        PERSONA,
        {
          '@type': 'WebSite',
          '@id': `${SITE}/#sitio`,
          url: SITE,
          name: 'Iván Santander',
          inLanguage: L.htmlLang,
          publisher: { '@id': `${SITE}/#persona` },
        },
        {
          '@type': 'ProfilePage',
          url: `${SITE}${lang === 'es' ? '/' : '/en/'}`,
          name: homeDoc.data.title,
          description: homeDoc.data.description,
          inLanguage: L.htmlLang,
          mainEntity: { '@id': `${SITE}/#persona` },
        },
      ],
    }));
  }

  // Índice de casos
  written.push(emit(pageFile(lang, L.work), {
    lang,
    title: `${UI[lang].workTitle} — Iván Santander`,
    description: UI[lang].workDesc,
    canonical: urlFor(lang, L.work),
    altUrl: urlFor(other, O.work),
    body: renderWorkIndex(items, lang),
    schema: [
      PERSONA,
      {
        '@type': 'CollectionPage',
        url: `${SITE}${urlFor(lang, L.work)}`,
        name: UI[lang].workTitle,
        description: UI[lang].workDesc,
        inLanguage: L.htmlLang,
        about: { '@id': `${SITE}/#persona` },
        hasPart: items.map(i => ({
          '@type': 'CreativeWork',
          name: i.data.title,
          url: `${SITE}${urlFor(lang, L.work, i.slug)}`,
        })),
      },
      migas(lang, [
        { name: lang === 'es' ? 'Inicio' : 'Home', url: lang === 'es' ? '/' : '/en/' },
        { name: UI[lang].workTitle, url: urlFor(lang, L.work) },
      ]),
    ],
  }));

  // Casos
  for (const item of items) {
    written.push(emit(pageFile(lang, L.work, item.slug), {
      lang,
      title: `${item.data.title} — Iván Santander`,
      description: item.data.headline,
      canonical: urlFor(lang, L.work, item.slug),
      altUrl: urlFor(other, O.work, item.slug),
      body: renderCase(item, lang, items),
      schema: [
        PERSONA,
        {
          '@type': 'Article',
          headline: item.data.title,
          description: item.data.headline,
          url: `${SITE}${urlFor(lang, L.work, item.slug)}`,
          inLanguage: L.htmlLang,
          author: { '@id': `${SITE}/#persona` },
          about: item.data.domain,
          keywords: (item.data.stack || []).join(', '),
        },
        migas(lang, [
          { name: lang === 'es' ? 'Inicio' : 'Home', url: lang === 'es' ? '/' : '/en/' },
          { name: UI[lang].workTitle, url: urlFor(lang, L.work) },
          { name: item.data.project || item.data.title, url: urlFor(lang, L.work, item.slug) },
        ]),
      ],
    }));
  }

  // About
  const aboutDoc = pages.find(p => p.slug === 'about' && p.lang === lang);
  if (aboutDoc) {
    written.push(emit(pageFile(lang, L.about), {
      lang,
      title: `${aboutDoc.data.title} — Iván Santander`,
      description: aboutDoc.data.description,
      canonical: urlFor(lang, L.about),
      altUrl: urlFor(other, O.about),
      body: renderAbout(aboutDoc.content, aboutDoc.data.title),
      schema: [
        PERSONA,
        {
          '@type': 'AboutPage',
          url: `${SITE}${urlFor(lang, L.about)}`,
          name: aboutDoc.data.title,
          description: aboutDoc.data.description,
          inLanguage: L.htmlLang,
          mainEntity: { '@id': `${SITE}/#persona` },
        },
        migas(lang, [
          { name: lang === 'es' ? 'Inicio' : 'Home', url: lang === 'es' ? '/' : '/en/' },
          { name: aboutDoc.data.title, url: urlFor(lang, L.about) },
        ]),
      ],
    }));
  }
}

/* ── SEO: sitemap, robots y datos estructurados ───────────────────────────── */

const publicDir = join(root, 'public');
const urls = [];
for (const lang of Object.keys(LANGS)) {
  const L = LANGS[lang], other = lang === 'es' ? 'en' : 'es', O = LANGS[other];
  const items = work.filter(i => i.lang === lang);
  urls.push({ loc: lang === 'es' ? '/' : '/en/', alt: other === 'es' ? '/' : '/en/', lang, other });
  urls.push({ loc: urlFor(lang, L.work), alt: urlFor(other, O.work), lang, other });
  urls.push({ loc: urlFor(lang, L.about), alt: urlFor(other, O.about), lang, other });
  for (const i of items) {
    urls.push({ loc: urlFor(lang, L.work, i.slug), alt: urlFor(other, O.work, i.slug), lang, other });
  }
}

const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...urls.map(u => [
    '  <url>',
    `    <loc>${SITE}${u.loc}</loc>`,
    `    <xhtml:link rel="alternate" hreflang="${u.lang}" href="${SITE}${u.loc}"/>`,
    `    <xhtml:link rel="alternate" hreflang="${u.other}" href="${SITE}${u.alt}"/>`,
    // Un visitante cuyo idioma no coincide con ninguno es, casi siempre, internacional.
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${u.lang === 'en' ? u.loc : u.alt}"/>`,
    '  </url>',
  ].join('\n')),
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
writeFileSync(
  join(publicDir, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
  'utf8',
);

/* Antes aquí se escribía public/person.jsonld. Se eliminó: un .jsonld suelto
   no lo lee ningún buscador — los datos estructurados tienen que ir dentro de
   un <script type="application/ld+json"> del propio documento, que es lo que
   hace ahora `jsonLd()` en cada página. */

console.log(`[paleta]  ${PALETTE}${PALETTE_PICKER ? '  (selector en vivo ACTIVO)' : ''}`);
console.log(`[content] ${written.length} página(s) generada(s) desde src/content/`);
for (const w of written) console.log(`           ${w.replace(/\\/g, '/')}`);
console.log(`[seo]     sitemap.xml (${urls.length} URLs), robots.txt`);
