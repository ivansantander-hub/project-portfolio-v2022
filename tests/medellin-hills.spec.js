// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

// /medellin-hills/ — el portafolio como un mixtape (site/public/medellin-hills).
// Además del contenido, estas pruebas vigilan las reglas de la skill landing-page-design.
const WORK = path.join(__dirname, '..', 'site', 'src', 'content', 'work');
const CASOS = fs.readdirSync(WORK).filter((f) => f.endsWith('.es.md')).length;
const URL = '/medellin-hills/';
const TAMANOS_TEXTO = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128];
const ESPACIOS = [0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96];
const RADIOS = [0, 2, 4, 6, 8, 12, 16, 24];

test.describe('medellin-hills · contenido', () => {
  test.beforeEach(async ({ page }) => { await page.goto(URL, { waitUntil: 'domcontentloaded' }); });

  test('lado A y lado B reparten los 18 casos y cada enlace existe', async ({ page, request }) => {
    const a = await page.locator('#lado-a .caso a.enlace').evaluateAll((l) => l.map((e) => e.getAttribute('href')));
    const b = await page.locator('#lado-b .caso a.enlace').evaluateAll((l) => l.map((e) => e.getAttribute('href')));
    expect(a).toHaveLength(10);
    expect(a.length + b.length).toBe(CASOS);
    expect(new Set([...a, ...b]).size).toBe(CASOS);
    for (const h of [...a, ...b]) expect((await request.get(String(h))).status(), String(h)).toBe(200);
  });

  test('cada caso tiene su figurita y el archivo existe', async ({ page, request }) => {
    const srcs = await page.locator('.caso__img img').evaluateAll((l) => l.map((e) => e.getAttribute('src')));
    expect(srcs).toHaveLength(CASOS);
    for (const s of srcs) expect((await request.get(String(s))).status(), String(s)).toBe(200);
  });

  test('estructura de la skill: hero, frase, beneficios, pasos, casos, preguntas y cierre', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/plataformas de salud reguladas/);
    await expect(page.locator('.hero a.boton--prim')).toHaveAttribute('href', /linkedin\.com\/in\/ivan-santander/);
    await expect(page.locator('.hero .prueba dd')).toHaveCount(3);
    expect((await page.locator('#tagline').getAttribute('aria-label')) || (await page.locator('#tagline').innerText())).toMatch(/\S+ \S+ \S+/);
    await expect(page.locator('.beneficio')).toHaveCount(4);
    await expect(page.locator('.paso')).toHaveCount(4);
    await expect(page.locator('details')).toHaveCount(7);
    await expect(page.locator('#contacto a.boton--prim')).toHaveAttribute('href', /linkedin\.com/);
  });

  test('datos verdaderos, sin SaaS y es noindex', async ({ page }) => {
    await expect(page.locator('.hero .prueba div', { hasText: 'Casos' }).locator('dd')).toHaveText(String(CASOS));
    await expect(page.locator('.hero .prueba div', { hasText: 'Años' }).locator('dd')).toHaveText(String(new Date().getFullYear() - 2019));
    expect(await page.content()).not.toMatch(/SaaS/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og\.jpg$/);
  });

  test('sin pedir nada fuera del sitio', async ({ page }) => {
    const externas = [];
    page.on('request', (r) => { if (!/^https?:\/\/(localhost|127\.0\.0\.1)/.test(r.url()) && !r.url().startsWith('data:')) externas.push(r.url()); });
    await page.goto(URL, { waitUntil: 'load' });
    expect(externas).toEqual([]);
  });
});

