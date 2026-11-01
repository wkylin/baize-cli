import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configureApp, copyAppTemplate } from './app.js';
import { configureVueApp, configureVueHost, createVueRemote } from './vue.js';
import { generateRoutes } from '../../templates/react-admin/scripts/generate-routes.mjs';

const templates = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../templates'
);

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function createWorkspace(
  root,
  templateDirectory,
  { name, title, choices, templateName = 'react-admin' }
) {
  const isVue = templateName === 'vue-admin';
  const apps =
    choices.mode === 'multi'
      ? [
          { name: 'admin', port: 5173 },
          { name: 'operations', port: 5174 },
        ]
      : [
          { name: 'reports', port: 5174 },
          { name: 'shell', port: 5173 },
        ];
  fs.mkdirSync(path.join(root, 'apps'));
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.copyFileSync(
    path.join(templates, 'workspace', 'scripts', 'workspace.mjs'),
    path.join(root, 'scripts', 'workspace.mjs')
  );
  fs.copyFileSync(
    path.join(templateDirectory, 'scripts', 'release.mjs'),
    path.join(root, 'scripts', 'release.mjs')
  );
  for (const app of apps) {
    const directory = path.join(root, 'apps', app.name);
    if (choices.mode === 'microfrontend' && app.name === 'reports') {
      const create = isVue ? createVueRemote : createRemote;
      create(directory, templateDirectory, {
        name: `${name}-reports`,
        title: `${title} - 报表`,
        choices,
        storybookPort: 6006 + app.port - 5173,
      });
    } else {
      copyAppTemplate(templateDirectory, directory);
      (isVue ? configureVueApp : configureApp)(directory, {
        name: `${name}-${app.name}`,
        title: choices.mode === 'multi' ? `${title} - ${app.name}` : title,
        storybookPort: 6006 + app.port - 5173,
        ...choices,
      });
      if (choices.mode === 'microfrontend')
        (isVue ? configureVueHost : configureHost)(directory, choices);
    }
  }
  writeJson(path.join(root, '.baize.json'), {
    template: templateName,
    ...choices,
  });
  writeJson(path.join(root, 'workspace.json'), {
    mode: choices.mode,
    bundler: choices.bundler,
    packageManager: choices.packageManager,
    wui: choices.wui,
    apps,
  });
  writeJson(path.join(root, 'package.json'), {
    name,
    version: '0.1.0',
    private: true,
    type: 'module',
    packageManager:
      choices.packageManager === 'pnpm' ? 'pnpm@11.8.0' : 'npm@11.20.0',
    workspaces: ['apps/*'],
    scripts: {
      ...Object.fromEntries(
        [
          'dev',
          'build',
          'lint',
          'typecheck',
          'test',
          'quality',
          'storybook',
          'build:storybook',
        ].map((task) => [task, `node scripts/workspace.mjs ${task}`])
      ),
      release: 'node scripts/release.mjs',
    },
  });
  fs.writeFileSync(
    path.join(root, '.gitignore'),
    'node_modules\n**/node_modules\n**/dist\nrelease\nstorybook-static\n'
  );
  if (choices.packageManager === 'pnpm')
    fs.writeFileSync(
      path.join(root, 'pnpm-workspace.yaml'),
      "packages:\n  - 'apps/*'\nallowBuilds:\n  esbuild: true\n"
    );
  const shapeGuide =
    choices.mode === 'multi'
      ? `## 添加项目与页面

在根目录运行 \`baize add project finance --title "财务后台"\`，随后运行 \`${choices.packageManager} install\`。应用端口和 Storybook 端口会自动递增。用 \`baize add page ledger --project finance --title "总账"\` 为指定应用添加路由和页面。
`
      : `## 微前端部署

\`apps/shell\` 的 \`/reports\` 路由加载 \`apps/reports\` 暴露的 \`RemotePage\`。本地远端入口是 \`http://localhost:5174/remoteEntry.js\`。生产构建宿主时设置 \`BAIZE_REMOTE_URL\`：

\`\`\`bash
BAIZE_REMOTE_URL=https://reports.example.com/remoteEntry.js ${choices.packageManager} run build
\`\`\`

单独部署 \`apps/reports/dist\` 和 \`apps/shell/dist\`，确保远端入口及其资源可跨域访问。远端不可用时宿主显示重试状态。部署目标、远端 URL 和缓存策略由业务项目配置。
`;
  let readme = fs
    .readFileSync(path.join(templates, 'workspace', 'README.md'), 'utf8')
    .replaceAll('%%PROJECT_TITLE%%', title)
    .replaceAll(
      '%%MODE_DESCRIPTION%%',
      choices.mode === 'multi'
        ? `${isVue ? 'Vue 3 ' : ''}多项目管理后台工作区`
        : `${isVue ? 'Vue 3 ' : ''}Module Federation 宿主与远端工作区`
    )
    .replaceAll('%%PM%%', choices.packageManager)
    .replaceAll(
      '%%BUNDLER%%',
      choices.bundler === 'vite' ? 'Vite' : 'Webpack 5'
    )
    .replaceAll(
      '%%WUI_STATE%%',
      isVue
        ? '采用 Vue 3 + Pinia。'
        : choices.wui
          ? '已启用 `@w.ui/wui-react`'
          : '未启用 WUI 组件库'
    )
    .replaceAll(
      '%%PREFERENCES_PATH%%',
      isVue ? 'src/stores/preferences.ts' : 'src/app/preferences.tsx'
    )
    .replaceAll('%%SHAPE_GUIDE%%', shapeGuide.trim());
  for (const [index, app] of apps.entries()) {
    readme = readme
      .replaceAll(`%%APP_${index}_NAME%%`, app.name)
      .replaceAll(`%%APP_${index}_PORT%%`, String(app.port))
      .replaceAll(`%%APP_${index}_STORYBOOK%%`, String(6006 + app.port - 5173));
  }
  fs.writeFileSync(path.join(root, 'README.md'), readme);
}

