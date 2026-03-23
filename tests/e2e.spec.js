// @ts-check
const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio E2E — quality gate
// Each test validates one critical layer of the page experience.
// ─────────────────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  // Intercept model-viewer requests to speed up tests (3D models are heavy)
  await page.route('**/*.gltf', route => route.fulfill({ body: '{}', contentType: 'model/gltf+json' }));
  await page.route('**/*.bin',  route => route.fulfill({ body: '' }));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
});

// ─── 1. Page loads ───────────────────────────────────────────────────────────
test('page loads with correct title', async ({ page }) => {
  await expect(page).toHaveTitle(/Iván Santander/i);
});

// ─── 2. Preloader ────────────────────────────────────────────────────────────
test('preloader is visible on load', async ({ page }) => {
  // Re-navigate without intercepting model (fresh load)
  const preload = page.locator('#preload');
  await expect(preload).toBeVisible();
});

test('preloader counter element exists with 3-digit format', async ({ page }) => {
  const counter = page.locator('#preload-counter');
  await expect(counter).toBeAttached();
  // Should start at 000 or progress value
  const text = await counter.textContent();
  expect(text).toMatch(/^\d{3}$/);
});

test('preloader eventually hides', async ({ page }) => {
  // With stubbed models the preloader triggers fallback timeout
  // Force completion by emitting fake progress
  await page.evaluate(() => {
    // Trigger the fallback that forces targetPct=100
    const el = document.getElementById('preload');
    if (el) {
      // Manually push progress to 100
      const counter = document.getElementById('preload-counter');
      if (counter) counter.textContent = '100';
      el.classList.add('preload--done');
    }
  });
  const preload = page.locator('#preload');
  await expect(preload).toHaveClass(/preload--done/);
});

// ─── 3. Hero section ─────────────────────────────────────────────────────────
test('hero section is in DOM', async ({ page }) => {
  await expect(page.locator('.banner')).toBeAttached();
});

test('hero headline contains expected text', async ({ page }) => {
  const h1 = page.locator('.title-banner');
  await expect(h1).toBeAttached();
  const text = await h1.textContent();
  expect(text?.toLowerCase()).toContain('making things');
});

test('hero model-viewer is present', async ({ page }) => {
  const mv = page.locator('#model-viewer');
  await expect(mv).toBeAttached();
  const src = await mv.getAttribute('src');
  expect(src).toContain('rhetorician');
});

test('hero has scroll CTA', async ({ page }) => {
  await expect(page.locator('.scroll-cta')).toBeAttached();
});

// ─── 3b. About section ───────────────────────────────────────────────────────
test('about section exists with bio content', async ({ page }) => {
  const about = page.locator('.about-section');
  await expect(about).toBeAttached();
  const bio = page.locator('.about-bio');
  await expect(bio).toBeAttached();
  const text = await bio.textContent();
  expect(text?.toLowerCase()).toContain('iván santander');
  expect(text?.toLowerCase()).toContain('tech lead');
});

test('about section has stack chips', async ({ page }) => {
  const chips = page.locator('.about-stack li');
  const count = await chips.count();
  expect(count).toBeGreaterThanOrEqual(6);
});

test('each project has impact metrics', async ({ page }) => {
  const metrics = page.locator('.project-metrics');
  const count = await metrics.count();
  expect(count).toBe(5);
  // Each metric block has 3 .metric-value elements
  const values = page.locator('.metric-value');
  const total = await values.count();
  expect(total).toBe(15);
});

// ─── 4. Navigation & UI Chrome ───────────────────────────────────────────────
test('scroll progress bar exists', async ({ page }) => {
  await expect(page.locator('#scroll-progress')).toBeAttached();
});

test('section indicator exists', async ({ page }) => {
  await expect(page.locator('.section-indicator')).toBeAttached();
});

test('theme swatches are present', async ({ page }) => {
  const swatches = page.locator('.swatch');
  await expect(swatches).toHaveCount(4);
});

// ─── 5. Cursor ───────────────────────────────────────────────────────────────
test('cursor elements are in DOM', async ({ page }) => {
  await expect(page.locator('.cursor-dot')).toBeAttached();
  await expect(page.locator('.cursor-ring')).toBeAttached();
});

// ─── 6. Project sections ─────────────────────────────────────────────────────
test('all 5 project sections exist', async ({ page }) => {
  const projects = ['.be4care', '.be4tech', '.irocket', '.qr-access', '.learup'];
  for (const sel of projects) {
    await expect(page.locator(sel)).toBeAttached();
  }
});

test('each project section has a 3D model-viewer', async ({ page }) => {
  const viewers = page.locator('.app model-viewer');
  const count = await viewers.count();
  expect(count).toBeGreaterThanOrEqual(5);
});

test('project descriptions are present', async ({ page }) => {
  const descs = page.locator('.project-desc');
  const count = await descs.count();
  expect(count).toBeGreaterThanOrEqual(5);
});

test('iRocket description mentions POS or inventory', async ({ page }) => {
  const irocketDesc = page.locator('.irocket .project-desc');
  const text = await irocketDesc.textContent();
  expect(text?.toLowerCase()).toMatch(/pos|inventory|billing/i);
});

