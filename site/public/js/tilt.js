/**
 * tilt.js
 * Subtle 3D perspective tilt on project cards (.app article).
 * Pure JS mousemove — no library dependency.
 *
 * Max tilt: ±6deg on each axis (intentionally gentle for portfolio context)
 * Reset: smooth spring-like CSS transition on mouseleave
 */

(function () {
  'use strict';

  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(min-width: 621px)').matches) return;

  const MAX_TILT = 6;       // degrees
  const RESET_MS = '600ms'; // CSS transition for smooth return

  function initTilt(card) {
    const inner = card.querySelector('.content');
    if (!inner) return;

    // Preserve existing transition; add perspective on parent
    card.style.perspective = '1000px';

    inner.style.transition    = `transform ${RESET_MS} cubic-bezier(0.23,1,0.32,1)`;
    inner.style.transformStyle = 'preserve-3d';
    inner.style.willChange    = 'transform';

    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 → 0.5
      const y      = (e.clientY - rect.top)  / rect.height - 0.5;
      const rotateY =  x * MAX_TILT * 2;
      const rotateX = -y * MAX_TILT;

      // Disable transition during active move for immediate response
      inner.style.transition = 'none';
      inner.style.transform  =
        `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.018,1.018,1.018)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transition = `transform ${RESET_MS} cubic-bezier(0.23,1,0.32,1)`;
      inner.style.transform  = 'rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    });

    // Pause tilt during scroll to avoid visual jitter
    let scrollTimer;
    window.addEventListener('scroll', () => {
      inner.style.transition = `transform ${RESET_MS} cubic-bezier(0.23,1,0.32,1)`;
      inner.style.transform  = 'rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { /* resume on next mousemove */ }, 150);
    }, { passive: true });
  }

  function setup() {
    document.querySelectorAll('.app').forEach(initTilt);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }

})();
