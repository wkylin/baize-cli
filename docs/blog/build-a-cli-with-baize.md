# 把一个命令做成可交付工具：跟着 Baize 从零开发 Node.js CLI

执行一条命令：

```bash
baize create customer-admin --template react-admin --package-manager npm
```

终端解析命令、选择模板，在当前目录创建工程，写入包名、路由和构建配置，再告诉用户如何启动。

这条链路可以拆成五层：

```text
系统命令 → Node.js 入口 → 参数与交互 → 工程生成 → npm 交付
```

本文以 Baize CLI 1.3.0 的实际实现为主线，说明每一层如何工作，再给出一套可以迁移到 `lib` 目录的构建方案。代码标为“简化示例”的部分用于讲解，实际工程还应保留现有错误处理、模板清单和测试。

先澄清构建对象：**当前 Baize CLI 直接发布 ESM JavaScript 源码，没有 CLI 的 `build` 脚本，也没有生成 `lib`。React/Vue 工程里的 Vite/Webpack 是生成项目的构建器。** 后文的 `lib` 方案是可选改造示例。

## 1. CLI 开发用到了哪些技术

| 技术                           | 在 Baize 中解决的问题                    | 代码位置                                    |
| ------------------------------ | ---------------------------------------- | ------------------------------------------- |
| Node.js                        | 运行终端程序、访问文件系统、调用包管理器 | `bin/`、`src/`                              |
| 原生 ESM                       | 使用 import/export，按模块位置定位资源   | `package.json` 的 `type`、`import.meta.url` |
| npm 包机制                     | 安装命令、声明运行依赖、分发模板         | `bin`、`main`、`files`、`engines`           |
| Commander                      | 子命令、参数、选项、帮助、版本号         | `src/index.js`                              |
| Inquirer                       | 输入项目名、选择模板、确认安装           | `src/index.js`                              |
| Chalk                          | 区分成功、提示和错误输出                 | `src/utils/logger.js`                       |
| node:fs / node:path / node:url | 复制模板、修改文件、解析绝对路径         | `src/project/`                              |
| node:child_process             | 启动 npm/pnpm 和工作区应用               | 创建逻辑及生成的脚本                        |
| node:test / node:assert        | 测试目录保护、选项约束、生成结果         | `test/project/`                             |
| Oxlint / Prettier              | 检查 CLI 源码与生成代码的约定            | 根脚本及模板脚本                            |
| GitHub Actions                 | 在提交和 PR 上运行安装、lint、测试       | `.github/workflows/ci.yml`                  |

React、Vue、TypeScript、Vite、Webpack、Pinia、Vitest、Storybook 等，主要构成 CLI 生成的应用。开发 CLI 的命令解析和文件生成逻辑，不需要先启动这些框架。

CLI 本身的运行依赖只有 Commander、Inquirer 和 Chalk。Node.js 已经提供复制目录、读写 JSON、创建临时目录和启动子进程的能力，项目据此减少了额外工具依赖。

## 2. 从 package.json 开始，把 JavaScript 变成系统命令

最初可以这样创建一个新的示例包。若要公开发布，请换成自己拥有且未被占用的 npm 包名：

```bash
mkdir my-team-cli
cd my-team-cli
npm init -y
npm install commander inquirer chalk
npm install -D oxlint prettier
```

Baize 的关键包配置可以摘录为：

```json
{
  "name": "baize-cli",
  "version": "1.3.0",
  "type": "module",
  "main": "src/index.js",
  "bin": {
    "baize": "./bin/index.js"
  },
  "engines": {
    "node": ">=20.19.0"
  }
}
```

几个容易混淆的字段各有作用：

| 字段           | 含义                                                            |
| -------------- | --------------------------------------------------------------- |
| `name`         | npm 安装时使用的包名，例如 `npm install -g baize-cli`           |
| `bin`          | 安装后暴露的终端命令，这里是 `baize`                            |
| `main`         | 其他 Node.js 程序导入包时的传统入口                             |
| `type: module` | 将包内 `.js` 按 ESM 解析                                        |
| `engines`      | 声明支持的 Node.js 版本范围；是否强制拒绝安装取决于包管理器设置 |

