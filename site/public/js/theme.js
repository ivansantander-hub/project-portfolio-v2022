/**
 * theme.js — alternancia de tema, sin dependencias.
 *
 * Por defecto se respeta la preferencia del sistema (tokens.css lo resuelve con
 * prefers-color-scheme). En cuanto el usuario elige, la elección manda y se
 * recuerda: data-theme en <html> gana sobre la media query.
 */
(() => {
  const KEY = 'is-theme';
  const root = document.documentElement;

  const stored = (() => {
    try { return localStorage.getItem(KEY); } catch { return null; }
  })();

  const systemLight = matchMedia('(prefers-color-scheme: light)');

  if (stored === 'light' || stored === 'dark') root.dataset.theme = stored;
  else delete root.dataset.theme;

  const current = () => root.dataset.theme || (systemLight.matches ? 'light' : 'dark');

  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const sync = () => btn.setAttribute('aria-pressed', String(current() === 'light'));
  sync();

  btn.addEventListener('click', () => {
    const next = current() === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch { /* modo privado */ }
    sync();
  });

  // Si el usuario nunca eligió, seguir al sistema cuando cambie.
  systemLight.addEventListener('change', () => { if (!root.dataset.theme) sync(); });
})();
