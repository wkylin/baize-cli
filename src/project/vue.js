import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateVueRoutes } from '../../templates/vue-admin/scripts/generate-routes.mjs';

const templates = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../templates'
);

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function titleHtml(title) {
  return title
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function setProjectTitle(directory, title) {
  const htmlPath = path.join(directory, 'index.html');
  fs.writeFileSync(
    htmlPath,
    fs
      .readFileSync(htmlPath, 'utf8')
      .replaceAll('__PROJECT_TITLE__', titleHtml(title))
      .replaceAll('__PROJECT_MARK__', titleHtml(title.slice(0, 1)))
  );
}

export function configureVueApp(
  directory,
  { name, title, packageManager, storybookPort = 6006 }
) {
  fs.copyFileSync(
    path.join(templates, 'shared', 'check-dependencies.mjs'),
    path.join(directory, 'scripts', 'check-dependencies.mjs')
  );
  const manifestPath = path.join(directory, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.name = name;
  manifest.packageManager =
    packageManager === 'pnpm' ? 'pnpm@11.8.0' : 'npm@11.20.0';
  manifest.scripts.storybook = `storybook dev -p ${storybookPort} --no-open`;
  writeJson(manifestPath, manifest);
  setProjectTitle(directory, title);
  writeJson(path.join(directory, 'src', 'app', 'project.json'), {
    displayName: title,
  });
  const readmePath = path.join(directory, 'README.md');
  fs.writeFileSync(
    readmePath,
    fs
      .readFileSync(readmePath, 'utf8')
      .replaceAll('%%PROJECT_TITLE%%', title)
      .replaceAll('%%PM%%', packageManager)
  );
  generateVueRoutes(directory);
}

export function configureVueHost(directory) {
  const overlay = path.join(templates, 'vue-federation', 'host');
  for (const file of ['reports.route.ts', 'reports.vue'])
    fs.copyFileSync(
      path.join(overlay, 'src', 'pages', file),
      path.join(directory, 'src', 'pages', file)
    );
  fs.copyFileSync(
    path.join(overlay, 'src', 'remotes.d.ts'),
    path.join(directory, 'src', 'remotes.d.ts')
  );
  fs.copyFileSync(
    path.join(overlay, 'vite.mfe.config.ts'),
    path.join(directory, 'vite.mfe.config.ts')
  );
  const manifestPath = path.join(directory, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.devDependencies['@module-federation/vite'] = '1.23.7';
  manifest.scripts.dev = 'vite --config vite.mfe.config.ts';
  manifest.scripts.build =
    'vue-tsc --noEmit && vite build --config vite.mfe.config.ts';
  writeJson(manifestPath, manifest);
  generateVueRoutes(directory);
}

export function createVueRemote(
  directory,
  templateDirectory,
  { name, title, choices, storybookPort }
) {
  fs.cpSync(path.join(templates, 'vue-federation', 'remote'), directory, {
    recursive: true,
  });
  fs.mkdirSync(path.join(directory, 'scripts'));
  for (const file of ['quality.mjs', 'release.mjs'])
    fs.copyFileSync(
      path.join(templateDirectory, 'scripts', file),
      path.join(directory, 'scripts', file)
    );
  fs.copyFileSync(
    path.join(templates, 'shared', 'check-dependencies.mjs'),
    path.join(directory, 'scripts', 'check-dependencies.mjs')
  );
  fs.mkdirSync(path.join(directory, 'public'));
  fs.copyFileSync(
    path.join(templateDirectory, 'public', 'boot-splash.css'),
    path.join(directory, 'public', 'boot-splash.css')
  );
  setProjectTitle(directory, title);
  const manifestPath = path.join(directory, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.name = name;
  manifest.packageManager =
    choices.packageManager === 'pnpm' ? 'pnpm@11.8.0' : 'npm@11.20.0';
  manifest.scripts.storybook = `storybook dev -p ${storybookPort} --no-open`;
  writeJson(manifestPath, manifest);
  writeJson(path.join(directory, '.baize.json'), {
    template: 'vue-admin-remote',
  });
}