包名与命令名可以不同。`main` 也不会自动创建终端命令，安装器依据的是 `bin`。

在类 Unix 系统中，npm 会为命令建立链接；Windows 通常生成对应命令包装文件。包仍然需要 Node.js 运行，npm 包安装并不会把它编译成独立原生可执行文件。

### 一个很薄的 bin 入口

Baize 的 `bin/index.js` 只有：

```js
#!/usr/bin/env node

import { run } from '../src/index.js';

run();
```

第一行是 shebang，表示通过环境中的 `node` 执行。它应位于文件首行，前面不要放空行或 BOM。

`bin` 层仅负责启动，命令逻辑放在 `src`。这样测试可以导入逻辑模块，而不会因为导入一个文件就自动运行整套命令。

本地也可以直接执行：

```bash
node bin/index.js --help
node bin/index.js --version
```

希望通过文件路径直接执行时，还需要可执行权限：

```bash
chmod +x bin/index.js
./bin/index.js --help
```

## 3. 用 Commander 建立命令接口

Baize 的命令结构是：

```text
baize
├── create [name]      创建项目
│   └── init          create 的别名
├── list              列出模板
├── doctor            检查运行环境
└── add
    ├── page <slug>    添加页面
    └── project <slug> 添加工作区应用
```

方括号表示可选位置参数，尖括号表示必填位置参数。

下面是创建命令的简化摘录：

```js
import { Command } from 'commander';
import { createProject } from './project/create.js';

export async function run(argv = process.argv) {
  const program = new Command();

  program
    .name('baize')
    .description('Create reusable admin projects')
    .version('1.3.0', '-v, --version');

  program
    .command('create')
    .alias('init')
    .argument('[name]', 'project directory name')
    .option('-t, --template <name>', 'template name', 'react-admin')
    .option('--package-manager <name>', 'npm or pnpm', 'pnpm')
    .option('--install', 'install dependencies after creation')
    .action((name, options) => {
      createProject(name, options);
    });

  await program.parseAsync(argv);
}
```

真实 Baize 在 action 中还会调用 `creationInput()` 补齐交互输入。它读取 `package.json` 获取版本号，避免在命令入口再维护一个版本常量。

对于这条命令：

```bash
baize create customer-admin --package-manager npm --install
```

回调拿到的位置参数和选项大致是：

```js
name === 'customer-admin';
options.packageManager === 'npm';
options.install === true;
```

Commander 会把 `--package-manager` 转换为 `packageManager`。选项中带 `<name>` 表示要消费一个值，单独的 `--install` 是布尔开关。

`parseAsync()` 使异步命令回调可以被等待，包括后续的交互问题。用自定义 `argv` 作为函数参数，也给命令测试留下了入口。

### 错误输出与退出状态也是接口

Baize 在命令执行边界捕获错误，输出错误消息，并设置：

```js
process.exitCode = 1;
```

终端中的人读取提示，Shell 和 CI 读取退出码。仅打印“失败”但返回 0，会让自动化流程把失败当成成功。

直接调用 `process.exit()` 可能截断尚未完成的输出或清理工作，能够正常结束的场景可以设置 `exitCode`，让事件循环自然退出。

## 4. 用 Inquirer 补全交互，而不是让每次运行都提问

Baize 同时照顾两类使用方式：

```bash
# 面向终端用户：逐步选择
baize create

# 面向脚本与 CI：明确给出项目名和选项
baize create customer-admin --template vue-admin --package-manager npm
```

当前行为有明确边界：提供项目名时，省略的选项采用默认值，创建流程不再提问；没有项目名时，进入交互流程。它并非“任何缺失参数都会单独触发提问”。

Inquirer 的基本用法如下，这是模板选择的简化示例：

```js
import inquirer from 'inquirer';

const answers = await inquirer.prompt([
  {
    type: 'list',
    name: 'template',
    message: 'Template:',
    choices: ['react-admin', 'vue-admin'],
    default: 'react-admin',
  },
  {
    type: 'list',
    name: 'bundler',
    message: 'Bundler:',
    choices: ['vite', 'webpack'],
    default: 'vite',
    when: (values) => values.template === 'react-admin',
  },
  {
    type: 'confirm',
    name: 'install',
    message: 'Install dependencies now?',
    default: false,
  },
]);
```

