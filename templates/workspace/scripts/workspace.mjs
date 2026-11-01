import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'workspace.json'), 'utf8'));
const task = process.argv[2];
const manager = config.packageManager;

function run(app, script) {
  const result = spawnSync(manager, ['run', script], {
    cwd: path.join(root, 'apps', app.name),
    env: { ...process.env, PORT: String(app.port) },
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${app.name}: ${script} failed`);
}

if (task === 'dev' || task === 'storybook') {
  const children = config.apps.map((app) => spawn(manager, ['run', task], {
    cwd: path.join(root, 'apps', app.name),
    env: { ...process.env, PORT: String(app.port) },
    stdio: 'inherit',
  }));
  function stop(signal = 'SIGTERM') {
    for (const child of children) child.kill(signal);
  }
  process.on('SIGINT', () => stop('SIGINT'));
  process.on('SIGTERM', () => stop());
  for (const child of children) child.on('exit', (code) => {
    if (code && !process.exitCode) process.exitCode = code;
    if (code) stop();
  });
} else if (task === 'quality') {
  for (const script of ['lint', 'typecheck', 'test', 'build']) {
    for (const app of config.apps) run(app, script);
  }
} else if (['lint', 'typecheck', 'test', 'build', 'build:storybook'].includes(task)) {
  for (const app of config.apps) run(app, task);
} else {
  throw new Error(`Unknown workspace task: ${task}`);
}
