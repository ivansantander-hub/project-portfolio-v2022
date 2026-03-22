/**
 * app.js
 * Core page logic:
 *  - Scroll restoration to top on load
 *  - Hero entrance animation (3D model reveal)
 *  - Model-viewer drag hint auto-hide
 *  - Marquee text fill (replaces hardcoded repeated text in HTML)
 */

(function () {
  'use strict';

  // ── Constants ─────────────────────────────────────────────────────────────
  const HINT_HIDE_DELAY_MS = 5500;
  const MODEL_VIEWER_IDS   = [
    'model-viewer',
    'model-viewer-2',
    'model-viewer-3',
    'model-viewer-4',
    'model-viewer-5',
    'model-viewer-6',
  ];

  // ── Scroll restoration ────────────────────────────────────────────────────
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // ── Hero entrance animation ───────────────────────────────────────────────
  /** Reveal the hero model with a GSAP entrance, then remove the black overlay. */
  function runHeroEntrance() {
    const wrap = document.querySelector('.hero-model-wrap');
    if (!wrap || typeof gsap === 'undefined') return;

    const isMobile = window.matchMedia('(max-width: 620px)').matches;
    const fromVars = isMobile
      ? { opacity: 0, x: '4%',  scale: 0.94 }
      : { opacity: 0, x: '48%', scale: 0.88 };

    // Remove black overlay slightly before animation finishes (looks intentional)
    setTimeout(() => {
      clearTimeout(blackScreenTimer);
      removeBlackScreen();
    }, 1800);

    gsap.fromTo(wrap, fromVars, {
      opacity:   1,
      x:         0,
      scale:     1,
      duration:  2.4,
      delay:     1.8,
      ease:      'power2.out',
      overwrite: 'auto',
    });
  }

  // ── Black screen overlay ──────────────────────────────────────────────────
  function removeBlackScreen() {
    const el = document.querySelector('.black-screen');
    if (el) el.classList.remove('black-index');
  }

  // Fallback: always remove overlay after 4.2 s (covers slow model loads)
  const blackScreenTimer = setTimeout(removeBlackScreen, 4200);

  // ── Model viewer drag hints ───────────────────────────────────────────────
  function setupDragHints() {
    MODEL_VIEWER_IDS.forEach((id) => {
      const viewer = document.getElementById(id);
      if (!viewer) return;

      const container = viewer.closest('.model-viewer, .model-3d');
      const hint      = container?.querySelector('.model-viewer-hint');
      if (!hint) return;

      let hidden = false;

      function hideHint() {
        if (hidden) return;
        hidden = true;
        hint.classList.add('model-viewer-hint--hidden');
      }

      viewer.addEventListener('pointerdown', hideHint, { once: true });
      viewer.addEventListener('touchstart',  hideHint, { once: true });
      setTimeout(hideHint, HINT_HIDE_DELAY_MS);
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  // Marquee text is generated at build-time by mini-astro's repeatMarquee()
  // via <mini-include src="molecules/SubBanner" title1="..." title2="..." />
  // No runtime JS fill needed.
  function init() {
    window.scrollTo(0, 0);
    setupDragHints();
    runHeroEntrance();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
