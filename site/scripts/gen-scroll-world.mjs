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

/* ───────────────────────── geometría isométrica ───────────────────────── */

const TW = 100, TH = 50;
const r1 = (n) => Math.round(n * 10) / 10;
const pts = (arr) => arr.map((p) => `${r1(p[0])},${r1(p[1])}`).join(' ');
const poly = (arr, cls, extra = '') => `<polygon class="${cls}" points="${pts(arr)}"${extra}/>`;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function proyector(o) {
  return (gx, gy, gz = 0) => [o[0] + ((gx - gy) * TW) / 2, o[1] + ((gx + gy) * TH) / 2 - gz];
}

/** Ventana (paralelogramo) sobre una cara paramétrica f(u,v). */
function ventana(f, u0, u1, v0, v1, cls) {
  return poly([f(u0, v0), f(u1, v0), f(u1, v1), f(u0, v1)], cls);
}

/** Cuadrícula de ventanas encendidas al azar. kind: grid | cinta | rendija */
function ventanas(f, v0, v1, { cols, rows, kind = 'grid', lit = 0.55 }, rand) {
  let out = '';
  const mx = 0.1, my = 0.1;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const ancho = (1 - 2 * mx) / cols;
      const alto = (v1 - v0) * (1 - 2 * my) / rows;
      let u0 = mx + c * ancho, u1 = u0 + ancho * (kind === 'rendija' ? 0.34 : kind === 'cinta' ? 0.96 : 0.62);
      if (kind === 'rendija') { u0 += ancho * 0.33; u1 += ancho * 0.33; }
      const a = v0 + (v1 - v0) * my + r * alto;
      const b = a + alto * (kind === 'cinta' ? 0.5 : 0.58);
      const encendida = rand() < lit;
      const tono = encendida ? ['a', 'b', 'b', 'c'][Math.floor(rand() * 4)] : '';
      const parpadea = encendida && rand() < 0.07 ? ' parp' : '';
      out += ventana(f, u0, u1, a, b, `v ${tono}${parpadea}`.trim());
    }
  }
  return out;
}

/** Caja con cuatro caras visibles; devuelve svg de las tres + helpers de cara. */
function caja(P, gx0, gy0, w, d, h, z0 = 0) {
  const gx1 = gx0 + w, gy1 = gy0 + d, zt = z0 + h;
  return {
    svg:
      poly([P(gx0, gy1, z0), P(gx1, gy1, z0), P(gx1, gy1, zt), P(gx0, gy1, zt)], 'fl') +
      poly([P(gx1, gy0, z0), P(gx1, gy1, z0), P(gx1, gy1, zt), P(gx1, gy0, zt)], 'fr') +
      poly([P(gx0, gy0, zt), P(gx1, gy0, zt), P(gx1, gy1, zt), P(gx0, gy1, zt)], 'ft'),
    izq: (u, v) => P(gx0 + u * w, gy1, v),
    der: (u, v) => P(gx1, gy0 + u * d, v),
    gx1, gy1, zt,
  };
}

/** Silueta hexagonal para el borde de foco. */
function silueta(P, gx0, gy0, w, d, h) {
  const gx1 = gx0 + w, gy1 = gy0 + d;
  return [P(gx0, gy0, h), P(gx1, gy0, h), P(gx1, gy0, 0), P(gx1, gy1, 0), P(gx0, gy1, 0), P(gx0, gy1, h)];
}

function cilindro(P, gx, gy, z, r, alto, cls = 'tanque') {
  const [cx, cy] = P(gx, gy, z);
  const rx = r * TW * 0.7071, ry = rx / 2;
  return `<g class="${cls}"><path class="fl" d="M${r1(cx - rx)},${r1(cy)} v${-alto} a${r1(rx)},${r1(ry)} 0 0 0 ${r1(2 * rx)},0 v${alto} a${r1(rx)},${r1(ry)} 0 0 1 ${r1(-2 * rx)},0z"/><ellipse class="ft" cx="${r1(cx)}" cy="${r1(cy - alto)}" rx="${r1(rx)}" ry="${r1(ry)}"/></g>`;
}

/* ───────── tipos de edificio (cada uno con otra silueta y otra fachada) ───────── */

const TIPOS = ['torre', 'bloque', 'taller', 'escalonado', 'cupula', 'losa'];

