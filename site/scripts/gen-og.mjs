/**
 * gen-og.mjs
 * Generates dist/img/og.jpg from src/og-card.html using Playwright.
 * Run once via: pnpm og
 * Output: 1200×630px JPEG (the standard OG image size).
 */

import { chromium }       from '@playwright/test';
import { join, dirname }  from 'node:path';
import { fileURLToPath }  from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';

const root    = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir  = join(root, 'dist', 'img');
const outFile = join(outDir, 'og.jpg');
const srcFile = join(root, 'src', 'og-card.html');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page    = await browser.newPage();

await page.setViewportSize({ width: 1200, height: 630 });
await page.goto(`file://${srcFile.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });

// Small wait for fonts / filters to render
await page.waitForTimeout(800);

await page.screenshot({
  path:    outFile,
  type:    'jpeg',
  quality: 92,
  clip:    { x: 0, y: 0, width: 1200, height: 630 },
});

await browser.close();
console.log('[og] Generated →', outFile);
