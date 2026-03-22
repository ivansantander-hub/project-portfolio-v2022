/**
 * app.js
 * Core page logic:
 *  - Scroll restoration to top on load
 *  - Hero entrance: word-by-word title reveal + model swoop
 *  - Model-viewer drag hint auto-hide
 *
 * Marquee text is generated at build-time by mini-astro's repeatMarquee().
 * No runtime JS fill needed.
 */

(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────────────────
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

  // ── Word-split utility ────────────────────────────────────────────────────
  /**
   * Wraps each word in an overflow-hidden container so GSAP can animate
   * words up from below the clip line (classic editorial reveal).
   *
   * Preserves child element nodes (e.g. <span>Hi.</span> keeps its styles).
   * Returns all .word-inner nodes for GSAP targeting.
   */
  function splitWordsForReveal(el) {
    const childNodes = Array.from(el.childNodes);
    el.innerHTML = '';

    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Split text nodes into individual words
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (/^\s+$/.test(part)) {
            el.appendChild(document.createTextNode(part));
          } else if (part) {
            el.appendChild(makeWordSpan(document.createTextNode(part)));
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Wrap the whole element as a single word unit (preserves inner styles)
        el.appendChild(makeWordSpan(node));
      }
    });

    return el.querySelectorAll('.word-inner');
  }

  function makeWordSpan(child) {
    const outer = document.createElement('span');
    outer.className = 'word-wrap';
    const inner = document.createElement('span');
    inner.className = 'word-inner';
    inner.appendChild(child);
    outer.appendChild(inner);
    return outer;
  }

  // ── Black screen overlay ──────────────────────────────────────────────────
  function removeBlackScreen() {
    const el = document.querySelector('.black-screen');
    if (el) el.classList.remove('black-index');
  }

  // Fallback: always remove overlay after 4.2 s (covers slow model loads)
  const blackScreenTimer = setTimeout(removeBlackScreen, 4200);

  // ── Hero entrance animation ───────────────────────────────────────────────
  function runHeroEntrance() {
    if (typeof gsap === 'undefined') return;

    const isMobile = window.matchMedia('(max-width: 620px)').matches;
    const wrap     = document.querySelector('.hero-model-wrap');
    const titleEl  = document.querySelector('.title-banner');

    // 1. Title: word-by-word reveal from below (overflow-clipped)
    //    Skips word split on reduced-motion (elements already visible).
    if (titleEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const words = splitWordsForReveal(titleEl);
      gsap.from(words, {
        yPercent:  115,
        autoAlpha: 0,
        duration:  1.15,
        stagger:   0.09,
        ease:      'power4.out',
        delay:     1.5,
      });
    }

    // 2. Hero model: swoop in from right edge + scale up
    if (wrap) {
      const fromVars = isMobile
        ? { autoAlpha: 0, x: '4%',  scale: 0.94 }
        : { autoAlpha: 0, x: '46%', scale: 0.86 };

      gsap.fromTo(wrap, fromVars, {
        autoAlpha: 1,
        x:         0,
        scale:     1,
        duration:  2.2,
        delay:     0.9,
        ease:      'power3.out',
        overwrite: 'auto',
      });
    }

    // 3. Remove overlay just before model animation ends (intentional reveal)
    setTimeout(() => {
      clearTimeout(blackScreenTimer);
      removeBlackScreen();
    }, 1700);
  }

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

  // ── Scroll progress bar ───────────────────────────────────────────────────
  function setupScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    function updateBar() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docH      = document.documentElement.scrollHeight - window.innerHeight;
      const pct       = docH > 0 ? (scrollTop / docH) * 100 : 0;
      bar.style.width = `${Math.min(100, pct)}%`;
    }

    window.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
  }

  // ── Section indicator ─────────────────────────────────────────────────────
  function setupSectionIndicator() {
    const textEl = document.getElementById('section-indicator-text');
    if (!textEl) return;

    const sections = [
      { el: document.querySelector('.banner'),         label: 'HOME'    },
      { el: document.querySelector('.about-section'),  label: 'ABOUT'   },
      { el: document.querySelector('.sub-banner'),     label: 'WORK'    },
      { el: document.querySelector('.app.be4care'),  label: 'BE4CARE'  },
      { el: document.querySelector('.app.be4tech'),  label: 'BE4TECH'  },
      { el: document.querySelector('.app.irocket'),  label: 'IROCKET'  },
      { el: document.querySelector('.app.qr-access'), label: 'NEWO'   },
      { el: document.querySelector('.app.learup'),   label: 'LEARUP'  },
      { el: document.querySelector('.contact'),  label: 'CONTACT'  },
    ].filter((s) => s.el !== null);

    if (sections.length === 0) return;

    let current = '';

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const match = sections.find((s) => s.el === entry.target);
          if (!match || match.label === current) return;
          current = match.label;
          textEl.style.opacity = '0';
          setTimeout(() => {
            textEl.textContent  = current;
            textEl.style.opacity = '';
          }, 180);
        });
      },
      { threshold: 0.25 }
    );

    sections.forEach((s) => obs.observe(s.el));
  }

  // ── Scroll CTA: hide after first meaningful scroll ─────────────────────────
  function setupScrollCta() {
    const cta = document.querySelector('.scroll-cta');
    if (!cta) return;

    function hide() {
      if (window.scrollY > 50) {
        cta.classList.add('scroll-cta--hidden');
        window.removeEventListener('scroll', hide);
      }
    }

    window.addEventListener('scroll', hide, { passive: true });
  }

  // ── Card gallery drag-to-scroll with momentum ──────────────────────────
  //  Mousedown captures start; mousemove translates scrollLeft.
  //  On mouseup, velocity is preserved and decays with friction (0.92).
  //  Touch scroll handled natively by overflow-x: auto.
  function setupDragScroll() {
    document.querySelectorAll('.card-scroll').forEach(function(el) {
      var dragging    = false;
      var startX      = 0;
      var scrollStart = 0;
      var velocity    = 0;
      var lastX       = 0;
      var lastT       = 0;
      var momentumRaf = 0;

      el.addEventListener('mousedown', function(e) {
        dragging    = true;
        startX      = e.clientX;
        lastX       = e.clientX;
        lastT       = performance.now();
        scrollStart = el.scrollLeft;
        velocity    = 0;
        cancelAnimationFrame(momentumRaf);
        el.classList.add('is-dragging');
        e.preventDefault();
      });

      window.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        var now = performance.now();
        var dx  = lastX - e.clientX;
        var dt  = now - lastT;
        if (dt > 0) velocity = dx / dt; // px/ms
        lastX = e.clientX;
        lastT = now;
        el.scrollLeft = scrollStart + (startX - e.clientX);
      });

      function stopDrag() {
        if (!dragging) return;
        dragging = false;
        el.classList.remove('is-dragging');
        // Apply momentum
        if (Math.abs(velocity) > 0.3) {
          var v = velocity * 16; // convert px/ms → px/frame
          (function coast() {
            v *= 0.92; // friction
            if (Math.abs(v) < 0.5) return;
            el.scrollLeft += v;
            momentumRaf = requestAnimationFrame(coast);
          })();
        }
      }
      window.addEventListener('mouseup',    stopDrag);
      window.addEventListener('mouseleave', stopDrag);
    });
  }

  // ── Lo-fi ambient music — CC0 track by Loyalty Freak Music ──────────────
  //  "I'm glad you are here with me" by Lack of Color / Loyalty Freak Music.
  //  CC0 public domain (archive.org). Loops at low volume (~4%).
  //  Fades in 4s on first user gesture. Fades out on tab hide.
  //  No SFX, no transitions — just the music setting the mood.
  //
  function setupScrollSound() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof AudioContext === 'undefined' && typeof window.webkitAudioContext === 'undefined') return;

    var ctx         = null;
    var ambientSrc  = null;
    var ambientGain = null;
    var VOLUME      = 0.04;

    function unlock() {
      if (ctx) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();

      fetch('audio/lofi-ambient.mp3')
        .then(function(r) { return r.arrayBuffer(); })
        .then(function(b) { return ctx.decodeAudioData(b); })
        .then(function(buffer) {
          ambientSrc = ctx.createBufferSource();
          ambientSrc.buffer = buffer;
          ambientSrc.loop = true;

          ambientGain = ctx.createGain();
          ambientGain.gain.setValueAtTime(0, ctx.currentTime);
          ambientGain.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 4);

          ambientSrc.connect(ambientGain);
          ambientGain.connect(ctx.destination);
          ambientSrc.start(0);
        })
        .catch(function() { /* audio not available — silent fallback */ });
    }

    document.addEventListener('mousedown',  unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('keydown',    unlock, { once: true });

    // Mute on tab hide, restore on show
    document.addEventListener('visibilitychange', function() {
      if (!ctx || !ambientGain) return;
      var t = ctx.currentTime;
      if (document.hidden) {
        ambientGain.gain.linearRampToValueAtTime(0, t + 0.5);
      } else {
        ctx.resume();
        ambientGain.gain.linearRampToValueAtTime(VOLUME, t + 1.5);
      }
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    window.scrollTo(0, 0);
    setupDragHints();
    setupDragScroll();
    setupScrollSound();
    runHeroEntrance();
    setupScrollProgress();
    setupSectionIndicator();
    setupScrollCta();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
