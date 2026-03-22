# Iván Santander — Portfolio

Awwwards-competition portfolio. Vanilla stack, zero runtime frameworks, cinematic scroll-driven experience with live 3D models.

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
│   │   ├── templates/Base.html          # HTML shell: cursor, scroll bar, traveler, scripts
│   │   ├── atoms/Preloader.html         # Cinematic counter preloader
│   │   ├── molecules/
│   │   │   ├── SiteHeader.html          # Logo + marquee + theme swatches
│   │   │   └── SubBanner.html           # Horizontal parallax section dividers
│   │   ├── organisms/
│   │   │   ├── HeroSection.html         # Rhetorician 3D + headline
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
│   │   │   ├── app.js                   # Scroll progress, section indicator, hero entrance
│   │   │   ├── animations.js            # GSAP + ScrollTrigger + Lenis + traveler
│   │   │   ├── colors.js                # Theme switcher + preloader progress
│   │   │   └── cursor.js                # Custom cursor + magnetic + click audio
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

## Features ✅ Implemented

### Cinematic Experience
| Feature | Detail |
|---|---|
| **Lenis smooth scroll** | Buttery 60fps scroll, integrated with GSAP ScrollTrigger via `requestAnimationFrame` |
| **Cinematic preloader** | Full-screen giant VT323 counter 000→100, slides up on load complete |
| **Hero 3D model** | Rhetorician draggable GLTF (`camera-controls`, `animation-name: "Take 01"`) |
| **Cosmonaut space traveler** | Fixed model-viewer, GSAP `scrub:2.8` journey through 5 project sections with camera-orbit tweening |
| **Hero exit** | GSAP pin + skewX on title + model slide-fade, `.about-me` bridges to projects section |
| **Sub-banner parallax** | Counter-scroll titles (`scrub:2`), title-1 right / title-2 left |
| **Project entrances** | Free-playing `toggleActions`, 3D model slides left + cards cascade stagger |
| **Contact reveal** | clip-path + blur + skewX cascade |
| **3D tilt hover** | Project cards respond to mousemove with `rotateX/Y` perspective transform |
| **Word-by-word reveal** | DOM split + `yPercent:115` stagger on hero load |

### Cursor & Interaction
| Feature | Detail |
|---|---|
| **Custom cursor** | Dot (8px snap) + ring (36px lerp 0.12), `mix-blend-mode: difference` |
| **Scale-in-transform fix** | Scale applied inside JS `transform` string — prevents viewport-origin drift bug on click |
| **Magnetic links** | GSAP `elastic.out` on mouseleave, `.magnetic` class |
| **Click audio** | Web Audio API sine sweep 1100Hz→180Hz / 85ms — tasteful digital tick |
| **Hover state** | Ring grows 1.55×, dot vanishes |
| **Click state** | Ring squishes 0.62×, dot pulses 2.0×, spring overshoot on release |

### UI Surfaces
| Feature | Detail |
|---|---|
| **Scroll progress bar** | Fixed top, 2px, updates on `scroll` event |
| **Section indicator** | Right margin, `writing-mode: vertical-rl`, fades between section names |
| **Scroll CTA** | Animated descending line, hides after 50px scroll |
| **Noise grain** | SVG `feTurbulence` data-URI body overlay, `opacity: 0.028` |
| **Theme switcher** | 4 palettes, cinematic flash overlay on switch |
| **Theme overlay** | `#theme-overlay` black flash during color swap |

### Performance & Quality
- `loading="lazy"` on all below-fold model-viewers
- `loading="eager"` only on hero model
- WebP images for all project screenshots
- `will-change: transform` on animated layers
- `prefers-reduced-motion` guard in animations.js + cursor.js
- All vendor JS self-hosted (no CDN latency)

### Accessibility
- `aria-label` on all interactive model-viewers
- `aria-hidden="true"` on decorative elements (cursor, grain, traveler)
- Semantic HTML: `<article>`, `<main>`, `<aside>`, `<footer>`, `<nav>`
- Focus-visible keyboard navigation preserved
- `prefers-reduced-motion` respected site-wide

---

## ✅ Crítico — Completado

| Item | Detalle |
|---|---|
| Lenis smooth scroll | Integrado con GSAP ScrollTrigger via scrollerProxy + RAF compartido |
| Preloader cinematográfico | Contador VT323 `000→100`, slide-up `yPercent:-100` en 0.9s |
| Card 3D tilt hover | rotateX/Y ±6° en mousemove, spring reset en mouseleave |
| Clip-path text reveals | Contact titles: `inset(0 100% 0 0)` → `0%` — salida de máscara |
| **About / Bio section** | Grid: `05 YRS` + `Design.Code.Ship.` + bio + 8 stack chips. GSAP stagger reveal |
| **Métricas animadas** | 3 métricas por proyecto (15 total). Contador GSAP proxy `once:true`, `power2.out` |
| **Mobile polish** | About + métricas adaptadas a mobile. Animaciones registradas en `mm.add(max-width:620px)` |
| **Hero exit limpio** | `skewX` eliminado — salida en velocidad pura sin distorsión |
| **Cosmonaut eliminado** | Removido — ruido visual sin propósito. Portfolio más limpio y enfocado |

## 🟡 Pendiente — Medio impacto

| Item | Detalle |
|---|---|
| Character scramble | Letras se mezclan antes de resolverse al texto final — efecto hacker/glitch elegante |
| Sonido ambiental de scroll | Web Audio API: whoosh suave al cambiar entre secciones |
| Profundidad de case study | Rol, problema, solución, stack, resultado por proyecto |
| Galería horizontal por proyecto | Carrusel de imágenes per-project (scroll horizontal dentro de la sección) |

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
| Dark (default) | `#111111` | `#F1F4FF` |
| Light | `#F1F4FF` | `#111111` |
| Mint | `#1a2e2a` | `#b8f0d8` |
| Peach | `#2a1a1a` | `#f0c8b8` |

### GSAP Animation Tokens
```js
EXPO_OUT  = 'expo.out'    // section entrances
POWER4    = 'power4.out'  // card cascades
POWER3    = 'power3.out'  // secondary moves

// Scrub values
hero      = 1.5   // responsive hero exit
parallax  = 2     // sub-banner counter-scroll
traveler  = 2.8   // zero-gravity cosmonaut float
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

Playwright tests cover: preloader lifecycle · hero visibility · cursor DOM · scroll behavior · project section entrances · space traveler presence · contact section · mobile viewport (375px).

---

## Deployment

Railway via `railway.toml`. Serves static `dist/` with the bundled `serve` package.

---

*Design & code — Iván Santander · [GitHub @ivansantander-hub](https://github.com/ivansantander-hub)*