`name` 是返回对象的字段名，`when` 根据前面的答案决定是否展示问题。Vue 只支持 Vite，因此可以跳过构建器选择。

### 为什么要检查 TTY

在非交互环境里等待输入，会导致任务一直挂起。Baize 在缺少项目名时检查：

```js
if (!process.stdin.isTTY) {
  throw new Error('Project name is required in non-interactive mode.');
}
```

这让 CI 得到明确失败，而不是等待一个永远不会出现的键盘输入。

### 交互校验与生成校验分工不同

输入框中的 `validate()` 用来及时提示名字不合法；`createProject()` 中的校验则保护真正的文件操作。

后者不能省略，因为用户可以通过命令行参数或 JavaScript API 绕过交互层。Baize 对项目名限制为小写字母开头、包含小写字母/数字/连字符，最长 100 个字符，并拒绝已经存在的目标目录。

选项由 `normalizeOptions()` 统一处理，创建入口再校验框架兼容性。这让交互和脚本最终进入相同的生成规则。

## 5. 本地模板怎样组织、定位和交付

Baize 的模板目录可以简化为：

```text
templates/
├── react-admin/          React 基础应用
├── vue-admin/            Vue 基础应用
├── federation/           React 宿主和远端素材
├── vue-federation/       Vue 宿主和远端素材
├── shared/               公共脚本
├── storybook/            特定构建器的 Storybook 配置
├── workspace/            工作区编排脚本及文档
└── wui/                  可选组件示例
```

基础模板是一套应用源码。CLI 用配置变换和覆盖文件组合工程形态，避免为每种选项完整复制一份应用。

### 模板路径必须相对于安装包

`src/project/templates.js` 用以下方式定位 React 模板：

```js
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(
  new URL('../../templates/react-admin/', import.meta.url)
);
```

这里要分清两个坐标系：

| 路径起点          | 应该定位什么                      |
| ----------------- | --------------------------------- |
| `import.meta.url` | 已安装 CLI 中的模板、脚本和元信息 |
| `process.cwd()`   | 用户希望创建或修改的项目目录      |

如果模板位置依据 `process.cwd()` 拼接，CLI 在仓库目录内可能正常，安装到全局后切换到用户目录就会失败。

`new URL()` 先处理模块相对位置，再用 `fileURLToPath()` 转成文件路径，可以正确处理路径中的空格等编码情况。

### 复制模板时过滤开发现场

Baize 通过 `fs.cpSync()` 复制源码，过滤本地依赖、构建结果、Git 元数据和锁文件等内容。简化示例：

```js
const ignored = new Set(['node_modules', 'dist', '.git', '.vite']);

fs.cpSync(source, target, {
  recursive: true,
  filter(file) {
    const firstSegment = path.relative(source, file).split(path.sep)[0];
    return !ignored.has(firstSegment);
  },
});
```

这是按模板根目录的首个路径段过滤，适用于当前的应用模板结构。模板若继续引入更深层的嵌套工程，应补充对应的过滤策略与测试。

模板里的 `_gitignore` 会在复制后重命名为 `.gitignore`。这是让模板内容和最终工程文件名分开处理的一种实用方式；最终 npm 包是否包含它，仍需通过打包清单确认。

本地模板使源码生成不依赖远端 Git 仓库。首次安装 CLI 和后续安装业务依赖仍可能需要网络，离线生成的能力应按这个范围理解。

## 6. 模板渲染：结构化数据、HTML 与源码分别处理

复制完模板，还需要写入用户选择。

JSON 文件应按数据修改：

```js
const manifestPath = path.join(target, 'package.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

manifest.name = projectName;
manifest.packageManager = 'pnpm@11.8.0';

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
```

Markdown 中的项目名称和命令，可以使用约定占位符：

