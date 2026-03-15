# Iván Santander — Portfolio 2022

> A single-page portfolio that blends 3D, scroll-driven motion, and curated project work. Built to stand out.

**Live:** [ivansantander.com](https://ivansantander.com)

---

## Highlights

| | |
|---|---|
| **3D in the browser** | Interactive GLTF models (cosmonaut, devices) via Google’s model-viewer — responsive and AR-ready on supported devices. |
| **Scroll storytelling** | GSAP + ScrollTrigger drive the narrative: hero pin, staggered project reveals, and smooth section transitions. |
| **Theming** | Four palette presets (dark, mint, rose, light) applied via CSS custom properties — no reload. |
| **Selected works** | BE4CARE, BE4TECH, IROCKET, QR Access — each with device mockups and screenshots. |

---

## Stack

**Frontend:** HTML5 · CSS3 (custom properties, layout) · JavaScript  
**Motion:** [GSAP](https://greensock.com/gsap/) · [ScrollTrigger](https://greensock.com/scrolltrigger/)  
**3D:** [@google/model-viewer](https://modelviewer.dev/) (GLTF/USDZ)

No build step. No framework. Vanilla + a few focused libraries.

---

## Run it

3D assets are loaded with `fetch`, so the app must be served over HTTP (opening `index.html` via `file://` will block model loading).

```bash
npm run serve
```

Open **http://localhost:3000**.  
Alternatively: `npx serve . -p 3000` or any static server on the project root.

---

## Structure

```
├── index.html
├── css/           → styles.css, lite-projects.css
├── js/            → app.js, colors.js, gsap.js, gsap-lite.js
├── models-3d/     → GLTF (and USDZ where used)
└── img/portafolio/
```

---

*Design & code — Iván Santander*
