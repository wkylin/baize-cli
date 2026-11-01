# Baize CLI 白泽

Baize 是 React / Vue 管理后台项目工具箱。CLI 随 npm 包发布精简模板，在本地组合工程文件，不会克隆 `pro-react-admin` 仓库。新项目可选择技术栈、包管理器和项目形态，再从演示认证与数据服务逐步替换成业务实现。

## 环境与安装

- Node.js 20.19+；选择 `--wui` 时要求 `^22.22.2 || ^24.15.0 || >=26.0.0`。
- 默认使用 pnpm 11.8.0，也可选择 npm。请先安装所选包管理器。

```bash
npm install -g baize-cli
baize doctor
baize create my-admin
cd my-admin
pnpm install
pnpm run dev
```

直接运行 `baize` 或 `baize create` 会进入交互式创建；提供项目名时不会提问，适合脚本和 CI。默认是 **React + pnpm + Vite + 普通单项目**，创建时不联网、不安装依赖，也不会覆盖已有目录。

## 创建选项

| 选项                | 可选值                             | 默认值        | 作用                                                      |
| ------------------- | ---------------------------------- | ------------- | --------------------------------------------------------- |
| `--template`        | `react-admin`、`vue-admin`         | `react-admin` | React 或 Vue 3 + Pinia 模板                               |
| `--package-manager` | `pnpm`、`npm`                      | `pnpm`        | 安装、运行和 CI 使用的包管理器                            |
| `--bundler`         | `vite`、`webpack`                  | `vite`        | 构建器；Webpack 仅适用于 React 模板                       |
| `--mode`            | `single`、`multi`、`microfrontend` | `single`      | 生成普通项目、多项目工作区或微前端                        |
| `--wui`             | 开关                               | 关闭          | React 模板加入并安装 `@w.ui/wui-react` 与 `framer-motion` |
| `--install`         | 开关                               | 关闭          | 创建后安装依赖；`--wui` 会自动启用                        |
| `--title`           | 文本                               | 从目录名推导  | 项目显示名，最长 40 字符                                  |

```bash
baize create customer-admin --package-manager npm --bundler webpack --title "客户运营"
baize create enterprise-suite --mode multi
baize create insight-platform --mode microfrontend --bundler vite
baize create design-admin --wui
baize create vue-console --template vue-admin
baize create vue-suite --template vue-admin --mode multi --package-manager npm
baize create vue-platform --template vue-admin --mode microfrontend
```

`baize init` 是 `baize create` 的别名。Vue 模板固定使用 Vite，选择 `--bundler webpack` 或 `--wui` 会在创建目录前报错。Vue 应用采用 Vue Router、Pinia、Vue I18n 与 Element Plus。WUI 的 npm 包名是 `@w.ui/wui-react`；它是 React 专用组件库，React 模板会安装基础必需依赖并提供 `WuiCodeInput` 示例和 Storybook story。

## 项目形态

| 形态            | 目录                            | 开发端口   | 用途                     |
| --------------- | ------------------------------- | ---------- | ------------------------ |
| `single`        | 项目根目录                      | 5173       | 一个独立管理后台         |
| `multi`         | `apps/admin`、`apps/operations` | 5173、5174 | 多个独立产品，共用根命令 |
| `microfrontend` | `apps/shell`、`apps/reports`    | 5173、5174 | shell 宿主与独立报表远端 |

多项目中可继续添加应用；端口和 Storybook 端口会递增：

```bash
cd enterprise-suite
baize add project finance --title "财务后台"
pnpm install
baize add page ledger --project finance --title "总账"
```

普通项目或工作区应用中可以添加页面：

```bash
baize add page reports --title "报表"
```

React 模板会创建 `src/pages/reports.tsx`，Vue 模板会创建 `src/pages/reports.vue`；两者都会创建 `reports.route.ts` 并更新懒加载路由表。`route.roles` 控制菜单和前端路由访问。微前端的 `reports` 路由由远端提供，不能用同名页面覆盖。

## 生成工程

所有形态都提供根命令：

```bash
pnpm run dev              # 启动应用；工作区同时启动各应用
pnpm run lint             # Oxlint + Prettier 格式检查
pnpm run typecheck        # TypeScript 检查
pnpm run test             # Vitest 单测
pnpm run quality          # lint、typecheck、test、build
pnpm run build            # 生产构建
pnpm run storybook        # 组件开发；工作区使用 6006、6007... 端口
pnpm run build:storybook  # Storybook 静态文件
pnpm run release          # 先通过质量门禁，再写入 release/<version>/
```

选择 npm 时将命令中的 `pnpm` 换成 `npm`。生成工程包含 GitHub Actions 质量工作流和 `v*` 标签构建工作流。`release` 只产出可部署文件与 `manifest.json`，不会自动发布到 npm 或部署服务器。

React 与 Vue 应用都包括演示登录、角色导航、工作台、用户增删改查、403/404 页面、boot splash、主题/强调色/密度/语言偏好和中英文内置文案。首次启动使用以下演示账号：

| 角色   | 邮箱               | 密码       |
| ------ | ------------------ | ---------- |
| 管理员 | `admin@baize.dev`  | `Demo123!` |
| 访客   | `viewer@baize.dev` | `Demo123!` |

演示认证和用户数据保存在浏览器；它们只用于开发界面。接入生产系统时需要替换 `src/services/auth.ts`、`src/services/users.ts`，并在服务端验证身份和权限。生成项目的 README 说明了主题、语言、splash 和微前端部署的修改位置。

启动或构建时若提示依赖缺失，在生成工程根目录重新运行所选包管理器的 `install`，然后重启开发服务。工作区应在根目录安装依赖；旧版生成工程若没有声明报错的包，应先更新 `package.json` 或重新生成。新版工程会在启动、构建和质量检查前列出缺失或不完整的直接依赖。

## 开发 CLI

```bash
npm install
npm run lint
npm test
node bin/index.js create local-demo --package-manager npm
npm pack --dry-run
```

设计取舍与 Tavily 检索的开源参考见[项目分析](./docs/PROJECT_ANALYSIS.md)，发布流程见[发布指南](./docs/PUBLISHING.md)。

## License

MIT