function edificio(tipo, P, gx0, gy0, rand) {
  let svg = '', w, d, h, extra = 0;
  switch (tipo) {
    case 'torre': {
      w = 1.3; d = 1.3; h = 230 + rand() * 40;
      const c = caja(P, gx0, gy0, w, d, h);
      svg = c.svg + ventanas(c.izq, 0, h, { cols: 3, rows: 11, kind: 'rendija', lit: 0.58 }, rand) + ventanas(c.der, 0, h, { cols: 3, rows: 11, kind: 'rendija', lit: 0.5 }, rand);
      const [ax, ay] = P(gx0 + w / 2, gy0 + d / 2, h);
      svg += `<line class="antena" x1="${r1(ax)}" y1="${r1(ay)}" x2="${r1(ax)}" y2="${r1(ay - 64)}"/><circle class="baliza" cx="${r1(ax)}" cy="${r1(ay - 66)}" r="3.4"/>`;
      extra = 70;
      break;
    }
    case 'bloque': {
      w = 2.3; d = 1.5; h = 130 + rand() * 20;
      const c = caja(P, gx0, gy0, w, d, h);
      svg = c.svg + ventanas(c.izq, 0, h, { cols: 1, rows: 5, kind: 'cinta', lit: 0.7 }, rand) + ventanas(c.der, 0, h, { cols: 1, rows: 5, kind: 'cinta', lit: 0.5 }, rand);
      svg += cilindro(P, gx0 + 0.55, gy0 + 0.6, h, 0.36, 34);
      const sb = caja(P, gx0 + 1.4, gy0 + 0.5, 0.5, 0.5, 20, h);
      svg += sb.svg;
      extra = 40;
      break;
    }
    case 'taller': {
      w = 2.4; d = 1.9; h = 78 + rand() * 12;
      const c = caja(P, gx0, gy0, w, d, h);
      svg = c.svg;
      const alto = 38, n = 3;
      for (let i = 0; i < n; i++) {
        const a = gx0 + (i * w) / n, b = gx0 + ((i + 1) * w) / n, y1 = gy0 + d;
        svg += poly([P(a, gy0, h), P(a, y1, h), P(b, y1, h + alto), P(b, gy0, h + alto)], 'ft claro');
        svg += poly([P(b, gy0, h), P(b, y1, h), P(b, y1, h + alto), P(b, gy0, h + alto)], 'v a vidrio');
        svg += poly([P(a, y1, h), P(b, y1, h), P(b, y1, h + alto)], 'fl');
      }
      svg += ventana(c.izq, 0.12, 0.46, 0, h * 0.62, 'puerta') + ventana(c.izq, 0.14, 0.44, 0.02 * h, h * 0.5, 'v c');
      svg += ventanas(c.izq, h * 0.55, h, { cols: 5, rows: 1, kind: 'grid', lit: 0.6 }, rand);
      extra = alto;
      break;
    }
    case 'escalonado': {
      w = 2.3; d = 1.8; h = 96 + rand() * 12;
      const c = caja(P, gx0, gy0, w, d, h);
      svg = c.svg + ventanas(c.izq, 0, h, { cols: 5, rows: 3, kind: 'grid', lit: 0.5 }, rand) + ventanas(c.der, 0, h, { cols: 4, rows: 3, kind: 'grid', lit: 0.45 }, rand);
      const c2 = caja(P, gx0 + 0.55, gy0 + 0.5, 1.3, 0.9, 82, h);
      svg += c2.svg + ventanas(c2.izq, h, h + 82, { cols: 3, rows: 3, kind: 'grid', lit: 0.65 }, rand) + ventanas(c2.der, h, h + 82, { cols: 2, rows: 3, kind: 'grid', lit: 0.5 }, rand);
      h += 82; extra = 10;
      break;
    }
    case 'cupula': {
      w = 1.8; d = 1.8; h = 112 + rand() * 14;
      const c = caja(P, gx0, gy0, w, d, h);
      svg = c.svg + ventanas(c.izq, 0, h, { cols: 4, rows: 3, kind: 'rendija', lit: 0.6 }, rand) + ventanas(c.der, 0, h, { cols: 4, rows: 3, kind: 'rendija', lit: 0.55 }, rand);
      const [cx, cy] = P(gx0 + w / 2, gy0 + d / 2, h);
      const rx = 0.82 * TW * 0.7071, ry = rx / 2, dh = rx * 0.78;
      svg += `<path class="fl" d="M${r1(cx - rx)},${r1(cy)} A${r1(rx)},${r1(dh)} 0 0 1 ${r1(cx + rx)},${r1(cy)} A${r1(rx)},${r1(ry)} 0 0 1 ${r1(cx - rx)},${r1(cy)}z"/>`;
      svg += `<path class="ft claro" d="M${r1(cx - rx)},${r1(cy)} A${r1(rx)},${r1(dh)} 0 0 1 ${r1(cx + rx)},${r1(cy)} A${r1(rx)},${r1(ry)} 0 0 0 ${r1(cx - rx)},${r1(cy)}z"/>`;
      svg += `<line class="antena" x1="${r1(cx)}" y1="${r1(cy - dh - ry * 0.4)}" x2="${r1(cx)}" y2="${r1(cy - dh - 30)}"/><circle class="baliza" cx="${r1(cx)}" cy="${r1(cy - dh - 32)}" r="3"/>`;
      extra = dh + 30;
      break;
    }
    default: { // losa
      w = 1.5; d = 2.2; h = 176 + rand() * 24;
      const c = caja(P, gx0, gy0, w, d, h);
      svg = c.svg + ventanas(c.izq, 0, h, { cols: 6, rows: 9, kind: 'rendija', lit: 0.5 }, rand) + ventanas(c.der, 0, h, { cols: 5, rows: 9, kind: 'grid', lit: 0.5 }, rand);
      for (let i = 0; i < 4; i++) {
        const [ax, ay] = P(gx0 + 0.15 + i * 0.4, gy0 + d - 0.1, h);
        svg += `<line class="antena" x1="${r1(ax)}" y1="${r1(ay)}" x2="${r1(ax)}" y2="${r1(ay - 20)}"/>`;
      }
      const [ex, ey] = P(gx0 + 0.15, gy0 + d - 0.1, h + 20), [fx, fy] = P(gx0 + 1.35, gy0 + d - 0.1, h + 20);
      svg += `<line class="antena" x1="${r1(ex)}" y1="${r1(ey)}" x2="${r1(fx)}" y2="${r1(fy)}"/>`;
      extra = 22;
      break;
    }
  }
  return { svg, w, d, h, extra, silueta: silueta(P, gx0, gy0, w, d, h) };
}

