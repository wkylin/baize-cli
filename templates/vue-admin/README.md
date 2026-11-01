# %%PROJECT_TITLE%%

Baize 生成的 Vue 3 + Vite + Pinia 管理后台。包管理器是 **%%PM%%**。

## 启动

Node.js 20.19+。运行：

```bash
%%PM%% install
%%PM%% run dev
```

访问 `http://localhost:5173`。管理员 `admin@baize.dev`、访客 `viewer@baize.dev`，密码均为 `Demo123!`。管理员可管理用户；访客可查看工作台和设置。演示用户与偏好保存在浏览器 `localStorage`，登录会话保存在 `sessionStorage`。

如果启动提示 `Missing or incomplete dependencies` 或 Vite 报 `Failed to resolve import`，请在本项目根目录重新运行 `%%PM%% install`，完成后重启开发服务。多项目和微前端工程应在工作区根目录安装。

## 常用命令

| 命令                         | 作用                                    |
| ---------------------------- | --------------------------------------- |
| `%%PM%% run lint`            | Oxlint 与 Prettier 格式检查             |
| `%%PM%% run typecheck`       | vue-tsc 类型检查                        |
| `%%PM%% run test`            | Vitest 单测                             |
| `%%PM%% run quality`         | lint、类型、测试、构建                  |
| `%%PM%% run build`           | 生产构建到 `dist/`                      |
| `%%PM%% run storybook`       | 组件开发，默认 6006 端口                |
| `%%PM%% run build:storybook` | 构建 Storybook 静态文件                 |
| `%%PM%% run release`         | 质量门禁通过后生成 `release/<version>/` |

推送及 PR 会触发 `.github/workflows/ci.yml`，推送 `v*` 标签会构建 release 产物。`release` 不会部署应用或发布 npm 包。

## 页面与数据

在项目根目录运行 `baize add page reports --title "报表"`，会创建 `src/pages/reports.vue`、`reports.route.ts` 并重建 `src/app/route-registry.ts`。手工新增页面也应提供页面和同名路由元数据；`predev`、`prebuild`、`pretypecheck` 会自动更新注册表。路由的 `roles` 只控制前端访问，真实授权必须在服务端执行。

| 文件                        | 修改内容                 |
| --------------------------- | ------------------------ |
| `src/services/auth.ts`      | 登录、会话恢复和退出     |
| `src/services/users.ts`     | 用户查询、保存和删除 API |
| `src/stores/auth.ts`        | Pinia 会话状态           |
| `src/app/AppNavigation.vue` | 品牌与导航               |
| `src/pages/dashboard.vue`   | 工作台指标               |
| `src/app/project.json`      | 浏览器标题与应用显示名   |

## 外观与语言

设置页保存主题（跟随系统/浅色/深色）、强调色、密度、语言和工作区名称。Pinia 偏好在 `src/stores/preferences.ts`，中英文文案在 `src/i18n/resources.ts`，全局样式在 `src/styles.css`。新增业务页面可使用 `useI18n()`。

boot splash 的标记和文案在 `index.html`，颜色、布局和动效在 `public/boot-splash.css` 的 `--boot-*` 变量中修改。Vue 挂载后由 `src/app/boot-splash.ts` 关闭 splash；启动超过 12 秒时会显示重试操作。Storybook 示例在 `src/components/StatusBadge.stories.ts`。

## 部署

`dist/` 是静态站点。应用使用浏览器历史路由，Web 服务器应将未知路径回退到 `index.html`。演示认证和浏览器数据只适合本地开发；生产部署前需接入后端身份、权限和持久化 API。
