// @ts-check
const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio E2E — quality gate for the v3 site (mini-astro + content
// collections, see site/scripts/build-content.mjs).
//
// v1 (organisms/HeroSection, model-viewer, GSAP hero pin, easter egg) is
// frozen and served separately at /v1/ — it is NOT covered here. These tests
// exercise the actual markup Doc.html + build-content.mjs produce today.
// ─────────────────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
});

// ─── 1. Page identity ────────────────────────────────────────────────────────
test('home loads with correct title and lang', async ({ page }) => {
  await expect(page).toHaveTitle(/Iván Santander/i);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});

// ─── 2. Header nav ────────────────────────────────────────────────────────────
test('header nav links to work, about, and the other language', async ({ page }) => {
  const nav = page.locator('.site-header__nav');
  await expect(page.locator('.site-header__mark')).toHaveAttribute('href', '/');
  await expect(nav.locator('.site-header__link').nth(0)).toHaveAttribute('href', '/trabajo/');
  await expect(nav.locator('.site-header__link').nth(1)).toHaveAttribute('href', '/sobre-mi/');
  await expect(nav.locator('.site-header__lang')).toHaveAttribute('href', '/en/');
  await expect(page.locator('#theme-toggle')).toBeAttached();
});

// ─── 3. Hero ──────────────────────────────────────────────────────────────────
test('hero shows name, statement, role chips and stats', async ({ page }) => {
  await expect(page.locator('.hero__name')).toHaveText('Iván Santander');
  await expect(page.locator('.hero__statement')).toBeVisible();
  await expect(page.locator('.hero__role')).toContainText('IA');
  await expect(page.locator('.hero__lead p')).toHaveCount(2);

  const stats = page.locator('.hero__readout > div');
  await expect(stats).toHaveCount(3);
});

test('hero CTAs point to work index and the contact anchor', async ({ page }) => {
  await expect(page.locator('.hero__actions .btn--primary')).toHaveAttribute('href', '/trabajo/');
  await expect(page.locator('.hero__actions .btn:not(.btn--primary)')).toHaveAttribute('href', '#contact');
});

// ─── 4. Thesis ────────────────────────────────────────────────────────────────
test('thesis section states the core argument', async ({ page }) => {
  await expect(page.locator('.thesis__title')).toHaveText('Enfoque');
  await expect(page.locator('.thesis__body')).toContainText('decidir qué simplificar');
});

// ─── 5. Work preview (home) — only featured cases ───────────────────────────
test('home shows only the 3 featured cases, plus a link to the full index', async ({ page }) => {
  const cards = page.locator('.work-preview .work-card');
  await expect(cards).toHaveCount(3);
  // Solo proyectos propios en la home, ninguno del trabajo en la plataforma de ensayos
  const hrefs = await page.locator('.work-preview .work-card__link').evaluateAll(as => as.map(a => a.getAttribute('href')));
  expect(hrefs).toEqual(['/trabajo/sgc/', '/trabajo/english/', '/trabajo/eco-loop/']);

  const more = page.locator('.work-preview__more a');
  await expect(more).toHaveAttribute('href', '/trabajo/');
  await expect(more).toContainText('Ver todos los casos');
});

test('each home work-card has project, title and arrow, and no NDA label', async ({ page }) => {
  const first = page.locator('.work-preview .work-card').first();
  await expect(first.locator('.work-card__project')).not.toBeEmpty();
  await expect(page.locator('.work-preview .work-card__state')).toHaveCount(0);
  await expect(first.locator('.work-card__title')).not.toBeEmpty();
  await expect(first.locator('.work-card__arrow')).toHaveText('Ver caso →');
});

// ─── 6. Secondary (Antes de esto) ────────────────────────────────────────────
test('secondary section lists earlier work as a scannable list', async ({ page }) => {
  await expect(page.locator('.secondary .section-title')).toHaveText('Antes de esto');
  const items = page.locator('.secondary .prose ul li');
  await expect(items).toHaveCount(4);
});

// ─── 7. Contact — real CTAs, no email ────────────────────────────────────────
test('contact section has LinkedIn + GitHub buttons and no mailto', async ({ page }) => {
  await expect(page.locator('.contact .section-title')).toHaveText('¿Hablamos?');

  const primary = page.locator('.contact__actions .btn--primary');
  await expect(primary).toHaveAttribute('href', /linkedin\.com/);
  await expect(primary).toHaveText('Escríbeme en LinkedIn');

  const secondary = page.locator('.contact__actions .btn:not(.btn--primary)');
  await expect(secondary).toHaveAttribute('href', /github\.com/);

  const hrefs = await page.locator('.contact__actions a').evaluateAll(
    (els) => els.map((el) => el.getAttribute('href') || ''),
  );
  expect(hrefs.some((h) => h.startsWith('mailto:'))).toBe(false);
});

