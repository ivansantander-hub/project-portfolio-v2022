/**
 * gen-cv.mjs — hoja de vida en PDF (ES y EN) a partir de los mismos datos del
 * sitio: about.{es,en}.md (trayectoria, principios, stack) y los casos propios.
 * Así el PDF nunca dice algo distinto a la página.
 *
 *   npm run cv   → public/cv/ivan-santander-cv-es.pdf y -en.pdf
 *
 * Usa el Chromium de Playwright (dependencia de desarrollo de la raíz). Se
 * ejecuta a mano, como `npm run og`, y el PDF se versiona en el repo.
 */
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { chromium } from '@playwright/test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'cv');
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const T = {
  es: { contact: 'Contacto', exp: 'Trayectoria', how: 'Cómo trabajo y lidero', stack: 'Stack', projects: 'Proyectos propios', site: 'Portafolio' },
  en: { contact: 'Contact', exp: 'Experience', how: 'How I work and lead', stack: 'Stack', projects: 'Personal projects', site: 'Portfolio' },
};

function html(lang) {
  const t = T[lang];
  const about = matter(readFileSync(join(root, 'src/content/pages', `about.${lang}.md`), 'utf8')).data;
  const work = readdirSync(join(root, 'src/content/work'))
    .filter(f => f.endsWith(`.${lang}.md`))
    .map(f => matter(readFileSync(join(root, 'src/content/work', f), 'utf8')).data)
    .filter(d => !d.confidential)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .slice(0, 6);
  const facts = (about.facts || []).map(f => `<li><b>${esc(f.k)}:</b> ${esc(f.v)}</li>`).join('');
  const timeline = (about.timeline || []).map(e => `
    <div class="job">
      <div class="job__head"><h3>${esc(e.org)}</h3><span>${esc(e.period)}</span></div>
      ${(e.roles || []).map(r => `<p><b>${esc(r.role)}.</b> ${esc(r.text)}</p>`).join('')}
    </div>`).join('');
  const principles = (about.principles || []).flatMap(g => g.items || []).map(i => `<li>${esc(String(i.k).replace(/\.$/, ''))}</li>`).join('');
  const stack = (about.stack || []).map(s => `<p><b>${esc(s.k)}:</b> ${(s.items || []).map(esc).join(' · ')}</p>`).join('');
  const projects = work.map(d => `<li><b>${esc(d.project)}</b> — ${esc(d.cardLine || d.title)}</li>`).join('');
  return `<!doctype html><html lang="${lang}"><meta charset="utf-8"><title>${esc(about.name)} — CV</title>
<style>
  @page { size: A4; margin: 14mm 16mm; }
  * { box-sizing: border-box; margin: 0; }
  body { font: 10pt/1.45 -apple-system, "Helvetica Neue", Arial, sans-serif; color: #16181d; }
  header { display: grid; grid-template-columns: 1fr auto; gap: 8mm; align-items: end; padding-bottom: 5mm; border-bottom: 1.5pt solid #16181d; }
  h1 { font-size: 24pt; letter-spacing: -0.02em; }
  .lead { margin-top: 2mm; color: #3d424d; max-width: 120mm; }
  .contact { list-style: none; padding: 0; font-size: 8.5pt; text-align: right; color: #3d424d; }
  h2 { font-size: 8pt; letter-spacing: 0.14em; text-transform: uppercase; color: #5b6170; margin: 6mm 0 2.5mm; }
  .cols { display: grid; grid-template-columns: 1fr 62mm; gap: 9mm; }
  .job { margin-bottom: 3.5mm; break-inside: avoid; }
  .job__head { display: flex; justify-content: space-between; align-items: baseline; }
  .job__head h3 { font-size: 11pt; }
  .job__head span { font-size: 8.5pt; color: #5b6170; }
  .job p { margin-top: 1mm; color: #2a2e36; }
  ul { padding-left: 4mm; }
  li { margin-bottom: 1mm; }
  aside p { margin-bottom: 1.5mm; }
  .metrics { display: flex; gap: 7mm; margin-top: 4mm; }
  .metrics div b { display: block; font-size: 15pt; }
  .metrics div span { font-size: 8pt; color: #5b6170; }
</style>
<body>
  <header>
    <div>
      <h1>${esc(about.name)}</h1>
      <p class="lead">${esc(about.lead)}</p>
      <div class="metrics">${(about.metrics || []).map(m => `<div><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join('')}</div>
    </div>
    <ul class="contact">
      ${facts}
      <li>linkedin.com/in/ivan-santander</li>
      <li>github.com/ivansantander-hub</li>
      <li>${t.site}: ivansantander.com</li>
    </ul>
  </header>
  <div class="cols">
    <main>
      <h2>${t.exp}</h2>
      ${timeline}
    </main>
    <aside>
      <h2>${t.how}</h2>
      <ul>${principles}</ul>
      <h2>${t.stack}</h2>
      ${stack}
      <h2>${t.projects}</h2>
      <ul>${projects}</ul>
    </aside>
  </div>
</body></html>`;
}

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
for (const lang of ['es', 'en']) {
  const page = await browser.newPage();
  await page.setContent(html(lang), { waitUntil: 'load' });
  const file = join(outDir, `ivan-santander-cv-${lang}.pdf`);
  await page.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: true });
  const pages = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight / 1047));
  console.log(`[cv] ${file.replace(root + '/', '')}  ~${pages} página(s)`);
  await page.close();
}
await browser.close();