```js
const readme = source
  .replaceAll('%%PROJECT_TITLE%%', title)
  .replaceAll('%%PM%%', packageManager);
```

HTML 标题需要按 HTML 上下文转义，生成 TypeScript 字符串时则要按 JavaScript 字符串规则处理。Baize 在生成路由标题时采用 `JSON.stringify(title)`，保留引号、换行和反斜杠的正确转义。

这些输出上下文不能共用一个“万能 replace”。需要生成的条件分支非常多时，可以引入模板引擎；当前项目通过有限占位符、JSON 操作和覆盖文件完成组合。

### 选择构建器意味着改变一组配置

React 选择 Webpack 后，生成器会调整依赖、build/dev 脚本、HTML 入口、TypeScript 和 Storybook 配置，并移除不再使用的 Vite 配置。

因此，生成器的职责是构造一套相互匹配的工程。只把某个 package.json 脚本中的 `vite` 改成 `webpack`，不足以完成这种切换。

## 7. 可靠生成：先 staging，后正式落位

Baize 的创建函数按照下面的顺序执行：

```text
校验输入
→ 检查目标目录
→ 创建临时目录
→ 复制模板并完成配置
→ 生成路由和工作流
→ 再检查目标目录
→ rename 到正式目录
→ 可选安装依赖
```

核心模式是：

```js
const staging = fs.mkdtempSync(path.join(cwd, `.${name}.baize-`));

try {
  // 在 staging 中生成完整项目。
  // 落位前再次检查 target 是否已存在。
  fs.renameSync(staging, target);
} finally {
  if (fs.existsSync(staging)) {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}
```

这能在常见配置失败时清理临时内容，减少最终目录中残留半成品的情况。它不提供完整的并发创建隔离或断电恢复事务。

依赖安装放在落位之后。若安装失败，已经生成的源码保留，用户可以进入项目重新运行安装命令。

对 CLI 而言，“失败后能否恢复”也是生成设计的一部分。

## 8. 如何安装依赖与管理外部进程

Baize 调用包管理器的核心代码是：

```js
const result = spawnSync(manager, ['install'], {
  cwd: target,
  stdio: 'inherit',
  shell: false,
});

if (result.error) {
  throw new Error(`Could not run ${manager}: ${result.error.message}`);
}

if (result.status !== 0) {
  throw new Error(`${manager} install failed.`);
}
```

`cwd` 决定在哪个工程安装，`stdio: inherit` 让用户看到包管理器的日志，`shell: false` 避免把命令与用户输入拼成 Shell 字符串。

`manager` 在前面限定为 npm/pnpm，项目名也经过校验。参数数组与有限命令集共同减少了输入被误解释的机会。

当前实现使用同步安装，适合一次性串行生成。耗时任务更复杂时，可以用异步 `spawn()`，并处理取消、子进程退出和清理。生成的工作区脚本已经使用异步子进程同时运行多个开发服务。

若要正式支持更多 Windows 运行场景，还需要专门验证 npm/pnpm 的命令包装文件启动方式。`shell: false` 本身并不能保证所有平台的 `.cmd` 解析一致，可以按平台适配或使用经过验证的进程启动库。

## 9. 从 create 扩展到 add：让工具理解工程结构

创建之后继续支持增量操作，需要知道“当前在哪个项目”。Baize 使用 `.baize.json` 标记生成工程。

`add page` 会从当前目录逐级向上查找标记，识别框架和项目形态。在工作区中，再根据 `--project` 找到目标应用。

接着它完成：

```text
校验页面 slug 和标题
→ 拒绝覆盖已有页面
→ 写入页面组件与 .route.ts
→ 更新静态路由注册表
```

React 和 Vue 有各自的路由生成函数；React 使用 `lazy(() => import(...))`，Vue 使用返回动态 import 的组件加载函数。输出都是普通 TypeScript 模块。

这种方式把文件发现放到 Node.js 生成阶段，使 React 的业务路由能够同时进入 Vite 和 Webpack 模块图。

扩展 CLI 时，可以沿用这一边界：命令层只收集意图，工程操作层理解目录与约定，模板层承载需要写入的源码。

