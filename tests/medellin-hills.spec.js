// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

// /medellin-hills/ — el portafolio como un mixtape vivo (site/public/medellin-hills).
const CASOS = fs.readdirSync(path.join(__dirname, '..', 'site', 'src', 'content', 'work')).filter((f) => f.endsWith('.es.md')).length;
const URL = '/medellin-hills/';

test.describe('medellin-hills · contenido', () => {
  test.beforeEach(async ({ page }) => { await page.goto(URL, { waitUntil: 'domcontentloaded' }); });

  test('lado A y lado B reparten los casos y cada enlace existe', async ({ page, request }) => {
    const a = await page.locator('#lado-a .pista a.boton').evaluateAll((l) => l.map((e) => e.getAttribute('href')));
    const b = await page.locator('#lado-b .pista a.boton').evaluateAll((l) => l.map((e) => e.getAttribute('href')));
    expect(a).toHaveLength(10);
    expect(a.length + b.length).toBe(CASOS);
    expect(new Set([...a, ...b]).size).toBe(CASOS);
    for (const h of [...a, ...b]) expect((await request.get(String(h))).status(), String(h)).toBe(200);
  });

  test('cada pista tiene su figurita y existe el archivo', async ({ page, request }) => {
    const srcs = await page.locator('.pista img.figurita').evaluateAll((l) => l.map((e) => e.getAttribute('src')));
    expect(srcs).toHaveLength(CASOS);
    for (const s of srcs) expect((await request.get(String(s))).status(), String(s)).toBe(200);
  });

  test('datos y enlaces verdaderos, sin SaaS', async ({ page }) => {
    await expect(page.locator('.datos > div', { hasText: 'Casos' }).locator('dd')).toHaveText(String(CASOS));
    await expect(page.locator('.datos > div', { hasText: 'Desde' }).locator('dd')).toHaveText('2019');
    const hrefs = await page.locator('#contacto a').evaluateAll((l) => l.map((e) => e.getAttribute('href') || ''));
    expect(hrefs.some((h) => h.includes('linkedin.com/in/ivan-santander'))).toBe(true);
    expect(hrefs.some((h) => h.includes('github.com/ivansantander-hub'))).toBe(true);
    expect(await page.content()).not.toMatch(/SaaS/);
    await expect(page.locator('#trabajo .regla')).toHaveCount(4);
  });

  test('es noindex, sin scroll horizontal y sin pedir nada afuera', async ({ page }) => {
    const externas = [];
    page.on('request', (r) => { if (!/^https?:\/\/(localhost|127\.0\.0\.1)/.test(r.url()) && !r.url().startsWith('data:')) externas.push(r.url()); });
    await page.goto(URL, { waitUntil: 'load' });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    expect(externas).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
});

test.describe('medellin-hills · imágenes', () => {
  for (const [w, h] of [[1000, 620], [1440, 900], [1920, 1080], [390, 844]]) {
    test(`ninguna imagen se estira ni se sale de proporción (${w}x${h})`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const p = await ctx.newPage();
      await p.goto(URL, { waitUntil: 'load' });
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } scrollTo(0, 0); });
      await p.waitForTimeout(400);
      const malas = await p.evaluate(() => [...document.images].filter((i) => i.naturalWidth && i.clientWidth && i.clientHeight).map((i) => ({ src: i.src.split('/').pop(), nat: i.naturalWidth / i.naturalHeight, vis: i.clientWidth / i.clientHeight })).filter((i) => Math.abs(i.nat / i.vis - 1) > 0.03));
      expect(malas).toEqual([]);
      await ctx.close();
    });
  }
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

  test('al dar play late, sigue la canción y pasa a explorar al mover el scroll', async ({ page, isMobile }) => {
    test.skip(isMobile, 'el scroll con rueda es de escritorio');
    test.setTimeout(45_000);
    await page.goto(URL, { waitUntil: 'load' });
    await page.click('#play');
    await expect(page.locator('html')).toHaveClass(/suena/);
    await expect(page.locator('#repro')).toBeVisible();
    const latidos = new Set();
    for (let i = 0; i < 15; i++) { latidos.add(await page.evaluate(() => document.querySelector('.casete').style.transform)); await page.waitForTimeout(90); }
    expect(latidos.size).toBeGreaterThan(2);
    await expect(page.locator('.pista.activa')).toHaveAttribute('id', 'pista-architecture-simplification', { timeout: 20_000 });
    await page.mouse.move(700, 500);
    await page.mouse.wheel(0, 200);
    await expect(page.locator('#repro-modo')).toHaveText(/Explorar/);
  });

  test('se puede cambiar de canción y el silencio se recuerda', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.click('#play');
    await page.click('#repro-sig');
    await expect(page.locator('#repro-nombre')).toHaveText('India conocida');
    await page.click('#repro-mudo');
    expect(await page.evaluate(() => localStorage.getItem('hills:mudo'))).toBe('1');
  });
});

test.describe('medellin-hills · alternativas', () => {
  test('con movimiento reducido no hay pulso ni recorrido automático', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(URL, { waitUntil: 'load' });
    await p.click('#play');
    await p.waitForTimeout(1500);
    expect(await p.evaluate(() => new Set([...document.querySelectorAll('.casete')].map((e) => e.style.transform)).size)).toBeLessThanOrEqual(1);
    expect(await p.evaluate(() => scrollY)).toBeLessThan(5);
    await ctx.close();
  });

  test('sin JavaScript el contenido y los enlaces están', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(URL, { waitUntil: 'load' });
    await expect(p.locator('.pista')).toHaveCount(CASOS);
    await expect(p.locator('#contacto a.boton').first()).toBeVisible();
    await ctx.close();
  });
});
