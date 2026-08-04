/**
 * palette-picker.js — selector de paleta en vivo.
 *
 * Sirve para elegir la dirección de color viéndola en el sitio real y no en un
 * swatch. NO se incluye en el build salvo que se pida explícitamente:
 *
 *   PALETTE_PICKER=1 pnpm dev
 *
 * Sin esa variable, `site.config.mjs` no inyecta el <script> y este archivo
 * nunca se descarga. Por eso puede quedarse en el repo sin coste.
 *
 * Mientras está activo, su elección (localStorage) manda sobre la paleta
 * configurada — de eso se trata. Al desactivarlo vuelve a mandar site.config.
 */
(() => {
  const KEY = 'is-palette';
  const root = document.documentElement;

  const PALETTES = [
    { id: 'chartreuse',  label: 'Chartreuse',  swatch: '#cff32b' },
    { id: 'vermilion',   label: 'Bermellón',   swatch: '#e5322d' },
    { id: 'ultramarine', label: 'Ultramar',    swatch: '#2b4cff' },
    { id: 'copper',      label: 'Cobre',       swatch: '#d2622a' },
  ];

  const stored = (() => {
    try { return localStorage.getItem(KEY); } catch { return null; }
  })();
  const current = PALETTES.some(p => p.id === stored) ? stored : 'chartreuse';
  root.dataset.palette = current;

  const bar = document.createElement('div');
  bar.className = 'palette-picker';
  bar.innerHTML = `
    <span class="palette-picker__label">Paleta · temporal</span>
    <div class="palette-picker__swatches" role="radiogroup" aria-label="Paleta de color">
      ${PALETTES.map(p => `
        <button type="button" role="radio" data-palette-id="${p.id}"
          aria-checked="${p.id === current}" aria-label="${p.label}"
          title="${p.label}" style="--sw:${p.swatch}"></button>`).join('')}
    </div>
    <span class="palette-picker__name">${PALETTES.find(p => p.id === current).label}</span>`;

  const mount = () => {
    document.body.appendChild(bar);

    bar.addEventListener('click', e => {
      const btn = e.target.closest('[data-palette-id]');
      if (!btn) return;
      const id = btn.dataset.paletteId;

      root.dataset.palette = id;
      try { localStorage.setItem(KEY, id); } catch { /* modo privado */ }

      bar.querySelectorAll('[data-palette-id]').forEach(b =>
        b.setAttribute('aria-checked', String(b.dataset.paletteId === id)));
      bar.querySelector('.palette-picker__name').textContent =
        PALETTES.find(p => p.id === id).label;
    });
  };

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