## 10. 如何构建成 lib：先决定发布布局

`lib` 是发布目录名称，叫 `dist` 也可以。它不会自动带来打包、压缩、类型声明或独立可执行能力。

对于当前 Baize，有两条实际可行的路线：

| 路线         | 发布内容                   | 适用条件                             |
| ------------ | -------------------------- | ------------------------------------ |
| 直接发布源码 | `bin/`、`src/`、模板和文档 | 已是目标 Node.js 可运行的 JavaScript |
| 生成 lib     | `bin/`、`lib/`、模板和文档 | 希望分开发与发布目录，或引入转译流程 |

当前使用第一条。若采用第二条，推荐先保持源码目录结构，避免在引入构建的同时改变资源定位规则：

```text
开发目录                         发布目录
src/index.js                    lib/index.js
src/project/templates.js        lib/project/templates.js
src/project/create.js           lib/project/create.js

templates/                      templates/
bin/index.js                    bin/index.js
package.json                    package.json
```

从 `src/project/` 到 `lib/project/`，文件相对包根的深度保持不变。因此 `../../templates/` 仍然指向包根模板，`index.js` 中的 `../package.json` 也仍然有效。

### 一套保留目录结构的 esbuild 示例

以下配置是可选构建方案，尚未加入当前项目。它转译每个源模块并输出到 `lib`，保留模块间的 import：

```bash
npm install -D esbuild
```

创建 `scripts/build.mjs`：

```js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'src');
const output = path.join(root, 'lib');

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    return entry.name.endsWith('.js') ? [file] : [];
  });
}

fs.rmSync(output, { recursive: true, force: true });

await build({
  entryPoints: sourceFiles(source),
  outbase: source,
  outdir: output,
  platform: 'node',
  format: 'esm',
  target: 'node20.19',
  bundle: false,
  sourcemap: true,
});
```

几个配置决定了这条方案的行为：

| 配置                  | 作用                                          |
| --------------------- | --------------------------------------------- |
| 每个 `.js` 都作为入口 | 将当前 `src` 下各模块输出，而不只处理顶层入口 |
| `outbase: src`        | 保留 `project/`、`utils/` 等目录层级          |
| `platform: node`      | 使用 Node.js 平台语义                         |
| `format: esm`         | 与包的 `type: module` 对齐                    |
| `bundle: false`       | 保留模块引用，不把依赖和模板脚本内联到单文件  |
| `sourcemap: true`     | 为构建后代码提供源码定位映射                  |

源映射可能带有源码内容，应按自己的发布需求决定是否包含。这里没有压缩；终端工具通常更需要可读的错误栈与可诊断性。

再把 `bin/index.js` 改成：

```js
#!/usr/bin/env node

import { run } from '../lib/index.js';

run();
```

然后合并这些 package.json 字段：

```json
{
  "main": "./lib/index.js",
  "scripts": {
    "build": "node scripts/build.mjs",
    "prepack": "npm run lint && npm test && npm run build"
  }
}
```

需要同步调整原 `files` 发布清单：将 `src/` 换为 `lib/`，保留当前模板逐项白名单、`bin/`、README、LICENSE 等条目。不要直接用宽泛的 `templates/` 替代现有白名单，否则本地额外生成的内容也可能进入安装包。

`prepack` 能让常规 `npm pack` 或从项目目录发布时先执行检查与构建。明确使用 `--ignore-scripts` 会跳过生命周期；发布一个已经形成的 tgz，也应以这个 tgz 形成前的验证为依据。

当前代码是 JavaScript，因此这一步主要建立发布输出和目标语法转换，不会自动提升已有业务能力。未来迁移到 TypeScript，可以扩展入口扫描与类型检查；esbuild 的转译仍不能替代 `tsc`。

### 为什么这里没有直接打成单文件

Baize 多处通过 `import.meta.url` 定位模板，还会从模板目录导入路由生成脚本。如果所有模块被内联到 `lib/index.js`，原来位于 `src/project/` 的相对路径语义就可能改变。

单文件方案可以实现，但必须集中重做资源定位、区分应内联的模块与应交付的静态文件，再用安装包测试验证。保留目录结构，让这次构建改造的影响范围更明确。

