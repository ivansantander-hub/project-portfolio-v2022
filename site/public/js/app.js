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

  // ── Easter egg — FLACKO / TESTING ──────────────────────────────────────
  //  Hidden feature triggered by clicking "Design & code" in footer.
  //  1. Hover scramble hint on trigger link
  //  2. Glitch modal with flacko-hero + ASAP images + RGB split
  //  3. Music starts (Praise the Lord, ~78 BPM)
  //  4. Site-wide beat-synced glitch: ASAP images flash over product cards & 3D models
  //  5. TESTING color themes + audio indicator unlocked
  //  6. Deactivates when user switches to normal theme (model/text/music revert)
  //
  function setupEasterEgg() {
    var trigger = document.getElementById('ee-trigger');
    var modal   = document.getElementById('ee-modal');
    if (!trigger || !modal) return;

    var activated     = false;  // clicked once — can't re-trigger without reload
    var testingActive = false;  // currently in TESTING mode (false after deactivate)
    var ctx       = null;
    var gain      = null;
    var source    = null;
    var analyser  = null;
    var muted     = false;
    var VOLUME    = 0.15;
    var muteBtn   = document.getElementById('mute-toggle');
    var beatRaf   = 0;

    // Pool of ASAP images for glitch flashes
    var ASAP_IMGS = [
      'img/media/asap-1.webp', 'img/media/asap-2.webp', 'img/media/asap-3.webp',
      'img/media/asap-4.webp', 'img/media/asap-5.webp', 'img/media/asap-6.webp',
      'img/media/asap-7.webp', 'img/media/asap-8.webp', 'img/media/asap-9.webp',
      'img/media/asap-10.webp', 'img/media/flacko-hero.webp'
    ];

    // Glitch targets (product cards + 3D models)
    var glitchTargets = [];

    // Store originals for restoration
    var originalHeroHTML  = '';
    var originalTicker    = '';
    var originalBanners   = [];

    // Preload images
    ASAP_IMGS.forEach(function(src) {
      var img = new Image();
      img.src = src;
    });

    // ── Hover scramble on trigger ─────────────────────────────────
    var SCRAMBLE_WORDS = [
      'TESTING', 'FLACKO', 'PRAISE THE LORD', 'A$AP FOREVER',
      'FUKK SLEEP', 'DISTORTED RECORDS', 'KID$ TURNED OUT FINE',
      'HUN43RD', 'LAB RAT', 'LORD PRETTY FLACKO JODYE II', 'A$AP MOB'
    ];
    var triggerOriginalText = trigger.textContent;
    var scrambleInterval = null;

    trigger.addEventListener('mouseenter', function() {
      if (activated) return;
      trigger.classList.add('ee-trigger-hover');
      scrambleInterval = setInterval(function() {
        trigger.textContent = SCRAMBLE_WORDS[Math.floor(Math.random() * SCRAMBLE_WORDS.length)];
      }, 100);
    });

    trigger.addEventListener('mouseleave', function() {
      if (activated) return;
      trigger.classList.remove('ee-trigger-hover');
      clearInterval(scrambleInterval);
      trigger.textContent = triggerOriginalText;
    });

    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      if (activated) return;
      activated = true;
      clearInterval(scrambleInterval);
      trigger.classList.remove('ee-trigger-hover');
      trigger.textContent = triggerOriginalText;
      openModal();
    });

    // ── Modal ──────────────────────────────────────────────────────────
    function openModal() {
      modal.classList.add('ee-open');

      if (typeof gsap !== 'undefined') {
        var tl = gsap.timeline();
        tl.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.06 })
          .to(modal, { opacity: 0, duration: 0.04 })
          .to(modal, { opacity: 1, duration: 0.06 })
          .to(modal, { opacity: 0, duration: 0.03 })
          .to(modal, { opacity: 1, duration: 0.08 })
          .fromTo('.ee-cover',
            { scale: 1.6, opacity: 0, filter: 'blur(30px)' },
            { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' },
            0.3
          )
          .fromTo('.ee-img-flash',
            { opacity: 0, scale: 1.3 },
            { opacity: 1, scale: 1, duration: 0.15, stagger: { each: 0.08, from: 'random' }, ease: 'none' },
            0.5
          )
          .to('.ee-img-flash',
            { opacity: 0, duration: 0.12, stagger: { each: 0.06, from: 'random' } },
            0.8
          )
          .fromTo('.ee-text',
            { yPercent: 80, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
            0.7
          )
          .fromTo('.ee-hint',
            { opacity: 0 },
            { opacity: 1, duration: 0.6 },
            1.6
          );
      }

      startMusic();

      setTimeout(function() {
        modal.addEventListener('click', closeModal);
      }, 900);
    }

    function closeModal() {
      modal.removeEventListener('click', closeModal);

      if (typeof gsap !== 'undefined') {
        gsap.to(modal, {
          opacity: 0, duration: 0.25, ease: 'power2.in',
          onComplete: function() {
            modal.classList.remove('ee-open');
            modal.style.opacity = '';
            unlockTestingMode();
          }
        });
      } else {
        modal.classList.remove('ee-open');
        unlockTestingMode();
      }
    }

    // ── TESTING site takeover ─────────────────────────────────────────
    function transformSiteTesting() {
      // Save originals before replacing
      var titleEl = document.querySelector('.title-banner');
      if (titleEl) originalHeroHTML = titleEl.innerHTML;

      var firstSlide = document.querySelector('.slide');
      if (firstSlide) originalTicker = firstSlide.textContent;

      var subBanners = document.querySelectorAll('.sub-banner');
      subBanners.forEach(function(banner) {
        var t1 = banner.querySelector('.projects-title-1');
        var t2 = banner.querySelector('.projects-title-2');
        originalBanners.push({
          t1: t1 ? t1.textContent : '',
          t2: t2 ? t2.textContent : ''
        });
      });

      // 1. Hero headline
      if (titleEl) titleEl.innerHTML = '<span>I</span> praise the lord';

      // 2. Header ticker
      var slides = document.querySelectorAll('.slide');
      var tickerText = ' TSTNG | FLACKO | PRAISE THE LORD | DISTORTED RECORDS | A$AP FOREVER | KID$ TURNED OUT FINE | LAB RAT | ';
      slides.forEach(function(s) { s.textContent = tickerText; });

      // 3. Sub-banner text — album tracks + iconic phrases
      var TESTING_BANNERS = [
        { t1: 'TESTING', t2: 'PRAISE THE LORD' },
        { t1: 'DISTORTED RECORDS', t2: 'FLACKO' },
        { t1: 'A$AP FOREVER', t2: 'LORD PRETTY FLACKO JODYE II' },
        { t1: 'FUKK SLEEP', t2: 'KID$ TURNED OUT FINE' },
        { t1: 'LAB RAT', t2: 'HUN43RD' },
        { t1: 'TESTING', t2: 'A$AP MOB' }
      ];
      subBanners.forEach(function(banner, i) {
        var pair = TESTING_BANNERS[i % TESTING_BANNERS.length];
        var t1s = banner.querySelectorAll('.projects-title-1');
        var t2s = banner.querySelectorAll('.projects-title-2');
        var t1Fill = (pair.t1 + ' \u00A0\u00A0\u00A0 ').repeat(20);
        var t2Fill = (pair.t2 + ' \u00A0\u00A0\u00A0 ').repeat(20);
        t1s.forEach(function(el) { el.textContent = t1Fill; });
        t2s.forEach(function(el) { el.textContent = t2Fill; });
      });

      // 4. Swap hero 3D model to ASAP version
      var heroModel = document.getElementById('model-viewer');
      if (heroModel) {
        heroModel.setAttribute('src', 'models-3d/rhetorician_asap/scene.gltf');
        heroModel.setAttribute('ios-src', 'models-3d/rhetorician_asap/Rhetorician.usdz');
      }

      // 5. Collect glitch targets (product images + project 3D models)
      glitchTargets = Array.from(document.querySelectorAll(
        '.app .card-portafolio-app, .app .card-portafolio-web-slide, .app .model-3d'
      ));

      testingActive = true;
    }

    function revertSiteTesting() {
      testingActive = false;

      // Restore hero headline
      var titleEl = document.querySelector('.title-banner');
      if (titleEl && originalHeroHTML) titleEl.innerHTML = originalHeroHTML;

      // Restore ticker
      var slides = document.querySelectorAll('.slide');
      if (originalTicker) slides.forEach(function(s) { s.textContent = originalTicker; });

      // Restore sub-banners
      var subBanners = document.querySelectorAll('.sub-banner');
      subBanners.forEach(function(banner, i) {
        if (!originalBanners[i]) return;
        banner.querySelectorAll('.projects-title-1').forEach(function(el) {
          el.textContent = originalBanners[i].t1;
        });
        banner.querySelectorAll('.projects-title-2').forEach(function(el) {
          el.textContent = originalBanners[i].t2;
        });
      });

      // Restore hero model
      var heroModel = document.getElementById('model-viewer');
      if (heroModel) {
        heroModel.setAttribute('src', 'models-3d/rhetorician/scene.gltf');
        heroModel.setAttribute('ios-src', 'models-3d/rhetorician/Rhetorician.usdz');
      }

      glitchTargets = [];
    }

    // ── TESTING mode activation ────────────────────────────────────────
    function unlockTestingMode() {
      document.body.classList.add('ee-active');

      var root    = document.documentElement;
      var overlay = document.getElementById('theme-overlay');
      if (overlay) overlay.style.opacity = '1';

      setTimeout(function() {
        root.style.setProperty('--background', '#0a0a0a');
        root.style.setProperty('--color-text', '#C8A82A');
        root.style.setProperty('--contrast', '#C8A82A');
        if (overlay) overlay.style.opacity = '0';
      }, 150);

      transformSiteTesting();
      createGlitchOverlay();
      startBeatGlitch();
    }

    // ── Deactivate TESTING mode (normal swatch click) ─────────────────
    function deactivateTestingMode() {
      if (!testingActive) return;

      // Stop music with fade
      if (gain && ctx) {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      }
      setTimeout(function() {
        if (source) try { source.stop(); } catch (e) {}
        if (ctx) try { ctx.close(); } catch (e) {}
        ctx = null; gain = null; source = null; analyser = null;
      }, 500);

      // Stop beat loop
      cancelAnimationFrame(beatRaf);

      // Remove glitch overlay
      if (glitchEl) { glitchEl.remove(); glitchEl = null; glitchImg = null; }

      // Remove ee-active
      document.body.classList.remove('ee-active');

      // Revert all content
      revertSiteTesting();
    }

    // Listen for normal (non-TESTING) swatch clicks
    document.querySelectorAll('.color-1, .color-2').forEach(function(btn) {
      btn.addEventListener('click', deactivateTestingMode);
    });

    // ── Site-wide glitch overlay ────────────────────────────────────────
    var glitchEl = null;
    var glitchImg = null;

    function createGlitchOverlay() {
      glitchEl = document.createElement('div');
      glitchEl.className = 'ee-site-glitch';
      glitchEl.setAttribute('aria-hidden', 'true');
      glitchImg = document.createElement('div');
      glitchImg.className = 'ee-site-glitch-img';
      glitchEl.appendChild(glitchImg);
      document.body.appendChild(glitchEl);
    }

    // ── Per-element glitch (fixed-position over product cards & models) ──
    function flashElementGlitch(target) {
      var rect = target.getBoundingClientRect();
      // Skip elements not in viewport
      if (rect.bottom < 0 || rect.top > window.innerHeight || rect.width === 0) return;

      var src = ASAP_IMGS[Math.floor(Math.random() * ASAP_IMGS.length)];
      var div = document.createElement('div');
      div.className = 'ee-element-glitch ee-el-flash';
      div.style.backgroundImage = 'url(' + src + ')';
      div.style.top    = rect.top + 'px';
      div.style.left   = rect.left + 'px';
      div.style.width  = rect.width + 'px';
      div.style.height = rect.height + 'px';
      document.body.appendChild(div);

      setTimeout(function() { div.remove(); }, 150);
    }

    function flashGlitch() {
      if (!glitchEl || muted || !testingActive) return;

      // Global overlay flash
      var src = ASAP_IMGS[Math.floor(Math.random() * ASAP_IMGS.length)];
      var top = Math.random() * 70;
      var left = Math.random() * 60;
      var size = 15 + Math.random() * 25;
      var skew = -8 + Math.random() * 16;

      glitchImg.style.backgroundImage = 'url(' + src + ')';
      glitchImg.style.top       = top + 'vh';
      glitchImg.style.left      = left + 'vw';
      glitchImg.style.width     = size + 'vw';
      glitchImg.style.height    = size + 'vw';
      glitchImg.style.transform = 'skewX(' + skew + 'deg)';

      glitchEl.classList.add('ee-flash-active');
      setTimeout(function() {
        glitchEl.classList.remove('ee-flash-active');
      }, 80 + Math.random() * 60);

      // Per-element: flash 2-4 product cards / 3D models
      if (glitchTargets.length > 0) {
        var count = 2 + Math.floor(Math.random() * 3);
        for (var j = 0; j < count; j++) {
          var idx = Math.floor(Math.random() * glitchTargets.length);
          flashElementGlitch(glitchTargets[idx]);
        }
      }
    }

    // ── Beat-synced glitch (Praise the Lord ~78 BPM) ───────────────────
    var BPM = 78;
    var BEAT_MS = Math.round(60000 / BPM);
    var lastBeat = 0;
    var freqData = null;
    var prevEnergy = 0;

    function startBeatGlitch() {
      if (analyser && freqData) {
        function tick() {
          if (!testingActive) return;
          beatRaf = requestAnimationFrame(tick);
          analyser.getByteFrequencyData(freqData);
          var energy = 0;
          for (var i = 0; i < 8; i++) energy += freqData[i];
          energy /= 8;
          var now = performance.now();
          if (energy > 160 && energy - prevEnergy > 30 && now - lastBeat > BEAT_MS * 0.6) {
            lastBeat = now;
            flashGlitch();
          }
          prevEnergy = energy * 0.7 + prevEnergy * 0.3;
        }
        tick();
      } else {
        function timerBeat() {
          if (!testingActive) return;
          flashGlitch();
          var jitter = BEAT_MS + (Math.random() - 0.5) * 200;
          if (Math.random() < 0.35) jitter += BEAT_MS;
          setTimeout(timerBeat, jitter);
        }
        setTimeout(timerBeat, BEAT_MS);
      }
    }

    // ── Music ──────────────────────────────────────────────────────────
    function startMusic() {
      if (typeof AudioContext === 'undefined' && typeof window.webkitAudioContext === 'undefined') return;

      ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume();

      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      freqData = new Uint8Array(analyser.frequencyBinCount);

      fetch('audio/easter-egg.mp3')
        .then(function(r) { return r.arrayBuffer(); })
        .then(function(b) { return ctx.decodeAudioData(b); })
        .then(function(buffer) {
          source = ctx.createBufferSource();
          source.buffer = buffer;
          source.loop = true;

          gain = ctx.createGain();
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 2);

          source.connect(gain);
          gain.connect(analyser);
          analyser.connect(ctx.destination);
          source.start(0);
        })
        .catch(function() {});
    }

    // Tab visibility
    document.addEventListener('visibilitychange', function() {
      if (!ctx || !gain || muted || !testingActive) return;
      var t = ctx.currentTime;
      if (document.hidden) {
        gain.gain.linearRampToValueAtTime(0, t + 0.5);
      } else {
        ctx.resume();
        gain.gain.linearRampToValueAtTime(VOLUME, t + 1.5);
      }
    });

    // Mute toggle
    if (muteBtn) {
      muteBtn.addEventListener('click', function() {
        if (!testingActive) return;
        muted = !muted;
        muteBtn.setAttribute('aria-pressed', String(muted));
        muteBtn.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
        if (!gain) return;
        var t = ctx.currentTime;
        if (muted) {
          gain.gain.linearRampToValueAtTime(0, t + 0.3);
        } else {
          ctx.resume();
          gain.gain.linearRampToValueAtTime(VOLUME, t + 0.5);
        }
      });
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    window.scrollTo(0, 0);
    setupDragHints();
    setupDragScroll();
    setupEasterEgg();
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
