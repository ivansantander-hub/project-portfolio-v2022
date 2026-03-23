# Iván Santander — Portfolio

Vanilla stack, zero runtime frameworks, cinematic scroll-driven experience with live 3D models.

**Live:** [ivansantander.com](https://ivansantander.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| SSG | [mini-astro](https://github.com/ivansantander-hub/mini-astro) — custom component system |
| Animations | GSAP 3.14 + ScrollTrigger |
| Smooth Scroll | Lenis |
| 3D | `@google/model-viewer` 4.x (GLTF/USDZ) |
| Fonts | Be Vietnam Pro + VT323 (self-hosted via `@fontsource`) |
| Package Manager | pnpm 9 |
| Build Output | Static HTML/CSS/JS → `site/dist/` |

No React. No Vue. No TypeScript. No CDN. Everything self-hosted.

---

## Commands

```bash
pnpm dev      # Build + dev server (port 2323)
pnpm build    # mini-astro build + sync assets → dist/
pnpm serve    # Serve dist/ on localhost:3000
pnpm test     # Playwright test suite
```

---

## Project Structure

```
project-portfolio-v2022/
├── site/
│   ├── src/
│   │   ├── templates/Base.html          # HTML shell: cursor, scroll bar, scripts
│   │   ├── atoms/Preloader.html         # Cinematic counter preloader
│   │   ├── molecules/
│   │   │   ├── SiteHeader.html          # Logo + marquee + theme swatches
│   │   │   └── SubBanner.html           # Horizontal parallax section dividers
│   │   ├── organisms/
│   │   │   ├── HeroSection.html         # Rhetorician 3D + headline
│   │   │   ├── AboutSection.html        # Bio + stack chips + year marker
│   │   │   ├── ProjectBe4care.html
│   │   │   ├── ProjectBe4tech.html
│   │   │   ├── ProjectIrocket.html
│   │   │   ├── ProjectQrAccess.html
│   │   │   ├── ProjectLearUp.html
│   │   │   └── ContactSection.html
│   │   └── pages/index.html             # Page composition via <mini-include>
│   ├── public/
│   │   ├── css/styles.css               # All styles — single file
│   │   ├── js/
│   │   │   ├── app.js                   # Scroll progress, section indicator, hero entrance, lo-fi audio
│   │   │   ├── animations.js            # GSAP + ScrollTrigger + Lenis
│   │   │   ├── colors.js                # Theme switcher + preloader progress
│   │   │   ├── cursor.js                # Custom cursor + magnetic + click audio
│   │   │   └── scramble.js              # Character scramble on [data-scramble]
│   │   ├── audio/                       # Lo-fi ambient track (CC0)
│   │   ├── img/portafolio/              # Project screenshots (WebP)
│   │   └── models-3d/                   # GLTF 3D assets
│   ├── scripts/sync-static.mjs          # Copies public/ + vendor libs → dist/
│   └── dist/                            # Build output
├── tests/e2e.spec.js                    # Playwright test suite
└── README.md
```

---

## Architecture

`<mini-include src="organisms/HeroSection" />` resolves to `src/organisms/HeroSection.html` at build time. Output is a single flat `index.html`. Templates use `{{ title }}` and `<slot />`.

Vendor JS (GSAP, Lenis, model-viewer) is copied from `node_modules` → `dist/vendor/` by `sync-static.mjs`. Never loaded from CDN.

---

## Features

### Cinematic Experience
| Feature | Detail |
|---|---|
| **Lenis smooth scroll** | 60fps scroll, integrated with GSAP ScrollTrigger via `requestAnimationFrame` |
| **Cinematic preloader** | Full-screen VT323 counter 000→100, slides up on load complete |
| **Hero 3D model** | Rhetorician draggable GLTF (`camera-controls`, `animation-name: "Take 01"`) |
| **Hero exit** | GSAP pin + model slide-fade, `.about-me` bridges to projects section |
| **Sub-banner parallax** | Counter-scroll titles (`scrub:2`), title-1 right / title-2 left |
| **Project entrances** | Clip-path wipe + blur dissolve reveals, 3D model slides left + cards cascade |
| **Contact reveal** | Scrubbed clip-path + blur, sticky reveal from behind last project |
| **Word-by-word reveal** | DOM split + `yPercent:115` stagger on hero load |
| **Character scramble** | `scramble.js`: IntersectionObserver `once`, 680ms L→R resolve en `[data-scramble]` |

### Cursor & Interaction
| Feature | Detail |
|---|---|
| **Custom cursor** | Dot (8px snap) + ring (36px lerp 0.12), `mix-blend-mode: difference` |
| **Velocity trail** | Ring stretches in movement direction (`scaleX` up to 1.35×) + rotation |
| **Magnetic links** | GSAP `elastic.out` on mouseleave, `.magnetic` class |
| **Click audio** | Real WAV click (Kenney CC0) — tactile cursor feedback |
| **Hover state** | Ring grows 1.55×, dot vanishes |
| **Click state** | Ring squishes 0.62×, dot pulses 2.0×, spring overshoot on release |

### Audio
| Feature | Detail |
|---|---|
| **Lo-fi ambient** | "I'm glad you are here with me" — Loyalty Freak Music (CC0, archive.org). Loops at 4% volume |
| **Tab awareness** | Music fades out on tab hide, fades back on return |

### UI Surfaces
| Feature | Detail |
|---|---|
| **Scroll progress bar** | Fixed top, 2px, updates on `scroll` event |
| **Section indicator** | Right margin, `writing-mode: vertical-rl`, fades between section names |
| **Scroll CTA** | Animated descending line, hides after 50px scroll |
| **Film grain** | SVG `feTurbulence` data-URI overlay, `opacity: 0.028` |
| **Theme switcher** | 4 palettes (Dark, Dark Rose, Light, Light Rose), cinematic flash overlay on switch |
| **Drag galleries** | Horizontal card scroll with momentum (velocity + friction decay) |

### Performance & Quality
- `loading="lazy"` on all below-fold model-viewers
- `loading="eager"` only on hero model
- WebP images for all project screenshots
- `will-change: transform` on animated layers
- `prefers-reduced-motion` guard in animations.js + cursor.js
- All vendor JS self-hosted (no CDN latency)

### Accessibility
- `aria-label` on all interactive model-viewers
- `aria-hidden="true"` on decorative elements (cursor, grain)
- Semantic HTML: `<article>`, `<main>`, `<aside>`, `<footer>`, `<nav>`
- Focus-visible keyboard navigation preserved
- `prefers-reduced-motion` respected site-wide

---

## 3D Models

| Model | Path | Section | Animation |
|---|---|---|---|
| Rhetorician | `rhetorician/scene.gltf` | Hero | `Take 01` |
| Computer Monitor | `computer_monitor/scene.gltf` | iRocket | — |
| Computer Monitor LearUp | `computer_monitor_learup/scene.gltf` | LearUp | — |
| MacBook Pro | `macbook_pro/scene.gltf` | BE4TECH | — |

---

## Design System

### Typography
- **Primary:** Be Vietnam Pro 100–900 (self-hosted)
- **Display:** VT323 400 — tech/monospace aesthetic (preloader, header marquee)

### Color Themes
| Name | Background | Text/Contrast |
|---|---|---|
| Dark (default) | `#111111` | `#e8e0ea` |
| Dark Rose | `#111111` | `#c9a0b8` |
| Light | `#f2eef4` | `#1a1a1a` |
| Light Rose | `#f0eaed` | `#5a3a4a` |

### GSAP Animation Tokens
```js
EXPO_OUT  = 'expo.out'    // section entrances
POWER4    = 'power4.out'  // card cascades
POWER3    = 'power3.out'  // secondary moves

// Scrub values
hero      = 1.5   // responsive hero exit
parallax  = 2     // sub-banner counter-scroll
```

---

## Testing

```bash
# First time: install browsers
npx playwright install chromium

# Run full suite
pnpm test

# Visual / debug mode
npx playwright test --ui
```

Playwright tests cover: preloader lifecycle, hero visibility, cursor DOM, scroll behavior, project sections, about section, contact section, scramble effect, tech stacks, film grain, galleries, OG meta, mobile viewport (375px).

---

## Deployment

Railway via `railway.toml`. Serves static `dist/` with the bundled `serve` package.

---

*Design & code — Iván Santander · [GitHub @ivansantander-hub](https://github.com/ivansantander-hub)*
