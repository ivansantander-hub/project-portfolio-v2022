# Portfolio site (mini-astro)

This folder is the portfolio built with **mini-astro**. The original static files live in the repo root; this site uses the same content via `src/pages/index.html` and `src/templates/Base.html`, with assets in `public/`.

## Build

From this folder:

```bash
npm run build
# or
node ../mini-astro/cli.js build
```

Output: `dist/index.html` and `dist/` (css, js, img, models-3d copied from `public/`).

## Dev server

```bash
npm run dev
# or
node ../mini-astro/cli.js dev
```

Opens http://localhost:3000. With `chokidar` installed in `mini-astro`, changes in `src/` trigger a rebuild and live reload.

## Deploy

Serve the `dist/` folder (and ensure `dist/css`, `dist/js`, `dist/img`, `dist/models-3d` are served as static assets). Or copy `dist/*` to your web root.
