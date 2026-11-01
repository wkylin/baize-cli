import fs from 'node:fs';
import path from 'node:path';
import { generateRoutes } from '../../templates/react-admin/scripts/generate-routes.mjs';

const generated = new Set([
  'node_modules',
  'dist',
  '.git',
  '.vite',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
]);

export function copyAppTemplate(source, target) {
  fs.cpSync(source, target, {
    recursive: true,
    filter: (file) =>
      !generated.has(path.relative(source, file).split(path.sep)[0]),
  });
  fs.renameSync(
    path.join(target, '_gitignore'),
    path.join(target, '.gitignore')
  );
}

export function configureApp(
  directory,
  { name, title, packageManager, bundler, wui = false, storybookPort = 6006 }
) {
  fs.copyFileSync(
    new URL('../../templates/shared/check-dependencies.mjs', import.meta.url),
    path.join(directory, 'scripts', 'check-dependencies.mjs')
  );
  const manifestPath = path.join(directory, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.name = name;
  manifest.packageManager =
    packageManager === 'pnpm' ? 'pnpm@11.8.0' : 'npm@11.20.0';
  manifest.scripts.storybook = `storybook dev -p ${storybookPort} --no-open`;
  if (wui) {
    manifest.dependencies['@w.ui/wui-react'] = '6.1.1';
    manifest.dependencies['framer-motion'] = '14.9.0';
    const mainPath = path.join(directory, 'src', 'main.tsx');
    fs.writeFileSync(
      mainPath,
      fs
        .readFileSync(mainPath, 'utf8')
        .replace(
          "import 'antd/dist/reset.css';",
          "import '@w.ui/wui-react/style.css';\nimport 'antd/dist/reset.css';"
        )
    );
    const components = path.join(directory, 'src', 'components');
    fs.mkdirSync(components, { recursive: true });
    fs.copyFileSync(
      new URL('../../templates/wui/WuiCodeInput.tsx', import.meta.url),
      path.join(components, 'WuiCodeInput.tsx')
    );
    fs.copyFileSync(
      new URL('../../templates/wui/WuiCodeInput.stories.tsx', import.meta.url),
      path.join(components, 'WuiCodeInput.stories.tsx')
    );
    const previewPath = path.join(directory, '.storybook', 'preview.ts');
    fs.writeFileSync(
      previewPath,
      `import '@w.ui/wui-react/style.css';\n${fs.readFileSync(previewPath, 'utf8')}`
    );
  }
  const htmlPath = path.join(directory, 'index.html');
  const escapedTitle = title
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
  fs.writeFileSync(
    htmlPath,
    fs
      .readFileSync(htmlPath, 'utf8')
      .replaceAll('__PROJECT_TITLE__', escapedTitle)
      .replaceAll('__PROJECT_MARK__', escapedTitle.slice(0, 1))
  );
  if (bundler === 'webpack') {
    manifest.devDependencies['@storybook/react-webpack5'] = '10.6.5';
    delete manifest.devDependencies['@storybook/react-vite'];
    const storybookPath = path.join(directory, '.storybook', 'main.ts');
    fs.copyFileSync(
      new URL('../../templates/storybook/webpack.main.ts', import.meta.url),
      storybookPath
    );
    manifest.scripts.dev =
      'webpack serve --config webpack.config.mjs --mode development';
    manifest.scripts.build =
      'tsc --noEmit && webpack --config webpack.config.mjs --mode production';
    delete manifest.scripts.preview;
    delete manifest.devDependencies.vite;
    delete manifest.devDependencies['@vitejs/plugin-react'];
    Object.assign(manifest.devDependencies, {
      'copy-webpack-plugin': '14.0.0',
      'css-loader': '7.1.5',
      'esbuild-loader': '4.5.0',
      'html-webpack-plugin': '5.6.8',
      'style-loader': '4.0.0',
      webpack: '5.112.2',
      'webpack-cli': '7.3.1',
      'webpack-dev-server': '6.1.0',
    });
    fs.rmSync(path.join(directory, 'vite.config.ts'));
    fs.writeFileSync(
      htmlPath,
      fs
        .readFileSync(htmlPath, 'utf8')
        .replace(
          '    <script type="module" src="/src/main.tsx"></script>\n',
          ''
        )
    );
    const tsconfigPath = path.join(directory, 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    tsconfig.compilerOptions.types = [];
    tsconfig.include = ['src', '.storybook'];
    fs.writeFileSync(tsconfigPath, `${JSON.stringify(tsconfig, null, 2)}\n`);
  } else {
    fs.rmSync(path.join(directory, 'webpack.config.mjs'));
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const projectConfigPath = path.join(directory, 'src', 'app', 'project.json');
  const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));
  projectConfig.displayName = title;
  fs.writeFileSync(
    projectConfigPath,
    `${JSON.stringify(projectConfig, null, 2)}\n`
  );
  const readmePath = path.join(directory, 'README.md');
  fs.writeFileSync(
    readmePath,
    fs
      .readFileSync(readmePath, 'utf8')
      .replaceAll('%%PROJECT_TITLE%%', title)
      .replaceAll('%%PM%%', packageManager)
      .replaceAll('%%BUNDLER%%', bundler === 'vite' ? 'Vite' : 'Webpack 5')
      .replaceAll(
        '%%WUI_STATE%%',
        wui ? '已启用 `@w.ui/wui-react`。' : '未启用 WUI 组件库。'
      )
  );
  generateRoutes(directory);
}
