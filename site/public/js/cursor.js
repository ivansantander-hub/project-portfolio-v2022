/**
 * cursor.js
 * Custom cursor follower with:
 *  - Dot (8px): snaps exactly to mouse position each frame.
 *  - Ring (36px): lerped at factor 0.12 — smooth trailing effect.
 *  - Hover: ring grows, dot vanishes.
 *  - Click: ring squish + dot pulse + subtle audio tick.
 *  - Velocity stretch: ring stretches in movement direction at speed.
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

  // Velocity tracking for ring stretch
  let prevMouseX = mouseX;
  let prevMouseY = mouseY;
  let ringRotT   = 0, ringRot = 0;   // rotation target + current
  let ringStretchT = 1, ringStretch = 1; // scaleX stretch target + current

  // ── Click audio — real WAV file (Kenney CC0) ──────────────────────────────
  //  Uses click.wav from Kenney UI Audio pack — a subtle, physical click.
  //  Loaded once on first AudioContext unlock, then replayed from buffer.
  //  Meaning: tactile feedback — "you pressed something real."
  let audioCtx    = null;
  let clickBuffer = null;
  function playClick() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        fetch('audio/click.wav')
          .then(function(r) { return r.arrayBuffer(); })
          .then(function(b) { return audioCtx.decodeAudioData(b); })
          .then(function(buf) { clickBuffer = buf; })
          .catch(function() {});
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      if (!clickBuffer) return;
      var src  = audioCtx.createBufferSource();
      src.buffer = clickBuffer;
      var gain = audioCtx.createGain();
      gain.gain.value = 0.10;
      src.connect(gain);
      gain.connect(audioCtx.destination);
      src.start(0);
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

    // Ring: velocity-aware trail with directional stretch
    var dx = mouseX - prevMouseX;
    var dy = mouseY - prevMouseY;
    var speed = Math.sqrt(dx * dx + dy * dy);
    prevMouseX = mouseX;
    prevMouseY = mouseY;

    // Dynamic lerp: faster movement = longer trail (more lag)
    var dynamicLerp = speed > 8 ? 0.085 : LERP; // 0.085 vs default 0.12

    ringX += (mouseX - ringX) * dynamicLerp;
    ringY += (mouseY - ringY) * dynamicLerp;

    // Stretch in movement direction (max 1.35x at high speed)
    ringStretchT = 1 + Math.min(speed * 0.012, 0.35);
    ringStretch += (ringStretchT - ringStretch) * 0.14;

    // Rotate ring to face movement direction
    if (speed > 3) {
      ringRotT = Math.atan2(dy, dx) * (180 / Math.PI);
    }
    // Smooth rotation interpolation (handle 360° wrap)
    var rotDiff = ringRotT - ringRot;
    if (rotDiff > 180)  rotDiff -= 360;
    if (rotDiff < -180) rotDiff += 360;
    ringRot += rotDiff * 0.12;

    ringScale += (ringScaleT - ringScale) * SCALE_LERP;
    ring.style.transform =
      'translate(' + ringX + 'px, ' + ringY + 'px) rotate(' + ringRot.toFixed(1) + 'deg) scaleX(' + (ringScale * ringStretch).toFixed(3) + ') scaleY(' + ringScale.toFixed(3) + ')';

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
