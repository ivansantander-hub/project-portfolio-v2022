/**
 * sync-static.mjs
 * Copies static assets from:
 *   - public/{css,js,img,models-3d,fonts} → dist/
 *   - node_modules vendor libs            → dist/vendor/
 *   - @fontsource woff2 files             → dist/fonts/
 *
 * Run automatically via `predev` and `prebuild` npm hooks.
 */

import { cpSync, existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const nm   = join(root, 'node_modules');

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/**
 * En Windows, un archivo que el navegador tiene abierto (una imagen, una
 * textura) da EBUSY y tumbaba el build entero. Copiar archivo a archivo y
 * avisar del que falle deja el build seguir: el archivo bloqueado ya está en
 * dist con el mismo contenido, que es justo por lo que estaba abierto.
 */
function syncDir(from, to) {
  if (!existsSync(from)) return;
  ensureDir(to);
  const locked = [];
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const src = join(from, entry.name);
    const dest = join(to, entry.name);
    if (entry.isDirectory()) { syncDir(src, dest); continue; }
    try {
      copyFileSync(src, dest);
    } catch (err) {
      if (err.code === 'EBUSY' || err.code === 'EPERM') locked.push(entry.name);
      else throw err;
    }
  }
  if (locked.length) {
    console.warn(`[sync] ${locked.length} archivo(s) en uso, se conservan los de dist/: ${locked.slice(0, 3).join(', ')}`);
  }
}

function copyFile(from, to) {
  if (!existsSync(from)) {
    console.warn(`[sync] Missing: ${from}`);
    return;
  }
  copyFileSync(from, to);
}

// ─── public/ static dirs ──────────────────────────────────────────────────────
ensureDir(dist);
for (const sub of ['css', 'js', 'img', 'audio', 'proto']) {
  syncDir(join(root, 'public', sub), join(dist, sub));
}

/**
 * Los modelos 3D pesan ~87 MB, no cambian nunca y el sitio v3 no los usa
 * (solo /v2/). Recopiarlos en cada build es lento y en Windows falla con EBUSY
 * cuando el navegador tiene un archivo abierto. Se copian solo si faltan.
 */
if (!existsSync(join(dist, 'models-3d'))) {
  syncDir(join(root, 'public', 'models-3d'), join(dist, 'models-3d'));
}

// ─── vendor JS (GSAP + model-viewer) ─────────────────────────────────────────
const vendor = join(dist, 'vendor');
ensureDir(vendor);

copyFile(join(nm, 'gsap',  'dist', 'gsap.min.js'),             join(vendor, 'gsap.min.js'));
copyFile(join(nm, 'gsap',  'dist', 'ScrollTrigger.min.js'),    join(vendor, 'ScrollTrigger.min.js'));
copyFile(join(nm, 'lenis', 'dist', 'lenis.min.js'),            join(vendor, 'lenis.min.js'));
copyFile(
  join(nm, '@google', 'model-viewer', 'dist', 'model-viewer.min.js'),
  join(vendor, 'model-viewer.min.js'),
);

// ─── @fontsource: woff2 files → dist/fonts/ ──────────────────────────────────
const fontsOut = join(dist, 'fonts');
ensureDir(fontsOut);

const bvpFiles = join(nm, '@fontsource', 'be-vietnam-pro', 'files');
const vt3Files = join(nm, '@fontsource', 'vt323', 'files');

/** Be Vietnam Pro – weights actually used in styles.css */
const bvpWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
for (const w of bvpWeights) {
  const name = `be-vietnam-pro-latin-${w}-normal.woff2`;
  copyFile(join(bvpFiles, name), join(fontsOut, name));
}

/** VT323 – only 400 */
copyFile(
  join(vt3Files, 'vt323-latin-400-normal.woff2'),
  join(fontsOut, 'vt323-latin-400-normal.woff2'),
);

/**
 * v3 — dos familias variables, cuatro archivos.
 * Solo los subsets latin y latin-ext (latin-ext trae los acentos del español).
 * El eje wdth va en el mismo archivo, así que display/cuerpo/datos no suman peso.
 */
const variableFonts = [
  ['geist', 'geist-latin-wght-normal.woff2'],
  ['geist-mono', 'geist-mono-latin-wght-normal.woff2'],
];
for (const [pkg, file] of variableFonts) {
  copyFile(join(nm, '@fontsource-variable', pkg, 'files', file), join(fontsOut, file));
}

for (const file of ['instrument-serif-latin-400-normal.woff2', 'instrument-serif-latin-400-italic.woff2']) {
  copyFile(join(nm, '@fontsource', 'instrument-serif', 'files', file), join(fontsOut, file));
}

console.log('[sync] Static assets, vendor libs and fonts synced to dist/');
