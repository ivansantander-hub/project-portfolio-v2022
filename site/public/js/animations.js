/**
 * animations.js
 * GSAP + ScrollTrigger — replaces gsap.js + gsap-lite.js.
 *
 * Uses gsap.matchMedia() so desktop and mobile timelines are created
 * in separate contexts and cleaned up automatically when the breakpoint
 * no longer matches (no memory leaks from stale ScrollTriggers).
 *
 * GPU-friendly: only animates transform / opacity properties.
 */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[animations] GSAP or ScrollTrigger not found — skipping.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── Shared ScrollTrigger defaults ────────────────────────────────────────
  const ST_DEFAULTS = { markers: false };

  // ── matchMedia contexts (GSAP handles cleanup automatically) ─────────────
  const mm = gsap.matchMedia();

  // ════════════════════════════════════════════════════════════════════════
  // DESKTOP  (>= 621 px)
  // ════════════════════════════════════════════════════════════════════════
  mm.add('(min-width: 621px)', () => {

    // ── Hero banner — pin + parallax exit ──────────────────────────────
    const tlBanner = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.banner',
        start:   'top top',
        end:     'bottom top',
        scrub:   5,
        pin:     true,
      },
    });
    tlBanner
      .to('.title-banner',  { x: '100vw', opacity: 0, duration: 3 })
      .to('.model-viewer',  { x: '50vw',              duration: 1 }, '<')
      .to('.about-me',      { x: '70vw', delay: 0.4,  duration: 3 }, '<')
      .to('.banner',        { opacity: 0, delay: 2,   duration: 2 }, '<');

    // ── Sub-banner marquee parallax ─────────────────────────────────────
    const tlSubBanner = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.portafolio',
        start:   'top bottom',
        end:     'bottom top',
        scrub:   25,
      },
    });
    tlSubBanner
      .from('.sub-banner',       { opacity: 0, duration: 0.1 }, '<')
      .to('.projects-title-1',   { x: '100vw', duration: 1  }, '<')
      .to('.projects-title-2',   { x: '-100vw', duration: 1 }, '<');

    // ── BE4CARE ─────────────────────────────────────────────────────────
    const tlBe4care = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.be4care',
        start:   'top bottom',
        end:     'bottom bottom',
        scrub:   10,
      },
    });
    tlBe4care
      .from('.gsap-2',                    { opacity: 0, x: '-50vw', duration: 1 }, '<')
      .from('.card-portafolio-be4care-1', { opacity: 0, x: '60vw',  duration: 1 }, '>')
      .from('.card-portafolio-be4care-2', { opacity: 0, x: '60vw',  duration: 1 }, '<')
      .from('.card-portafolio-be4care-3', { opacity: 0, x: '60vw',  duration: 1 }, '<')
      .from('.card-portafolio-be4care-4', { opacity: 0, x: '60vw',  duration: 1 }, '<');

    // ── BE4TECH ─────────────────────────────────────────────────────────
    const tlBe4tech = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.be4tech',
        start:   'top bottom',
        end:     'bottom bottom',
        scrub:   10,
      },
    });
    tlBe4tech
      .from('.gsap-3',                    { opacity: 0, x: '-50vw', duration: 1 }, '<')
      .from('.card-portafolio-be4tech-1', { opacity: 0, x: '60vw',  duration: 2 }, '>')
      .from('.card-portafolio-be4tech-2', { opacity: 0, x: '60vw',  duration: 2 }, '<');

    // ── IROCKET ─────────────────────────────────────────────────────────
    const tlIrocket = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.irocket',
        start:   'top bottom',
        end:     'bottom bottom',
        scrub:   10,
      },
    });
    tlIrocket
      .from('.gsap-4',                    { opacity: 0, x: '-50vw', duration: 1 }, '<')
      .from('.card-portafolio-irocket-1', { opacity: 0, x: '60vw',  duration: 2 }, '>')
      .from('.card-portafolio-irocket-2', { opacity: 0, x: '60vw',  duration: 2 }, '<');

    // ── QR ACCESS ───────────────────────────────────────────────────────
    const tlQrAccess = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.qr-access',
        start:   'top bottom',
        end:     'bottom bottom',
        scrub:   10,
      },
    });
    tlQrAccess
      .from('.gsap-5',                      { opacity: 0, x: '-50vw', duration: 1 }, '<')
      .from('.card-portafolio-qr-access-1', { opacity: 0, x: '60vw',  duration: 2 }, '>');

    // ── LEARUP ──────────────────────────────────────────────────────────
    const tlLearUp = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.learup',
        start:   'top bottom',
        end:     'bottom bottom',
        scrub:   10,
      },
    });
    tlLearUp
      .from('.gsap-6',                    { opacity: 0, x: '-50vw', duration: 1 }, '<')
      .from('.card-portafolio-learup-1',  { opacity: 0, x: '60vw',  duration: 2 }, '>');

    // ── Contact ─────────────────────────────────────────────────────────
    const tlContact = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.contact',
        start:   'top bottom',
        end:     'bottom bottom',
        scrub:   5,
      },
    });
    tlContact
      .from('.contact-title-1', { opacity: 0, x: '-100vw', duration: 2, delay: 0.5 }, '<')
      .from('.contact-title-2', { opacity: 0, x: '-100vw', duration: 2.2              }, '<')
      .from('.aaron',           { opacity: 0, x: '50vw',   duration: 1.2              }, '>')
      .from('.footer-contact',  { opacity: 0, x: '-100vw', duration: 1.2              }, '>');

    // Return cleanup callback (gsap.matchMedia calls this automatically)
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  });

  // ════════════════════════════════════════════════════════════════════════
  // MOBILE  (<= 620 px)
  // ════════════════════════════════════════════════════════════════════════
  mm.add('(max-width: 620px)', () => {

    // ── Hero banner — subtle vertical scroll ────────────────────────────
    const tlBanner = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.banner',
        start:   'top top',
        end:     'bottom top',
        scrub:   true,
      },
    });
    tlBanner
      .to('.title-banner', { y: '6vh', duration: 1 })
      .to('.model-viewer', { y: '4vh', duration: 2 }, '<');

    // ── Sub-banner marquee parallax ─────────────────────────────────────
    const tlSubBanner = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.portafolio',
        start:   'top bottom',
        end:     'bottom top',
        scrub:   5,
      },
    });
    tlSubBanner
      .to('.projects-title-1', { x: '100vw',  duration: 1 }, '<')
      .to('.projects-title-2', { x: '-100vw', duration: 1 }, '<');

    // ── BE4CARE ─────────────────────────────────────────────────────────
    const tlBe4care = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.be4care',
        start:   'top bottom',
        end:     'bottom bottom',
        scrub:   10,
      },
    });
    tlBe4care
      .from('.gsap-2',                    { opacity: 0, x: '50vw',  duration: 1            }, '<')
      .from('.card-portafolio-be4care-1', { opacity: 0, x: '-50vw', duration: 4, delay: 1  }, '<')
      .from('.card-portafolio-be4care-2', { opacity: 0, x: '-50vw', duration: 4            }, '<')
      .from('.card-portafolio-be4care-3', { opacity: 0, x: '-50vw', duration: 4            }, '<')
      .from('.card-portafolio-be4care-4', { opacity: 0, x: '-50vw', duration: 4            }, '<');

    // ── BE4TECH ─────────────────────────────────────────────────────────
    const tlBe4tech = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.be4tech',
        start:   'top bottom',
        end:     'bottom bottom',
        scrub:   10,
      },
    });
    tlBe4tech
      .from('.gsap-3',                    { opacity: 0, x: '50vw',  duration: 1, delay: 0.5 }, '<')
      .from('.card-portafolio-be4tech-1', { opacity: 0, x: '-50vw', duration: 2             }, '<')
      .from('.card-portafolio-be4tech-2', { opacity: 0, x: '-50vw', duration: 2             }, '<');

    // ── IROCKET ─────────────────────────────────────────────────────────
    const tlIrocket = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.irocket',
        start:   'top bottom',
        end:     'bottom bottom',
        scrub:   10,
      },
    });
    tlIrocket
      .from('.gsap-4',                    { opacity: 0, x: '50vw',  duration: 1, delay: 0.5 }, '<')
      .from('.card-portafolio-irocket-1', { opacity: 0, x: '-50vw', duration: 2             }, '<')
      .from('.card-portafolio-irocket-2', { opacity: 0, x: '-50vw', duration: 2             }, '<');

    // ── QR ACCESS ───────────────────────────────────────────────────────
    const tlQrAccess = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.qr-access',
        start:   'top bottom',
        end:     'bottom bottom',
        scrub:   10,
      },
    });
    tlQrAccess
      .from('.gsap-5',                      { opacity: 0, x: '50vw',  duration: 1, delay: 0.5 }, '<')
      .from('.card-portafolio-qr-access-1', { opacity: 0, x: '-50vw', duration: 2             }, '<');

    // ── LEARUP ──────────────────────────────────────────────────────────
    const tlLearUp = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.learup',
        start:   'top bottom',
        end:     'bottom bottom',
        scrub:   10,
      },
    });
    tlLearUp
      .from('.gsap-6',                   { opacity: 0, x: '50vw',  duration: 1, delay: 0.5 }, '<')
      .from('.card-portafolio-learup-1', { opacity: 0, x: '-50vw', duration: 2             }, '<');

    // ── Contact ─────────────────────────────────────────────────────────
    const tlContact = gsap.timeline({
      scrollTrigger: {
        ...ST_DEFAULTS,
        trigger: '.contact',
        start:   'top bottom',
        end:     'bottom bottom',
        scrub:   5,
      },
    });
    tlContact
      .from('.contact-title-1', { opacity: 0, x: '-100vw', duration: 2, delay: 0.5 }, '<')
      .from('.contact-title-2', { opacity: 0, x: '-100vw', duration: 2.2            }, '<')
      .from('.aaron',           { opacity: 0, x: '50vw',   duration: 1.2            }, '>')
      .from('.footer-contact',  { opacity: 0, x: '-100vw', duration: 1.2            }, '>');

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  });

})();