/* ───────── islas ───────── */

function plataforma(P, L, W, clase = '') {
  const prof = 78;
  const esq = [P(0, 0), P(L, 0), P(L, W), P(0, W)];
  let s = '';
  // laterales
  s += poly([P(0, W), P(L, W), P(L, W, -prof), P(0, W, -prof)], 'roca-l');
  s += poly([P(L, 0), P(L, W), P(L, W, -prof), P(L, 0, -prof)], 'roca-r');
  // estalactitas
  const r = rng(Math.floor(L * 31 + W * 7));
  for (let i = 0; i < 7; i++) {
    const t = 0.08 + (i / 7) * 0.84, g = r() * 20 + 30;
    const a = P(t * L, W, -prof), b = P(Math.min(L, t * L + 1.1), W, -prof);
    s += poly([a, b, [(a[0] + b[0]) / 2 + (r() - 0.5) * 10, (a[1] + b[1]) / 2 + g + 24]], 'roca-l');
  }
  for (let i = 0; i < 5; i++) {
    const t = 0.1 + (i / 5) * 0.8, g = r() * 20 + 26;
    const a = P(L, t * W, -prof), b = P(L, Math.min(W, t * W + 1.0), -prof);
    s += poly([a, b, [(a[0] + b[0]) / 2 + (r() - 0.5) * 10, (a[1] + b[1]) / 2 + g + 22]], 'roca-r');
  }
  s += poly(esq, `suelo ${clase}`);
  return s;
}

function calle(P, gx0, gx1, gy0, gy1) {
  const ymid = (gy0 + gy1) / 2;
  let s = poly([P(gx0, gy0), P(gx1, gy0), P(gx1, gy1), P(gx0, gy1)], 'asfalto');
  s += poly([P(gx0, gy0), P(gx1, gy0), P(gx1, gy0 + 0.1), P(gx0, gy0 + 0.1)], 'bordillo');
  s += poly([P(gx0, gy1 - 0.1), P(gx1, gy1 - 0.1), P(gx1, gy1), P(gx0, gy1)], 'bordillo');
  for (let g = gx0 + 0.3; g < gx1 - 0.5; g += 1) s += poly([P(g, ymid - 0.03), P(g + 0.5, ymid - 0.03), P(g + 0.5, ymid + 0.03), P(g, ymid + 0.03)], 'raya');
  return s;
}

function farola(P, gx, gy) {
  const [x, y] = P(gx, gy);
  return `<g class="farola"><line x1="${r1(x)}" y1="${r1(y)}" x2="${r1(x)}" y2="${r1(y - 58)}"/><circle class="halo" cx="${r1(x)}" cy="${r1(y - 60)}" r="30" fill="url(#luz)"/><circle class="foco" cx="${r1(x)}" cy="${r1(y - 60)}" r="3.6"/></g>`;
}

function arbol(P, gx, gy, k = 1) {
  const [x, y] = P(gx, gy);
  return `<g class="arbol"><line x1="${r1(x)}" y1="${r1(y)}" x2="${r1(x)}" y2="${r1(y - 14 * k)}"/><ellipse cx="${r1(x)}" cy="${r1(y - 26 * k)}" rx="${r1(15 * k)}" ry="${r1(19 * k)}"/><ellipse class="claro" cx="${r1(x - 3 * k)}" cy="${r1(y - 31 * k)}" rx="${r1(8 * k)}" ry="${r1(11 * k)}"/></g>`;
}

/* ───────── construcción del mundo ───────── */

