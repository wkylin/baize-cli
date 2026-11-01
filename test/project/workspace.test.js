import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import { createProject } from '../../src/project/create.js';
import { addPage } from '../../src/project/add-page.js';
import { addProject } from '../../src/project/add-project.js';

const directories = [];
function workspace() {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'baize-workspace-test-')
  );
  directories.push(directory);
  return directory;
}
afterEach(() => {
  for (const directory of directories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});

test('multi-project output contains two independent apps and accepts another app', () => {
  const cwd = workspace();
  const root = createProject('studio', {
    cwd,
    mode: 'multi',
    bundler: 'webpack',
    packageManager: 'npm',
  });
  const config = JSON.parse(
    fs.readFileSync(path.join(root, 'workspace.json'), 'utf8')
  );
  assert.deepEqual(
    config.apps.map((app) => app.name),
    ['admin', 'operations']
  );
  assert.deepEqual(
    config.apps.map((app) => app.port),
    [5173, 5174]
  );
  assert.equal(
    fs.existsSync(path.join(root, 'apps', 'admin', 'webpack.config.mjs')),
    true
  );
  assert.equal(
    fs.existsSync(
      path.join(root, 'apps', 'operations', 'src', 'pages', 'users.tsx')
    ),
    true
  );
  assert.equal(fs.existsSync(path.join(root, 'pnpm-workspace.yaml')), false);
  assert.match(
    JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).scripts
      .build,
    /workspace/
  );
  assert.match(
    JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
      .scripts['build:storybook'],
    /workspace/
  );
  assert.equal(fs.existsSync(path.join(root, 'scripts', 'release.mjs')), true);
  assert.equal(
    fs.existsSync(path.join(root, '.github', 'workflows', 'ci.yml')),
    true
  );
  assert.match(
    fs.readFileSync(path.join(root, 'README.md'), 'utf8'),
    /apps\/admin/
  );
  assert.doesNotMatch(
    fs.readFileSync(path.join(root, 'README.md'), 'utf8'),
    /%%[A-Z_0-9]+%%/
  );

  const newApp = addProject('finance', { cwd: root, title: '财务后台' });
  assert.equal(newApp, path.join(root, 'apps', 'finance'));
  assert.equal(
    JSON.parse(
      fs.readFileSync(path.join(newApp, 'src', 'app', 'project.json'), 'utf8')
    ).displayName,
    '财务后台'
  );
  assert.equal(
    JSON.parse(
      fs.readFileSync(path.join(root, 'workspace.json'), 'utf8')
    ).apps.at(-1).port,
    5175
  );
  assert.match(
    JSON.parse(fs.readFileSync(path.join(newApp, 'package.json'), 'utf8'))
      .scripts.storybook,
    /6008/
  );
  addPage('ledger', { cwd: root, project: 'finance' });
  assert.equal(
    fs.existsSync(path.join(newApp, 'src', 'pages', 'ledger.tsx')),
    true
  );
  assert.equal(
    fs.existsSync(
      path.join(root, 'apps', 'admin', 'src', 'pages', 'ledger.tsx')
    ),
    false
  );
});

test('microfrontend output connects a shell route to a standalone remote', () => {
  const cwd = workspace();
  const root = createProject('orbit', {
    cwd,
    mode: 'microfrontend',
    packageManager: 'pnpm',
  });
  const config = JSON.parse(
    fs.readFileSync(path.join(root, 'workspace.json'), 'utf8')
  );
  assert.deepEqual(
    config.apps.map((app) => app.name),
    ['reports', 'shell']
  );
  assert.equal(fs.existsSync(path.join(root, 'pnpm-workspace.yaml')), true);
  assert.match(
    fs.readFileSync(path.join(root, 'pnpm-workspace.yaml'), 'utf8'),
    /esbuild: true/
  );
  assert.match(
    fs.readFileSync(
      path.join(root, 'apps', 'shell', 'src', 'pages', 'reports.tsx'),
      'utf8'
    ),
    /reports\/RemotePage/
  );
  assert.equal(
    fs.existsSync(path.join(root, 'apps', 'shell', 'vite.mfe.config.ts')),
    true
  );
  assert.equal(
    fs.existsSync(path.join(root, 'apps', 'reports', 'vite.config.ts')),
    true
  );
  assert.equal(
    fs.existsSync(path.join(root, 'apps', 'reports', 'src', 'RemotePage.tsx')),
    true
  );
  const remoteTypes = JSON.parse(
    fs.readFileSync(path.join(root, 'apps', 'reports', 'tsconfig.json'), 'utf8')
  ).compilerOptions.types;
  assert.ok(remoteTypes.includes('node'));
  assert.equal(
    fs.existsSync(path.join(root, 'apps', 'reports', 'scripts', 'quality.mjs')),
    true
  );
  assert.match(
    JSON.parse(
      fs.readFileSync(
        path.join(root, 'apps', 'reports', 'package.json'),
        'utf8'
      )
    ).scripts.storybook,
    /6007/
  );
});
