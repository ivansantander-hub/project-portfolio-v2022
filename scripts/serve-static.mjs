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

const child = spawn(
  process.execPath,
  [serveCli, dist, '-s', '-l', `tcp://0.0.0.0:${port}`],
  { stdio: 'inherit', cwd: root }
);

child.on('exit', (code) => process.exit(code ?? 0));