const islas = {
  A: { o: [0, 0], L: 14.2, W: 7.2 },
  B: { o: [2350, 560], L: 11.6, W: 7.2 },
  T: { o: [4750, 90], L: 9.6, W: 8 },
  Z: { o: [7000, 760], L: 8.4, W: 7 },
};

const ruta = []; // puntos del trazo, en coordenadas del mundo
const paradas = []; // lista ordenada de paradas de cámara
let mundo = '';
const grupos = { A: [], B: [], T: [], Z: [] };
let islaActual = 'A';
const rutaIdx = (p) => { const i = ruta.push(p) - 1; grupos[islaActual].push(i); return i; };

function paradaCaso(P, slug, ed, gx0, gy0, cap, extra) {
  const cx = gx0 + ed.w / 2, cy = gy0 + ed.d / 2;
  const [wx, wy] = P(cx, cy, ed.h * 0.46);
  const anchoPx = (ed.w + ed.d) * (TW / 2), altoPx = (ed.w + ed.d) * (TH / 2) + ed.h + ed.extra;
  const z = Math.max(0.8, Math.min(1.9, Math.min((0.6 * 900) / altoPx, (0.44 * 1440) / anchoPx)));
  paradas.push({ id: `caso-${slug}`, kind: 'caso', cap, wx: r1(wx), wy: r1(wy), z: +z.toFixed(2), ax: 0.3, ay: 0.55, hold: 0.55, edif: `ed-${slug}`, ...extra });
}

/** Isla de calle con dos filas de edificios; casos en zigzag. */
function construirCalle(clave, casos, offsetTipo, capId) {
  islaActual = clave;
  const { o, L, W } = islas[clave];
  const P = proyector(o);
  const rand = rng(clave.charCodeAt(0) * 977);
  const paso = (L - 1.2) / Math.ceil(casos.length / 2);
  let s = plataforma(P, L, W);
  s += calle(P, 0, L, 2.9, 4.3);
  const yRuta = 3.6;
  const edifs = [];
  casos.forEach((c, k) => {
    const fila = k % 2, slot = Math.floor(k / 2);
    const tipo = TIPOS[(k * 2 + offsetTipo + (fila ? 1 : 0)) % TIPOS.length];
    const gx0 = 0.7 + slot * paso + (fila ? 0.2 : 0);
    const dTipo = { torre: 1.3, bloque: 1.5, taller: 1.9, escalonado: 1.8, cupula: 1.8, losa: 2.2 }[tipo];
    const gy0 = fila ? 4.5 : 2.6 - dTipo - 0.15;
    const ed = edificio(tipo, P, gx0, gy0, rand);
    const tn = (k + offsetTipo) % 4;
    edifs.push({ k, gx0, gy0, ed, tn, slug: c.slug, key: gx0 + gy0 + ed.w + ed.d });
  });
  // pintar de atrás hacia adelante
  const orden = [...edifs].sort((a, b) => a.key - b.key);
  // elementos de suelo y farolas van antes de los edificios del frente, así que se dibujan primero
  for (let g = 0.9; g < L - 0.4; g += paso * 0.5) { s += farola(P, g, 2.95); s += farola(P, g + paso * 0.25, 4.25); }
  for (const e of orden) {
    s += `<g class="edif tn${e.tn}" id="ed-${e.slug}">${e.ed.svg}<polygon class="borde" points="${pts(e.ed.silueta)}"/></g>`;
  }
  for (let i = 0; i < 6; i++) { s += arbol(P, 0.4 + i * (L / 6), W - 0.35, 0.9 + rand() * 0.3); }
  // ruta (a nivel de calle)
  const r0 = rutaIdx(P(-0.2, yRuta));
  edifs.forEach((e) => {
    const xr = e.gx0 + e.ed.w / 2;
    e.ruta = rutaIdx(P(xr, yRuta));
  });
  const rEnd = rutaIdx(P(L + 0.2, yRuta));
  mundo += `<g class="isla" id="isla-${clave}">${s}</g>`;
  // paradas
  const centro = P(L * 0.52, W * 0.52, 40);
  paradas.push({ id: `p-${capId}`, kind: 'isla', cap: capId, wx: r1(centro[0]), wy: r1(centro[1]), z: 0.9, ax: 0.32, ay: 0.54, hold: 0.7, ruta: r0 });
  edifs.sort((a, b) => a.k - b.k).forEach((e) => {
    paradaCaso(P, e.slug, e.ed, e.gx0, e.gy0, capId, { ruta: e.ruta });
  });
  return { P, rEnd, L, W, yRuta };
}