test.describe('medellin-hills · reglas visuales de la skill', () => {
  for (const [w, h] of [[1440, 900], [1000, 620], [390, 844]]) {
    test(`tamaños, espacios, radios, pesos y degradados (${w}x${h})`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const p = await ctx.newPage();
      await p.goto(URL, { waitUntil: 'load' });
      await p.waitForTimeout(400);
      const r = await p.evaluate(({ T, E, R }) => {
        const mal = { texto: new Set(), espacio: new Set(), radio: new Set(), peso: new Set(), familia: new Set(), degradado: [], cursiva: 0 };
        for (const el of document.querySelectorAll('body *')) {
          if (el.closest('svg') || el.closest('.sr') || getComputedStyle(el).display === 'none') continue;
          const s = getComputedStyle(el);
          if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) {
            const fs = parseFloat(s.fontSize); if (!T.includes(fs)) mal.texto.add(`${el.className || el.tagName}:${fs}`);
            const fw = Number(s.fontWeight); if (fw > 700) mal.peso.add(`${el.className || el.tagName}:${fw}`);
            const fam = s.fontFamily.split(',')[0].replace(/["']/g, '').trim(); if (!['Geist', 'Geist Mono'].includes(fam)) mal.familia.add(fam);
            if (s.fontStyle === 'italic') mal.cursiva++;
          }
          for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap']) {
            const v = s[k]; if (v === 'normal') continue;
            const n = parseFloat(v); if (!E.includes(n)) mal.espacio.add(`${el.className || el.tagName}.${k}:${v}`);
          }
          for (const k of ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius']) {
            const v = s[k]; if (v.includes('%')) continue;
            const n = parseFloat(v); if (n < 1000 && !R.includes(n)) mal.radio.add(`${el.className || el.tagName}:${v}`);
          }
          if (/gradient/.test(s.backgroundImage) && !el.classList.contains('degradado')) mal.degradado.push(el.className || el.tagName);
        }
        return Object.fromEntries(Object.entries(mal).map(([k, v]) => [k, v instanceof Set ? [...v] : v]));
      }, { T: TAMANOS_TEXTO, E: ESPACIOS, R: RADIOS });
      expect(r.texto, 'tamaños de texto fuera de la escala').toEqual([]);
      expect(r.espacio, 'espacios fuera de la tabla').toEqual([]);
      expect(r.radio, 'radios fuera de Tailwind').toEqual([]);
      expect(r.peso, 'pesos mayores que bold').toEqual([]);
      expect(r.familia, 'tipografías distintas de Geist').toEqual([]);
      expect(r.degradado, 'degradados en fondos').toEqual([]);
      expect(r.cursiva).toBe(0);
      await ctx.close();
    });
  }

  test('ningún listener de scroll y la curva de movimiento es la de la skill', async ({ request }) => {
    const js = await (await request.get('/medellin-hills/hills.js')).text();
    const css = await (await request.get('/medellin-hills/hills.css')).text();
    expect(js).not.toMatch(/addEventListener\(\s*['"]scroll['"]/);
    expect(css).toContain('cubic-bezier(0.32, 0.72, 0, 1)');
    expect(css.replace(/visibility 0s linear/g, '')).not.toMatch(/transition:\s*[^;]*\b(ease|linear)\b[^;]*;/);
  });

  test('ninguna imagen se estira ni se sale de proporción', async ({ browser }) => {
    for (const [w, h] of [[1000, 620], [1920, 1080], [390, 844]]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const p = await ctx.newPage();
      await p.goto(URL, { waitUntil: 'load' });
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); });
      await p.waitForTimeout(400);
      const malas = await p.evaluate(() => [...document.images].filter((i) => i.naturalWidth && i.clientWidth && i.clientHeight && getComputedStyle(i).objectFit !== 'contain').map((i) => ({ src: i.src.split('/').pop(), nat: i.naturalWidth / i.naturalHeight, vis: i.clientWidth / i.clientHeight })).filter((i) => Math.abs(i.nat / i.vis - 1) > 0.03));
      expect(malas, `${w}x${h}`).toEqual([]);
      await ctx.close();
    }
  });

  test('sin scroll horizontal y el menú móvil se abre y se cierra', async ({ page, isMobile }) => {
    await page.goto(URL, { waitUntil: 'load' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    test.skip(!isMobile, 'el menú de la isla solo existe en pantallas chicas');
    await page.click('#abre-menu');
    await expect(page.locator('#abre-menu')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#menu a').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#abre-menu')).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('medellin-hills · música', () => {
  test('nada suena ni se descarga antes del clic', async ({ page }) => {
    const audio = [];
    page.on('request', (r) => { if (r.url().includes('/audio/')) audio.push(r.url()); });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    expect(audio).toEqual([]);
    await expect(page.locator('#repro')).toBeHidden();
  });

  test('las imágenes no laten: ningún elemento cambia de transform al compás', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.click('#musica');
    await expect(page.locator('html')).toHaveClass(/suena/);
    const estilos = new Set();
    for (let i = 0; i < 12; i++) { estilos.add(await page.evaluate(() => [...document.querySelectorAll('.visual img, .caso__img img, .vinilo img')].map((e) => e.style.transform).join('|'))); await page.waitForTimeout(100); }
    expect(estilos.size).toBe(1);
  });

  test('al dar play sigue la canción y pasa a explorar al mover el scroll', async ({ page, isMobile }) => {
    test.skip(isMobile, 'el scroll con rueda es de escritorio');
    test.setTimeout(45_000);
    await page.goto(URL, { waitUntil: 'load' });
    await page.click('#casete-play');
    await expect(page.locator('#repro')).toBeVisible();
    await expect(page.locator('.caso.activa')).toHaveAttribute('id', 'caso-architecture-simplification', { timeout: 20_000 });
    await expect(page.locator('#repro-modo')).toHaveAttribute('aria-pressed', 'true');
    await page.mouse.move(700, 500);
    await page.mouse.wheel(0, 200);
    await expect(page.locator('#repro-modo')).toHaveAttribute('aria-pressed', 'false');
  });

  test('se puede cambiar de canción y el silencio se recuerda', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.click('#musica');
    await page.click('#repro-sig');
    await expect(page.locator('#repro-nombre')).toHaveText('India conocida');
    await page.click('#repro-mudo');
    expect(await page.evaluate(() => localStorage.getItem('hills:mudo'))).toBe('1');
  });
});

test.describe('medellin-hills · alternativas', () => {
  test('con movimiento reducido todo es visible y no hay recorrido automático', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(URL, { waitUntil: 'load' });
    await expect(p.locator('.caso').first()).toBeVisible();
    await p.click('#musica');
    await p.waitForTimeout(1500);
    expect(await p.evaluate(() => scrollY)).toBeLessThan(5);
    await ctx.close();
  });

  test('sin JavaScript el contenido y los enlaces están', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(URL, { waitUntil: 'load' });
    await expect(p.locator('.caso')).toHaveCount(CASOS);
    await expect(p.locator('#tagline')).toBeVisible();
    await expect(p.locator('#contacto a.boton--prim')).toBeVisible();
    await ctx.close();
  });
});
