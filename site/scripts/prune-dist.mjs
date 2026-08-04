/**
 * prune-dist.mjs — retira de dist/ las rutas HTML que ya no se generan.
 *
 * mini-astro escribe en dist/ sin limpiarlo, así que una ruta renombrada o
 * borrada se queda publicada. Pasó de verdad: al renombrar /v2/ a /v1/, la
 * ruta vieja siguió en dist y en el sitio — dos URLs con el mismo contenido,
 * que es exactamente lo que un buscador penaliza como duplicado.
 *
 * Borrar dist/ entero en cada build no es opción: dentro viven 87 MB de
 * modelos 3D que no cambian nunca. Así que se podan solo las carpetas de ruta.
 *
 * Se ejecuta después de `mini-astro build`.
 */

import { readdirSync, rmSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const buildPages = join(root, '.build', 'pages');

if (!existsSync(dist) || !existsSync(buildPages)) process.exit(0);

/** Carpetas de assets: nunca se tocan. */
const ASSETS = new Set(['css', 'js', 'img', 'fonts', 'vendor', 'models-3d', 'audio', 'proto']);

/** Rutas que el build acaba de producir, derivadas de .build/pages. */
function rutasEsperadas(dir, prefijo = '') {
  const out = new Set();
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      for (const r of rutasEsperadas(join(dir, e.name), `${prefijo}${e.name}/`)) out.add(r);
    } else if (e.name.endsWith('.html')) {
      const base = e.name.replace(/\.html$/, '');
      // index.html → la propia carpeta; about.html → carpeta "about"
      out.add(base === 'index' ? prefijo.replace(/\/$/, '') : `${prefijo}${base}`);
    }
  }
  return out;
}

const esperadas = rutasEsperadas(buildPages);
const retiradas = [];

/** Una carpeta es "de ruta" si contiene index.html o solo otras carpetas de ruta. */
function esCarpetaDeRuta(dir) {
  const entradas = readdirSync(dir, { withFileTypes: true });
  return entradas.some(e => e.isFile() && e.name === 'index.html')
    || entradas.every(e => e.isDirectory() && esCarpetaDeRuta(join(dir, e.name)));
}

function podar(dir, prefijo = '') {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (!prefijo && ASSETS.has(e.name)) continue;

    const ruta = `${prefijo}${e.name}`;
    const abs = join(dir, e.name);

    if (esperadas.has(ruta)) { podar(abs, `${ruta}/`); continue; }

    // ¿Es antecesora de alguna ruta viva? (p. ej. "en" contiene "en/work")
    const esAncestro = [...esperadas].some(r => r.startsWith(`${ruta}/`));
    if (esAncestro) { podar(abs, `${ruta}/`); continue; }

    if (esCarpetaDeRuta(abs)) {
      rmSync(abs, { recursive: true, force: true });
      retiradas.push('/' + ruta + '/');
    }
  }
}

podar(dist);

if (retiradas.length) {
  console.log(`[prune]   ${retiradas.length} ruta(s) obsoleta(s) retirada(s): ${retiradas.join(', ')}`);
}
