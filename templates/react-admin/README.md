# %%PROJECT_TITLE%%

Baize 生成的 React 19 + TypeScript 管理后台，使用 **%%BUNDLER%%** 构建。包管理器是 **%%PM%%**。%%WUI_STATE%%

## 启动

Node.js 20.19+。若启用了 WUI，Node.js 需满足 `^22.22.2 || ^24.15.0 || >=26.0.0`。

```bash
%%PM%% install
%%PM%% run dev
```

访问 `http://localhost:5173`。管理员 `admin@baize.dev`、访客 `viewer@baize.dev`，密码均为 `Demo123!`。管理员可管理用户；访客可查看工作台和设置。演示用户与偏好保存在浏览器 `localStorage`，登录会话保存在 `sessionStorage`。

如果启动提示 `Missing or incomplete dependencies` 或 Vite 报 `Failed to resolve import`，请先在本项目根目录重新运行 `%%PM%% install`，完成后重启开发服务。多项目和微前端工程应在工作区根目录安装。旧版生成工程若 `package.json` 未包含 `i18next`、`react-i18next`，需要先升级依赖声明或重新生成工程；单纯重装不会补上未声明的包。

## 常用命令

| 命令                         | 作用                                    |
| ---------------------------- | --------------------------------------- |
| `%%PM%% run lint`            | Oxlint 与 Prettier 格式检查             |
| `%%PM%% run typecheck`       | TypeScript 检查                         |
| `%%PM%% run test`            | Vitest 单测                             |
| `%%PM%% run quality`         | 顺序执行 lint、类型、测试和构建         |
| `%%PM%% run build`           | 生产构建到 `dist/`                      |
| `%%PM%% run storybook`       | 组件开发，默认 6006 端口                |
| `%%PM%% run build:storybook` | 构建到 `storybook-static/`              |
| `%%PM%% run release`         | 质量检查通过后生成 `release/<version>/` |

推送及 PR 会触发 `.github/workflows/ci.yml`。推送 `v*` 标签会在 CI 中运行 release 并上传构建产物；该命令不会发布应用或 npm 包。提交依赖锁文件可以固定安装结果。

## 开发业务页面

```bash
baize add page reports --title "报表"
```

命令创建 `src/pages/reports.tsx` 和 `reports.route.ts`，并重建 `src/app/route-registry.ts`。手工添加页面时也需要这两个文件；`predev`、`prebuild`、`pretypecheck` 会自动更新路由表。路由的 `roles` 用于导航显示和前端访问检查，真实授权必须由后端执行。

从这些位置开始替换演示实现：

| 文件                      | 修改内容                                 |
| ------------------------- | ---------------------------------------- |
| `src/services/auth.ts`    | 登录、会话恢复、退出和真实身份校验       |
| `src/services/users.ts`   | 用户查询、保存与删除 API                 |
| `src/app/AppShell.tsx`    | 品牌、导航和账户操作                     |
| `src/pages/dashboard.tsx` | 业务指标与概览                           |
| `src/app/project.json`    | 浏览器标题、导航和登录页共用的项目显示名 |

## 外观与语言

设置页保存主题（跟随系统/浅色/深色）、强调色、密度、语言和工作区名称。默认偏好在 `src/app/preferences.tsx`；可在其中增减色板、调整 Ant Design token 或修改存储策略。中英文文案在 `src/i18n/resources.ts`，新业务页面可使用 `useTranslation()` 和自己的翻译键。全局视觉样式在 `src/styles.css`。

boot splash 的文案与标记在 `index.html`，颜色、布局和动效在 `public/boot-splash.css` 的 `--boot-*` 变量中修改。React 挂载后由 `src/app/boot-splash.ts` 关闭 splash；启动超过 12 秒时会显示重试操作。

Storybook 示例位于 `src/components/StatusBadge.stories.tsx`；启用 WUI 时还有 `WuiCodeInput.stories.tsx`。WUI 的样式已在应用和 Storybook 中引入；使用其他按需组件时，按该组件的文档安装其可选 peer 依赖。

## 部署

`dist/` 是可部署的静态站点。应用使用浏览器历史路由，Web 服务器应将未知路径回退到 `index.html`。`release/<version>/<项目包名>/` 包含同一构建结果及 `manifest.json`。演示认证和浏览器数据只适合本地开发；生产部署前需接入后端认证、授权和持久化 API。
