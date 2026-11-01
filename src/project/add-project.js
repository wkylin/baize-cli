import fs from 'node:fs';
import path from 'node:path';
import { configureApp, copyAppTemplate } from './app.js';
import { configureVueApp } from './vue.js';
import { getTemplate } from './templates.js';
import { validateProjectName } from './create.js';

function findMultiRoot(start) {
  let directory = path.resolve(start);
  for (;;) {
    const marker = path.join(directory, '.baize.json');
    if (
      fs.existsSync(marker) &&
      JSON.parse(fs.readFileSync(marker, 'utf8')).mode === 'multi'
    )
      return directory;
    const parent = path.dirname(directory);
    if (parent === directory)
      throw new Error(
        'Run add project inside a Baize multi-project workspace.'
      );
    directory = parent;
  }
}

export function addProject(slug, options = {}) {
  validateProjectName(slug);
  const root = findMultiRoot(options.cwd || process.cwd());
  const configPath = path.join(root, 'workspace.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const marker = JSON.parse(
    fs.readFileSync(path.join(root, '.baize.json'), 'utf8')
  );
  const isVue = marker.template === 'vue-admin';
  const template = getTemplate(marker.template).directory;
  const target = path.join(root, 'apps', slug);
  if (fs.existsSync(target))
    throw new Error(`Project already exists: ${target}`);
  const title =
    options.title === undefined
      ? slug
          .split('-')
          .map((part) => part[0].toUpperCase() + part.slice(1))
          .join(' ')
      : options.title.trim();
  if (!title || title.length > 40)
    throw new Error('Project title must contain 1 to 40 characters.');
  const port = Math.max(...config.apps.map((app) => app.port)) + 1;
  const staging = fs.mkdtempSync(path.join(root, 'apps', `.${slug}.baize-`));
  try {
    copyAppTemplate(template, staging);
    (isVue ? configureVueApp : configureApp)(staging, {
      name: `${path.basename(root)}-${slug}`,
      title,
      packageManager: config.packageManager,
      bundler: config.bundler,
      wui: config.wui,
      storybookPort: 6006 + port - 5173,
    });
    fs.renameSync(staging, target);
    config.apps.push({ name: slug, port });
    fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  } finally {
    if (fs.existsSync(staging))
      fs.rmSync(staging, { recursive: true, force: true });
  }
  return target;
}
