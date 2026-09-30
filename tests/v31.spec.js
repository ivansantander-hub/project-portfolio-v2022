// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

// Página independiente en /v3.1/ (carpeta site/public/v3-1, con reescritura en serve.json). No comparte nada con el resto del sitio;
// estas pruebas comprueban que se presenta bien y que no se rompe lo que enlaza.

const CASOS = fs
  .readdirSync(path.join(__dirname, '..', 'site', 'src', 'content', 'work'))
  .filter((f) => f.endsWith('.es.md')).length;
const PROHIBIDAS = /\b(crudo|raw|lcd|rave|arco[ií]ris|rainbow|kawaii)\b/i;

test.describe('v3.1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/v3.1/', { waitUntil: 'domcontentloaded' });
  });

  test('se presenta de un vistazo: nombre, cargo y ciudad', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Iván Santander' })).toBeVisible();
    await expect(page.locator('.cargo')).toContainText('Tech Lead y Technical Product Owner');
    await expect(page.locator('.lugar')).toHaveText('Medellín, Colombia');
  });

  test('la barra lleva a casos, sobre mí y contacto', async ({ page }) => {
    const hrefs = await page.locator('.barra__nav a').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    expect(hrefs).toEqual(['#casos', '#sobre-mi', '#contacto']);
    for (const h of hrefs) await expect(page.locator(String(h))).toHaveCount(1);
    await expect(page.locator('.barra__atras')).toHaveAttribute('href', '/');
  });

  test('cada caso enlaza a una página que existe', async ({ page, request }) => {
    const hrefs = await page.locator('.calle a').evaluateAll((els) => els.map((e) => e.getAttribute('href') || ''));
    expect(hrefs).toHaveLength(CASOS);
    expect(new Set(hrefs).size).toBe(CASOS);
    for (const h of hrefs) {
      const r = await request.get(h);
      expect(r.status(), h).toBe(200);
    }
  });

  test('el contacto solo muestra datos verdaderos', async ({ page }) => {
    const anios = new Date().getFullYear() - 2019;
    await expect(page.locator('#dato-anios')).toHaveText(String(anios));
    await expect(page.locator('.ficha__datos')).toContainText('2019');
    await expect(page.locator('.ficha__datos')).toContainText(String(CASOS));
    const hrefs = await page.locator('.ficha__enlaces a').evaluateAll((els) => els.map((e) => e.getAttribute('href') || ''));
    expect(hrefs.some((h) => h.includes('linkedin.com/in/ivan-santander'))).toBe(true);
    expect(hrefs.some((h) => h.includes('github.com/ivansantander-hub'))).toBe(true);
  });

  test('sin texto de relleno ni nombres de la dirección anterior', async ({ page }) => {
    const texto = await page.locator('body').innerText();
    expect(texto).not.toMatch(PROHIBIDAS);
    const fuente = await page.content();
    expect(fuente).not.toMatch(PROHIBIDAS);
  });

  test('no hay scroll horizontal', async ({ page }) => {
    await page.waitForTimeout(400);
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(sobra).toBeLessThanOrEqual(0);
  });

  test('con movimiento reducido las animaciones se apagan', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto('/v3.1/', { waitUntil: 'domcontentloaded' });
    const dur = await p.evaluate(() => getComputedStyle(document.querySelector('.rueda')).animationDuration);
    expect(dur).toBe('0s');
    await ctx.close();
  });

  test('/v3.1 sin barra final también responde con la página', async ({ request }) => {
    for (const ruta of ['/v3.1', '/v3.1/']) {
      const r = await request.get(ruta);
      expect(r.status(), ruta).toBe(200);
      expect(await r.text(), ruta).toContain('Iván Santander');
    }
  });

  test('la ruta lateral tiene una parada por sección y marca la actual', async ({ page }) => {
    const hrefs = await page.locator('.ruta a').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    expect(hrefs).toEqual(['#inicio', '#casos', '#sobre-mi', '#contacto']);
    await page.locator('#contacto').scrollIntoViewIfNeeded();
    await expect(page.locator('.ruta a[aria-current="true"]')).toHaveAttribute('href', '#contacto');
  });

  test('carga sin errores ni peticiones fallidas (los huecos de foto no piden nada)', async ({ browser }) => {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    const fallos = [];
    p.on('pageerror', (e) => fallos.push(e.message));
    p.on('requestfailed', (r) => fallos.push('requestfailed ' + r.url()));
    p.on('response', (r) => { if (r.status() >= 400) fallos.push(r.status() + ' ' + r.url()); });
    await p.goto('/v3.1/', { waitUntil: 'load' });
    await p.waitForTimeout(800);
    await ctx.close();
    expect(fallos).toEqual([]);
  });

  test('la intro de cinta termina sola y deja la página usable', async ({ page }) => {
    await page.waitForTimeout(1800);
    const op = await page.evaluate(() => getComputedStyle(document.querySelector('.carga')).visibility);
    expect(op).toBe('hidden');
  });

  test('pulsar y arrastrar sobre el fondo no rompe nada (spray)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'el spray es solo de ratón');
    await page.mouse.move(400, 200);
    await page.mouse.down();
    await page.mouse.move(700, 260, { steps: 8 });
    await page.mouse.up();
    await expect(page.getByRole('heading', { level: 1, name: 'Iván Santander' })).toBeVisible();
  });

  test('los fotogramas de referencia están en la página y cargan', async ({ page }) => {
    await page.waitForTimeout(600);
    const figuras = page.locator('figure img');
    expect(await figuras.count()).toBe(4);
    for (const img of await figuras.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
      expect(await img.getAttribute('alt')).toBeTruthy();
    }
    await expect(page.locator('.pie__credito')).toContainText('referencia visual');
  });

  test('el corte de cinta con foto no bloquea los clics ni deja rastro', async ({ page }) => {
    await page.locator('#sobre-mi').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    const pe = await page.evaluate(() => getComputedStyle(document.querySelector('.corte')).pointerEvents);
    expect(pe).toBe('none');
    await page.waitForTimeout(1200);
    const vis = await page.evaluate(() => getComputedStyle(document.querySelector('.corte')).visibility);
    expect(vis).toBe('hidden');
    await page.locator('.barra__nav a[href="#contacto"]').click();
    await expect(page.locator('#contacto')).toBeInViewport();
  });
});