本文的 esbuild 示例已在隔离工程中执行，构建后的 CLI 能生成 React、Vue、Webpack 和微前端工程。随后将 lib 方案打成 tgz，在另一个消费目录离线安装，并验证版本命令和 React/Vue 模板生成。当前仓库仍使用直接发布 src 的布局。

### lib 与“可被程序调用的库”也有区别

当前 `src/index.js` 导出 `run()`，核心操作分散在 `src/project/`。若希望对外稳定提供 `createProject()` 等 API，需要另外设计公开入口、参数契约、`exports` 和类型声明。

输出到 `lib` 只改变文件布局，并不会自动形成稳定的公共库接口。CLI 和公共 API 可以共享生成核心，但应明确哪些导出承诺兼容。

## 11. npm 打包必须同时考虑代码与模板

CLI 运行时依赖两类文件：Node.js 模块和模板资源。只检查 `lib/index.js` 是否生成，不能证明交付完整。

实际发布前应检查：

```bash
npm pack --dry-run --json
```

生成真实压缩包：

```bash
npm pack
```

得到例如 `baize-cli-1.3.0.tgz`。检查压缩包时，关注模板的隐藏文件和重命名文件：

```text
.baize.json
.prettierrc
.storybook/
_gitignore
```

它们可能影响工程识别、格式检查、Storybook 和 Git 忽略规则。

npm 包中的 dependencies 会在用户安装 CLI 时安装，根 devDependencies 通常不会作为用户安装 CLI 的依赖一起安装。模板 `package.json` 是待生成应用的清单，npm 不会仅因为它被放进 `templates` 就自动安装模板的依赖。

这也解释了此前的本地错误：根目录安装成功，并不代表 `templates/react-admin` 的开发依赖已经齐全。维护模板时，需要在相应模板或生成的验证工程中安装依赖。

## 12. 本地调试分两轮：源码调试和真实安装调试

开发命令可以先直接运行：

```bash
node bin/index.js --help
node bin/index.js list
node bin/index.js create local-demo --package-manager npm
```

还可以使用 `npm link`：

```bash
npm link
baize --version
```

若采用 lib 方案，link 前需要执行 build。修改 src 后也要重新构建，或使用专门的 watch 流程。

link 连接的是开发目录，未发布的源码和资源仍可能被访问。真实安装测试则只依赖打进 tgz 的文件，因此两者都要做。

推荐在包目录之外创建临时测试目录：

```bash
# 先在 CLI 仓库运行 npm pack，记下 tgz 的绝对路径。
mkdir /tmp/baize-consumer-check
cd /tmp/baize-consumer-check
npm init -y
npm install /absolute/path/to/baize-cli-1.3.0.tgz
./node_modules/.bin/baize --version
./node_modules/.bin/baize create sample-admin --package-manager npm
cd sample-admin
npm install
npm run quality
```

这里的绝对路径需要替换为实际打包结果。把测试目录放在仓库外，有助于发现模板定位错误，也避免开发目录的依赖偶然补全缺失内容。

## 13. 如何测试一个会创建文件的 CLI

Baize 使用 Node.js 内置测试框架，临时目录承接生成结果。核心测试的形状如下：

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { createProject } from '../../src/project/create.js';

