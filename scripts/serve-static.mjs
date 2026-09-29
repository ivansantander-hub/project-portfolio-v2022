import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'site', 'dist');
const port = process.env.PORT || '3000';

if (!existsSync(dist)) {
  console.error('Missing site/dist. Run `pnpm run build` before starting.');
  process.exit(1);
}

const require = createRequire(path.join(root, 'package.json'));
const serveCli = require.resolve('serve/build/main.js');

// Sin `-s`: el sitio es multipágina (dist/<ruta>/index.html). En modo SPA
// `serve` reescribe TODA ruta a /index.html antes de buscar el archivo, así
// que /trabajo/, /sobre-mi/, /en/… servían la home en español.
const child = spawn(
  process.execPath,
  [serveCli, dist, '-l', `tcp://0.0.0.0:${port}`],
  { stdio: 'inherit', cwd: root }
);

child.on('exit', (code) => process.exit(code ?? 0));
