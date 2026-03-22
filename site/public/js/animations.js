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
      .to('.about-me', {
        x: '70vw',
        ease: 'none', duration: 2.6,
      }, 0.4)
      .to('.banner', {
        autoAlpha: 0,
        ease: 'none', duration: 0.9,
      }, '-=0.7');

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