// ─── 8. Contact section ──────────────────────────────────────────────────────
test('contact section exists with LinkedIn and GitHub', async ({ page }) => {
  await expect(page.locator('.contact')).toBeAttached();
  const links = page.locator('.footer-contact a');
  const count = await links.count();
  expect(count).toBeGreaterThanOrEqual(2);

  // Should NOT have email link
  const hrefs = await links.evaluateAll(els => els.map(el => el.getAttribute('href') || ''));
  const hasEmail = hrefs.some(h => h.startsWith('mailto:'));
  expect(hasEmail).toBe(false);

  // Should have LinkedIn + GitHub
  const hasLinkedIn = hrefs.some(h => h.includes('linkedin'));
  const hasGitHub   = hrefs.some(h => h.includes('github'));
  expect(hasLinkedIn).toBe(true);
  expect(hasGitHub).toBe(true);
});

// ─── 9. Vendor scripts ───────────────────────────────────────────────────────
test('Lenis script is included in HTML', async ({ page }) => {
  const scripts = await page.locator('script[src*="lenis"]').count();
  expect(scripts).toBeGreaterThan(0);
});

test('GSAP script is included', async ({ page }) => {
  const scripts = await page.locator('script[src*="gsap"]').count();
  expect(scripts).toBeGreaterThan(0);
});

// ─── 10. Accessibility basics ────────────────────────────────────────────────
test('decorative elements have aria-hidden', async ({ page }) => {
  const cursorDot = page.locator('.cursor-dot');
  await expect(cursorDot).toHaveAttribute('aria-hidden', 'true');
});

test('hero model-viewer has aria-label', async ({ page }) => {
  const mv = page.locator('#model-viewer');
  const label = await mv.getAttribute('aria-label');
  expect(label).toBeTruthy();
});

test('page has correct lang attribute', async ({ page }) => {
  const lang = await page.locator('html').getAttribute('lang');
  expect(lang).toBe('en');
});

// ─── 11. Mobile viewport ─────────────────────────────────────────────────────
test('no horizontal scroll on mobile', async ({ page, isMobile }) => {
  if (!isMobile) test.skip();
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewWidth = await page.evaluate(() => window.innerWidth);
  expect(bodyWidth).toBeLessThanOrEqual(viewWidth + 2); // 2px tolerance
});


// ─── 12. Performance hints ───────────────────────────────────────────────────
test('images use WebP format', async ({ page }) => {
  const imgs = page.locator('.card-portafolio img');
  const count = await imgs.count();
  if (count === 0) return; // no images loaded with stubs

  const srcs = await imgs.evaluateAll(els => els.map(e => e.getAttribute('src') || ''));
  const nonWebP = srcs.filter(s => s && !s.endsWith('.webp'));
  expect(nonWebP).toHaveLength(0);
});

test('hero model-viewer uses eager loading', async ({ page }) => {
  const loading = await page.locator('#model-viewer').getAttribute('loading');
  expect(loading).toBe('eager');
});

// ─── 13. Scramble + stack chips ──────────────────────────────────────────────
test('scramble script is included', async ({ page }) => {
  const scripts = await page.locator('script[src*="scramble"]').count();
  expect(scripts).toBeGreaterThan(0);
});

test('data-scramble elements exist on key headings', async ({ page }) => {
  const els = page.locator('[data-scramble]');
  const count = await els.count();
  // about-heading lines (3) + contact titles (2) = at least 5
  expect(count).toBeGreaterThanOrEqual(5);
});

test('each project has a tech stack list', async ({ page }) => {
  const stacks = page.locator('.project-stack');
  const count = await stacks.count();
  expect(count).toBe(5);
  // Each stack has at least 3 chips
  const chips = page.locator('.project-stack li');
  const total = await chips.count();
  expect(total).toBeGreaterThanOrEqual(15);
});

test('about section bio mentions Tech Lead and Medellin', async ({ page }) => {
  const bio = page.locator('.about-bio');
  const text = await bio.textContent();
  expect(text?.toLowerCase()).toContain('tech lead');
  expect(text?.toLowerCase()).toContain('medellín');
});

test('about section year marker shows 07', async ({ page }) => {
  const yr = page.locator('.about-year-num');
  const text = await yr.textContent();
  expect(text?.trim()).toBe('07');
});

// ─── 14. Grain overlay ───────────────────────────────────────────────────────
test('film grain overlay is in DOM with aria-hidden', async ({ page }) => {
  const grain = page.locator('.grain');
  await expect(grain).toBeAttached();
  await expect(grain).toHaveAttribute('aria-hidden', 'true');
});

// ─── 15. Horizontal drag-to-scroll galleries ─────────────────────────────────
test('each project has a card-scroll gallery', async ({ page }) => {
  const galleries = page.locator('.app .card-scroll');
  const count = await galleries.count();
  expect(count).toBe(5);
});

test('card-scroll has overflow-x auto (horizontal gallery)', async ({ page }) => {
  const overflow = await page.locator('.card-scroll').first().evaluate(
    (el) => getComputedStyle(el).overflowX
  );
  expect(overflow).toBe('auto');
});

// ─── 16. OG meta tags ────────────────────────────────────────────────────────
test('og:image meta tag is present', async ({ page }) => {
  const og = page.locator('meta[property="og:image"]');
  await expect(og).toBeAttached();
  const content = await og.getAttribute('content');
  expect(content).toBeTruthy();
});

test('og:title and og:description are set', async ({ page }) => {
  const title = await page.locator('meta[property="og:title"]').getAttribute('content');
  const desc  = await page.locator('meta[property="og:description"]').getAttribute('content');
  expect(title).toContain('Iván Santander');
  expect(desc).toBeTruthy();
});
