import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import { configureApp, copyAppTemplate } from '../../src/project/app.js';
import { addProject } from '../../src/project/add-project.js';
import { createProject } from '../../src/project/create.js';

const roots = [];
function tempRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'baize-wui-test-'));
  roots.push(root);
  return root;
}
afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, { recursive: true, force: true });
});

test('WUI selection adds the published package, base peer, stylesheet, and example', () => {
  const root = tempRoot();
  const app = path.join(root, 'admin');
  copyAppTemplate(path.resolve('templates/react-admin'), app);
  configureApp(app, {
    name: 'admin',
    title: 'Admin',
    packageManager: 'npm',
    bundler: 'vite',
    wui: true,
  });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(app, 'package.json'), 'utf8')
  );
  assert.equal(manifest.dependencies['@w.ui/wui-react'], '6.1.1');
  assert.equal(manifest.dependencies['framer-motion'], '14.9.0');
  assert.match(
    fs.readFileSync(path.join(app, 'src', 'main.tsx'), 'utf8'),
    /@w\.ui\/wui-react\/style\.css/
  );
  assert.equal(
    fs.existsSync(path.join(app, 'src', 'components', 'WuiCodeInput.tsx')),
    true
  );
  assert.equal(
    fs.existsSync(path.join(app, 'src', 'components', 'WuiCodeInput.stories.tsx')),
    true
  );
});

test('new workspace apps inherit the WUI choice', () => {
  const root = tempRoot();
  const workspace = createProject('studio', {
    cwd: root,
    mode: 'multi',
    packageManager: 'npm',
  });
  const marker = path.join(workspace, '.baize.json');
  const config = path.join(workspace, 'workspace.json');
  for (const file of [marker, config]) {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    value.wui = true;
    fs.writeFileSync(file, JSON.stringify(value));
  }
  const app = addProject('extra', { cwd: workspace });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(app, 'package.json'), 'utf8')
  );
  assert.equal(manifest.dependencies['@w.ui/wui-react'], '6.1.1');
});
