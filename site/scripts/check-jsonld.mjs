/**
 * check-jsonld.mjs — comprueba que los datos estructurados de cada página
 * existan Y sean JSON válido.
 *
 * Un JSON-LD malformado es peor que ninguno: el buscador lo descarta entero
 * sin avisar, y desde fuera no se nota.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const OMITIR = ['models-3d', 'proto', 'v1', 'img', 'fonts', 'vendor', 'css', 'js', 'audio'];

function paginas(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!OMITIR.includes(e.name)) paginas(p, acc); }
    else if (e.name === 'index.html') acc.push(p);
  }
  return acc;
}

let total = 0, malos = 0, sin = 0;

for (const f of paginas(dist).sort()) {
  const ruta = '/' + relative(dist, f).replace(/\\/g, '/').replace(/index\.html$/, '');
  const m = readFileSync(f, 'utf8')
    .match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

  if (!m) { console.log(`  ${ruta.padEnd(44)}SIN JSON-LD`); sin++; continue; }

  total++;
  try {
    const d = JSON.parse(m[1].replace(/\\u003c/g, '<'));
    const tipos = (d['@graph'] || []).map(n => n['@type']).join(', ');
    console.log(`  ${ruta.padEnd(44)}${tipos}`);
  } catch (err) {
    malos++;
    console.log(`  ✗ ${ruta}  JSON inválido: ${err.message}`);
  }
}

console.log(`\nbloques válidos: ${total - malos} | inválidos: ${malos} | páginas sin schema: ${sin}\n`);
process.exit(malos || sin ? 1 : 0);
