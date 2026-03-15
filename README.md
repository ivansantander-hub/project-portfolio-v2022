# Iván Santander — Portfolio 2022

> A single-page portfolio that blends 3D, scroll-driven motion, and curated project work. Built with **mini-astro** (static site generator).

**Live:** [ivansantander.com](https://ivansantander.com)

---

## Highlights

| | |
|---|---|
| **3D in the browser** | Interactive GLTF models (cosmonaut, devices) via Google’s model-viewer — responsive and AR-ready on supported devices. |
| **Scroll storytelling** | GSAP + ScrollTrigger drive the narrative: hero pin, staggered project reveals, and smooth section transitions. |
| **Theming** | Four palette presets (dark, mint, rose, light) applied via CSS custom properties — no reload. |
| **Selected works** | LearUp, BE4CARE, BE4TECH, IROCKET, NEWO — each with device mockups and screenshots. |

---

## Stack

**Build:** [mini-astro](mini-astro/) (static site generator, Atomic Design, file-based routing)  
**Frontend:** HTML5 · CSS3 (custom properties) · JavaScript  
**Motion:** [GSAP](https://greensock.com/gsap/) · ScrollTrigger  
**3D:** [@google/model-viewer](https://modelviewer.dev/) (GLTF)

---

## Run it

The site lives in **`site/`**. Build and dev:

```bash
cd site
npm run build    # output in site/dist/
npm run dev      # dev server at http://localhost:3000
```

From repo root you can run:

```bash
cd site && npm run dev
```

3D assets are loaded over HTTP; use the dev server or serve `site/dist/` for production.

---

## Structure

```
├── mini-astro/     → Static site framework (docs in mini-astro/docs/)
├── site/           → Portfolio source (pages, components, templates)
│   ├── src/        → pages, templates, organisms, molecules, atoms, data
│   ├── public/     → css, js, img, models-3d (copied to dist)
│   └── dist/       → Built output (deploy this)
└── README.md
```

---

*Design & code — Iván Santander · [GitHub @ivansantander-hub](https://github.com/ivansantander-hub)*
