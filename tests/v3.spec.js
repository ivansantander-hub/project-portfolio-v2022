// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

// Página independiente en /v3/ (site/public/v3). No comparte nada con el resto del sitio;
// estas pruebas comprueban que se presenta bien y que no se rompe lo que enlaza.

const CASOS = fs
  .readdirSync(path.join(__dirname, '..', 'site', 'src', 'content', 'work'))
  .filter((f) => f.endsWith('.es.md')).length;
const PROHIBIDAS = /\b(crudo|raw|lcd|rave|arco[ií]ris|rainbow|kawaii)\b/i;

test.describe('v3', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/v3/', { waitUntil: 'domcontentloaded' });
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
    await p.goto('/v3/', { waitUntil: 'domcontentloaded' });
    const dur = await p.evaluate(() => getComputedStyle(document.querySelector('.rueda')).animationDuration);
    expect(dur).toBe('0s');
    await ctx.close();
  });
});