test('creates a project without installing dependencies', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-test-'));

  try {
    const target = createProject('sample-admin', { cwd: root });
    const manifest = JSON.parse(
      fs.readFileSync(path.join(target, 'package.json'), 'utf8')
    );

    assert.equal(manifest.name, 'sample-admin');
    assert.equal(fs.existsSync(path.join(target, '.gitignore')), true);
    assert.equal(fs.existsSync(path.join(target, 'node_modules')), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
```

值得优先覆盖的行为包括：已有目录保持原样，非法名称不能越出工作目录，不兼容选项在写入前失败，用户标题包含特殊字符时生成合法源码，新增页面能够进入路由注册表。

接着需要检查生成工程本身。Baize 曾在发布验证中发现：生成的路由文件语法正确，但标题引号不符合模板的 Prettier 规则。回归测试因此直接调用 Prettier 检查生成内容。

1.3.0 的验证还实际安装并构建了九种基础工程组合，另外检查默认 pnpm 和可选 WUI 流程。CLI 源码测试、生成代码检查和真实安装包测试分别发现不同问题。

采用 lib 方案后，还应增加一轮构建产物烟测；仅从 `src` 导入函数的测试无法发现 bin 仍指向旧目录或 lib 中漏模块的问题。

## 14. 发布流程，以及三种不同的 build

开发此类项目时，至少有三个交付对象：

| 对象             | 输入                          | 输出                     |
| ---------------- | ----------------------------- | ------------------------ |
| CLI 构建（可选） | CLI 的 src                    | Node.js 可运行的 lib     |
| CLI 打包发布     | bin、src 或 lib、模板、元信息 | npm tgz 和 registry 版本 |
| 业务应用构建     | 生成的 React/Vue 工程         | 浏览器静态资源 dist      |

生成应用的 `release` 会再次通过质量检查，再把静态资源复制到 `release/<version>/` 并写 manifest。该流程没有执行 CLI 自身的 npm publish。

CLI 发布可以沿着下面的步骤执行：

```bash
npm ci
npm run lint
npm test

# 采用 lib 方案时运行：
# npm run build

npm pack --dry-run
```

检查并提交源码，更新版本和变更记录，再产生最终 tgz，执行隔离安装验证。`npm version patch` 默认会更新版本、创建提交和标签；`--no-git-tag-version` 只处理版本更新，适合自行组织提交与标签的流程。

正式发布使用已经验证的产物：

```bash
npm login --registry=https://registry.npmjs.org
npm publish ./baize-cli-<version>.tgz --registry=https://registry.npmjs.org
```

版本占位符替换为最终生成的文件名。npm 可能要求浏览器二次认证。发布后检查线上版本、dist-tag 和压缩包完整性，确认交付结果。

GitHub Actions 则先自动化仓库里的安装、lint 和测试。随着选项增长，再把打包烟测和关键生成工程的构建矩阵纳入 CI；当前仓库的根工作流没有自动执行全部九种工程的端到端构建。

## 15. 按什么顺序实现，才能逐步得到可用的工具

从 Baize 的结构反推开发顺序，可以把每一步变成一个可运行结果：

1. 配置 `bin` 和 shebang，让 `node bin/index.js --help` 能工作。
2. 用 Commander 实现带项目名的 create，先支持单模板与无交互路径。
3. 将模板放入包内，用模块位置寻找模板，用当前工作目录决定输出。
4. 完成名称校验、目录保护、临时生成和失败清理。
5. 用 JSON 操作与上下文对应的转义写入项目配置。
6. 加入 Inquirer，为没有位置参数的终端用户补齐选择，非 TTY 明确失败。
7. 加入可选安装和错误退出码，保留失败后可恢复的项目。
8. 通过测试固定生成行为，再扩展 Vue、构建器、工作区和 add 命令。
9. 根据实际需求选择直接发布源码或生成 lib，并验证资源路径。
10. 从真实 npm 压缩包安装、生成并构建工程，最后发布。

每一步都能单独验收：命令能否找到，参数是否正确，目录是否保护，文件能否被消费，包内资源是否齐全。

开发到这里，CLI 就拥有了完整的输入、执行和交付链路。后续增加能力时，可以继续沿着这些边界扩展，避免让终端交互、文件变换和发布规则混在同一个函数里。

---

项目源码：[wkylin/baize-cli](https://github.com/wkylin/baize-cli) · 安装包：[baize-cli](https://www.npmjs.com/package/baize-cli)

阅读路径：[命令入口](../../src/index.js) → [选项规则](../../src/project/options.js) → [模板注册](../../src/project/templates.js) → [项目创建](../../src/project/create.js) → [模板配置](../../src/project/app.js) → [生成测试](../../test/project/create.test.js)。

侧重应用架构和构建取舍的配套文章：[从 60 KB 的 npm 包到九种前端工程](./baize-cli-architecture-and-build.md)。
