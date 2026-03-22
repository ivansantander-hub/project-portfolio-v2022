/**
 * animations.js
 * Cinematic GSAP + ScrollTrigger — inspired by GTA V & Awwwards.
 *
 * Principles:
 *  - Hero: pinned section with skewX + scale exit (cinematic wipe)
 *  - Sub-banners: per-trigger bidirectional parallax (counter-speed)
 *  - Projects: toggleActions (plays at own speed on trigger, not scrub-tied)
 *    → 3D model slides from left with scale; cards cascade up with stagger
 *  - Contact: clip-path + blur reveal for depth
 *  - GPU-only: transform / opacity / filter — no layout properties
 */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[animations] GSAP or ScrollTrigger not found — skipping.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── Easing tokens ──────────────────────────────────────────────────────────
  const EXPO_OUT  = 'expo.out';
  const POWER4    = 'power4.out';
  const POWER3    = 'power3.out';

  // ── Reduced-motion: skip all animations, reveal elements immediately ───────
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set([
      '.title-banner', '.model-viewer', '.about-me',
      '.gsap-2', '.gsap-3', '.gsap-4', '.gsap-5', '.gsap-6',
      '.contact-title-1', '.contact-title-2', '.aaron', '.footer-contact',
    ], { clearProps: 'all' });
    return;
  }

  const mm = gsap.matchMedia();

  // ══════════════════════════════════════════════════════════════════════════
  // DESKTOP  (>= 621 px)
  // ══════════════════════════════════════════════════════════════════════════
  mm.add('(min-width: 621px)', () => {

    // ── HERO: pinned cinematic exit ─────────────────────────────────────────
    //  scrub: 1.5  →  smooth 1.5 s lag behind scroll (more responsive than 5)
    //  skewX on title  →  GTA V–style velocity feel
    //  about-me slides across viewport while pinned, then banner fades
    const tlBanner = gsap.timeline({
      scrollTrigger: {
        trigger: '.banner',
        start:   'top top',
        end:     'bottom top',
        scrub:   1.5,
        pin:     true,
      },
    });

    tlBanner
      .to('.title-banner', {
        xPercent: 120, skewX: -8, autoAlpha: 0,
        ease: 'none', duration: 1.8,
      }, 0)
      .to('.model-viewer', {
        xPercent: 38, scale: 0.82, autoAlpha: 0,
        ease: 'none', duration: 2.2,
      }, 0)
      // .about-me slides to center and stays — acts as bridge to projects section.
      // Banner background stays opaque (no autoAlpha:0) → zero black gap.
      .to('.about-me', {
        x: '85vw',   // left(-50vw) + 85vw = 35vw left edge → 30vw wide = 50vw center ✓
        ease: 'none', duration: 2.4,
      }, 0.4);

    // ── SUB-BANNERS: per-trigger counter-speed parallax ────────────────────
    //  Each sub-banner gets its own ScrollTrigger (not one global trigger).
    //  title-1 slides right, title-2 slides left → professional depth effect.
    document.querySelectorAll('.sub-banner').forEach((el) => {
      const st = {
        trigger: el,
        start:   'top bottom',
        end:     'bottom top',
        scrub:   2,
      };
      gsap.to(el.querySelectorAll('.projects-title-1'), {
        x: '70vw', ease: 'none', scrollTrigger: st,
      });
      gsap.to(el.querySelectorAll('.projects-title-2'), {
        x: '-70vw', ease: 'none', scrollTrigger: st,
      });
    });

    // ── PROJECT SECTIONS: free-playing entrance ────────────────────────────
    //  NOT scrub — animation plays at its own designed speed when triggered.
    //  This is the Awwwards pattern: scroll triggers, animation plays freely.
    //
    //  3D model:  slides from left + scale up  (x-axis entrance)
    //  Cards:     cascade upward with stagger   (y-axis entrance)
    function revealProject(section, modelSel, cardSels) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start:   'top 78%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.from(modelSel, {
        autoAlpha: 0,
        xPercent:  -22,
        scale:     0.78,
        duration:  1.4,
        ease:      EXPO_OUT,
      });

      tl.from(cardSels, {
        autoAlpha: 0,
        yPercent:  65,
        scale:     0.88,
        duration:  1.0,
        stagger:   0.13,
        ease:      POWER4,
      }, '-=0.85');

      return tl;
    }

    revealProject('.be4care', '.gsap-2', [
      '.card-portafolio-be4care-1',
      '.card-portafolio-be4care-2',
      '.card-portafolio-be4care-3',
      '.card-portafolio-be4care-4',
    ]);
    revealProject('.be4tech', '.gsap-3', [
      '.card-portafolio-be4tech-1',
      '.card-portafolio-be4tech-2',
    ]);
    revealProject('.irocket', '.gsap-4', [
      '.card-portafolio-irocket-1',
      '.card-portafolio-irocket-2',
    ]);
    revealProject('.qr-access', '.gsap-5', [
      '.card-portafolio-qr-access-1',
    ]);
    revealProject('.learup', '.gsap-6', [
      '.card-portafolio-learup-1',
    ]);

    // ── CONTACT: blur + stagger reveal ─────────────────────────────────────
    //  Titles: skew + slide from left  →  directional weight
    //  Aaron quote: blur dissolve  →  depth / cinematic focus pull
    //  Footer: rise from below
    gsap.timeline({
      scrollTrigger: {
        trigger: '.contact',
        start:   'top 75%',
        toggleActions: 'play none none reverse',
      },
    })
      .from('.contact-title-1', {
        autoAlpha: 0, xPercent: -55, skewX: 6,
        duration: 1.1, ease: EXPO_OUT,
      })
      .from('.contact-title-2', {
        autoAlpha: 0, xPercent: -55, skewX: 6,
        duration: 1.2, ease: EXPO_OUT,
      }, '-=0.8')
      .from('.aaron', {
        autoAlpha: 0, yPercent: 35, filter: 'blur(8px)',
        duration: 1.3, ease: POWER4,
      }, '-=0.55')
      .from('.footer-contact', {
        autoAlpha: 0, yPercent: 22,
        duration: 1.0, ease: POWER4,
      }, '-=0.7');

    // ── COSMONAUT TRAVELER ────────────────────────────────────────────────────
    //  Fixed-size cosmonaut that journeys through the portfolio sections.
    //  Hero uses a different 3D model (rhetorician); this traveler appears
    //  naturally from the projects section — no hero sync needed.
    //
    //  camera-orbit: "azimuthal polar radius"
    //   az 0/360 = front   az 90 = right side   az -90/270 = left side  az 180 = back
    //   polar 90 = eye-level   polar 50 = looking DOWN on you   polar 110 = looking UP
    const travWrap = document.getElementById('traveler-wrap');
    const travMV   = document.getElementById('model-viewer-traveler');

    if (travWrap && travMV) {

      // ── Fixed travel dimensions (matches CSS) ────────────────────────────
      travWrap.style.width  = '280px';
      travWrap.style.height = '330px';

      // ── Camera orbit helper ──────────────────────────────────────────────
      const orbit = { az: 40, polar: 80 };
      function setOrbit() {
        travMV.setAttribute(
          'camera-orbit',
          `${orbit.az.toFixed(1)}deg ${orbit.polar.toFixed(1)}deg auto`
        );
      }

      // ── Parked off-screen — deep space, above-right ──────────────────────
      gsap.set(travWrap, { x: '78vw', y: '-22vh', scale: 0.28, rotation: 52, autoAlpha: 0 });

      // ── Journey through portfolio sections ───────────────────────────────
      //  scrub: 2.8  →  heavy inertia, "floating in zero gravity"
      //  Entrance is the first move: traveler swoops in from above-right
      //  as the user begins scrolling the projects section.
      gsap.timeline({
        scrollTrigger: {
          trigger: '.portafolio',
          start:   'top top',
          end:     'bottom bottom',
          scrub:   2.8,
        },
      })

        // ── Arrival ─ swoops in from deep space into BE4CARE corner ─────────
        .to(travWrap, { autoAlpha: 1, x: '67vw', y:  '5vh', scale: 0.90, rotation: -16, duration: 1.2 }, 0)
        .to(orbit,    { az:  80, polar: 72, onUpdate: setOrbit, duration: 1.2 }, 0)

        // ── BE4TECH ─ drifts left, peeks at the MacBook ─────────────────────
        .to(travWrap, { x:  '1vw', y: '42vh', scale: 0.74, rotation:  22, duration: 1.3 }, 1.4)
        .to(orbit,    { az: -55, polar: 90, onUpdate: setOrbit, duration: 1.3 }, 1.4)

        // ── iROCKET ─ rockets up-right, looks DOWN — mission control ────────
        .to(travWrap, { x: '63vw', y:  '0vh', scale: 1.12, rotation: -28, duration: 1.1 }, 2.9)
        .to(orbit,    { az:  18, polar: 50, onUpdate: setOrbit, duration: 1.1 }, 2.9)

        // ── QR ACCESS ─ swoops low-left, back view, scanning mode ────────────
        .to(travWrap, { x:  '1vw', y: '57vh', scale: 0.78, rotation:  15, duration: 1.3 }, 4.2)
        .to(orbit,    { az: 172, polar: 106, onUpdate: setOrbit, duration: 1.3 }, 4.2)

        // ── LEARUP ─ calm center drift, front view, clinical study ───────────
        .to(travWrap, { x: '50vw', y: '35vh', scale: 0.92, rotation:  -4, duration: 1.2 }, 5.7)
        .to(orbit,    { az:  40, polar: 82, onUpdate: setOrbit, duration: 1.2 }, 5.7)

        // ── Exit ─ launches into deep space ─────────────────────────────────
        .to(travWrap, {
          autoAlpha: 0, scale: 0.22,
          y: '-14vh', x: '80vw', rotation: 32,
          duration: 0.7,
        }, 7.1);
    }

    return () => ScrollTrigger.getAll().forEach((st) => st.kill());
  });

  // ══════════════════════════════════════════════════════════════════════════
  // MOBILE  (<= 620 px)
  // ══════════════════════════════════════════════════════════════════════════
  mm.add('(max-width: 620px)', () => {

    // Hero: vertical parallax (no pin on mobile — avoids touch conflicts)
    gsap.timeline({
      scrollTrigger: {
        trigger: '.banner',
        start:   'top top',
        end:     'bottom top',
        scrub:   true,
      },
    })
      .to('.title-banner', { yPercent: -16, autoAlpha: 0, ease: 'none', duration: 1 }, 0)
      .to('.model-viewer',  { yPercent:  -9,              ease: 'none', duration: 1 }, 0);

    // Sub-banners: lighter counter-parallax
    document.querySelectorAll('.sub-banner').forEach((el) => {
      const st = { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true };
      gsap.to(el.querySelectorAll('.projects-title-1'), { x: '45vw',  ease: 'none', scrollTrigger: st });
      gsap.to(el.querySelectorAll('.projects-title-2'), { x: '-45vw', ease: 'none', scrollTrigger: st });
    });

    // Project sections: same pattern, adapted for mobile stack layout
    const projects = [
      { sel: '.be4care',   model: '.gsap-2', cards: ['.card-portafolio-be4care-1', '.card-portafolio-be4care-2', '.card-portafolio-be4care-3', '.card-portafolio-be4care-4'] },
      { sel: '.be4tech',   model: '.gsap-3', cards: ['.card-portafolio-be4tech-1', '.card-portafolio-be4tech-2'] },
      { sel: '.irocket',   model: '.gsap-4', cards: ['.card-portafolio-irocket-1', '.card-portafolio-irocket-2'] },
      { sel: '.qr-access', model: '.gsap-5', cards: ['.card-portafolio-qr-access-1'] },
      { sel: '.learup',    model: '.gsap-6', cards: ['.card-portafolio-learup-1'] },
    ];

    projects.forEach(({ sel, model, cards }) => {
      gsap.timeline({
        scrollTrigger: { trigger: sel, start: 'top 88%', toggleActions: 'play none none reverse' },
      })
        .from(model, { autoAlpha: 0, yPercent: 20, scale: 0.88, duration: 0.9, ease: POWER3 })
        .from(cards,  { autoAlpha: 0, yPercent: 45, stagger: 0.1, duration: 0.8, ease: POWER3 }, '-=0.5');
    });

    // Contact
    gsap.timeline({
      scrollTrigger: { trigger: '.contact', start: 'top 82%', toggleActions: 'play none none reverse' },
    })
      .from('.contact-title-1', { autoAlpha: 0, xPercent: -28, duration: 0.85, ease: POWER3 })
      .from('.contact-title-2', { autoAlpha: 0, xPercent: -28, duration: 0.95, ease: POWER3 }, '-=0.55')
      .from('.aaron',           { autoAlpha: 0, yPercent: 25, filter: 'blur(6px)', duration: 0.85, ease: POWER3 }, '-=0.4')
      .from('.footer-contact',  { autoAlpha: 0, yPercent: 18, duration: 0.75, ease: POWER3 }, '-=0.45');

    return () => ScrollTrigger.getAll().forEach((st) => st.kill());
  });

})();
