/**
 * audit-semantics.mjs — auditoría de semántica e indexabilidad.
 *
 * Revisa la salida real en dist/ y reporta lo que un buscador penalizaría:
 * jerarquía de encabezados rota, landmarks ausentes, datos estructurados que
 * no están enlazados, metadatos incompletos.
 *
 *   node scripts/audit-semantics.mjs
 *
 * Devuelve código 1 si encuentra fallos, para poder colgarlo de CI.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

/** Páginas del sitio v3. Se excluye /v1/ (portafolio antiguo, congelado). */
function paginas(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (['models-3d', 'proto', 'v1', 'img', 'fonts', 'vendor', 'css', 'js', 'audio'].includes(e.name)) continue;
      paginas(p, acc);
    } else if (e.name === 'index.html') acc.push(p);
  }
  return acc;
}

const sinTags = h => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const fallos = [];
const avisos = [];

for (const file of paginas(dist).sort()) {
  const ruta = '/' + relative(dist, file).replace(/\\/g, '/').replace(/index\.html$/, '');
  const s = readFileSync(file, 'utf8');
  const en = m => fallos.push(`${ruta}  ${m}`);
  const av = m => avisos.push(`${ruta}  ${m}`);

  // ── Encabezados ──────────────────────────────────────────────────────────
  const hs = [...s.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)]
    .map(m => ({ n: +m[1], t: sinTags(m[2]).slice(0, 46) }));

  const h1s = hs.filter(h => h.n === 1);
  if (h1s.length !== 1) en(`h1 x${h1s.length} (debe haber exactamente uno)`);

  let prev = 0;
  for (const h of hs) {
    if (prev && h.n > prev + 1) en(`salto de h${prev} a h${h.n} en "${h.t}"`);
    prev = h.n;
  }
  if (hs.some(h => !h.t)) en('hay un encabezado vacío');

  // ── Landmarks ────────────────────────────────────────────────────────────
  if (!/<main[\s>]/.test(s)) en('falta <main>');
  if ((s.match(/<main[\s>]/g) || []).length > 1) en('más de un <main>');
  if (!/<header[\s>]/.test(s)) av('falta <header>');
  if (!/<footer[\s>]/.test(s)) av('falta <footer>');
  if (!/<nav[^>]*aria-label/.test(s)) av('<nav> sin aria-label');

  // ── Metadatos ────────────────────────────────────────────────────────────
  const title = (s.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  if (!title.trim()) en('sin <title>');
  else if (title.length > 62) av(`<title> de ${title.length} caracteres (se corta sobre ~60)`);

  const desc = (s.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (!desc.trim()) en('sin meta description');
  else if (desc.length > 160) av(`description de ${desc.length} caracteres (se corta sobre ~160)`);

  if (!/<link rel="canonical"/.test(s)) en('sin canonical');
  if (!/hreflang="es"/.test(s) || !/hreflang="en"/.test(s)) en('hreflang incompleto');
  if (!/<html[^>]+lang="(es|en)"/.test(s)) en('sin lang en <html>');
  if (!/property="og:image"/.test(s)) av('sin og:image (peor tarjeta al compartir)');

  // ── Datos estructurados ──────────────────────────────────────────────────
  if (!/application\/ld\+json/.test(s)) en('sin JSON-LD embebido');

  // ── Imágenes ─────────────────────────────────────────────────────────────
  for (const m of s.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(m[0])) en(`<img> sin alt: ${m[0].slice(0, 60)}`);
  }
}

// ── Archivos de indexación ─────────────────────────────────────────────────
for (const f of ['sitemap.xml', 'robots.txt']) {
  if (!existsSync(join(dist, f))) fallos.push(`falta ${f}`);
}

console.log(`\nPáginas auditadas: ${paginas(dist).length}\n`);
if (fallos.length) {
  console.log(`FALLOS (${fallos.length}):`);
  for (const f of fallos) console.log('  ✗ ' + f);
} else {
  console.log('FALLOS: ninguno');
}
if (avisos.length) {
  console.log(`\nAVISOS (${avisos.length}):`);
  for (const a of avisos) console.log('  · ' + a);
}
console.log('');
process.exit(fallos.length ? 1 : 0);
