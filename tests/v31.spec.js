// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

// v3.1 «La ruta» (site/public/v3-1, servida en /v3.1/). Una noche en moto por Medellín:
// radio → loma → dos barrios de murales → taller → llegada. Página independiente del sitio.

const RAIZ = path.join(__dirname, '..');
const CASOS = fs.readdirSync(path.join(RAIZ, 'site', 'src', 'content', 'work')).filter((f) => f.endsWith('.es.md')).length;
const PROHIBIDAS = /\b(crudo|raw|lcd|rave|arco[ií]ris|rainbow|kawaii)\b/i;
const MARCAS = /\b(yamaha|puma|nike|playstation|mortal kombat)\b/i;

async function entrar(page, conMusica = false) {
  await page.goto('/v3.1/', { waitUntil: 'load' });
  await expect(page.locator('#radio')).toBeVisible();
  await page.click(conMusica ? '#encender' : '#sinmusica');
  await expect(page.locator('#radio')).toBeHidden();
}
const enViaje = (page) => page.evaluate(() => document.documentElement.classList.contains('modo-viaje'));

test.describe('v3.1 · La ruta', () => {
  test('la radio va primero y no pide audio hasta que hay un gesto', async ({ page }) => {
    const mp3 = [];
    page.on('request', (r) => { if (/\.mp3/.test(r.url())) mp3.push(r.url()); });
    await page.goto('/v3.1/', { waitUntil: 'load' });
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('input[name="cancion"]')).toHaveCount(2);
    await expect(page.locator('#sinmusica')).toBeVisible();
    const a = await page.evaluate(() => { const e = document.getElementById('cancion'); return { paused: e.paused, preload: e.preload, src: e.getAttribute('src') }; });
    expect(a).toEqual({ paused: true, preload: 'none', src: null });
    await page.waitForTimeout(600);
    expect(mp3).toEqual([]);
  });

  test('se puede entrar sin música y la canción sigue en pausa', async ({ page }) => {
    await entrar(page, false);
    await expect(page.getByRole('heading', { level: 1, name: 'Iván Santander' })).toBeVisible();
    await expect(page.locator('.rol')).toHaveText('Tech Lead y Technical Product Owner');
    expect(await page.evaluate(() => document.getElementById('cancion').paused)).toBe(true);
    await expect(page.locator('#audio')).toBeVisible();
  });

  test('Encender arranca la canción; los controles cambian, pausan y silencian', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'la prueba de audio usa Chromium');
    await entrar(page, true);
    await expect.poll(() => page.evaluate(() => !document.getElementById('cancion').paused), { timeout: 8000 }).toBe(true);
    await expect(page.locator('#audio-titulo')).toHaveText('El estren');
    await page.click('#a-sig');
    await expect.poll(() => page.evaluate(() => document.getElementById('cancion').getAttribute('src'))).toBe('/audio/india-conocida.mp3');
    expect(await page.evaluate(() => localStorage.getItem('ruta:cancion'))).toBe('1');
    await page.click('#a-mudo');
    await expect(page.locator('#a-mudo')).toHaveAttribute('aria-pressed', 'true');
    await page.click('#a-play');
    await expect.poll(() => page.evaluate(() => document.getElementById('cancion').paused)).toBe(true);
  });

  test('la pestaña oculta pausa la música y al volver se reanuda', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'la prueba de audio usa Chromium');
    await entrar(page, true);
    await expect.poll(() => page.evaluate(() => !document.getElementById('cancion').paused), { timeout: 8000 }).toBe(true);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    await expect.poll(() => page.evaluate(() => document.getElementById('cancion').paused)).toBe(true);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    await expect.poll(() => page.evaluate(() => !document.getElementById('cancion').paused), { timeout: 5000 }).toBe(true);
  });

  test('los 18 casos existen, en dos barrios (10 y 8), y todos los enlaces responden 200', async ({ page, request }) => {
    await page.goto('/v3.1/', { waitUntil: 'domcontentloaded' });
    expect(await page.locator('#barrio-clinica .mural__a').count()).toBe(10);
    expect(await page.locator('#barrio-propios .mural__a').count()).toBe(8);
    const hrefs = await page.locator('.mural__a').evaluateAll((els) => els.map((e) => e.getAttribute('href') || ''));
    expect(hrefs).toHaveLength(CASOS);
    expect(new Set(hrefs).size).toBe(CASOS);
    for (const h of hrefs) expect((await request.get(h)).status(), h).toBe(200);
  });

  test('el recorrido con las flechas: un solo mural en foco a la vez y la moto no cambia', async ({ page }) => {
    await entrar(page);
    test.skip(!(await enViaje(page)), 'el recorrido horizontal es del escritorio');
    const src = await page.locator('.moto__img').getAttribute('src');
    await page.keyboard.press('ArrowRight');                         // letrero del barrio
    await page.keyboard.press('ArrowRight');                         // primer mural
    await expect(page.locator('.mural.is-foco')).toHaveCount(1, { timeout: 9000 });
    await expect(page.locator('.mural.is-foco .mural__a')).toHaveAttribute('href', /\/trabajo\/.+\//);
    await expect(page.locator('#rn-barrio')).toHaveText('Plataforma clínica');
    await expect(page.locator('#rn-n')).toHaveText('1 / 10');
    await expect(page.locator('.mural.is-foco')).toBeInViewport();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#rn-n')).toHaveText('2 / 10', { timeout: 9000 });
    await expect(page.locator('.mural.is-foco')).toHaveCount(1);
    expect(await page.locator('.moto__img').getAttribute('src')).toBe(src);
    expect(await page.locator('.moto__img').count()).toBe(1);        // una sola moto, siempre la misma
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });

  test('los capítulos llevan a la loma, el taller y la llegada', async ({ page }) => {
    await entrar(page);
    test.skip(!(await enViaje(page)), 'el recorrido horizontal es del escritorio');
    await page.click('.capitulos a[data-cap="taller"]');
    await expect(page.locator('html')).toHaveAttribute('data-cap', 'taller', { timeout: 12000 });
    await expect(page.locator('.capitulos a[aria-current="true"]')).toHaveText('El taller');
    await page.click('.capitulos a[data-cap="llegada"]');
    await expect(page.locator('html')).toHaveAttribute('data-cap', 'llegada', { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Se busca' })).toBeInViewport();
    await page.click('.capitulos a[data-cap="loma"]');
    await expect(page.locator('html')).toHaveAttribute('data-cap', 'loma', { timeout: 15000 });
  });

  test('el taller revela el historial de servicio paso a paso', async ({ page }) => {
    await entrar(page);
    test.skip(!(await enViaje(page)), 'el recorrido horizontal es del escritorio');
    await page.click('.capitulos a[data-cap="taller"]');
    await expect(page.locator('html')).toHaveAttribute('data-cap', 'taller', { timeout: 12000 });
    await page.keyboard.press('ArrowRight');                          // la primera estación: el historial
    await expect(page.locator('.orden__it.es-ahora')).toHaveCount(1, { timeout: 9000 });
    expect(await page.locator('.orden__it.es-luego').count()).toBeGreaterThan(0);
  });

  test('el contenido es real: trayectoria, reglas, stack y los enlaces del cartel', async ({ page }) => {
    await page.goto('/v3.1/', { waitUntil: 'domcontentloaded' });
    expect(await page.locator('.orden__it').count()).toBe(7);
    expect(await page.locator('.regla').count()).toBe(4);
    expect(await page.locator('.herramienta').count()).toBe(21);
    await expect(page.locator('.taller__foco').first()).toContainText('arquitectura de sistemas');
    const html = await page.content();
    expect(html).not.toMatch(/SaaS/);
    expect(html).toMatch(/Salud digital y fintech/);
    const anios = new Date().getFullYear() - 2019;
    await expect(page.locator('.cartel__datos')).toContainText(String(anios));
    await expect(page.locator('.cartel__datos')).toContainText(String(CASOS));
    const enl = await page.locator('.cartel__enlaces a').evaluateAll((els) => els.map((e) => e.getAttribute('href') || ''));
    expect(enl.some((h) => h.includes('linkedin.com/in/ivan-santander'))).toBe(true);
    expect(enl.some((h) => h.includes('github.com/ivansantander-hub'))).toBe(true);
  });

  test('sin marcas, sin palabras de las direcciones anteriores y sin peticiones externas', async ({ page }) => {
    const hosts = new Set();
    page.on('request', (r) => { const u = new URL(r.url()); if (!/^(data|blob):/.test(u.protocol)) hosts.add(u.host); });
    await page.goto('/v3.1/', { waitUntil: 'load' });
    const html = await page.content();
    expect(html).not.toMatch(PROHIBIDAS);
    expect(html).not.toMatch(MARCAS);
    for (const f of ['v3.css', 'v3.js']) {
      expect(fs.readFileSync(path.join(RAIZ, 'site', 'public', 'v3-1', f), 'utf8'), f).not.toMatch(PROHIBIDAS);
    }
    expect([...hosts].filter((h) => !h.startsWith('127.0.0.1') && !h.startsWith('localhost'))).toEqual([]);
  });

  test('máximo tres familias de letra', async () => {
    const css = fs.readFileSync(path.join(RAIZ, 'site', 'public', 'v3-1', 'v3.css'), 'utf8');
    const familias = new Set([...css.matchAll(/font-family:\s*"([^"]+)"/g)].map((m) => m[1]));
    expect([...familias].sort()).toEqual(['Anton', 'Geist', 'Rubik Spray Paint']);
  });

  test('con movimiento reducido no hay recorrido horizontal ni golpes de cámara', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto('/v3.1/', { waitUntil: 'load' });
    await p.click('#sinmusica');
    expect(await enViaje(p)).toBe(false);
    const pos = await p.evaluate(() => ['#loma', '#barrio-clinica', '#barrio-propios', '#taller', '#llegada'].map((s) => Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY)));
    for (let i = 1; i < pos.length; i++) expect(pos[i], `capítulo ${i}`).toBeGreaterThan(pos[i - 1]);   // recorrido vertical simple
    expect(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    expect(await p.evaluate(() => getComputedStyle(document.getElementById('camara')).transform)).toBe('none');
    await ctx.close();
  });

  test('sin JavaScript: contenido completo y enlaces, sin radio', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto('/v3.1/', { waitUntil: 'load' });
    await expect(p.locator('#radio')).toBeHidden();
    await expect(p.locator('#audio')).toBeHidden();
    expect(await p.locator('.mural__a').count()).toBe(CASOS);
    await expect(p.getByRole('heading', { level: 1, name: 'Iván Santander' })).toHaveCount(1);
    await expect(p.locator('.orden__it').first()).toBeVisible();
    await expect(p.locator('.cartel__enlaces a').first()).toBeVisible();
    await ctx.close();
  });

  test('en móvil los murales son un carrusel con swipe y la página no se desborda', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'solo móvil');
    await entrar(page);
    expect(await enViaje(page)).toBe(false);
    const c = await page.evaluate(() => { const m = document.querySelector('.murales'); return { sw: m.scrollWidth, cw: m.clientWidth, snap: getComputedStyle(m).scrollSnapType }; });
    expect(c.sw).toBeGreaterThan(c.cw * 3);
    expect(c.snap).toContain('x');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });

  test('mantener espacio hace rugir la moto', async ({ page }) => {
    await entrar(page);
    test.skip(!(await enViaje(page)), 'el rugido con teclado es del recorrido de escritorio');
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.down('Space');
    await expect(page.locator('#moto')).toHaveClass(/rugiendo/, { timeout: 4000 });
    await page.keyboard.up('Space');
    await expect(page.locator('#moto')).not.toHaveClass(/rugiendo/, { timeout: 4000 });
  });

  test('el teclado llega a los controles con foco visible', async ({ page }) => {
    await page.goto('/v3.1/', { waitUntil: 'load' });
    await page.click('#sinmusica');
    await expect(page.locator('#empezar')).toBeFocused();
    await page.keyboard.press('Tab');
    const foco = await page.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); return { tag: e.tagName, contorno: s.outlineStyle !== 'none' || s.boxShadow !== 'none' }; });
    expect(['A', 'BUTTON', 'INPUT']).toContain(foco.tag);
    expect(foco.contorno).toBe(true);
  });
});
