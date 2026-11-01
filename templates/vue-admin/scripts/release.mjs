import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8')
);
const manager = manifest.packageManager?.startsWith('pnpm@') ? 'pnpm' : 'npm';
const workspaceFile = path.join(root, 'workspace.json');
const workspace = fs.existsSync(workspaceFile)
  ? JSON.parse(fs.readFileSync(workspaceFile, 'utf8'))
  : null;

const quality = spawnSync(manager, ['run', 'quality'], {
  cwd: root,
  stdio: 'inherit',
});
if (quality.error) throw quality.error;
if (quality.status !== 0) process.exit(quality.status || 1);

const output = path.join(root, 'release', manifest.version);
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
const apps = workspace?.apps.map((app) => app.name) || [manifest.name];

for (const app of apps) {
  const source = workspace
    ? path.join(root, 'apps', app, 'dist')
    : path.join(root, 'dist');
  if (!fs.existsSync(source))
    throw new Error(`Build output is missing: ${source}`);
  fs.cpSync(source, path.join(output, app), { recursive: true });
}

fs.writeFileSync(
  path.join(output, 'manifest.json'),
  `${JSON.stringify(
    {
      name: manifest.name,
      version: manifest.version,
      mode: workspace?.mode || 'single',
      bundler: 'vite',
      packageManager: manager,
      apps: apps.map((name) => ({ name, directory: name })),
      createdAt: new Date().toISOString(),
    },
    null,
    2
  )}\n`
);
console.log(`Release ready: ${output}`);