/* Isla A y B */
const A = construirCalle('A', clinicos, 0, 'clinica');
const B = construirCalle('B', propios, 3, 'propios');
// de A a B: la ruta vuela en arco
function arco(p0, p1, alto) {
  const out = [];
  const c1 = [p0[0] + (p1[0] - p0[0]) * 0.28, p0[1] - alto], c2 = [p0[0] + (p1[0] - p0[0]) * 0.72, p1[1] - alto];
  for (let i = 1; i < 18; i++) {
    const t = i / 18, m = 1 - t;
    out.push([m ** 3 * p0[0] + 3 * m * m * t * c1[0] + 3 * m * t * t * c2[0] + t ** 3 * p1[0], m ** 3 * p0[1] + 3 * m * m * t * c1[1] + 3 * m * t * t * c2[1] + t ** 3 * p1[1]]);
  }
  return out;
}

/* ───────── Isla T: el taller ───────── */
{
  islaActual = 'T';
  const { o, L, W } = islas.T;
  const P = proyector(o);
  const rand = rng(4242);
  let s = plataforma(P, L, W);
  s += calle(P, 0, L, 5.6, 7);
  // nave principal, grande, con puerta de garaje encendida
  const nave = caja(P, 2.6, 0.9, 4.6, 3.2, 96);
  let n = nave.svg;
  n += ventana(nave.izq, 0.1, 0.5, 0, 74, 'puerta') + ventana(nave.izq, 0.12, 0.48, 3, 66, 'v c grande');
  n += ventanas(nave.izq, 40, 96, { cols: 6, rows: 1, kind: 'grid', lit: 0.8 }, rand);
  n += ventanas(nave.der, 0, 96, { cols: 3, rows: 2, kind: 'grid', lit: 0.6 }, rand);
  for (let i = 0; i < 5; i++) {
    const a = 2.6 + (i * 4.6) / 5, b = 2.6 + ((i + 1) * 4.6) / 5, y1 = 4.1, alto = 34, hh = 96;
    n += poly([P(a, 0.9, hh), P(a, y1, hh), P(b, y1, hh + alto), P(b, 0.9, hh + alto)], 'ft claro');
    n += poly([P(b, 0.9, hh), P(b, y1, hh), P(b, y1, hh + alto), P(b, 0.9, hh + alto)], 'v a vidrio');
    n += poly([P(a, y1, hh), P(b, y1, hh), P(b, y1, hh + alto)], 'fl');
  }
  n += `<polygon class="borde" points="${pts(silueta(P, 2.6, 0.9, 4.6, 3.2, 130))}"/>`;
  s += `<g class="edif tn1" id="ed-taller">${n}</g>`;
  // estaciones, de izquierda a derecha: tablero de servicio, muro de reglas, banco, panel de herramientas
  const poste = (gx, gy, z) => { const a = P(gx, gy, 0), b2 = P(gx, gy, z); return `<line class="poste" x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b2[0])}" y2="${r1(b2[1])}"/>`; };
  const tablero = caja(P, 0.7, 4.3, 1.8, 0.22, 78, 30);
  let t1 = poste(0.95, 4.4, 30) + poste(2.35, 4.4, 30) + tablero.svg;
  for (let i = 0; i < 7; i++) t1 += ventana(tablero.izq, 0.1, 0.9 - (i % 3) * 0.12, 38 + i * 9, 38 + i * 9 + 4.6, `v ${i % 2 ? 'b' : 'a'}`);
  t1 += `<polygon class="borde" points="${pts(silueta(P, 0.7, 4.3, 1.8, 0.22, 108))}"/>`;
  s += `<g class="edif tn2 estacion-obj" id="ed-tray">${t1}</g>`;

  const muro = caja(P, 3.0, 4.4, 2.5, 0.3, 96, 14);
  let t2 = poste(3.15, 4.5, 14) + poste(5.35, 4.5, 14) + muro.svg;
  for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) {
    const u0 = 0.04 + c * 0.24 + (r % 2) * 0.1, u1 = Math.min(u0 + 0.2, 0.98), v = 18 + r * 13;
    t2 += poly([muro.izq(u0, v), muro.izq(u1, v), muro.izq(u1, v + 9), muro.izq(u0, v + 9)], 'ladrillo');
  }
  for (let i = 0; i < 4; i++) t2 += ventana(muro.izq, 0.08, 0.92, 28 + i * 18, 28 + i * 18 + 6, `v ${i % 2 ? 'b' : 'a'}`);
  t2 += `<polygon class="borde" points="${pts(silueta(P, 3.0, 4.4, 2.5, 0.3, 110))}"/>`;
  s += `<g class="edif tn1 estacion-obj" id="ed-trab">${t2}</g>`;

  const banco = caja(P, 6.2, 4.4, 2.2, 0.9, 34);
  let t3 = banco.svg + ventana(banco.izq, 0.08, 0.92, 4, 12, 'v a');
  t3 += `<polygon class="borde" points="${pts(silueta(P, 6.2, 4.4, 2.2, 0.9, 80))}"/>`;
  s += `<g class="edif tn0 estacion-obj" id="ed-lidero">${t3}${farola(P, 7.4, 4.5)}</g>`;

  const panel = caja(P, 7.6, 0.9, 0.35, 2.8, 100);
  let t4 = panel.svg;
  stack.forEach((g, gi) => {
    const base = 8 + gi * 22;
    g.items.slice(0, 6).forEach((_, i) => {
      const u = 0.07 + i * 0.15;
      t4 += poly([panel.der(u, base), panel.der(u + 0.1, base), panel.der(u + 0.1, base + 15), panel.der(u, base + 15)], `herr h${(gi + i) % 3}`);
    });
  });
  t4 += `<polygon class="borde" points="${pts(silueta(P, 7.6, 0.9, 0.35, 2.8, 100))}"/>`;
  s += `<g class="edif tn3 estacion-obj" id="ed-stack">${t4}</g>`;

  for (let g = 1.2; g < L; g += 2.4) s += farola(P, g, 5.65);
  for (let i = 0; i < 5; i++) s += arbol(P, 0.4 + i * 2.1, W - 0.3, 1);
  mundo += `<g class="isla" id="isla-T">${s}</g>`;

  const rr0 = rutaIdx(P(-0.2, 6.3));
  const rTray = rutaIdx(P(1.6, 6.3)), rTrab = rutaIdx(P(4.2, 6.3)), rLid = rutaIdx(P(7.0, 6.3)), rStack = rutaIdx(P(8.4, 6.3));
  const rEnd = rutaIdx(P(L + 0.2, 6.3));
  const pc = (gx, gy, gz) => P(gx, gy, gz).map(r1);
  const estacion = (id, gx, gy, gz, rr, hold, z, edif) => {
    const [wx, wy] = pc(gx, gy, gz);
    paradas.push({ id, kind: 'taller', cap: 'taller', wx, wy, z, ax: 0.3, ay: 0.56, hold, edif: `ed-${edif}`, ruta: rr });
  };
  { const [wx, wy] = pc(4.9, 2.5, 70); paradas.push({ id: 'p-taller', kind: 'isla', cap: 'taller', wx, wy, z: 0.95, ax: 0.32, ay: 0.56, hold: 0.8, edif: 'ed-taller', ruta: rr0 }); }
  estacion('taller-trayectoria', 1.6, 4.4, 70, rTray, 1.0, 1.35, 'tray');
  estacion('taller-trabajo', 4.25, 4.6, 70, rTrab, 0.9, 1.3, 'trab');
  estacion('taller-lidero', 7.3, 4.9, 30, rLid, 0.9, 1.45, 'lidero');
  estacion('taller-stack', 7.9, 2.4, 55, rStack, 0.95, 1.3, 'stack');
  islas.T.rEnd = rEnd; islas.T.P = P; islas.T.rr0 = rr0;
}

