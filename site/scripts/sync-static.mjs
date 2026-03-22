import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

if (!existsSync(dist)) {
  mkdirSync(dist, { recursive: true });
}

for (const sub of ['css', 'js']) {
  const from = join(root, 'public', sub);
  const to = join(dist, sub);
  if (existsSync(from)) {
    mkdirSync(to, { recursive: true });
    cpSync(from, to, { recursive: true });
  }
}
