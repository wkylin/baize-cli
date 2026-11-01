import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8')
);
const dependencies = {
  ...manifest.dependencies,
  ...manifest.devDependencies,
};

function installed(name) {
  for (let directory = root; ; directory = path.dirname(directory)) {
    const packageFile = path.join(
      directory,
      'node_modules',
      name,
      'package.json'
    );
    if (fs.existsSync(packageFile)) {
      try {
        return JSON.parse(fs.readFileSync(packageFile, 'utf8')).name === name;
      } catch {
        return false;
      }
    }
    if (directory === path.dirname(directory)) return false;
  }
}

const missing = Object.keys(dependencies).filter((name) => !installed(name));
if (missing.length) {
  let installRoot = root;
  if (fs.existsSync(path.join(path.dirname(root), 'workspace.json')))
    installRoot = path.dirname(root);
  const manager = manifest.packageManager?.startsWith('pnpm@') ? 'pnpm' : 'npm';
  console.error(`Missing or incomplete dependencies: ${missing.join(', ')}`);
  console.error(
    `Run ${manager} install in ${installRoot}, then restart the dev server.`
  );
  process.exitCode = 1;
}
