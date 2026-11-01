import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, test } from 'node:test';
import { check, resolveConfig } from 'prettier';
import {
  createProject,
  validateProjectName,
} from '../../src/project/create.js';
import { addPage } from '../../src/project/add-page.js';
import {
  normalizeOptions,
  supportsWuiNode,
} from '../../src/project/options.js';

const directories = [];

function workspace() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'baize-test-'));
  directories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of directories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});

test('create copies the bundled project without Git metadata or installation', () => {
  const cwd = workspace();
  const target = createProject('sample-admin', { cwd, title: '客户运营' });
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(target, 'package.json'), 'utf8')).name,
    'sample-admin'
  );
  assert.equal(
    JSON.parse(
      fs.readFileSync(path.join(target, 'src', 'app', 'project.json'), 'utf8')
    ).displayName,
    '客户运营'
  );
  assert.equal(fs.existsSync(path.join(target, '.gitignore')), true);
  assert.equal(fs.existsSync(path.join(target, '.git')), false);
  assert.match(
    fs.readFileSync(path.join(target, 'pnpm-workspace.yaml'), 'utf8'),
    /esbuild: true/
  );
  assert.match(fs.readFileSync(path.join(target, 'README.md'), 'utf8'), /pnpm/);
  assert.doesNotMatch(
    fs.readFileSync(path.join(target, 'README.md'), 'utf8'),
    /%%PM%%|%%PROJECT_TITLE%%/
  );
  assert.equal(fs.existsSync(path.join(target, 'node_modules')), false);
  assert.equal(
    fs.existsSync(path.join(target, 'src', 'pages', 'dashboard.tsx')),
    true
  );
});

test('existing paths and invalid names are rejected without changing the destination', () => {
  const cwd = workspace();
  fs.mkdirSync(path.join(cwd, 'existing'));
  fs.writeFileSync(path.join(cwd, 'existing', 'keep.txt'), 'keep');
  assert.throws(
    () => createProject('existing', { cwd }),
    /Destination already exists/
  );
  assert.equal(
    fs.readFileSync(path.join(cwd, 'existing', 'keep.txt'), 'utf8'),
    'keep'
  );
  for (const name of [
    '../escape',
    'Bad Name',
    'a;echo',
    '',
    `a${'b'.repeat(101)}`,
  ])
    assert.throws(() => validateProjectName(name));
  assert.deepEqual(fs.readdirSync(cwd), ['existing']);
});

test('add page writes a routable module from inside a generated project', () => {
  const cwd = workspace();
  const target = createProject('sample-admin', { cwd });
  const file = addPage('sales-report', {
    cwd: path.join(target, 'src'),
    title: '销售报表',
  });
  const source = fs.readFileSync(file, 'utf8');
  const route = fs.readFileSync(
    path.join(target, 'src', 'pages', 'sales-report.route.ts'),
    'utf8'
  );
  assert.match(source, /sales-report\.route/);
  assert.match(route, /path: '\/sales-report'/);
  assert.match(route, /title: "销售报表"/);
  assert.throws(
    () => addPage('sales-report', { cwd: target }),
    /already exists/
  );
  assert.throws(() => addPage('../other', { cwd: target }), /Page name/);
  assert.throws(
    () => addPage('other', { cwd: target, title: ' ' }),
    /Page title/
  );
});

test('added React and Vue pages pass their template formatting checks', async () => {
  for (const template of ['react-admin', 'vue-admin']) {
    const target = createProject('formatted-admin', {
      cwd: workspace(),
      template,
    });
    for (const [index, title] of [
      '销售报表',
      `Customer's "reports" \\ ledger`,
      '报表\n详情',
      '\\'.repeat(40),
    ].entries()) {
      const slug = `report-${index}`;
      const page = addPage(slug, { cwd: target, title });
      for (const file of [
        page,
        path.join(target, 'src', 'pages', `${slug}.route.ts`),
      ]) {
        assert.equal(
          await check(fs.readFileSync(file, 'utf8'), {
            ...(await resolveConfig(file)),
            filepath: file,
          }),
          true,
          `${template}: ${path.basename(file)} with ${JSON.stringify(title)}`
        );
      }
    }
  }
});