test('contact title and body are properly spaced (no overlap)', async ({ page }) => {
  // Bounding-box math is unreliable here: the h2's box includes line-height
  // slack below its last glyph, so comparing edges directly gives false
  // positives/negatives depending on font metrics. Assert the actual fix
  // instead — the reset zeroes all margins, so a real gap only exists if
  // `.contact .prose` has a positive margin-top.
  const marginTop = await page.locator('.contact .prose').evaluate(
    (el) => parseFloat(getComputedStyle(el).marginTop),
  );
  expect(marginTop).toBeGreaterThan(20);
});

// ─── 8. Footer ────────────────────────────────────────────────────────────────
test('footer has LinkedIn and GitHub links', async ({ page }) => {
  const hrefs = await page.locator('.site-footer a').evaluateAll(
    (els) => els.map((el) => el.getAttribute('href') || ''),
  );
  expect(hrefs.some((h) => h.includes('linkedin.com'))).toBe(true);
  expect(hrefs.some((h) => h.includes('github.com'))).toBe(true);
});

// ─── 9. SEO / structured data ────────────────────────────────────────────────
test('SEO meta tags and JSON-LD are present', async ({ page }) => {
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Iván Santander/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ivansantander.com/');

  const ld = await page.locator('script[type="application/ld+json"]').textContent();
  const graph = JSON.parse(ld || '{}')['@graph'] || [];
  expect(graph.some((n) => n['@type'] === 'Person')).toBe(true);
});

test('sitemap.xml and robots.txt are served', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain('<urlset');

  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain('Sitemap:');
});

// ─── 10. Work index (/trabajo/) — one list, 18 cases ─────────────────────────
test('work index lists all 18 cases in a single list, without NDA labels', async ({ page }) => {
  await page.goto('/trabajo/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.work-index__list')).toHaveCount(1);
  await expect(page.locator('.work-index__list .work-card')).toHaveCount(18);
  await expect(page.locator('.work-card__title').first()).toHaveJSProperty('tagName', 'H2');
  // Primero los tres destacados de la home; después, todo mezclado
  const hrefs = await page.locator('.work-index__list .work-card__link').evaluateAll(as => as.map(a => a.getAttribute('href')));
  expect(hrefs.slice(0, 3)).toEqual(['/trabajo/sgc/', '/trabajo/english/', '/trabajo/eco-loop/']);
  await expect(page.locator('main')).not.toContainText(/NDA|confidencialidad/);
});

// ─── 11. Case pages — no NDA wording anywhere ────────────────────────────────
test('case pages have no NDA note; open cases show their metrics', async ({ page }) => {
  await page.goto('/trabajo/architecture-simplification/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.case__title')).not.toBeEmpty();
  await expect(page.locator('main')).not.toContainText(/NDA|confidencialidad|non-disclosure/i);
  await expect(page.locator('.link-back')).toHaveAttribute('href', '/trabajo/');

  await page.goto('/trabajo/sgc/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.case__metrics')).toBeVisible();
});

// ─── 12. About page ───────────────────────────────────────────────────────────
test('about page is reachable from nav and has bio content', async ({ page }) => {
  await page.goto('/sobre-mi/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.about__title')).not.toBeEmpty();
  const text = (await page.locator('.about').textContent() || '').toLowerCase();
  expect(text).toContain('tech lead');
  expect(text).toContain('medellín');
});

// ─── 13. EN parity — i18n regression coverage ────────────────────────────────
test('EN home has translated nav, statement and arrow text', async ({ page }) => {
  await page.goto('/en/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  const nav = page.locator('.site-header__nav');
  await expect(nav.locator('.site-header__link').nth(0)).toHaveAttribute('href', '/en/work/');
  await expect(nav.locator('.site-header__link').nth(1)).toHaveAttribute('href', '/en/about/');
  await expect(nav.locator('.site-header__lang')).toHaveAttribute('href', '/');

  await expect(page.locator('.hero__statement')).toContainText('Tech Lead');

  // Regression guard: the work-card arrow used to be hardcoded in Spanish
  // even on English pages ("Ver caso" instead of "See case").
  await expect(page.locator('.work-card__arrow').first()).toHaveText('See case →');
});

test('EN contact CTAs are translated', async ({ page }) => {
  await page.goto('/en/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.contact__actions .btn--primary')).toHaveText('Message me on LinkedIn');
  await expect(page.locator('.contact__actions .btn:not(.btn--primary)')).toHaveText('View GitHub');
});

test('EN work index lists all 18 cases in a single list', async ({ page }) => {
  await page.goto('/en/work/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.work-index__list')).toHaveCount(1);
  await expect(page.locator('.work-index__list .work-card')).toHaveCount(18);
  await expect(page.locator('main')).not.toContainText(/NDA|non-disclosure/);
});

