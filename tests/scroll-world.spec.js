// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

// /scroll-world/ — página independiente (site/public/scroll-world): un mundo isométrico en SVG
// por el que la cámara vuela con el scroll. Estas pruebas cubren contenido real, modos y teclado.

const CASOS = fs
  .readdirSync(path.join(__dirname, '..', 'site', 'src', 'content', 'work'))
  .filter((f) => f.endsWith('.es.md')).length;

const URL = '/scroll-world/';
const foco = (page) => page.locator('.parada.is-foco');

test.describe('scroll-world · contenido', () => {
  test.beforeEach(async ({ page }) => { await page.goto(URL, { waitUntil: 'domcontentloaded' }); });

  test('se presenta y no se indexa', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Iván Santander' })).toBeAttached();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('los casos van repartidos en dos islas y cada enlace existe', async ({ page, request }) => {
    const clinicos = await page.locator('#clinica .caso a.boton').evaluateAll((a) => a.map((e) => e.getAttribute('href')));
    const propios = await page.locator('#propios .caso a.boton').evaluateAll((a) => a.map((e) => e.getAttribute('href')));
    expect(clinicos).toHaveLength(10);
    expect(propios).toHaveLength(CASOS - 10);
    const todos = [...clinicos, ...propios];
    expect(new Set(todos).size).toBe(CASOS);
    for (const h of todos) expect((await request.get(String(h))).status(), String(h)).toBe(200);
  });

  test('el contenido sale de la fuente: trayectoria, reglas, stack y datos', async ({ page }) => {
    await expect(page.locator('.historial > li')).toHaveCount(7);
    await expect(page.locator('#taller-trabajo .reglas li')).toHaveCount(4);
    await expect(page.locator('#taller-lidero .reglas li')).toHaveCount(4);
    await expect(page.locator('#taller-stack .stack > div')).toHaveCount(4);
    const dato = (n) => page.locator('.datos > div', { hasText: n }).locator('dd');
    await expect(dato('Años')).toHaveText(String(new Date().getFullYear() - 2019));
    await expect(dato('Desde')).toHaveText('2019');
    await expect(dato('Casos')).toHaveText(String(CASOS));
    const hrefs = await page.locator('#contacto a').evaluateAll((a) => a.map((e) => e.getAttribute('href') || ''));
    expect(hrefs.some((h) => h.includes('linkedin.com/in/ivan-santander'))).toBe(true);
    expect(hrefs.some((h) => h.includes('github.com/ivansantander-hub'))).toBe(true);
    const texto = await page.content();
    expect(texto).not.toMatch(/SaaS/);
    expect(texto).toMatch(/Salud digital y fintech/);
  });

  test('sin pedir nada fuera del sitio y con las dos fuentes de la marca', async ({ page }) => {
    const externas = [];
    page.on('request', (r) => { if (!/^https?:\/\/(localhost|127\.0\.0\.1)/.test(r.url()) && !r.url().startsWith('data:')) externas.push(r.url()); });
    await page.goto(URL, { waitUntil: 'load' });
    expect(externas).toEqual([]);
    const familias = await page.evaluate(() => [...new Set([...document.querySelectorAll('body, body *')].map((e) => getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, '').trim()))]);
    expect(familias.filter((f) => !['Geist', 'Geist Mono', 'system-ui'].includes(f))).toEqual([]);
  });
});

test.describe('scroll-world · mundo (escritorio)', () => {
  test.skip(({ isMobile }) => isMobile, 'el vuelo es solo de escritorio');

  test.beforeEach(async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await expect(page.locator('html')).toHaveClass(/modo-mundo/);
  });

  test('empieza en la portada y en foco hay un solo panel', async ({ page }) => {
    await expect(foco(page)).toHaveCount(1);
    await expect(foco(page)).toHaveAttribute('id', 'p-inicio');
    await expect(page.locator('#mundo')).toHaveAttribute('viewBox', /.+/);
  });

  test('las flechas recorren las paradas de una en una y la cámara se mueve', async ({ page }) => {
    const vb0 = await page.locator('#mundo').getAttribute('viewBox');
    await page.keyboard.press('ArrowRight');
    await expect(foco(page)).toHaveAttribute('id', 'p-clinica', { timeout: 8000 });
    await page.keyboard.press('ArrowRight');
    await expect(foco(page)).toHaveAttribute('id', /^caso-/, { timeout: 8000 });
    await expect(page.locator('.edif.is-foco')).toHaveCount(1);
    expect(await page.locator('#mundo').getAttribute('viewBox')).not.toBe(vb0);
    await expect(page.locator('#hud-txt')).toContainText('Plataforma clínica');
    await page.keyboard.press('ArrowLeft');
    await expect(foco(page)).toHaveAttribute('id', 'p-clinica', { timeout: 8000 });
  });

  test('doble flecha seguida avanza dos paradas', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(foco(page)).toHaveAttribute('id', /^caso-/, { timeout: 10000 });
  });

  test('la navegación por capítulos lleva al taller y a la llegada', async ({ page }) => {
    await page.locator('.barra__nav a[data-cap="taller"]').click();
    await expect(foco(page)).toHaveAttribute('id', 'p-taller', { timeout: 10000 });
    await expect(page.locator('.barra__nav a[aria-current="true"]')).toHaveText('El taller');
    await page.keyboard.press('End');
    await expect(foco(page)).toHaveAttribute('id', 'p-contacto', { timeout: 10000 });
    await expect(page.locator('#p-contacto a.boton').first()).toBeVisible();
  });

  test('el foco del teclado se ve', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(foco(page)).toHaveAttribute('id', /^caso-/, { timeout: 8000 });
    await page.locator('.parada.is-foco a.boton').focus();
    const contorno = await page.locator('.parada.is-foco a.boton').evaluate((e) => getComputedStyle(e).outlineStyle);
    expect(contorno).not.toBe('none');
  });
});

test.describe('scroll-world · alternativas', () => {
  test('en móvil es una lista legible sin scroll horizontal', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'solo móvil');
    await page.goto(URL, { waitUntil: 'load' });
    await expect(page.locator('html')).not.toHaveClass(/modo-mundo/);
    await expect(page.locator('#clinica .caso').first()).toBeVisible();
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(sobra).toBeLessThanOrEqual(0);
  });

  test('con movimiento reducido no hay vuelo', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(URL, { waitUntil: 'load' });
    await expect(p.locator('html')).not.toHaveClass(/modo-mundo/);
    await expect(p.locator('#taller-trayectoria')).toBeVisible();
    await ctx.close();
  });

  test('sin JavaScript el contenido y los enlaces están', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(URL, { waitUntil: 'load' });
    await expect(p.locator('.caso')).toHaveCount(CASOS);
    await expect(p.locator('#p-contacto a.boton').first()).toBeVisible();
    await ctx.close();
  });
});
