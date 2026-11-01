import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import { createProject } from '../../src/project/create.js';
import { addPage } from '../../src/project/add-page.js';
import { addProject } from '../../src/project/add-project.js';
import { listTemplates } from '../../src/project/templates.js';

const directories = [];
function temporaryDirectory() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'baize-vue-test-'));
  directories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of directories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});

test('Vue template is selectable and incompatible options fail before writing', () => {
  assert.ok(listTemplates().some((template) => template.name === 'vue-admin'));
  const cwd = temporaryDirectory();
  for (const options of [{ bundler: 'webpack' }, { wui: true }]) {
    assert.throws(() =>
      createProject('invalid-vue', { cwd, template: 'vue-admin', ...options })
    );
  }
  assert.deepEqual(fs.readdirSync(cwd), []);
});

test('Vue single app has Pinia, working engineering scripts, and routable pages', () => {
  const root = createProject('vue-studio', {
    cwd: temporaryDirectory(),
    template: 'vue-admin',
    packageManager: 'npm',
    title: 'Vue 工作台',
  });
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
  assert.equal(manifest.dependencies.pinia, '3.0.4');
  assert.equal(manifest.dependencies.react, undefined);
  assert.match(manifest.scripts.quality, /quality/);
  assert.match(manifest.scripts['build:storybook'], /storybook/);
  assert.equal(
    fs.existsSync(path.join(root, 'src', 'pages', 'dashboard.vue')),
    true
  );
  assert.equal(fs.existsSync(path.join(root, '.storybook', 'main.ts')), true);
  assert.equal(
    fs.existsSync(path.join(root, '.github', 'workflows', 'ci.yml')),
    true
  );
  assert.equal(fs.existsSync(path.join(root, '.git')), false);
  assert.equal(fs.existsSync(path.join(root, 'node_modules')), false);
  assert.doesNotMatch(
    fs.readFileSync(path.join(root, 'README.md'), 'utf8'),
    /%%[A-Z_0-9]+%%/
  );

  addPage('sales-report', { cwd: root, title: '销售报表' });
  assert.equal(
    fs.existsSync(path.join(root, 'src', 'pages', 'sales-report.vue')),
    true
  );
  assert.match(
    fs.readFileSync(path.join(root, 'src', 'app', 'route-registry.ts'), 'utf8'),
    /sales-report\.vue/
  );
});

test('Vue multi-project workspace accepts another app and page', () => {
  const root = createProject('vue-suite', {
    cwd: temporaryDirectory(),
    template: 'vue-admin',
    mode: 'multi',
  });
  assert.equal(fs.existsSync(path.join(root, 'pnpm-workspace.yaml')), true);
  assert.equal(
    fs.existsSync(
      path.join(root, 'apps', 'admin', 'src', 'pages', 'dashboard.vue')
    ),
    true
  );
  const added = addProject('finance', { cwd: root });
  assert.equal(added, path.join(root, 'apps', 'finance'));
  addPage('ledger', { cwd: root, project: 'finance' });
  assert.equal(
    fs.existsSync(path.join(added, 'src', 'pages', 'ledger.vue')),
    true
  );
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(root, 'workspace.json'))).apps.at(-1)
      .port,
    5175
  );
});

test('Vue microfrontend connects a shell to a standalone reports remote', () => {
  const root = createProject('vue-orbit', {
    cwd: temporaryDirectory(),
    template: 'vue-admin',
    mode: 'microfrontend',
    packageManager: 'npm',
  });
  assert.equal(
    fs.existsSync(
      path.join(root, 'apps', 'shell', 'src', 'pages', 'reports.vue')
    ),
    true
  );
  assert.equal(
    fs.existsSync(path.join(root, 'apps', 'shell', 'vite.mfe.config.ts')),
    true
  );
  assert.equal(
    fs.existsSync(path.join(root, 'apps', 'reports', 'src', 'RemotePage.vue')),
    true
  );
  assert.equal(
    fs.existsSync(path.join(root, 'apps', 'reports', 'vite.config.ts')),
    true
  );
  assert.match(
    fs.readFileSync(
      path.join(root, 'apps', 'shell', 'src', 'pages', 'reports.vue'),
      'utf8'
    ),
    /reports\/RemotePage/
  );
});
