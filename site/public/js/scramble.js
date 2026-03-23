/**
 * scramble.js
 * Character scramble reveal on scroll entry.
 *
 * Each character randomizes before resolving L→R over ~680ms.
 * Fires once per element via IntersectionObserver (never on scroll-back).
 *
 * Usage: add data-scramble to any element containing plain text content.
 * Preserves whitespace, punctuation, and special chars — only A-Z/0-9 scramble.
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const CHARS         = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const TOTAL_MS      = 680;
  const TOTAL_FRAMES  = Math.round(TOTAL_MS / 16); // ~60fps
  const RESOLVE_SPEED = 0.70; // chars begin resolving after 70% of total time

  function scrambleEl(el) {
    const original = el.textContent;
    if (!original.trim()) return;

    let frame = 0;

    function tick() {
      let out = '';
      for (let i = 0; i < original.length; i++) {
        const ch = original[i];
        // Preserve whitespace, punctuation, special chars as-is
        if (/[\s.,!?&;:'"—\-–/\\@#%()\[\]{}]/.test(ch)) {
          out += ch;
          continue;
        }
        // L→R resolve: each char resolves at its proportional time slot
        const resolveAt = Math.floor((i / original.length) * TOTAL_FRAMES * RESOLVE_SPEED);
        out += frame >= resolveAt
          ? ch
          : CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      el.textContent = out;
      frame++;
      if (frame <= TOTAL_FRAMES) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = original; // guarantee exact original on finish
      }
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      scrambleEl(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.55 });

  function init() {
    document.querySelectorAll('[data-scramble]').forEach((el) => observer.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
