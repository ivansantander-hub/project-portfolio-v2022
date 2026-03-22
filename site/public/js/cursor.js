/**
 * cursor.js
 * Custom cursor follower with:
 *  - Dot (8px): snaps exactly to mouse position each frame.
 *  - Ring (36px): lerped at factor 0.12 — smooth trailing effect.
 *  - Hover: ring grows, dot vanishes.
 *  - Click: ring squish + dot pulse + subtle audio tick.
 *  - Magnetic: elements with .magnetic class pull ring toward them.
 *  - Touch guard: no-op on touch-only devices.
 *
 * WHY scale is in the JS transform string (not CSS individual scale:):
 *   CSS individual `scale` is applied AFTER `transform` but still uses the
 *   element's layout transform-origin (0,0 in viewport for this fixed element).
 *   That causes the ring to scale TOWARD the viewport origin, not toward the
 *   cursor — resulting in a huge position jump on hover/click.
 *   Fix: keep scale inside the `transform` value so it always pivots at cursor.
 *
 * Requires GSAP (loaded before this script) for magnetic easing.
 */

(function () {
  'use strict';

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!window.matchMedia('(pointer: fine)').matches) return;
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
  const LERP       = 0.12;
  const SCALE_LERP = 0.18;

  // Scale tracked in JS — applied inside transform string (pivot = cursor pos)
  let ringScaleT = 1,  ringScale = 1;
  let dotScaleT  = 1,  dotScale  = 1;

  // ── Click audio — short sine sweep (tasteful digital tick) ────────────────
  let audioCtx = null;
  function playClick() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const t    = audioCtx.currentTime;
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.065);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.085);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch (_) { /* audio not available — silent fallback */ }
  }

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
    // Dot: snaps to mouse, lerped scale
    dotScale += (dotScaleT - dotScale) * SCALE_LERP;
    dot.style.transform =
      `translate(${mouseX}px, ${mouseY}px) scale(${dotScale.toFixed(3)})`;

    // Ring: lerped position AND scale — both inside same transform string
    // so scale pivots at the ring's current position (not the viewport origin)
    ringX    += (mouseX    - ringX)    * LERP;
    ringY    += (mouseY    - ringY)    * LERP;
    ringScale += (ringScaleT - ringScale) * SCALE_LERP;
    ring.style.transform =
      `translate(${ringX}px, ${ringY}px) scale(${ringScale.toFixed(3)})`;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ── Hover states ───────────────────────────────────────────────────────────
  const INTERACTIVE =
    'a, button, [role="button"], input, textarea, select, label, .swatch, model-viewer';

  function onEnter() { ringScaleT = 1.55; dotScaleT = 0;   }
  function onLeave() { ringScaleT = 1;    dotScaleT = 1;   }

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(INTERACTIVE)) onEnter();
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(INTERACTIVE)) onLeave();
  });

  // ── Click feedback ─────────────────────────────────────────────────────────
  document.addEventListener('mousedown', () => {
    ringScaleT = 0.62;   // ring squishes inward
    dotScaleT  = 2.0;    // dot pulses outward — counter-animation
    playClick();
  });

  document.addEventListener('mouseup', () => {
    // Brief spring overshoot, then settle to hover or default
    ringScaleT = 1.18;
    dotScaleT  = 0.7;
    setTimeout(() => {
      const over = document.querySelector(':hover');
      if (over && over.closest(INTERACTIVE)) {
        ringScaleT = 1.55; dotScaleT = 0;
      } else {
        ringScaleT = 1;    dotScaleT = 1;
      }
    }, 110);
  });

  // ── Magnetic elements ──────────────────────────────────────────────────────
  function setupMagnetic() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const dx   = e.clientX - (rect.left + rect.width  / 2);
        const dy   = e.clientY - (rect.top  + rect.height / 2);
        gsap.to(el, {
          x: dx * 0.35, y: dy * 0.35,
          duration: 0.35, ease: 'power2.out', overwrite: 'auto',
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0, y: 0,
          duration: 0.9, ease: 'elastic.out(1, 0.5)', overwrite: 'auto',
        });
      });
    });
  }

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
