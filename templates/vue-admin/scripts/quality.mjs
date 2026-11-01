import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8')
);
const manager = manifest.packageManager?.startsWith('pnpm@') ? 'pnpm' : 'npm';

const check = spawnSync(process.execPath, ['scripts/check-dependencies.mjs'], {
  cwd: root,
  stdio: 'inherit',
});
if (check.error) throw check.error;
if (check.status !== 0) process.exit(check.status || 1);

for (const task of ['lint', 'typecheck', 'test', 'build']) {
  const result = spawnSync(manager, ['run', task], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