/* ───────── Isla Z: la llegada ───────── */
{
  islaActual = 'Z';
  const { o, L, W } = islas.Z;
  const P = proyector(o);
  const rand = rng(777);
  let s = plataforma(P, L, W, 'plaza');
  s += calle(P, 0, 6.2, 4.6, 5.8);
  const cartel = caja(P, 2.4, 1.6, 3.6, 0.3, 120, 70);
  let c = `<line class="poste" x1="${r1(P(2.9, 1.7, 0)[0])}" y1="${r1(P(2.9, 1.7, 0)[1])}" x2="${r1(P(2.9, 1.7, 70)[0])}" y2="${r1(P(2.9, 1.7, 70)[1])}"/><line class="poste" x1="${r1(P(5.5, 1.7, 0)[0])}" y1="${r1(P(5.5, 1.7, 0)[1])}" x2="${r1(P(5.5, 1.7, 70)[0])}" y2="${r1(P(5.5, 1.7, 70)[1])}"/>` + cartel.svg;
  c += ventana(cartel.izq, 0.04, 0.96, 70 + 8, 70 + 112, 'cartel-luz');
  c += `<polygon class="borde" points="${pts(silueta(P, 2.4, 1.6, 3.6, 0.3, 190))}"/>`;
  for (let i = 0; i < 4; i++) s += arbol(P, 0.6 + i * 2.2, 0.5, 1.1);
  s += `<g class="edif tn1" id="ed-llegada">${c}</g>`;
  for (let g = 0.8; g < L; g += 1.8) s += farola(P, g, 4.5);
  for (let i = 0; i < 5; i++) s += arbol(P, 0.4 + i * 1.9, W - 0.3, 1);
  mundo += `<g class="isla" id="isla-Z">${s}</g>`;
  const rr0 = rutaIdx(P(-0.2, 5.2)), rEnd = rutaIdx(P(4.2, 5.2));
  const [wx, wy] = P(4.2, 2.2, 80).map(r1);
  paradas.push({ id: 'p-contacto', kind: 'llegada', cap: 'contacto', wx, wy, z: 1.05, ax: 0.3, ay: 0.58, hold: 1.1, edif: 'ed-llegada', ruta: rEnd });
  islas.Z.rr0 = rr0; islas.Z.P = P;
}

