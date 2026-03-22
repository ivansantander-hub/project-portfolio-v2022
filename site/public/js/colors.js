(function () {
  'use strict';

  const root = document.documentElement;

  /** Apply CSS custom properties for the selected theme. */
  function applyTheme(bg, text, contrast) {
    root.style.setProperty('--background',   bg);
    root.style.setProperty('--color-text',   text);
    root.style.setProperty('--contrast',     contrast);
  }

  // ── Default theme (matches CSS :root fallback) ──────────────────────────
  applyTheme('#111111', '#F1F4FF', '#F1F4FF');

  // ── Preloader progress ───────────────────────────────────────────────────
  const preloadEl  = document.getElementById('preload');
  const barFill    = document.getElementById('preload-bar-fill');
  const percentEl  = document.getElementById('preload-percent');

  function setProgress(percent) {
    const p = Math.min(100, Math.max(0, Math.round(percent)));
    if (percentEl) percentEl.textContent = `${p}%`;
    if (barFill)   barFill.style.width   = `${p}%`;
  }

  function hidePreload() {
    if (!preloadEl) return;
    preloadEl.classList.add('preload--done');
    setTimeout(() => { preloadEl.style.display = 'none'; }, 520);
  }

  function onLoadDone() {
    setProgress(100);
    setTimeout(hidePreload, 380);
  }

  const heroViewer = document.querySelector('#model-viewer');
  if (heroViewer && barFill && percentEl) {
    heroViewer.addEventListener('progress', (evt) => {
      const total = evt.detail?.totalProgress ?? 0;
      setProgress(total * 100);
      if (total >= 1) onLoadDone();
    });
    heroViewer.addEventListener('load', onLoadDone);
  } else {
    onLoadDone();
  }

  // Fallback: hide loader after 10 s regardless of model state
  setTimeout(() => {
    if (preloadEl && !preloadEl.classList.contains('preload--done')) {
      hidePreload();
    }
  }, 10_000);

  // ── Theme switcher (vanilla JS — no jQuery) ──────────────────────────────
  // Buttons use data-bg / data-text / data-contrast attributes (set in HTML).
  document.querySelectorAll('.swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bg       = btn.dataset.bg       ?? '#111111';
      const text     = btn.dataset.text     ?? '#F1F4FF';
      const contrast = btn.dataset.contrast ?? '#F1F4FF';
      applyTheme(bg, text, contrast);
    });
  });

})();
