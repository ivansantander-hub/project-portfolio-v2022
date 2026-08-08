/**
 * gen-og.mjs — imagen para compartir en redes (1200×630).
 *
 * Sin og:image, LinkedIn y X muestran una tarjeta gris. Para un portafolio que
 * se comparte sobre todo en LinkedIn, esa tarjeta es la primera impresión.
 *
 * Se dibuja en SVG y se rasteriza con sharp, con los mismos colores del sitio.
 * La versión anterior levantaba Chromium con Playwright para capturar una
 * página: innecesario para texto sobre un fondo, y obligaba a tener los
 * navegadores de Playwright instalados. Además escribía en dist/, que se
 * regenera; ahora va a public/ y lo sincroniza el build como cualquier asset.
 *
 *   pnpm og
 */

import sharp from 'sharp';
import { mkdirSync, promises as fsp } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PALETTE } from '../site.config.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'img');

/** Mismos valores que quarks/tokens.css. */
const PALETAS = {
  ultramarine: { bg: '#060810', accent: '#5470ff', muted: '#8e99bd' },
  chartreuse:  { bg: '#0a0a08', accent: '#cff32b', muted: '#a8b57a' },
  vermilion:   { bg: '#080807', accent: '#e5322d', muted: '#c08c8a' },
  copper:      { bg: '#0b0908', accent: '#d2622a', muted: '#c0a087' },
};
const C = PALETAS[PALETTE] || PALETAS.ultramarine;

const W = 1200, H = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="halo" cx="78%" cy="34%" r="58%">
      <stop offset="0%" stop-color="${C.accent}" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="esfera" cx="38%" cy="34%" r="68%">
      <stop offset="0%" stop-color="${C.accent}" stop-opacity="0.95"/>
      <stop offset="60%" stop-color="${C.accent}" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="${C.accent}" stop-opacity="0.10"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>

  <!-- Eco de la esfera del hero -->
  <circle cx="960" cy="300" r="185" fill="url(#esfera)"/>
  <circle cx="960" cy="300" r="185" fill="none" stroke="${C.accent}" stroke-opacity="0.5" stroke-width="1.5"/>

  <text x="80" y="286" font-family="Geist, Helvetica, Arial, sans-serif"
        font-size="94" font-weight="700" fill="#f4f4f5" letter-spacing="-4">Iván Santander</text>

  <text x="80" y="352" font-family="Geist, Helvetica, Arial, sans-serif"
        font-size="38" font-weight="500" fill="#f4f4f5" fill-opacity="0.92">Simplifico lo que se volvió complejo.</text>

  <text x="80" y="406" font-family="ui-monospace, Menlo, Consolas, monospace"
        font-size="20" fill="${C.muted}" letter-spacing="3">PRODUCTO · INGENIERÍA · IA</text>

  <line x1="80" y1="486" x2="1120" y2="486" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1"/>

  <text x="80" y="536" font-family="ui-monospace, Menlo, Consolas, monospace"
        font-size="19" fill="${C.muted}" letter-spacing="1.5">7+ años · 20+ proyectos · 3 industrias</text>

  <text x="80" y="576" font-family="ui-monospace, Menlo, Consolas, monospace"
        font-size="17" fill="#5f5f68" letter-spacing="1.5">ivansantander.com</text>
</svg>`;

mkdirSync(out, { recursive: true });
const png = join(out, 'og.png');

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(png);

const { size } = await fsp.stat(png);
console.log(`[og] public/img/og.png  ${W}×${H}  ${Math.round(size / 1024)} KB  paleta ${PALETTE}`);