/* ───────── ruta: calles de cada isla unidas por arcos aéreos ───────── */
const trazo = [];
{
  const pasos = [grupos.A, grupos.B, grupos.T, grupos.Z];
  pasos.forEach((g, gi) => {
    if (gi > 0) {
      const prev = pasos[gi - 1];
      arco(ruta[prev[prev.length - 1]], ruta[g[0]], 260).forEach((p) => trazo.push({ p, i: -1 }));
    }
    g.forEach((i) => trazo.push({ p: ruta[i], i }));
  });
}
const dist = [];
let longitud = 0;
trazo.forEach((t, k) => {
  if (k > 0) longitud += Math.hypot(t.p[0] - trazo[k - 1].p[0], t.p[1] - trazo[k - 1].p[1]);
  dist.push(longitud);
});
const rutaDeIdx = new Map();
trazo.forEach((t, k) => { if (t.i >= 0) rutaDeIdx.set(t.i, dist[k] / longitud); });
paradas.forEach((p) => { p.ruta = +(rutaDeIdx.get(p.ruta) ?? 0).toFixed(4); });
const rutaD = 'M' + trazo.map((t) => `${r1(t.p[0])},${r1(t.p[1])}`).join(' L');

// portada: inicio
const centroA = proyector(islas.A.o)(islas.A.L * 0.5, islas.A.W * 0.5, 40);
paradas.unshift({ id: 'p-inicio', kind: 'inicio', cap: 'inicio', wx: r1(centroA[0] - 40), wy: r1(centroA[1] - 40), z: 0.55, ax: 0.63, ay: 0.55, hold: 0.9, ruta: 0 });

/* ───────── capas de fondo (paralaje) ───────── */
const xs = paradas.map((p) => p.wx), ys = paradas.map((p) => p.wy);
const MUN = { x0: Math.min(...xs) - 600, x1: Math.max(...xs) + 600, y0: Math.min(...ys), y1: Math.max(...ys) };
const yMid = (MUN.y0 + MUN.y1) / 2;

function capaMontes(f, base, color, seed, amp) {
  const r = rng(seed), x0 = MUN.x0 * f - 1800, x1 = MUN.x1 * f + 1800;
  let d = `M${r1(x0)},${r1(base + 1400)}`;
  let y = base;
  for (let x = x0; x <= x1; x += 90) {
    y = base + Math.sin(x / 380 + seed) * amp + Math.sin(x / 130 + seed * 2) * amp * 0.35 + (r() - 0.5) * amp * 0.25;
    d += ` L${r1(x)},${r1(y)}`;
  }
  d += ` L${r1(x1)},${r1(base + 1400)}z`;
  return `<path d="${d}" fill="${color}"/>`;
}

function capaLuces(f, y0, seed, densidad, rMax) {
  const r = rng(seed), x0 = MUN.x0 * f - 1800, x1 = MUN.x1 * f + 1800;
  let s = '';
  const n = Math.floor(((x1 - x0) / 100) * densidad);
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0);
    const y = y0 + Math.pow(r(), 0.8) * 620 + Math.sin(x / 260 + seed) * 50;
    const cls = ['a', 'b', 'b', 'c', 'd'][Math.floor(r() * 5)];
    s += `<circle class="lz ${cls}" cx="${r1(x)}" cy="${r1(y)}" r="${r1(0.9 + r() * rMax)}"/>`;
  }
  return s;
}

function capaEstrellas() {
  const r = rng(99);
  let s = '';
  for (let i = 0; i < 280; i++) s += `<circle class="est${i % 8 === 0 ? ' tw' : ''}" cx="${r1(r() * 2700 - 1200)}" cy="${r1(r() * 1000 - 580)}" r="${r1(0.6 + r() * 1.3)}"/>`;
  s += `<circle cx="420" cy="-370" r="150" fill="url(#luz-luna)"/><circle class="luna" cx="420" cy="-370" r="38"/>`;
  return s;
}

const capas = [
  { f: 0.02, cls: 'cielo', svg: capaEstrellas() },
  { f: 0.07, cls: 'montes-lejos', svg: capaMontes(0.07, yMid * 0.07 + 90, '#10141f', 3, 80) },
  { f: 0.16, cls: 'valle', svg: capaMontes(0.16, yMid * 0.16 + 150, '#0b0d15', 7, 70) + capaLuces(0.16, yMid * 0.16 + 190, 11, 9, 1.8) },
  { f: 0.34, cls: 'barrio', svg: capaLuces(0.34, yMid * 0.34 + 170, 23, 5, 3.2) },
];

