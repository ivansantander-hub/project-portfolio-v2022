/**
 * visual-picker.js — selector en vivo de la pieza visual del hero.
 *
 * Mismo patrón que palette-picker.js: sirve para comparar las cuatro
 * variantes en el sitio real y decidir. NO se incluye en el build salvo que
 * se pida:
 *
 *   VISUAL_PICKER=1 pnpm dev
 *
 * Sin esa variable, site.config.mjs no inyecta el <script> y este archivo
 * nunca se descarga. Al desactivarlo vuelve a mandar HERO_VISUAL.
 */
(() => {
  const KEY = 'is-visual';
  const root = document.documentElement;

  const VARIANTES = [
    { id: 'texto',  label: 'Texto',   nota: 'tu nombre es la pieza: se distorsiona' },
    { id: 'topo',   label: 'Topo',    nota: 'curvas de nivel; el cursor levanta cresta' },
    { id: 'ascii',  label: 'ASCII',   nota: 'el campo cuantizado a glifos' },
    { id: 'malla',  label: 'Malla',   nota: 'plano en perspectiva que se aleja' },
  ];

  const guardado = (() => {
    try { return localStorage.getItem(KEY); } catch { return null; }
  })();
  const actual = VARIANTES.some(v => v.id === guardado) ? guardado : (root.dataset.visual || 'topo');
  root.dataset.visual = actual;

  const bar = document.createElement('div');
  bar.className = 'visual-picker';
  bar.innerHTML = `
    <span class="visual-picker__label">Hero · temporal</span>
    <div class="visual-picker__opciones" role="radiogroup" aria-label="Pieza visual del hero">
      ${VARIANTES.map(v => `
        <button type="button" role="radio" data-visual-id="${v.id}"
          aria-checked="${v.id === actual}" title="${v.nota}">${v.label}</button>`).join('')}
    </div>`;

  const montar = () => {
    document.body.appendChild(bar);
    bar.addEventListener('click', e => {
      const btn = e.target.closest('[data-visual-id]');
      if (!btn) return;
      const id = btn.dataset.visualId;
      root.dataset.visual = id;
      try { localStorage.setItem(KEY, id); } catch { /* modo privado */ }
      bar.querySelectorAll('[data-visual-id]').forEach(b =>
        b.setAttribute('aria-checked', String(b.dataset.visualId === id)));
    });
  };

  if (document.body) montar();
  else document.addEventListener('DOMContentLoaded', montar);
})();
