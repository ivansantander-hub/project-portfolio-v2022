/**
 * graph-snapshot.mjs
 *
 * Reproduce el grafo del hero con el mismo PRNG sembrado que el navegador y
 * emite tres SVG autocontenidos (colores en línea, sin variables CSS) para
 * revisar la coreografía sin depender de una captura de pantalla.
 *
 * El orden de llamadas a rand() debe coincidir exactamente con proto/graph.html,
 * o el layout no será el mismo.
 *
 *   node scripts/graph-snapshot.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist', 'proto');

const W = 1000, H = 620;

const C = {
  bg: '#0d1017',
  surface: '#141924',
  surfaceRaised: '#1c2331',
  text: '#e6e8ed',
  textDim: '#6b7488',
  borderStrong: '#59647a',
  signal: '#e8a33d',
  live: '#4fb8a8',
  orphan: '#9b7bc4',
};

function makeGraph() {
  const rand = (s => () => (s = Math.imul(s ^ (s >>> 15), s | 1), ((s ^ (s >>> 7)) >>> 0) / 4294967296))(20260802);

  const hubs = [
    { id: 'core-api',  x: 300, y: 240 },
    { id: 'files',     x: 520, y: 160 },
    { id: 'worker',    x: 700, y: 300 },
    { id: 'app',       x: 430, y: 420 },
    { id: 'workflows', x: 660, y: 480 },
  ];
  const ABSORBED = 17, ORPHANS = 12;

  const nodes = [];
  hubs.forEach((h, i) => nodes.push({ ...h, state: 'hub', tx: h.x, ty: h.y, r: 15, hub: i }));

  for (let i = 0; i < ABSORBED; i++) {
    const hub = hubs[i % hubs.length];
    nodes.push({
      id: `svc-${String(i + 1).padStart(2, '0')}`,
      x: 80 + rand() * (W - 160),
      y: 60 + rand() * (H - 120),
      tx: hub.x, ty: hub.y, state: 'live', r: 6,
    });
  }
  for (let i = 0; i < ORPHANS; i++) {
    nodes.push({
      id: `job-${String(i + 1).padStart(2, '0')}`,
      x: 80 + rand() * (W - 160),
      y: 60 + rand() * (H - 120),
      tx: null, ty: null, state: 'orphan', r: 5,
    });
  }

  const edges = [];
  nodes.forEach((n, i) => {
    if (n.state === 'hub') return;
    const links = n.state === 'orphan' ? 2 : 3;
    for (let k = 0; k < links; k++) {
      const j = Math.floor(rand() * nodes.length);
      if (j !== i) edges.push({ a: i, b: j, state: n.state });
    }
  });
  [[0, 1], [0, 3], [0, 2], [2, 4], [3, 4]].forEach(([a, b]) => edges.push({ a, b, state: 'hub' }));

  return { nodes, edges };
}

/** t: 0 = inventario denso · 0.5 = se apaga lo que sobra · 1 = sistema propuesto */
function render({ nodes, edges }, t, caption) {
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp01 = v => Math.min(1, Math.max(0, v));

  // Fase de migración: entre 0.35 y 0.85 del recorrido.
  const migrate = clamp01((t - 0.35) / 0.5);
  const orphanFade = 1 - clamp01(t / 0.4);
  const liveFade = 1 - clamp01((t - 0.6) / 0.3);
  const hubEdge = clamp01((t - 0.75) / 0.25);
  const hubScale = lerp(1, 1.25, clamp01((t - 0.75) / 0.25));

  const pos = n => n.state === 'live'
    ? { x: lerp(n.x, n.tx, migrate), y: lerp(n.y, n.ty, migrate) }
    : { x: n.x, y: n.y };

  const parts = [`<rect width="${W}" height="${H}" fill="${C.bg}"/>`];

  for (const e of edges) {
    const a = pos(nodes[e.a]), b = pos(nodes[e.b]);
    let stroke = C.borderStrong, op = 0.5 * (1 - clamp01((t - 0.45) / 0.3)), sw = 1;
    if (e.state === 'orphan') { stroke = C.orphan; op = 0.4 * orphanFade; }
    if (e.state === 'hub')    { stroke = C.live;   op = 0.9 * hubEdge; sw = 1.5; }
    if (op <= 0.01) continue;
    parts.push(`<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${stroke}" stroke-width="${sw}" opacity="${op.toFixed(2)}"/>`);
  }

  for (const n of nodes) {
    const p = pos(n);
    let op = 1, stroke = C.live, fill = C.surfaceRaised, r = n.r, labelFill = C.textDim, fs = 9;
    if (n.state === 'orphan') { stroke = C.orphan; op = orphanFade; r = n.r * lerp(1, 0.4, 1 - orphanFade); }
    if (n.state === 'live')   { op = liveFade; }
    if (n.state === 'hub')    { stroke = C.signal; fill = C.surface; r = n.r * hubScale; labelFill = C.text; fs = 11; }
    if (op <= 0.01) continue;

    parts.push(`<g opacity="${op.toFixed(2)}"><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="${n.state === 'hub' ? 1.25 : 1.25}"/><text x="${p.x.toFixed(1)}" y="${(p.y + r + 9).toFixed(1)}" font-family="ui-monospace, monospace" font-size="${fs}" letter-spacing="0.8" fill="${labelFill}" text-anchor="middle">${n.id}</text></g>`);
  }

  const shown = nodes.filter(n => (n.state === 'hub') || (n.state === 'orphan' && orphanFade > 0.01) || (n.state === 'live' && liveFade > 0.01)).length;
  parts.push(`<text x="32" y="${H - 54}" font-family="ui-monospace, monospace" font-size="13" letter-spacing="2" fill="${C.text}">${String(shown).padStart(2, '0')} COMPONENTES</text>`);
  parts.push(`<text x="32" y="${H - 30}" font-family="ui-monospace, monospace" font-size="11" letter-spacing="1.5" fill="${C.signal}">${caption}</text>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${parts.join('')}</svg>`;
}

const graph = makeGraph();
mkdirSync(outDir, { recursive: true });

const frames = [
  [0.00, 'FASE 1 — INVENTARIO', 'graph-01-dense.svg'],
  [0.50, 'FASE 2 — SE APAGA LO QUE SOBRA', 'graph-02-pruning.svg'],
  [1.00, 'FASE 3 — SISTEMA PROPUESTO', 'graph-03-resolved.svg'],
];

for (const [t, caption, file] of frames) {
  writeFileSync(join(outDir, file), render(graph, t, caption), 'utf8');
  console.log(`[snapshot] ${file}  (t=${t})`);
}
