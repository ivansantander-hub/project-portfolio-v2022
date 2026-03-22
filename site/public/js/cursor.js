/**
 * cursor.js
 * Custom cursor follower with:
 *  - Dot (8px): snaps exactly to mouse position each frame.
 *  - Ring (36px): lerped at factor 0.12 — smooth trailing effect.
 *  - Hover: CSS class swap on any interactive element.
 *  - Click: brief "squish" class on mousedown/up.
 *  - Magnetic: elements with .magnetic class pull ring toward them.
 *  - Touch guard: no-op on touch-only devices.
 *
 * Requires GSAP (loaded before this script) for magnetic easing.
 */

(function () {
  'use strict';

  // ── Guard: skip on touch-only devices ─────────────────────────────────────
  if (!window.matchMedia('(pointer: fine)').matches) return;

  // ── Guard: skip on reduced-motion ─────────────────────────────────────────
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  // ── State ──────────────────────────────────────────────────────────────────
  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  let ringX  = mouseX;
  let ringY  = mouseY;
  const LERP = 0.12;

  // ── Mouse move ─────────────────────────────────────────────────────────────
  let initialized = false;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!initialized) {
      initialized = true;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }
  });

  // ── RAF loop ───────────────────────────────────────────────────────────────
  function tick() {
    // Dot snaps exactly
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

    // Ring lerps
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ── Hover states ───────────────────────────────────────────────────────────
  const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, .swatch, model-viewer';

  function onEnter() {
    dot.classList.add('cursor-dot--hover');
    ring.classList.add('cursor-ring--hover');
  }
  function onLeave() {
    dot.classList.remove('cursor-dot--hover');
    ring.classList.remove('cursor-ring--hover');
  }

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(INTERACTIVE)) onEnter();
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(INTERACTIVE)) onLeave();
  });

  // ── Click feedback ─────────────────────────────────────────────────────────
  document.addEventListener('mousedown', () => {
    ring.classList.add('cursor-ring--click');
    dot.classList.add('cursor-dot--click');
  });
  document.addEventListener('mouseup', () => {
    ring.classList.remove('cursor-ring--click');
    dot.classList.remove('cursor-dot--click');
  });

  // ── Magnetic elements ──────────────────────────────────────────────────────
  // Elements with .magnetic class pull the cursor ring toward them.
  function setupMagnetic() {
    if (typeof gsap === 'undefined') return;

    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = e.clientX - cx;
        const dy   = e.clientY - cy;

        gsap.to(el, {
          x:        dx * 0.35,
          y:        dy * 0.35,
          duration: 0.35,
          ease:     'power2.out',
          overwrite: 'auto',
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x:        0,
          y:        0,
          duration: 0.9,
          ease:     'elastic.out(1, 0.5)',
          overwrite: 'auto',
        });
      });
    });
  }

  // Run magnetic setup after DOM is fully ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMagnetic);
  } else {
    setupMagnetic();
  }

  // ── Cursor visibility ──────────────────────────────────────────────────────
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

})();
