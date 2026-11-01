import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, test } from 'node:test';
import { createProject } from '../../src/project/create.js';
import { configureApp, copyAppTemplate } from '../../src/project/app.js';

const roots = [];
function temporaryRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'baize-deps-test-'));
  roots.push(root);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, { recursive: true, force: true });
});

function sourceFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(file));
    else if (/\.[cm]?[jt]sx?$|\.vue$/.test(entry.name)) files.push(file);
  }
  return files;
}

function checkImports(app) {
  const manifest = JSON.parse(fs.readFileSync(path.join(app, 'package.json')));
  assert.match(manifest.scripts.predev, /check-dependencies/);
  assert.match(manifest.scripts.prebuild, /check-dependencies/);
  assert.equal(
    fs.existsSync(path.join(app, 'scripts', 'check-dependencies.mjs')),
    true
  );
  const declared = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
  };
  const missing = [];
  for (const file of sourceFiles(app)) {
    const source = fs.readFileSync(file, 'utf8');
    const imports = source.matchAll(
      /\b(?:from\s*|import\s*\(|import\s*)['"]([^'"]+)['"]/g
    );
    for (const [, specifier] of imports) {
      if (/^(?:\.|\/|node:)/.test(specifier)) continue;
      if (specifier === 'reports/RemotePage') continue;
      const segments = specifier.split('/');
      const name = specifier.startsWith('@')
        ? segments.slice(0, 2).join('/')
        : segments[0];
      if (!Object.hasOwn(declared, name))
        missing.push(`${path.relative(app, file)} imports ${name}`);
    }
  }
  assert.deepEqual(missing, [], `Undeclared imports in ${app}`);
}

test('generated React and Vue variants declare every imported package', () => {
  const root = temporaryRoot();
  const variants = [
    { template: 'react-admin', bundler: 'vite', mode: 'single' },
    { template: 'react-admin', bundler: 'webpack', mode: 'single' },
    { template: 'react-admin', bundler: 'vite', mode: 'microfrontend' },
    { template: 'vue-admin', bundler: 'vite', mode: 'single' },
    { template: 'vue-admin', bundler: 'vite', mode: 'multi' },
    { template: 'vue-admin', bundler: 'vite', mode: 'microfrontend' },
  ];
  for (const [index, variant] of variants.entries()) {
    const project = createProject(`variant-${index}`, {
      cwd: root,
      packageManager: 'npm',
      ...variant,
    });
    const apps =
      variant.mode === 'single'
        ? [project]
        : fs
            .readdirSync(path.join(project, 'apps'))
            .map((name) => path.join(project, 'apps', name));
    apps.forEach(checkImports);
  }

  const wuiApp = path.join(root, 'wui-app');
  copyAppTemplate(path.resolve('templates/react-admin'), wuiApp);
  configureApp(wuiApp, {
    name: 'wui-app',
    title: 'WUI App',
    packageManager: 'npm',
    bundler: 'vite',
    wui: true,
  });
  checkImports(wuiApp);
});

test('generated dev scripts report missing dependencies before Vite starts', () => {
  const root = temporaryRoot();
  for (const template of ['react-admin', 'vue-admin']) {
    const project = createProject(template, {
      cwd: root,
      template,
      packageManager: 'npm',
    });
    const manifest = JSON.parse(
      fs.readFileSync(path.join(project, 'package.json'))
    );
    assert.match(manifest.scripts.predev, /check-dependencies/);
    const absent = template === 'react-admin' ? 'react-i18next' : 'vue-i18n';
    for (const name of Object.keys({
      ...manifest.dependencies,
      ...manifest.devDependencies,
    })) {
      if (name === absent) continue;
      const directory = path.join(project, 'node_modules', name);
      fs.mkdirSync(directory, { recursive: true });
      fs.writeFileSync(
        path.join(directory, 'package.json'),
        JSON.stringify({ name })
      );
    }
    const result = spawnSync(
      process.execPath,
      ['scripts/check-dependencies.mjs'],
      { cwd: project, encoding: 'utf8' }
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /npm install/);
    assert.match(result.stderr, new RegExp(absent));
    assert.doesNotMatch(
      result.stderr,
      /Missing or incomplete dependencies:.*, /
    );

    const directory = path.join(project, 'node_modules', absent);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(
      path.join(directory, 'package.json'),
      JSON.stringify({ name: absent })
    );
    const ready = spawnSync(
      process.execPath,
      ['scripts/check-dependencies.mjs'],
      { cwd: project, encoding: 'utf8' }
    );
    assert.equal(ready.status, 0, ready.stderr);
  }
});