function configureHost(directory, choices) {
  const overlay = path.join(templates, 'federation', 'host');
  for (const file of ['reports.route.ts', 'reports.tsx']) {
    fs.copyFileSync(
      path.join(overlay, 'src', 'pages', file),
      path.join(directory, 'src', 'pages', file)
    );
  }
  fs.copyFileSync(
    path.join(overlay, 'src', 'remotes.d.ts'),
    path.join(directory, 'src', 'remotes.d.ts')
  );
  const configFile =
    choices.bundler === 'vite'
      ? 'vite.mfe.config.ts'
      : 'webpack.mfe.config.mjs';
  fs.copyFileSync(
    path.join(overlay, configFile),
    path.join(directory, configFile)
  );
  const manifestPath = path.join(directory, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (choices.bundler === 'vite') {
    manifest.devDependencies['@module-federation/vite'] = '1.23.7';
    manifest.scripts.dev = 'vite --config vite.mfe.config.ts';
    manifest.scripts.build =
      'tsc --noEmit && vite build --config vite.mfe.config.ts';
    const tsconfigPath = path.join(directory, 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    tsconfig.include.push('vite.mfe.config.ts');
    writeJson(tsconfigPath, tsconfig);
  } else {
    manifest.scripts.dev =
      'webpack serve --config webpack.mfe.config.mjs --mode development';
    manifest.scripts.build =
      'tsc --noEmit && webpack --config webpack.mfe.config.mjs --mode production';
  }
  writeJson(manifestPath, manifest);
  generateRoutes(directory);
}

function createRemote(
  directory,
  templateDirectory,
  { name, title, choices, storybookPort }
) {
  fs.cpSync(path.join(templates, 'federation', 'remote'), directory, {
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
  let html = fs.readFileSync(
    path.join(templateDirectory, 'index.html'),
    'utf8'
  );
  const safeTitle = title
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
  html = html
    .replaceAll('__PROJECT_TITLE__', safeTitle)
    .replaceAll('__PROJECT_MARK__', safeTitle.slice(0, 1));
  const manifestPath = path.join(directory, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.name = name;
  manifest.packageManager =
    choices.packageManager === 'pnpm' ? 'pnpm@11.8.0' : 'npm@11.20.0';
  manifest.scripts.storybook = `storybook dev -p ${storybookPort} --no-open`;
  if (choices.wui) {
    manifest.dependencies['@w.ui/wui-react'] = '6.1.1';
    manifest.dependencies['framer-motion'] = '14.9.0';
    const mainPath = path.join(directory, 'src', 'main.tsx');
    fs.writeFileSync(
      mainPath,
      "import '@w.ui/wui-react/style.css';\n" +
        fs.readFileSync(mainPath, 'utf8')
    );
    const previewPath = path.join(directory, '.storybook', 'preview.ts');
    fs.writeFileSync(
      previewPath,
      "import '@w.ui/wui-react/style.css';\n" +
        fs.readFileSync(previewPath, 'utf8')
    );
  }
  if (choices.bundler === 'webpack') {
    manifest.devDependencies['@storybook/react-webpack5'] = '10.6.5';
    delete manifest.devDependencies['@storybook/react-vite'];
    const storybookPath = path.join(directory, '.storybook', 'main.ts');
    fs.copyFileSync(
      path.join(templates, 'storybook', 'webpack.main.ts'),
      storybookPath
    );
    fs.copyFileSync(
      path.join(templateDirectory, 'webpack.config.mjs'),
      path.join(directory, 'webpack.config.mjs')
    );
    fs.rmSync(path.join(directory, 'vite.config.ts'));
    html = html.replace(
      '    <script type="module" src="/src/main.tsx"></script>\n',
      ''
    );
    const tsconfigPath = path.join(directory, 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    tsconfig.compilerOptions.types = [];
    tsconfig.include = ['src', '.storybook'];
    writeJson(tsconfigPath, tsconfig);
    manifest.scripts.dev =
      'webpack serve --config webpack.mfe.config.mjs --mode development';
    manifest.scripts.build =
      'tsc --noEmit && webpack --config webpack.mfe.config.mjs --mode production';
    delete manifest.devDependencies.vite;
    delete manifest.devDependencies['@vitejs/plugin-react'];
    delete manifest.devDependencies['@module-federation/vite'];
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
  } else {
    fs.rmSync(path.join(directory, 'webpack.mfe.config.mjs'));
  }
  fs.writeFileSync(path.join(directory, 'index.html'), html);
  writeJson(manifestPath, manifest);
  writeJson(path.join(directory, '.baize.json'), {
    template: 'react-admin-remote',
  });
}
