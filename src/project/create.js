import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { getTemplate } from './templates.js';
import { normalizeOptions } from './options.js';
import { configureApp, copyAppTemplate } from './app.js';
import { configureVueApp } from './vue.js';
import { createWorkspace } from './workspace.js';
import { writeWorkflows } from './engineering.js';

export function validateProjectName(name) {
  if (
    typeof name !== 'string' ||
    name.length > 100 ||
    !/^[a-z][a-z0-9-]*$/.test(name)
  ) {
    throw new Error(
      'Project name must start with a lowercase letter, use only lowercase letters, numbers, and hyphens, and be at most 100 characters.'
    );
  }
  return name;
}

export function createProject(name, options = {}) {
  validateProjectName(name);
  const template = getTemplate(options.template || 'react-admin');
  if (template.name === 'vue-admin' && options.bundler === 'webpack')
    throw new Error('The Vue admin template supports Vite only.');
  if (template.name === 'vue-admin' && options.wui)
    throw new Error('@w.ui/wui-react is available only in the React template.');
  const choices = normalizeOptions(options);
  const manager = choices.packageManager;
  const title =
    options.title === undefined
      ? name
          .split('-')
          .map((part) => part[0].toUpperCase() + part.slice(1))
          .join(' ')
      : options.title.trim();
  if (!title || title.length > 40)
    throw new Error('Project title must contain 1 to 40 characters.');

  const cwd = path.resolve(options.cwd || process.cwd());
  const target = path.join(cwd, name);
  if (fs.existsSync(target))
    throw new Error(`Destination already exists: ${target}`);

  const staging = fs.mkdtempSync(path.join(cwd, `.${name}.baize-`));
  try {
    if (choices.mode === 'single') {
      copyAppTemplate(template.directory, staging);
      const configure =
        template.name === 'vue-admin' ? configureVueApp : configureApp;
      configure(staging, { name, title, ...choices });
      if (manager === 'pnpm')
        fs.writeFileSync(
          path.join(staging, 'pnpm-workspace.yaml'),
          "packages:\n  - '.'\nallowBuilds:\n  esbuild: true\n"
        );
    } else {
      createWorkspace(staging, template.directory, {
        name,
        title,
        choices,
        templateName: template.name,
      });
    }
    writeWorkflows(staging, choices.packageManager);
    if (fs.existsSync(target))
      throw new Error(`Destination already exists: ${target}`);
    fs.renameSync(staging, target);
  } finally {
    if (fs.existsSync(staging))
      fs.rmSync(staging, { recursive: true, force: true });
  }

  if (choices.install) {
    const result = spawnSync(manager, ['install'], {
      cwd: target,
      stdio: 'inherit',
      shell: false,
    });
    if (result.error)
      throw new Error(
        `Could not run ${manager}: ${result.error.message}. Project was created at ${target}.`
      );
    if (result.status !== 0)
      throw new Error(
        `${manager} install failed. Project was created at ${target}.`
      );
  }
  return target;
}