// ─── 14. Theme toggle ─────────────────────────────────────────────────────────
test('theme toggle switches data-theme and aria-pressed', async ({ page }) => {
  const html = page.locator('html');
  const toggle = page.locator('#theme-toggle');

  await toggle.click();
  const first = await html.getAttribute('data-theme');
  expect(['light', 'dark']).toContain(first);
  await expect(toggle).toHaveAttribute('aria-pressed', String(first === 'light'));

  await toggle.click();
  const second = await html.getAttribute('data-theme');
  expect(second).not.toBe(first);
});

// ─── 15. Accessibility basics ─────────────────────────────────────────────────
test('decorative background elements are aria-hidden', async ({ page }) => {
  await expect(page.locator('.bg-shader')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.grain')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.cursor')).toHaveAttribute('aria-hidden', 'true');
});

test('skip link is the first focusable element', async ({ page }) => {
  await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main');
});

// ─── 16. Mobile viewport ──────────────────────────────────────────────────────
test('no horizontal scroll on mobile', async ({ page, isMobile }) => {
  if (!isMobile) test.skip();
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewWidth = await page.evaluate(() => window.innerWidth);
  expect(bodyWidth).toBeLessThanOrEqual(viewWidth + 2); // 2px tolerance
});

test('header nav fits without wrapping on mobile', async ({ page, isMobile }) => {
  if (!isMobile) test.skip();
  const nav = page.locator('.site-header__nav');
  const box = await nav.boundingBox();
  expect(box.height).toBeLessThan(60); // one row, not wrapped
});

// ─── Keyboard navigation (public/js/keys.js) ─────────────────────────────────
test('case pages link to the previous and next project in index order', async ({ page }) => {
  await page.goto('/trabajo/english/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a.case__pager-link[rel="prev"]')).toHaveAttribute('href', '/trabajo/sgc/');
  await expect(page.locator('a.case__pager-link[rel="next"]')).toHaveAttribute('href', '/trabajo/eco-loop/');

  await page.goto('/trabajo/sgc/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a.case__pager-link[rel="prev"]')).toHaveCount(0);

  await page.goto('/trabajo/dev-platform/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a.case__pager-link[rel="next"]')).toHaveCount(0);
});

test('← and → move between projects on a case page', async ({ page }) => {
  await page.goto('/trabajo/english/', { waitUntil: 'load' });
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/\/trabajo\/eco-loop\/$/);
  await page.waitForLoadState('load');
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/\/trabajo\/english\/$/);
});

test('arrows with a modifier are left to the browser', async ({ page }) => {
  await page.goto('/trabajo/english/', { waitUntil: 'load' });
  await page.keyboard.press('Alt+ArrowRight');
  await page.waitForTimeout(300);
  await expect(page).toHaveURL(/\/trabajo\/english\/$/);
});

test('on the work index, arrows move focus across projects and Enter opens one', async ({ page }) => {
  await page.goto('/trabajo/', { waitUntil: 'load' });
  const links = page.locator('.work-index__list .work-card__link');
  await page.keyboard.press('ArrowRight');
  await expect(links.nth(0)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(links.nth(1)).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(links.nth(0)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/trabajo\/english\/$/);
});

// ─── Two-column layout: case aside, TOC, header on scroll ────────────────────
test('case pages have a TOC with one entry per section, beside the text on wide screens', async ({ page, isMobile }) => {
  await page.goto('/trabajo/mini-astro/', { waitUntil: 'load' });
  const sections = page.locator('.case__body h2[id]');
  const tocLinks = page.locator('.case__aside .toc__list a');
  await expect(tocLinks).toHaveCount(await sections.count());
  await expect(tocLinks.first()).toHaveAttribute('href', '#' + await sections.first().getAttribute('id'));
  // Las llaves del texto se ven literales, no como variables vacías
  await expect(page.locator('.case__body')).toContainText('{{{ var }}}');
  if (!isMobile) {
    const body = await page.locator('.case__body').boundingBox();
    const aside = await page.locator('.case__aside').boundingBox();
    expect(aside.x).toBeGreaterThan(body.x + body.width);
    const intro = await page.locator('.case__intro').boundingBox();
    const panel = await page.locator('.case__panel').boundingBox();
    expect(panel.x).toBeGreaterThan(intro.x + intro.width);
  }
});

test('the header gets a solid background once the page scrolls', async ({ page }) => {
  await page.goto('/trabajo/mini-astro/', { waitUntil: 'load' });
  await expect(page.locator('.site-header')).not.toHaveClass(/is-scrolled/);
  await page.evaluate(() => window.scrollTo(0, 800));
  await expect(page.locator('.site-header')).toHaveClass(/is-scrolled/);
});

test('about page has a section TOC and contact links', async ({ page }) => {
  await page.goto('/sobre-mi/', { waitUntil: 'load' });
  await expect(page.locator('.about__aside .toc__list a')).toHaveCount(await page.locator('.about__main h2[id]').count());
  await expect(page.locator('.about__contact a')).toHaveCount(2);
});
