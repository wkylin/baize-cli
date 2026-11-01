import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function generateVueRoutes(root = process.cwd()) {
  const pagesDirectory = path.join(root, 'src', 'pages');
  const routeFiles = fs
    .readdirSync(pagesDirectory)
    .filter((file) => file.endsWith('.route.ts'))
    .sort();
  for (const file of routeFiles) {
    const component = path.join(
      pagesDirectory,
      file.replace(/\.route\.ts$/, '.vue')
    );
    if (!fs.existsSync(component))
      throw new Error(`Missing Vue page component: ${component}`);
  }
  const imports = routeFiles.map(
    (file, index) =>
      `import { route as route${index} } from '../pages/${file.replace(/\.ts$/, '')}';`
  );
  const entries = routeFiles.map((file, index) => {
    const slug = file.replace(/\.route\.ts$/, '');
    return `  { route: route${index}, component: () => import('../pages/${slug}.vue') },`;
  });
  const source = [
    "import type { PageEntry } from './routes';",
    ...imports,
    '',
    'export const registeredPages: PageEntry[] = [',
    ...entries,
    '];',
    '',
  ].join('\n');
  const output = path.join(root, 'src', 'app', 'route-registry.ts');
  fs.writeFileSync(output, source);
  return output;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  generateVueRoutes();
}
