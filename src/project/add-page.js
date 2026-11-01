import fs from 'node:fs';
import path from 'node:path';
import { generateRoutes } from '../../templates/react-admin/scripts/generate-routes.mjs';
import { generateVueRoutes } from '../../templates/vue-admin/scripts/generate-routes.mjs';

function findProjectRoot(start) {
  let directory = path.resolve(start);
  for (;;) {
    const marker = path.join(directory, '.baize.json');
    if (fs.existsSync(marker)) {
      const project = JSON.parse(fs.readFileSync(marker, 'utf8'));
      if (
        project.template !== 'react-admin' &&
        project.template !== 'vue-admin'
      )
        throw new Error('This command requires a Baize admin project.');
      return directory;
    }
    const parent = path.dirname(directory);
    if (parent === directory)
      throw new Error(
        'No Baize project found. Run this command inside a generated project.'
      );
    directory = parent;
  }
}

export function addPage(slug, options = {}) {
  if (
    typeof slug !== 'string' ||
    slug.length > 50 ||
    !/^[a-z][a-z0-9-]*$/.test(slug)
  ) {
    throw new Error(
      'Page name must start with a lowercase letter, use only lowercase letters, numbers, and hyphens, and be at most 50 characters.'
    );
  }
  let root = findProjectRoot(options.cwd || process.cwd());
  const marker = JSON.parse(
    fs.readFileSync(path.join(root, '.baize.json'), 'utf8')
  );
  const isVue = marker.template === 'vue-admin';
  if (marker.mode && marker.mode !== 'single') {
    const project =
      options.project || (marker.mode === 'multi' ? 'admin' : 'shell');
    if (!/^[a-z][a-z0-9-]*$/.test(project))
      throw new Error('Invalid project name.');
    root = path.join(root, 'apps', project);
    if (!fs.existsSync(path.join(root, '.baize.json')))
      throw new Error(`Project not found: ${project}`);
  }
  const file = path.join(
    root,
    'src',
    'pages',
    `${slug}.${isVue ? 'vue' : 'tsx'}`
  );
  const routeFile = path.join(root, 'src', 'pages', `${slug}.route.ts`);
  if (fs.existsSync(file) || fs.existsSync(routeFile))
    throw new Error(`Page already exists: ${file}`);
  const title =
    options.title === undefined
      ? slug
          .split('-')
          .map((part) => part[0].toUpperCase() + part.slice(1))
          .join(' ')
      : options.title.trim();
  if (!title || title.length > 40)
    throw new Error('Page title must contain 1 to 40 characters.');
  // Preserve JSON escaping for arbitrary user labels in the generated source.
  const routeSource = `import type { PageRoute } from '../app/routes';\n\nexport const route: PageRoute = {\n  path: '/${slug}',\n  // prettier-ignore\n  title: ${JSON.stringify(title)},\n  icon: 'file',\n  order: 100,\n};\n`;
  const pageSource = isVue
    ? `<script setup lang="ts">\nimport { route } from './${slug}.route';\n</script>\n\n<template>\n  <section class="page">\n    <header class="page-heading">\n      <div>\n        <p class="eyebrow">WORKSPACE</p>\n        <h1>{{ route.title }}</h1>\n      </div>\n    </header>\n    <div class="empty-state">暂无数据</div>\n  </section>\n</template>\n`
    : `import { route } from './${slug}.route';\n\nexport default function GeneratedPage() {\n  return (\n    <section className="page">\n      <header className="page-heading">\n        <div>\n          <p className="eyebrow">WORKSPACE</p>\n          <h1>{route.title}</h1>\n        </div>\n      </header>\n      <div className="empty-state">暂无数据</div>\n    </section>\n  );\n}\n`;
  fs.writeFileSync(routeFile, routeSource, { flag: 'wx' });
  try {
    fs.writeFileSync(file, pageSource, { flag: 'wx' });
    if (fs.existsSync(path.join(root, 'scripts', 'generate-routes.mjs')))
      (isVue ? generateVueRoutes : generateRoutes)(root);
  } catch (error) {
    fs.rmSync(routeFile, { force: true });
    fs.rmSync(file, { force: true });
    throw error;
  }
  return file;
}
