/**
 * sync-static.mjs
 * Copies static assets from:
 *   - public/{css,js,img,models-3d,fonts} → dist/
 *   - node_modules vendor libs            → dist/vendor/
 *   - @fontsource woff2 files             → dist/fonts/
 *
 * Run automatically via `predev` and `prebuild` npm hooks.
 */

import { cpSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const nm   = join(root, 'node_modules');

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function syncDir(from, to) {
  if (!existsSync(from)) return;
  ensureDir(to);
  cpSync(from, to, { recursive: true });
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
for (const sub of ['css', 'js', 'img', 'models-3d', 'audio']) {
  syncDir(join(root, 'public', sub), join(dist, sub));
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

console.log('[sync] Static assets, vendor libs and fonts synced to dist/');
