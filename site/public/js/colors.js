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
  applyTheme('#111111', '#f0f0f0', '#f0f0f0');

  // ── Cinematic Preloader ──────────────────────────────────────────────────
  const preloadEl  = document.getElementById('preload');
  const counterEl  = document.getElementById('preload-counter');
  const lineFill   = document.getElementById('preload-line-fill');

  let currentPct = 0;
  let rafId      = null;

  // Smooth counter: lerp toward target, update DOM each RAF frame
  let targetPct = 0;
  function tickCounter() {
    if (currentPct < targetPct) {
      currentPct = Math.min(targetPct, currentPct + Math.max(0.6, (targetPct - currentPct) * 0.08));
    }
    const display = Math.floor(currentPct);
    if (counterEl) {
      counterEl.textContent = String(display).padStart(3, '0');
    }
    if (lineFill) {
      lineFill.style.width = `${currentPct}%`;
    }
    if (currentPct < 100) {
      rafId = requestAnimationFrame(tickCounter);
    } else {
      // Counter reached 100 — trigger exit after a beat
      setTimeout(exitPreload, 320);
    }
  }
  rafId = requestAnimationFrame(tickCounter);

  function setProgress(percent) {
    targetPct = Math.min(100, Math.max(targetPct, percent));
  }

  function exitPreload() {
    if (!preloadEl) return;
    preloadEl.classList.add('preload--done');

    // GSAP slide-up exit (if available), otherwise instant hide
    if (typeof gsap !== 'undefined') {
      gsap.to(preloadEl, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power3.inOut',
        onComplete: () => { preloadEl.style.display = 'none'; },
      });
    } else {
      preloadEl.style.display = 'none';
    }
  }

  function onLoadDone() {
    setProgress(100);
    // Let counter naturally tick to 100, then exitPreload fires
  }

  const heroViewer = document.querySelector('#model-viewer');
  if (heroViewer) {
    heroViewer.addEventListener('progress', (evt) => {
      const total = evt.detail?.totalProgress ?? 0;
      setProgress(total * 100);
      if (total >= 1) onLoadDone();
    });
    heroViewer.addEventListener('load', onLoadDone);
  } else {
    // No model-viewer — fast-forward to done
    targetPct = 100;
  }

  // Fallback: force complete after 9 s
  setTimeout(() => {
    if (preloadEl && !preloadEl.classList.contains('preload--done')) {
      setProgress(100);
    }
  }, 9_000);

  // ── Theme switcher (vanilla JS — no jQuery) ──────────────────────────────
  // Buttons use data-bg / data-text / data-contrast attributes (set in HTML).
  // #theme-overlay flashes black during the color swap for a cinematic cut.
  const themeOverlay = document.getElementById('theme-overlay');

  function flashAndApply(bg, text, contrast) {
    if (!themeOverlay) {
      applyTheme(bg, text, contrast);
      return;
    }
    // Fade in
    themeOverlay.style.opacity = '1';
    setTimeout(() => {
      applyTheme(bg, text, contrast);
      // Fade out after variables applied
      themeOverlay.style.opacity = '0';
    }, 150);
  }

  document.querySelectorAll('.swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bg       = btn.dataset.bg       ?? '#111111';
      const text     = btn.dataset.text     ?? '#F1F4FF';
      const contrast = btn.dataset.contrast ?? '#F1F4FF';
      flashAndApply(bg, text, contrast);
    });
  });

})();