test('creation choices default to pnpm, Vite, and a single app', () => {
  assert.deepEqual(normalizeOptions(), {
    packageManager: 'pnpm',
    bundler: 'vite',
    mode: 'single',
    wui: false,
    install: false,
  });
  assert.deepEqual(
    normalizeOptions({
      packageManager: 'npm',
      bundler: 'webpack',
      mode: 'multi',
    }),
    {
      packageManager: 'npm',
      bundler: 'webpack',
      mode: 'multi',
      wui: false,
      install: false,
    }
  );
  for (const input of [
    { packageManager: 'yarn' },
    { bundler: 'rspack' },
    { mode: 'monolith' },
  ])
    assert.throws(() => normalizeOptions(input));
});

test('WUI has an explicit Node engine floor and implies installation', () => {
  assert.equal(supportsWuiNode('20.19.0'), false);
  assert.equal(supportsWuiNode('22.22.1'), false);
  assert.equal(supportsWuiNode('22.22.2'), true);
  assert.equal(supportsWuiNode('24.15.0'), true);
  assert.equal(supportsWuiNode('25.0.0'), false);
  assert.equal(supportsWuiNode('26.0.0'), true);
  assert.equal(
    normalizeOptions({ wui: true }, { nodeVersion: '26.0.0' }).install,
    true
  );
  assert.throws(
    () => normalizeOptions({ wui: true }, { nodeVersion: '20.19.0' }),
    /Node.js/
  );
});

test('Webpack output has its own build config and add-page updates its route registry', () => {
  const cwd = workspace();
  const target = createProject('webpack-admin', {
    cwd,
    packageManager: 'npm',
    bundler: 'webpack',
  });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(target, 'package.json'), 'utf8')
  );
  assert.equal(manifest.packageManager, 'npm@11.20.0');
  assert.match(manifest.scripts.build, /webpack/);
  assert.match(manifest.scripts.storybook, /storybook/);
  assert.match(manifest.scripts.quality, /quality/);
  assert.match(manifest.scripts.release, /release/);
  assert.equal(manifest.devDependencies['@storybook/react-webpack5'], '10.6.5');
  assert.equal(manifest.devDependencies['@storybook/react-vite'], undefined);
  assert.match(
    fs.readFileSync(path.join(target, '.storybook', 'main.ts'), 'utf8'),
    /react-webpack5/
  );
  assert.equal(
    fs.existsSync(path.join(target, '.github', 'workflows', 'ci.yml')),
    true
  );
  assert.equal(
    fs.existsSync(path.join(target, '.github', 'workflows', 'release.yml')),
    true
  );
  assert.match(
    fs.readFileSync(
      path.join(target, '.github', 'workflows', 'ci.yml'),
      'utf8'
    ),
    /npm install/
  );
  assert.match(
    fs.readFileSync(path.join(target, 'README.md'), 'utf8'),
    /Webpack 5/
  );
  assert.equal(fs.existsSync(path.join(target, 'webpack.config.mjs')), true);
  assert.equal(fs.existsSync(path.join(target, 'vite.config.ts')), false);
  assert.doesNotMatch(
    fs.readFileSync(path.join(target, 'src', 'app', 'routes.ts'), 'utf8'),
    /import\.meta\.glob/
  );
  addPage('reports', { cwd: target });
  assert.match(
    fs.readFileSync(
      path.join(target, 'src', 'app', 'route-registry.ts'),
      'utf8'
    ),
    /reports\.route/
  );
});

test('release does not write an artifact when quality fails', () => {
  const target = createProject('release-gate', {
    cwd: workspace(),
    packageManager: 'npm',
  });
  const result = spawnSync(process.execPath, ['scripts/release.mjs'], {
    cwd: target,
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.equal(fs.existsSync(path.join(target, 'release')), false);
});