/** Cámara estática para la franja decorativa del modo lista (1440×560). */
const BW = 1440, BH = 560, BS = 0.85;
const centroBanner = proyector(islas.A.o)(islas.A.L * 0.5, islas.A.W * 0.5, 60);
const vbCamara = (wx, wy, s, ax, ay, W, H) => `${r1(wx - (ax * W) / s)} ${r1(wy - (ay * H) / s)} ${r1(W / s)} ${r1(H / s)}`;
const capasHtml = capas
  .map((c) => {
    const sl = 1 + (BS - 1) * c.f;
    return `<svg class="capa ${c.cls}" data-f="${c.f}" viewBox="${vbCamara(centroBanner[0] * c.f, centroBanner[1] * c.f, sl, 0.5, 0.55, BW, BH)}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${c.svg}</svg>`;
  })
  .join('\n      ');
const vbMundo = vbCamara(centroBanner[0], centroBanner[1], BS, 0.5, 0.55, BW, BH);

/* ───────── texto de cada parada (HTML) ───────── */

const num = (k, n) => `${String(k).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
const cap1 = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const primeraFrase = (intro.trim().split('\n')[0].split('. ')[0] || '').replace(/\.$/, '') + '.';
const nombreCap = { inicio: 'Inicio', clinica: 'Plataforma clínica', propios: 'Proyectos propios', taller: 'El taller', contacto: 'Contacto' };

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

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Iván Santander · El mundo</title>
<meta name="description" content="Iván Santander, Tech Lead y Technical Product Owner. Un recorrido por el trabajo en una plataforma de ensayos clínicos y por proyectos propios.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#06070b">
<link rel="icon" href="/favicon.ico">
<link rel="preload" href="/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/scroll-world/world.css">
<script type="application/json" id="geo">${JSON.stringify({ paradas })}</script>
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
    <div id="escena">
      ${capasHtml}
      <svg id="mundo" viewBox="${vbMundo}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="luz"><stop offset="0" stop-color="#ffb04a" stop-opacity=".95"/><stop offset=".35" stop-color="#ff8a1f" stop-opacity=".4"/><stop offset="1" stop-color="#ff8a1f" stop-opacity="0"/></radialGradient>
          <radialGradient id="luz-luna"><stop offset="0" stop-color="#cfd8ff" stop-opacity=".22"/><stop offset="1" stop-color="#cfd8ff" stop-opacity="0"/></radialGradient>
          <radialGradient id="luz-faro"><stop offset="0" stop-color="#fff4d6" stop-opacity="1"/><stop offset=".25" stop-color="#ffd37a" stop-opacity=".55"/><stop offset="1" stop-color="#ff8a1f" stop-opacity="0"/></radialGradient>
        </defs>
        ${mundo}
        <path id="trazo" d="${rutaD}" fill="none"/>
        <g id="faro-ruta"><circle r="44" fill="url(#luz-faro)"/><circle r="5" class="punto"/></g>
      </svg>
      <div class="viñeta" aria-hidden="true"></div>
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
        <p class="etiqueta">Isla 1 · ${clinicos.length} casos</p>
        <h2 id="t-clinica">Plataforma clínica</h2>
        <p class="lead">${esc(clinicos[0].domain)}.</p>
      </article>
      <ol class="casos">
        ${clinicos.map((c, k) => `<li>${articuloCaso(c, k, clinicos.length, 'clinica')}</li>`).join('\n        ')}
      </ol>
    </section>

    <section class="cap" id="propios" aria-labelledby="t-propios">
      <article class="parada" id="p-propios" data-parada data-cap="propios">
        <p class="etiqueta">Isla 2 · ${propios.length} casos</p>
        <h2 id="t-propios">Proyectos propios</h2>
        <p class="lead">${esc((secciones['Proyectos propios'].match(/sirven[^.]*\./) || ['Sirven para probar ideas antes de llevarlas a un equipo.'])[0].replace(/^./, (m) => m.toUpperCase()))}</p>
      </article>
      <ol class="casos">
        ${propios.map((c, k) => `<li>${articuloCaso(c, k, propios.length, 'propios')}</li>`).join('\n        ')}
      </ol>
    </section>

    <section class="cap" id="taller" aria-labelledby="t-taller">
      <article class="parada" id="p-taller" data-parada data-cap="taller">
        <p class="etiqueta">Isla 3</p>
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
<script src="/scroll-world/world.js" defer></script>
<noscript><style>#escena{display:none}</style></noscript>
</body>
</html>
`;

const final = html;

writeFileSync(join(outDir, 'index.html'), final);
console.log(`scroll-world: ${paradas.length} paradas, ${(final.length / 1024).toFixed(0)} KB, ${clinicos.length}+${propios.length} casos, ruta ${Math.round(longitud)}px`);
